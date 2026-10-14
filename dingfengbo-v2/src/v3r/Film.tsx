import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Series,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import {Audio} from '@remotion/media';
import {FrameSvg} from './Frame';

let fonts:Promise<void>|undefined;
const Fonts=()=>{
 const [handle]=useState(()=>delayRender('V3 remake Chinese fonts'));
 useEffect(()=>{
  if(!fonts)fonts=Promise.all([
   new FontFace('Noto Serif CJK SC',`url("${staticFile('fonts/Serif.woff')}")`).load(),
   new FontFace('Noto Sans CJK SC',`url("${staticFile('fonts/Sans.woff')}")`).load(),
  ]).then(loaded=>{loaded.forEach(font=>document.fonts.add(font));});
  fonts.then(()=>continueRender(handle)).catch(cancelRender);
 },[handle]);return null;
};

export const Chapter=({start=0}:{start?:number})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 return <AbsoluteFill><Fonts/><FrameSvg frame={frame+start*fps} fps={fps}/></AbsoluteFill>;
};
export const FilmV3Remake=({renderAudio=true}:{renderAudio?:boolean})=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'#122723'}}>
  <Fonts/>
  {renderAudio&&<Audio src={staticFile('audio/soundtrack-v3r.m4a')} premountFor={fps}/>}
  <Series>
   <Series.Sequence name="悬念：谁怕" durationInFrames={7*fps} premountFor={fps}><Chapter start={0}/></Series.Sequence>
   <Series.Sequence name="贬居黄州" durationInFrames={11*fps} premountFor={fps}><Chapter start={7}/></Series.Sequence>
   <Series.Sequence name="躬耕东坡" durationInFrames={10*fps} premountFor={fps}><Chapter start={18}/></Series.Sequence>
   <Series.Sequence name="沙湖遇雨" durationInFrames={10*fps} premountFor={fps}><Chapter start={28}/></Series.Sequence>
   <Series.Sequence name="莫听" durationInFrames={11*fps} premountFor={fps}><Chapter start={38}/></Series.Sequence>
   <Series.Sequence name="吟啸徐行" durationInFrames={10*fps} premountFor={fps}><Chapter start={49}/></Series.Sequence>
   <Series.Sequence name="轻胜马" durationInFrames={9*fps} premountFor={fps}><Chapter start={59}/></Series.Sequence>
   <Series.Sequence name="谁怕：任平生" durationInFrames={12*fps} premountFor={fps}><Chapter start={68}/></Series.Sequence>
   <Series.Sequence name="微冷" durationInFrames={8*fps} premountFor={fps}><Chapter start={80}/></Series.Sequence>
   <Series.Sequence name="斜阳相迎" durationInFrames={9*fps} premountFor={fps}><Chapter start={88}/></Series.Sequence>
   <Series.Sequence name="回首归去" durationInFrames={14*fps} premountFor={fps}><Chapter start={97}/></Series.Sequence>
   <Series.Sequence name="余韵" durationInFrames={9*fps} premountFor={fps}><Chapter start={111}/></Series.Sequence>
  </Series>
 </AbsoluteFill>;
};
export const CoverV3Remake=()=> <AbsoluteFill><Fonts/><FrameSvg frame={2090}/></AbsoluteFill>;
