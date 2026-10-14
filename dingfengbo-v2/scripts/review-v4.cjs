const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill}=require('@remotion/renderer');
const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..');const dir=path.join(root,'out/v4/stills');fs.mkdirSync(dir,{recursive:true});
 const timeline=JSON.parse(fs.readFileSync(path.join(root,'public/v4/timeline.json'),'utf8'));
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts')});
 fs.writeFileSync(path.join(root,'out/v4/bundle-path.txt'),serveUrl);
 const browser=await openBrowser('chrome',{browserExecutable:path.join(root,'scripts/chromium-preview-v3.sh'),logLevel:'error'});
 try{
  const inputProps={renderAudio:false};
  const composition=await selectComposition({serveUrl,id:'DingFengBoV4',inputProps,puppeteerInstance:browser});
  if(composition.durationInFrames!==timeline.durationInFrames)throw new Error('V4 duration mismatch');
  const ids=['001','003','011','014','018','033','045','055','071','078','084','102','119'];
  let cursor=0;const worker=async()=>{while(cursor<ids.length){const id=ids[cursor++];const shot=timeline.shots.find(s=>s.id===id);await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,frame:shot.from+Math.min(45,shot.duration-1),output:path.join(dir,`${id}.jpg`),imageFormat:'jpeg',jpegQuality:92});console.log('V4 still '+id);}};
  await Promise.all([worker(),worker()]);
  const cover=await selectComposition({serveUrl,id:'CoverV4',puppeteerInstance:browser});
  await renderStill({serveUrl,composition:cover,puppeteerInstance:browser,output:path.join(root,'out/v4/cover.jpg'),imageFormat:'jpeg',jpegQuality:95});
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.goto({url:'http://localhost:3002/DingFengBoV4',timeout:60000});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,4000));});
  const shot=await page._client().send('Page.captureScreenshot',{format:'jpeg',quality:90});
  fs.writeFileSync(path.join(root,'out/v4/studio.jpg'),Buffer.from(shot.value.data,'base64'));
  console.log('V4 Studio and composition frames loaded.');
 }finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
