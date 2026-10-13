const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill}=require('@remotion/renderer');
const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
 const chromiumOptions={gl:'swangle'};
 const browser=await openBrowser('chrome',{browserExecutable:path.resolve('scripts/chromium-cpu-raster.sh'),chromiumOptions,logLevel:'error'});
 try{
 const composition=await selectComposition({serveUrl,id:'DingFengBoV2',puppeteerInstance:browser,chromiumOptions});
 const requested=process.argv.slice(2).map(Number);
 const frames=requested.length?requested:[10,44,134,310,498,590,770,861,1040,1160,1216,1360,1524,1650,1840,1940,2120,2375,2570,2790,3050,3250,3370,3520];
 fs.mkdirSync('out/review-v2',{recursive:true});
 let index=0;
 async function worker(){while(index<frames.length){const frame=frames[index++];const now=Date.now();await renderStill({serveUrl,composition,puppeteerInstance:browser,chromiumOptions,output:`out/review-v2/frame-${String(frame).padStart(4,'0')}.jpg`,frame,imageFormat:'jpeg',jpegQuality:93,scale:.5});console.log(`Frame ${frame}: ${Date.now()-now} ms`)}}
 await Promise.all([worker(),worker()]);
 }finally{await browser.close({silent:true})}
})().catch(e=>{console.error(e);process.exit(1)});
