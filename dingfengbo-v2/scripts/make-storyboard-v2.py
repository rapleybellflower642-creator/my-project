#!/usr/bin/env python3
"""Extract a review contact sheet from the actual exported MP4."""
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

video = Path(sys.argv[1] if len(sys.argv) > 1 else 'out/dingfengbo-v2.mp4')
output = Path('out/final-frames')
output.mkdir(parents=True, exist_ok=True)
frames = [44, 134, 310, 498, 590, 770, 861, 1040, 1160, 1200, 1360, 1524,
          1650, 1840, 1940, 2120, 2375, 2570, 2790, 3050, 3130, 3238, 3370, 3520]
selection = '+'.join(f'eq(n\\,{frame})' for frame in frames)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf',
                f'select={selection}', '-fps_mode', 'vfr', '-q:v', '2',
                str(output / 'frame-%02d.jpg')], check=True)
sheet = Image.new('RGB', (1920, 6 * 299), '#161819')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
except OSError:
    font = ImageFont.load_default()
for i, frame in enumerate(frames):
    image = Image.open(output / f'frame-{i + 1:02d}.jpg')
    image.thumbnail((480, 270), Image.Resampling.LANCZOS)
    x, y = (i % 4) * 480, (i // 4) * 299
    draw.text((x + 12, y + 5), f'{frame / 30:.2f}s  /  F{frame}', font=font, fill='#cdb784')
    sheet.paste(image, (x, y + 29))
sheet.save('out/dingfengbo-v2-storyboard.jpg', quality=93, subsampling=0)
print('Saved 24 frames and out/dingfengbo-v2-storyboard.jpg')
