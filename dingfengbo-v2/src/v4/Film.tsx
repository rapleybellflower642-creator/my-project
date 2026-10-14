import React from 'react';
import {AbsoluteFill,Audio,Series,staticFile,useVideoConfig} from 'remotion';
import {Chapter1,Chapter2,Chapter3,Chapter4,Chapter5,Chapter6,Chapter7,Chapter8,Chapter9,Chapter10,Chapter11,Chapter12,Chapter13,Chapter14} from './Chapters';
export const FilmV4=({renderAudio=true}:{renderAudio?:boolean})=>{const {fps}=useVideoConfig();return <AbsoluteFill style={{background:'#132d2d'}}>
 {renderAudio&&<Audio src={staticFile('audio/soundtrack-v4.m4a')}/>}
 <Series>
  <Series.Sequence name="人生也会下雨" durationInFrames={1322} premountFor={fps}><Chapter1/></Series.Sequence>
  <Series.Sequence name="黄州第三年" durationInFrames={1289} premountFor={fps}><Chapter2/></Series.Sequence>
  <Series.Sequence name="沙湖遇雨" durationInFrames={1058} premountFor={fps}><Chapter3/></Series.Sequence>
  <Series.Sequence name="莫听雨声" durationInFrames={1487} premountFor={fps}><Chapter4/></Series.Sequence>
  <Series.Sequence name="吟啸徐行" durationInFrames={1455} premountFor={fps}><Chapter5/></Series.Sequence>
  <Series.Sequence name="轻胜马" durationInFrames={1519} premountFor={fps}><Chapter6/></Series.Sequence>
  <Series.Sequence name="谁怕" durationInFrames={809} premountFor={fps}><Chapter7/></Series.Sequence>
  <Series.Sequence name="任平生" durationInFrames={1553} premountFor={fps}><Chapter8/></Series.Sequence>
  <Series.Sequence name="微冷" durationInFrames={991} premountFor={fps}><Chapter9/></Series.Sequence>
  <Series.Sequence name="斜阳相迎" durationInFrames={1454} premountFor={fps}><Chapter10/></Series.Sequence>
  <Series.Sequence name="回首来路" durationInFrames={1123} premountFor={fps}><Chapter11/></Series.Sequence>
  <Series.Sequence name="归去" durationInFrames={811} premountFor={fps}><Chapter12/></Series.Sequence>
  <Series.Sequence name="无雨无晴" durationInFrames={1553} premountFor={fps}><Chapter13/></Series.Sequence>
  <Series.Sequence name="稳住脚步" durationInFrames={1404} premountFor={fps}><Chapter14/></Series.Sequence>
 </Series>
</AbsoluteFill>;};
