/* eslint-env node */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    const calls = [];
    await page.exposeFunction('recordVideoRequest', url => calls.push(url));
    // Keep the real UI; stand in for the user's local API helper.
    await page.route('**/src/components/helpers/fetchFromAPI.js', route => route.fulfill({
      contentType: 'text/javascript',
      body: `export async function fetchFromAPI(url) {
        await window.recordVideoRequest(url);
        const snippet = { title: 'Test video', channelTitle: 'Test channel', channelId: 'channel1', description: 'Video description', thumbnails: {high: {url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}} };
        if (url.startsWith('videos?')) return {items: [{id:'video1',snippet,statistics:{viewCount:'123',likeCount:'4'}}]};
        return {items: [{id:{videoId:'video1'},snippet}]};
      }`,
    }));
    const base = process.env.NURTUBE_TEST_URL || 'http://127.0.0.1:5173';
    await page.goto(base);
    await page.getByText('Test video', {exact: true}).waitFor();
    await page.getByRole('button', {name:'Music', exact:true}).click();
    await page.getByText('Test video', {exact: true}).waitFor();
    assert(calls.includes('search?part=snippet&q=Music'));
    await page.getByLabel('Search videos').fill('cats');
    await page.getByRole('button', {name:'Search', exact:true}).click();
    await page.getByText('Test video', {exact: true}).waitFor();
    assert(calls.includes('search?part=snippet&q=cats'));
    await page.goto(`${base}/video/video1`);
    await page.getByRole('heading', {name:'Test video', exact:true, level:1}).waitFor();
    await page.getByText('123 views', {exact:true}).waitFor();
    assert(calls.includes('videos?part=snippet,statistics&id=video1'));
    console.log('PASS: existing API helper supplies feed, category, search and video details without a new environment variable.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
