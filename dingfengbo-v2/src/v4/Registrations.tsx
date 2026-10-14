import React from 'react';
import {Composition,Folder,Still} from 'remotion';
import {FilmV4} from './Film';
import {CoverV4} from './Shot';
import {Chapter1,Chapter2,Chapter3,Chapter4,Chapter5,Chapter6,Chapter7,Chapter8,Chapter9,Chapter10,Chapter11,Chapter12,Chapter13,Chapter14} from './Chapters';
export const V4Registrations=()=> <>
 <Composition id="DingFengBoV4" component={FilmV4} width={1920} height={1080} fps={30} durationInFrames={17828} defaultProps={{renderAudio:true}}/>
 <Still id="CoverV4" component={CoverV4} width={1920} height={1080}/>
 <Folder name="V4-Chapters">
  <Composition id="V4-Chapter-1" component={Chapter1} width={1920} height={1080} fps={30} durationInFrames={1322}/>
  <Composition id="V4-Chapter-2" component={Chapter2} width={1920} height={1080} fps={30} durationInFrames={1289}/>
  <Composition id="V4-Chapter-3" component={Chapter3} width={1920} height={1080} fps={30} durationInFrames={1058}/>
  <Composition id="V4-Chapter-4" component={Chapter4} width={1920} height={1080} fps={30} durationInFrames={1487}/>
  <Composition id="V4-Chapter-5" component={Chapter5} width={1920} height={1080} fps={30} durationInFrames={1455}/>
  <Composition id="V4-Chapter-6" component={Chapter6} width={1920} height={1080} fps={30} durationInFrames={1519}/>
  <Composition id="V4-Chapter-7" component={Chapter7} width={1920} height={1080} fps={30} durationInFrames={809}/>
  <Composition id="V4-Chapter-8" component={Chapter8} width={1920} height={1080} fps={30} durationInFrames={1553}/>
  <Composition id="V4-Chapter-9" component={Chapter9} width={1920} height={1080} fps={30} durationInFrames={991}/>
  <Composition id="V4-Chapter-10" component={Chapter10} width={1920} height={1080} fps={30} durationInFrames={1454}/>
  <Composition id="V4-Chapter-11" component={Chapter11} width={1920} height={1080} fps={30} durationInFrames={1123}/>
  <Composition id="V4-Chapter-12" component={Chapter12} width={1920} height={1080} fps={30} durationInFrames={811}/>
  <Composition id="V4-Chapter-13" component={Chapter13} width={1920} height={1080} fps={30} durationInFrames={1553}/>
  <Composition id="V4-Chapter-14" component={Chapter14} width={1920} height={1080} fps={30} durationInFrames={1404}/>
 </Folder>
</>;
