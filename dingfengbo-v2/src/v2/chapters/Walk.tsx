import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {WalkVisual} from '../scenes/WalkVisual';
export const Walk=()=>{const frame=useCurrentFrame();return <SceneShell index={3} start={672} duration={264} chapter="走稳一步" poem="何妨吟啸且徐行。" warm={0.1} cards={[{"from": 64, "to": 258, "lines": ["看清脚下，把下一步走稳。"]}]}>
 <WalkVisual frame={frame} duration={264}/>
</SceneShell>;};
