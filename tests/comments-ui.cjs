/* eslint-env node */
// UI integration checks with an in-memory Firebase transport; no live project writes.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium',args:['--no-sandbox']});
 const rows = new Map();
 async function page(signedIn) {
  const context = await browser.newContext();
  await context.exposeBinding('readComments', (_, video) => rows.get(video) || []);
  await context.exposeBinding('writeComment', (_, video, data) => {
   if(data.text==='fail') throw Error('Network failure');
   const list = rows.get(video) || []; list.unshift({id:String(Date.now()),...data});rows.set(video,list);
  });
  await context.route('**/src/components/helpers/firebase.js', r=>r.fulfill({contentType:'text/javascript',body:`export default { currentUser: ${signedIn ? '{uid:"u1",email:"viewer@example.com"}' : 'null'}, app:{} };`}));
  await context.route('**/node_modules/.vite/deps/firebase_auth.js*', r=>r.fulfill({contentType:'text/javascript',body:`export const onAuthStateChanged=(auth,fn)=>{fn(auth.currentUser);return ()=>{};}; export const signOut=async()=>{}; export const createUserWithEmailAndPassword=async()=>{}; export const signInWithEmailAndPassword=async()=>{};`}));
  await context.route('**/node_modules/.vite/deps/firebase_firestore.js*',r=>r.fulfill({contentType:'text/javascript',body:`export const getFirestore=()=>({});export const collection=(db,root,id)=>id;export const query=x=>x;export const orderBy=()=>({});export const serverTimestamp=()=>null;export const addDoc=(id,data)=>window.writeComment(id,data);export function onSnapshot(id,options,fn){let active=true;const update=async()=>{const data=await window.readComments(id);if(active)fn({docs:data.map(row=>({id:row.id,data:()=>row}))});};update();const timer=setInterval(update,100);return()=>{active=false;clearInterval(timer);};}`}));
  const p=await context.newPage();await p.goto(`${process.env.NURTUBE_TEST_URL || 'http://127.0.0.1:5173'}/video/first`);return p;
 }
 const writer=await page(true), reader=await page(false);
 await writer.getByLabel('Add a comment',{exact:true}).fill('A shared comment\nwith two lines');
 await writer.getByRole('button',{name:'Comment',exact:true}).click();
 await reader.getByText('A shared comment\nwith two lines',{exact:true}).waitFor();
 assert.equal(await writer.getByLabel('Add a comment',{exact:true}).inputValue(),'');
 await reader.reload();await reader.getByText('A shared comment\nwith two lines',{exact:true}).waitFor();
 await reader.goto(`${process.env.NURTUBE_TEST_URL || 'http://127.0.0.1:5173'}/video/second`);
 await reader.getByText('No comments yet.',{exact:false}).waitFor();
 assert.equal(await reader.getByText('A shared comment\nwith two lines',{exact:true}).count(),0);
 await writer.getByLabel('Add a comment',{exact:true}).fill('   ');
 assert.equal(await writer.getByRole('button',{name:'Comment',exact:true}).isDisabled(),true);
 await writer.getByLabel('Add a comment',{exact:true}).fill('fail');await writer.getByRole('button',{name:'Comment',exact:true}).click();
 await writer.getByRole('alert').filter({hasText:'wasn’t posted'}).waitFor();
 assert.equal(await writer.getByLabel('Add a comment',{exact:true}).inputValue(),'fail');
 await reader.getByRole('button',{name:'Sign in to add a comment'}).click();await reader.getByRole('dialog').waitFor();
 await reader.getByRole('button',{name:'Create account',exact:true}).click();await reader.getByRole('heading',{name:'Create your account'}).waitFor();
 await reader.keyboard.press('Escape');assert.equal(await reader.getByRole('dialog').count(),0);
 await reader.setViewportSize({width:390,height:844});assert.equal(await reader.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS: two-session comments, reload persistence, per-video isolation, blank validation, failure preserves draft, sign-in/signup dialog, mobile layout (mock Firebase backend).');
 await browser.close();
})().catch(err=>{console.error(err);process.exit(1);});
