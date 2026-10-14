import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {FilmV3Gold,GoldChapter,CoverV3Gold} from './Film';
export const V3GoldRegistrations=()=> <>
 <Composition id="DingFengBoV3Gold" component={FilmV3Gold} width={1920} height={1080} fps={30} durationInFrames={3600} defaultProps={{renderAudio:true}}/>
 <Still id="CoverV3Gold" component={CoverV3Gold} width={1920} height={1080}/>
 <Folder name="V3-Black-Gold">
  <Composition id="V3G-Hook" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={210} defaultProps={{start:0}}/>
  <Composition id="V3G-Title" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={120} defaultProps={{start:7}}/>
  <Composition id="V3G-History" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={360} defaultProps={{start:11}}/>
  <Composition id="V3G-Cultivate" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{start:23}}/>
  <Composition id="V3G-Rain" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:32}}/>
  <Composition id="V3G-Listen" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:42}}/>
  <Composition id="V3G-Walk" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:52}}/>
  <Composition id="V3G-Light" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:62}}/>
  <Composition id="V3G-Who" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:72}}/>
  <Composition id="V3G-Cold" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{start:82}}/>
  <Composition id="V3G-Sun" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{start:90}}/>
  <Composition id="V3G-Return" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={330} defaultProps={{start:100}}/>
  <Composition id="V3G-Ending" component={GoldChapter} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{start:111}}/>
 </Folder>
</>;
