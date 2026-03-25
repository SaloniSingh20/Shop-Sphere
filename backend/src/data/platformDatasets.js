const { normalizeProduct } = require("../utils/normalizers");

const DATASETS = {
  Amazon: [
    { title: "Apple iPhone 15 (128GB)", description: "A16 Bionic, Super Retina XDR", price: 69999, rating: 4.5, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=iphone+15" },
    { title: "Samsung Galaxy M14 5G", description: "6000mAh battery smartphone", price: 11999, rating: 4.2, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=samsung+galaxy+m14" },
    { title: "OnePlus Nord CE 4", description: "5G smartphone with AMOLED display", price: 24999, rating: 4.4, image: "https://images.unsplash.com/photo-1510557880182-3f8f1f6f5f52?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=oneplus+nord+ce+4" },
    { title: "HP 15 Ryzen Laptop", description: "Thin and light performance laptop", price: 48999, rating: 4.3, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=hp+15+ryzen+laptop" },
    { title: "boAt Airdopes 141", description: "True wireless bluetooth earbuds", price: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=boat+airdopes+141" },
    { title: "Fire-Boltt Smart Watch", description: "Bluetooth calling smartwatch", price: 1999, rating: 4.0, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=fire+boltt+smart+watch" },
    { title: "Men Slim Fit Cotton T-Shirt", description: "Casual round neck tshirt", price: 499, rating: 4.1, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=men+slim+fit+tshirt" },
    { title: "Women Casual Maxi Dress", description: "Flowy daily wear dress", price: 1099, rating: 4.2, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=women+maxi+dress" },
    { title: "Men Running Sneakers", description: "Lightweight sports shoes", price: 1799, rating: 4.1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=men+running+sneakers" },
    { title: "Kitchen Storage Organizer Set", description: "Multipurpose kitchen storage solution", price: 899, rating: 4.0, image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=kitchen+organizer+set" },
    { title: "Bed Sheet King Size", description: "Cotton king size bedsheet", price: 1299, rating: 4.0, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=king+size+bedsheet" },
    { title: "Vitamin C Face Serum", description: "Brightening daily skincare serum", price: 699, rating: 4.2, image: "https://images.unsplash.com/photo-1629198735660-e39ea93f5f8d?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=vitamin+c+serum" },
    { title: "Sunscreen SPF 50", description: "Broad spectrum sunscreen", price: 399, rating: 4.1, image: "https://images.unsplash.com/photo-1556228724-4f0f4c2a7f1a?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=sunscreen+spf+50" },
    { title: "Matte Liquid Lipstick Set", description: "Long stay matte lipstick combo", price: 549, rating: 4.2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=matte+liquid+lipstick" },
    { title: "Face Moisturizer Gel", description: "Hydrating moisturizer for daily use", price: 349, rating: 4.0, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=face+moisturizer+gel" },
  ],
  Flipkart: [
    { title: "Nothing Phone (2a)", description: "5G smartphone with AMOLED display", price: 23999, rating: 4.4, image: "https://images.unsplash.com/photo-1510557880182-3f8f1f6f5f52?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=nothing+phone+2a" },
    { title: "Samsung Galaxy S23 FE", description: "Flagship grade camera smartphone", price: 42999, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=samsung+galaxy+s23+fe" },
    { title: "Redmi Note 13 Pro", description: "High refresh rate AMOLED phone", price: 25999, rating: 4.3, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=redmi+note+13+pro" },
    { title: "boAt Airdopes 141", description: "True wireless earbuds", price: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=boat+airdopes+141" },
    { title: "Realme Buds Wireless", description: "Neckband bluetooth earphones", price: 1599, rating: 4.0, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=realme+buds+wireless" },
    { title: "ASUS Vivobook 15", description: "15-inch performance laptop", price: 42999, rating: 4.2, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=asus+vivobook+15" },
    { title: "Lenovo IdeaPad Slim 3", description: "Portable laptop for work and study", price: 46999, rating: 4.2, image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=lenovo+ideapad+slim+3" },
    { title: "Women Solid Maxi Dress", description: "Elegant daily wear dress", price: 999, rating: 4.2, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=women+maxi+dress" },
    { title: "Men Printed Casual Shirt", description: "Comfort fit casual shirt", price: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=men+printed+casual+shirt" },
    { title: "Men Running Sneakers", description: "Lightweight sports shoes", price: 1499, rating: 4.1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=men+running+sneakers" },
    { title: "Kitchen Storage Container Pack", description: "Airtight multipurpose containers", price: 799, rating: 4.0, image: "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=storage+container+set" },
    { title: "Bed Sheet Double Size", description: "Soft cotton bedsheet set", price: 999, rating: 4.0, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=double+bed+sheet" },
    { title: "Face Moisturizer Gel Cream", description: "Hydrating daily moisturizer", price: 349, rating: 4.0, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=moisturizer+gel" },
    { title: "Sunscreen SPF 50 PA+++", description: "UV protection sunscreen lotion", price: 429, rating: 4.1, image: "https://images.unsplash.com/photo-1556228724-4f0f4c2a7f1a?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=sunscreen+spf+50" },
    { title: "Matte Lipstick Combo", description: "Long wear matte lipstick set", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=matte+lipstick+combo" },
  ],
  Nykaa: [
    { title: "Nykaa Matte Lipstick", description: "Long lasting matte finish lipstick", price: 499, rating: 4.3, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=matte+lipstick&root=search" },
    { title: "Nykaa SkinRX Vitamin C Serum", description: "Radiance boosting serum", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=vitamin+c+serum&root=search" },
    { title: "Nykaa Sunscreen SPF 50", description: "Lightweight UV protection", price: 599, rating: 4.1, image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=sunscreen+spf+50&root=search" },
    { title: "Nykaa Hydrating Face Moisturizer", description: "Daily hydration cream", price: 449, rating: 4.0, image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0f?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=face+moisturizer&root=search" },
    { title: "Nykaa Perfume Body Mist", description: "Fresh floral body mist", price: 699, rating: 4.0, image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=body+mist&root=search" },
    { title: "Nykaa Kajal Eyeliner", description: "Smudge proof kajal eyeliner", price: 299, rating: 4.2, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=kajal&root=search" },
    { title: "Nykaa Compact Powder", description: "Oil control compact powder", price: 349, rating: 4.1, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=compact+powder&root=search" },
    { title: "Nykaa BB Cream", description: "Daily wear BB cream", price: 425, rating: 4.0, image: "https://images.unsplash.com/photo-1614859324967-42a3fe74f80b?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=bb+cream&root=search" },
    { title: "Nykaa Face Wash", description: "Gentle daily cleansing face wash", price: 299, rating: 4.0, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=face+wash&root=search" },
    { title: "Nykaa Hair Shampoo", description: "Strengthening shampoo for hair care", price: 549, rating: 4.1, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=hair+shampoo&root=search" },
    { title: "Nykaa Hair Conditioner", description: "Smoothening conditioner", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=hair+conditioner&root=search" },
    { title: "Nykaa Sheet Mask Combo", description: "Hydrating sheet mask pack", price: 399, rating: 4.2, image: "https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=sheet+mask&root=search" },
    { title: "Nykaa Lip Balm", description: "Moisturizing lip balm", price: 199, rating: 4.3, image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=lip+balm&root=search" },
    { title: "Nykaa Foundation", description: "Medium coverage liquid foundation", price: 799, rating: 4.1, image: "https://images.unsplash.com/photo-1631214540242-ec58c49dbe8a?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=foundation&root=search" },
    { title: "Nykaa Primer", description: "Pore blur makeup primer", price: 649, rating: 4.1, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=makeup+primer&root=search" },
  ],
};

function scoreDatasetItem(item, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return 1;

  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes(q)) return 4;

  const terms = q.split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;

  const matches = terms.filter((term) => text.includes(term)).length;
  return matches > 0 ? 1 + matches : 0;
}

function searchDatasetByPlatform(platform, query, limit = 8) {
  const source = DATASETS[platform] || [];

  return source
    .map((item) => ({ item, score: scoreDatasetItem(item, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating)
    .slice(0, limit)
    .map(({ item }) =>
      normalizeProduct({
        ...item,
        platform,
      })
    )
    .filter(Boolean);
}

module.exports = {
  searchDatasetByPlatform,
};
