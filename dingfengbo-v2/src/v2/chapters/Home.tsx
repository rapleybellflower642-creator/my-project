import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {HomeVisual} from '../scenes/HomeVisual';
export const Home=()=>{const frame=useCurrentFrame();return <SceneShell index={11} start={2915} duration={263} chapter="回到眼前" poem="归去。" warm={0.35} cards={[{"from": 52, "to": 148, "lines": ["把目光收回当下。"]}, {"from": 148, "to": 257, "lines": ["今天，还有生活要继续。"]}]}>
 <HomeVisual frame={frame} duration={263}/>
</SceneShell>;};
