import {test} from 'node:test';
import assert from 'node:assert/strict';
import {menu,filterMenu,business,money} from '../src/data.js';
import {normaliseCart,changeQuantity,cartSummary,buildFoodEnquiry,buildCakeEnquiry,whatsappUrl,validPhone,indiaToday} from '../src/order.js';
import {cakeGeometry,lathe} from '../src/cake3d.js';
test('menu IDs unique, prices finite and sourced, no invented cake prices',()=>{
  assert.equal(new Set(menu.map(item=>item.id)).size,menu.length);
  assert.ok(menu.length>70);
  for(const item of menu){assert.ok(Number.isFinite(item.price)&&item.price>0);assert.ok(item.category&&item.name&&item.unit);}
  assert.equal(menu.find(item=>item.id==='pav-bhaji').price,60);
  assert.equal(menu.find(item=>item.id==='mk-sp-thali').price,200);
  assert.equal(menu.find(item=>item.id==='gulab-jamun').price,20);
});
test('search: whitespace, case, Hindi, category and empty states',()=>{
  assert.equal(filterMenu({query:'   PAV   BHAJI  ',category:'Snacks'}).length,1);
  assert.equal(filterMenu({query:'पाव'}).length,1);
  assert.equal(filterMenu({query:'nothingexists'}).length,0);
  assert.ok(filterMenu({category:'Tandoor'}).every(item=>item.afterFive));
});
test('sorting never mutates the source catalogue',()=>{
  const before=menu.map(x=>x.id);
  const low=filterMenu({sort:'price-low'}),high=filterMenu({sort:'price-high'});
  assert.equal(low[0].price,10);assert.equal(high[0].price,320);
  assert.deepEqual(menu.map(x=>x.id),before);
});
test('malformed and stale storage is sanitised',()=>{
  assert.deepEqual(normaliseCart(null),[]);
  assert.deepEqual(normaliseCart({id:'pav-bhaji'}),[]);
  assert.deepEqual(normaliseCart([{id:'bogus',quantity:2},{id:'pav-bhaji',quantity:-2},{id:'samosa',quantity:'3'}]),[]);
  assert.deepEqual(normaliseCart([{id:'pav-bhaji',quantity:500},{id:'pav-bhaji',quantity:5}]),[{id:'pav-bhaji',quantity:99}]);
});
test('cart increments, decrements, removes and totals correctly',()=>{
  let cart=changeQuantity([],'pav-bhaji',2);
  cart=changeQuantity(cart,'gulab-jamun',3);
  assert.equal(cartSummary(cart).count,5);assert.equal(cartSummary(cart).total,180);
  cart=changeQuantity(cart,'pav-bhaji',-2);
  assert.equal(cartSummary(cart).total,60);
  assert.equal(money(1200),'₹1,200');
});
test('food enquiry validates phone, address and nonempty cart',()=>{
  const cart=[{id:'pav-bhaji',quantity:2}],details={name:'Test Customer',phone:'9999999999',fulfilment:'Pickup'};
  const message=buildFoodEnquiry(cart,details);
  assert.match(message,/2 × Pav Bhaji/);assert.match(message,/₹120/);assert.doesNotMatch(message,/Address:/);
  assert.throws(()=>buildFoodEnquiry([],details));
  assert.throws(()=>buildFoodEnquiry(cart,{...details,phone:'123'}));
  assert.throws(()=>buildFoodEnquiry(cart,{...details,fulfilment:'Delivery'}));
  assert.match(buildFoodEnquiry(cart,{...details,fulfilment:'Delivery',address:'Test address'}),/Address: Test address/);
});
test('Indian phone validation supports +91, rejects bogus values',()=>{
  assert.ok(validPhone('+91 9999999999'));assert.ok(validPhone('9999999999'));
  assert.equal(validPhone('1111111111'),false);assert.equal(validPhone('99999'),false);
});
test('cake enquiry validates flavour, weight and India date',()=>{
  const now=new Date('2026-09-19T20:00:00Z');
  assert.equal(indiaToday(now),'2026-09-20');
  const details={flavour:'Mango',weight:'1 kg',date:'2026-09-20',message:'Happy birthday!',eggless:true};
  const msg=buildCakeEnquiry(details,now);assert.match(msg,/Mango/);assert.match(msg,/Eggless preparation requested: Yes/);
  assert.throws(()=>buildCakeEnquiry({...details,date:'2026-09-19'},now));
  assert.throws(()=>buildCakeEnquiry({...details,date:'2026-02-31'},now));
  assert.throws(()=>buildCakeEnquiry({...details,flavour:'Unknown'},now));
});
test('WhatsApp URL safely encodes text and uses separate contact numbers',()=>{
  const message='Hello & नमस्ते # 🍰';
  const url=new URL(whatsappUrl(business.foodPhone,message));
  assert.equal(url.searchParams.get('text'),message);
  assert.equal(url.pathname,'/917037050187');assert.equal(business.cakePhone,'917037050185');
  assert.throws(()=>whatsappUrl('javascript:alert(1)','x'));
});
test('all cake flavours generate finite, nonempty triangles with distinct colours',()=>{
  const choc=cakeGeometry('Chocolate'),berry=cakeGeometry('Strawberry');
  assert.ok(choc.length>20000);assert.equal(choc.length%27,0);
  assert.ok(choc.every(Number.isFinite));assert.equal(choc.length,berry.length);
  assert.notDeepEqual(choc,berry);
  assert.equal(lathe([[0,0],[1,1]],[1,1,1],8).length,8*6*9);
});
