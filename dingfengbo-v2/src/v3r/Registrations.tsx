import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {FilmV3Remake,Chapter,CoverV3Remake} from './Film';
export const V3RemakeRegistrations=()=> <>
 <Composition id="DingFengBoV3Remake" component={FilmV3Remake} width={1920} height={1080} fps={30} durationInFrames={3600} defaultProps={{renderAudio:true}}/>
 <Still id="CoverV3Remake" component={CoverV3Remake} width={1920} height={1080}/>
 <Folder name="V3-Remake-Chapters">
  <Composition id="V3R-Hook" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={210} defaultProps={{start:0}}/>
  <Composition id="V3R-Exile" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={330} defaultProps={{start:7}}/>
  <Composition id="V3R-Cultivate" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:18}}/>
  <Composition id="V3R-Rain" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:28}}/>
  <Composition id="V3R-Listen" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={330} defaultProps={{start:38}}/>
  <Composition id="V3R-Walk" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:49}}/>
  <Composition id="V3R-Light" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{start:59}}/>
  <Composition id="V3R-Who" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={360} defaultProps={{start:68}}/>
  <Composition id="V3R-Cold" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{start:80}}/>
  <Composition id="V3R-Sun" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{start:88}}/>
  <Composition id="V3R-Return" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={420} defaultProps={{start:97}}/>
  <Composition id="V3R-Ending" component={Chapter} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{start:111}}/>
 </Folder>
</>;
