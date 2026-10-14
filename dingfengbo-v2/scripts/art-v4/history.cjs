/* Original layered illustrations for the V4 film. No fonts or external assets. */
'use strict';

const W = 1920;
const H = 1080;
const C = {
  ink: '#293e40', pine: '#365c58', jade: '#668b7a', pale: '#b9c8ac',
  paper: '#e8dec5', light: '#f7eed8', blue: '#748e98', red: '#a65844',
  face: '#d0ad83', faceLight: '#e7c5a0', robe: '#718a81', white: '#ede2c9',
};
const modes = ['case','prison','official','exile','cottage','farm','writing','manuscript','companions','walk','chant','staff','horse','resolve','raincoat','cold','portrait'];
const path = (d, fill, rest = '') => `<path d="${d}" fill="${fill}" ${rest}/>`;
const line = (d, stroke = C.ink, width = 2, opacity = 1) => path(d, 'none', `stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`);
const rect = (x,y,w,h,fill,rest='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${rest}/>`;
const ellipse = (x,y,rx,ry,fill,rest='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${rest}/>`;
const group = (body, transform='',rest='') => `<g${transform ? ` transform="${transform}"` : ''} ${rest}>${body}</g>`;
const defs = () => `<defs>
  <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#b4c6bf"/><stop offset=".66" stop-color="#e7dfc8"/><stop offset="1" stop-color="#d7c9a6"/></linearGradient>
  <linearGradient id="dawn" x2="0" y2="1"><stop stop-color="#708f95"/><stop offset=".57" stop-color="#d4d5be"/><stop offset="1" stop-color="#f2d6ab"/></linearGradient>
  <linearGradient id="night" x2=".85" y2="1"><stop stop-color="#203b49"/><stop offset=".72" stop-color="#355456"/><stop offset="1" stop-color="#657165"/></linearGradient>
  <linearGradient id="wall" x2="1" y2=".75"><stop stop-color="#c2c6b0"/><stop offset=".55" stop-color="#dfdac0"/><stop offset="1" stop-color="#a9b9aa"/></linearGradient>
  <linearGradient id="robe" x2="1" y2=".2"><stop stop-color="#54756e"/><stop offset=".38" stop-color="#849b89"/><stop offset=".77" stop-color="#68887e"/><stop offset="1" stop-color="#3b605d"/></linearGradient>
  <linearGradient id="face" x2="1" y2=".3"><stop stop-color="#c3a07c"/><stop offset=".52" stop-color="#edcbaa"/><stop offset="1" stop-color="#d8b48f"/></linearGradient>
  <linearGradient id="paper" x2=".7" y2="1"><stop stop-color="#f7ecd1"/><stop offset=".7" stop-color="#e1d2ac"/><stop offset="1" stop-color="#c6b68c"/></linearGradient>
  <linearGradient id="river" x2="0" y2="1"><stop stop-color="#9cb7ae"/><stop offset=".58" stop-color="#7b9c96"/><stop offset="1" stop-color="#4f7873"/></linearGradient>
  <radialGradient id="warm"><stop stop-color="#f4d69c" stop-opacity=".7"/><stop offset="1" stop-color="#eed6a8" stop-opacity="0"/></radialGradient>
  <radialGradient id="mist"><stop stop-color="#f0ead8" stop-opacity=".6"/><stop offset="1" stop-color="#f0ead8" stop-opacity="0"/></radialGradient>
</defs>`;
const svg = (body) => {
  const required = [...defs().matchAll(/<(?:linearGradient|radialGradient) id="([^"]+)"[\s\S]*?<\/(?:linearGradient|radialGradient)>/g)]
    .filter(match=>body.includes(`url(#${match[1]})`)).map(match=>match[0]).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${required}</defs>${body}</svg>`;
};

const grain = (dark=false) => line(Array.from({length:26},(_,i)=>`M${(i*173)%1890} ${(i*127)%1040} l${19+i%31} ${i%3-1}`).join(' '),dark?'#d7ddc8':'#566854',.7,.08);
const cloud = (x,y,s=1,fill='#eee9d4') => group(path('M-220 24 Q-170-2-96 4 Q-80-30-11-16 Q27-49 89-20 Q166-31 185 7 Q239-2 265 24 Q140 34-5 31Z',fill),`translate(${x} ${y}) scale(${s})`,'opacity=".4"');
const mountains = (kind='soft') => {
  const a = kind==='cold' ? '#aabfc0' : '#9cac99';
  const b = kind==='cold' ? '#75989b' : '#748f7a';
  const c = kind==='cold' ? '#4c757a' : '#51796b';
  return path('M-50 540 Q66 350 218 420 Q355 200 485 368 Q617 145 752 337 Q887 250 1023 404 Q1149 293 1262 385 Q1444 174 1584 320 Q1735 240 1970 423 L1970 800 H-50Z',a)+path('M-60 681 Q117 492 293 584 Q422 363 647 523 Q738 438 880 560 Q1042 359 1210 500 Q1374 400 1497 526 Q1657 397 1960 528 V920 H-60Z',b)+path('M-40 782 Q202 638 433 698 Q588 508 786 661 Q1005 576 1246 692 Q1423 568 1695 659 Q1820 565 1970 622 V1080 H-40Z',c)+ellipse(939,620,895,114,'url(#mist)');
};
const land = (kind='soft') => rect(0,0,W,H,kind==='night'?'url(#night)':kind==='cold'?'#ccd9d4':'url(#sky)')+cloud(404,168,1.15)+cloud(1460,185,.95)+mountains(kind);
const leaves = (x,y,s=1,mirror=false,color=C.pine) => {
  let out=line('M0 240 Q38 137 180 3',color,8)+line('M49 158 Q-8 108-81 82 M102 92 Q155 108 230 77 M133 56 Q103 10 54-14',color,3);
  const ls=[[-69,88,-36],[-31,110,-26],[19,135,-16],[49,150,-39],[78,112,25],[114,95,34],[148,101,15],[184,92,9],[89,34,-70],[109,55,-69],[139,46,-20],[161,19,10]];
  out += ls.map(([px,py,r])=>path('M0 0 Q18-38 69-43 Q55-11 0 0Z',color,`transform="translate(${px} ${py}) rotate(${r})"`)).join('');
  return group(out,`translate(${x} ${y}) scale(${mirror?-s:s} ${s})`);
};
const grass = (x,y,s=1,fill=C.pine) => group(path('M-86 79 Q-79 22-41-30 Q-53 23-44 58 Q-28-20 3-70 Q-5 4 4 53 Q24-7 67-35 Q41 3 32 66 Q78 21 114 31 Q64 55 52 83Z',fill),`translate(${x} ${y}) scale(${s})`);
const bamboo = (x,y,s=1) => {
  let out = path('M-8 320 L0-258 L13-258 L5 320Z','#406c5e')+path('M37 325 L76-192 L86-192 L50 325Z','#567c64');
  [-190,-102,-15,72,159,246].forEach(v=>{out+=line(`M-7 ${v} H10`,'#b1bd87',3);});
  out += leaves(3,-110,.7,false,'#345c53')+leaves(63,9,.73,true,'#4f7864')+leaves(4,154,.58,false,'#496d56');
  return group(out,`translate(${x} ${y}) scale(${s})`);
};
const reeds = (x,y,s=1) => group(line('M-46 170 Q-15 33-88-49 M-20 174 Q41 32 27-111 M19 166 Q102 47 89-53 M43 177 Q111 109 165 80','#4c6d5b',4)+path('M-91-37 Q-120-85-94-116 Q-61-80-78-40 M21-105 Q-2-163 33-188 Q53-146 34-100 M85-45 Q72-105 109-125 Q121-82 98-45','#a7a17b'),`translate(${x} ${y}) scale(${s})`);
const rock = (x,y,s=1) => group(path('M-126 43 L-85-24 L-20-60 L77-37 L116 21 L70 58 L-22 78Z','#748c80')+path('M-85-24 L-20-60 L24-12 L-8 57 L-126 43Z','#8d9c87')+line('M-20-60 L24-12 L77-37 M24-12 L67 34 M-79 28 L-45-2','#516d64',2,.4),`translate(${x} ${y}) scale(${s})`);
const ripples = (x=1040,y=740,w=750) => Array.from({length:9},(_,i)=>line(`M${x-w/2+(i%3)*43} ${y+i*19} q${w*.27} ${i%2?-13:8} ${w-(i%3)*80} ${i%2?-6:3}`,'#d2d7bb',1.7,.25)).join('');

/* The same face and folded Dongpo cloth cap anchor the character in every shot. */
function head(pose='normal') {
  const lookUp=pose==='chant';
  const face = path('M-47-35 Q-65-13-48 29 L-34 48 Q-7 70 23 49 L41 19 L40-22 L17-46Z','url(#face)')+
    path('M-48-12 Q-67-23-65 4 Q-63 26-47 23 L-44 6 Q-57-13-56 2',C.face,`stroke="#a48667" stroke-width="1.5"`)+
    path('M36-6 Q52-11 49 10 Q45 24 36 23','#bca17c')+
    path('M-47-37 L-52-6 L-45 30 L-37 4 L-28-25 L13-26 L32-8 L33 28 L43 7 L40-40Z','#334340')+
    path('M-52-36 Q-67-65-52-88 L-24-107 L24-102 Q42-87 44-54 L51-34 Q2-14-52-36Z','#344c49')+
    path('M-52-82 L-23-101 L-7-64 L-41-38Z','#48615a')+
    path('M-20-101 L22-96 L33-54 L1-61Z','#293f3e')+
    line('M-50-38 Q-7-21 45-41','#6e8270',2)+line('M-21-98 L-7-64 L-12-37','#889883',1.5,.75)+
    path('M-49-35 Q-78-11-87 48 L-70 67 L-68 40 Q-64-8-39-30Z','#3e5751')+
    line('M-73 43 Q-73-4-51-26','#718370',1.7,.7)+
    line(lookUp?'M-33-7 Q-21-18-9-11 M6-11 Q20-22 31-14':'M-33-7 Q-22-16-9-9 M6-9 Q19-16 31-9','#40473b',4)+
    line(lookUp?'M-30-2 Q-21-11-12-6 M9-7 Q21-14 29-9':'M-30-1 Q-20-7-12-2 M9-2 Q20-8 28-3','#344239',2.3)+
    ellipse(lookUp?-22:-19,lookUp?-6:-2,2,2.2,'#293c38')+ellipse(lookUp?19:20,lookUp?-11:-4,2,2.2,'#293c38')+
    line('M-2-8 Q-10 8-5 14 L5 14 M-33 13 L-22 18 M24 10 L30 14','#a28667',1.6)+
    path('M-32 22 Q-14 33-1 32 Q15 34 32 19 L26 49 L6 77 L-2 63 L-18 68 L-38 47 L-45 26Z','#43504a')+
    path('M-16 24 Q-5 19 4 24 Q16 18 27 23 L17 31 L5 28 L-6 34 L-24 30Z','#30403c')+
    line('M-5 31 Q3 35 12 29','#beac88',1.5)+
    line('M-30 33 Q-23 48-20 52 M-18 38 L-12 59 M-7 43 L-2 65 M6 42 L9 59 M19 35 L17 47','#a3aa8e',1.2,.76)+
    line('M-31-24 Q-20-29-10-24 M-31-18 L-16-19','#ab9475',1.1,.5);
  return group(face,lookUp?'rotate(-9)':'');
}

function person({x=1190,y=410,s=1,pose='stand',flip=false}={}) {
  const seated=pose==='sit'||pose==='write';
  const walking=['walk','walkAlt','chant','staff'].includes(pose);
  const cold=pose==='cold';
  const robeBottom=seated?291:361;
  let body=ellipse(0,robeBottom+24,seated?151:139,22,'#203e36','opacity=".15"');
  body += path(`M-40 54 Q-116 83-132 142 L-151 231 L-116 270 L-146 ${robeBottom} Q-55 ${robeBottom+26} 60 ${robeBottom+10} L117 ${robeBottom-10} L91 208 L110 125 Q86 88 39 54Z`,'url(#robe)',`stroke="#3e635c" stroke-width="2"`);
  body += path(`M-96 99 Q-133 146-125 196 L-86 221 L-80 277 L-122 ${robeBottom} L-62 ${robeBottom+9} Q-37 249-49 165Z`,'#51736b');
  body += path(`M47 82 Q88 117 94 166 L64 258 L93 ${robeBottom+1} L26 ${robeBottom+11} L-11 201Z`,'#92a48e');
  body += path('M-27 35 L-28 73 L4 96 L30 70 L25 31Z','#d8b58d');
  body += path('M-38 59 L1 101 L36 59 L60 90 L-9 158 L-68 87Z','#e7ddc2');
  body += path('M-36 61 L3 102 L-15 124 L-58 85Z','#faf0d6');
  body += path('M33 69 L-20 130 L-9 156 L52 88Z','#bdc7ac');
  body += line(`M-59 181 Q-58 272-93 ${robeBottom-9} M9 193 Q13 270 55 ${robeBottom-7} M67 217 Q74 282 87 ${robeBottom-20}`,'#c0c4a5',2,.6);
  body += path('M-82 183 Q-14 208 68 182 L72 199 Q-10 225-81 200Z','#667764')+line('M-67 197 Q-16 213 54 196','#a9b093',1.2,.6);
  if(pose==='walkAlt'){
    body += path(`M-65 ${robeBottom-13} L-53 ${robeBottom+13} L-31 ${robeBottom+29} L-37 ${robeBottom+44} L-74 ${robeBottom+35} L-94 ${robeBottom+4}Z`,'#d1caa7');
    body += path(`M-71 ${robeBottom+26} Q-46 ${robeBottom+30}-32 ${robeBottom+27} L-24 ${robeBottom+39} Q-52 ${robeBottom+53}-84 ${robeBottom+37}Z`,'#77816a');
    body += path(`M46 ${robeBottom-13} L79 ${robeBottom+14} L118 ${robeBottom+20} L129 ${robeBottom+35} L76 ${robeBottom+38} L18 ${robeBottom-10}Z`,'#dfd5b4');
    body += path(`M84 ${robeBottom+20} L111 ${robeBottom+23} L137 ${robeBottom+20} L145 ${robeBottom+31} Q108 ${robeBottom+46} 80 ${robeBottom+38}Z`,'#7d8267');
  } else if(walking){
    body += path(`M-65 ${robeBottom-13} L-104 ${robeBottom+14} L-147 ${robeBottom+33} Q-152 ${robeBottom+46}-124 ${robeBottom+46} L-77 ${robeBottom+32} L-39 ${robeBottom}Z`,'#d1caa7');
    body += path(`M-132 ${robeBottom+30} L-107 ${robeBottom+36} L-71 ${robeBottom+22} L-76 ${robeBottom+41} Q-120 ${robeBottom+59}-151 ${robeBottom+44} L-148 ${robeBottom+36}Z`,'#77816a');
    body += path(`M46 ${robeBottom-13} L50 ${robeBottom+18} L80 ${robeBottom+28} L82 ${robeBottom+40} L36 ${robeBottom+39} L18 ${robeBottom-10}Z`,'#dfd5b4');
    body += path(`M42 ${robeBottom+20} L63 ${robeBottom+26} L90 ${robeBottom+28} L94 ${robeBottom+39} Q67 ${robeBottom+49} 33 ${robeBottom+39}Z`,'#7d8267');
  } else if(!seated){
    body += path(`M-86 ${robeBottom-1} L-91 ${robeBottom+16} L-120 ${robeBottom+26} Q-139 ${robeBottom+33}-134 ${robeBottom+43} Q-95 ${robeBottom+47}-65 ${robeBottom+30} L-61 ${robeBottom}Z`,'#d7ceb0');
    body += path(`M26 ${robeBottom+5} L33 ${robeBottom+28} Q58 ${robeBottom+39} 85 ${robeBottom+31} L88 ${robeBottom+43} Q64 ${robeBottom+50} 23 ${robeBottom+44} L11 ${robeBottom+10}Z`,'#ddd3b1');
    body += line(`M-133 ${robeBottom+37} Q-99 ${robeBottom+41}-71 ${robeBottom+23} M27 ${robeBottom+40} Q61 ${robeBottom+47} 86 ${robeBottom+36}`,'#79816c',5);
  }
  if(cold){
    body += path('M-112 112 Q-76 118-37 157 L48 132 L72 162 Q-21 204-76 176 L-126 154Z','#93a793',`stroke="#45685f" stroke-width="1.5"`);
    body += path('M87 106 Q114 135 88 169 L-46 139 L-42 109 L7 129Z','#65877c',`stroke="#41645d" stroke-width="1.7"`);
    body += path('M-50 110 Q-53 99-41 95 L-18 103 L-11 114 L-34 122Z','#dec09b');
  } else if(pose==='write'||pose==='till'){
    body += path('M-110 112 Q-88 132-71 181 L-7 218 L-17 244 Q-74 237-126 195Z','#66887d',`stroke="#45695f" stroke-width="1.7"`);
    body += path('M84 109 Q109 146 78 178 L33 218 L11 208 L36 149Z','#9eaf95',`stroke="#4e7063" stroke-width="1.7"`);
    body += path('M23 208 Q30 201 44 210 L46 231 L36 240 L29 227 L16 221Z','#debb93');
    body += path('M-17 218 Q5 214 10 223 L-2 235 L-18 241 L-30 233Z','#d9b48c');
    if(pose==='write')body += line('M38 178 L32 273','#765b3f',5)+path('M31 269 L37 281 L28 293 L27 278Z','#32433d');
  } else if(pose==='chant'){
    body += path('M-108 116 Q-152 114-168 81 L-194 95 Q-184 154-140 173 L-91 173Z','#779585',`stroke="#426b5e" stroke-width="2"`);
    body += path('M-196 98 Q-214 89-208 75 L-192 75 L-182 65 L-173 71 L-178 88Z','#e3c29c');
    body += path('M88 119 Q119 168 83 211 L21 179 L32 148Z','#6d8d7d');
    body += path('M20 157 Q-1 158-12 178 L8 188 L29 177Z','#debc94');
  } else if(walking){
    body += path('M-108 109 Q-118 155-144 180 L-128 209 Q-83 187-67 151Z','#779687',`stroke="#41675e" stroke-width="1.7"`);
    body += path('M86 109 Q113 151 70 187 L14 190 L3 163 L43 152Z','#6e8e7e',`stroke="#446b60" stroke-width="1.5"`);
    body += path('M8 163 Q-11 157-21 166 L-30 180 L-17 192 L13 185Z','#e0bd94');
    body += path('M-148 181 Q-168 177-171 190 L-153 207 L-133 202Z','#d8b38b');
  } else {
    body += path('M-119 114 Q-141 160-98 200 L-23 195 L-7 163 Q-76 166-119 114Z','#64877a',`stroke="#466e61" stroke-width="1.5"`);
    body += path('M89 109 Q118 147 90 183 L16 199 L-3 166 Q35 162 89 109Z','#97aa92',`stroke="#527467" stroke-width="1.5"`);
    body += path('M-27 167 Q-11 157 3 163 L17 175 L32 173 L40 182 L20 195 L-15 192 L-36 180Z','#ddba93');
    body += line('M-4 166 L4 182 M6 169 L13 183','#a78867',1.2);
  }
  body += head(pose);
  return group(body,`translate(${x} ${y}) scale(${flip?-s:s} ${s})`);
}

function companion(x,y,s=1,flip=false,robe='#8e8870'){
  const body=path('M-32 19 Q-89 55-101 112 L-68 173 L-114 298 L-17 321 L21 235 L65 315 L121 298 L78 177 L85 93 L34 22Z',robe)+path('M-30 17 L-9 76 L36 17 L45 44 L-8 106 L-57 41Z','#d3cbb0')+path('M-48-47 Q-29-76 4-65 Q37-60 33-19 L18 8 L-15 12 L-42-13Z','#c5a27e')+path('M-52-37 L-46-72 Q-7-90 33-62 L41-31 L15-43 L-22-41Z','#40564c')+path('M-38-8 Q-22 13 20-1 L8 37 L-23 32Z','#465447')+line('M-25-30 L-12-28 M8-27 L20-27','#41483a',3)+path('M-87 84 Q-135 24-107-40 L-81-44 L-74 29 L-15 91 L-29 127Z',robe)+path('M-108-38 L-98-56 L-79-56 L-72-38Z','#d7b48b')+path('M74 76 L109 123 L174 157 L168 183 L88 160 L47 123Z',robe)+path('M168 153 L190 162 L192 178 L173 185 L159 174Z','#d5ad83')+path('M-89 293 L-117 335 L-151 345 L-149 358 L-103 357 L-65 310 M64 299 L102 334 L140 336 L145 350 L98 353 L46 315Z','#b7b18f');
  return group(body,`translate(${x} ${y}) scale(${flip?-s:s} ${s})`);
}

function house(x,y,s=1){
  return group(path('M-236 51 L-201-160 L78-189 L261-53 L232 142 L-48 167Z','#b8bea5')+path('M-207-139 L-225 51 L-39 119 L-17-118Z','#d8d3b4')+path('M-252-138 L-28-288 L296-112 L268-62 L-19-190 L-231-96Z','#68765c')+path('M-252-138 L-28-288 L-19-190 L-231-96Z','#8a8e68')+line('M-224-145 L-20-271 M-205-125 L-22-251 M-164-127 L-16-238 M-12-266 L270-111 M-10-246 L273-94 M-7-221 L219-99','#c4ba88',3,.58)+path('M-167-26 L-72-15 L-77 99 L-172 64Z','#566b59')+path('M-156-15 L-91-8 L-94 80 L-161 56Z','#314e46')+path('M35-76 L141-55 L134 17 L29-2Z','#587766')+line('M65-71 L60 4 M104-63 L98 10 M32-43 L138-24','#c5c7a5',4)+line('M-203 60 L-201-116 M-40 132 L-25-173 M242 123 L260-79','#667c63',8)+path('M-41 132 L202 147 L208 165 L-49 168Z','#82977a')+path('M-119 124 L-10 158 L-40 207 L-224 209Z','#c5b993'),`translate(${x} ${y}) scale(${s})`);
}
const inkstone = (x,y,s=1) => group(ellipse(0,5,54,24,'#273f3b')+ellipse(0,-1,51,18,'#577266')+ellipse(6,-3,34,11,'#223d37')+line('M-30-3 Q-20-8-11-7','#9dad88',2,.6),`translate(${x} ${y}) scale(${s})`);
const paper = (x,y,s=1,angle=0) => group(path('M-165-105 Q-14-118 171-95 L161 119 Q-24 110-172 129Z','url(#paper)')+line('M-157-95 Q2-107 158-86 M-159 111 Q-1 94 150 106','#b5a880',2,.35),`translate(${x} ${y}) rotate(${angle}) scale(${s})`);
function desk(x=1150,y=731,s=1){return group(path('M-413-42 L266-93 L445 11 L-261 83Z','#9c8b64')+path('M-413-42 L-261 58 L445-12 L445 16 L-263 95 L-413-8Z','#637865')+path('M-340 41 L-345 243 L-319 247 L-298 67 M350 30 L363 188 L387 184 L388 24','#536957')+line('M-393-29 L-261 68 L423 0','#c5b88d',3,.6),`translate(${x} ${y}) scale(${s})`);}
function windowLattice(x,y,w=360,h=405){
  let out=rect(x,y,w,h,'#8faa9c')+path(`M${x} ${y+h*.7} Q${x+w*.35} ${y+h*.4} ${x+w} ${y+h*.58} V${y+h} H${x}Z`,'#6c9580');
  out+=rect(x-12,y-13,w+24,14,'#576f60')+rect(x-12,y+h,w+24,16,'#576f60')+rect(x-12,y,15,h,'#66745c')+rect(x+w-3,y,15,h,'#66745c');
  [1,2,3].forEach(i=>out+=rect(x+w*i/4-3,y,6,h,'#68806b'));
  [1,2,3,4].forEach(i=>out+=rect(x,y+h*i/5-3,w,6,'#657d69'));
  return out;
}
function interior({night=false,office=false}={}){
  let out=rect(0,0,W,H,night?'#667d72':'url(#wall)');
  out+=path('M0 0 H1920 V174 Q970 220 0 163Z',night?'#304c46':'#8b9b80');
  out+=path('M0 829 L1920 730 V1080 H0Z',night?'#647765':'#b6b491');
  out+=path('M0 794 L1920 716 V749 L0 851Z',night?'#3e5b4e':'#788b6d');
  out+=rect(355,165,25,641,night?'#526b58':'#9caa8b')+rect(1569,169,30,566,night?'#4b6554':'#a7af8d');
  out+=windowLattice(1030,241,381,349);
  out+=path('M1040 259 L1378 581 L1915 957 L1072 913 L1030 590Z','#f1dfaa','opacity=".16"');
  out+=line('M77 901 L1839 794 M450 1042 L877 805 M1602 1090 L1440 771','#7c8868',2,.22);
  if(office){out+=rect(225,143,87,692,'#a3654d')+rect(1589,145,84,603,'#995d49')+path('M209 810 H332 L342 857 H194Z','#7d8166')+path('M1577 727 H1688 L1701 770 H1567Z','#85846a');}
  return out;
}
const fgLandscape = () => leaves(-50,3,1.65,false,'#315f55')+leaves(1907,94,1.15,true,'#456e5b')+grass(142,957,1.8,'#355c49')+grass(1830,923,1.65,'#335b4a')+grain();

function make(mode){
  if(!modes.includes(mode))throw new Error(`Unknown historical illustration mode: ${mode}`);
  let bg='',su='',fg='';
  if(mode==='case'){
    bg=interior({night:true})+rect(0,0,W,H,'#294f4c','opacity=".16"')+ellipse(1170,479,609,490,'url(#warm)')+desk(1120,741,1.13)+paper(1016,700,.71,-13)+paper(1335,657,.73,6)+inkstone(1438,703,.83);
    bg+=path('M736 754 L738 608 L751 608 L760 755Z','#a98852')+ellipse(745,614,29,7,'#b49962')+path('M740 608 L736 569 L750 569 L751 608Z','#dfc794')+path('M744 571 Q724 549 743 528 Q760 552 744 571Z','#f9e4b5')+ellipse(744,551,58,89,'url(#warm)');
    su=person({x:1151,y:426,s:1.02,pose:'sit'})+group(path('M-84-55 L59-57 L77 71 L-74 65Z','#e7d9b3')+path('M-85-56 Q-106-61-109-41 Q-112-25-91-20 L-76-22Z','#b8ab84')+path('M59-58 Q40-50 52-33 L76-30Z','#f4e6c5'), 'translate(1145 598) rotate(-13)')+path('M1109 581 Q1089 575 1089 593 L1101 612 L1121 608Z','#e2bd93');
    fg=paper(299,994,1.9,-13)+paper(556,1073,1.45,9)+path('M1626 1132 L1731 621 L1795 610 L1700 1130Z','#3f5b4f')+path('M1714 701 L1920 663 V698 L1706 738Z','#435f50')+grain(true);
  }
  if(mode==='prison'){
    bg=rect(0,0,W,H,'url(#night)')+path('M0 0 H1920 V772 L0 864Z','#344f55')+path('M0 864 L1920 773 V1080 H0Z','#526c6c');
    const rows=[[133,310,530,861,1220,1640],[341,211,659,1054,1469,1880],[547,355,792,1209,1614],[733,188,612,1042,1471]];
    rows.forEach(([y,...xs])=>{bg+=line(`M0 ${y} H1920`,'#1f3945',5,.42);xs.forEach(x=>bg+=line(`M${x} ${y} v198`,'#223f49',4,.4));});
    bg+=rect(1251,177,365,331,'#a5b9b5')+path('M1282 508 L1608 204 L1618 505 L1805 886 L1037 964Z','#c7cebb','opacity=".19"')+rect(1232,166,399,25,'#203d45')+rect(1237,501,393,26,'#24424b');
    [1282,1361,1440,1519,1598].forEach(x=>bg+=rect(x,186,13,320,'#3c5960'));
    bg+=path('M996 864 Q1123 830 1335 851 L1500 958 Q1208 1007 975 929Z','#a99f78','opacity=".35"')+line('M1021 887 L1360 895 M1046 908 L1412 917 M1065 933 L1374 935','#bdb48a',4,.35);
    su=person({x:1205,y:503,s:1.05,pose:'sit'})+ellipse(1116,866,124,37,'#637865')+path('M1099 823 Q1066 799 1033 820 L1027 849 Q1069 877 1127 860Z','#8a9c86')+path('M1401 811 Q1436 783 1461 810 L1466 850 Q1427 875 1396 851Z','#78917f');
    fg=rect(122,0,60,1080,'#243d42')+rect(451,0,47,1080,'#284449')+rect(1792,0,65,1080,'#243d42')+rect(0,858,1920,28,'#344d4e','opacity=".8"')+grass(1766,974,.62,'#3f5650')+grain(true);
  }
  if(mode==='official'){
    bg=interior({office:true})+path('M542 253 L901 253 L922 664 L529 683Z','#b5be9f')+path('M556 267 L886 267 L901 640 L541 660Z','#d4d4b4')+path('M566 553 Q622 386 691 453 Q761 342 882 506 L894 641 L546 658Z','#94a88a')+path('M583 610 Q696 476 820 582 L899 644 L541 659Z','#768d75')+desk(1171,734,.95)+paper(1353,688,.56,-4)+inkstone(1456,692,.7);
    bg+=path('M637 684 L654 772 M834 667 L839 745','#798c72')+line('M447 179 H1486','#c0c8ab',8,.4);
    su=person({x:1056,y:412,s:1.03})+group(path('M-35-61 L42-61 L58 49 L-24 59Z','#d9c99f')+path('M-41-60 L49-60 L52-45 L-40-44Z','#adb08b')+path('M-23 25 L38 19 L41 41 L-21 46Z','#a95f49')+line('M-14 19 Q-3 9 9 17 Q25 8 36 16','#7e4d3b',2),'translate(1392 627) rotate(-7)');
    fg=path('M0 0 H111 L130 1080 H0Z','#576f5c')+path('M1814 0 H1920 V1080 H1791Z','#87644e')+leaves(54,139,.77,false,'#526f57')+grain();
  }
  if(mode==='exile'){
    bg=rect(0,0,W,H,'url(#dawn)')+ellipse(1451,214,95,95,'#ead9b0','opacity=".8"')+cloud(593,214,1.6)+mountains()+rect(0,638,W,442,'url(#river)')+path('M0 705 Q385 595 666 665 Q806 615 920 658 L850 698 L0 813Z','#426d62')+ripples(988,678,1690);
    bg+=path('M1498 514 L1498 457 L1522 457 L1522 432 L1553 412 L1580 434 V456 H1603 V515Z','#68877a')+path('M1483 459 L1553 434 L1621 459Z','#4f776a')+path('M1538 421 L1555 400 L1571 422Z','#648576');
    su=group(path('M-453 83 Q-65 154 428 74 L347 151 Q-25 218-384 145Z','#697f65')+path('M-440 88 Q-9 178 408 81 L393 105 Q-19 190-420 108Z','#b5ad7d')+line('M-355 136 Q-3 203 328 148','#405e51',5)+path('M-289 97 Q-327-123-191-164 Q-32-112-29 120Z','#81916e')+path('M-269 103 Q-306-100-191-162 M-219 114 Q-250-92-191-162 M-167 119 Q-199-81-191-162 M-108 122 Q-140-77-191-162','#698262')+line('M-288 68 Q-164 8-38 89 M-302 14 Q-157-46-45 37','#c3bb86',3,.6),'translate(1046 664)');
    su+=person({x:1259,y:544,s:.66,pose:'sit'})+line('M1411 585 L1654 873','#977f52',9)+path('M1609 825 L1672 878 L1648 897 L1594 840Z','#a18c5d');
    fg=reeds(107,1050,1.35)+reeds(1842,1013,1.03)+ripples(1423,941,879)+grass(1811,1065,1.1,'#3e6653')+grain();
  }
  if(mode==='cottage'){
    bg=land()+path('M-40 796 Q448 590 805 699 Q1434 578 1970 704 V1080 H-40Z','#9ba486')+path('M614 1080 Q792 898 1210 776 Q1392 733 1467 681 L1631 711 Q1408 844 1200 937 L1099 1080Z','#d6c8a2')+house(1410,563,1.14)+path('M890 741 L936 746 L985 692 L941 688Z','#b9bd91')+path('M876 747 V631 M1009 718 V606 M873 663 L1016 638 M870 706 L1014 677','#798b6a');
    bg+=bamboo(1698,468,.67)+rock(404,799,1.7)+grass(645,731,.8,'#798b64')+path('M352 810 Q520 781 662 821','#b3ba92');
    su=person({x:1113,y:466,s:.97,pose:'walk'})+group(path('M-40-58 Q-90-17-55 51 L30 60 Q77 14 52-39 L7-59Z','#998864')+line('M-36-53 L-11-18 L-55 48 M-7-18 L48-34 M-7-18 L28 52','#c4b48a',4),'translate(972 601) rotate(-18)');
    fg=leaves(-77,21,1.67,false,'#355e51')+grass(87,1009,2.1,'#4b7153')+grass(1789,992,1.9,'#476d51')+path('M1597 994 Q1767 955 1970 986 V1080 H1556Z','#64835d')+grain();
  }
  if(mode==='farm'){
    bg=rect(0,0,W,H,'url(#sky)')+cloud(379,156,1.1)+mountains()+path('M0 707 Q719 540 1920 660 V1080 H0Z','#aaae84')+house(1624,509,.63);
    [0,1,2,3,4,5,6].forEach(i=>{bg+=path(`M${-166+i*104} ${789+i*47} Q${690+i*17} ${510+i*42} 1993 ${647+i*78} L1993 ${670+i*78} Q${630+i*29} ${564+i*42} ${-127+i*104} ${812+i*47}Z`,i%2?'#7c9468':'#96a477');});
    bg+=rock(410,751,.54)+path('M137 553 Q206 444 247 555 Q307 452 363 555 L378 702 H114Z','#5e8064');
    su=group(person({x:0,y:0,s:1,pose:'till'}),'translate(1112 438) rotate(-15) scale(.95)')+group(line('M-9-131 L-36 197','#9d8053',10)+path('M-52 181 L31 178 L55 210 L-54 228Z','#677870')+path('M-52 181 L31 178 L34 189 L-47 201Z','#93a08b'),'translate(1199 641) rotate(-20)');
    su+=path('M1200 866 l23-12 l18 7 l-5 15 M1238 880 l15-4 l10 6 M1165 878 l-13-8 l-14 11','#6f7154');
    fg=grass(136,1002,1.65,'#4f7552')+grass(1733,990,1.8,'#56784f')+grass(1505,1092,1.35,'#52784c')+path('M0 1062 Q884 947 1920 1015 V1080 H0Z','#617e50','opacity=".7"')+grain();
  }
  if(mode==='writing'){
    bg=interior()+windowLattice(265,241,410,402)+bamboo(456,455,.55)+path('M919 325 H956 V682 H919Z','#829378')+path('M948 638 Q872 633 863 605 L850 605 Q857 673 933 669Z','#91a28a')+ellipse(907,606,58,24,'#77977f')+desk(1165,741,1.07)+paper(1202,731,.81,-5)+inkstone(1474,701,.77);
    bg+=path('M615 697 L598 556 Q650 523 681 555 L665 697Z','#a88761')+ellipse(638,554,44,16,'#657e61')+line('M618 555 L592 420 M641 553 L658 410 M657 553 L700 454','#5f6d51',5)+path('M586 430 L592 402 L599 426 M652 422 L661 393 L665 423 M692 462 L708 429 L707 461','#354e43');
    su=person({x:1128,y:445,s:1,pose:'write'})+group(paper(0,0,.82,-3),'translate(1150 725) scale(1 .33)')+line('M1161 677 L1155 739','#836948',5)+path('M1154 735 L1158 747 L1149 753 L1149 742Z','#2d4139');
    fg=leaves(-85,340,1.5,false,'#54765d')+path('M0 974 Q412 880 801 997 L939 1080 H0Z','#7e9271','opacity=".7"')+paper(1541,1062,1.6,13)+grain();
  }
  if(mode==='manuscript'){
    bg=rect(0,0,W,H,'#8d9c80')+path('M0 57 L1920 0 V1080 H0Z','#a5ab87')+path('M0 856 L1920 185 V584 L414 1080 H0Z','#c0ba92','opacity=".36"');
    [66,273,517,730,970].forEach(y=>bg+=line(`M0 ${y+90} L1920 ${y-96}`,'#6c8268',3,.25));
    bg+=paper(1052,547,2.43,-8)+group(path('M-66-247 H66 V248 H-66Z','#bbae85')+ellipse(0,-247,66,18,'#d5c499')+ellipse(0,248,66,18,'#8f8c68')+path('M-43-247 H-11 V248 H-43Z','#ded0a5','opacity=".6"'),'translate(527 600) rotate(-8)')+inkstone(1553,693,2)+ellipse(447,245,94,54,'#667f66')+path('M354 245 Q374 333 447 335 Q521 329 540 244Z','#92a180')+ellipse(447,243,84,45,'#bac5a3')+ellipse(447,246,63,31,'#727f59')+path('M532 255 Q607 227 589 284 Q574 312 542 293','#92a180');
    bg+=group(path('M-56 15 H72 L84 78 L-70 87Z','#a65c48')+path('M-36 20 L-29-27 Q7-67 46-34 L51 17Z','#b16f53')+path('M-29-29 Q7-43 45-30 L47-14 Q8-25-30-11Z','#c58b66'),'translate(1453 250) rotate(9)');
    su=group(path('M300-254 Q237-223 164-120 L68-19 L-34 72 L-81 131 L-31 173 L32 137 L70 98 L96 29 Q170-3 257-94 L386-153Z','#738f80')+path('M75-19 Q21-10-38 52 L-81 131 L-31 173 L13 136 L45 107 L47 70 L85 33Z','#e6d7b4')+path('M18 20 Q-29 9-55 39 L-76 79 L-89 127 L-67 157 L-38 137 L-28 96 L-11 104 L-4 81 L30 57Z','#dbb992')+line('M-52 47 L-65 116 M-35 41 L-51 106 M-18 44 L-35 88','#ad8968',3)+line('M-64-154 L-47 266','#6d5943',11)+path('M-48 254 Q-76 279-45 322 Q-29 278-42 254Z','#3c4940'),'translate(1190 435) rotate(23)');
    fg=leaves(1910,20,1.47,true,'#55725b')+leaves(51,985,1.08,false,'#4c6d55')+grain();
  }
  if(mode==='companions'){
    bg=land('cold')+path('M0 560 Q645 639 1099 546 Q1502 515 1920 610 V1080 H0Z','#5c7e69')+path('M221 1080 Q508 724 954 686 Q1395 630 1559 448 L1653 472 Q1519 706 1129 760 Q630 806 620 1080Z','#afb99c');
    [185,387,1620,1770].forEach((x,i)=>{bg+=path(`M${x} 0 Q${x-56} 304 ${x+44} 736 L${x+102} 744 Q${x+32} 331 ${x+61} 0Z`,i%2?'#4d7464':'#41685c');});
    bg+=path('M0 0 H1920 V215 Q1682 187 1533 307 Q1354 238 1259 281 Q1054 210 829 325 Q592 185 357 307 Q137 233 0 355Z','#567b64')+leaves(108,551,1.1,false,'#345e50')+leaves(1769,506,1.05,true,'#3c6855')+rock(701,722,.82);
    su=companion(864,458,.91,true,'#8e9075')+companion(639,480,.82,true,'#708b7b')+person({x:1230,y:439,s:.97,pose:'walk'})+line('M1070 603 L1025 877','#929460',8)+line('M1083 637 L1076 648 M1063 737 L1057 749 M1043 821 L1039 834','#c0bf86',3);
    fg=path('M-19 0 Q61 458 223 862 L166 885 Q-35 416-54 0Z','#335c4c')+leaves(-42,638,1.55,false,'#315a4a')+leaves(1908,58,1.55,true,'#355f54')+grass(1518,1052,2,'#3d6552')+grass(517,1028,1.8,'#406954')+grain(true);
  }
  if(mode==='walk'){
    bg=land()+path('M0 819 Q418 521 980 679 Q1341 774 1920 520 V1080 H0Z','#6f906d')+path('M-59 960 Q480 681 931 744 Q1378 833 1973 599 L1951 690 Q1396 948 925 844 Q431 770 32 1080 H-59Z','#c5c7a4')+path('M280 675 Q471 580 648 637 M1414 709 Q1620 685 1844 576','#839c79');
    bg+=bamboo(276,462,.63)+rock(1573,785,.96)+rock(385,836,1.27)+cloud(931,174,.8);
    su=person({x:1179,y:436,s:1.03,pose:'walk'})+line('M1013 605 L963 910','#8d925b',8)+line('M1007 643 L1003 655 M991 744 L987 758 M975 847 L971 860','#d0c993',3);
    fg=leaves(-103,-15,1.7,false,'#416b57')+leaves(1914,100,1.15,true,'#4d765e')+grass(1754,1069,2.1,'#496f51')+grass(133,990,1.65,'#4a6f54')+grain();
  }
  if(mode==='chant'){
    bg=rect(0,0,W,H,'url(#sky)')+mountains()+path('M0 699 Q480 726 904 627 Q1511 561 1920 711 V1080 H0Z','#78977b')+path('M0 1001 Q362 868 830 869 Q1320 817 1920 958 V1080 H0Z','#a9b492')+bamboo(410,420,1.1)+rock(1597,793,1.27);
    bg+=line('M315 344 Q675 281 1008 346 M205 400 Q653 345 906 417','#e7e5cb',3,.35)+cloud(1229,177,.83);
    su=person({x:1230,y:400,s:1.12,pose:'chant'})+path('M1038 535 Q967 543 888 510 Q987 574 1102 598Z','#bcc4a3','opacity=".55"');
    fg=leaves(-25,18,1.3,false,'#345f52')+leaves(1774,94,1.3,true,'#5a7d63')+grass(169,963,1.9,'#426b50')+grass(1663,1050,1.8,'#436d50')+grain();
  }
  if(mode==='staff'){
    bg=rect(0,0,W,H,'#b9c5b1')+path('M0 0 H1920 V417 Q1342 350 777 465 Q418 319 0 422Z','#8ba48e')+path('M0 510 Q528 457 881 534 Q1382 620 1920 406 V1080 H0Z','#a8b9a0')+path('M0 747 Q793 628 1920 692 V1080 H0Z','#82a59a')+ripples(905,735,1560)+rock(334,816,1.27)+rock(1670,673,1.23)+rock(1497,961,.72);
    su=path('M973 90 Q1102 128 1322 78 L1436 560 Q1327 622 1190 573 L1127 456 L1035 623 L871 568Z','url(#robe)',`stroke="#45695f" stroke-width="3"`)+path('M1043 117 L1076 462 L983 600 L915 576Z','#577b70')+path('M1237 111 L1266 431 L1348 588 L1410 569Z','#91a58d')+line('M1158 124 Q1134 339 1109 467 M1198 227 L1241 495','#c2c8a8',4,.63)+path('M960 573 L1002 605 L917 760 L847 780 L814 736Z','#e4dab9')+path('M1273 589 L1328 595 L1357 773 L1300 792 L1262 703Z','#e8ddba')+path('M820 733 Q870 742 913 748 L930 776 Q869 822 773 807 L759 784Z','#9d9e70')+path('M1293 770 Q1341 753 1376 780 L1436 808 Q1437 831 1400 837 L1287 835 L1279 809Z','#9b9d71')+line('M800 770 Q850 789 914 766 M815 749 L809 801 M842 756 L837 805 M871 759 L865 800 M899 756 L893 789 M1304 779 L1304 833 M1330 776 L1331 836 M1357 784 L1357 835 M1384 799 L1382 836 M1293 813 H1419','#ded4a0',4,.73)+path('M740 159 L659 835 L646 836 L726 157Z','#7b895a')+line('M713 279 L731 281 M697 410 L715 412 M681 544 L699 546 M665 681 L683 683 M649 814 L667 816','#d5ce93',5)+ellipse(654,847,51,12,'#cee0c7','opacity=".67"')+line('M606 856 Q654 882 709 854 M760 832 Q842 853 943 823 M1270 850 Q1364 872 1441 846','#d4dfc5',2.5,.73);
    fg=grass(73,992,1.8,'#496e51')+leaves(1937,643,1.5,true,'#557b5d')+reeds(1627,1087,1.3)+grain();
  }
  if(mode==='horse'){
    bg=land()+path('M0 712 Q879 627 1920 694 V1080 H0Z','#9ea986')+path('M-70 1000 Q691 667 1960 782 L1960 928 Q713 773 203 1080 H-70Z','#c6c4a0')+house(404,530,.69)+rock(1588,801,.8)+bamboo(1778,476,.75);
    let horse=path('M-251-46 Q-147-109 31-57 L109-141 L144-219 L183-223 L191-165 L240-111 L223-72 L174-70 L125-27 L74 14 L62 82 L37 193 L3 189 L17 67 L-118 65 L-153 172 L-189 172 L-178 51 L-243 24Z','#957b58')+path('M173-205 L158-124 L119-43 L94-56 L115-144 L148-225Z','#465b4d')+path('M-247-38 Q-306-46-326 5 L-358 53 L-339 82 Q-285 28-240 24Z','#52614b')+path('M-188 35 L-186 180 L-165 198 L-139 197 L-153 174 L-137 49 M28 51 L17 187 L38 209 L61 205 L42 180 L69 35','#ad8f60')+path('M-64-66 L6-49 L15 14 L-93 10 L-125-44Z','#a86145')+path('M-121-46 L-92-76 L-15-58 L14-43 L3-22 L-104-20Z','#527163')+ellipse(181,-145,5,5,'#283e35')+line('M182-171 L221-110 L214-88 M211-83 Q65-41-53-50','#d3c7a2',4)+path('M136-211 L132-246 L149-239 L156-215 M167-217 L184-242 L195-240 L184-214Z','#8e7856')+line('M-185 192 H-153 M20 205 H55','#465447',10);
    su=group(horse,'translate(766 625) scale(.93)')+person({x:1247,y:436,s:1.03,pose:'walk'})+line('M1083 607 L1035 908','#8b915c',8);
    fg=leaves(-61,70,1.28,false,'#4a7057')+grass(145,1040,2.1,'#49704f')+grass(1713,1020,1.8,'#4a7251')+grain();
  }
  if(mode==='resolve'){
    bg=rect(0,0,W,H,'url(#dawn)')+path('M0 0 H1920 V456 Q1448 337 1131 429 Q583 519 0 327Z','#809f9b','opacity=".38"')+ellipse(1278,302,378,263,'url(#warm)')+mountains('cold')+path('M0 970 Q534 765 987 787 Q1444 688 1920 880 V1080 H0Z','#718f78')+rock(1393,883,1.95)+rock(394,930,1.28);
    bg+=path('M390 783 Q333 520 203 352 Q144 268 171 127 L208 114 Q192 273 265 325 Q361 424 428 594 L460 759Z','#4d7260')+path('M206 324 Q312 215 479 208 L490 226 Q314 255 247 364Z','#4d7260')+path('M149 194 Q55 165-59 205 L-74 260 Q62 271 181 236Z','#658970')+path('M214 345 Q281 220 525 217 L563 259 Q335 279 265 372Z','#5a8067');
    su=person({x:1195,y:415,s:1.1,pose:'chant'})+path('M1261 510 Q1390 500 1486 430 Q1453 519 1343 558 L1299 583Z','#738f80')+line('M1374 470 Q1541 422 1660 483','#f0ead1',2.5,.4);
    fg=leaves(-120,38,1.7,false,'#355e51')+grass(1778,1008,2,'#426a50')+grass(774,1094,1.55,'#496f52')+grain();
  }
  if(mode==='raincoat'){
    bg=rect(0,0,W,H,'url(#sky)')+mountains()+ellipse(1198,450,747,402,'url(#mist)')+path('M0 890 Q939 768 1920 844 V1080 H0Z','#8ba087')+path('M1496 829 Q1437 665 1454 488 Q1465 296 1557 186 L1592 195 Q1530 344 1521 471 Q1520 681 1561 824Z','#6b7d62')+path('M1487 413 Q1318 331 1124 333 L1081 355 Q1325 377 1484 466Z','#6b7d62')+path('M1547 298 Q1730 176 1886 262 L1905 240 Q1744 128 1570 240Z','#6b7d62')+rock(527,864,1.52);
    su=group(path('M-49-227 Q-11-263 30-228 L54-173 L172 27 L242 231 Q115 294-16 273 L-225 200 L-165-42 L-67-179Z','#9ca378')+path('M-47-225 L-26-180 L-144 67 L-204 211 L-139 235 L-52 23 L4-99 L82 100 L132 270 L220 240 L119-18 L36-174 L29-228Z','#858f65')+path('M-70-182 Q-9-130 59-178 L93-115 Q12-60-107-114Z','#b6b285')+path('M-112-102 Q12-55 102-111 L131-49 Q25 7-134-39Z','#a8aa7a')+path('M-139-26 Q9 16 141-33 L167 28 Q29 82-161 39Z','#c0b78a')+path('M-167 52 Q-10 92 177 45 L197 109 Q12 153-187 120Z','#a7a777')+path('M-191 135 Q7 167 206 122 L228 188 Q17 238-214 196Z','#b9b183')+line('M-59-147 L-97-102 M-12-129 L-34-79 M39-144 L72-97 M-94-75 L-132-28 M-36-57 L-56-4 M24-55 L44-5 M88-70 L119-20 M-143 0 L-179 53 M-78 22 L-102 75 M-17 32 L-23 89 M47 27 L67 83 M113 9 L148 62 M-167 89 L-199 145 M-98 113 L-122 169 M-32 125 L-40 180 M39 120 L50 180 M108 105 L138 163 M178 90 L201 144 M-186 163 L-221 218 M-126 186 L-147 242 M-49 196 L-59 260 M27 194 L35 267 M97 182 L112 256 M163 166 L192 240','#d8c9a0',3.4,.78)+line('M-50-224 Q-36-269-1-268 Q33-269 35-225','#a5a27a',10),'translate(1217 586) rotate(-8)');
    su+=line('M1126 331 Q1128 382 1183 373 Q1206 362 1221 340','#a59f73',6);
    fg=leaves(-48,0,1.54,false,'#52795f')+leaves(1882,-30,1.35,true,'#5d8267')+grass(123,1012,1.9,'#4e7356')+grass(1772,1021,1.78,'#507254')+grain();
  }
  if(mode==='cold'){
    bg=rect(0,0,W,H,'#c4d4cf')+mountains('cold')+path('M0 833 Q656 689 1035 741 Q1491 709 1920 841 V1080 H0Z','#8fa89a')+path('M0 1080 Q616 759 1208 794 Q1579 778 1920 669 V766 Q1535 887 1210 871 Q641 831 239 1080Z','#c4c9ad')+rock(459,841,1.23)+bamboo(1660,479,.74)+path('M42 0 Q107 478 434 693 L383 716 Q65 524-16 129Z','#66887a');
    bg+=line('M199 233 Q486 90 797 179 M88 358 Q552 208 949 331 M1518 426 Q1720 361 1964 383','#e5e8d7',3,.39);
    su=person({x:1195,y:434,s:1.03,pose:'cold'})+ellipse(1137,420,37,13,'#f4f2df','opacity=".33"')+path('M1247 522 Q1360 528 1441 480 Q1411 559 1301 580Z','#8ca695');
    fg=leaves(-15,112,1.56,false,'#51796a')+leaves(1920,234,1.38,true,'#5e8571')+grass(163,1020,1.9,'#547b66')+grass(1769,1043,1.6,'#567c64')+grain();
  }
  if(mode==='portrait'){
    bg=rect(0,0,W,H,'url(#wall)')+path('M0 0 H1920 V173 Q855 224 0 130Z','#8fa389')+windowLattice(284,211,593,548)+bamboo(523,537,.88)+path('M301 760 L846 230 L1734 1080 H596Z','#f3e2b7','opacity=".17"')+path('M1412 205 H1636 V869 H1412Z','#a9b797')+line('M1428 224 V852 M1478 224 V852 M1528 224 V852 M1578 224 V852 M1621 224 V852','#8aa081',3,.4)+ellipse(1314,410,522,398,'url(#warm)');
    su=person({x:1232,y:483,s:1.68,pose:'sit'})+path('M985 977 Q1164 1018 1453 983 L1475 1080 H1001Z','#718d7c');
    fg=leaves(-92,739,1.28,false,'#557a5e')+path('M0 1001 Q454 877 946 1041 L1028 1080 H0Z','#7f9979','opacity=".8"')+grain();
  }
  const result={background:svg(bg),subject:svg(su),foreground:svg(fg)};
  if(mode==='walk')result.subjectAlt=svg(person({x:1179,y:436,s:1.03,pose:'walkAlt'})+line('M1013 605 L963 910','#8d925b',8)+line('M1007 643 L1003 655 M991 744 L987 758 M975 847 L971 860','#d0c993',3));
  if(mode==='companions')result.subjectAlt=svg(companion(864,458,.91,true,'#8e9075')+companion(639,480,.82,true,'#708b7b')+person({x:1230,y:439,s:.97,pose:'walkAlt'})+line('M1070 603 L1025 877','#929460',8)+line('M1083 637 L1076 648 M1063 737 L1057 749 M1043 821 L1039 834','#c0bf86',3));
  return result;
}

module.exports={modes,make};
