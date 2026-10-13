const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const path=require('node:path');const fs=require('node:fs');
(async()=>{
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.resolve('out/bundle')});
 const chromiumOptions={gl:'swangle'};
 const browser=await openBrowser('chrome',{browserExecutable:path.resolve('scripts/chromium-cpu-raster.sh'),chromiumOptions,logLevel:'error'});
 try{
  const composition=await selectComposition({serveUrl,id:'DingFengBoV2',puppeteerInstance:browser,chromiumOptions});
  for(const frame of [1200,1524,1650,2375,3238,3370]){
   await renderStill({serveUrl,composition,puppeteerInstance:browser,chromiumOptions,output:`out/review-v2/frame-${String(frame).padStart(4,'0')}.jpg`,frame,imageFormat:'jpeg',jpegQuality:94,scale:.5});
   console.log('QA frame',frame);
  }
  const cover=await selectComposition({serveUrl,id:'CoverV2',puppeteerInstance:browser,chromiumOptions});
  await renderStill({serveUrl,composition:cover,puppeteerInstance:browser,chromiumOptions,output:'out/cover-v2.png',imageFormat:'png'});
  console.log('Cover saved');
  let last=-1;const began=Date.now();
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,chromiumOptions,outputLocation:'out/cloth-motion-preview.mp4',codec:'h264',crf:18,audioBitrate:'192k',frameRange:[1464,1726],scale:.5,concurrency:2,onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/50);if(n>last){last=n;console.log('Preview frames',renderedFrames);}}});
  console.log('Motion preview complete, seconds',(Date.now()-began)/1000);
 }finally{await browser.close({silent:true})}
})().catch(e=>{console.error(e);process.exit(1)});
