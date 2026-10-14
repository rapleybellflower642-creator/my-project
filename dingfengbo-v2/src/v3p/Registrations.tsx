import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {FilmV3Pulse,PulseChapter,CoverV3Pulse} from './Film';
export const V3PulseRegistrations=()=> <>
 <Composition id="DingFengBoV3Pulse" component={FilmV3Pulse} width={1920} height={1080} fps={30} durationInFrames={3600} defaultProps={{renderAudio:true}}/>
 <Still id="CoverV3Pulse" component={CoverV3Pulse} width={1920} height={1080}/>
 <Folder name="V3-Pulse">
  <Composition id="V3P-Hook" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={210} defaultProps={{startFrame:0}}/>
  <Composition id="V3P-Title" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={124} defaultProps={{startFrame:210}}/>
  <Composition id="V3P-History" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={363} defaultProps={{startFrame:334}}/>
  <Composition id="V3P-Cultivate" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={272} defaultProps={{startFrame:697}}/>
  <Composition id="V3P-Rain" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={297} defaultProps={{startFrame:969}}/>
  <Composition id="V3P-Listen" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={305} defaultProps={{startFrame:1266}}/>
  <Composition id="V3P-Walk" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={288} defaultProps={{startFrame:1571}}/>
  <Composition id="V3P-Light" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={297} defaultProps={{startFrame:1859}}/>
  <Composition id="V3P-Who" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={305} defaultProps={{startFrame:2156}}/>
  <Composition id="V3P-Cold" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={239} defaultProps={{startFrame:2461}}/>
  <Composition id="V3P-Sun" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={305} defaultProps={{startFrame:2700}}/>
  <Composition id="V3P-Return" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={330} defaultProps={{startFrame:3005}}/>
  <Composition id="V3P-Ending" component={PulseChapter} width={1920} height={1080} fps={30} durationInFrames={265} defaultProps={{startFrame:3335}}/>
 </Folder>
</>;
