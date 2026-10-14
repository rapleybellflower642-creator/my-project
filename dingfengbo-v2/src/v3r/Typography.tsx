import React from 'react';

export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
export const out=(x:number)=>1-Math.pow(1-clamp(x),3);
export const GOLD='#e8cc8f';
export const IVORY='#f1ead8';
export const SERIF='Noto Serif CJK SC';
export const SANS='Noto Sans CJK SC';

type TitleProps={text:string;t:number;x?:number;y?:number;size?:number;mode?:'ink'|'land'|'walk'|'light'|'cold'|'settle';delay?:number;center?:boolean;fill?:string;tracking?:number};

/** Phrase-level choreography; the complete phrase remains still after its entrance. */
export const Title=({text,t,x=118,y=174,size=86,mode='ink',delay=0,center=false,fill=GOLD,tracking=3}:TitleProps)=>{
 const chars=Array.from(text); const advance=size+tracking;
 const left=center?x-(chars.length*advance-tracking)/2:x;
 const local=t-delay;
 return <g aria-label={text}>
  {chars.map((ch,i)=>{
   const punctuation=/[，。？！：、]/.test(ch);
   let stagger=mode==='walk'?(i<2?0:i<4?.45:.95):mode==='land'?i*.055:mode==='settle'?0:i*.052;
   if(mode==='light')stagger=i*.055;
   const age=local-stagger;
   const p=out(age/(mode==='light'?.8:mode==='cold'?.65:.48));
   let dy=0,dx=0,s=1,alpha=p;
   if(mode==='land'){
    const u=clamp(age/.38);const spring=u===1?0:Math.exp(-7*u)*Math.cos(11*u);
    s=1+.16*spring;dy=-30*(1-out(age/.22));alpha=ease(age/.11);
   } else if(mode==='walk'){dx=-12*(1-p);dy=6*(1-p);}
   else if(mode==='cold'){s=.985+.015*p;dy=-4*(1-p);}
   else if(mode==='ink'){dx=-8*(1-p);}
   else if(mode==='light'){dx=-7*(1-p);}
   const cx=left+i*advance+size/2;
   return <g key={i} opacity={alpha} transform={`translate(${dx} ${dy}) translate(${cx} ${y-size*.34}) scale(${s}) translate(${-cx} ${-y+size*.34})`}>
    <text x={left+i*advance+2} y={y+3} fontFamily={SERIF} fontSize={size} fill="#071513" opacity=".5">{ch}</text>
    <text x={left+i*advance} y={y} fontFamily={SERIF} fontSize={size} fill={fill} opacity={punctuation?.92:1}>{ch}</text>
   </g>;
  })}
 </g>;
};

export const Caption=({text,t,start=0,end=100,y=987,size=48}:{text:string|string[];t:number;start?:number;end?:number;y?:number;size?:number})=>{
 if(t<start||t>=end)return null;
 const lines=Array.isArray(text)?text:[text];
 const opacity=ease((t-start)/.2)*ease((end-t)/.17);
 return <g opacity={opacity} fontFamily={SANS} fontSize={size} textAnchor="middle" letterSpacing="1.4">
  {lines.map((line,i)=>{
   const ly=y-(lines.length-1-i)*68;
   return <g key={i}><text x="962" y={ly+2} fill="#081413" stroke="#081413" strokeWidth="5" strokeLinejoin="round">{line}</text><text x="960" y={ly} fill={IVORY}>{line}</text></g>;
  })}
 </g>;
};

export const DateLine=({text,t,x=120,y=225}:{text:string;t:number;x?:number;y?:number})=><text x={x} y={y} fontFamily={SANS} fontSize="34" letterSpacing="5" fill="#bccdb5" opacity={ease(t/.4)}>{text}</text>;
