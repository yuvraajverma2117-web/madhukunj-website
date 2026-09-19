import {menu,categories,business,money,filterMenu} from './data.js';
import {normaliseCart,cartSummary,changeQuantity,buildFoodEnquiry,buildCakeEnquiry,whatsappUrl,validPhone,indiaToday} from './order.js';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const CART_KEY='madhukunj-bag-v2';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private mode: the in-memory bag still works. */}};
let cart=normaliseCart(read(CART_KEY,[]));
let category='All cravings',limit=12,toastTimer,scene=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches || read('madhukunj-motion-paused',false)===true;
const byId=new Map(menu.map(item=>[item.id,item]));
function announce(message) {
  const toast=$('#toast');toast.textContent=message;toast.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3000);
}
const openers=new WeakMap();
function openDialog(id) {
  const dialog=$(id);openers.set(dialog,document.activeElement);
  dialog.showModal();document.body.classList.add('modal-open');
}
function closeDialog(dialog) {dialog.close();}
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{
    if(!$('dialog[open]'))document.body.classList.remove('modal-open');
    const opener=openers.get(dialog);if(opener?.isConnected)opener.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const b=dialog.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDialog(dialog);
  });
});
function renderMenu() {
  const results=filterMenu({query:$('#menu-search').value,category,sort:$('#menu-sort').value});
  $('#category-tabs').innerHTML=categories.map(cat=>'<button class="category-tab" data-category="'+escape(cat)+'" aria-pressed="'+(cat===category)+'">'+escape(cat)+'</button>').join('');
  $('#menu-count').textContent=results.length+' delicious '+(results.length===1?'choice':'choices')+' · '+Math.min(limit,results.length)+' shown';
  $('#menu-grid').innerHTML=results.slice(0,limit).map(item=>'<article class="menu-card"><div class="menu-card-top"><span class="menu-card-category">'+escape(item.category)+'</span><span class="veg-mark" aria-label="Vegetarian">●</span></div><button class="menu-detail-link" data-detail="'+item.id+'"><h3>'+escape(item.name)+'</h3></button><p>'+escape(item.description)+'</p>'+(item.afterFive?'<span class="time-label">Printed menu: available after 5 pm</span>':'')+'<div class="menu-card-bottom"><span class="menu-price">'+money(item.price)+' <small>/ '+item.unit+'</small></span><button class="add-button" data-add="'+item.id+'" aria-label="Add '+escape(item.name)+' to bag">Add +</button></div></article>').join('');
  $('#menu-empty').hidden=results.length>0;$('#show-more').hidden=results.length<=limit;
  $('#show-more').textContent='More delicious things ('+Math.max(0,results.length-limit)+' more) ↓';
}
function renderCart() {
  const {items,count,total}=cartSummary(cart);
  $$('[data-cart-count]').forEach(el=>el.textContent=count);
  $('#cart-empty').hidden=count>0;$('#cart-content').hidden=count===0;
  $('#cart-total').textContent=money(total);
  $('#cart-items').innerHTML=items.map(item=>'<article class="cart-line"><div><h3>'+escape(item.name)+'</h3><p>'+money(item.price)+' / '+item.unit+'</p><div class="cart-line-actions"><div class="quantity-control"><button data-quantity="'+item.id+'" data-delta="-1" aria-label="Decrease '+escape(item.name)+' quantity">−</button><span aria-label="Quantity">'+item.quantity+'</span><button data-quantity="'+item.id+'" data-delta="1" aria-label="Increase '+escape(item.name)+' quantity" '+(item.quantity>=99?'disabled':'')+'>+</button></div><button class="remove-button" data-remove="'+item.id+'" aria-label="Remove '+escape(item.name)+' from bag">Remove</button></div></div><strong>'+money(item.price*item.quantity)+'</strong></article>').join('');
}
function saveCart(){write(CART_KEY,cart);renderCart();}
function add(id) {
  const item=byId.get(id);if(!item)return;
  if(cart.find(row=>row.id===id)?.quantity>=99){announce('Maximum 99 per item. Call us for a larger order.');return;}
  cart=changeQuantity(cart,id,1);saveCart();announce(item.name+' added to your bag');
}
function showDetail(id) {
  const item=byId.get(id);if(!item)return;
  const art=id==='pav-bhaji'?'<img src="assets/pav-bhaji.png" alt="Madhukunj pav bhaji">':id==='mk-sp-thali'?'<div class="food-plate"><div class="thali-photo" role="img" aria-label="Illustrative thali from the original menu"></div></div>':'<span class="dish-symbol" aria-hidden="true">✳</span>';
  $('#detail-content').innerHTML='<div class="detail-art">'+art+'</div><div class="detail-body"><span class="mini-label">'+escape(item.category)+'</span><h2 id="detail-title">'+escape(item.name)+'</h2><span class="menu-price">'+money(item.price)+' <small>/ '+item.unit+'</small></span><p>'+escape(item.description)+'</p>'+(item.afterFive?'<p class="time-label">The printed menu lists this item after 5 pm.</p>':'')+'<p>Ask the kitchen about ingredients, allergens and today’s availability. Images and illustrations are not a serving guarantee.</p><button class="button red" data-add="'+item.id+'">Add to your happy bag +</button></div>';
  openDialog('#detail-dialog');
}
function showPrinted(cakes=false) {
  $('#printed-title').textContent=cakes?'The cake menu.':'The original menu.';
  $('#printed-images').innerHTML=(cakes?['cakes-menu.jpeg']:['menu-2.jpeg','menu-1.jpeg']).map((name,i)=>'<a href="assets/'+name+'" target="_blank" rel="noopener"><img src="assets/'+name+'" alt="'+(cakes?'Original Madhukunj cake menu':'Original Madhukunj menu page '+(i+1))+'"></a>').join('');
  openDialog('#menu-dialog');
}
function prepareEnquiry(message,phone) {
  $('#enquiry-message').textContent=message;
  $('#whatsapp-link').href=whatsappUrl(phone,message);
  $('#enquiry-call').href='tel:+'+phone;
  openDialog('#enquiry-dialog');
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')){closeDialog(button.closest('dialog'));return;}
  if(button.hasAttribute('data-cart-open')){renderCart();openDialog('#cart-dialog');return;}
  if(button.dataset.add){
    add(button.dataset.add);
    if(button.closest('dialog')){
      const previous=button.textContent;button.textContent='Added to your bag ✓';
      setTimeout(()=>{if(button.isConnected)button.textContent=previous;},1800);
    }
    return;
  }
  if(button.dataset.detail){showDetail(button.dataset.detail);return;}
  if(button.dataset.category){
    category=button.dataset.category;limit=12;renderMenu();
    const active=$$('[data-category]').find(el=>el.dataset.category===category);
    active?.focus({preventScroll:true});return;
  }
  if(button.dataset.quantity){
    const id=button.dataset.quantity,delta=Number(button.dataset.delta);
    cart=changeQuantity(cart,id,delta);saveCart();
    const replacement=$$('[data-quantity]').find(el=>el.dataset.quantity===id&&el.dataset.delta===String(delta));
    (replacement||$('#cart-dialog .close-button')).focus({preventScroll:true});return;
  }
  if(button.dataset.remove){cart=cart.filter(row=>row.id!==button.dataset.remove);saveCart();$('#cart-dialog .close-button').focus({preventScroll:true});return;}
  if(button.hasAttribute('data-menu-open'))showPrinted();
  if(button.hasAttribute('data-cake-menu'))showPrinted(true);
});
$('#menu-search').addEventListener('input',()=>{limit=12;renderMenu();});
$('#menu-sort').addEventListener('change',()=>{limit=12;renderMenu();});
$('#show-more').addEventListener('click',()=>{limit+=12;renderMenu();});
$('#reset-search').addEventListener('click',()=>{
  category='All cravings';limit=12;$('#menu-search').value='';$('#menu-sort').value='original';renderMenu();$('#menu-search').focus();
});
const orderForm=$('#order-form');
// App validation accepts normal spacing and +91 without relying on divergent
// browser implementations of the HTML pattern attribute's Unicode v mode.
orderForm.elements.phone.removeAttribute('pattern');
const orderError=document.createElement('p');orderError.className='small-note';orderError.setAttribute('role','alert');orderForm.prepend(orderError);
orderForm.addEventListener('change',()=>{
  const delivery=new FormData(orderForm).get('fulfilment')==='Delivery';
  $('#address-label').hidden=!delivery;orderForm.elements.address.required=delivery;
});
orderForm.elements.phone.addEventListener('input',()=>orderForm.elements.phone.setCustomValidity(''));
orderForm.addEventListener('submit',event=>{
  event.preventDefault();
  orderError.textContent='';
  const details=Object.fromEntries(new FormData(orderForm));
  if(!validPhone(details.phone)){orderForm.elements.phone.setCustomValidity('Enter a valid 10-digit Indian mobile number, with optional +91.');orderForm.elements.phone.reportValidity();return;}
  try{prepareEnquiry(buildFoodEnquiry(cart,details),business.foodPhone);}catch(error){orderError.textContent=error.message;}
});
const cakeForm=$('#cake-form');
$('#cake-date').min=indiaToday();
cakeForm.addEventListener('submit',event=>{
  event.preventDefault();
  const details=Object.fromEntries(new FormData(cakeForm));details.eggless=!!details.eggless;
  try{prepareEnquiry(buildCakeEnquiry(details),business.cakePhone);}catch(error){announce(error.message);}
});
$('#cake-message').addEventListener('input',()=>$('#cake-message-preview').textContent=$('#cake-message').value.trim()||'Your happy little moment');
const colours={Chocolate:'#75402c',Pineapple:'#f0c260',Strawberry:'#eaa1a6',Mango:'#efa629',Butterscotch:'#c98c47'};
function updateCake() {
  const flavour=$('#cake-flavour').value;
  $('#cake-stage').style.setProperty('--icing',colours[flavour]);
  $('#cake-fallback').style.setProperty('--icing',colours[flavour]);
  $('#cake-canvas').setAttribute('aria-label','Interactive 3D '+flavour.toLowerCase()+' cake. Drag to rotate or use left and right arrow keys.');
  scene?.setFlavour(flavour);scene?.setSize(parseFloat($('#cake-weight').value));
}
$('#cake-flavour').addEventListener('change',updateCake);$('#cake-weight').addEventListener('change',updateCake);
$('#copy-enquiry').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('#enquiry-message').textContent);$('#copy-enquiry').textContent='Copied ✓';setTimeout(()=>$('#copy-enquiry').textContent='Copy message',2000);}
  catch{$('#copy-enquiry').textContent='Select and copy the message above';}
});
$('#privacy-open').addEventListener('click',()=>openDialog('#privacy-dialog'));
$('#clear-bag').addEventListener('click',()=>{cart=[];saveCart();$('#clear-bag').textContent='Saved bag cleared ✓';});
const navButton=$('#mobile-toggle'),mobileNav=$('#mobile-nav');
function closeNav(){mobileNav.hidden=true;navButton.setAttribute('aria-expanded','false');navButton.setAttribute('aria-label','Open navigation');}
navButton.addEventListener('click',()=>{
  const open=mobileNav.hidden;mobileNav.hidden=!open;navButton.setAttribute('aria-expanded',String(open));navButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
});
mobileNav.addEventListener('click',event=>{if(event.target.closest('a'))closeNav();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeNav();navButton.focus();}});
document.addEventListener('click',event=>{if(!mobileNav.hidden&&!mobileNav.contains(event.target)&&!navButton.contains(event.target))closeNav();});
matchMedia('(min-width: 801px)').addEventListener('change',event=>{if(event.matches)closeNav();});
function applyMotion(){
  document.documentElement.classList.toggle('motion-paused',paused);
  $('#motion-toggle').setAttribute('aria-pressed',String(paused));
  $('#motion-toggle').setAttribute('aria-label',paused?'Enable decorative motion':'Pause decorative motion');
  $('#motion-toggle').title=paused?'Enable motion':'Pause motion';
  $('#motion-toggle').textContent=paused?'▷':'Ⅱ';scene?.setPaused(paused);
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;write('madhukunj-motion-paused',paused);applyMotion();});
reduced.addEventListener('change',event=>{paused=event.matches||read('madhukunj-motion-paused',false)===true;applyMotion();});
const heroArt=$('#hero-art');
heroArt.addEventListener('pointermove',event=>{
  if(paused||event.pointerType==='touch')return;
  const rect=heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--rx',((event.clientY-rect.top)/rect.height-.5)*-10+'deg');
  heroArt.style.setProperty('--ry',((event.clientX-rect.left)/rect.width-.5)*14+'deg');
});
heroArt.addEventListener('pointerleave',()=>{heroArt.style.setProperty('--rx','0deg');heroArt.style.setProperty('--ry','0deg');});
const cakeObserver=new IntersectionObserver(async entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  cakeObserver.disconnect();
  try{
    const {createCakeScene}=await import('./cake3d.js');
    scene=createCakeScene($('#cake-canvas'),{paused});
    updateCake();
  }catch{
    $('#cake-stage').classList.add('no-webgl');
    $('#cake-instructions').textContent='Illustrated preview · 3D unavailable';
    $$('.scene-button').forEach(button=>button.disabled=true);
  }
},{rootMargin:'300px'});
cakeObserver.observe($('#cake-stage'));
$('#cake-left').addEventListener('click',()=>scene?.rotate(-.35));
$('#cake-right').addEventListener('click',()=>scene?.rotate(.35));
$('#cake-reset').addEventListener('click',()=>scene?.reset());
$('#year').textContent=new Date().getFullYear();
const schema=document.createElement('script');schema.type='application/ld+json';
schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Restaurant',name:business.name,telephone:'+'+business.foodPhone,address:{'@type':'PostalAddress',addressLocality:'Bajna',addressRegion:'Uttar Pradesh',addressCountry:'IN'},servesCuisine:['Indian','Vegetarian'],hasMenu:new URL('#menu',location.href).href});
document.head.append(schema);
renderMenu();renderCart();applyMotion();
