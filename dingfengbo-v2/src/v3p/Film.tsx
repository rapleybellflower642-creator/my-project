import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Series,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import {Audio} from '@remotion/media';
import {FrameSvg} from './Frame';
import {ASSET_COUNTS,assetPath,AssetKind} from './Common';
let readiness:Promise<void>|undefined;
const Ready=()=>{
 const [handle]=useState(()=>delayRender('Pulse film fonts and 3D materials'));
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
export const PulseChapter=({startFrame=0}:{startFrame?:number})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'#05080b'}}><Ready/><FrameSvg frame={frame+Math.round(startFrame*fps/30)} fps={fps}/></AbsoluteFill>;
};
export const FilmV3Pulse=({renderAudio=true}:{renderAudio?:boolean})=>{
 const {fps}=useVideoConfig();return <AbsoluteFill style={{background:'#05080b'}}>
  <Ready/>{renderAudio&&<Audio src={staticFile('audio/soundtrack-v3p.m4a')} premountFor={fps}/>}
  <Series>
   <Series.Sequence name="低谷与悬念" durationInFrames={210} premountFor={fps}><PulseChapter startFrame={0}/></Series.Sequence>
   <Series.Sequence name="定风波" durationInFrames={124} premountFor={fps}><PulseChapter startFrame={210}/></Series.Sequence>
   <Series.Sequence name="乌台诗案与黄州" durationInFrames={363} premountFor={fps}><PulseChapter startFrame={334}/></Series.Sequence>
   <Series.Sequence name="躬耕东坡" durationInFrames={272} premountFor={fps}><PulseChapter startFrame={697}/></Series.Sequence>
   <Series.Sequence name="沙湖道中" durationInFrames={297} premountFor={fps}><PulseChapter startFrame={969}/></Series.Sequence>
   <Series.Sequence name="莫听" durationInFrames={305} premountFor={fps}><PulseChapter startFrame={1266}/></Series.Sequence>
   <Series.Sequence name="何妨徐行" durationInFrames={288} premountFor={fps}><PulseChapter startFrame={1571}/></Series.Sequence>
   <Series.Sequence name="轻胜马" durationInFrames={297} premountFor={fps}><PulseChapter startFrame={1859}/></Series.Sequence>
   <Series.Sequence name="谁怕，任平生" durationInFrames={305} premountFor={fps}><PulseChapter startFrame={2156}/></Series.Sequence>
   <Series.Sequence name="微冷" durationInFrames={239} premountFor={fps}><PulseChapter startFrame={2461}/></Series.Sequence>
   <Series.Sequence name="斜照相迎" durationInFrames={305} premountFor={fps}><PulseChapter startFrame={2700}/></Series.Sequence>
   <Series.Sequence name="回首归去" durationInFrames={330} premountFor={fps}><PulseChapter startFrame={3005}/></Series.Sequence>
   <Series.Sequence name="也无风雨也无晴" durationInFrames={265} premountFor={fps}><PulseChapter startFrame={3335}/></Series.Sequence>
  </Series>
 </AbsoluteFill>;
};
export const CoverV3Pulse=()=> <AbsoluteFill><Ready/><FrameSvg frame={285}/></AbsoluteFill>;
