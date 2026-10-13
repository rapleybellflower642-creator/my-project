import React from 'react';
import {AbsoluteFill,staticFile,useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
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
export const Film=()=>{const {fps}=useVideoConfig();return <AbsoluteFill style={{background:'#090d10'}}>
 <Audio src={staticFile('audio/soundtrack-v2.wav')} premountFor={fps}/>
 <TransitionSeries>
  <TransitionSeries.Sequence name="风雨骤至" durationInFrames={210} premountFor={fps}><Opening/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="沙湖道中" durationInFrames={198} premountFor={fps}><History/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="选择回应" durationInFrames={264} premountFor={fps}><Listen/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="走稳一步" durationInFrames={264} premountFor={fps}><Walk/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="自己的步调" durationInFrames={264} premountFor={fps}><Simple/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="允许不安" durationInFrames={264} premountFor={fps}><Fear/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="照顾自己" durationInFrames={263} premountFor={fps}><Cloak/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="真实的感受" durationInFrames={264} premountFor={fps}><Cold/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="接住暖意" durationInFrames={264} premountFor={fps}><Sun/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="一段与一生" durationInFrames={396} premountFor={fps}><Weather/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="回看走过的路" durationInFrames={264} premountFor={fps}><LookBack/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="回到眼前" durationInFrames={263} premountFor={fps}><Home/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="安放阴晴" durationInFrames={264} premountFor={fps}><Freedom/></TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="定风波" durationInFrames={158} premountFor={fps}><Ending/></TransitionSeries.Sequence>
 </TransitionSeries>
</AbsoluteFill>;};
