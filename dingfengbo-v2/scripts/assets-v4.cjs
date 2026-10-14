// Build lossless layered scene and type assets shared by Studio and the MP4 exporter.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'out/v4');
const fonts=path.join(out,'fonts');
fs.mkdirSync(fonts,{recursive:true});
if(!fs.existsSync(path.join(fonts,'Sans.ttf'))){
 execFileSync('python3',['-c',`from fontTools.ttLib import TTFont\nfrom pathlib import Path\np=Path(${JSON.stringify(root)})\nfor name in ['Serif','Sans']:\n f=TTFont(p/'public/fonts'/f'{name}.woff');f.flavor=None;f.save(p/'out/v4/fonts'/f'{name}.ttf')`]);
}
const config=path.join(out,'fonts.conf');
fs.writeFileSync(config,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fonts}</dir><cachedir>${out}/font-cache</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE=config;
const sharp=require('sharp');
sharp.concurrency(1);
const base=path.join(root,'public/v4');
for(const d of ['art','text','fx'])fs.mkdirSync(path.join(base,d),{recursive:true});
const timeline=JSON.parse(fs.readFileSync(path.join(base,'timeline.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const svg=(content,w=1920,h=1080)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${content}</svg>`;
async function png(code,file){await sharp(Buffer.from(code)).png({compressionLevel:6}).toFile(file);}
function titleLines(title){
 if(!title)return [];
 if(title.includes('\n'))return title.split('\n');
 if(title.length<=16)return [title];
 let c=Math.ceil(title.length/2);let p=title.indexOf('，');if(p>4&&p<17)c=p+1;
 return [title.slice(0,c),title.slice(c)];
}
function textLayer(s){
 const norm=t=>t.replace(/[\s，。！？、；：“”「」？]/g,'');
 const repeated=s.headline&&norm(s.caption)===norm(s.headline);
 let c=`<defs><linearGradient id="sub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102725" stop-opacity="0"/><stop offset=".43" stop-color="#102725" stop-opacity=".75"/><stop offset="1" stop-color="#102725" stop-opacity=".96"/></linearGradient><linearGradient id="top" x2="0" y2="1"><stop stop-color="#112725" stop-opacity=".70"/><stop offset="1" stop-color="#112725" stop-opacity="0"/></linearGradient></defs>`;
 if(!repeated)c+='<rect x="0" y="762" width="1920" height="318" fill="url(#sub)"/>';
 if(s.headline){
  c+='<rect width="1920" height="520" fill="url(#top)"/>';
  const lines=titleLines(s.headline);
  const large=s.headline.length<=4;
  lines.forEach((line,i)=>{c+=`<text x="112" y="${(large?236:174)+i*118}" font-family="Noto Serif CJK SC" font-size="${large?164:98}" letter-spacing="3" fill="#f1dfac" stroke="#243a33" stroke-width="1" paint-order="stroke">${escape(line)}</text>`;});
 }
 const top=s.lines.length===2?918:959;
 (repeated?[]:s.lines).forEach((line,i)=>{
  let content=escape(line);
  if(s.emphasis&&line.includes(s.emphasis))content=content.replace(escape(s.emphasis),`<tspan fill="#f0dba2">${escape(s.emphasis)}</tspan>`);
  c+=`<text x="960" y="${top+i*79}" text-anchor="middle" font-family="Noto Sans CJK SC" font-size="55" letter-spacing="1.2" fill="#fff6df" stroke="#18312c" stroke-width="1.5" paint-order="stroke">${content}</text>`;
 });
 return svg(c);
}
async function main(){
 const used=new Set(timeline.shots.map(s=>s.scene));
 if(!process.argv.includes('--text-only')){
 for(const filename of ['history','nature','modern']){
  const lib=require('./art-v4/'+filename+'.cjs');
  for(const mode of lib.modes){if(!used.has(mode))continue;
   const layers=lib.make(mode);
   for(const layer of ['background','subject','foreground']){
    if(!layers[layer]?.includes('<svg'))throw new Error('Missing SVG '+mode+' '+layer);
    await png(layers[layer],path.join(base,'art',`${mode}-${layer}.png`));
   }
   if(layers.subjectAlt)await png(layers.subjectAlt,path.join(base,'art',`${mode}-subject-alt.png`));
   used.delete(mode);console.log('Art '+mode);
  }
 }
 if(used.size)throw new Error('Missing scene art: '+[...used]);
 // Tile exactly at the 1080px seam; move each transparent field independently of the subject.
 let drops='';for(let i=0;i<95;i++){
  const x=(i*353.783)%2000-40,y=(i*277.117)%1080,l=18+i%28;
  drops+=`<path d="M${x.toFixed(2)} ${y.toFixed(2)} l${(-l*.28).toFixed(2)} ${l}" stroke="#deeee5" stroke-width="${1+i%2}" opacity="${.13+(i%4)*.04}"/>`;
 }
 await png(svg(`<g>${drops}</g><g transform="translate(0 1080)">${drops}</g>`,1920,2160),path.join(base,'fx/rain.png'));
 let dust='';for(let i=0;i<33;i++)dust+=`<circle cx="${(i*431.31)%1920}" cy="${(i*243.71)%1080}" r="${1+i%3}" fill="#ffe3a3" opacity="${.13+(i%4)*.05}"/>`;
 await png(svg(`<g>${dust}</g><g transform="translate(0 1080)">${dust}</g>`,1920,2160),path.join(base,'fx/dust.png'));
 }
 for(const shot of timeline.shots)await png(textLayer(shot),path.join(base,'text',`${shot.id}.png`));
 await png(svg('<defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#082a2b" stop-opacity=".32"/><stop offset="1" stop-color="#0a2022" stop-opacity=".85"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#g)"/><text x="140" y="405" font-family="Noto Serif CJK SC" font-size="146" fill="#f4e4b5" letter-spacing="10">雨里，也能慢慢走</text><text x="148" y="555" font-family="Noto Sans CJK SC" font-size="52" fill="#fff6df" letter-spacing="6">和苏轼一起，重新读懂《定风波》</text>'),path.join(base,'text/cover.png'));
 console.log(`Built ${timeline.shots.length} caption frames and layered art.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
