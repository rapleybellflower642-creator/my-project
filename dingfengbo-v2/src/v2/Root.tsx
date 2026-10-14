import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {V4Registrations} from '../v4/Registrations';
import {V3RemakeRegistrations} from '../v3r/Registrations';
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
import {FilmV3} from '../v3/Film';
import {CoverV3,Hook,Case,Exile,Cultivate,RainRecord,Companions,Walk as WalkV3,LightStep,Who,Cold as ColdV3,Sun as SunV3,LookBack as LookBackV3,Freedom as FreedomV3,Meaning,Ending as EndingV3} from '../v3/Scenes';
export const Root=()=> <>
 <V3RemakeRegistrations/>
 <V4Registrations/>
 <Composition id="DingFengBoV3" component={FilmV3} width={1920} height={1080} fps={30} durationInFrames={3600} defaultProps={{renderAudio:true}}/>
 <Still id="CoverV3" component={CoverV3} width={1920} height={1080}/>
 <Folder name="V3-Scenes">
  <Composition id="V3-Hook" component={Hook} width={1920} height={1080} fps={30} durationInFrames={210}/>
  <Composition id="V3-Case" component={Case} width={1920} height={1080} fps={30} durationInFrames={198}/>
  <Composition id="V3-Exile" component={Exile} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Cultivate" component={Cultivate} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-RainRecord" component={RainRecord} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Companions" component={Companions} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Walk" component={WalkV3} width={1920} height={1080} fps={30} durationInFrames={263}/>
  <Composition id="V3-LightStep" component={LightStep} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Who" component={Who} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Cold" component={ColdV3} width={1920} height={1080} fps={30} durationInFrames={198}/>
  <Composition id="V3-Sun" component={SunV3} width={1920} height={1080} fps={30} durationInFrames={198}/>
  <Composition id="V3-LookBack" component={LookBackV3} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Freedom" component={FreedomV3} width={1920} height={1080} fps={30} durationInFrames={263}/>
  <Composition id="V3-Meaning" component={Meaning} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="V3-Ending" component={EndingV3} width={1920} height={1080} fps={30} durationInFrames={158}/>
 </Folder>
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
