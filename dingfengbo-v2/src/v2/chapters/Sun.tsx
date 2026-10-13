import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {SunVisual} from '../scenes/SunVisual';
export const Sun=()=>{const frame=useCurrentFrame();return <SceneShell index={8} start={1991} duration={264} chapter="接住暖意" poem="山头斜照却相迎。" warm={0.85} cards={[{"from": 60, "to": 258, "lines": ["温暖来到时，也让自己好好感受。"]}]}>
 <SunVisual frame={frame} duration={264}/>
</SceneShell>;};
