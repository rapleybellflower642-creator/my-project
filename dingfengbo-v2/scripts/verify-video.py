#!/usr/bin/env python3
"""Validate the delivered MP4, including complete audio/video decoding."""
import argparse
import hashlib
import json
import re
import struct
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('video', type=Path)
parser.add_argument('--report', type=Path)
args = parser.parse_args()
probe = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries',
    'format=duration,size,format_name:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,duration,nb_frames,sample_rate,channels',
    '-of', 'json', str(args.video)
], check=True, capture_output=True, text=True)
metadata = json.loads(probe.stdout)
v = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
a = next(s for s in metadata['streams'] if s['codec_type'] == 'audio')
# FFmpeg names full-range 8-bit 4:2:0 as yuvj420p; both are valid H.264 outputs.
assert v['codec_name'] == 'h264' and v['pix_fmt'] in ('yuv420p', 'yuvj420p'), v
assert (v['width'], v['height'], v['r_frame_rate']) == (1920, 1080, '30/1'), v
assert int(v['nb_frames']) == 3600, v
assert a['codec_name'] == 'aac' and int(a['sample_rate']) == 48000 and a['channels'] == 2, a
for item in [v, a, metadata['format']]:
    assert abs(float(item['duration']) - 120) <= .001, item
decoded = subprocess.run([
    'ffmpeg', '-v', 'error', '-xerror', '-progress', 'pipe:1', '-nostats',
    '-i', str(args.video), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'
], check=True, capture_output=True, text=True)
counts = re.findall(r'^frame=(\d+)$', decoded.stdout, re.M)
assert counts and int(counts[-1]) == 3600 and 'progress=end' in decoded.stdout
measurement = subprocess.run([
    'ffmpeg', '-v', 'info', '-i', str(args.video), '-vn',
    '-af', 'loudnorm=I=-15:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'
], check=True, capture_output=True, text=True)
match = re.search(r'\{\s*"input_i".*?\}', measurement.stderr, re.S)
assert match is not None
audio = json.loads(match.group())
assert -16 <= float(audio['input_i']) <= -14
assert float(audio['input_tp']) <= -1
atoms = []
with args.video.open('rb') as f:
    while True:
        header = f.read(8)
        if len(header) < 8:
            break
        length, name = struct.unpack('>I4s', header)
        header_len = 8
        if length == 1:
            length = struct.unpack('>Q', f.read(8))[0]
            header_len = 16
        atoms.append(name.decode('ascii', errors='replace'))
        if not length:
            break
        f.seek(length - header_len, 1)
assert atoms.index('moov') < atoms.index('mdat'), atoms
report = {
    'status': 'passed', 'file': args.video.name,
    'video': v, 'audio': a, 'container': metadata['format'],
    'decoded_video_frames': int(counts[-1]),
    'full_audio_video_decode': 'passed',
    'integrated_lufs': float(audio['input_i']),
    'true_peak_dbtp': float(audio['input_tp']),
    'fast_start': True,
    'sha256': hashlib.sha256(args.video.read_bytes()).hexdigest()
}
if args.report:
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
