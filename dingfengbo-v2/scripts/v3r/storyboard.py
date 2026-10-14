#!/usr/bin/env python3
"""Extract a readable contact sheet from the delivered full movie."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'out/v3r'
VIDEO = OUT / 'dingfengbo-v3-remake.mp4'
TIMES = [0.9, 5.8, 9, 15, 20.6, 25.5, 30.6, 32.2, 40, 45.5,
         50.4, 54.6, 59.7, 64, 69.6, 73.2, 81.6, 86, 90.8, 93.5,
         99.3, 103.6, 114, 117.8]
frames = OUT / 'storyboard-frames'
frames.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGB', (1920, 48 + 6 * 300), '#102721')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype(str(ROOT / 'out/v4/fonts/Sans.ttf'), 21)
draw.text((20, 8), '《定风波》V3重做 · 120秒 · 1080p · 完整成片分镜', fill='#e8cc8f', font=font)
for i, at in enumerate(TIMES):
    file = frames / f'{i + 1:02d}-{at:.2f}.jpg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(at), '-i', str(VIDEO),
                    '-frames:v', '1', '-q:v', '2', str(file)], check=True)
    x = i % 4 * 480
    y = 48 + i // 4 * 300
    sheet.paste(Image.open(file).resize((480, 270), Image.Resampling.LANCZOS), (x, y))
    draw.text((x + 12, y + 272), f'{int(at // 60):02d}:{at % 60:05.2f}', fill='#e8cc8f', font=font)
sheet.save(OUT / 'storyboard.jpg', quality=94)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '69.6', '-i', str(VIDEO),
                '-frames:v', '1', '-q:v', '2', str(OUT / 'cover.jpg')], check=True)
print('Extracted 24 actual movie frames and cover.')
