import {menu,money,business,cakeFlavours,cakeWeights} from './data.js';
const byId = new Map(menu.map(item=>[item.id,item]));
export function normaliseCart(raw) {
  if (!Array.isArray(raw)) return [];
  const result = new Map();
  for (const row of raw.slice(0,500)) {
    if (!row || !byId.has(row.id) || !Number.isFinite(row.quantity)) continue;
    const quantity = Math.min(99,Math.max(0,Math.trunc(row.quantity)));
    if (quantity) result.set(row.id,Math.min(99,(result.get(row.id)||0)+quantity));
  }
  return [...result].map(([id,quantity])=>({id,quantity}));
}
export function cartSummary(raw) {
  const items = normaliseCart(raw).map(row=>({...byId.get(row.id),quantity:row.quantity}));
  return {items,count:items.reduce((n,item)=>n+item.quantity,0),total:items.reduce((n,item)=>n+item.price*item.quantity,0)};
}
export function changeQuantity(raw,id,delta) {
  const rows = normaliseCart(raw);
  if (!byId.has(id) || !Number.isInteger(delta)) return rows;
  const row = rows.find(item=>item.id===id);
  if (row) row.quantity += delta;
  else if(delta>0) rows.push({id,quantity:delta});
  return normaliseCart(rows);
}
export const clean = (value,max=300) => String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,max);
export function validPhone(value) {
  const digits = String(value).replace(/\D/g,'');
  return /^[6-9]\d{9}$/.test(digits) || /^91[6-9]\d{9}$/.test(digits);
}
export function buildFoodEnquiry(cart,details) {
  const {items,total}=cartSummary(cart);
  if(!items.length) throw new Error('Add something to your bag first.');
  const name=clean(details.name,60),phone=clean(details.phone,16);
  if(!name || !validPhone(phone)) throw new Error('Enter your name and a valid Indian mobile number.');
  const delivery=details.fulfilment==='Delivery',address=clean(details.address);
  if(delivery && !address) throw new Error('Please add your delivery address.');
  return [
    'Hello Madhukunj! I would like to enquire about this order:',
    '',...items.map(item=>item.quantity+' × '+item.name+' ('+money(item.price)+' / '+item.unit+') — '+money(item.price*item.quantity)),
    '', 'Menu subtotal: '+money(total),
    'Name: '+name,'Phone: '+phone,'Method: '+(delivery?'Delivery in Bajna':'Pickup'),
    ...(delivery?['Address: '+address]:[]),
    ...(clean(details.notes)?['Notes: '+clean(details.notes)]:[]),
    '', 'Please confirm availability, timing, delivery charges and final total. This is an enquiry, not a confirmed order.',
  ].join('\n');
}
export function indiaToday(now=new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function buildCakeEnquiry(details,now=new Date()) {
  if(!cakeFlavours.includes(details.flavour)||!cakeWeights.includes(details.weight)) throw new Error('Choose a listed flavour and size.');
  const date=String(details.date||'');
  const parsed=new Date(date+'T12:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<indiaToday(now)) throw new Error('Choose today or a future date.');
  return ['Hello Madhukunj cake team! I would like to enquire about a cake:','',
    'Flavour: '+details.flavour,'Size: '+details.weight,'Requested date: '+date,
    'Message on cake: '+(clean(details.message,45)||'No message'),
    'Eggless preparation requested: '+(details.eggless?'Yes':'No preference specified'),'',
    'Please confirm price, design, availability and pickup/delivery time. I understand at least '+business.cakeMinimumHours+' hours’ notice is required. This is an enquiry, not a confirmed booking.'
  ].join('\n');
}
export function whatsappUrl(phone,message) {
  if(!/^\d{10,15}$/.test(phone)) throw new Error('Invalid business contact number.');
  return 'https://wa.me/'+phone+'?text='+encodeURIComponent(message);
}
