import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Series,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import {Audio} from '@remotion/media';
import {FrameSvg} from './Frame';
import {ASSET_COUNTS,assetPath,AssetKind} from './Common';
let readiness:Promise<void>|undefined;
const Ready=()=>{
 const [handle]=useState(()=>delayRender('Black-gold fonts and 3D materials'));
 useEffect(()=>{
  if(!readiness)readiness=Promise.all([
   Promise.all(['Serif','Sans'].map(async name=>{
    const font=await new FontFace(`Noto ${name} CJK SC`,`url("${staticFile(`fonts/${name}.woff`)}")`).load();document.fonts.add(font);
   })),
   Promise.all((Object.keys(ASSET_COUNTS) as AssetKind[]).flatMap(kind=>Array.from({length:ASSET_COUNTS[kind]},(_,i)=>new Promise<void>((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(new Error(`Missing 3D image: ${kind}/${i}`));img.src=staticFile(assetPath(kind,i).slice(1));
   })))),
  ]).then(()=>undefined);
  readiness.then(()=>continueRender(handle)).catch(cancelRender);
 },[handle]);return null;
};
export const GoldChapter=({start=0}:{start?:number})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'#05080b'}}><Ready/><FrameSvg frame={frame+Math.round(start*fps)} fps={fps}/></AbsoluteFill>;
};
export const FilmV3Gold=({renderAudio=true}:{renderAudio?:boolean})=>{
 const {fps}=useVideoConfig();return <AbsoluteFill style={{background:'#05080b'}}>
  <Ready/>{renderAudio&&<Audio src={staticFile('audio/soundtrack-v3g.m4a')} premountFor={fps}/>}
  <Series>
   <Series.Sequence name="低谷与悬念" durationInFrames={7*fps} premountFor={fps}><GoldChapter start={0}/></Series.Sequence>
   <Series.Sequence name="定风波" durationInFrames={4*fps} premountFor={fps}><GoldChapter start={7}/></Series.Sequence>
   <Series.Sequence name="乌台诗案与黄州" durationInFrames={12*fps} premountFor={fps}><GoldChapter start={11}/></Series.Sequence>
   <Series.Sequence name="躬耕东坡" durationInFrames={9*fps} premountFor={fps}><GoldChapter start={23}/></Series.Sequence>
   <Series.Sequence name="沙湖道中" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={32}/></Series.Sequence>
   <Series.Sequence name="莫听" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={42}/></Series.Sequence>
   <Series.Sequence name="何妨徐行" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={52}/></Series.Sequence>
   <Series.Sequence name="轻胜马" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={62}/></Series.Sequence>
   <Series.Sequence name="谁怕，任平生" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={72}/></Series.Sequence>
   <Series.Sequence name="微冷" durationInFrames={8*fps} premountFor={fps}><GoldChapter start={82}/></Series.Sequence>
   <Series.Sequence name="斜照相迎" durationInFrames={10*fps} premountFor={fps}><GoldChapter start={90}/></Series.Sequence>
   <Series.Sequence name="回首归去" durationInFrames={11*fps} premountFor={fps}><GoldChapter start={100}/></Series.Sequence>
   <Series.Sequence name="也无风雨也无晴" durationInFrames={9*fps} premountFor={fps}><GoldChapter start={111}/></Series.Sequence>
  </Series>
 </AbsoluteFill>;
};
export const CoverV3Gold=()=> <AbsoluteFill><Ready/><FrameSvg frame={285}/></AbsoluteFill>;
