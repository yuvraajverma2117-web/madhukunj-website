// Authoritative source: the original menu-1.jpeg, menu-2.jpeg and cakes-menu.jpeg.
// Printed prices are not a live inventory or availability guarantee.
export const business = Object.freeze({
  name: 'Madhukunj', locality: 'Bajna, Mathura', foodPhone: '917037050187',
  alternateFoodPhone: '917037050186', cakePhone: '917037050185',
  cakeMinimumHours: 2, address: null, openingHours: null, canonicalUrl: null,
});
export const categories = ['All cravings', 'Snacks', 'South Indian', 'Tandoor', 'Thalis', 'Main course', 'Chinese', 'Breads', 'Burgers & pizza', 'Sweets', 'Drinks'];
const groups = [
  ['Snacks', [
    ['Aligarh Kachori',30,'plate','A little crunch. A little chatpata.'],
    ['Chole Bhature',60,'plate','A comfort-food classic for a hearty craving.'],
    ['Paneer Bread Pakoda',25,'piece','A snack-time favourite.'],
    ['Pav Bhaji',60,'plate','A buttery pav-and-bhaji moment, made for sharing.','पाव भाजी'],
    ['Chole Kulche',60,'plate','A familiar favourite for a happy lunch.'],
    ['Samosa',15,'piece','The little triangle with a big fan club.','समोसा'],
    ['Aloo Tikki',30,'piece','For your chatpata side.'],
    ['Samosa Chaat',40,'plate','Your samosa, with a little extra personality.'],
    ['Dahi Bhalla',50,'plate','A cool, comforting chaat break.'],
  ]],
  ['South Indian',[
    ['Masala Dosa',100,'serving','A crisp classic for your next dosa date.','डोसा'],
    ['Paneer Masala Dosa',120],['Paneer Cheese Special Dosa',140],
    ['Mysore Dosa',140],['Schezwan Masala Dosa',130],['Pav Bhaji Dosa',180],
    ['Pizza Dosa',200],['Masala Uttapam',140],['Onion Tomato Uttapam',160],
    ['Idli (2 pieces)',60,'serving','A soft, simple South Indian favourite.'],
    ['Masala Idli',100],['Fried Idli',80],
  ]],
  ['Tandoor',[
    ['Malai Chaap',150,'serving','A creamy favourite from our tandoor menu.'],
    ['Punjabi Chaap',100],['Afghani Chaap',180],['Achari Chaap',200],
    ['Paneer Tikka',220],['Malai Paneer Tikka',250],
  ]],
  ['Thalis',[
    ['UPP Thali',80],['Deluxe Thali',120],
    ['MK Special Thali',200,'serving','A little of everything. Ask the kitchen for today’s selection.'],
    ['South Indian Thali',150],['Chinese Thali',155],['Special Veg Biryani',120],
  ]],
  ['Main course',[
    ['Shahi Paneer',195],['Kadhai Paneer',210],['Matar Paneer',180],
    ['Chana Masala',180],['Mix Veg',140],['Jeera Rice',110],
    ['Sada Chawal (Plain Rice)',90],['Fried Rice',120],['Dal Tadka',120],['Jeera Aloo',100],
  ]],
  ['Chinese',[
    ['Veg Chowmein',90],['Veg Steam Momos',80],['Veg Fried Momos',90],
    ['Veg Kurkure Momos',100],['Chilli Potato',90],['French Fries',80],
    ['Aloo Sandwich',45],['Bread Butter Toast',40],['Manchurian (Dry)',80],
    ['Manchurian (Gravy)',100],
  ]],
  ['Breads',[
    ['Chapati',10,'piece'],['Butter Chapati',12,'piece'],['Plain Parantha',25,'piece'],
    ['Aloo Parantha with Curd',100,'serving'],
  ]],
  ['Burgers & pizza',[
    ['Veg Burger',40,'piece'],['Cheese Burger',80,'piece'],['Paneer Burger',60,'piece'],
    ['Pocket Pizza',50],['Cheese Corn Blast Pizza',150],['Farmhouse Pizza',200],
    ['MK Special Pizza',280],['Tandoori Pizza',320],['Extra Cheese Load',25,'add-on'],
  ]],
  ['Sweets',[
    ['Gulab Jamun',20,'piece','A sweet little finish to a happy meal.','गुलाब जामुन'],
    ['Sponge',25,'piece'],['Rajbhog',45,'piece'],['Rasmalai',45,'piece'],
    ['Kesarwati',20,'piece'],['Rabri',45,'100 g'],
  ]],
  ['Drinks',[
    ['Special Kulhad Chai',20,'serving','Pause. Sip. Repeat.','चाय'],
    ['Masala Chai',25],['Hot Coffee',50],['Cold Coffee',80],['Soda / Shikanji',40],
    ['Badam Milk',65],['Lassi',60],['Shahi Lassi',80],
  ]],
];
export const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const menu = groups.flatMap(([category,rows]) => rows.map(([name,price,unit='serving',description='',hindi='']) => ({
  id: name === 'MK Special Thali' ? 'mk-sp-thali' : slug(name), name, price, unit, category,
  description: description || ('From our '+ category.toLowerCase() +' menu. Ask us about ingredients and serving details.'),
  hindi, vegetarian: true, afterFive: category === 'Tandoor',
})));
export const cakeFlavours = ['Chocolate','Pineapple','Strawberry','Mango','Butterscotch'];
export const cakeWeights = ['0.5 kg','1 kg','1.5 kg','2 kg'];
export const money = amount => '₹' + Number(amount).toLocaleString('en-IN');
export function filterMenu({query='',category='All cravings',sort='original'}={}) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const result = menu.filter(item => (category === 'All cravings' || item.category === category)
    && terms.every(term => (item.name+' '+item.category+' '+item.hindi).toLocaleLowerCase().includes(term)));
  if (sort === 'price-low') result.sort((a,b)=>a.price-b.price);
  if (sort === 'price-high') result.sort((a,b)=>b.price-a.price);
  if (sort === 'name') result.sort((a,b)=>a.name.localeCompare(b.name));
  return result;
}
