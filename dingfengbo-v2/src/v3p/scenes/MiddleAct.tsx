import React from 'react';
import {Artifact, GOLD, WHITE, MUTED, RED, clamp, smooth, out, mix, beatPulse} from '../Common';
import type {SceneProps} from '../Common';
import {snap, settle, line, Label, RainStrokes, Ripple, Umbrella, Footprint, BeamDot, Leaf, TearShards, Routes} from './MiddlePrimitives';

const route=(p:number)=>({x:120+1650*p,y:800-490*p+70*Math.sin(p*Math.PI*2)});
const routeLine=line(Array.from({length:90},(_,i)=>route(i/89)));

/** Four real cuts: canopy macro → travelling plan → rupture → steady route. */
export const Rain:React.FC<SceneProps>=({shot,t,global})=>{
 const pulse=beatPulse(global);
 if(shot===0)return <g>
   <RainStrokes t={t} count={54} opacity={.65}/>
   <g transform={`translate(${(1-settle(t))*-30} 0)`}><Umbrella x={690} y={420} size={1.13} angle={-18+3*out(t/.6)}/></g>
   <path d="M1210 695Q1450 685 1660 490" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="8 13" opacity=".7"/>
   <Label x={1280} y={190} size={40} color={WHITE}>1082 · 三月七日</Label>
   <Label x={1300} y={350} size={94}>沙湖</Label><Label x={1400} y={455} size={94}>道中</Label>
   <Label x={1270} y={805} size={48} color={WHITE}>一场突如其来的雨</Label>
   <Ripple x={800} y={360} t={t} delay={.18} scale={1.1}/><Ripple x={380} y={500} t={t} delay={.63} scale={.7}/>
 </g>;
 if(shot===1){
   const leave=out((t-.18)/.62),walk=route(.25+clamp(t/3)*.15);
   return <g>
     <Label x={130} y={165} size={89}>雨具先去</Label>
     <Label x={134} y={225} size={36} color={WHITE}>带着雨具的人，已经走在前面。</Label>
     {[0,1,2,3].map(i=><path key={i} d={routeLine} transform={`translate(0 ${i*18})`} fill="none" stroke={i===0?GOLD:MUTED} strokeWidth={i===0?5:2} opacity={i===0?.9:.28}/>)}
     <Umbrella x={1220+leave*1000} y={390-leave*420} size={.55} angle={-24-15*leave}/>
     <g opacity={1-leave*.6}><path d="M1260 450l180-74m-138 105 200-80" stroke={GOLD} strokeWidth="4" strokeLinecap="round"/></g>
     <RainStrokes t={t} count={46} opacity={.35}/>
     {[.35,.39,.43].map((p,i)=>{const v=route(p+clamp(t/3)*.1);return <circle key={p} cx={v.x} cy={v.y-14} r={13} fill={i%2?RED:'#b9a681'}/>;})}
     <BeamDot {...walk} r={20} pulse={pulse}/><Label x={walk.x-80} y={walk.y+105} size={40} color={WHITE}>苏轼</Label>
     <Label x={1440} y={720} size={62} color={WHITE}>雨来了。</Label>
   </g>;
 }
 if(shot===2){
   const split=settle(t,.12),main=route(.43);
   const branches=[{x:1310,y:140},{x:1690,y:560},{x:1300,y:850}];
   return <g>
     <RainStrokes t={t} count={105} opacity={.88} speed={1080}/>
     <path d={routeLine} fill="none" stroke={GOLD} strokeWidth="5" opacity=".9"/>
     {branches.map((end,i)=>{const bx=mix(main.x+60,end.x,clamp(split)),by=mix(main.y,end.y,clamp(split));return <g key={i}>
       <path d={`M${main.x-110} ${main.y+30}Q${main.x+280} ${main.y-30} ${bx} ${by}`} fill="none" stroke={RED} strokeWidth="5" opacity=".94"/>
       <circle cx={bx} cy={by} r="16" fill={RED}/><circle cx={bx} cy={by} r="28" fill="none" stroke={RED} strokeWidth="2" opacity=".6"/>
       <path d={`M${bx-50} ${by+14}l-85 12M${bx-65} ${by+31}l-49 5`} stroke={RED} strokeWidth="3" opacity=".8"/>
     </g>;})}
     <BeamDot {...main} r={26} pulse={pulse}/>
     <Label x={150} y={170} size={96} color={WHITE}>同行皆狼狈</Label>
     <Label x={150} y={243} size={37}>急雨，打乱了同行人的脚步。</Label>
     {[0,1,2,3].map(i=><Ripple key={i} x={260+i*390} y={810+(i%2)*60} t={(t+i*.18)%1} delay={0} scale={1.05} color="#8ba4aa"/>)}
   </g>;
 }
 const p=.23+clamp(t/3)*.46,main=route(p);
 return <g>
   <RainStrokes t={t} count={62} opacity={.5}/>
   <Label x={160} y={170} size={42} color={WHITE}>同一场雨</Label>
   <Label x={150} y={320} size={132}>余独不觉</Label>
   <path d={routeLine} fill="none" stroke={GOLD} strokeWidth="8" opacity=".82"/>
   <path d={routeLine} transform="translate(0 21)" fill="none" stroke={GOLD} strokeWidth="2" opacity=".5"/>
   {[-110,0,120].map((n,i)=><path key={n} d={`M960 565Q1250 ${370+n} 1730 ${200+n}`} stroke={RED} strokeWidth="2" strokeDasharray="8 15" opacity=".45" fill="none"/>)}
   <BeamDot {...main} r={30} pulse={pulse}/>
   <path d={`M${main.x} ${main.y+55}v46`} stroke={GOLD} strokeWidth="3"/>
   <Label x={main.x} y={main.y+150} size={48} anchor="middle" color={WHITE}>苏轼，仍在往前走</Label>
   <Label x={1480} y={805} size={52} color={WHITE}>不必慌。</Label>
 </g>;
};

/** Five shots replace the former tiny heart on an empty field. */
export const Listen:React.FC<SceneProps>=({shot,t,global})=>{
 const pulse=beatPulse(global);
 if(shot===0){
   const branch=(v:number)=>({x:240+v*1450,y:790-v*480-50*Math.sin(v*3)});
   return <g>
     <RainStrokes t={t} count={70} opacity={.65} speed={1040}/>
     <Label x={130} y={150} size={73}>莫听穿林打叶声</Label>
     <path d="M100 870Q830 520 1790 240" stroke="#a28248" strokeWidth="14" fill="none"/>
     <path d="M110 863Q830 510 1790 231" stroke="#edd49a" strokeWidth="3" fill="none"/>
     {Array.from({length:11},(_,i)=>{const p=branch(i/11);return <g key={i}>
       <Leaf x={p.x} y={p.y} angle={-82+(i%3)*9} size={1.25+(i%3)*.18} t={t}/>
       <Leaf x={p.x} y={p.y} angle={27+(i%3)*9} size={1.1+(i%3)*.2} t={t}/>
     </g>;})}
     <Ripple x={650} y={565} t={t} delay={.16} scale={1.35}/><Ripple x={1220} y={392} t={t} delay={.52} scale={1.1}/>
     <Label x={1130} y={825} size={56} color={WHITE}>听见，不等于被带走。</Label>
   </g>;
 }
 if(shot===1){
   const words=['指责','闲言','失意','催促','否定','争执','误解','比较'];
   return <g>
     <Label x={135} y={140} size={47} color={WHITE}>外界的声音，迎面而来。</Label>
     {[0,1,2,3,4].map((r)=>{
       const yy=240+r*132;
       const points=Array.from({length:90},(_,i)=>{const x=i*24;return {x,y:yy+Math.sin(i*.64-t*5+r)*26+Math.sin(i*1.7+t*4)*12};});
       return <g key={r}><path d={line(points)} stroke={r%2?RED:GOLD} strokeWidth="3.3" fill="none" opacity=".75"/>
         {words.slice(r%3,r%3+3).map((w,j)=>{const x=190+j*570+((r%2?1:-1)*t*65);return <g key={w} transform={`translate(${x} ${yy-14})`}><path d="M-21-70H138V15H-21Z" fill="#0b0e11" fillOpacity=".92"/><Label x={0} y={-6} size={58} color={r%2?'#d59b7d':WHITE}>{w}</Label></g>;})}
       </g>;
     })}
     <path d={`M${80+t*690} 190v650`} stroke={GOLD} strokeWidth="2" opacity=".65"/>
   </g>;
 }
 if(shot===2){
   const cx=1190,cy=490,r=265;
   return <g>
     <Label x={120} y={170} size={76}>穿耳而过</Label>
     {[0,1,2,3,4,5].map(i=>{const yy=250+i*103,above=i<3,exit=above?cy-r-45:cy+r+45;return <g key={i}>
       <path d={`M-60 ${yy}C430 ${yy-35} 700 ${exit} ${cx} ${exit}S1630 ${yy-30} 1980 ${yy}`} stroke={i%2?RED:GOLD} strokeWidth="3.2" opacity=".8" fill="none"/>
       {Array.from({length:4},(_,j)=>{const phase=(t*.43+j*.24+i*.033)%1,px=-30+phase*1990,avoid=Math.exp(-Math.pow((px-cx)/410,4));const py=yy+(exit-yy)*avoid;return <circle key={j} cx={px} cy={py} r={4+i%2*2} fill={i%2?RED:WHITE} opacity=".85"/>;})}
     </g>;})}
     <circle cx={cx} cy={cy} r={r+20} stroke={GOLD} strokeWidth="2.5" strokeDasharray="7 19" fill="none" opacity=".72"/>
     <circle cx={cx} cy={cy} r={r} fill="#12140f" stroke={GOLD} strokeWidth="4"/>
     <circle cx={cx} cy={cy} r={r-35} fill="none" stroke={GOLD} strokeWidth="1.6" opacity=".5"/>
     <Label x={cx} y={cy+77} size={232} anchor="middle" color={WHITE}>心</Label>
     <path d={`M${cx-r+60} ${cy+150}Q${cx} ${cy+197} ${cx+r-60} ${cy+150}`} stroke={GOLD} strokeWidth={3+pulse*1.8} fill="none"/>
     <Label x={130} y={425} size={46} color={WHITE}>指责</Label><Label x={340} y={590} size={46} color="#d59b7d">闲言</Label><Label x={120} y={740} size={46} color={WHITE}>失意</Label>
     <Label x={1060} y={875} size={60} anchor="middle">不往心里去</Label>
   </g>;
 }
 if(shot===3){
   const p=smooth((t-.1)/.75),pts=Array.from({length:150},(_,i)=>{const x=100+i*11.5;return{x,y:485+Math.sin(i*.31-t*4)*(130+Math.sin(i*.15)*70)*(1-p)};}),focus=150+clamp((t-.5)/1.6)*1550;
   return <g>
     <Label x={125} y={160} size={72}>把注意力，收回自己。</Label>
     {[0,1,2].map(i=><path key={i} d={line(pts)} transform={`translate(0 ${(i-1)*17*(1-p)})`} fill="none" stroke={i===1?GOLD:MUTED} strokeWidth={i===1?6:2} opacity={i===1?.98:.7}/>) }
     <path d="M100 485H1820" stroke={GOLD} strokeWidth="1" opacity=".32"/>
     <BeamDot x={focus} y={485} r={21} pulse={pulse}/>
     <g opacity={1-p}><Label x={310} y={790} size={66} color={RED}>嘈杂</Label><Label x={720} y={720} size={62} color={WHITE}>慌乱</Label></g>
     <g opacity={.25+.75*p}><Label x={260} y={800} size={138}>莫听</Label><Label x={1210} y={780} size={56} color={WHITE}>心稳，脚步才稳。</Label></g>
   </g>;
 }
 const path='M100 785C480 760 645 620 920 582S1450 450 1810 250';
 return <g>
   <Label x={135} y={235} size={140}>往前走</Label>
   <Label x={1110} y={165} size={56} color={WHITE}>何妨吟啸且徐行</Label>
   <path d={path} stroke={GOLD} strokeWidth="5" fill="none"/>
   <path d={path} transform="translate(0 30)" stroke={GOLD} strokeWidth="2" opacity=".46" fill="none"/>
   {Array.from({length:10},(_,i)=>{const p=i/9,x=280+p*1290,y=780-p*440+Math.sin(p*Math.PI)*60,a=snap(t,.02+i*.12,.14);return <g key={i} opacity={a}><Footprint x={x} y={y+(i%2?26:-26)} angle={53} scale={1.2-p*.6} left={i%2===0}/><ellipse cx={x} cy={y+12} rx={38+(1-a)*35} ry={12} stroke={GOLD} strokeWidth="2" opacity={(1-a)*.7} fill="none"/></g>;})}
   <Label x={1190} y={810} size={57}>把心，交还给脚下。</Label>
 </g>;
};

export const Walk:React.FC<SceneProps>=({shot,t,global})=>{
 const pulse=beatPulse(global);
 if(shot===0){
   const clear=snap(t,.25,.6);
   return <g>
     <Routes t={t} amount={.85-clear*.58}/>
     <Label x={120} y={170} size={55} color={WHITE}>雨越急，越要</Label><Label x={1220} y={295} size={140}>先稳住</Label>
     <path d="M60 820C500 775 1000 430 1820 380" fill="none" stroke={GOLD} strokeWidth={4+clear*3}/>
     <path d="M60 840C500 795 1000 450 1820 400" fill="none" stroke={GOLD} strokeWidth="2" opacity=".5"/>
     <BeamDot x={400+out(t/1.7)*800} y={720-out(t/1.7)*240} r={27} pulse={pulse}/>
     <Label x={1270} y={800} size={43} color={WHITE}>慌乱，会让路更乱。</Label>
   </g>;
 }
 if(shot===1){
   return <g>
     <Label x={130} y={165} size={52} color={WHITE}>每一步，都算数。</Label>
     <path d="M420 950Q950 600 1510 130" stroke={GOLD} strokeWidth="3" opacity=".65" fill="none"/>
     <path d="M725 945Q1160 570 1570 130" stroke={GOLD} strokeWidth="2" opacity=".45" fill="none"/>
     {Array.from({length:8},(_,i)=>{const p=i/7,x=610+p*820+(i%2?60:-60)*(1-p*.5),y=800-p*550,a=snap(t,i*.17-.02,.15),sc=2.3-p*1.55;return <g key={i} opacity={.25+.75*a} transform={`translate(0 ${(1-a)*-30})`}>
       <Footprint x={x} y={y} scale={sc} angle={44} left={i%2===0}/>
       <Ripple x={x} y={y+sc*60} t={t} delay={i*.17} scale={sc*.5}/>
     </g>;})}
     <Label x={130} y={720} size={148}>且徐行</Label>
     <Label x={1490} y={785} size={40} color={WHITE}>一步</Label><Label x={1570} y={845} size={40} color={WHITE}>再一步</Label>
   </g>;
 }
 if(shot===2){
   const a=settle(t,.05),waves=[0,.28,.56,.84,1.12];
   return <g>
     <RainStrokes t={t} count={45} opacity={.37}/>
     {waves.map((d,i)=>{const p=clamp((t-d)/1.15);return <ellipse key={i} cx="720" cy="500" rx={160+p*1050} ry={90+p*480} fill="none" stroke={GOLD} strokeWidth={i%2?2:3.5} opacity={(1-p)*.8*snap(t,d,.09)}/>;})}
     <g transform={`translate(${(1-a)*-34} 0)`}><Label x={235} y={615} size={310}>何妨</Label></g>
     <Label x={1240} y={370} size={92} color={WHITE}>吟啸</Label>
     <Label x={1280} y={485} size={42}>吟，是低声歌唱。</Label><Label x={1280} y={550} size={42}>啸，是放声长啸。</Label>
     <Label x={760} y={820} size={65} color={WHITE}>下雨而已，有什么关系。</Label>
   </g>;
 }
 const p=.15+clamp(t/2.7)*.68,dx=(1-p)*(1-p)*605+2*(1-p)*p*1000+p*p*1664,dy=(1-p)*(1-p)*930+2*(1-p)*p*520+p*p*180;
 return <g>
   <Label x={130} y={200} size={60} color={WHITE}>人生的难关</Label><Label x={120} y={380} size={146}>一步一步过</Label>
   <path d="M300 930C540 680 950 480 1650 180M900 930C1030 660 1310 420 1680 180" fill="none" stroke={GOLD} strokeWidth="3" opacity=".74"/>
   <path d="M605 930Q1000 520 1664 180" fill="none" stroke={GOLD} strokeWidth="7"/>
   {Array.from({length:9},(_,i)=>{const q=i/10;return <path key={i} d={`M${400+q*1000} ${880-q*640}l${225*(1-q)+20} ${-20}`} stroke={MUTED} strokeWidth="2" opacity=".6"/>;})}
   <BeamDot x={dx} y={dy} r={30-p*17} pulse={pulse}/>
   <Label x={1380} y={760} size={56} color={WHITE}>先走稳</Label><Label x={1480} y={840} size={56}>下一步</Label>
 </g>;
};

export const Light:React.FC<SceneProps>=({shot,t,global})=>{
 const pulse=beatPulse(global);
 if(shot===0){
   const a=settle(t);
   return <g>
     <Label x={120} y={170} size={94}>竹杖芒鞋</Label><Label x={125} y={237} size={44} color={WHITE}>一身简陋，却比骑马轻快。</Label>
     <ellipse cx="1150" cy="837" rx="470" ry="48" fill="#000" opacity=".4"/>
     <Artifact kind="sandals" x={1050+25*(1-a)} y={220} size={1540} index={2+clamp(t/2)*3} angle={0}/>
     <Ripple x={846} y={670} t={t} delay={.16} scale={1.4}/>
     <path d="M220 858Q820 882 1640 843" stroke={GOLD} strokeWidth="2" fill="none" opacity=".65"/>
     <Label x={150} y={580} size={118}>行装简</Label><Label x={245} y={738} size={118} color={WHITE}>脚下轻</Label>
   </g>;
 }
 if(shot===1){
   const pull=12*settle(t,.05);
   return <g>
     <Label x={130} y={160} size={72}>是什么，让人觉得重？</Label>
     <Artifact kind="seal" x={520} y={545} size={1060} index={6+clamp(t/2)*4} angle={-9}/>
     <ellipse cx="520" cy="839" rx="365" ry="43" fill="#000" opacity=".4"/>
     {[{word:'身份',x:1210,y:340},{word:'体面',x:1480,y:550},{word:'执着',x:1160,y:795}].map((w,i)=><g key={w.word}>
       <path d={`M${650+i*25} ${515+i*60}Q${900-pull} ${550+i*10} ${w.x-55} ${w.y-25}`} fill="none" stroke={i===1?RED:GOLD} strokeWidth="4"/>
       <path d={`M${655+i*25} ${523+i*60}Q${900-pull} ${560+i*10} ${w.x-55} ${w.y-13}`} fill="none" stroke={MUTED} strokeWidth="2"/>
       <circle cx={w.x-50} cy={w.y-18} r="13" fill="#121313" stroke={GOLD} strokeWidth="3"/>
       <Label x={w.x} y={w.y} size={100} color={i===1?WHITE:GOLD}>{w.word}</Label>
     </g>)}
     <Label x={150} y={887} size={38} color={WHITE}>把自己绑在体面上，才是最重的行装。</Label>
   </g>;
 }
 if(shot===2){
   const release=out((t-.18)/.52),split=clamp((t-.18)/.65);
   return <g>
     <Artifact kind="seal" x={250-release*340} y={530+release*160} size={950} index={8} angle={-10-release*18} opacity={1-release*.65}/>
     <path d={`M170 250Q${750-release*500} ${300-release*200} ${960-release*240} ${470-release*170}`} fill="none" stroke={GOLD} strokeWidth="5" opacity={1-release*.32}/>
     <path d={`M${960+release*220} ${470+release*280}Q${1420+release*150} ${510+release*360} 1840 ${700+release*210}`} fill="none" stroke={GOLD} strokeWidth="5" opacity={1-release*.32}/>
     <path d={`M210 760Q${750-release*200} ${580+release*300} ${960-release*240} ${470+release*190}`} fill="none" stroke={RED} strokeWidth="4" opacity={1-release*.32}/>
     <path d={`M${960+release*170} ${470-release*210}Q${1300+release*340} ${230-release*120} 1810 ${160-release*200}`} fill="none" stroke={RED} strokeWidth="4" opacity={1-release*.32}/>
     <g opacity={1-release} transform={`translate(${-release*230} ${release*80}) rotate(${-release*10} 780 410)`}><Label x={660} y={470} size={172} color={WHITE}>体</Label></g>
     <g opacity={1-release} transform={`translate(${release*270} ${release*160}) rotate(${release*12} 1130 410)`}><Label x={1050} y={470} size={172} color={WHITE}>面</Label></g>
     {t>=.18&&<TearShards t={t-.18} x={960} y={470} count={18}/>}
     <Label x={130} y={165} size={66} color={WHITE}>不再被身份牵着走。</Label>
     <g opacity={.15+.85*snap(t,.22,.18)} transform={`translate(0 ${30*(1-settle(t,.2))})`}><Label x={880} y={650} size={248}>松开</Label></g>
   </g>;
 }
 const scroll=clamp(t/2.6);
 return <g>
   <Label x={120} y={165} size={60} color={WHITE}>竹杖芒鞋轻胜马</Label>
   <Label x={260} y={730} size={485}>轻</Label>
   {[0,1,2,3,4].map(i=><path key={i} d={`M${100-i*80} ${820-i*18}C${700+i*35} ${960-i*22} ${1000+i*30} ${240-i*13} ${1850+i*60} ${360+i*27}`} stroke={i===2?GOLD:MUTED} strokeWidth={i===2?5:2} opacity={i===2?.97:.65} fill="none"/>)}
   {Array.from({length:12},(_,i)=>{const p=(i/12+scroll*.4)%1,x=100+p*1720,y=810-470*smooth(p)+Math.sin(p*Math.PI*2)*55;return <path key={i} d={`M${x} ${y}l${20+p*26} ${-4}`} stroke={GOLD} strokeWidth={i%3===0?4:2} opacity={.55+((i%3)/3)*.4}/>;})}
   <Label x={1120} y={770} size={67} color={WHITE}>脚下轻。</Label><Label x={1280} y={863} size={88}>心里，更轻。</Label>
   <BeamDot x={1460+scroll*240} y={350-scroll*35} r={14} pulse={pulse}/>
 </g>;
};
