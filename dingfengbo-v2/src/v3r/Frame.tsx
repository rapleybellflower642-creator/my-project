import React from 'react';
import {Character} from './Character';
import {Environment, Place} from './Environment';
import {Caption,DateLine,Title,clamp,ease,out} from './Typography';
import {CHAPTERS} from './timeline';

type StageProps={kind:Place;t:number;rain?:number;warm?:number;children?:React.ReactNode;front?:React.ReactNode;zoom?:number;cx?:number;cy?:number;dx?:number;dy?:number};
const Stage=({kind,t,rain=0,warm=0,children,front,zoom=1,cx=960,cy=540,dx=0,dy=0}:StageProps)=><g transform={`translate(${cx+dx} ${cy+dy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
 <Environment kind={kind} t={t} rain={rain} warm={warm}/>
 {children}
 <Environment kind={kind} t={t} rain={rain} warm={warm} layer="front"/>
 {front}
</g>;

const Window=({t,from=0,to,children}:{t:number;from?:number;to:number;children:React.ReactNode})=>t<from||t>=to?null:<g opacity={ease((t-from)/.12)*ease((to-t)/.2)}>{children}</g>;

const FootRipples=({t,x,y=920,scale=1}:{t:number;x:number;y?:number;scale?:number})=>{
 const phase=t%.8;
 const ring=out(phase/.65);
 return <g opacity={(1-ring)*.65} stroke="#c7d7b7" fill="none" strokeWidth="1.5">
  <ellipse cx={x} cy={y} rx={(14+ring*60)*scale} ry={(2+ring*8)*scale}/>
  <ellipse cx={x} cy={y} rx={(5+ring*40)*scale} ry={(1+ring*5)*scale}/>
 </g>;
};

const RainLeaf=({t}:{t:number})=><g transform={`translate(480 360) rotate(${-12+Math.sin(t*2.5)*2.5})`}>
 <path d="M-210 80 Q100 -20 540 -36" stroke="#769a71" strokeWidth="13" fill="none"/>
 {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${i*128-140} ${45-i*18}) rotate(${Math.sin(t*3+i)*3})`}>
  <path d="M0 0 Q78 -121 225 -133 Q130 -5 0 0" fill={i%2?'#3e725b':'#487d60'} stroke="#7c9c71" strokeWidth="1.2"/>
  <path d="M0 0 Q100 -71 225 -133" stroke="#97ad7e" opacity=".4" fill="none" strokeWidth="2"/>
  <path d="M0 0 Q-28 71 42 166 Q91 45 0 0" fill="#396d51" stroke="#79996a" strokeWidth="1.3"/>
 </g>)}
 {[0,1,2,3,4,5].map(i=>{
  const p=(t*1.1+i*.177)%1;
  return <g key={i} opacity={p<.7?1:1-(p-.7)/.3}>
   <path d={`M${i*105-60} ${-210+p*205} l-8 34`} stroke="#d2e4d2" strokeWidth="2"/>
   {p>.72&&<ellipse cx={i*105-60} cy={-57} rx={(p-.72)*70} ry={(p-.72)*10} fill="none" stroke="#d2e4d2" strokeWidth="2"/>}
  </g>;
 })}
</g>;

const Scene=({id,t}:{id:string;t:number})=>{
 switch(id){
 case 'hook':return <>
  {t<2?<Stage kind="prison" t={t} zoom={1.04} cx={1260}>
   <Character t={t} x={1250} y={905} scale={1.04} action="stand" noStaff/>
   <g transform={`translate(${1050+out((t-.7)/.4)*330} 590)`}><rect width="340" height="22" rx="5" fill="#514733" stroke="#ab9565" strokeWidth="2"/><rect x="230" y="-20" width="22" height="62" rx="4" fill="#827657"/></g>
  </Stage>:t<3.8?<Stage kind="river" t={t-2} warm={.1}><Character t={t} x={1270} y={807+Math.sin((t-2)*.78)*2.8} scale={.65} action="stand" noStaff/></Stage>:
  <Stage kind="bamboo" t={t-3.8} rain={.95} zoom={1.1} cx={1280} cy={410}><Character t={t-3.8} x={1400} y={1340} scale={1.95} action="resolve"/></Stage>}
  {t<2?<><DateLine text="1079 · 乌台诗案" t={t-.15} y={244}/><Title text="因诗入狱。" t={t} delay={.15} x={120} y={402} size={116} mode="land"/></>:t<3.8?<Title text="被贬黄州。" t={t-2} delay={.1} x={120} y={402} size={116} mode="ink"/>:<>
   <Title text="他凭什么" t={t-3.8} delay={.15} x={120} y={340} size={98} mode="ink"/>
   <Title text="说「谁怕」？" t={t-3.8} delay={.75} x={120} y={483} size={111} mode="land"/>
  </>}
 </>;
 case 'exile':return <>
  {t<4?<Stage kind="river" t={t} warm={.1} zoom={1.05} cx={1300} cy={650}><Character t={t} x={1270} y={807+Math.sin(t*.78)*2.8} scale={.64} action="stand" noStaff/></Stage>:
   <Stage kind="cottage" t={t-4} warm={.12} zoom={t<7.6?1:1.14} cx={1290} cy={560}>
    <Character t={t<7.6?t-4:t-7.6} x={t<7.6?1135+(t-4)*70*.92:1367} y={905} scale={.92} action={t<7.6?'walk':'stand'} noStaff/>
    <g transform="translate(1450 846) rotate(8)"><path d="M-55 -39 Q0 -65 48 -38 L60 31 Q4 52 -68 30Z" fill="#8c8964" stroke="#c3bd94" strokeWidth="2"/><path d="M-6 -37 L2 39 M-47 -19 Q-5 3 50 -11" stroke="#c5b689" strokeWidth="5" fill="none"/></g>
   </Stage>}
  <Window t={t} from={.3} to={4}><Title text="苏轼，贬居黄州。" t={t} delay={.3} size={88}/><DateLine text="1080年" t={t-.3} y={240}/></Window>
  <Caption text="有官衔，却不得签署公事。" t={t} start={4.4} end={10.8}/>
 </>;
 case 'cultivate':return <>
  {t<5.6?<Stage kind="farm" t={t} warm={.18} zoom={t<3.6?1:1.18} cx={1190} cy={750}>
   <Character t={t} x={1220} y={905} scale={.97} action="farm" noStaff/>
  </Stage>:<Stage kind="desk" t={t-5.6} warm={.3} zoom={1.27} cx={1320} cy={700}
   front={<><defs><clipPath id="writing-hand"><rect x="1335" y="685" width="185" height="155"/></clipPath></defs><g clipPath="url(#writing-hand)"><Character t={t-5.6} x={1270} y={1078} scale={1.04} action="write" noStaff/></g></>}>
   <Character t={t-5.6} x={1270} y={1078} scale={1.04} action="write" noStaff/>
  </Stage>}
  <Caption text="生活困顿，他躬耕东坡。" t={t} start={.25} end={5.3}/>
  <Caption text="也在这里，慢慢安顿自己。" t={t} start={5.9} end={9.8}/>
 </>;
 case 'rain':return <>
  {t<2.4?<Stage kind="bamboo" t={t} rain={ease((t-.6)/1.1)*.9}><Character t={t} x={1230+t*43} y={916} scale={.62} action="walk"/><RainLeaf t={t}/></Stage>:
   t<6.4?<Stage kind="path" t={t} rain={.95} zoom={1.02}>
    <Character t={t-2.4} x={530+(t-2.4)*180*.82} y={975} scale={.82} action="rushing" noStaff seed={2}/>
    <Character t={t-2.1} x={810+(t-2.4)*180*.68} y={908} scale={.68} action="rushing" noStaff seed={4}/>
    <Character t={t-2.4} x={1415} y={913} scale={.85} action="resolve"/>
   </Stage>:<Stage kind="bamboo" t={t} rain={.8} zoom={1.06} cx={1370} cy={600}><Character t={t-6.4} x={1285+(t-6.4)*70*.96} y={939} scale={.96} action="walk"/></Stage>}
  <Window t={t} from={.2} to={4.9}><Title text="沙湖道中" t={t} delay={.2} size={90}/><DateLine text="1082 · 元丰五年三月七日" t={t-.2} y={240}/></Window>
  <Caption text="雨具先去，同行皆狼狈。" t={t} start={5.25} end={9.85}/>
 </>;
 case 'listen':return <>
  {t<3.2?<Stage kind="bamboo" t={t} rain={1}><Character t={t} x={1450} y={912} scale={.68} action="stand"/><RainLeaf t={t+2}/></Stage>:
   t<6.4?<Stage kind="path" t={t} rain={.9}>
    <Character t={t-3.2} x={630+(t-3.2)*180} y={1090} scale={1.16} action="rushing" noStaff seed={3}/>
    <Character t={t-3.2} x={1420} y={928} scale={.93} action="resolve"/>
   </Stage>:<Stage kind="bamboo" t={t} rain={.58} zoom={1.03} cx={1400} cy={400}><Character t={t-6.4} x={1385} y={1290} scale={1.8} action="resolve"/></Stage>}
  <Window t={t} from={.25} to={5.4}><Title text="莫听" t={t} delay={.25} x={120} y={186} size={122} mode="land"/><Title text="穿林打叶声。" t={t} delay={.85} x={125} y={304} size={77} mode="ink"/></Window>
  <Caption text="外界越喧闹，越要稳住自己的心。" t={t} start={6} end={10.8}/>
 </>;
 case 'walk':return <>
  {t<4.8?<Stage kind="path" t={t} rain={.75} zoom={1.12} cx={1250} cy={610} dx={-t*12}>
   <FootRipples t={t} x={1080+Math.floor(t/.8)*.8*70*.94} y={925}/>
   <Character t={t} x={1110+t*70*.94} y={922} scale={.94} action="walk"/>
  </Stage>:t<7.5?<Stage kind="bamboo" t={t} rain={.55}><Character t={t-4.8} x={1380} y={1310} scale={1.85} action="chant"/></Stage>:
   <Stage kind="path" t={t} rain={.42} zoom={1.02}><Character t={t-7.5} x={1140+(t-7.5)*70*.65} y={859} scale={.65} action="walk"/></Stage>}
  <Window t={t} from={.15} to={5.7}><Title text="何妨吟啸且徐行。" t={t} delay={.15} size={91} mode="walk"/></Window>
  <Caption text="难关，还得一步一步走过去。" t={t} start={6.1} end={9.85}/>
 </>;
 case 'light':return <>
  {t<1.6?<Stage kind="path" t={t} rain={.5} zoom={5.2} cx={1285} cy={925} dy={-160} dx={-t*70*.85*5.2}>
   <FootRipples t={t} x={1200+Math.floor(t/.8)*.8*70*.85} y={925}/>
   <Character t={t} x={1210+t*70*.85} y={925} scale={.85} action="walk"/>
  </Stage>:t<5.3?<Stage kind="path" t={t} rain={.45} zoom={1.05}><Character t={t-1.6} x={1090+(t-1.6)*70*.96} y={925} scale={.96} action="walk"/></Stage>:
   <Stage kind="bamboo" t={t} rain={.35}><Character t={t-5.3} x={1370} y={1210} scale={1.62} action="chant"/></Stage>}
  <Window t={t} from={.1} to={5.25}><Title text="竹杖芒鞋" t={t} delay={.1} size={88}/><Title text="轻胜马。" t={t} delay={.7} x={510} y={285} size={100} mode="walk"/></Window>
  <Caption text="行装简朴，心也可以轻一些。" t={t} start={5.6} end={8.85}/>
 </>;
 case 'who':return <>
  {t<2.7666667?<Stage kind="bamboo" t={t} rain={1} zoom={1.02}><Character t={t} x={1430} y={1300} scale={1.85} action="resolve"/></Stage>:
   t<7?<Stage kind="path" t={t} rain={.95} zoom={1.04-.04*out((t-2.7667)/1.5)}><Character t={t-2.7666667} x={1160+(t-2.7666667)*70*.86} y={919} scale={.86} action="walk"/></Stage>:
   <Stage kind="ridge" t={t} rain={.62} warm={.12}><Character t={t-7} x={1035+(t-7)*70*.64} y={875} scale={.64} action="walk"/></Stage>}
  <Window t={t} from={.5666667} to={2.7666667}><Title text="谁怕？" t={t} delay={.5666667} x={125} y={480} size={217} mode="land" tracking={10}/></Window>
  <Window t={t} from={2.7666667} to={11.85}><Title text="一蓑烟雨任平生。" t={t} delay={2.7666667} size={98} mode="light"/></Window>
 </>;
 case 'cold':return <>
  <Stage kind="bamboo" t={t} rain={.08*(1-ease(t/3))} zoom={t<4.5?1.05:1} warm={.08}>
   <Character t={t} x={1360} y={t<4.5?1225:985} scale={t<4.5?1.62:1.13} action="cold"/>
  </Stage>
  <Window t={t} from={.15} to={4.7}><Title text="料峭春风吹酒醒，" t={t} delay={.15} size={77} mode="cold"/><Title text="微冷。" t={t} delay={1.05} x={127} y={315} size={112} mode="cold"/></Window>
  <Caption text="从容的人，也会觉得冷。" t={t} start={5} end={7.9}/>
 </>;
 case 'sun':return <>
  <Stage kind="ridge" t={t} warm={ease((t-.35)/3.7)} zoom={t<4.5?1.01:1.1} cx={1300} cy={520}>
   <Character t={t} x={1300} y={t<4.5?900:1115} scale={t<4.5?.95:1.43} action={t<2.4?'cold':'chant'} warm={ease((t-2.4)/2.5)}/>
  </Stage>
  <Window t={t} from={.7} to={8.85}><Title text="山头斜照却相迎。" t={t} delay={.7} size={91} mode="light" fill="#f6dba2"/></Window>
 </>;
 case 'return':return <>
  {t<5.3?<Stage kind="path" t={t} warm={.54} zoom={1.03} cx={1320} cy={560}>
   <Character t={Math.max(0,t-.5)} x={1330} y={1000} scale={1.22} action="lookback" warm={.4}/>
  </Stage>:t<8?<Stage kind="bamboo" t={t} warm={.55}><Character t={t} x={1300} y={880} scale={.65} action="stand" warm={.5}/></Stage>:
   <Stage kind="return" t={t} warm={.73}><Character t={t-8} x={1110+(t-8)*70*.64} y={880} scale={.64} action="walk" warm={.5}/></Stage>}
  <Window t={t} from={.2} to={5}><Title text="回首向来萧瑟处。" t={t} delay={.2} size={90} mode="settle"/></Window>
  <Window t={t} from={5.3} to={8}><Title text="归去。" t={t} delay={5.3} x={260} y={425} size={164} mode="settle"/></Window>
  <Caption text={['走过的风雨，','不必继续困住此刻的自己。']} t={t} start={8.3} end={13.8}/>
 </>;
 case 'ending':return <>
  <Stage kind="return" t={t+14} warm={.75} zoom={1}>
   <Character t={t} x={1150+t*70*.47} y={841} scale={.47} action="walk" warm={.55}/>
  </Stage>
  <rect width="1920" height="610" fill="url(#r-top)" opacity=".48"/>
  <Title text="也无风雨也无晴。" t={t} delay={.4} x={960} y={310} size={106} center mode="settle" fill="#f0d8a3"/>
  <g opacity={ease((t-1.8)/.8)}><text x="960" y="415" textAnchor="middle" fontFamily="Noto Serif CJK SC" fontSize="38" letterSpacing="5" fill="#cbd4bd">苏轼《定风波》</text></g>
 </>;
 default:return null;
 }
};

/** Pure SVG scene graph shared by the interactive Remotion film and native exporter. */
export const FrameSvg=({frame,fps=30}:{frame:number;fps?:number})=>{
 const sec=Math.min(119.999,Math.max(0,frame/fps));
 const chapter=CHAPTERS.find(c=>sec>=c.from&&sec<c.to)||CHAPTERS[0];
 const t=sec-chapter.from;
 return <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
   <linearGradient id="r-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#071211" stopOpacity=".67"/><stop offset="1" stopColor="#071211" stopOpacity="0"/></linearGradient>
   <linearGradient id="r-bottom" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#071211" stopOpacity="0"/><stop offset="1" stopColor="#071211" stopOpacity=".68"/></linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="#122723"/>
  <Scene id={chapter.id} t={t}/>
  {sec>118.6&&<rect width="1920" height="1080" fill="#091512" opacity={ease((sec-118.6)/1.4)}/>}
 </svg>;
};
