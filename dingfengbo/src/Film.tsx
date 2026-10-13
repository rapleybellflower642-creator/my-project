import {Audio} from '@remotion/media';
import {TransitionSeries,linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {staticFile,useVideoConfig} from 'remotion';
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

export const Film=()=>{
 const {fps}=useVideoConfig();
 return <>
  <Audio src={staticFile('audio/soundtrack.wav')} premountFor={fps}/>
  <TransitionSeries>
   <TransitionSeries.Sequence name="00 风起" durationInFrames={6*fps+12} premountFor={fps}><Opening/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="01 黄州" durationInFrames={9*fps+12} premountFor={fps}><History/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="02 听雨" durationInFrames={9*fps+12} premountFor={fps}><Listen/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="03 徐行" durationInFrames={9*fps+12} premountFor={fps}><Walk/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="04 轻装" durationInFrames={9*fps+12} premountFor={fps}><Simple/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="05 谁怕" durationInFrames={9*fps+12} premountFor={fps}><Fear/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="06 烟雨" durationInFrames={9*fps+12} premountFor={fps}><Cloak/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="07 微冷" durationInFrames={10*fps+12} premountFor={fps}><Cold/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="08 斜照" durationInFrames={9*fps+12} premountFor={fps}><Sun/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="09 阴晴" durationInFrames={9.4*fps+12} premountFor={fps}><Weather/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="10 回首" durationInFrames={8.8*fps+12} premountFor={fps}><LookBack/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="11 归去" durationInFrames={8.8*fps+12} premountFor={fps}><Home/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="12 从容" durationInFrames={9*fps+12} premountFor={fps}><Freedom/></TransitionSeries.Sequence>
   <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
   <TransitionSeries.Sequence name="13 定风波" durationInFrames={5*fps} premountFor={fps}><Ending/></TransitionSeries.Sequence>
  </TransitionSeries>
 </>;
};
