import {EDIT_GRID} from './edit-grid';
import {CHAPTERS as ORIGINAL_CHAPTERS,TEXT_CUES as ORIGINAL_CUES} from '../v3g/timeline';
export const FPS=30;
export const DURATION=120;
export const SHOTS=EDIT_GRID.entries;
export const CHAPTERS=EDIT_GRID.chapters.map(chapter=>({
 id:chapter.id,title:ORIGINAL_CHAPTERS.find(c=>c.id===chapter.id)!.title,
 from:chapter.startFrame/FPS,to:chapter.endFrame/FPS,fromFrame:chapter.startFrame,toFrame:chapter.endFrame,shotCount:chapter.shotCount,
}));
// Captions keep their reading time across multiple camera cuts; timing follows the music-aligned chapter boundaries.
export const TEXT_CUES=ORIGINAL_CUES.map(cue=>{
 const before=ORIGINAL_CHAPTERS.find(c=>cue.from>=c.from&&cue.from<c.to)!;
 const after=CHAPTERS.find(c=>c.id===before.id)!;
 const retime=(t:number)=>Math.round(after.fromFrame+(t-before.from)/(before.to-before.from)*(after.toFrame-after.fromFrame))/FPS;
 return {text:cue.text,from:retime(cue.from),to:Math.min(after.to,retime(cue.to))};
});
