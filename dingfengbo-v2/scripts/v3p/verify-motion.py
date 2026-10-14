#!/usr/bin/env python3
"""Measure the delivered film at every planned cut; this is not a rhythm review.

python3 scripts/v3p/verify-motion.py [video.mp4] [--sample] [--report report.json]
--sample maps the 30-second export to source ranges 0:10,40:50,70:80.
Requires Python 3, NumPy, FFmpeg and FFprobe. Only selected 320x180 RGB frames
cross the FFmpeg pipe; the script retains at most two frames in memory.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading

import numpy as np


ROOT = Path(__file__).resolve().parents[2]
FPS, WIDTH, HEIGHT = 30, 320, 180
FRAME_BYTES = WIDTH * HEIGHT * 3
SAMPLE_RANGES = [(0, 10), (40, 50), (70, 80)]
NEAR_DUPLICATE_MAD = 0.25  # 8-bit RGB levels; an advisory, not a pass threshold.
NEAR_BLACK_MEAN = 3.0
DARK_CHANNEL_MAX = 8
NEAR_BLACK_FRACTION = 0.995
FINAL_FADE_SOURCE_FRAME = 3588  # The final fade starts at source 119.6 s.


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def identity(path: Path) -> tuple[int, int, int, int]:
    stat = path.stat()
    return stat.st_dev, stat.st_ino, stat.st_size, stat.st_mtime_ns


def read_grid(path: Path) -> dict:
    grid = json.loads(path.read_text(encoding="utf-8"))
    require(grid.get("fps") == FPS and grid.get("durationInFrames") == 3600,
            "The source edit grid must describe 3600 frames at 30 fps")
    shots = grid.get("entries", [])
    require(len(shots) == 52 and grid.get("shotCount") == 52, "Expected 52 source shots")
    cursor, ids = 0, set()
    for shot in shots:
        start, duration = shot["frame"], shot["durationFrames"]
        require(type(start) is int and type(duration) is int and duration > 0,
                f"Invalid integer shot range: {shot.get('id')}")
        require(start == cursor and shot["id"] not in ids,
                f"Gap, overlap or duplicate shot ID: {shot['id']}")
        cursor += duration
        ids.add(shot["id"])
    require(cursor == 3600, f"Source shots cover {cursor} frames, expected 3600")
    return grid


def make_plan(grid: dict, sample: bool) -> dict:
    ranges = SAMPLE_RANGES if sample else [(0, 120)]
    spans, cursor = [], 0
    for start, end in ranges:
        length = (end - start) * FPS
        spans.append({"source_start": start * FPS, "source_end_exclusive": end * FPS,
                      "output_start": cursor, "output_end_exclusive": cursor + length})
        cursor += length
    selected: dict[int, dict] = {}

    def select(output_frame: int, source_frame: int, reason: str) -> None:
        item = selected.setdefault(output_frame, {"output_frame": output_frame,
            "source_frame": source_frame, "reasons": []})
        require(item["source_frame"] == source_frame, "Inconsistent source mapping")
        if reason not in item["reasons"]:
            item["reasons"].append(reason)

    cuts, joins, omitted = [], [], []
    shots = grid["entries"]
    for previous, shot in zip(shots, shots[1:]):
        # Both frames must belong to one continuous source range. A sample join
        # cannot stand in for the missing preceding frame of a source cut.
        span = next((s for s in spans if s["source_start"] < shot["frame"] < s["source_end_exclusive"]), None)
        if span is None:
            omitted.append(shot["id"])
            continue
        frame = span["output_start"] + shot["frame"] - span["source_start"]
        cuts.append({"previous_shot": previous["id"], "shot": shot["id"],
                     "transition": shot.get("transition"),
                     "output_frame_before": frame - 1, "output_frame_after": frame,
                     "source_frame_before": shot["frame"] - 1, "source_frame_after": shot["frame"],
                     "source_time_seconds": shot["frame"] / FPS})
        select(frame - 1, shot["frame"] - 1, f"before_cut:{shot['id']}")
        select(frame, shot["frame"], f"after_cut:{shot['id']}")
    for previous, span in zip(spans, spans[1:]):
        frame = span["output_start"]
        joins.append({"output_frame_before": frame - 1, "output_frame_after": frame,
                      "source_frame_before": previous["source_end_exclusive"] - 1,
                      "source_frame_after": span["source_start"],
                      "note": "Sample concatenation; not an adjacent-frame source-film cut"})
        select(frame - 1, previous["source_end_exclusive"] - 1, "before_sample_join")
        select(frame, span["source_start"], "after_sample_join")
    intersections = []
    for span in spans:
        select(span["output_start"], span["source_start"], "range_first_frame")
        select(span["output_end_exclusive"] - 1, span["source_end_exclusive"] - 1, "range_last_frame")
        for shot in shots:
            start = max(span["source_start"], shot["frame"])
            end = min(span["source_end_exclusive"], shot["frame"] + shot["durationFrames"])
            if start >= end:
                continue
            midpoint = start + (end - start) // 2
            output_midpoint = span["output_start"] + midpoint - span["source_start"]
            select(output_midpoint, midpoint, f"shot_midpoint:{shot['id']}")
            intersections.append({"shot": shot["id"], "source_start": start,
                                  "source_end_exclusive": end,
                                  "visible_duration_seconds": (end - start) / FPS,
                                  "midpoint_output_frame": output_midpoint})
    return {"ranges_seconds": ranges, "spans": spans, "expected_frames": cursor,
            "cuts": cuts, "joins": joins, "omitted_source_cuts": omitted,
            "selected": selected, "shot_intersections": intersections}


def difference(before: np.ndarray, after: np.ndarray) -> dict:
    delta = np.abs(after.astype(np.int16) - before.astype(np.int16))
    mad = float(delta.mean())
    return {"mean_absolute_rgb_difference_8bit": mad,
            "mean_absolute_rgb_difference_normalized": mad / 255,
            "per_channel_mean_absolute_difference_8bit": delta.mean(axis=(0, 1)).tolist(),
            "maximum_channel_difference_8bit": int(delta.max()),
            "changed_pixel_fraction": float(np.any(delta != 0, axis=2).mean()),
            "measurable_change": bool(np.any(delta)),
            "near_duplicate_advisory": mad <= NEAR_DUPLICATE_MAD}


def brightness(frame: np.ndarray) -> dict:
    mean_rgb = frame.mean(axis=(0, 1))
    mean_luma = float(mean_rgb @ np.array([0.2126, 0.7152, 0.0722]))
    dark_fraction = float(np.all(frame <= DARK_CHANNEL_MAX, axis=2).mean())
    return {"mean_rgb_8bit": mean_rgb.tolist(), "mean_luma_bt709_8bit": mean_luma,
            "dark_pixel_fraction": dark_fraction,
            "near_black_candidate": mean_luma <= NEAR_BLACK_MEAN and dark_fraction >= NEAR_BLACK_FRACTION}


def read_frame(pipe) -> bytes:
    data = bytearray()
    while len(data) < FRAME_BYTES:
        block = pipe.read(FRAME_BYTES - len(data))
        if not block:
            break
        data.extend(block)
    return bytes(data)


def selection_expression(indices: list[int]) -> str:
    # FFmpeg's expression parser has a recursion limit. A linear sum of all
    # 156 terms exceeds it; a balanced tree keeps the same selection at depth 8.
    terms = [f"eq(n\\,{index})" for index in indices]
    require(bool(terms), "At least one selected frame is required")

    def combine(start: int, end: int) -> str:
        if end - start == 1:
            return terms[start]
        middle = (start + end) // 2
        return f"({combine(start, middle)}+{combine(middle, end)})"

    return combine(0, len(terms))


def measure(video: Path, plan: dict, report: dict) -> None:
    indices = sorted(plan["selected"])
    expression = selection_expression(indices)
    filters = f"select={expression},scale={WIDTH}:{HEIGHT}:flags=area,format=rgb24"
    command = ["ffmpeg", "-hide_banner", "-v", "error", "-nostdin", "-xerror",
               "-err_detect", "explode", "-threads", "2", "-i", str(video),
               "-map", "0:v:0", "-an", "-sn", "-dn", "-vf", filters,
               "-fps_mode", "passthrough", "-threads", "1", "-pix_fmt", "rgb24",
               "-f", "rawvideo", "pipe:1"]
    boundaries = {item["output_frame_after"]: item for item in plan["cuts"] + plan["joins"]}
    report["cut_samples"] = plan["cuts"]
    report["sample_join_samples"] = plan["joins"]
    report["examined_frames"] = []
    timed_out = threading.Event()
    with tempfile.TemporaryFile() as errors:
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors)

        def stop_timeout() -> None:
            timed_out.set()
            if proc.poll() is None:
                proc.kill()

        timer = threading.Timer(600, stop_timeout)
        timer.daemon = True
        timer.start()
        previous, previous_index = None, None
        try:
            for index in indices:
                raw = read_frame(proc.stdout)
                require(len(raw) == FRAME_BYTES,
                        f"Missing/truncated selected frame {index}: {len(raw)} of {FRAME_BYTES} RGB bytes")
                frame = np.frombuffer(raw, dtype=np.uint8).reshape(HEIGHT, WIDTH, 3)
                item = {**plan["selected"][index], **brightness(frame),
                        "rgb_sha256": hashlib.sha256(raw).hexdigest(),
                        "output_time_seconds": index / FPS,
                        "source_time_seconds": plan["selected"][index]["source_frame"] / FPS}
                item["within_expected_final_fade"] = item["source_frame"] >= FINAL_FADE_SOURCE_FRAME
                report["examined_frames"].append(item)
                if index in boundaries:
                    require(previous_index == index - 1, f"Missing before-frame for cut at {index}")
                    boundaries[index].update(difference(previous, frame))
                previous, previous_index = frame, index
            require(not proc.stdout.read(1), "Decoder emitted more selected frames than requested")
            proc.wait(timeout=10)
            require(not timed_out.is_set(), "FFmpeg selected-frame decode timed out after 600 seconds")
            require(proc.returncode == 0, f"FFmpeg selected-frame decode exited with {proc.returncode}")
        finally:
            timer.cancel()
            if proc.poll() is None:
                proc.kill()
                proc.wait(timeout=10)
            proc.stdout.close()
            errors.seek(0, 2)
            errors.seek(max(0, errors.tell() - 6000))
            stderr = errors.read().decode("utf-8", errors="replace").strip()
            if stderr:
                report["decoder_stderr"] = stderr
            if timed_out.is_set():
                report["decoder_timed_out"] = True
        require(not stderr, "FFmpeg reported a decode error; see decoder_stderr")
    report["decoded_selected_frame_count"] = len(report["examined_frames"])
    report["raw_rgb_bytes_transferred"] = len(indices) * FRAME_BYTES


def verify(video: Path, timeline: Path, sample: bool, report: dict) -> None:
    report["stage"] = "timeline"
    grid = read_grid(timeline)
    plan = make_plan(grid, sample)
    report.update(edit_grid={"file": str(timeline), "sha256": sha256(timeline)},
                  source_shot_count=52, source_cut_count=51,
                  expected_cut_samples=len(plan["cuts"]), source_ranges_seconds=plan["ranges_seconds"],
                  source_cuts_not_continuously_present=plan["omitted_source_cuts"],
                  source_mapping=plan["spans"], shot_intersections=plan["shot_intersections"],
                  expected_video_frames=plan["expected_frames"],
                  selected_frame_count=len(plan["selected"]))
    longest = max(shot["durationFrames"] for shot in grid["entries"])
    report["maximum_source_shot_duration_seconds"] = longest / FPS
    report["longest_source_shots"] = [shot["id"] for shot in grid["entries"] if shot["durationFrames"] == longest]
    report["maximum_visible_shot_duration_seconds"] = max(s["visible_duration_seconds"] for s in plan["shot_intersections"])
    report["stage"] = "input"
    require(video.is_file(), f"Video does not exist: {video}")
    original_identity = identity(video)
    require(original_identity[2] > 0, "Video file is empty")
    report.update(bytes=original_identity[2], sha256=sha256(video))
    result = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,duration",
        "-of", "json", str(video)], capture_output=True, text=True, check=True, timeout=30)
    streams = json.loads(result.stdout).get("streams", [])
    require(len(streams) == 1, "Expected a video stream")
    stream = streams[0]
    report["video"] = stream
    require((stream["width"], stream["height"]) == (1920, 1080), "Expected 1920x1080 input")
    require(Fraction(stream["r_frame_rate"]) == FPS and Fraction(stream["avg_frame_rate"]) == FPS,
            "Frame-index mapping requires 30 fps input")
    require(int(stream.get("nb_frames", -1)) == plan["expected_frames"],
            f"Expected {plan['expected_frames']} input video frames; choose --sample only for the 30-second sample")
    duration = float(stream["duration"])
    require(math.isfinite(duration) and abs(duration - plan["expected_frames"] / FPS) < .05,
            "Input video duration disagrees with its selected full/sample profile")
    report["stage"] = "selected_frame_decode"
    print(f"Measuring {len(plan['cuts'])} source cuts using {len(plan['selected'])} selected RGB frames...", file=sys.stderr, flush=True)
    measure(video, plan, report)
    require(identity(video) == original_identity, "Video changed during measurement; rerun on the finished export")
    require(sha256(timeline) == report["edit_grid"]["sha256"], "Edit grid changed during measurement")
    unchanged = [cut["shot"] for cut in report["cut_samples"] if not cut["measurable_change"]]
    near = [cut["shot"] for cut in report["cut_samples"] if cut["near_duplicate_advisory"] and cut["measurable_change"]]
    black = [item["output_frame"] for item in report["examined_frames"]
             if item["near_black_candidate"] and not item["within_expected_final_fade"]]
    report.update(unchanged_cut_ids=unchanged, near_duplicate_cut_ids=near,
                  near_black_frames_outside_expected_final_fade=black,
                  cuts_with_measurable_change=len(report["cut_samples"]) - len(unchanged))
    report["warnings"] = []
    if near:
        report["warnings"].append("Some cuts have very small RGB differences; inspect their actual frames. This advisory does not fail the check.")
    if black:
        report["warnings"].append("Some sampled frames are nearly black outside the planned final fade; inspect whether this is intentional. This advisory does not fail the check.")
    report["stage"] = "cut_changes"
    require(not unchanged, f"No measurable 320x180 RGB change at source cuts: {', '.join(unchanged)}")
    report["status"], report["stage"] = "passed", "complete"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", nargs="?", type=Path)
    parser.add_argument("--sample", action="store_true", help="map the 30-second sample to source 0:10,40:50,70:80")
    parser.add_argument("--timeline", type=Path, default=ROOT / "public/v3p/edit-grid.json")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    suffix = "-sample" if args.sample else ""
    video = (args.video or ROOT / f"out/v3p/dingfengbo-v3-pulse{suffix}.mp4").resolve()
    timeline = args.timeline.resolve()
    destination = (args.report or ROOT / f"out/v3p/motion-check{suffix}.json").resolve()
    require(destination not in (video, timeline), "Report must not overwrite video or edit grid")
    report = {"status": "running", "profile": "sample" if args.sample else "full",
        "file": video.name, "source_path": str(video),
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "measurement": {"width": WIDTH, "height": HEIGHT, "pixel_format": "rgb24",
            "scale_filter": "area", "sample_scope": "each continuous source cut's immediately adjacent frames, each visible shot midpoint, source-range endpoints and sample joins",
            "hard_failure_difference": "exactly zero RGB difference at a planned source cut",
            "near_duplicate_mad_advisory_8bit": NEAR_DUPLICATE_MAD,
            "near_black_mean_luma_max_8bit": NEAR_BLACK_MEAN,
            "dark_pixel_max_channel_8bit": DARK_CHANNEL_MAX,
            "near_black_dark_pixel_fraction_min": NEAR_BLACK_FRACTION,
            "expected_final_fade_source_frame_start": FINAL_FADE_SOURCE_FRAME},
        "subjective_rhythm_review_checked": False,
        "note": "This measures selected decoded frames, not subjective pacing, visual quality, shot meaning, internal animation or beat perception. Nonzero RGB differences can be caused by noise or small camera motion; they do not prove a meaningful composition change. Brightness sampling does not inspect every frame. Full-file integrity is checked separately by verify.py."}
    try:
        verify(video, timeline, args.sample, report)
    except Exception as error:
        report["status"] = "failed"
        report["error"] = f"{type(error).__name__}: {error}"
        if isinstance(error, subprocess.CalledProcessError):
            report["stderr"] = (error.stderr or "")[-6000:]
        print(report["error"], file=sys.stderr)
    destination.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    temporary = destination.with_name(destination.name + f".{os.getpid()}.tmp")
    temporary.write_text(encoded, encoding="utf-8")
    temporary.replace(destination)
    print(encoded, end="")
    if report["status"] != "passed":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
