import React from 'react';
import {AbsoluteFill, Series, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {Hook,Case,Exile,Cultivate,RainRecord,Companions,Walk,LightStep,Who,Cold,Sun,LookBack,Freedom,Meaning,Ending} from './Scenes';

export const FilmV3=({renderAudio=true}:{renderAudio?:boolean})=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'#090d10'}}>
  {renderAudio&&<Audio src={staticFile('audio/soundtrack-v3.wav')} premountFor={fps}/>}
  <Series>
   <Series.Sequence name="他凭什么说谁怕" durationInFrames={7*fps} premountFor={fps}><Hook/></Series.Sequence>
   <Series.Sequence name="1079乌台诗案" durationInFrames={6.6*fps} premountFor={fps}><Case/></Series.Sequence>
   <Series.Sequence name="1080贬居黄州" durationInFrames={8.8*fps} premountFor={fps}><Exile/></Series.Sequence>
   <Series.Sequence name="躬耕东坡" durationInFrames={8.8*fps} premountFor={fps}><Cultivate/></Series.Sequence>
   <Series.Sequence name="1082沙湖道中" durationInFrames={8.8*fps} premountFor={fps}><RainRecord/></Series.Sequence>
   <Series.Sequence name="雨中同行" durationInFrames={8.8*fps} premountFor={fps}><Companions/></Series.Sequence>
   <Series.Sequence name="吟啸徐行" durationInFrames={Math.round(263/30*fps)} premountFor={fps}><Walk/></Series.Sequence>
   <Series.Sequence name="竹杖芒鞋特写仅2秒" durationInFrames={8.8*fps} premountFor={fps}><LightStep/></Series.Sequence>
   <Series.Sequence name="谁怕任平生" durationInFrames={8.8*fps} premountFor={fps}><Who/></Series.Sequence>
   <Series.Sequence name="微冷" durationInFrames={6.6*fps} premountFor={fps}><Cold/></Series.Sequence>
   <Series.Sequence name="斜照" durationInFrames={6.6*fps} premountFor={fps}><Sun/></Series.Sequence>
   <Series.Sequence name="回首来路" durationInFrames={8.8*fps} premountFor={fps}><LookBack/></Series.Sequence>
   <Series.Sequence name="归去阴晴" durationInFrames={Math.round(263/30*fps)} premountFor={fps}><Freedom/></Series.Sequence>
   <Series.Sequence name="读回自己" durationInFrames={8.8*fps} premountFor={fps}><Meaning/></Series.Sequence>
   <Series.Sequence name="余韵" durationInFrames={Math.round(158/30*fps)} premountFor={fps}><Ending/></Series.Sequence>
  </Series>
 </AbsoluteFill>;
};
