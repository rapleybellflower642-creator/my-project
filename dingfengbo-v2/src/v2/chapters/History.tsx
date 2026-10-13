import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {HistoryVisual} from '../scenes/HistoryVisual';
export const History=()=>{const frame=useCurrentFrame();return <SceneShell index={1} start={210} duration={198} chapter="沙湖道中" poem="定风波" warm={0.1} cards={[{"from": 45, "to": 192, "lines": ["1082年，黄州。", "沙湖道中，一场雨。"]}]}>
 <HistoryVisual frame={frame} duration={198}/>
</SceneShell>;};
