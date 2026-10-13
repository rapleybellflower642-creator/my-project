import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {WeatherVisual} from '../scenes/WeatherVisual';
export const Weather=()=>{const frame=useCurrentFrame();return <SceneShell index={9} start={2255} duration={396} chapter="一段与一生" poem="一时阴晴，一生辽阔。" warm={0.35} cards={[{"from": 58, "to": 206, "lines": ["天气会变，感受会变。"]}, {"from": 206, "to": 390, "lines": ["眼前的一段，容不下对一生的判决。"]}]}>
 <WeatherVisual frame={frame} duration={396}/>
</SceneShell>;};
