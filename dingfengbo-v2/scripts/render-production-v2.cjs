const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderMedia,renderStill}=require('@remotion/renderer');
const path=require('node:path');const fs=require('node:fs');const crypto=require('node:crypto');
(async()=>{
 const started=Date.now();
 const browserExecutable=process.argv[2]||path.resolve('scripts/chromium-cpu-raster.sh');
 const chromiumOptions={gl:'swangle'};
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.resolve('out/production-bundle')});
 const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions,logLevel:'error'});
 const progressFile='out/render-progress.json';let milestone=-1;
 try{
  const composition=await selectComposition({serveUrl,id:'DingFengBoV2',puppeteerInstance:browser,chromiumOptions});
  const cover=await selectComposition({serveUrl,id:'CoverV2',puppeteerInstance:browser,chromiumOptions});
  await renderStill({serveUrl,composition:cover,puppeteerInstance:browser,chromiumOptions,output:'out/cover-v2.png',imageFormat:'png'});
  console.log('Rendering V2: 3600 frames, 1920x1080, 30fps, swangle');
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,chromiumOptions,outputLocation:'out/render-master-v2.mp4',codec:'h264',crf:18,jpegQuality:95,audioBitrate:'320k',concurrency:3,timeoutInMilliseconds:90000,onProgress:({renderedFrames,encodedFrames,progress})=>{
   const state={renderedFrames,encodedFrames,progress,elapsedSeconds:Math.round((Date.now()-started)/1000)};
   fs.writeFileSync(progressFile,JSON.stringify(state));
   const n=Math.floor(renderedFrames/180);if(n>milestone){milestone=n;console.log(JSON.stringify(state));}
  }});
  const stats={status:'rendered',duration_frames:3600,fps:30,width:1920,height:1080,elapsedSeconds:Math.round((Date.now()-started)/1000),bgm_mix_sha256:crypto.createHash('sha256').update(fs.readFileSync('public/audio/soundtrack-v2.wav')).digest('hex')};
  fs.writeFileSync('out/render-record.json',JSON.stringify(stats,null,2)+'\n');
  console.log(JSON.stringify(stats));
 }finally{await browser.close({silent:true})}
})().catch(e=>{console.error(e);process.exit(1)});
