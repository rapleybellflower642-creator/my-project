import {AbsoluteFill} from 'remotion';
import {FontGate,C,serif,sans} from './design';
import {Landscape} from './visuals/Scenery';
import {Traveler} from './visuals/Traveler';
import {Atmosphere} from './visuals/Atmosphere';

export const Cover=()=> <AbsoluteFill style={{background:C.ink,overflow:'hidden'}}>
 <FontGate/>
 <Landscape name="warm-mountain" t={3} duration={9} warm={.9}/>
 <Traveler t={22} x={1465} y={960} scale={.47} warm={.8} walking={false}/>
 <Atmosphere t={17} rain={.025} warm={.58} mist={.17}/>
 <div style={{position:'absolute',left:150,top:198,fontFamily:sans,fontSize:30,letterSpacing:12,color:C.paper,opacity:.75}}>苏轼 · 两分钟诗意人生</div>
 <div style={{position:'absolute',left:143,top:311,fontFamily:serif,fontSize:194,letterSpacing:24,color:C.paper,textShadow:'0 4px 30px rgba(6,24,25,.5)'}}>定风波</div>
 <div style={{position:'absolute',left:164,top:627,fontFamily:serif,fontSize:60,letterSpacing:8,color:C.gold}}>风雨有时，脚步由你。</div>
 <div style={{position:'absolute',left:839,top:351,width:64,height:105,border:'2px solid #b8553b',fontFamily:serif,fontSize:32,lineHeight:1.35,textAlign:'center',paddingTop:7,color:'#c36d50'}}>苏<br/>轼</div>
</AbsoluteFill>;
