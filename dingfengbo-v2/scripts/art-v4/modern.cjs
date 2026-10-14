'use strict';

// Original, layered narrative illustrations.  Every layer is a self-contained
// SVG; the film animates the layers and adds its own typography and weather.
const modes = ['exam', 'jobloss', 'commute', 'comments', 'close-phone', 'office', 'coffee', 'debt', 'luxury', 'burden', 'steps', 'market', 'window', 'old-photo', 'relief', 'city-dawn'];
const C = {ink:'#142f35', teal:'#244b50', lightTeal:'#426a6b', blue:'#6b878b', mist:'#b8cac4', paper:'#e1dbc7', cream:'#f0e5ca', skin:'#d8ad8b', skinLight:'#ebc4a0', rust:'#ad6651', gold:'#c2a56e', dark:'#263735', hair:'#26332f'};
const P = (d, fill, extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const R = (x,y,w,h,fill,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const L = (x1,y1,x2,y2,color,width=3,extra='') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const E = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const G = (transform, children,extra='') => `<g transform="${transform}" ${extra}>${children}</g>`;
const defs = `<defs>
  <linearGradient id="room" x2=".9" y2="1"><stop stop-color="#9cafa9"/><stop offset=".62" stop-color="#667f7c"/><stop offset="1" stop-color="#405d5e"/></linearGradient>
  <linearGradient id="night" x2="0" y2="1"><stop stop-color="#18383f"/><stop offset=".58" stop-color="#48646b"/><stop offset="1" stop-color="#83938a"/></linearGradient>
  <linearGradient id="day" x2="0" y2="1"><stop stop-color="#93b0b1"/><stop offset=".56" stop-color="#d9d6be"/><stop offset="1" stop-color="#eacb95"/></linearGradient>
  <linearGradient id="warm" x2="1" y2="1"><stop stop-color="#eee0bf"/><stop offset=".48" stop-color="#bdc0a5"/><stop offset="1" stop-color="#648681"/></linearGradient>
  <linearGradient id="floor" x2=".9" y2="1"><stop stop-color="#78908a"/><stop offset="1" stop-color="#24494d"/></linearGradient>
  <linearGradient id="glass" x2="1" y2=".7"><stop stop-color="#9ebabc"/><stop offset=".45" stop-color="#4a777f"/><stop offset="1" stop-color="#bdd1c7"/></linearGradient>
  <linearGradient id="coat" x2="1" y2=".65"><stop stop-color="#456c6e"/><stop offset=".4" stop-color="#285359"/><stop offset="1" stop-color="#153a42"/></linearGradient>
  <linearGradient id="pants" x2="1" y2=".2"><stop stop-color="#546369"/><stop offset="1" stop-color="#293f48"/></linearGradient>
  <linearGradient id="skin" x2=".7" y2=".8"><stop stop-color="#ecc6a2"/><stop offset="1" stop-color="#bf8b70"/></linearGradient>
  <linearGradient id="paper" x2="1" y2="1"><stop stop-color="#f3e9d0"/><stop offset="1" stop-color="#c1bd9f"/></linearGradient>
  <linearGradient id="light" x2=".7" y2="1"><stop stop-color="#f9e7b9" stop-opacity=".6"/><stop offset="1" stop-color="#f5db9f" stop-opacity="0"/></linearGradient>
  <radialGradient id="glow"><stop stop-color="#fff0bb" stop-opacity=".58"/><stop offset="1" stop-color="#fff0bb" stop-opacity="0"/></radialGradient>
</defs>`;
const wrap = body => {
  // A layer carries only the paints it actually uses; no hidden scene geometry.
  const paints = [...defs.matchAll(/<(linearGradient|radialGradient) id="([^"]+)"[\s\S]*?<\/\1>/g)]
    .filter(m => body.includes(`url(#${m[2]})`)).map(m => m[0]).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${paints}</defs>${body}</svg>`;
};

function head(x=0,y=0,scale=1,mood='low') {
  const eyes = mood === 'calm' ? `${P('M-25 4q9 7 18 0M14 4q9 7 18 0','none','stroke="#534b3b" stroke-width="3" stroke-linecap="round"')}` : `${P('M-26 2q10 -3 19 1M13 2q9 -3 18 1','none','stroke="#4c4438" stroke-width="3" stroke-linecap="round"')}${E(-15,6,2.2,2.4,C.dark)}${E(22,6,2.2,2.4,C.dark)}`;
  return G(`translate(${x} ${y}) scale(${scale})`,`${P('M-22 42l-5 39 55 1-9-41','url(#skin)')}${E(-43,4,9,15,C.skin)}${E(43,4,8,15,C.skin)}${P('M-43-18Q-49 32-24 48Q1 67 28 44Q50 26 43-24Q21-58-17-49Z','url(#skin)')}${P('M-45 4Q-62-39-28-57Q8-78 39-51Q58-43 48-9L37 5 31-27Q1-7-26-29L-36-1Z',C.hair)}${P('M-32-43Q-6-65 23-47M-27-36Q-8-47 7-46','none','stroke="#4b5750" stroke-width="3" opacity=".65"')}${eyes}${P('M6 8l-5 16 9 2','none','stroke="#aa7860" stroke-width="2.2" stroke-linecap="round"')}${P(mood==='calm'?'M-9 34q12 9 25-1':'M-8 36q12-5 23-1','none','stroke="#855f50" stroke-width="2.6" stroke-linecap="round"')}${P('M-29 21l8 3M27 22l7-3','none','stroke="#d19779" stroke-width="4" opacity=".55"')}`);
}
function person(x,y,s=1,pose='still',mood='low') {
  let arms = `${P('M-66 82Q-95 96-101 165L-97 275-67 274-56 174Z','url(#coat)')}${P('M65 82Q87 99 92 166L87 277 60 274 50 160Z','url(#coat)')}${P('M-96 263l-1 24q-1 21 14 25q18-2 18-21l-2-28Z','url(#skin)')}${P('M61 264l-2 27q0 21 13 23q16-1 16-21l-2-29Z','url(#skin)')}`;
  if(pose==='box') arms = `${P('M-66 83Q-98 99-104 170Q-100 205-52 221L-38 188-73 167-53 125Z','url(#coat)')}${P('M63 82Q99 100 112 168L61 218 44 187 82 163 52 125Z','url(#coat)')}`;
  if(pose==='phone') arms = `${P('M-66 83Q-101 107-100 177L-72 229 5 207-7 177-63 190-61 119Z','url(#coat)')}${P('M64 84Q95 107 107 165L77 218 37 206 47 176 76 174 52 125Z','url(#coat)')}`;
  if(pose==='strap') arms = `${P('M-66 83Q-97 100-111 162L-90 225-53 186-68 163-45 121Z','url(#coat)')}${P('M64 83Q94 101 99 165L69 189 33 129 61 112 73 144 52 130Z','url(#coat)')}`;
  if(pose==='walk') arms = `${P('M-62 84Q-81 105-89 158L-143 210-125 232-58 185-34 121Z','url(#coat)')}${P('M58 84Q86 101 95 157L120 209 93 222 62 174 34 116Z','url(#coat)')}${P('M-140 207l-23 15q-11 9-2 19q9 8 20 1l20-16Z','url(#skin)')}${P('M96 213l7 27q5 14 18 9q11-4 4-20l-9-19Z','url(#skin)')}`;
  let legs= `${P('M-65 226L-62 344-65 467-18 468-3 346 1 262 13 349 30 466 75 464 65 338 61 226Z','url(#pants)')}${P('M-64 455l-10 27q7 15 68 10l-7-31Z',C.ink)}${P('M30 456l-2 31q31 11 76 0q-3-16-34-28Z',C.ink)}${L(-24,264,-30,442,'#85908a',2,'opacity=".25"')}`;
  if(pose==='walk') legs=`${P('M-64 227l-9 115-84 100 36 29 99-102 26-85 13 69 82 84 34-28-65-92-5-95Z','url(#pants)')}${P('M-153 439l-20 24q12 28 57 32q14-8-9-31Z',C.ink)}${P('M96 421l26 38q12 9 30 2q12-11-18-54Z',C.ink)}`;
  const extra=pose==='phone'?`${P('M-8 181q11-15 24-9l26 5-8 27-38 4Z','url(#skin)')}${P('M50 172q-14-5-22 4l-14 25 19 12 27-24Z','url(#skin)')}${G('translate(21 158) rotate(-12)',R(-21,-30,43,73,C.ink,'rx="7"')+R(-16,-21,33,52,'#92b9b2','rx="2"'))}`:pose==='strap'?`${P('M-69 116L29 237 40 223-97 70Z','#a9926e')}${P('M41 114q-14-18-23-14l-10 10q6 18 28 28Z','url(#skin)')}${P('M-56 176q18-8 26 3q9 10-1 20l-27 8Z','url(#skin)')}`:'';
  return G(`translate(${x} ${y}) scale(${s})`,`${E(0,489,113,17,'#163c41','opacity=".18"')}${legs}${arms}${P('M-27 64L-62 76Q-74 105-67 235Q-2 255 65 236L64 81 28 64 3 99Z','url(#coat)')}${P('M-22 66L1 99 25 67 17 105-16 105Z',C.paper)}${P('M-29 64l-20 18 32 51 18-34M26 65l22 17-22 46-25-29','none','stroke="#6d8b85" stroke-width="2.5" opacity=".7"')}${L(1,110,1,231,'#6d8b85',2,'opacity=".45"')}${P('M28 151l22 0 0 25-22 0Z','none','stroke="#729087" stroke-width="2" opacity=".45"')}${head(0,0,1,mood)}${extra}`);
}
function seated(x,y,s=1,mode='desk',mood='low') {
  const arm = mode==='coffee' ? `${P('M52 83Q82 100 94 157l-21 37-42-13 5-25 28 4-18-40Z','url(#coat)')}${P('M37 157q-18-2-21 10q0 20 25 18l14-8-4-18Z','url(#skin)')}` : `${P('M-58 79Q-91 93-91 159l33 49 76-7-5-28-53 3-22-40Z','url(#coat)')}${P('M64 78Q83 99 106 162l-28 43-24-16 17-25-30-48Z','url(#coat)')}${P('M7 174l37-8q15 4 12 15l-18 14-23 6Z','url(#skin)')}${P('M52 182l29-6 16 15q7 12-7 17l-35-9Z','url(#skin)')}`;
  return G(`translate(${x} ${y}) scale(${s})`,`${R(-86,148,153,101,'#586864','rx="24"')}${L(-65,228,-80,445,C.ink,12)}${L(50,229,105,442,C.ink,12)}${P('M-55 216q57-18 135 11l73 73-31 28-78-57-40 11-9 138-42 2-4-161Z','url(#pants)')}${P('M120 311l17 119 42-5-17-124Z','url(#pants)')}${P('M-42 411l-7 33q23 11 75 1q-5-18-28-29Z',C.ink)}${P('M137 418l3 26q32 13 76-4q-7-15-41-24Z',C.ink)}${P('M-27 61l-35 16-8 154q59 23 135 9l-6-162-35-15-23 31Z','url(#coat)')}${P('M-23 63l24 29 22-29-7 40-31 0Z',C.paper)}${L(1,109,1,224,'#73908a',2,'opacity=".55"')}${arm}${head(0,0,1,mood)}`);
}
function plant(x,y,s=1) {
  return G(`translate(${x} ${y}) scale(${s})`,`${P('M-47 0L-34 86 31 86 46 0Z','#9c8c70')}${E(0,0,47,11,'#536459')}${P('M0 4Q-10-79-38-139M0-4Q8-112 42-167M0-1Q-2-67 65-89','none','stroke="#3c6156" stroke-width="6"')}${P('M-27-88Q-104-124-91-168Q-18-160-27-88M-42-134Q-74-204-22-224Q9-172-42-134M18-92Q-13-171 38-202Q71-143 18-92M39-157Q39-216 99-208Q88-157 39-157M47-78Q63-136 124-113Q101-67 47-78M-7-40Q-73-82-93-51Q-68-8-7-40','#456b59')}${P('M-29-90L-74-151M21-103l14-80M51-82l57-22','none','stroke="#8b9e75" stroke-width="2" opacity=".55"')}`);
}
function city(y=690,warm=false) {
  const buildings=[[-70,220,400],[145,155,295],[292,220,505],[504,165,343],[677,265,440],[947,160,318],[1115,232,510],[1356,201,386],[1565,220,473],[1797,197,327]];
  return buildings.map(([x,w,h],i)=>R(x,y-h,w,h,i%2?'#648480':'#54777b','opacity=".6"')+ Array.from({length:3},(_,j)=>R(x+22+(i%2?8:0),y-h+35+j*73,w-50,10,warm?'#d1bd86':'#94b0a9','opacity=".35"')).join('')).join('');
}
function cityClipped(x,y,w,h,warm=false) {
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden">${city(y+h,warm)}</svg>`;
}
function windowScene(warm=false) {
  return `${R(0,0,1920,1080,warm?'url(#warm)':'url(#room)')}${R(80,65,1770,645,'url(#'+(warm?'day':'night')+')')}${cityClipped(80,65,1770,645,warm)}${R(80,65,1770,645,'#9eccc3','opacity=".1"')}${P('M80 100L680 710H850L240 65Z','#f1f1d0','opacity=".08"')}${R(64,55,1792,20,'#3b5b5c')}${R(65,690,1790,26,'#3b5b5c')}${L(615,68,615,703,'#3b5b5c',18)}${L(1245,68,1245,703,'#3b5b5c',18)}${P('M0 732H1920V1080H0Z','url(#floor)')}${P('M0 850L1920 783M420 731L123 1080M1390 731L1697 1080','none','stroke="#b9c6af" stroke-width="2" opacity=".18"')}`;
}
function desk(x=840,y=592,width=640) {
  return `${P(`M${x} ${y}l${width} 0 68 47-${width+105} 0Z`,'#b6a785')}${P(`M${x-37} ${y+47}h${width+105}v27h-${width+105}Z`,'#756c58')}${P(`M${x-4} ${y+74}h27l-10 210h-22ZM${x+width-21} ${y+74}h26l20 210h-23Z`,'#40544f')}`;
}
function mug(x,y,s=1) {return G(`translate(${x} ${y}) scale(${s})`,`${P('M-24-28H24L20 28Q0 41-20 28Z',C.paper)}${P('M23-19Q54-26 48 3Q42 20 24 12','none','stroke="#d6d4b7" stroke-width="9"')}${E(0,-28,24,6,'#7c705e')}${P('M-11-43q-14-20 0-39M11-45q14-20 2-39','none','stroke="#efead2" stroke-width="4" opacity=".55" stroke-linecap="round"')}`);}
function document(x,y,w=130,h=180,angle=0,red=false) {
  return G(`translate(${x} ${y}) rotate(${angle})`,`${R(0,0,w,h,'url(#paper)')}${R(18,22,w*.53,7,red?C.rust:'#819187','opacity=".65"')}${Array.from({length:5},(_,i)=>R(18,46+i*19,w-(i%2?43:35),3,'#8d9687','opacity=".45"')).join('')}${red?P(`M${w-37} ${h-52}l15 16m0-16-15 16`,'none',`stroke="${C.rust}" stroke-width="5" stroke-linecap="round"`):''}`);
}
function rainGlass() {return Array.from({length:17},(_,i)=>{const x=112+(i*113)%1710,y=110+(i*89)%520;return P(`M${x} ${y}q-4 28-16 58`,'none','stroke="#c6ded6" stroke-width="2.4" opacity=".4"');}).join('');}
function floorForeground(warm=false) {return `${P('M0 990Q500 966 927 1000T1920 977V1080H0Z',warm?'#506b59':'#1c454c','opacity=".38"')}`;}

function make(mode) {
  if(!modes.includes(mode)) throw new Error(`Unknown modern scene: ${mode}`);
  let background='', subject='', foreground='';
  if(mode==='exam') {
    background=`${R(0,0,1920,1080,'url(#room)')}${R(80,118,538,380,'#a6b8aa')}${R(99,137,500,343,'url(#day)')}${L(348,138,348,480,'#658479',12)}${L(100,305,599,305,'#658479',12)}${P('M100 480L780 843 1100 842 597 476Z','url(#light)')}${R(787,88,1001,312,'#80998b','rx="5"')}${R(806,106,962,275,'#3e645b')}${P('M869 174h260m-260 30h339m-339 41h500','none','stroke="#bfceb4" stroke-width="3" opacity=".25"')}${R(0,693,1920,387,'url(#floor)')}${desk(161,632,418)}${desk(1432,612,319)}`;
    subject=`${seated(965,337,.99)}${desk(863,590,450)}${document(978,556,168,216,-17,true)}${P('M984 578q24-23 46-12l-3 26-37 7Z','url(#skin)')}${P('M1111 580q24-6 36 9l-19 20-31-9Z','url(#skin)')}${P('M1170 607l114-26 18 12-111 26Z','#687f7c')}${R(1296,560,30,54,'#ba9164')}${L(1306,563,1301,523,C.ink,5)}`;
    foreground=`${P('M0 861l292-30 212 79v170H0Z','#345554')}${P('M1524 834l396 74v172h-551Z','#47645c')}${floorForeground()}`;
  }
  if(mode==='jobloss') {
    background=`${R(0,0,1920,1080,'url(#room)')}${P('M0 0H558L709 777H0Z','#476e70')}${P('M558 0H1920V782H709Z','#96aaa0')}${R(1249,132,385,603,'#c6cec0')}${R(1273,151,337,563,'url(#glass)')}${R(1311,167,263,547,'#7f9c97','opacity=".45"')}${L(1439,161,1439,706,'#b8c8b8',11)}${R(1558,439,12,59,'#d4d0b1','rx="3"')}${P('M0 782H1920V1080H0Z','url(#floor)')}${P('M708 783L461 1080M1213 783L1439 1080','none','stroke="#c8cfb8" stroke-width="2" opacity=".3"')}${plant(1743,710,.85)}${R(118,202,213,270,'#244d55')}${R(130,215,187,245,'#9cb8b1','opacity=".7"')}`;
    subject=`${person(1015,283,1.04,'box')}${G('translate(1016 489)',`${P('M-146-53H140V81H-146Z','#b29d75')}${P('M-146-53l29-35 251 1 6 34Z','#cab58a')}${P('M-146-53l28 20 243 0 15-20Z','#9a805c')}${P('M-27-87l-5 54 47 0-8-54Z','#637c6f')}${plant(45,-34,.28)}${R(-107,-134,68,97,'#536c69')}${R(-96,-122,46,63,'#d7d4b8')}${P('M-146 16l41 8 7 17-49 13Z','url(#skin)')}${P('M142 15l-39 9-4 20 43 8Z','url(#skin)')}${R(-18,5,73,39,'#d7c6a5','opacity=".8"')}`)}`;
    foreground=`${P('M0 0h135v1080H0Z','#203f46','opacity=".74"')}${P('M1842 0h78v1080h-78Z','#1d4145','opacity=".6"')}${floorForeground()}`;
  }
  if(mode==='commute') {
    background=`${R(0,0,1920,1080,'url(#night)')}${city(717)}${P('M0 710H1920V1080H0Z','url(#floor)')}${P('M0 967l794-251h72L305 1080H0Z','#bed1c2','opacity=".18"')}${P('M1130 718h45l745 227v94Z','#d6d3b3','opacity=".18"')}${L(423,241,423,753,'#304f50',15)}${L(1453,163,1453,726,'#304f50',17)}${P('M417 248q80-47 146-10l-2 15H419Z','#829c8e')}${P('M1445 166q-85-55-161-8l4 17h158Z','#91a89a')}${E(527,257,39,7,'#e8d9a5')}${E(1312,177,39,7,'#e8d9a5')}${P('M244 899l265-66M369 971l309-85M1264 795l305 74','none','stroke="#c5d2b9" stroke-width="13" opacity=".34"')}${G('translate(393 433) scale(.57)',person(0,0,1,'still'))}${G('translate(1554 450) scale(.54)',person(0,0,1,'walk'))}`;
    subject=`${person(998,268,1.05,'strap')}${P('M882 406Q835 407 822 457l-17 185q48 40 112 8l11-185Z','#847b63')}${P('M850 448q8-60 48-46','none','stroke="#b8a988" stroke-width="14"')}${P('M835 491l59 10-7 93-63-8Z','#a89b7d','opacity=".48"')}${P('M858 270q145-102 289 3l-8 19q-141-44-277-4Z','#617d79')}${P('M864 270q45-126 139-130q94 8 144 133l-145-31Z','#8aa19a')}${P('M1003 141v483q0 33 27 31q24-3 17-32','none','stroke="#d2c19e" stroke-width="6"')}`;
    foreground=`${rainGlass()}${P('M0 820Q182 680 324 865L403 1080H0Z','#294e53','opacity=".8"')}${P('M1580 960Q1774 838 1920 901V1080h-421Z','#294b51','opacity=".8"')}`;
  }
  if(mode==='comments' || mode==='close-phone') {
    const off=mode==='close-phone';
    background=`${R(0,0,1920,1080,off?'url(#warm)':'url(#night)')}${R(82,65,570,650,'#809e99','opacity=".4"')}${R(103,84,529,611,off?'url(#day)':'url(#glass)')}${P('M102 91l529 595V84Z','#d1ddcc','opacity=".14"')}${L(365,86,365,695,'#506f6a',15)}${R(104,696,528,23,'#a5b5a2')}${P('M0 735H1920V1080H0Z','url(#floor)')}${P('M636 521q26-58 102-48h673q90-2 104 77v263H628Z','#687f70')}${R(677,520,366,196,'#839480','rx="42"')}${R(1065,520,397,196,'#738a79','rx="42"')}${plant(1740,745,.95)}`;
    subject=`${seated(879,307,1.05,off?'coffee':'desk',off?'calm':'low')}${G('translate(1224 477) rotate(-8)',`${R(-113,-240,226,406,'#233b3d','rx="27"')}${R(-100,-218,200,354,off?'#294e53':'#bfd1c4','rx="10"')}${R(-29,-231,58,7,'#91a79c','rx="3"')}${off?P('M-100-218L100 78V136h-14L-100-130Z','#d3e3cc','opacity=".06"'):`${E(-65,-166,14,14,'#899d8f')}${R(-39,-179,99,8,'#667e72')}${R(-39,-159,118,5,'#667e72','opacity=".6"')}${P('M-79-122h146v50H-45l-28 14 3-14h-9Z','#ece6d0')}${P('M-79-23h146v50H-39l-24 14 1-14h-17Z','#8faea0')}${P('M-79 75h146v43H-8l-23 13 1-13h-49Z','#dedfc7')}${P('M-62-103h110m-110 15h74M-62-4H48M-62 11H16M-62 94H51','none','stroke="#687d71" stroke-width="4" opacity=".6"')}${P('M62-185l12 11m0-11-12 11','none','stroke="#a96250" stroke-width="4"')}`}`)}${P(off?'M1178 667q-38-18-40-45l5-70q1-19 16-15l9 52 25 8 17-34q12-16 23-8l-14 52-15 38Z':'M1165 644q-28-20-23-53l14-71q4-16 16-9l-4 70 26-3 18-33q13-12 22-1l-12 48-27 54Z','url(#skin)')}`;
    foreground=`${P('M0 930Q733 971 1174 927T1920 967V1080H0Z','#2c514e','opacity=".45"')}${E(391,834,185,34,'#4b655c')}${mug(349,777,1.1)}`;
  }
  if(mode==='office' || mode==='coffee') {
    const warm=mode==='coffee';
    background=`${windowScene(warm)}${R(246,593,258,46,'#708778')}${L(271,638,268,836,'#506759',12)}${L(482,638,484,836,'#506759',12)}${plant(311,588,.62)}${P('M1798 128l-211 459h270V117Z','#dde2bd','opacity=".08"')}${E(1680,204,35,35,warm?'#f2dfaa':'#d2d4b8','opacity=".4"')}`;
    subject=`${seated(961,324,1.02,warm?'coffee':'desk',warm?'calm':'low')}${desk(827,607,623)}${G('translate(1131 583)',`${P('M-51-129h207l24 124H-25Z','#334e4d')}${P('M-40-119h188L166-19H-18Z',warm?'#9fb8ab':'#a4c3bb')}${P('M-43-89h154m-148 17h111m-107 18h133','none','stroke="#e8e9cf" stroke-width="4" opacity=".6"')}${P('M-25-5h205l58 33H-43Z','#80958a')}${P('M-2 2h160l25 14H-15Z','#4f6d63')}`)}${document(869,590,90,116,8)}${mug(warm?971:1364,warm?498:583,warm?.82:.85)}${warm?`${P('M1522 384Q1482 393 1436 472L1312 508l3 42 158-28q72-70 83-111Z','url(#coat)')}${P('M1316 507q-37-11-57 0l-21 28q0 11 17 11l27-16 35 20Z','url(#skin)')}${mug(1251,487,.85)}${P('M1523 316q56-26 111 12l51 144-6 347h-197l-3-360Z','#b8b396')}${head(1572,253,.78,'calm')}`:`${L(1482,587,1490,412,C.dark,11)}${L(1490,412,1370,372,C.dark,9)}${P('M1371 349l-66 45q35 47 92 9Z','#9eaa8a')}${P('M1315 390L1104 618H1474L1393 402Z','url(#light)')}`}`;
    foreground=`${P('M0 976h1920v104H0Z','#244a4b','opacity=".42"')}${R(172,817,355,188,'#335756','rx="14"')}${R(188,804,325,37,'#627e6d','rx="10"')}`;
  }
  if(mode==='debt') {
    background=`${R(0,0,1920,1080,'url(#room)')}${R(109,98,556,522,'#b1b9a6')}${R(131,120,512,478,'url(#night)')}${cityClipped(131,120,512,478)}${R(0,672,1920,408,'url(#floor)')}${R(1465,203,275,356,'#b3b99f')}${R(1490,226,228,305,'#4e6b60')}${P('M1516 497l68-122 104 102Z','#9baa89')}${plant(1719,755,.72)}${P('M0 0h62v812H0Z','#66817a')}`;
    subject=`${seated(1046,302,1.07)}${desk(654,595,829)}${document(704,597,174,206,-18,true)}${document(917,617,143,188,12,true)}${document(1187,598,175,189,-6,true)}${document(1328,595,119,153,17)}${G('translate(1130 634) rotate(8)',R(0,0,66,117,C.ink,'rx="6"')+R(7,9,52,32,'#9db099')+P('M12 55h43m-43 17h43m-43 17h43M23 50v48m17-48v48','none','stroke="#778c7b" stroke-width="6"'))}${P('M982 477q-14-50 8-92l19-28q17-8 22 6l-17 38 4 49Z','url(#skin)')}${P('M1001 436l-51 54 17 62 45-22 19-68Z','url(#coat)')}`;
    foreground=`${E(525,938,382,55,'#204348','opacity=".3"')}${P('M95 892l209-35 222 33-242 40Z','#ada589')}${P('M95 892v120l189 40V930Z','#747f6c')}${P('M284 930l242-40v108l-242 54Z','#8e9478')}${floorForeground()}`;
  }
  if(mode==='luxury') {
    background=`${R(0,0,1920,1080,'url(#night)')}${R(170,69,1599,711,'#5c746b')}${R(202,92,1536,659,'#b5b59c')}${R(244,133,680,581,'#dcd2ac')}${R(1024,133,673,581,'#c2c6ad')}${P('M245 133h678v582H245Z','#e9dec0','opacity=".25"')}${P('M510 139L319 704h449L651 139Z','url(#light)')}${R(486,494,277,220,'#657e70')}${P('M503 390h218l-6 117H509Z','#9d5b45')}${P('M548 392q0-103 61-106q63 3 65 105','none','stroke="#bd8965" stroke-width="11"')}${R(590,436,29,20,'#d2af73','rx="3"')}${P('M1251 424l-15 31 58 8 16-29Z','#335452')}${E(1275,443,39,39,'#bcaa79')}${E(1275,443,29,29,'#e7ddba')}${P('M1275 421v23l14 9','none','stroke="#5d7161" stroke-width="3"')}${R(1158,496,271,218,'#839583')}${R(0,782,1920,298,'url(#floor)')}${L(968,92,968,757,'#365950',26)}`;
    subject=`${person(1050,275,1.06,'phone')}${P('M1211 736l228-25 68 56-233 34Z','#dcd5af','opacity=".15"')}${P('M838 510q40-28 101-24v235q-41 24-99 1Z','#a89571')}${P('M857 513q1-64 29-62q31 2 28 46','none','stroke="#b9aa89" stroke-width="6"')}`;
    foreground=`${P('M264 99l648 651h94L401 94Z','#f1e9c6','opacity=".055"')}${L(170,776,1770,776,'#a8b697',6)}${floorForeground()}`;
  }
  if(mode==='burden') {
    background=`${R(0,0,1920,1080,'url(#night)')}${P('M0 484L520 313 872 446 1353 262 1920 477V772H0Z','#668682','opacity=".6"')}${P('M0 729L665 667 1195 597 1920 653V1080H0Z','url(#floor)')}${P('M0 997L935 623 1154 616 524 1080H0Z','#a7b4a0','opacity=".3"')}${P('M0 429Q548 639 1004 375T1920 324','none','stroke="#77928a" stroke-width="2" opacity=".5"')}${L(256,428,256,742,'#486664',11)}${L(1575,320,1575,711,'#486664',11)}${P('M0 885l777-179m-364 193 547-175','none','stroke="#b3bea8" stroke-width="2" opacity=".18"')}`;
    subject=`${G('translate(1045 327) rotate(14)',`${person(0,0,.96,'strap')}${P('M-112 52Q-178 69-192 165L-217 287Q-130 336-53 283L-42 127Z','#867c5e')}${P('M-109 48q18 100 56 175','none','stroke="#c0a47a" stroke-width="16"')}${P('M-178 154l112 24-3 65-128-5Z','#a08c69')}${P('M-184 96q55-17 133 42','none','stroke="#c0ab7e" stroke-width="5"')}${P('M-217 268l178 4 5 73q-87 30-187-4Z','#6f745d')}${P('M-142 82l-3 254M-78 121l-7 222','none','stroke="#b4a482" stroke-width="9"')}${P('M-174 36l-58 65 25 52 102-66Z','#ab9b77')}`)}${E(1041,836,227,32,'#1a4046','opacity=".3"')}`;
    foreground=`${P('M0 877q214-84 355 64l172 139H0Z','#3e625f')}${P('M1718 868l202-90v302h-377Z','#315853')}${floorForeground()}`;
  }
  if(mode==='steps') {
    background=`${R(0,0,1920,1080,'url(#day)')}${city(645,true)}${P('M0 850H640V750H870V665H1110V603H1370V540H1920V1080H0Z','url(#floor)')}${P('M0 850h640v30H0ZM640 750h230v29H640ZM870 665h240v28H870ZM1110 603h260v28h-260ZM1370 540h550v28h-550Z','#d3d1af')}${P('M0 880h640v89H0ZM640 779h230v91H640ZM870 693h240v92H870ZM1110 631h260v92h-260ZM1370 568h550v88h-550Z','#6f8b7d')}${L(351,791,351,624,'#6c8878',9)}${L(791,708,791,540,'#6c8878',9)}${L(1240,616,1240,451,'#6c8878',9)}${L(1668,530,1668,363,'#6c8878',9)}${P('M322 626L1710 341','none','stroke="#d1d1ae" stroke-width="12"')}${E(1597,191,155,155,'url(#glow)')}`;
    subject=`${G('translate(1040 217) scale(.95)',`${P('M-65 237l-9 93-57 111 40 20 81-114 12-85 18 65 75-13 19 96 41-8-11-126-91-11-4-35Z','url(#pants)')}${P('M-127 430l-20 29q18 19 63 16l-9-30Z',C.ink)}${P('M115 397l3 28q35 10 76-7q-5-16-46-16Z',C.ink)}${P('M-62 83q-45 22-45 92l-61 48 23 28 80-57 33-64Z','url(#coat)')}${P('M65 80q37 31 45 98l-25 20-28-59Z','url(#coat)')}${P('M-148 225l-30 13q-17 14-4 25q8 8 20 1l31-19Z','url(#skin)')}${P('M-28 64l-34 18-7 157q62 27 133 3L62 81 29 64 1 98Z','url(#coat)')}${P('M-25 66l26 32 28-32-9 38-33 0Z',C.paper)}${L(1,110,1,230,'#7a9a8a',2)}${head(0,0,1,'calm')}`)}`;
    foreground=`${P('M0 0h107v1080H0Z','#45695f','opacity=".35"')}${plant(1773,875,.95)}${P('M0 995q899-139 1920-20v105H0Z','#42695e','opacity=".25"')}`;
  }
  if(mode==='market') {
    background=`${R(0,0,1920,1080,'url(#warm)')}${P('M0 135L727 219V722H0Z','#b0b797')}${P('M1274 198L1920 127V728h-646Z','#9eaf94')}${R(159,270,346,349,'#7b9684')}${R(1431,246,328,364,'#6f8b7c')}${P('M0 712H1920V1080H0Z','url(#floor)')}${P('M610 728L391 1080M1371 723l242 357','none','stroke="#d1d1af" stroke-width="3" opacity=".28"')}${P('M0 171Q768 333 1920 154','none','stroke="#7c8f71" stroke-width="5"')}${Array.from({length:6},(_,i)=>E(247+i*282,226+Math.sin(i*.63)*45,13,17,'#e8c881')).join('')}${plant(162,694,.74)}`;
    subject=`${person(1056,288,1.03,'box','calm')}${P('M949 384l52-16 15 46 73 0 20-43 36 17-27 63 12 184-184 0 31-187Z','#b2a27c')}${P('M1000 503h83v71h-83Z','#8e9371')}${P('M656 582h804l45 50H615Z','#d6c699')}${P('M615 632h890v170H615Z','#8d9d77')}${P('M643 634v169m840-170v170','none','stroke="#426955" stroke-width="14"')}${P('M634 659h846v52H634Z','#c4bd90')}${R(682,694,131,96,'#a66e4d')}${R(848,695,246,96,'#bd9a63')}${E(1331,782,40,40,'#3e5b51')}${E(763,782,40,40,'#3e5b51')}${P('M708 94h706l91 93H615Z','#d0bb84')}${P('M615 187h890v25q-40 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-81 0-43 16-80 0Z','#ba8a58')}${L(656,201,656,630,'#8c7c5b',13)}${L(1459,201,1459,630,'#8c7c5b',13)}${P('M709 547h204l-13 61H721Z','#9b7b50')}${Array.from({length:7},(_,i)=>E(736+i*23,550-(i%2)*13,21,16,i%2?'#c9b56b':'#9ca65c')).join('')}${P('M1182 558h211l-11 51h-187Z','#9b7b50')}${Array.from({length:7},(_,i)=>E(1206+i*25,556-(i%2)*13,18,16,i%2?'#b77f55':'#d0a668')).join('')}${P('M1100 435q36 11 78 55l-12 27-92-42Z','url(#coat)')}${P('M1165 489l40-2q22 7 13 20l-39 18-17-17Z','url(#skin)')}${P('M1194 481l69 4 9 64-79-4Z','#d9c69a')}${P('M1204 488q5-37 32-34q23 0 20 33','none','stroke="#a58e61" stroke-width="4"')}${P('M1642 466l-270 18-90 24 7 33 116-4 237 15Z','#c0c0a2')}${P('M1288 508q-30-7-42 4l-12 21q3 13 18 9l40-5Z','url(#skin)')}`;
    foreground=`${P('M0 890q164-63 357 5l133 185H0Z','#5a7b61','opacity=".6"')}${plant(1755,879,1.05)}${floorForeground(true)}`;
  }
  if(mode==='window') {
    background=`${R(0,0,1920,1080,'url(#room)')}${R(588,58,1096,748,'#364f4d')}${R(613,83,1048,698,'url(#day)')}${cityClipped(613,83,1048,698,true)}${R(584,779,1105,41,'#a8b197')}${L(1127,82,1127,781,'#47675c',23)}${L(615,421,1657,421,'#47675c',18)}${P('M0 821H1920V1080H0Z','url(#floor)')}${P('M488 33Q381 259 463 800l123 41 58-52Q578 333 629 41Z','#a2ad92')}${P('M1711 38q91 231 65 779l-105 37-59-61q79-426 40-752Z','#b1b598')}${L(523,78,529,744,'#d5d4b4',4,'opacity=".4"')}${L(1706,88,1719,765,'#d5d4b4',4,'opacity=".4"')}${P('M800 770L1699 1080h221V909L1311 770Z','url(#light)')}`;
    subject=`${person(1069,276,1.02,'phone','calm')}${P('M978 367q39-43 81-42q44-4 76 33l-18 63-125 3Z','url(#coat)')}${P('M1021 456l86-19 32 38-27 25-94-10Z','url(#skin)')}${mug(1085,451,.94)}${E(1445,157,216,198,'url(#glow)')}`;
    foreground=`${rainGlass()}${plant(367,864,1.12)}${E(1464,901,189,22,'#6d7f61')}${P('M1294 894h343l-18 134h-305Z','#7b8866')}${floorForeground(true)}`;
  }
  if(mode==='old-photo') {
    background=`${R(0,0,1920,1080,'url(#warm)')}${R(63,107,526,571,'#96af9d')}${R(85,128,483,527,'url(#day)')}${L(330,129,330,656,'#5f8070',13)}${P('M587 683L1614 1080H1920V833L1042 654Z','url(#light)')}${R(1496,140,290,478,'#7a8d74')}${R(1514,157,254,33,'#cccfac')}${R(1514,306,254,13,'#b1b792')}${R(1514,442,254,13,'#b1b792')}${P('M1534 303V222h24v81m18 0V208h19v95m19 0V228h29v75m27 0V220h25v83','none','stroke="#bcc0a0" stroke-width="13"')}${R(0,718,1920,362,'url(#floor)')}${plant(1698,714,.55)}`;
    subject=`${seated(962,335,1.01,'desk','calm')}${desk(706,596,750)}${G('translate(1096 414) rotate(8)',`${R(-124,-113,248,244,'#e8dfc0')}${R(-109,-97,218,181,'#9aaa8b')}${P('M-109 20L-17-58 109 13V84h-218Z','#6d8d78')}${P('M-109 60L4-7 109 29V84h-218Z','#809a75')}${G('translate(-28 -4) scale(.2)',person(0,0,1,'still','calm'))}${G('translate(47 10) scale(.16)',person(0,0,1,'still','calm'))}${R(-67,105,132,4,'#a9ac91','opacity=".5"')}`)}${P('M982 527q26-26 40-17l13 18-17 17-37 7Z','url(#skin)')}${P('M1189 537q25-19 40-5l-4 27-43 1Z','url(#skin)')}${document(748,610,117,131,-9)}${mug(1379,589,.82)}`;
    foreground=`${P('M144 915l343-33 116 90-357 72Z','#748566')}${P('M246 1044v36H130l14-165Z','#4b6a58')}${floorForeground(true)}`;
  }
  if(mode==='relief') {
    background=`${R(0,0,1920,1080,'url(#warm)')}${E(1357,318,680,615,'url(#glow)')}${P('M0 798Q485 647 831 747T1920 638V1080H0Z','#8ba087')}${P('M0 957Q827 789 1920 935V1080H0Z','#557b65')}${P('M177 0q38 418-45 811','none','stroke="#5c765d" stroke-width="35"')}${P('M148 246q177-97 341-248M157 466q-61-139-155-178','none','stroke="#5c765d" stroke-width="15"')}${P('M0 0H681Q611 159 423 159Q187 293 0 231Z','#769774')}${P('M0 12Q387 6 516 67Q215 185 0 122Z','#a1b090','opacity=".7"')}`;
    subject=`${G('translate(1046 419) scale(2.06)',`${P('M-43 65l-65 21q-63 45-71 177h359q-3-128-84-176L35 63 1 95Z','url(#coat)')}${P('M-40 64l42 32 35-31-14 57-47-1Z','#d8d8b8')}${P('M-47 71l-17 36 46 56 20-66M37 69l33 39-50 50-18-61','none','stroke="#6f9584" stroke-width="3"')}${L(2,127,2,259,'#6d9786',2.5)}${head(0,0,1,'calm')}`)}${P('M1181 568Q1278 672 1250 835','none','stroke="#d8d2a5" stroke-width="4" opacity=".16"')}`;
    foreground=`${P('M0 694q173-72 338 48q-63 4-150 72q-84-78-188-47Z','#3e6b56','opacity=".75"')}${P('M1555 236q109-83 365-36v99q-179-71-365-63Z','#719068','opacity=".55"')}${floorForeground(true)}`;
  }
  if(mode==='city-dawn') {
    background=`${R(0,0,1920,1080,'url(#day)')}${E(1344,238,322,313,'url(#glow)')}${E(1344,238,77,77,'#efdab0')}${city(727,true)}${P('M0 697Q764 673 1920 710V1080H0Z','#98aa90')}${P('M0 771Q550 688 1160 750T1920 798V1080H0Z','url(#floor)')}${P('M684 747Q989 896 1305 1080H1873Q1514 835 969 744Z','#bdc5a7')}${P('M942 755Q1246 850 1561 1080','none','stroke="#e3d9b0" stroke-width="4"')}${P('M0 669Q503 731 887 667M1192 695q341 83 728-6','none','stroke="#dce0bc" stroke-width="4" opacity=".35"')}`;
    subject=`${person(1050,363,.83,'walk','calm')}${P('M1084 455q-20-34-47-7l-48 150 42 20 60-115Z','#c4b38a')}${P('M944 577q40-18 79 10l-5 112-95-14Z','#b29e75')}${P('M951 580q8-54 42-42','none','stroke="#d8c39a" stroke-width="8"')}${E(1172,867,264,26,'#eddcaa','opacity=".18"')}`;
    foreground=`${P('M0 0q110 113 196 397l-33 361-54 94 9-451Q68 173 0 114Z','#456d57')}${P('M0 9q281-35 564 87-129 18-288 36Q169 266 0 216Z','#7b9a74')}${P('M0 39q224-45 453 36-261-1-453 83Z','#a1b38a','opacity=".75"')}${P('M0 854q190-43 358 45t344 52v129H0Z','#688965')}${plant(1753,925,1.05)}${floorForeground(true)}`;
  }
  return {background:wrap(background), subject:wrap(subject), foreground:wrap(foreground)};
}

module.exports = {modes, make};
