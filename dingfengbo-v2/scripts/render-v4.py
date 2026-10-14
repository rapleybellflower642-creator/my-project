#!/usr/bin/env python3
"""Render the shared V4 timeline with native, independently moving PNG layers.

Full export: python3 scripts/render-v4.py
Two-shot sample: python3 scripts/render-v4.py --limit 2
One shot: python3 scripts/render-v4.py --shot 001
Resume: rerun the same command; inputs and rendering options are hashed per clip.

The source stays 1920x1080 / 30 fps. At most two FFmpeg processes run by default,
each with two codec threads. PNGs are decoded, converted, and then cached in a
one-frame loop. The final mux copies the individual H.264 clips; a two-pass
bitrate reduction is only used when the resulting file exceeds --max-mib.

Motion contract (seconds are local to each shot; no whole-frame camera zoom):
* Background scales to 1.035, then crops with center offset -12 -> +12 px.
  Odd timeline indices reverse this direction.
* walk: subject x -40 -> +40 px, y 3*sin(4*t); otherwise x 0, y 2*sin(1.3*t).
* walk/companions with alternate=true: subject/subject-alt alternate by
  floor(2.4*t)%2, with the same translation and transparent alpha.
* Foreground x +6 -> -6 px, reversed on odd timeline indices.
* rain/light-rain: double-height tile y=-1080+mod(750*t,1080), alpha 1/.45.
* dust: double-height tile y=-1080+mod(35*t,1080), alpha 1.
* Text stays still and fades in over 0.18 s. All offsets scale with resolution.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import threading
import time


ROOT = Path(__file__).resolve().parents[1]
CACHE_VERSION = 4


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def atomic_json(path: Path, value: dict) -> None:
    temporary = path.with_name(f".{path.name}.{os.getpid()}.{threading.get_ident()}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def probe(path: Path) -> dict:
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)
    ]))


class Renderer:
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.root = args.project_dir.resolve()
        self.timeline_path = args.timeline or self.root / "public/v4/timeline.json"
        self.timeline = json.loads(self.timeline_path.read_text())
        self.art = args.art_dir or self.root / "public/v4/art"
        self.text = args.text_dir or self.root / "public/v4/text"
        self.fx = args.fx_dir or self.root / "public/v4/fx"
        self.audio = args.audio or self.root / "public/audio/soundtrack-v4.m4a"
        self.out = args.output_dir or self.root / "out/v4"
        self.clips = self.out / "clips"
        self.clips.mkdir(parents=True, exist_ok=True)
        self.width = int(self.timeline.get("width", 1920))
        self.height = int(self.timeline.get("height", 1080))
        self.fps = int(self.timeline.get("fps", 30))
        self.start = time.monotonic()
        self.lock = threading.Lock()
        self.script_hash = digest(Path(__file__))
        self.hashes: dict[str, str] = {}
        self.states: dict[str, dict] = {}
        self.shots = self.select_shots()
        self.full = len(self.shots) == len(self.timeline["shots"])
        self.total_frames = sum(int(shot["duration"]) for _, shot in self.shots)
        self.seconds = self.total_frames / self.fps
        if not self.shots:
            raise ValueError("No shots selected")
        if self.width % 2 or self.height % 2:
            raise ValueError("H.264 YUV420 dimensions must be even")
        self.check_timeline()
        self.progress("preflight")

    def select_shots(self) -> list[tuple[int, dict]]:
        requested = {value for group in self.args.shot for value in group.split(",")}
        all_shots = self.timeline.get("shots", [])
        ids = [str(shot["id"]) for shot in all_shots]
        if len(set(ids)) != len(ids):
            raise ValueError("Shot IDs must be unique")
        missing = requested - set(ids)
        if missing:
            raise ValueError(f"Unknown shot IDs: {', '.join(sorted(missing))}")
        selected = [(i, shot) for i, shot in enumerate(all_shots)
                    if not requested or str(shot["id"]) in requested]
        return selected[:self.args.limit] if self.args.limit else selected

    def check_timeline(self) -> None:
        frame = 0
        for _, shot in enumerate(self.timeline["shots"]):
            shot_id = str(shot["id"])
            if not re.fullmatch(r"[A-Za-z0-9_-]+", shot_id):
                raise ValueError(f"Unsafe shot ID: {shot_id!r}")
            if int(shot["from"]) != frame or int(shot["duration"]) <= 0:
                raise ValueError(f"Timeline gap, overlap, or invalid duration at {shot_id}")
            frame += int(shot["duration"])
        declared = int(self.timeline.get("durationInFrames", frame))
        if frame != declared:
            raise ValueError(f"Timeline has {frame} frames, expected {declared}")
        for _, shot in self.shots:
            for path in self.inputs(shot):
                if not path.is_file():
                    raise FileNotFoundError(path)
                key = str(path.resolve())
                if key not in self.hashes:
                    self.hashes[key] = digest(path)
        if self.full and not self.args.no_finalize and not self.audio.is_file():
            raise FileNotFoundError(f"Full export requires the complete soundtrack: {self.audio}")

    def inputs(self, shot: dict) -> list[Path]:
        scene = shot["scene"]
        inputs = [self.art / f"{scene}-{layer}.png"
                  for layer in ("background", "subject", "foreground")]
        weather = shot.get("weather", "none")
        if weather in ("rain", "light-rain"):
            inputs.append(self.fx / "rain.png")
        elif weather == "dust":
            inputs.append(self.fx / "dust.png")
        elif weather != "none":
            raise ValueError(f"Unsupported weather: {weather}")
        inputs.append(self.text / f"{shot['id']}.png")
        if self.alternate(shot):
            inputs.append(self.art / f"{scene}-subject-alt.png")
        return inputs

    @staticmethod
    def alternate(shot: dict) -> bool:
        return bool(shot.get("alternate")) and shot["scene"] in ("walk", "companions")

    def progress(self, stage: str = "rendering", **extra) -> None:
        with self.lock:
            done = sum(state.get("frames", 0) for state in self.states.values())
            value = {
                "stage": stage,
                "renderedFrames": done,
                "totalFrames": self.total_frames,
                "progress": round(done / self.total_frames, 6),
                "elapsedSeconds": round(time.monotonic() - self.start, 2),
                "completedShots": sum(state.get("status") in ("complete", "cached")
                                      for state in self.states.values()),
                "totalShots": len(self.shots),
                "shots": dict(self.states),
                **extra,
            }
            atomic_json(self.out / "render-progress.json", value)

    def state(self, shot_id: str, **value) -> None:
        with self.lock:
            self.states[shot_id] = {**self.states.get(shot_id, {}), **value}
        self.progress()

    def graph(self, index: int, shot: dict) -> str:
        frames = int(shot["duration"])
        duration = frames / self.fps
        # Endpoints match Remotion's local frame/(duration-1) interpolation.
        end = max((frames - 1) / self.fps, 1 / self.fps)
        unit = self.width / 1920
        direction = 1 if index % 2 == 0 else -1
        loop = f"loop=loop=-1:size=1:start=0,setpts=N/({self.fps}*TB)"
        scaled_width = 2 * math.ceil(self.width * 1.035 / 2)
        scaled_height = 2 * math.ceil(self.height * 1.035 / 2)
        pan = f"({-12 * direction * unit}+{24 * direction * unit}*t/{end:.9f})"
        foreground_x = f"({6 * direction * unit}-{12 * direction * unit}*t/{end:.9f})"
        if shot.get("motion") == "walk":
            subject_x = f"(-{40 * unit}+{80 * unit}*t/{end:.9f})"
            subject_y = f"{3 * unit}*sin(4*t)"
        else:
            subject_x = "0"
            subject_y = f"{2 * unit}*sin(1.3*t)"
        weather = shot.get("weather", "none")
        text_index = 4 if weather != "none" else 3
        filters = [
            f"[0:v]scale={scaled_width}:{scaled_height}:flags=bilinear,format=yuv420p,{loop},"
            f"crop={self.width}:{self.height}:x='(iw-ow)/2+{pan}':y='(ih-oh)/2'[bg]",
            f"[1:v]format=yuva420p,{loop}[person]",
        ]
        position = f"x='{subject_x}':y='{subject_y}':format=yuv420:eof_action=repeat"
        if self.alternate(shot):
            # Mutually exclusive overlays preserve alpha and avoid evaluating a
            # blend expression for every pixel. Disabled overlay is a passthrough.
            filters += [
                f"[{text_index + 1}:v]format=yuva420p,{loop}[person_alt]",
                f"[bg][person]overlay={position}:enable='eq(mod(floor(t*2.4),2),0)'[pose_a]",
                f"[pose_a][person_alt]overlay={position}:enable='eq(mod(floor(t*2.4),2),1)'[with_person]",
            ]
        else:
            filters.append(f"[bg][person]overlay={position}[with_person]")
        filters += [
            f"[2:v]format=yuva420p,{loop}[fg]",
            f"[with_person][fg]overlay=x='{foreground_x}':y=0:format=yuv420:eof_action=repeat[scene]",
        ]
        base = "scene"
        if weather != "none":
            opacity = ",colorchannelmixer=aa=0.45" if weather == "light-rain" else ""
            speed = (35 if weather == "dust" else 750) * unit
            filters += [
                f"[3:v]format=rgba{opacity},format=yuva420p,{loop}[weather]",
                f"[scene][weather]overlay=x=0:y='-{self.height}+mod({speed}*t,{self.height})':"
                "format=yuv420:eof_action=repeat[atmosphere]",
            ]
            base = "atmosphere"
        filters += [
            f"[{text_index}:v]format=yuva420p,{loop},fade=t=in:st=0:d=0.18:alpha=1[captions]",
            f"[{base}][captions]overlay=x=0:y=0:format=yuv420:eof_action=repeat,"
            f"trim=duration={duration:.9f},setsar=1[out]",
        ]
        return ";\n".join(filters)

    def render_shot(self, index: int, shot: dict) -> Path:
        shot_id = str(shot["id"])
        output = self.clips / f"{shot_id}.mp4"
        metadata_path = self.clips / f"{shot_id}.json"
        inputs = self.inputs(shot)
        graph = self.graph(index, shot)
        signature_data = {
            "cacheVersion": CACHE_VERSION, "script": self.script_hash,
            "shot": shot, "timelineIndex": index, "graph": graph,
            "inputs": {str(path.resolve()): self.hashes[str(path.resolve())] for path in inputs},
            "fps": self.fps, "width": self.width, "height": self.height,
            "crf": self.args.crf, "preset": self.args.preset, "threads": self.args.threads,
        }
        signature = hashlib.sha256(json.dumps(signature_data, sort_keys=True).encode()).hexdigest()
        if output.is_file() and metadata_path.is_file() and not self.args.overwrite:
            metadata = json.loads(metadata_path.read_text())
            if metadata.get("signature") == signature and metadata.get("bytes") == output.stat().st_size:
                self.state(shot_id, status="cached", frames=int(shot["duration"]))
                print(f"[{shot_id}] cached", flush=True)
                return output
        self.state(shot_id, status="rendering", frames=0)
        partial = output.with_suffix(".partial.mp4")
        log_path = self.clips / f"{shot_id}.log"
        graph_path = self.clips / f"{shot_id}.filters.txt"
        graph_path.write_text(graph)
        command = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
                   "-filter_complex_threads", str(self.args.threads)]
        for path in inputs:
            command += ["-framerate", str(self.fps), "-i", str(path)]
        command += [
            "-filter_complex_script", str(graph_path), "-map", "[out]", "-an",
            "-frames:v", str(shot["duration"]), "-r", str(self.fps),
            "-c:v", "libx264", "-threads", str(self.args.threads), "-preset", self.args.preset,
            "-crf", str(self.args.crf), "-pix_fmt", "yuv420p", "-profile:v", "high",
            "-g", str(self.fps * 2), "-keyint_min", str(self.fps),
            "-video_track_timescale", "15360", "-progress", "pipe:1", "-nostats", str(partial),
        ]
        started = time.monotonic()
        try:
            with log_path.open("w") as errors:
                process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors, text=True)
                assert process.stdout is not None
                for line in process.stdout:
                    if line.startswith("frame="):
                        self.state(shot_id, frames=min(int(line.split("=", 1)[1]), int(shot["duration"])))
                code = process.wait()
            if code:
                raise RuntimeError(f"FFmpeg exited {code}: {log_path.read_text()[-6000:]}")
            video = next(stream for stream in probe(partial)["streams"] if stream["codec_type"] == "video")
            if (int(video.get("nb_frames", -1)) != int(shot["duration"])
                    or int(video["width"]) != self.width or int(video["height"]) != self.height):
                raise RuntimeError(f"Frame count or dimensions mismatch for shot {shot_id}: {video}")
            partial.replace(output)
            atomic_json(metadata_path, {
                "signature": signature, "bytes": output.stat().st_size,
                "frames": int(shot["duration"]), "seconds": int(shot["duration"]) / self.fps,
                "renderSeconds": round(time.monotonic() - started, 2),
                "inputs": signature_data["inputs"], "command": command,
            })
            self.state(shot_id, status="complete", frames=int(shot["duration"]))
            print(f"[{shot_id}] {shot['duration']} frames in {time.monotonic() - started:.1f}s", flush=True)
            return output
        except Exception as exc:
            self.state(shot_id, status="failed", error=str(exc))
            raise

    def run_command(self, command: list[str], log_name: str) -> None:
        with (self.out / log_name).open("w") as log:
            result = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT)
        if result.returncode:
            raise RuntimeError(f"FFmpeg failed: {(self.out / log_name).read_text()[-6000:]}")

    def finalize(self, paths: list[Path]) -> Path:
        self.progress("muxing")
        concat_path = self.out / ("concat-v4.txt" if self.full else "concat-v4-sample.txt")
        concat_path.write_text("".join("file '" + str(path.resolve()).replace("'", "'\\''") + "'\n"
                                       for path in paths))
        target = self.out / ("dingfengbo-v4-full.mp4" if self.full else "dingfengbo-v4-sample.mp4")
        partial = target.with_suffix(".assembling.mp4")
        command = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
                   "-f", "concat", "-safe", "0", "-i", str(concat_path)]
        if self.audio.is_file():
            command += ["-i", str(self.audio)]
            if self.full:
                command += ["-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "copy"]
            else:
                filters = []
                labels = []
                for index, (_, shot) in enumerate(self.shots):
                    start = shot["from"] / self.fps
                    end = (shot["from"] + shot["duration"]) / self.fps
                    filters.append(f"[1:a]atrim=start={start:.9f}:end={end:.9f},asetpts=PTS-STARTPTS[a{index}]")
                    labels.append(f"[a{index}]")
                filters.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1[audio]")
                command += ["-filter_complex", ";".join(filters), "-map", "0:v:0", "-map", "[audio]",
                            "-c:v", "copy", "-c:a", "aac", "-b:a", "256k"]
        else:
            print("Sample has no soundtrack: audio input does not yet exist.", flush=True)
            command += ["-map", "0:v:0", "-c:v", "copy", "-an"]
        command += ["-t", f"{self.seconds:.9f}", "-movflags", "+faststart", str(partial)]
        self.run_command(command, "mux-v4.log")
        # A safety margin leaves room for mux overhead and audio bitrate variance.
        limit = int(self.args.max_mib * 1024 * 1024)
        if self.full and partial.stat().st_size > limit:
            self.progress("size-constrained-encode", initialBytes=partial.stat().st_size, maxBytes=limit)
            self.fit_size(partial, target, limit)
            partial.unlink()
        else:
            partial.replace(target)
        info = probe(target)
        video = next(stream for stream in info["streams"] if stream["codec_type"] == "video")
        if int(video.get("nb_frames", -1)) != self.total_frames:
            raise RuntimeError(f"Final frame count does not match {self.total_frames}")
        if self.full and target.stat().st_size > limit:
            raise RuntimeError(f"Output still exceeds the requested size limit: {target}")
        atomic_json(self.out / ("export-v4.json" if self.full else "export-v4-sample.json"), {
            "file": str(target), "bytes": target.stat().st_size, "sha256": digest(target),
            "frames": self.total_frames, "fps": self.fps, "seconds": self.seconds,
            "width": self.width, "height": self.height, "hasAudio": self.audio.is_file(),
            "timelineSha256": digest(self.timeline_path), "probe": info,
        })
        self.progress("complete", output=str(target), bytes=target.stat().st_size)
        return target

    def fit_size(self, source: Path, target: Path, limit: int) -> None:
        audio_bitrate = 256_000
        video_bitrate = int((limit * 8 / self.seconds) * 0.965 - audio_bitrate)
        if video_bitrate < 200_000:
            raise ValueError("Requested size is too small for this duration at 1080p")
        base = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y", "-i", str(source),
                "-map", "0:v:0", "-c:v", "libx264", "-preset", "fast", "-threads", "4",
                "-b:v", str(video_bitrate), "-pix_fmt", "yuv420p", "-r", str(self.fps),
                "-frames:v", str(self.total_frames), "-passlogfile", str(self.out / "v4-size-pass")]
        self.run_command(base + ["-pass", "1", "-an", "-f", "null", os.devnull], "size-pass-1.log")
        temporary = target.with_suffix(".compressed.mp4")
        self.run_command(base + ["-pass", "2", "-map", "0:a:0", "-c:a", "aac", "-b:a", "256k",
                                 "-t", f"{self.seconds:.9f}", "-movflags", "+faststart", str(temporary)],
                         "size-pass-2.log")
        temporary.replace(target)

    def run(self) -> None:
        print(f"Rendering {len(self.shots)} shots / {self.seconds:.2f}s / "
              f"{self.width}x{self.height} @ {self.fps} fps", flush=True)
        results: dict[str, Path] = {}
        with ThreadPoolExecutor(max_workers=self.args.jobs) as pool:
            futures = {pool.submit(self.render_shot, index, shot): str(shot["id"])
                       for index, shot in self.shots}
            for future in as_completed(futures):
                results[futures[future]] = future.result()
        if self.args.no_finalize:
            self.progress("clips-complete")
            print(f"Clips ready: {self.clips}", flush=True)
        else:
            output = self.finalize([results[str(shot["id"])] for _, shot in self.shots])
            print(f"Ready: {output} ({output.stat().st_size / 1024 / 1024:.2f} MiB)", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--project-dir", type=Path, default=ROOT)
    parser.add_argument("--timeline", type=Path)
    parser.add_argument("--art-dir", type=Path)
    parser.add_argument("--text-dir", type=Path)
    parser.add_argument("--fx-dir", type=Path)
    parser.add_argument("--audio", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--shot", action="append", default=[], help="Exact shot ID, comma-separated IDs, or repeated option")
    parser.add_argument("--limit", type=int, help="Only render the first N selected shots")
    parser.add_argument("--jobs", type=int, default=2)
    parser.add_argument("--threads", type=int, default=2)
    parser.add_argument("--crf", type=int, default=22)
    parser.add_argument("--preset", default="veryfast")
    parser.add_argument("--max-mib", type=float, default=94)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--no-finalize", action="store_true", help="Render/cache clips without concatenating")
    args = parser.parse_args()
    if args.jobs < 1 or args.threads < 1 or (args.limit is not None and args.limit < 1):
        parser.error("jobs, threads, and limit must be positive")
    try:
        Renderer(args).run()
    except (ValueError, FileNotFoundError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
