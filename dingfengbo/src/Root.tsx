import {Composition,Folder,Still} from 'remotion';
import {Film} from './Film';
import {Cover} from './Cover';
import {Opening} from './scenes/Opening';
import {History} from './scenes/History';
import {Listen} from './scenes/Listen';
import {Walk} from './scenes/Walk';
import {Simple} from './scenes/Simple';
import {Fear} from './scenes/Fear';
import {Cloak} from './scenes/Cloak';
import {Cold} from './scenes/Cold';
import {Sun} from './scenes/Sun';
import {Weather} from './scenes/Weather';
import {LookBack} from './scenes/LookBack';
import {Home} from './scenes/Home';
import {Freedom} from './scenes/Freedom';
import {Ending} from './scenes/Ending';

export const Root=()=> <>
 <Composition id="DingFengBo" component={Film} width={1920} height={1080} fps={30} durationInFrames={3600}/>
 <Still id="Cover" component={Cover} width={1920} height={1080}/>
 <Folder name="Scenes">
  <Composition id="Opening" component={Opening} width={1920} height={1080} fps={30} durationInFrames={180}/>
  <Composition id="History" component={History} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Listen" component={Listen} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Walk" component={Walk} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Simple" component={Simple} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Fear" component={Fear} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Cloak" component={Cloak} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Cold" component={Cold} width={1920} height={1080} fps={30} durationInFrames={300}/>
  <Composition id="Sun" component={Sun} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Weather" component={Weather} width={1920} height={1080} fps={30} durationInFrames={282}/>
  <Composition id="LookBack" component={LookBack} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="Home" component={Home} width={1920} height={1080} fps={30} durationInFrames={264}/>
  <Composition id="Freedom" component={Freedom} width={1920} height={1080} fps={30} durationInFrames={270}/>
  <Composition id="Ending" component={Ending} width={1920} height={1080} fps={30} durationInFrames={150}/>
 </Folder>
</>;
