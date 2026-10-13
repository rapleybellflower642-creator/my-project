import React from 'react';
import {L,LateSvg,LateDefs,VisualProps,phase,mix,rnd,project,pointsPath,TAU,V3,DropIcon,BambooIcon,CloakIcon,HaloPoint,CloudIcon,SunIcon,limit} from './late-helpers';

export const FreedomVisual=({frame}:VisualProps)=>{
  const id='freedom-v2';const spread=phase(frame,0,67);const orbit=phase(frame,52,151);const angle=mix(-.12,-1.02,orbit);const zoom=mix(1.2,.92,spread)+orbit*.1;
  const centers=[-790,0,790].map(z=>z*mix(.23,1,spread));
  const proj=(p:V3)=>project(p,angle,zoom,475);
  const path3=(t:number):V3=>({x:36*Math.sin(t*TAU),y:166+20*Math.sin(t*5),z:-1120+t*2240});
  const route=Array.from({length:181},(_,i)=>proj(path3(i/180)));
  const pathD=pointsPath(route);
  const weatherColors=[L.jade,L.gold,L.amber];
  const layers=centers.map((z,i)=>({z,i,depth:proj({x:0,y:0,z}).s})).sort((a,b)=>a.depth-b.depth);
  const flare=(1-phase(frame,12,51))*phase(frame,0,10);
  return <LateSvg><LateDefs id={id}/>
    <ellipse cx="960" cy="540" rx="800" ry="360" fill={`url(#${id}-halo)`} opacity={.3+flare*.7}/>
    <g opacity={.17*spread}>
      {Array.from({length:6},(_,i)=>{const x=-250+i*100;const pts=Array.from({length:51},(_,j)=>proj({x,y:210,z:-1250+j*50}));return <path key={i} d={pointsPath(pts)} fill="none" stroke={L.gold} strokeWidth=".6"/>})}
    </g>
    {layers.map(({z,i})=>{
      const color=weatherColors[i];const on=phase(frame,i*9,i*9+30);
      const front=Array.from({length:85},(_,j)=>{const a=j/84*TAU;return proj({x:Math.cos(a)*247,y:Math.sin(a)*220-28,z:z-87});});
      const back=Array.from({length:85},(_,j)=>{const a=j/84*TAU;return proj({x:Math.cos(a)*247,y:Math.sin(a)*220-28,z:z+87});});
      const center=proj({x:0,y:0,z});
      const label=proj({x:0,y:-335,z});
      const iconP=proj({x:0,y:-170,z});
      const foot=proj({x:0,y:166,z});
      return <g key={i} opacity={on}>
        <path d={pointsPath(back,true)} fill={color} fillOpacity={i===1?.025:.044} stroke={color} strokeOpacity=".12" strokeWidth="1"/>
        <path d={pointsPath(front,true)} fill={L.dark} fillOpacity=".38" stroke={color} strokeOpacity=".7" strokeWidth="1.8"/>
        <path d={pointsPath(front.slice(37,69))} fill="none" stroke={color} strokeWidth="4" strokeOpacity=".26"/>
        {[0,14,28,42,56,70].map((j,k)=><line key={j} x1={front[j].x} y1={front[j].y} x2={back[j].x} y2={back[j].y} stroke={color} strokeOpacity={k%2?.2:.11} strokeWidth=".8"/>)}
        {i===0&&Array.from({length:43},(_,j)=>{const px=(rnd(j+100)-.5)*355;const yy=-185+(rnd(j+18)*325+frame*5.2)%325;const from=proj({x:px,y:yy,z:z+(rnd(j)*2-1)*48});const to=proj({x:px-7,y:yy+20+rnd(j+39)*18,z:z+(rnd(j)*2-1)*48});return <line key={j} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeOpacity={.23+rnd(j)*.4} strokeWidth={.9+rnd(j)*.9}/>})}
        {i===1&&Array.from({length:14},(_,j)=>{const pts=Array.from({length:46},(_,k)=>{const x=-214+k*428/45;return proj({x,y:-108+j*17+Math.sin(k*.14+frame*.015+j*.22)*18,z:z+Math.sin(k*.1)*24});});return <path key={j} d={pointsPath(pts)} fill="none" stroke={color} strokeWidth=".8" strokeOpacity={.11+j%3*.035}/>})}
        {i===2&&Array.from({length:21},(_,j)=>{const a=(j/21)*TAU+frame*.0018;const a1=proj({x:Math.cos(a)*76,y:Math.sin(a)*67-38,z});const a2=proj({x:Math.cos(a)*220,y:Math.sin(a)*180-38,z});return <line key={j} x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke={color} strokeWidth={j%3===0?1.7:.9} strokeOpacity={j%3===0?.36:.18}/>})}
        <g opacity={.75*phase(frame,75,127)}>
          {i===0?<DropIcon id={id} x={iconP.x} y={iconP.y+38*iconP.s} scale={iconP.s*.45}/>:i===1?<CloudIcon x={iconP.x} y={iconP.y+36*iconP.s} scale={iconP.s*.47} color={L.gold}/>:<SunIcon x={iconP.x} y={iconP.y+38*iconP.s} r={28*iconP.s} frame={frame} color={L.amber}/>}
        </g>
        <text x={limit(label.x,150,1770)} y={Math.max(235,label.y)} fill={color} textAnchor="middle" opacity={phase(frame,87,129)} fontFamily="DFBSerif" fontSize={31*Math.max(.85,label.s)} letterSpacing="10">{['雨','阴','晴'][i]}</text>
        <g opacity={phase(frame,124+i*11,161+i*11)}>
          <circle cx={foot.x} cy={foot.y} r={11*foot.s} fill={L.dark} stroke={color} strokeWidth="1.5"/>
          <circle cx={foot.x} cy={foot.y} r={3.2*foot.s} fill={L.ivory}/>
          {i===0?<DropIcon id={id} x={foot.x-49*foot.s} y={foot.y-65*foot.s} scale={foot.s*.42}/>:i===1?<BambooIcon id={id} x={foot.x-46*foot.s} y={foot.y-74*foot.s} scale={foot.s*.45} angle={10}/>:<CloakIcon id={id} x={foot.x-45*foot.s} y={foot.y-69*foot.s} scale={foot.s*.52}/>}
        </g>
        <ellipse cx={center.x} cy={center.y} rx={110*center.s} ry={140*center.s} fill={`url(#${i===0?id+'-jade':id+'-halo'})`} opacity=".22"/>
      </g>;
    })}
    <path d={pathD} fill="none" stroke={L.gold} strokeWidth="19" strokeOpacity=".07" pathLength="1" strokeDasharray="1" strokeDashoffset={1-phase(frame,22,129)}/>
    <path d={pathD} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="4.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-phase(frame,22,129)}/>
    <path d={pathD} fill="none" stroke={L.ivory} strokeWidth="1.1" strokeOpacity=".9" pathLength="1" strokeDasharray="1" strokeDashoffset={1-phase(frame,30,142)}/>
    {Array.from({length:7},(_,i)=>{const points=Array.from({length:65},(_,j)=>{const t=j/64;const bend=Math.sin(t*Math.PI);return proj({x:Math.sin(i*.9+frame*.014)*140*bend,y:166-bend*(50+i*21),z:-1100+t*2200});});return <path key={i} d={pointsPath(points)} fill="none" stroke={i%3===0?L.jade:L.gold} strokeWidth={i===3?2.1:.8} strokeOpacity={(i===3?.24:.11)*phase(frame,18,48)*(1-phase(frame,110,170))} pathLength="1" strokeDasharray=".13 .87" strokeDashoffset={-((frame+i*11)%83)/83}/>})}
    {Array.from({length:115},(_,i)=>{const angle0=rnd(i+61)*TAU;const speed=95+rnd(i+15)*230;const tt=phase(frame,9,85);const t=limit((frame-9)/52);const p=proj({x:Math.cos(angle0)*speed*t,y:Math.sin(angle0)*speed*t-27,z:(rnd(i+30)-.5)*2300*spread});const alpha=(1-phase(frame,89,168))*.6*phase(frame,4,18);return <circle key={i} cx={p.x} cy={p.y} r={(.65+rnd(i+1)*1.8)*p.s} fill={i%8===0?L.jade:L.gold} opacity={alpha*(.25+rnd(i+2)*.65)}/>})}
    {Array.from({length:42},(_,i)=>{const t=(rnd(i+80)+frame*.0008)%1;const p=proj({...path3(t),x:path3(t).x+(rnd(i+340)-.5)*68,y:path3(t).y+(rnd(i+12)-.5)*54});return <circle key={i} cx={p.x} cy={p.y} r={(1+rnd(i)*1.5)*p.s} fill={L.gold} opacity={phase(frame,80,155)*(.13+rnd(i)*.33)}/>})}
    {(()=>{const h=proj(path3(mix(.08,.85,phase(frame,95,248))));return <HaloPoint id={id} x={h.x} y={h.y} r={5.5*h.s} opacity={phase(frame,83,115)}/>})()}
  </LateSvg>;
};
