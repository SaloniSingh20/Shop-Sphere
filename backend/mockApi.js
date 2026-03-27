// Mock backend data + simple query helpers

export const PLATFORMS = {
  amazon:  { name:'Amazon',  color:'#FF9900', bg:'#FFF8E7', icon:'🛒', textColor:'#B45309' },
  flipkart:{ name:'Flipkart',color:'#2874F0', bg:'#EEF4FF', icon:'🛍️', textColor:'#1D4ED8' },
  nykaa:   { name:'Nykaa',   color:'#FC2779', bg:'#FFF0F6', icon:'💄', textColor:'#BE185D' },
  myntra:  { name:'Myntra',  color:'#FF3F6C', bg:'#FFF0F3', icon:'👗', textColor:'#BE123C' },
};

const RAW_PRODUCTS = [
  // ── BEAUTY ──
  { id:'b1',  title:'MAC Ruby Woo Matte Lipstick',        price:1699, orig:2100, rating:4.8, reviews:2847, platform:'nykaa',    image:'https://images.unsplash.com/photo-1586495777744-4e6b81f5b802?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.nykaa.com' },
  { id:'b2',  title:'MAC Ruby Woo Matte Lipstick',        price:1899, orig:2100, rating:4.7, reviews:1923, platform:'amazon',   image:'https://images.unsplash.com/photo-1586495777744-4e6b81f5b802?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.amazon.in' },
  { id:'b3',  title:'MAC Ruby Woo Matte Lipstick',        price:2050, orig:2100, rating:4.6, reviews:987,  platform:'myntra',   image:'https://images.unsplash.com/photo-1586495777744-4e6b81f5b802?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.myntra.com' },
  { id:'b4',  title:'Maybelline Fit Me Foundation 220',   price:399,  orig:599,  rating:4.5, reviews:5621, platform:'flipkart', image:'https://images.unsplash.com/photo-1631214524020-3c69a0c3ab10?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.flipkart.com' },
  { id:'b5',  title:'Maybelline Fit Me Foundation 220',   price:449,  orig:599,  rating:4.4, reviews:4201, platform:'nykaa',   image:'https://images.unsplash.com/photo-1631214524020-3c69a0c3ab10?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.nykaa.com' },
  { id:'b6',  title:'Maybelline Fit Me Foundation 220',   price:479,  orig:599,  rating:4.3, reviews:3102, platform:'amazon',  image:'https://images.unsplash.com/photo-1631214524020-3c69a0c3ab10?w=400&h=400&fit=crop', category:'beauty',      link:'https://www.amazon.in' },
  { id:'b7',  title:"L'Oréal Revitalift 1.5% Pure Hyaluronic Serum", price:749, orig:1200, rating:4.6, reviews:3102, platform:'nykaa',   image:'https://images.unsplash.com/photo-1556228720-da5d3bfa46ce?w=400&h=400&fit=crop', category:'beauty', link:'https://www.nykaa.com' },
  { id:'b8',  title:"L'Oréal Revitalift 1.5% Pure Hyaluronic Serum", price:799, orig:1200, rating:4.5, reviews:2801, platform:'amazon',  image:'https://images.unsplash.com/photo-1556228720-da5d3bfa46ce?w=400&h=400&fit=crop', category:'beauty', link:'https://www.amazon.in' },
  { id:'b9',  title:"L'Oréal Revitalift 1.5% Pure Hyaluronic Serum", price:849, orig:1200, rating:4.4, reviews:2100, platform:'flipkart',image:'https://images.unsplash.com/photo-1556228720-da5d3bfa46ce?w=400&h=400&fit=crop', category:'beauty', link:'https://www.flipkart.com' },
  { id:'b10', title:'Neutrogena Hydro Boost Gel Moisturizer',         price:499, orig:850,  rating:4.7, reviews:4523, platform:'amazon',  image:'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=400&h=400&fit=crop', category:'beauty', link:'https://www.amazon.in' },
  { id:'b11', title:'Neutrogena Hydro Boost Gel Moisturizer',         price:549, orig:850,  rating:4.6, reviews:3891, platform:'nykaa',   image:'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=400&h=400&fit=crop', category:'beauty', link:'https://www.nykaa.com' },
  { id:'b12', title:'Neutrogena Hydro Boost Gel Moisturizer',         price:579, orig:850,  rating:4.5, reviews:2750, platform:'flipkart',image:'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=400&h=400&fit=crop', category:'beauty', link:'https://www.flipkart.com' },
  { id:'b13', title:'Lakme 9to5 Eyeshadow Palette 12 Shades',         price:699, orig:995,  rating:4.3, reviews:2156, platform:'myntra',  image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', category:'beauty', link:'https://www.myntra.com' },
  { id:'b14', title:'Lakme 9to5 Eyeshadow Palette 12 Shades',         price:749, orig:995,  rating:4.4, reviews:1987, platform:'nykaa',   image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', category:'beauty', link:'https://www.nykaa.com' },
  { id:'b15', title:'Forest Essentials Soundarya Face Wash',           price:1095,orig:1350, rating:4.9, reviews:1243, platform:'nykaa',   image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop', category:'beauty', link:'https://www.nykaa.com' },
  { id:'b16', title:'Charlotte Tilbury Pillow Talk Lipstick',          price:3200,orig:3800, rating:4.8, reviews:876,  platform:'myntra',  image:'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop', category:'beauty', link:'https://www.myntra.com' },

  // ── ELECTRONICS ──
  { id:'e1',  title:'Apple iPhone 15 128GB Midnight Black',  price:69999, orig:79900,  rating:4.8, reviews:12456, platform:'amazon',  image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e2',  title:'Apple iPhone 15 128GB Midnight Black',  price:71999, orig:79900,  rating:4.7, reviews:8923,  platform:'flipkart',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e3',  title:'Samsung Galaxy S24 Ultra 256GB Titanium',price:87999,orig:109999, rating:4.8, reviews:9871,  platform:'amazon',  image:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e4',  title:'Samsung Galaxy S24 Ultra 256GB Titanium',price:89999,orig:109999, rating:4.7, reviews:8432,  platform:'flipkart',image:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e5',  title:'Sony WH-1000XM5 Wireless Headphones',   price:24999, orig:34990,  rating:4.9, reviews:6754,  platform:'amazon',  image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e6',  title:'Sony WH-1000XM5 Wireless Headphones',   price:25999, orig:34990,  rating:4.8, reviews:5231,  platform:'flipkart',image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e7',  title:'Apple MacBook Air M2 13-inch 8GB 256GB', price:99900, orig:119900, rating:4.9, reviews:4321,  platform:'amazon',  image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e8',  title:'Apple MacBook Air M2 13-inch 8GB 256GB', price:101900,orig:119900, rating:4.8, reviews:3654,  platform:'flipkart',image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e9',  title:'Apple Watch Series 9 GPS 45mm Midnight', price:38999, orig:44900,  rating:4.7, reviews:3421,  platform:'flipkart',image:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e10', title:'Apple Watch Series 9 GPS 45mm Midnight', price:39900, orig:44900,  rating:4.7, reviews:3021,  platform:'amazon',  image:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e11', title:'boAt Airdopes 141 TWS Earbuds',          price:799,   orig:2990,   rating:4.3, reviews:34521, platform:'flipkart',image:'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },
  { id:'e12', title:'boAt Airdopes 141 TWS Earbuds',          price:849,   orig:2990,   rating:4.2, reviews:28750, platform:'amazon',  image:'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e13', title:'iPad Air 5th Gen Wi-Fi 256GB Space Grey', price:71900, orig:84900,  rating:4.8, reviews:2341,  platform:'amazon',  image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', category:'electronics', link:'https://www.amazon.in' },
  { id:'e14', title:'iPad Air 5th Gen Wi-Fi 256GB Space Grey', price:72900, orig:84900,  rating:4.7, reviews:1987,  platform:'flipkart',image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', category:'electronics', link:'https://www.flipkart.com' },

  // ── FASHION ──
  { id:'f1',  title:'Zara Floral Wrap Midi Dress',              price:3499, orig:5990,  rating:4.5, reviews:1234, platform:'myntra',  image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f2',  title:'Zara Floral Wrap Midi Dress',              price:3799, orig:5990,  rating:4.4, reviews:876,  platform:'amazon',  image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop', category:'fashion', link:'https://www.amazon.in' },
  { id:'f3',  title:'Nike Air Max 270 React Running Shoes',     price:8499, orig:11995, rating:4.8, reviews:6789, platform:'amazon',  image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category:'fashion', link:'https://www.amazon.in' },
  { id:'f4',  title:'Nike Air Max 270 React Running Shoes',     price:8995, orig:11995, rating:4.7, reviews:5432, platform:'myntra',  image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f5',  title:'H&M Structured Handle Shoulder Bag',       price:1699, orig:2999,  rating:4.3, reviews:1987, platform:'flipkart',image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop', category:'fashion', link:'https://www.flipkart.com' },
  { id:'f6',  title:'H&M Structured Handle Shoulder Bag',       price:1799, orig:2999,  rating:4.4, reviews:2341, platform:'myntra',  image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f7',  title:"Levi's 511 Slim Fit Stretch Jeans",        price:2299, orig:3999,  rating:4.5, reviews:7654, platform:'amazon',  image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', category:'fashion', link:'https://www.amazon.in' },
  { id:'f8',  title:"Levi's 511 Slim Fit Stretch Jeans",        price:2499, orig:3999,  rating:4.6, reviews:8923, platform:'myntra',  image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f9',  title:"Levi's 511 Slim Fit Stretch Jeans",        price:2599, orig:3999,  rating:4.4, reviews:5432, platform:'flipkart',image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', category:'fashion', link:'https://www.flipkart.com' },
  { id:'f10', title:'Mango Oversized Double-Breasted Blazer',   price:4999, orig:7999,  rating:4.6, reviews:1543, platform:'myntra',  image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f11', title:'Adidas Ultraboost 22 Running Shoes',       price:11995,orig:15995, rating:4.8, reviews:4321, platform:'amazon',  image:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', category:'fashion', link:'https://www.amazon.in' },
  { id:'f12', title:'Adidas Ultraboost 22 Running Shoes',       price:12999,orig:15995, rating:4.7, reviews:3210, platform:'myntra',  image:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f13', title:'Tommy Hilfiger Classic Polo T-Shirt',      price:1699, orig:2999,  rating:4.4, reviews:5432, platform:'flipkart',image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', category:'fashion', link:'https://www.flipkart.com' },
  { id:'f14', title:'Tommy Hilfiger Classic Polo T-Shirt',      price:1799, orig:2999,  rating:4.5, reviews:6543, platform:'myntra',  image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', category:'fashion', link:'https://www.myntra.com' },
  { id:'f15', title:'Tommy Hilfiger Classic Polo T-Shirt',      price:1899, orig:2999,  rating:4.3, reviews:4123, platform:'amazon',  image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', category:'fashion', link:'https://www.amazon.in' },
];

const CATEGORY_IMAGE_FALLBACK = {
  beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
};

const toSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSku = (id) => {
  const hash = Math.abs(
    id.split('').reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) % 10000000000, 5381)
  );
  return String(hash).padStart(10, '0');
};

const buildExactProductLink = ({ id, platform, title }) => {
  const sku = toSku(id);
  const slug = toSlug(title);

  if (platform === 'amazon') {
    return `https://www.amazon.in/dp/${sku}`;
  }
  if (platform === 'flipkart') {
    return `https://www.flipkart.com/${slug}/p/itm${sku}`;
  }
  if (platform === 'nykaa') {
    return `https://www.nykaa.com/${slug}/p/${sku}`;
  }
  if (platform === 'myntra') {
    return `https://www.myntra.com/${slug}/${sku}/buy`;
  }

  return '#';
};

export const PRODUCTS = RAW_PRODUCTS.map((product) => {
  const link = buildExactProductLink(product);

  return {
    ...product,
    link,
    image: product.image || CATEGORY_IMAGE_FALLBACK[product.category],
  };
});


export const getAllProducts = () => PRODUCTS;

export const getProductsByCategory = (category) =>
  PRODUCTS.filter((p) => p.category === category);

export const getProductsByTitle = (title) =>
  PRODUCTS.filter((p) => p.title === title);

export const searchProducts = (query) => {
  const q = (query || "").toLowerCase().trim();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) => p.title.toLowerCase().includes(q));
};

