import React from 'react';
import {PALETTE,SERIF,SANS,smooth} from './SceneShell';
export const ClosingTitle:React.FC<{frame:number}>=({frame})=>{
 const a=smooth(frame/22);
 return <>
  <div style={{position:'absolute',left:0,right:0,top:235,textAlign:'center',fontFamily:SANS,fontSize:23,letterSpacing:12,color:PALETTE.gold,opacity:a*.65}}>苏轼 · 元丰五年</div>
  <div style={{position:'absolute',left:0,right:0,top:306,textAlign:'center',fontFamily:SERIF,fontSize:156,letterSpacing:27,color:PALETTE.gold,opacity:a,translate:`0 ${16*(1-a)}px`,textShadow:'0 3px 30px rgba(185,137,56,.17)'}}>定风波</div>
  <div style={{position:'absolute',left:0,right:0,top:559,textAlign:'center',fontFamily:SERIF,fontSize:49,letterSpacing:6,color:PALETTE.ivory,opacity:smooth((frame-16)/18)}}>风雨有时，脚步由你。</div>
  <div style={{position:'absolute',left:0,right:0,top:931,textAlign:'center',fontFamily:SANS,fontSize:21,letterSpacing:3,color:'#a29884',opacity:smooth((frame-35)/18)*.74}}>据苏轼词作作现代释意 · 配乐《算力小曲》</div>
 </>;
};
