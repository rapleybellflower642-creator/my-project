import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {ColdVisual} from '../scenes/ColdVisual';
export const Cold=()=>{const frame=useCurrentFrame();return <SceneShell index={7} start={1727} duration={264} chapter="真实的感受" poem="料峭春风吹酒醒，微冷。" warm={0.1} cards={[{"from": 70, "to": 164, "lines": ["会冷，会累，都很真实。"]}, {"from": 164, "to": 258, "lines": ["不必急着给整个人生下结论。"]}]}>
 <ColdVisual frame={frame} duration={264}/>
</SceneShell>;};
