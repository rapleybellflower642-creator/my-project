#!/usr/bin/env python3
"""Verify the full-HD V4 export against its generated timeline.

Usage: python3 scripts/verify-v4.py [video.mp4] [--timeline timeline.json]
                                  [--report validation.json]
Requires Python 3, FFmpeg and FFprobe. Defaults resolve from the project root.
This performs technical validation; it does not claim subjective listening.
"""
from __future__ import annotations

import argparse
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
DURATION_TOLERANCE = 0.05


def require(condition: bool, explanation: str) -> None:
    if not condition:
        raise ValueError(explanation)


def run(arguments: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(arguments, check=True, capture_output=True, text=True)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def read_timeline(path: Path) -> tuple[dict, dict]:
    timeline = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(timeline, dict), "Timeline must be a JSON object")
    require(timeline.get("version") == 4, "Expected a V4 timeline")
    width, height, fps = timeline["width"], timeline["height"], timeline["fps"]
    frames = timeline["durationInFrames"]
    require((width, height, fps) == (1920, 1080, 30),
            "V4 full export must be 1920x1080 at 30 fps")
    require(isinstance(frames, int) and not isinstance(frames, bool) and frames > 0,
            "Timeline durationInFrames must be a positive integer")
    shots = timeline.get("shots")
    require(isinstance(shots, list) and bool(shots), "Timeline has no shots")
    cursor = 0
    ids = set()
    for shot in shots:
        shot_id = shot["id"]
        duration = shot["duration"]
        require(shot_id not in ids, f"Duplicate shot ID: {shot_id}")
        require(isinstance(duration, int) and not isinstance(duration, bool) and duration > 0,
                f"Invalid shot duration: {shot_id}")
        require(shot["from"] == cursor, f"Timeline gap or overlap at shot {shot_id}")
        ids.add(shot_id)
        cursor += duration
    require(cursor == frames, f"Shot durations total {cursor} frames, expected {frames}")
    seconds = frames / fps
    if "totalSeconds" in timeline:
        require(abs(float(timeline["totalSeconds"]) - seconds) < 1e-6,
                "Timeline totalSeconds disagrees with its frame count")
    return timeline, {
        "duration_seconds": seconds, "frames": frames, "fps": fps,
        "width": width, "height": height, "audio_sample_rate": 48000,
        "audio_channels": 2, "duration_tolerance_seconds_exclusive": DURATION_TOLERANCE,
        "shots": len(shots), "chapters": len(timeline.get("chapters", [])),
    }


def mp4_atoms(path: Path) -> list[dict]:
    """Read top-level MP4 atom headers without loading the media payload."""
    atoms = []
    size = path.stat().st_size
    with path.open("rb") as source:
        while source.tell() < size:
            offset = source.tell()
            header = source.read(8)
            require(len(header) == 8, f"Truncated MP4 atom header at {offset}")
            length, raw_name = struct.unpack(">I4s", header)
            header_size = 8
            if length == 1:
                extended = source.read(8)
                require(len(extended) == 8, "Truncated extended MP4 atom size")
                length = struct.unpack(">Q", extended)[0]
                header_size = 16
            elif length == 0:
                length = size - offset
            require(length >= header_size and offset + length <= size,
                    f"Invalid MP4 atom size at {offset}: {length}")
            atoms.append({"name": raw_name.decode("ascii", errors="replace"),
                          "offset": offset, "size": length})
            source.seek(offset + length)
    return atoms


def verify(video: Path, timeline_path: Path) -> dict:
    _, expected = read_timeline(timeline_path)
    require(video.is_file(), f"Full export does not exist: {video}")
    seconds, total_frames, fps = expected["duration_seconds"], expected["frames"], expected["fps"]
    metadata = json.loads(run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size,format_name:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels",
        "-of", "json", str(video),
    ]).stdout)
    videos = [stream for stream in metadata["streams"] if stream["codec_type"] == "video"]
    audios = [stream for stream in metadata["streams"] if stream["codec_type"] == "audio"]
    require(len(videos) == 1 and len(audios) == 1, "Expected one video and one audio stream")
    v, a = videos[0], audios[0]
    require(v["codec_name"] == "h264" and v["pix_fmt"] in ("yuv420p", "yuvj420p"),
            f"Expected H.264 8-bit 4:2:0 video: {v}")
    require((v["width"], v["height"]) == (expected["width"], expected["height"]),
            f"Expected 1920x1080 full export: {v}")
    require(Fraction(v["r_frame_rate"]) == fps and Fraction(v["avg_frame_rate"]) == fps,
            f"Expected constant {fps} fps: {v}")
    require(int(v.get("nb_frames", -1)) == total_frames,
            f"Expected {total_frames} video frames: {v.get('nb_frames')}")
    require(a["codec_name"] == "aac" and int(a["sample_rate"]) == 48000 and a["channels"] == 2,
            f"Expected AAC 48 kHz stereo: {a}")
    duration_errors = {}
    for name, item in [("video", v), ("audio", a), ("container", metadata["format"])]:
        duration = float(item["duration"])
        error = abs(duration - seconds)
        require(math.isfinite(duration) and error < DURATION_TOLERANCE,
                f"{name} duration {duration} differs from timeline {seconds} by {error} seconds")
        duration_errors[name] = error
    av_delta = abs(float(v["duration"]) - float(a["duration"]))
    require(av_delta < DURATION_TOLERANCE,
            f"Audio/video duration difference must be < {DURATION_TOLERANCE}s: {av_delta}")

    atoms = mp4_atoms(video)
    names = [atom["name"] for atom in atoms]
    require("moov" in names and "mdat" in names, f"Missing MP4 media/index atoms: {names}")
    require(names.index("moov") < names.index("mdat"), f"MP4 is not faststart: {names}")

    print(f"Decoding all {total_frames} video frames and the complete audio track...", file=sys.stderr, flush=True)
    decoded = run([
        "ffmpeg", "-v", "error", "-xerror", "-err_detect", "explode",
        "-progress", "pipe:1", "-nostats", "-i", str(video),
        "-map", "0:v:0", "-map", "0:a:0", "-fps_mode", "passthrough", "-f", "null", "-",
    ])
    decoded_frames = re.findall(r"^frame=\s*(\d+)\s*$", decoded.stdout, re.M)
    require(bool(decoded_frames) and int(decoded_frames[-1]) == total_frames
            and "progress=end" in decoded.stdout,
            f"Full decode did not reach {total_frames} frames: {decoded.stdout[-1200:]}")
    require(not decoded.stderr.strip(), f"FFmpeg reported decode errors: {decoded.stderr[-4000:]}")

    print("Measuring the delivered AAC track's loudness and true peak...", file=sys.stderr, flush=True)
    measurement = run([
        "ffmpeg", "-hide_banner", "-nostats", "-v", "info", "-i", str(video),
        "-map", "0:a:0", "-vn", "-af", "loudnorm=I=-15:TP=-1:LRA=11:print_format=json",
        "-f", "null", "-",
    ])
    match = re.search(r'\{\s*"input_i".*?\}', measurement.stderr, re.S)
    require(match is not None, "Loudness measurement missing")
    sound = json.loads(match.group())
    loudness, peak, lra = (float(sound[key]) for key in ("input_i", "input_tp", "input_lra"))
    require(all(math.isfinite(value) for value in (loudness, peak, lra)),
            "Audio measurements must be finite; silence is not an acceptable soundtrack")
    require(-16 <= loudness <= -14, f"Audio loudness outside -16 to -14 LUFS: {loudness}")
    require(peak <= -1, f"Audio true peak exceeds -1 dBTP: {peak}")

    return {
        "status": "passed", "deliverable": "V4 full-HD complete film",
        "file": video.name, "bytes": video.stat().st_size, "sha256": sha256(video),
        "timeline": {"file": timeline_path.name, "sha256": sha256(timeline_path)},
        "expected": expected, "video": v, "audio": a, "container": metadata["format"],
        "duration_errors_seconds": duration_errors, "audio_video_duration_difference_seconds": av_delta,
        "decoded_video_frames": int(decoded_frames[-1]), "full_audio_video_decode": "passed",
        "fast_start": True, "top_level_atoms": atoms,
        "integrated_lufs": loudness, "true_peak_dbtp": peak, "loudness_range_lu": lra,
        "audio_limits": {"integrated_lufs_min": -16, "integrated_lufs_max": -14,
                         "true_peak_dbtp_max": -1},
        "subjective_listening_checked": False,
        "note": "Technical file validation does not verify subjective sound balance or audiovisual synchronization.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", nargs="?", type=Path, default=ROOT / "out/v4/dingfengbo-v4-full.mp4")
    parser.add_argument("--timeline", type=Path, default=ROOT / "public/v4/timeline.json")
    parser.add_argument("--report", type=Path, default=ROOT / "out/v4/validation.json")
    arguments = parser.parse_args()
    try:
        report = verify(arguments.video, arguments.timeline)
    except Exception as error:
        report = {"status": "failed", "deliverable": "V4 full-HD complete film",
                  "file": arguments.video.name, "timeline": arguments.timeline.name,
                  "error": f"{type(error).__name__}: {error}"}
        if isinstance(error, subprocess.CalledProcessError):
            report["stderr"] = (error.stderr or "")[-6000:]
        arguments.report.parent.mkdir(parents=True, exist_ok=True)
        arguments.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(report["error"], file=sys.stderr)
        raise SystemExit(1) from error
    arguments.report.parent.mkdir(parents=True, exist_ok=True)
    arguments.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
