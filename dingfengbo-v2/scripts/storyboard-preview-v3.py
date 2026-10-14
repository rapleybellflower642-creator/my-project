#!/usr/bin/env python3
"""Make a storyboard from the actual review MP4, not a separate render."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
output = root / 'out' / 'v3'
video = output / 'dingfengbo-v3-preview.mp4'
frames = [40, 111, 180, 313, 585, 793, 1070, 1310, 1580, 1755, 1900, 2100, 2385, 2590, 2795, 3050, 3300, 3530]
canvas = Image.new('RGB', (1440, 1920), '#090d10')
draw = ImageDraw.Draw(canvas)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
for i, frame in enumerate(frames):
    still = output / f'preview-frame-{frame:04d}.jpg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{frame / 30:.8f}',
                    '-i', str(video), '-frames:v', '1', '-q:v', '2', str(still)], check=True)
    with Image.open(still) as source:
        image = source.convert('RGB').resize((480, 270))
    x, y = i % 3 * 480, i // 3 * 320
    canvas.paste(image, (x, y + 34))
    draw.text((x + 16, y + 8), f'{frame / 30:06.2f}s', font=font, fill='#d6bb81')
canvas.save(output / 'storyboard.jpg', quality=94)
print('Storyboard extracted from the actual 120-second preview.')
