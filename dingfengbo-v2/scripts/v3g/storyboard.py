#!/usr/bin/env python3
"""Extract a readable contact sheet from the delivered full movie."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'out/v3g'
VIDEO = OUT / 'dingfengbo-v3-gold.mp4'
TIMES = [1.8, 5.7, 8.2, 9.8, 13.5, 21.5, 25.5, 30, 34, 39, 44, 50, 54, 59, 62.7, 68, 75, 79, 84, 88, 93, 97, 102, 107, 114, 117.5]
frames = OUT / 'storyboard-frames'
frames.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGB', (1920, 48 + ((len(TIMES) + 3) // 4) * 300), '#090b10')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype(str(ROOT / 'out/v3g/fonts/Sans.ttf'), 21)
draw.text((20, 8), '《定风波》V3黑金版 · 120秒 · 1080p · 完整成片分镜', fill='#e8cc8f', font=font)
for i, at in enumerate(TIMES):
    file = frames / f'{i + 1:02d}-{at:.2f}.jpg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(at), '-i', str(VIDEO),
                    '-frames:v', '1', '-q:v', '2', str(file)], check=True)
    x = i % 4 * 480
    y = 48 + i // 4 * 300
    sheet.paste(Image.open(file).resize((480, 270), Image.Resampling.LANCZOS), (x, y))
    draw.text((x + 12, y + 272), f'{int(at // 60):02d}:{at % 60:05.2f}', fill='#e8cc8f', font=font)
sheet.save(OUT / 'storyboard.jpg', quality=94)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '9.8', '-i', str(VIDEO),
                '-frames:v', '1', '-q:v', '2', str(OUT / 'cover.jpg')], check=True)
print(f'Extracted {len(TIMES)} actual movie frames and cover.')
