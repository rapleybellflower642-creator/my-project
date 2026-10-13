import React from 'react';
import {L,LateSvg,LateDefs,VisualProps,phase,mix,limit,rnd,CloudIcon,SunIcon,HaloPoint,pointsPath} from './late-helpers';

export const WeatherVisual=({frame,duration}:VisualProps)=>{
  const id='weather-v2';
  const widen=phase(frame,140,260);
  const scale=mix(1.55,1,widen);
  const scaleY=mix(1.17,1,widen);
  const draw=phase(frame,12,240);
  const light=phase(frame,205,326);
  const weatherX=340+limit(frame/290)*1170;
  const pathPoint=(t:number)=>({x:285+t*1350,y:637+24*Math.sin(t*7.1)-13*Math.sin(t*15)});
  const path=pointsPath(Array.from({length:101},(_,i)=>pathPoint(i/100)));
  const head=pathPoint(Math.min(.91,.06+frame/duration*.87));
  const weatherRibbon=(j:number)=>pointsPath(Array.from({length:121},(_,i)=>{const x=285+i*11.25;const a=i/120;return {x,y:368+Math.sin(a*8.6+frame*.019+j*.09)*(30+24*Math.sin(a*3.5))+j*3.6};}));
  return <LateSvg><LateDefs id={id}/>
    <g transform={`translate(${960-960*scale} ${515-515*scaleY}) scale(${scale} ${scaleY})`}>
      <ellipse cx={mix(760,1060,widen)} cy="560" rx="740" ry="255" fill={`url(#${id}-halo)`} opacity=".36"/>
      <g opacity={phase(frame,0,20)}>
        {Array.from({length:17},(_,j)=><path key={j} d={weatherRibbon(j-8)} fill="none" stroke={j<6?L.jade:j>11?L.amber:L.gold} strokeWidth={j===8?2.5:.8} strokeOpacity={j===8?.7:.14}/>) }
        <path d={weatherRibbon(0)} fill="none" stroke={L.ivory} strokeWidth="1" strokeDasharray="3 250" strokeDashoffset={-frame*4} opacity=".45"/>
        <g opacity={.78-.25*widen}>
          <CloudIcon x={433} y={261} scale={.57}/>
          {Array.from({length:15},(_,i)=>{const x=381+rnd(i+2)*110;const yy=290+(rnd(i+10)*64+frame*2.4)%78;return <line key={i} x1={x} y1={yy} x2={x-7} y2={yy+12} stroke={L.jade} strokeWidth="1.2" opacity={.22+rnd(i)*.32}/>})}
          <CloudIcon x={967} y={269} scale={.65} color={L.gold}/><SunIcon x={1476} y={273} r={28} frame={frame} color={L.amber}/>
        </g>
        <text x="433" y="468" textAnchor="middle" fill={L.jade} opacity=".88" fontFamily="DFBSerif" fontSize="30" letterSpacing="12">雨</text>
        <text x="967" y="468" textAnchor="middle" fill={L.gold} opacity=".76" fontFamily="DFBSerif" fontSize="30" letterSpacing="12">阴</text>
        <text x="1476" y="468" textAnchor="middle" fill={L.amber} opacity=".88" fontFamily="DFBSerif" fontSize="30" letterSpacing="12">晴</text>
        <path d={`M${weatherX} 395 C${weatherX-35} 470 ${weatherX+40} 510 ${weatherX} 607`} fill="none" stroke={L.gold} strokeOpacity={.12*(1-phase(frame,235,320))} strokeWidth="1" strokeDasharray="3 8"/>
      </g>
      <path d={path} fill="none" stroke={L.gold} strokeWidth="1" strokeOpacity=".13"/>
      <path d={path} fill="none" stroke={L.gold} strokeWidth="12" strokeOpacity=".045" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/>
      <path d={path} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2.7" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/>
      {[.08,.24,.40,.58,.76,.91].map((t,i)=>{const p=pathPoint(t);const on=phase(frame,15+i*32,45+i*32);const pause=i===2;return <g key={i} opacity={on}>
        <line x1={p.x} x2={p.x} y1={p.y+19} y2={p.y+51} stroke={L.gold} strokeOpacity=".2"/>
        <circle cx={p.x} cy={p.y} r={pause?19:11} fill={L.dark} stroke={pause?L.jade:L.gold} strokeWidth="1.4"/>
        {pause?<g stroke={L.jade} strokeWidth="3"><line x1={p.x-4} y1={p.y-5} x2={p.x-4} y2={p.y+5}/><line x1={p.x+4} y1={p.y-5} x2={p.x+4} y2={p.y+5}/></g>:<circle cx={p.x} cy={p.y} r="3" fill={L.gold}/>}
        {(i===2||i===3)&&<text x={p.x} y={p.y+84} textAnchor="middle" fill={i===2?L.jade:L.gold} fontFamily="DFBSans" fontSize="27" letterSpacing="4">{i===2?'暂停':'继续'}</text>}
      </g>})}
      <HaloPoint id={id} x={head.x} y={head.y} r={6}/>
      <g opacity={light*.65}><path d="M285 758 Q960 795 1635 758" fill="none" stroke={L.gold} strokeWidth=".8"/><line x1="285" x2="285" y1="748" y2="767" stroke={L.gold}/><line x1="1635" x2="1635" y1="748" y2="767" stroke={L.gold}/></g>
    </g>
    <text x="1670" y="810" textAnchor="end" fill={L.ivory} opacity={.42*phase(frame,170,240)} fontFamily="DFBSans" fontSize="24" letterSpacing="3">人生处境示意</text>
  </LateSvg>;
};
