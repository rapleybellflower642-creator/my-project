import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {Film} from './Film';
import {Cover} from './Cover';
import {HeroTest} from './HeroTest';
import {Opening} from './chapters/Opening';
import {History} from './chapters/History';
import {Listen} from './chapters/Listen';
import {Walk} from './chapters/Walk';
import {Simple} from './chapters/Simple';
import {Fear} from './chapters/Fear';
import {Cloak} from './chapters/Cloak';
import {Cold} from './chapters/Cold';
import {Sun} from './chapters/Sun';
import {Weather} from './chapters/Weather';
import {LookBack} from './chapters/LookBack';
import {Home} from './chapters/Home';
import {Freedom} from './chapters/Freedom';
import {Ending} from './chapters/Ending';
export const Root=()=> <>
 <Composition id="DingFengBoV2" component={Film} width={1920} height={1080} fps={30} durationInFrames={3600}/>
 <Still id="CoverV2" component={Cover} width={1920} height={1080}/>
 <Folder name="Scenes">
  <Composition id="OpeningV2" component={Opening} width={1920} height={1080} fps={30} durationInFrames={210}/>
  <Composition id="HistoryV2" component={History} width={1920} height={1080} fps={30} durationInFrames={198}/>
  <Composition id="ListenV2" component={Listen} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="WalkV2" component={Walk} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="SimpleV2" component={Simple} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="FearV2" component={Fear} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="CloakV2" component={Cloak} width={1920} height={1080} fps={30} durationInFrames={263}/>
  <Composition id="ColdV2" component={Cold} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="SunV2" component={Sun} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="WeatherV2" component={Weather} width={1920} height={1080} fps={30} durationInFrames={396}/>
  <Composition id="LookBackV2" component={LookBack} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="HomeV2" component={Home} width={1920} height={1080} fps={30} durationInFrames={263}/>
  <Composition id="FreedomV2" component={Freedom} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="EndingV2" component={Ending} width={1920} height={1080} fps={30} durationInFrames={158}/>
 </Folder>
 <Folder name="Objects">
  <Composition id="Hero-drop" component={HeroTest} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{kind:"drop"}}/>
  <Composition id="Hero-gear" component={HeroTest} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{kind:"gear"}}/>
  <Composition id="Hero-cloak" component={HeroTest} width={1920} height={1080} fps={30} durationInFrames={270} defaultProps={{kind:"cloak"}}/>
 </Folder>
</>;
