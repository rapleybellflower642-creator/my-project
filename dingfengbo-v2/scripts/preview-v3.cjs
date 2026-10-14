// Render a review copy and representative frames; this is not the final master.
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

(async()=>{
 const output=path.resolve('out/v3');fs.mkdirSync(output,{recursive:true});
 const serveUrl=process.env.REMOTION_PREVIEW_BUNDLE||await bundle({entryPoint:path.resolve('src/index.ts')});
 const chromiumOptions={gl:'swangle'};
 const browser=await openBrowser('chrome',{browserExecutable:path.resolve('scripts/chromium-preview-v3.sh'),chromiumOptions,logLevel:'error'});
 try {
  const inputProps={renderAudio:false};
  const composition=await selectComposition({serveUrl,id:'DingFengBoV3',inputProps,puppeteerInstance:browser,chromiumOptions});
  if(composition.durationInFrames!==3600||composition.fps!==30)throw new Error('Unexpected V3 timeline');
  if(!process.argv.includes('--video-only')) {
  const requested=process.argv.slice(2).filter(x=>/^\d+$/.test(x)).map(Number);
  const frames=requested.length?requested:[40,111,180,313,548,793,1070,1310,1580,1755,1900,2100,2340,2550,2795,3050,3300,3530];
  let i=0;
  async function worker(){while(i<frames.length){const frame=frames[i++];await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,chromiumOptions,output:path.join(output,`frame-${String(frame).padStart(4,'0')}.jpg`),frame,imageFormat:'jpeg',jpegQuality:92,scale:.5});console.log(`V3 review frame ${frame}`);}}
  await Promise.all([worker(),worker()]);
  const cover=await selectComposition({serveUrl,id:'CoverV3',puppeteerInstance:browser,chromiumOptions});
  await renderStill({serveUrl,composition:cover,puppeteerInstance:browser,chromiumOptions,output:path.join(output,'cover.png'),imageFormat:'png'});
  }
  if(process.argv.includes('--stills-only'))return;
  const started=Date.now();let milestone=-1;
  await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,chromiumOptions,outputLocation:path.join(output,'preview-render.mp4'),codec:'h264',crf:22,scale:.5,muted:true,concurrency:4,timeoutInMilliseconds:90000,onProgress:({renderedFrames,encodedFrames,progress})=>{
   const mark=Math.floor(renderedFrames/150);
   if(mark>milestone){milestone=mark;const state={renderedFrames,encodedFrames,progress,elapsedSeconds:Math.round((Date.now()-started)/1000)};fs.writeFileSync(path.join(output,'render-progress.json'),JSON.stringify(state));console.log(JSON.stringify(state));}
  }});
  // Remux from the original mix for exact 120 s audio, leaving video unchanged.
  execFileSync('ffmpeg',['-v','error','-y','-i',path.join(output,'preview-render.mp4'),'-i','public/audio/soundtrack-v3.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t','120','-movflags','+faststart',path.join(output,'dingfengbo-v3-preview.mp4')]);
  console.log('Review copy complete: out/v3/dingfengbo-v3-preview.mp4');
 } finally {await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exit(1);});
