const { normalizeProduct } = require("../utils/normalizers");

const DATASETS = {
  Amazon: [
    { title: "Apple iPhone 15 (128GB)", description: "A16 Bionic, Super Retina XDR", price: 69999, rating: 4.5, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=iphone+15" },
    { title: "Samsung Galaxy M14 5G", description: "6000mAh battery smartphone", price: 11999, rating: 4.2, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=samsung+galaxy+m14" },
    { title: "OnePlus Nord Buds 2", description: "Wireless Bluetooth earbuds", price: 2199, rating: 4.3, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=oneplus+nord+buds+2" },
    { title: "Men Slim Fit Cotton T-Shirt", description: "Casual round neck tshirt", price: 499, rating: 4.1, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=men+slim+fit+tshirt" },
    { title: "Vitamin C Face Serum", description: "Brightening daily skincare serum", price: 699, rating: 4.2, image: "https://images.unsplash.com/photo-1629198735660-e39ea93f5f8d?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=vitamin+c+serum" },
    { title: "Sunscreen SPF 50", description: "Broad spectrum sunscreen", price: 399, rating: 4.1, image: "https://images.unsplash.com/photo-1556228724-4f0f4c2a7f1a?w=600&h=600&fit=crop", product_url: "https://www.amazon.in/s?k=sunscreen+spf+50" },
  ],
  Flipkart: [
    { title: "Nothing Phone (2a)", description: "5G smartphone with AMOLED display", price: 23999, rating: 4.4, image: "https://images.unsplash.com/photo-1510557880182-3f8f1f6f5f52?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=nothing+phone+2a" },
    { title: "boAt Airdopes 141", description: "True wireless earbuds", price: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=boat+airdopes+141" },
    { title: "ASUS Vivobook 15", description: "15-inch performance laptop", price: 42999, rating: 4.2, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=asus+vivobook+15" },
    { title: "Women Solid Maxi Dress", description: "Elegant daily wear dress", price: 999, rating: 4.2, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=women+maxi+dress" },
    { title: "Men Running Sneakers", description: "Lightweight sports shoes", price: 1499, rating: 4.1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=men+running+sneakers" },
    { title: "Moisturizer Gel Cream", description: "Hydrating daily moisturizer", price: 349, rating: 4.0, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop", product_url: "https://www.flipkart.com/search?q=moisturizer+gel" },
  ],
  Nykaa: [
    { title: "Nykaa Matte Lipstick", description: "Long lasting matte finish lipstick", price: 499, rating: 4.3, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=matte+lipstick&root=search" },
    { title: "Nykaa SkinRX Vitamin C Serum", description: "Radiance boosting serum", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=vitamin+c+serum&root=search" },
    { title: "Nykaa Sunscreen SPF 50", description: "Lightweight UV protection", price: 599, rating: 4.1, image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=sunscreen+spf+50&root=search" },
    { title: "Nykaa Hydrating Face Moisturizer", description: "Daily hydration cream", price: 449, rating: 4.0, image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0f?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=face+moisturizer&root=search" },
    { title: "Nykaa Perfume Body Mist", description: "Fresh floral body mist", price: 699, rating: 4.0, image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=body+mist&root=search" },
    { title: "Nykaa Kajal Eyeliner", description: "Smudge proof kajal eyeliner", price: 299, rating: 4.2, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop", product_url: "https://www.nykaa.com/search/result/?q=kajal&root=search" },
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
