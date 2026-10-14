#!/usr/bin/env python3
"""Validate the delivered V3 remake MP4, including a complete audio/video decode.

Usage: python3 scripts/v3r/verify.py [video.mp4] [--report validation.json]
The delivery requirements are fixed; a short sample cannot pass as the full film.
Requires Python 3, FFmpeg and FFprobe. No third-party Python packages are needed.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
EXPECTED = {
    "width": 1920, "height": 1080, "fps": 30, "frames": 3600,
    "duration_seconds": 120, "video_codec": "h264", "pixel_format": "yuv420p",
    "audio_codec": "aac", "audio_sample_rate": 48000, "audio_channels": 2,
    "duration_tolerance_seconds_exclusive": 0.05,
}
CHECKS = ("file", "metadata", "fast_start", "full_decode", "loudness", "file_stability")


def require(condition: bool, explanation: str) -> None:
    if not condition:
        raise ValueError(explanation)


def run(arguments: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(arguments, check=True, capture_output=True, text=True, timeout=600)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def identity(path: Path) -> tuple[int, int, int, int]:
    stat = path.stat()
    return stat.st_dev, stat.st_ino, stat.st_size, stat.st_mtime_ns


def mp4_atoms(path: Path) -> list[dict]:
    """Read only the top-level headers, including extended and open-ended atoms."""
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


def verify(video: Path, report: dict) -> None:
    report["stage"] = "file"
    require(video.is_file(), f"Full export does not exist: {video}")
    original_identity = identity(video)
    require(original_identity[2] > 0, "Video file is empty")
    report.update(bytes=original_identity[2], sha256=sha256(video))
    report["checks"]["file"] = "passed"

    report["stage"] = "metadata"
    metadata = json.loads(run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size,format_name:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels,channel_layout",
        "-of", "json", str(video),
    ]).stdout)
    report["probe"] = metadata
    videos = [stream for stream in metadata["streams"] if stream["codec_type"] == "video"]
    audios = [stream for stream in metadata["streams"] if stream["codec_type"] == "audio"]
    require(len(videos) == 1 and len(audios) == 1, "Expected one video and one audio stream")
    v, a = videos[0], audios[0]
    report.update(video=v, audio=a, container=metadata["format"])
    require(v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p",
            f"Expected H.264 yuv420p video; got {v['codec_name']} / {v['pix_fmt']}")
    require((v["width"], v["height"]) == (1920, 1080),
            f"Expected 1920x1080 full export; got {v['width']}x{v['height']}")
    require(Fraction(v["r_frame_rate"]) == 30 and Fraction(v["avg_frame_rate"]) == 30,
            f"Expected 30 fps; got r={v['r_frame_rate']}, avg={v['avg_frame_rate']}")
    require(int(v.get("nb_frames", -1)) == 3600,
            f"Expected 3600 video frames; got {v.get('nb_frames')}")
    require(a["codec_name"] == "aac" and int(a["sample_rate"]) == 48000 and a["channels"] == 2,
            f"Expected AAC 48 kHz stereo; got {a}")
    duration_errors = {}
    for name, item in (("video", v), ("audio", a), ("container", metadata["format"])):
        duration = float(item["duration"])
        error = abs(duration - 120)
        duration_errors[name] = error
        require(math.isfinite(duration) and error < 0.05,
                f"{name} duration {duration}s differs from 120s by {error}s (must be <0.05s)")
    report["duration_errors_seconds"] = duration_errors
    av_delta = abs(float(v["duration"]) - float(a["duration"]))
    report["audio_video_duration_difference_seconds"] = av_delta
    require(av_delta < 0.05, f"Audio/video duration difference must be <0.05s; got {av_delta}s")
    report["checks"]["metadata"] = "passed"

    report["stage"] = "fast_start"
    atoms = mp4_atoms(video)
    report["top_level_atoms"] = atoms
    names = [atom["name"] for atom in atoms]
    require("moov" in names and "mdat" in names, f"Missing MP4 media/index atoms: {names}")
    require(names.index("moov") < names.index("mdat"), f"MP4 is not faststart: {names}")
    report["fast_start"] = True
    report["checks"]["fast_start"] = "passed"

    report["stage"] = "full_decode"
    print("Decoding all 3600 video frames and the complete audio track...", file=sys.stderr, flush=True)
    decoded = run([
        "ffmpeg", "-hide_banner", "-v", "error", "-xerror", "-err_detect", "explode",
        "-threads", "2", "-progress", "pipe:1", "-nostats", "-i", str(video),
        "-map", "0:v:0", "-map", "0:a:0", "-fps_mode", "passthrough", "-f", "null", "-",
    ])
    decoded_frames = re.findall(r"^frame=\s*(\d+)\s*$", decoded.stdout, re.M)
    report["decoded_video_frames"] = int(decoded_frames[-1]) if decoded_frames else None
    require(bool(decoded_frames) and int(decoded_frames[-1]) == 3600
            and "progress=end" in decoded.stdout,
            f"Full decode did not reach exactly 3600 frames: {decoded.stdout[-1200:]}")
    require(not decoded.stderr.strip(), f"FFmpeg reported decode errors: {decoded.stderr[-4000:]}")
    report["full_audio_video_decode"] = "passed"
    report["checks"]["full_decode"] = "passed"

    report["stage"] = "loudness"
    print("Measuring the delivered AAC track's loudness and true peak...", file=sys.stderr, flush=True)
    measurement = run([
        "ffmpeg", "-hide_banner", "-nostats", "-v", "info", "-threads", "2", "-i", str(video),
        "-map", "0:a:0", "-vn", "-af", "loudnorm=I=-15:TP=-1:LRA=11:print_format=json",
        "-f", "null", "-",
    ])
    match = re.search(r'\{\s*"input_i".*?\}', measurement.stderr, re.S)
    require(match is not None, "Loudness measurement missing")
    sound = json.loads(match.group())
    loudness, peak, lra = (float(sound[key]) for key in ("input_i", "input_tp", "input_lra"))
    # JSON retains FFmpeg's strings even when the track is silent (-inf), so every report is valid JSON.
    report["loudness_measurement"] = sound
    require(all(math.isfinite(value) for value in (loudness, peak, lra)),
            "Audio measurements must be finite; silence is not an acceptable soundtrack")
    report.update(integrated_lufs=loudness, true_peak_dbtp=peak, loudness_range_lu=lra)
    require(-16 <= loudness <= -14, f"Audio loudness outside -16 to -14 LUFS: {loudness}")
    require(peak <= -1, f"Audio true peak exceeds -1 dBTP: {peak}")
    report["checks"]["loudness"] = "passed"

    report["stage"] = "file_stability"
    require(identity(video) == original_identity, "Video changed while validation was running; rerun on the finished export")
    report["checks"]["file_stability"] = "passed"
    report["status"] = "passed"
    report["stage"] = "complete"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", nargs="?", type=Path, default=ROOT / "out/v3r/dingfengbo-v3-remake.mp4")
    parser.add_argument("--report", type=Path, default=ROOT / "out/v3r/validation.json")
    args = parser.parse_args()
    video, report_path = args.video.resolve(), args.report.resolve()
    require(video != report_path, "Report path must not overwrite the video")
    report = {
        "status": "running", "deliverable": "V3 remake full-HD complete film",
        "file": video.name, "source_path": str(video),
        "checked_at_utc": datetime.now(timezone.utc).isoformat(), "expected": EXPECTED,
        "checks": {name: "not_run" for name in CHECKS},
        "full_audio_video_decode": "not_run", "fast_start": False,
        "audio_limits": {"integrated_lufs_min": -16, "integrated_lufs_max": -14, "true_peak_dbtp_max": -1},
        "subjective_listening_checked": False, "subjective_visual_review_checked": False,
        "note": "Technical file validation does not verify subjective sound balance, audiovisual synchronization, caption appearance or animation quality.",
    }
    try:
        verify(video, report)
    except Exception as error:
        report["status"] = "failed"
        stage = report.get("stage")
        if stage in report["checks"]:
            report["checks"][stage] = "failed"
        if stage == "full_decode":
            report["full_audio_video_decode"] = "failed"
        report["error"] = f"{type(error).__name__}: {error}"
        if isinstance(error, subprocess.CalledProcessError):
            report["stderr"] = (error.stderr or "")[-6000:]
        print(report["error"], file=sys.stderr)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    temporary = report_path.with_name(report_path.name + ".tmp")
    temporary.write_text(encoded, encoding="utf-8")
    temporary.replace(report_path)
    print(encoded, end="")
    if report["status"] != "passed":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
