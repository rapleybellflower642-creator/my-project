import React from 'react';
import {getLength} from '@remotion/paths';
import {Artifact, GOLD, WHITE, RED, clamp, out, type SceneProps} from '../Common';

// Each local shot begins with a fully readable subject. Motion is a physical
// action inside that shot, while the parent timeline supplies the hard cut.
// librsvg does not normalize dash units with SVG pathLength. Resolve the
// intended proportions into pixels before either native or browser rendering.
const DashPath=({d,dash,offset=0,...props}:React.SVGProps<SVGPathElement>&{d:string;dash:readonly number[];offset?:number})=>{
 const length=getLength(d);
 return <path {...props} d={d} strokeDasharray={dash.map(value=>value*length).join(' ')} strokeDashoffset={offset*length}/>;
};
const Ink=({children,x,y,size=76,fill=GOLD,anchor='start',opacity=1,spacing=2}:{children:React.ReactNode;x:number;y:number;size?:number;fill?:string;anchor?:'start'|'middle'|'end';opacity?:number;spacing?:number})=><text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} opacity={opacity} letterSpacing={spacing}>{children}</text>;
const Traced=({d,t,delay=0,width=3,color=GOLD,opacity=1}:{d:string;t:number;delay?:number;width?:number;color?:string;opacity?:number})=><DashPath d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" dash={[1]} offset={1-(.12+.88*out((t-delay)/.6))} opacity={opacity}/>;
const RainField=({t,x=80,y=70,w=1760,h=800,count=94,gold=false}:{t:number;x?:number;y?:number;w?:number;h?:number;count?:number;gold?:boolean})=><g>{Array.from({length:count},(_,i)=>{const px=x+((i*151.87+t*37)%w),py=y+((i*93.71+t*(310+i%4*43))%h);return <line key={i} x1={px} y1={py} x2={px-16-i%4*2} y2={py+33+i%5*7} stroke={gold||i%7===0?GOLD:'#9aafb4'} strokeWidth={i%3?1.8:2.8} opacity={i%3?.3:.62}/>;})}</g>;
const Spark=({x,y,r=5,opacity=1}:{x:number;y:number;r?:number;opacity?:number})=><g opacity={opacity}><circle cx={x} cy={y} r={r*3.2} fill={GOLD} opacity=".1"/><circle cx={x} cy={y} r={r} fill="#fff0bc"/><path d={`M${x-r*2.4} ${y}h${r*4.8}M${x} ${y-r*2.4}v${r*4.8}`} stroke={GOLD} strokeWidth="1.1" opacity=".75"/></g>;
const Ring=({x,y,t,r=50}:{x:number;y:number;t:number;r?:number})=><g fill="none" stroke={GOLD}>{[0,1,2].map(i=><ellipse key={i} cx={x} cy={y} rx={r*(1+i*.4)+out(t/.65)*70} ry={r*.22*(1+i*.4)+out(t/.65)*16} strokeWidth={2.6-i*.6} opacity={(.7-i*.13)*(1-.55*clamp(t/2.6))}/>)}</g>;
const ContentClip=({id,children}:{id:string;children:React.ReactNode})=><g><defs><clipPath id={id}><rect x="45" y="65" width="1830" height="850" rx="0"/></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></g>;

export const Who=({shot,t,duration}:SceneProps)=>{
 const p=clamp(t/duration);
 if(shot===0)return <ContentClip id="p-who-fibres">
  <Artifact kind="cloak" x={1190-110*out(t/.65)} y={825-45*p} size={1980} angle={-9+4*p}/>
  <RainField t={t} count={114}/>
  <g transform={`translate(${32*(1-out(t/.22))} 0)`}>
   <Ink x={135} y={215} size={58} fill={WHITE}>风雨，仍在落下。</Ink>
   <Ink x={135} y={365} size={126}>一身烟雨</Ink>
   <path d="M141 417H590" stroke={GOLD} strokeWidth="3"/>
  </g>
  {[0,1,2,3].map(i=><g key={i} opacity={1-clamp(((t+i*.21)%.9)/.9)}><Spark x={906+i*145} y={470+i*73} r={4}/><path d={`M${906+i*145} ${470+i*73}l-32 -27m32 27l37 -19`} stroke={GOLD} strokeWidth="2.3" fill="none"/></g>)}
 </ContentClip>;
 if(shot===1){const punch=1+.13*Math.exp(-t*12)*Math.cos(t*20);return <ContentClip id="p-who-impact">
  <RainField t={t} count={96}/>
  <Artifact kind="cloak" x={1380+35*p} y={475} size={1240} angle={8-6*out(t/.3)}/>
  <g transform={`translate(650 480) scale(${punch}) translate(-650 -480)`}>
   <Ink x={660} y={565} size={270} anchor="middle" fill="#f0dca7">谁怕？</Ink>
  </g>
  <path d="M165 692Q610 727 1085 686" fill="none" stroke={GOLD} strokeWidth="4"/>
  <Ink x={170} y={790} size={48} fill={WHITE}>雨再大，脚步也不退。</Ink>
  <g opacity={1-clamp(t/.55)}><path d="M495 180L395 110M1165 258l150 -61M1140 735l120 87" stroke={GOLD} strokeWidth="4"/><ellipse cx="730" cy="472" rx={450+200*out(t/.45)} ry={310+100*out(t/.45)} fill="none" stroke={GOLD} strokeWidth="2.8"/></g>
 </ContentClip>;}
 if(shot===2)return <ContentClip id="p-who-cloak">
  <RainField t={t} count={126}/>
  <Artifact kind="cloak" x={710-25*p} y={480} size={1250} angle={-5+4*p}/>
  <path d="M380 700Q800 875 1530 651" fill="none" stroke={GOLD} strokeWidth="3.5"/>
  <Ink x={1085} y={320} size={96} fill={WHITE}>一蓑</Ink>
  <Ink x={1065} y={528} size={172}>烟雨</Ink>
  <Traced d="M1082 590Q1370 617 1725 575" t={t} width={4}/>
  <Ink x={1090} y={722} size={43} fill={WHITE}>接住此刻的风雨。</Ink>
  {[0,1,2,3,4].map(i=><path key={i} d={`M${270+i*25} ${190+i*35}Q${180+i*14} 420 ${260+i*30} ${730+i*18}`} fill="none" stroke={GOLD} opacity={.27+i*.07} strokeWidth="2.1"/>)}
 </ContentClip>;
 const q=out(t/.45);return <ContentClip id="p-who-accept">
  <RainField t={t} count={116}/>
  <Artifact kind="cloak" x={550-25*p} y={555} size={1010} angle={-5}/>
  <g><Ink x={880} y={330} size={166}>任平生</Ink><Ink x={896} y={431} size={46} fill={WHITE}>有晴有雨，都走下去。</Ink></g>
  <path d="M160 790C600 890 735 630 1050 615S1510 660 1770 290" fill="none" stroke={GOLD} strokeWidth="4"/>
  <path d="M160 814C600 914 735 654 1050 639S1510 684 1770 314" fill="none" stroke={GOLD} strokeWidth="1.6" opacity=".4"/>
  {[0,1,2,3,4,5,6].map(i=>{const a=clamp((t-.16*i)/.4);return <Spark key={i} x={820+i*145} y={625-i*i*6.8} r={4.6} opacity={.25+.75*a}/>;})}
  <Ink x={1020} y={800} size={36} fill={WHITE} opacity={q}>从容，是带着风雨向前。</Ink>
 </ContentClip>;
};

export const Cold=({shot,t,duration}:SceneProps)=>{
 const p=clamp(t/duration);
 if(shot===0)return <ContentClip id="p-cold-macro">
  <Artifact kind="cup" x={1020+60*p} y={590-20*p} size={1730} index={p*2}/>
  <Ink x={135} y={162} size={62}>料峭春风吹酒醒</Ink>
  <g fill="none" stroke="#f0d8a4" strokeWidth="3.2" opacity=".65">{[0,1,2,3,4].map(i=><path key={i} d={`M${815+i*80} 500C${770+i*80+Math.sin(t*3+i)*20} 420 ${890+i*60} 338 ${835+i*80} 269S${852+i*65+Math.sin(t*2+i)*30} 181 ${830+i*70} 118`}/>)}</g>
  <Ring x={1020} y={831} t={t} r={290}/>
 </ContentClip>;
 if(shot===1)return <ContentClip id="p-cold-wind">
  <Artifact kind="cup" x={1320} y={630} size={1270} angle={2} index={3}/>
  <Ink x={150} y={440} size={205} fill="#d4e0df">微冷</Ink>
  <Ink x={170} y={560} size={47} fill={WHITE}>酒醒，风入怀。</Ink>
  {Array.from({length:9},(_,i)=><DashPath key={i} d={`M${-50+t*90} ${230+i*63}C410 ${100+i*68} 960 ${430+i*31} 1930 ${220+i*64}`} fill="none" stroke={i%3?'#a6bdc5':WHITE} strokeWidth={i%3?2:3.2} opacity={i%3?.33:.57} dash={[.28,.72]} offset={-.36-t*.34-i*.035}/>)}
  {[0,1,2,3,4].map(i=><path key={i} d={`M${1180+i*56} 563C${1260+i*65} 467 ${1440+i*30} 420 ${1730+i*28} ${349+i*27}`} fill="none" stroke={WHITE} strokeWidth="2.4" opacity=".45"/>)}
 </ContentClip>;
 if(shot===2)return <ContentClip id="p-cold-human">
  <Artifact kind="cup" x={600} y={620} size={1380} index={5-p}/>
  <g transform={`translate(0 ${15*(1-out(t/.18))})`}><Ink x={1040} y={250} size={92} fill={WHITE}>他也会冷。</Ink><Ink x={1040} y={402} size={92}>也会疲惫。</Ink><Ink x={1040} y={555} size={92} fill={WHITE}>也会迷茫。</Ink></g>
  <path d="M1015 620H1750" stroke={GOLD} strokeWidth="3"/>
  <Ink x={1040} y={727} size={45}>从容，不等于无所感觉。</Ink>
  {[0,1,2,3].map(i=><path key={i} d={`M${380+i*70} 580C${355+i*70} 455 ${470+i*61+Math.sin(t*2+i)*25} 369 ${420+i*70} 300`} fill="none" stroke={GOLD} strokeWidth="2.3" opacity={.3+i*.08}/>)}
  <ellipse cx="600" cy="842" rx="390" ry="25" fill="none" stroke={GOLD} opacity=".4" strokeWidth="2"/>
 </ContentClip>;
 return <ContentClip id="p-cold-reflection">
  <Artifact kind="cup" x={965} y={700} size={2100} index={6}/>
  <ellipse cx="966" cy="574" rx={114+out(t/.4)*35} ry="26" fill="#f0c572" opacity={.2+.55*out(t/.6)}/>
  <ellipse cx="966" cy="574" rx="298" ry="59" fill="none" stroke={GOLD} strokeWidth="3" opacity=".65"/>
  <path d="M1560 110L1030 548M1603 150L1080 571M1518 68L978 524" stroke={GOLD} strokeWidth="3" opacity={.48+.25*Math.sin(t*1.4)} />
  <Spark x={1000+30*p} y={555} r={11}/>
  <Ink x={145} y={178} size={67}>微冷时，一束光来了。</Ink>
 </ContentClip>;
};

const Ridge=({t,full=false}:{t:number;full?:boolean})=><g>{Array.from({length:7},(_,i)=>{const y=480+i*51;return <DashPath key={i} d={`M70 ${y+170}L310 ${y+90}L510 ${y+140}L765 ${y-95}L1010 ${y+8}L1240 ${y-210}L1500 ${y-53}L1850 ${y+44}`} fill="none" stroke={GOLD} strokeWidth={i===0?4:1.9} opacity={full?.7-i*.065:.8-i*.085} dash={[1]} offset={.09*(1-out(t/.4))}/>;})}</g>;
export const Sun=({shot,t,duration}:SceneProps)=>{
 const p=clamp(t/duration);
 if(shot===0)return <ContentClip id="p-sun-emerge">
  <defs><radialGradient id="p-sun-disc"><stop stopColor="#fff2bd"/><stop offset=".86" stopColor="#d4a955"/><stop offset="1" stopColor="#a27c38"/></radialGradient></defs>
  <circle cx="1280" cy={367-95*out(t/.45)} r="171" fill="url(#p-sun-disc)"/>
  {[0,1,2,3,4].map(i=><circle key={i} cx="1280" cy={367-95*out(t/.45)} r={184+i*24} fill="none" stroke={GOLD} strokeWidth="1.8" opacity={.4-i*.055}/>)}
  <path d="M70 650L310 570L510 620L765 385L1010 488L1240 270L1500 427L1850 524V915H70Z" fill="#0a1012"/>
  <Ridge t={t}/>
  <Ink x={140} y={207} size={59} fill={WHITE}>雨后，抬头。</Ink>
  <Ink x={140} y={345} size={110}>斜照相迎</Ink>
 </ContentClip>;
 if(shot===1)return <ContentClip id="p-sun-rays">
  <circle cx="1605" cy="225" r="94" fill="#e6c780"/>
  {[0,1,2,3,4,5,6].map(i=><g key={i}><path d={`M1605 225Q${1050-i*50} ${240+i*80} ${170+i*140} ${855-i*20}`} fill="none" stroke={GOLD} strokeWidth={i===3?5:2.4} opacity={.75-i*.045}/><DashPath d={`M1605 225Q${1050-i*50} ${240+i*80} ${170+i*140} ${855-i*20}`} fill="none" stroke="#fff0bd" strokeWidth="5" dash={[.025,.975]} offset={-(.06+t*.4+i*.07)%1}/></g>)}
  <Ink x={135} y={215} size={61} fill={WHITE}>山头的光</Ink>
  <Ink x={135} y={387} size={160}>正向你来</Ink>
  <path d="M150 733L440 650L720 720L1020 600L1380 681L1770 581" fill="none" stroke={GOLD} strokeWidth="3.5"/>
  <path d="M150 796L440 713L720 783L1020 663L1380 744L1770 644" fill="none" stroke={GOLD} strokeWidth="1.7" opacity=".5"/>
 </ContentClip>;
 if(shot===2)return <ContentClip id="p-sun-drops">
  <Ink x={140} y={198} size={71}>刚才的雨，也会反光。</Ink>
  {Array.from({length:74},(_,i)=>{const z=i%11,x=200+(i*127.87)%1500,y=300+(i*67.33)%535,a=out((t-.1-z*.015)/.55);return <g key={i}><line x1={x-12*(1-a)} y1={y-28*(1-a)} x2={x} y2={y} stroke="#b2bfc1" strokeWidth={2.3} opacity={1-a}/><Spark x={x+65*a} y={y-32*a+Math.sin(t*1.8+i)*5} r={3+(i%4)} opacity={a*.8}/></g>;})}
  <path d="M155 845C480 440 1100 920 1770 280" fill="none" stroke={GOLD} strokeWidth="3.2"/>
  <Ink x={950} y={475} size={111} fill={WHITE}>冷暖之间</Ink>
  <Ink x={1055} y={615} size={88}>仍有温柔</Ink>
 </ContentClip>;
 return <ContentClip id="p-sun-verse">
  <path d="M95 750Q800 -80 1810 650" fill="none" stroke={GOLD} strokeWidth="4"/>
  {[0,1,2,3].map(i=><path key={i} d={`M95 ${775+i*23}Q800 ${-55+i*48} 1810 ${675+i*23}`} fill="none" stroke={GOLD} strokeWidth="1.7" opacity={.5-i*.08}/>)}
  <circle cx={1500-45*p} cy={350-15*p} r="117" fill="#dcc080" opacity=".9"/>
  <Ink x={125} y={510} size={111} fill={WHITE}>山头斜照却相迎</Ink>
  <Ink x={140} y={645} size={49}>这场风雨，从来不是全部。</Ink>
  {[0,1,2,3,4].map(i=><Spark key={i} x={270+i*310} y={740-130*Math.sin(i*.65)} r={5.2} opacity={.45+.4*Math.sin(t*2+i)**2}/>)}
  <path d="M140 855Q940 797 1780 838" fill="none" stroke={GOLD} strokeWidth="2.5"/>
 </ContentClip>;
};

export const Return=({shot,t,duration}:SceneProps)=>{
 const p=clamp(t/duration);
 if(shot===0)return <ContentClip id="p-return-time">
  <g transform={`translate(${-70*p} ${25*p})`}>
   <path d="M155 785C350 810 650 595 850 505S1260 420 1760 195" fill="none" stroke={GOLD} strokeWidth="3.6"/>
   <Artifact kind="scroll" x={420} y={628} size={890} angle={-14}/>
   <Artifact kind="seal" x={1040} y={465} size={800} index={9} angle={5}/>
   <RainField t={t} x={1390} y={110} w={380} h={340} count={29}/>
   <Ink x={230} y={840} size={42}>1079 · 因诗入狱</Ink>
   <Ink x={855} y={760} size={42}>1080 · 贬谪黄州</Ink>
   <Ink x={1390} y={560} size={42}>1082 · 沙湖风雨</Ink>
  </g>
  <Ink x={140} y={193} size={130}>回首</Ink>
  <Ink x={460} y={190} size={43} fill={WHITE}>把来路，看清。</Ink>
  <DashPath d="M1660 200C1400 380 1100 410 850 505S350 810 155 785" fill="none" stroke="#fff0bd" strokeWidth="6" dash={[.06,.94]} offset={-clamp(t/.9)}/>
 </ContentClip>;
 if(shot===1)return <ContentClip id="p-return-route">
  <Ink x={135} y={200} size={98}>回首向来萧瑟处</Ink>
  <path d="M145 730C220 820 315 825 390 755S650 350 825 486S1210 775 1398 643S1640 590 1760 380" fill="none" stroke={GOLD} strokeWidth="4.3"/>
  <path d="M145 750C220 840 315 845 390 775S650 370 825 506S1210 795 1398 663S1640 610 1760 400" fill="none" stroke={GOLD} strokeWidth="1.7" opacity=".45"/>
  {/* A single travelling glint retraces the entire route throughout this shot. */}
  <DashPath d="M145 730C220 820 315 825 390 755S650 350 825 486S1210 775 1398 643S1640 590 1760 380" fill="none" stroke={GOLD} strokeWidth="18" strokeLinecap="round" opacity=".2" dash={[.075,.925]} offset={-(.925-.89*p)}/>
  <DashPath d="M145 730C220 820 315 825 390 755S650 350 825 486S1210 775 1398 643S1640 590 1760 380" fill="none" stroke="#fff0bd" strokeWidth="6.5" strokeLinecap="round" opacity=".95" dash={[.075,.925]} offset={-(.925-.89*p)}/>
  <DashPath d="M145 730C220 820 315 825 390 755S650 350 825 486S1210 775 1398 643S1640 590 1760 380" fill="none" stroke="#fff9df" strokeWidth="14" strokeLinecap="round" dash={[.003,.997]} offset={-(.925-.89*p)}/>
  <g><circle cx="390" cy="755" r="15" fill={RED}/><Ink x={280} y={662} size={60} fill={WHITE}>入狱</Ink><Ink x={280} y={870} size={36}>乌台诗案</Ink></g>
  <g><circle cx="825" cy="486" r="15" fill={GOLD}/><Ink x={690} y={418} size={60} fill={WHITE}>贬谪</Ink><Ink x={772} y={615} size={36}>黄州躬耕</Ink></g>
  <g><circle cx="1398" cy="643" r="15" fill={GOLD}/><Ink x={1325} y={557} size={60} fill={WHITE}>风雨</Ink><Ink x={1310} y={774} size={36}>沙湖道中</Ink></g>
 </ContentClip>;
 if(shot===2)return <ContentClip id="p-return-release">
  <g opacity={.72-.35*out(t/.8)}>{Array.from({length:12},(_,i)=><DashPath key={i} d={`M${100+i*11} ${155+i*51}C${580+i*15} ${180+i*47} ${800+i*20} ${740-i*19} 1770 ${300+i*39}`} fill="none" stroke={i%4===0?RED:GOLD} strokeWidth={i%3===0?2.7:1.7} dash={[.09+.4*(1-out(t/.85)),.035]} offset={-t*.17-i*.01}/> )}</g>
  <g transform={`translate(${35*(1-out(t/.18))} 0)`}><Ink x={235} y={565} size={256} fill="#eee3c3">归去</Ink></g>
  <Ink x={1000} y={445} size={66}>雨，留在身后。</Ink>
  <Ink x={1000} y={563} size={66} fill={WHITE}>人，继续向前。</Ink>
  <path d="M1020 657H1750" stroke={GOLD} strokeWidth="4"/>
  <Spark x={1040+650*out(t/1.1)} y={657} r={8}/>
 </ContentClip>;
 return <ContentClip id="p-return-present">
  <g opacity=".45"><Ink x={140} y={340} size={52}>入狱</Ink><Ink x={310} y={700} size={46}>贬谪</Ink><Ink x={580} y={234} size={48}>风雨</Ink>
   {[0,1,2,3,4,5].map(i=><DashPath key={i} d={`M${120+i*110} ${220+i%3*220}C530 ${300+i*60} 720 ${440+i*27} 1035 610`} fill="none" stroke={GOLD} strokeWidth="2" dash={[.012,.025]} offset={t*.08}/>)}
  </g>
  <circle cx="1055" cy="610" r={54+20*out(t/.25)} fill="none" stroke={GOLD} strokeWidth="3"/>
  <Spark x={1055+out(t/.5)*30} y={610} r={12}/>
  <path d="M1112 610C1310 615 1440 375 1770 365" fill="none" stroke={GOLD} strokeWidth="4"/>
  <Ink x={965} y={300} size={118} fill={WHITE}>此刻</Ink>
  <Ink x={1005} y={784} size={60}>不再被过往牵住。</Ink>
  <DashPath d="M1112 610C1310 615 1440 375 1770 365" fill="none" stroke="#fff5ce" strokeWidth="6" dash={[.055,.945]} offset={-clamp(t/1.5)}/>
 </ContentClip>;
};

export const Ending=({shot,t,duration}:SceneProps)=>{
 const p=clamp(t/duration);
 if(shot===0)return <ContentClip id="p-ending-converge">
  <Ink x={145} y={207} size={64}>风雨与晴，都经过。</Ink>
  <Ink x={180} y={450} size={76} fill={WHITE}>风雨</Ink><Ink x={180} y={760} size={76}>晴</Ink>
  <path d={`M420 440C750 ${90+out(t/.85)*270} 1070 ${600-out(t/.85)*60} 1450 570H1780`} fill="none" stroke="#adc1c4" strokeWidth="4"/>
  <path d={`M420 740C750 ${930-out(t/.85)*180} 1070 ${540+out(t/.85)*30} 1450 570H1780`} fill="none" stroke={GOLD} strokeWidth="4"/>
  <path d="M1450 570H1780" stroke="#f4ddaa" strokeWidth="6"/>
  <Spark x={1450+270*out(t/1.3)} y={570} r={12}/>
  {[0,1,2].map(i=><circle key={i} cx="1450" cy="570" r={35+i*27+20*p} fill="none" stroke={GOLD} strokeWidth="1.8" opacity={.5-i*.11}/>)}
  <Ink x={1110} y={832} size={49} fill={WHITE}>留下的，是从容。</Ink>
 </ContentClip>;
 if(shot===1)return <ContentClip id="p-ending-verse">
  <path d="M115 705Q600 328 960 613T1810 420" fill="none" stroke={GOLD} strokeWidth="3.7" opacity=".65"/>
  <path d="M115 740Q600 363 960 648T1810 455" fill="none" stroke={GOLD} strokeWidth="1.7" opacity=".34"/>
  <Ink x={960} y={435} size={148} anchor="middle" fill={WHITE}>也无风雨</Ink>
  <Ink x={960} y={642} size={148} anchor="middle">也无晴</Ink>
  <Ink x={960} y={837} size={43} anchor="middle" fill={WHITE}>外面的天气，不再决定心里的方向。</Ink>
  <Spark x={1350+320*p} y={535-85*p} r={8}/>
 </ContentClip>;
 return <ContentClip id="p-ending-point">
  <Ink x={960} y={335} size={72} anchor="middle" fill={WHITE}>风雨难定</Ink>
  <Ink x={960} y={510} size={143} anchor="middle">心，可以安顿。</Ink>
  <path d="M190 710Q610 699 960 710T1730 710" fill="none" stroke={GOLD} strokeWidth="3.4"/>
  <Spark x={300+1320*out(t/1.4)} y={708} r={10}/>
  <Ink x={960} y={851} size={48} anchor="middle" fill={WHITE}>稳住脚步，好好走下去。</Ink>
 </ContentClip>;
};
