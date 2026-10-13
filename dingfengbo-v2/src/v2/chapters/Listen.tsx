import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneShell} from '../SceneShell';
import {ListenVisual} from '../scenes/ListenVisual';
export const Listen=()=>{const frame=useCurrentFrame();return <SceneShell index={2} start={408} duration={264} chapter="选择回应" poem="莫听穿林打叶声。" warm={0.1} cards={[{"from": 50, "to": 144, "lines": ["外界的声音很响。"]}, {"from": 144, "to": 258, "lines": ["先分清，哪些值得回应。"]}]}>
 <ListenVisual frame={frame} duration={264}/>
</SceneShell>;};
