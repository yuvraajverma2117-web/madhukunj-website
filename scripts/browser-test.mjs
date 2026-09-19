/**
 * Reproducible browser QA for a machine that can access the local preview.
 * NOT RUN in the authoring session: Cloud Browser blocks localhost/file URLs.
 * Start npm run dev, install Playwright as described in README, then run this.
 * All requests to external sites are blocked; no WhatsApp enquiries are sent.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:8765';
const origin=new URL(base).origin;
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];let passed=0;
async function check(name,fn){try{await fn();passed++;console.log('PASS',name);}catch(error){failures.push({name,message:error.message});console.error('FAIL',name,error.message);}}
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await check('page and initial menu render',async()=>{
    await page.getByRole('heading',{name:'Good food. Great company. Pure delight.'}).waitFor();
    assert.equal(await page.locator('.menu-card').count(),12);
  });
  await check('desktop hero screenshot',()=>page.screenshot({path:'test-results/desktop-hero.png'}));
  await check('search and empty-state reset',async()=>{
    await page.getByRole('searchbox').fill('pav bhaji');
    assert.equal(await page.locator('.menu-card').count(),2);
    await page.getByRole('searchbox').fill('no-such-dish');
    await page.getByRole('heading',{name:'No bites found.'}).waitFor();
    await page.getByRole('button',{name:'Show the full menu'}).click();
    assert.equal(await page.locator('.menu-card').count(),12);
  });
  await check('category and ascending/descending sort',async()=>{
    await page.getByRole('button',{name:'Sweets',exact:true}).click();
    assert.equal(await page.locator('.menu-card').count(),6);
    await page.locator('#menu-sort').selectOption('price-high');
    assert.match(await page.locator('.menu-card .menu-price').first().innerText(),/₹45/);
    await page.locator('#menu-sort').selectOption('price-low');
    assert.match(await page.locator('.menu-card .menu-price').first().innerText(),/₹20/);
    await page.getByRole('button',{name:'All cravings',exact:true}).click();
    await page.locator('#menu-sort').selectOption('original');
  });
  await check('show more menu items',async()=>{
    await page.locator('#show-more').click();assert.equal(await page.locator('.menu-card').count(),24);
  });
  await check('dish detail, Escape and focus return',async()=>{
    await page.locator('.menu-card [data-detail="pav-bhaji"]').click();
    await page.getByRole('dialog',{name:'Pav Bhaji'}).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#detail-dialog').isVisible(),false);
    assert.equal(await page.locator('.menu-card [data-detail="pav-bhaji"]').evaluate(el=>el===document.activeElement),true);
  });
  await check('cart add, increment, decrement and reload persistence',async()=>{
    await page.locator('.menu-card [data-add="pav-bhaji"]').click();
    await page.locator('.header-actions [data-cart-open]').click();
    assert.equal(await page.locator('#cart-total').innerText(),'₹60');
    await page.getByRole('button',{name:'Increase Pav Bhaji quantity'}).click();
    assert.equal(await page.locator('#cart-total').innerText(),'₹120');
    await page.getByRole('button',{name:'Decrease Pav Bhaji quantity'}).click();
    assert.equal(await page.locator('#cart-total').innerText(),'₹60');
    await page.reload();await page.locator('.header-actions [data-cart-open]').click();
    assert.equal(await page.locator('#cart-total').innerText(),'₹60');
  });
  await check('required fields and invalid phone prevent enquiry',async()=>{
    await page.getByRole('button',{name:'Review WhatsApp enquiry'}).click();
    assert.equal(await page.locator('#enquiry-dialog').isVisible(),false);
    await page.getByLabel('Your name',{exact:true}).fill('QA Customer');
    await page.getByLabel('Phone number',{exact:true}).fill('123');
    await page.getByRole('button',{name:'Review WhatsApp enquiry'}).click();
    assert.equal(await page.locator('#enquiry-dialog').isVisible(),false);
    await page.getByLabel('Phone number',{exact:true}).fill('9999999999');
  });
  await check('pickup enquiry encodes the correct business destination',async()=>{
    await page.getByRole('button',{name:'Review WhatsApp enquiry'}).click();
    const url=new URL(await page.locator('#whatsapp-link').getAttribute('href'));
    assert.equal(url.pathname,'/917037050187');
    assert.match(url.searchParams.get('text'),/Method: Pickup/);
    assert.match(url.searchParams.get('text'),/₹60/);
    await page.getByRole('button',{name:'Close enquiry',exact:true}).click();
  });
  await check('delivery requires address and includes notes safely',async()=>{
    await page.getByLabel('Delivery in Bajna',{exact:true}).check();
    await page.getByRole('button',{name:'Review WhatsApp enquiry'}).click();
    assert.equal(await page.locator('#enquiry-dialog').isVisible(),false);
    await page.getByLabel('Delivery address',{exact:true}).fill('QA address, Bajna');
    await page.getByLabel('Anything we should know?').fill('<script>test</script> & नमस्ते');
    await page.getByRole('button',{name:'Review WhatsApp enquiry'}).click();
    assert.match(await page.locator('#enquiry-message').innerText(),/QA address, Bajna/);
    assert.equal(await page.locator('#enquiry-message script').count(),0);
    await page.getByRole('button',{name:'Close enquiry',exact:true}).click();
    await page.getByRole('button',{name:'Remove Pav Bhaji from bag'}).click();
    assert.equal(await page.locator('#cart-empty').isVisible(),true);
    await page.getByRole('button',{name:'Close bag',exact:true}).click();
  });
  await check('printed menu and cake menu open and close',async()=>{
    await page.getByRole('button',{name:'See the printed menu'}).click();
    assert.equal(await page.locator('#printed-images img').count(),2);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Explore the cake menu'}).click();
    assert.equal(await page.locator('#printed-images img').count(),1);
    await page.keyboard.press('Escape');
  });
  await check('cake flavour, size, keyboard rotation and reset',async()=>{
    await page.locator('#cakes').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#cake-canvas').dataset.renderer==='webgl'||document.querySelector('#cake-stage').classList.contains('no-webgl'));
    const has3d=await page.locator('#cake-canvas').getAttribute('data-renderer')==='webgl';
    assert.equal(has3d,true,'WebGL not available on this test machine; inspect fallback separately');
    if(await page.locator('#motion-toggle').getAttribute('aria-pressed')==='false')await page.locator('#motion-toggle').click();
    await page.locator('#cake-flavour').selectOption('Strawberry');
    await page.locator('#cake-weight').selectOption('2 kg');
    assert.equal(await page.locator('#cake-canvas').getAttribute('data-flavour'),'Strawberry');
    const angle=Number(await page.locator('#cake-canvas').getAttribute('data-angle'));
    await page.locator('#cake-canvas').press('ArrowRight');
    assert.ok(Number(await page.locator('#cake-canvas').getAttribute('data-angle'))>angle);
    await page.getByRole('button',{name:'Reset cake view'}).click();
    assert.equal(Number(await page.locator('#cake-canvas').getAttribute('data-angle')),-.45);
    await page.locator('#cakes').screenshot({path:'test-results/cake-studio.png'});
  });
  await check('cake enquiry has correct date, flavour, message and destination',async()=>{
    await page.locator('#cake-date').fill('2099-12-25');
    await page.locator('#cake-message').fill('Happy birthday & खुशी!');
    await page.getByLabel('Request eggless preparation').check();
    await page.getByRole('button',{name:'Prepare my cake enquiry'}).click();
    const url=new URL(await page.locator('#whatsapp-link').getAttribute('href'));
    assert.equal(url.pathname,'/917037050185');
    assert.match(url.searchParams.get('text'),/Strawberry/);
    assert.match(url.searchParams.get('text'),/Happy birthday & खुशी!/);
    await page.keyboard.press('Escape');
  });
  await check('FAQ disclosures',async()=>{
    await page.getByText('Do you deliver in Bajna?',{exact:true}).click();
    assert.equal(await page.locator('.faq-list details').nth(1).getAttribute('open'),'');
  });
  await check('privacy opens and clears saved bag',async()=>{
    await page.getByRole('button',{name:'Privacy & ordering'}).click();
    await page.getByRole('button',{name:'Clear my saved bag'}).click();
    await page.getByRole('button',{name:'Saved bag cleared ✓'}).waitFor();
    await page.keyboard.press('Escape');
  });
  for(const width of [320,390,768,1024,1440]){
    await check('responsive layout '+width+'px: no horizontal overflow',async()=>{
      await page.setViewportSize({width,height:900});await page.goto(base);
      const dimensions=await page.evaluate(()=>({view:innerWidth,width:document.documentElement.scrollWidth}));
      assert.ok(dimensions.width<=dimensions.view+1,JSON.stringify(dimensions));
      await page.screenshot({path:'test-results/viewport-'+width+'.png'});
    });
  }
  await check('mobile navigation and bag bar',async()=>{
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'Open navigation'}).click();
    assert.equal(await page.locator('#mobile-nav').isVisible(),true);
    await page.locator('#mobile-nav a[href="#menu"]').click();
    assert.equal(await page.locator('#mobile-nav').isVisible(),false);
    await page.locator('.mobile-order [data-cart-open]').click();
    await page.getByRole('dialog',{name:'Your happy bag.'}).waitFor();
    await page.keyboard.press('Escape');
  });
  await check('no runtime errors',()=>assert.deepEqual(errors,[]));
  await context.close();
  await check('reduced motion honours OS preference',async()=>{
    const ctx=await browser.newContext({reducedMotion:'reduce'}),p=await ctx.newPage();
    await p.goto(base);assert.equal(await p.locator('html').getAttribute('class'),'motion-paused');await ctx.close();
  });
  await check('WebGL failure leaves form usable',async()=>{
    const ctx=await browser.newContext();
    await ctx.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
    const p=await ctx.newPage();await p.goto(base);await p.locator('#cakes').scrollIntoViewIfNeeded();
    await p.locator('.no-webgl').waitFor();assert.equal(await p.locator('#cake-form').isVisible(),true);await ctx.close();
  });
  await check('unavailable browser storage leaves menu and bag usable',async()=>{
    const ctx=await browser.newContext();
    await ctx.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('storage disabled');};Storage.prototype.setItem=()=>{throw new Error('storage disabled');};});
    const p=await ctx.newPage();await p.goto(base);await p.locator('.menu-card [data-add="pav-bhaji"]').click();
    await p.locator('.header-actions [data-cart-open]').click();assert.equal(await p.locator('#cart-total').innerText(),'₹60');await ctx.close();
  });
}finally{await browser.close();}
console.log(JSON.stringify({passed,failures},null,2));
if(failures.length)process.exitCode=1;
