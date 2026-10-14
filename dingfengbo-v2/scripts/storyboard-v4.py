#!/usr/bin/env python3
"""Extract an overview from the actual V4 full-resolution video."""
from pathlib import Path
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
timeline=json.loads((ROOT/'public/v4/timeline.json').read_text())
out=ROOT/'out/v4'
video=out/'dingfengbo-v4-full.mp4'
frames=out/'storyboard-frames'
frames.mkdir(exist_ok=True)
chosen=[]
for chapter in timeline['chapters']:
    shots=[s for s in timeline['shots'] if s['chapter']==chapter['id']]
    chosen.extend([shots[0],shots[len(shots)//2]])
chosen[-1]=timeline['shots'][-1]
width,height,bar,columns=480,270,30,4
rows=(len(chosen)+columns-1)//columns
canvas=Image.new('RGB',(columns*width,rows*(height+bar)),(18,39,36))
draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',19)
for index,shot in enumerate(chosen):
    at=(shot['from']+min(45,shot['duration']-1))/timeline['fps']
    image=frames/f"{shot['id']}.jpg"
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(at),'-i',str(video),'-frames:v','1',str(image)],check=True)
    x=(index%columns)*width;y=(index//columns)*(height+bar)
    draw.text((x+12,y+5),f"{int(at//60):02d}:{at%60:05.2f}  /  {shot['id']}",fill=(233,215,169),font=font)
    canvas.paste(Image.open(image).convert('RGB').resize((width,height),Image.Resampling.LANCZOS),(x,y+bar))
canvas.save(out/'storyboard.jpg',quality=93)
print(f'Extracted {len(chosen)} shots from the full video.')
