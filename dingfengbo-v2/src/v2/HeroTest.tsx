import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Hero3D} from './Hero3D';
import {Backdrop,FontGate} from './SceneShell';
export const HeroTest:React.FC<{kind:'drop'|'gear'|'cloak'}>=({kind})=>{
 const frame=useCurrentFrame();return <AbsoluteFill><Backdrop frame={frame}/><FontGate/><div style={{position:'absolute',left:310,top:160}}><Hero3D kind={kind} frame={frame} width={1300} height={790} reveal={Math.min(1,frame/120)} warm={.5}/></div></AbsoluteFill>;
};
