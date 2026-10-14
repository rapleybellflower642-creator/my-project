#!/usr/bin/env python3
"""Verify the 960x540 review preview; never treat it as a final master.

Usage: python scripts/verify-preview-v3.py [video.mp4] [--report report.json]
Requires FFmpeg and ffprobe. Defaults resolve relative to the project directory.
"""
from __future__ import annotations

import argparse
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess


ROOT = Path(__file__).resolve().parents[1]


def run(arguments: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(arguments, check=True, capture_output=True, text=True)


def require(condition: bool, explanation: str) -> None:
    if not condition:
        raise ValueError(explanation)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def mp4_atoms(path: Path) -> list[dict]:
    """Read complete top-level atom headers, including 64-bit sizes."""
    atoms = []
    size = path.stat().st_size
    with path.open('rb') as source:
        while source.tell() < size:
            offset = source.tell()
            header = source.read(8)
            require(len(header) == 8, f'Truncated MP4 atom header at {offset}')
            length, raw_name = struct.unpack('>I4s', header)
            header_size = 8
            if length == 1:
                extended = source.read(8)
                require(len(extended) == 8, 'Truncated extended atom size')
                length = struct.unpack('>Q', extended)[0]
                header_size = 16
            elif length == 0:
                length = size-offset
            require(length >= header_size and offset+length <= size,
                    f'Invalid MP4 atom size at {offset}: {length}')
            atoms.append({'name': raw_name.decode('ascii', errors='replace'),
                          'offset': offset, 'size': length})
            source.seek(offset+length)
    return atoms


def verify(video: Path) -> dict:
    require(video.is_file(), f'Preview does not exist: {video}')
    metadata = json.loads(run([
        'ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size,format_name:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels',
        '-of', 'json', str(video),
    ]).stdout)
    videos = [stream for stream in metadata['streams'] if stream['codec_type'] == 'video']
    audios = [stream for stream in metadata['streams'] if stream['codec_type'] == 'audio']
    require(len(videos) == 1 and len(audios) == 1, 'Expected one video and one audio stream')
    v, a = videos[0], audios[0]
    require(v['codec_name'] == 'h264' and v['pix_fmt'] in ('yuv420p', 'yuvj420p'),
            f'Expected H.264 8-bit 4:2:0: {v}')
    require((v['width'], v['height']) == (960, 540), f'Expected 960x540 preview: {v}')
    require(Fraction(v['r_frame_rate']) == 30 and Fraction(v['avg_frame_rate']) == 30,
            f'Expected constant 30 fps: {v}')
    require(int(v['nb_frames']) == 3600, f'Expected 3600 frames: {v}')
    require(a['codec_name'] == 'aac' and int(a['sample_rate']) == 48000 and a['channels'] == 2,
            f'Expected AAC 48 kHz stereo: {a}')
    for name, item in [('video', v), ('audio', a), ('container', metadata['format'])]:
        require(abs(float(item['duration'])-120) <= .001,
                f'Expected 120 seconds of {name}: {item}')

    decoded = run([
        'ffmpeg', '-v', 'error', '-xerror', '-progress', 'pipe:1', '-nostats',
        '-i', str(video), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-',
    ])
    frames = re.findall(r'^frame=(\d+)$', decoded.stdout, re.M)
    require(bool(frames) and int(frames[-1]) == 3600 and 'progress=end' in decoded.stdout,
            f'Full decode did not reach 3600 frames: {decoded.stdout[-1200:]}')
    require(not decoded.stderr.strip(), f'FFmpeg reported decode errors: {decoded.stderr}')

    measurement = run([
        'ffmpeg', '-hide_banner', '-nostats', '-v', 'info', '-i', str(video), '-vn',
        '-af', 'loudnorm=I=-15:TP=-1:LRA=11:print_format=json', '-f', 'null', '-',
    ])
    match = re.search(r'\{\s*"input_i".*?\}', measurement.stderr, re.S)
    require(match is not None, 'Loudness measurement missing')
    sound = json.loads(match.group())
    loudness, peak = float(sound['input_i']), float(sound['input_tp'])
    require(-16 <= loudness <= -14, f'Preview audio loudness outside -16 to -14 LUFS: {loudness}')
    require(peak <= -1, f'Preview audio true peak exceeds -1 dBTP: {peak}')

    atoms = mp4_atoms(video)
    names = [atom['name'] for atom in atoms]
    require('moov' in names and 'mdat' in names, f'Missing MP4 media/index atoms: {names}')
    require(names.index('moov') < names.index('mdat'), f'MP4 is not faststart: {names}')
    return {
        'status': 'passed', 'deliverable': 'V3 review preview (not final master)',
        'file': video.name, 'video': v, 'audio': a, 'container': metadata['format'],
        'expected': {'duration_seconds': 120, 'width': 960, 'height': 540,
                     'fps': 30, 'frames': 3600, 'audio_sample_rate': 48000, 'audio_channels': 2},
        'decoded_video_frames': int(frames[-1]), 'full_audio_video_decode': 'passed',
        'integrated_lufs': loudness, 'true_peak_dbtp': peak,
        'loudness_range_lu': float(sound['input_lra']),
        'audio_limits': {'integrated_lufs_min': -16, 'integrated_lufs_max': -14, 'true_peak_dbtp_max': -1},
        'fast_start': True, 'top_level_atoms': atoms, 'sha256': sha256(video),
        'subjective_listening_checked': False,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video', nargs='?', type=Path, default=ROOT/'out/v3/dingfengbo-v3-preview.mp4')
    parser.add_argument('--report', type=Path, default=ROOT/'out/v3/validation.json')
    arguments = parser.parse_args()
    try:
        report = verify(arguments.video)
    except Exception as error:
        report = {'status': 'failed', 'file': arguments.video.name,
                  'error': f'{type(error).__name__}: {error}'}
        if isinstance(error, subprocess.CalledProcessError):
            report['stderr'] = error.stderr
        arguments.report.parent.mkdir(parents=True, exist_ok=True)
        arguments.report.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
        raise
    arguments.report.parent.mkdir(parents=True, exist_ok=True)
    arguments.report.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
