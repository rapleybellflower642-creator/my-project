"""Check the original 3D strips and make a transparent-asset manifest/contact sheet."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
ROOT=Path(__file__).resolve().parents[2]
base=ROOT/'public/v3g/assets'
counts={'seal':30,'scroll':8,'cup':8,'sandals':8,'cloak':1}
report={'size':[720,720],'format':'RGBA PNG','originalGeometry':True,'assets':{},'errors':[]}
for kind,count in counts.items():
    rows=[];digests=set()
    for i in range(count):
        p=base/kind/f'{i:03}.png'
        if not p.exists():report['errors'].append(f'missing {kind}/{i:03}.png');continue
        im=Image.open(p)
        if im.mode!='RGBA' or im.size!=(720,720):report['errors'].append(f'bad format or dimensions: {p.name}')
        alpha=im.getchannel('A');bbox=alpha.point(lambda a:255 if a>12 else 0).getbbox()
        if not bbox or min(bbox[:2])<=0 or max(bbox[2:])>=720:report['errors'].append(f'empty or clipped: {kind}/{i:03}')
        sha=hashlib.sha256(p.read_bytes()).hexdigest();digests.add(sha)
        rows.append({'frame':i,'file':f'{kind}/{p.name}','bounds':bbox,'bytes':p.stat().st_size,'sha256':sha})
    if len(digests)!=count:report['errors'].append(f'nonunique or missing frames: {kind}')
    report['assets'][kind]={'count':len(rows),'uniqueFrames':len(digests),'frames':rows}
report['totalBytes']=sum(r['bytes'] for a in report['assets'].values() for r in a['frames'])
if report['totalBytes']>=50*1024*1024:report['errors'].append('Assets exceed 50 MiB budget')
report['passed']=not report['errors']
(base/'asset-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if report['passed']:
    out=Image.new('RGB',(1600,470),'#090b0c');d=ImageDraw.Draw(out)
    font_path=ROOT/'out/v4/fonts/Sans.ttf'
    font=ImageFont.truetype(str(font_path),24) if font_path.exists() else ImageFont.load_default(size=24)
    for i,(name,label) in enumerate([('seal','黄铜官印'),('scroll','米纸卷轴'),('cup','黑釉酒盏'),('sandals','竹杖芒鞋')]):
        im=Image.open(base/name/f'{counts[name]//2:03}.png');im.thumbnail((400,400));out.paste(im,(i*400+(400-im.width)//2,15),im)
        d.text((i*400+200,440),label if font_path.exists() else name,fill='#d9bd79',font=font,anchor='mm')
    dest=ROOT/'out/v3g/assets-review/contact-final.jpg';dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest,quality=93)
print(json.dumps({'passed':report['passed'],'files':sum(a['count'] for a in report['assets'].values()),'totalBytes':report['totalBytes'],'errors':report['errors']},ensure_ascii=False))
raise SystemExit(0 if report['passed'] else 1)
