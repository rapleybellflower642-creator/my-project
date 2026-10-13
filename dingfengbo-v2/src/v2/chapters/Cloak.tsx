import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {CloakVisual} from '../scenes/CloakVisual';
export const Cloak=()=>{const frame=useCurrentFrame();return <SceneShell index={6} start={1464} duration={263} chapter="照顾自己" poem="一蓑烟雨任平生。" warm={0.1} cards={[{"from": 58, "to": 257, "lines": ["照顾好自己，才有余力穿过风雨。"]}]}>
 <CloakVisual frame={frame} duration={263}/>
</SceneShell>;};
