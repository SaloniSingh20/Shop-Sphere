import { useState, useEffect, useCallback } from "react";
import { PLATFORMS } from "../backend/mockApi";

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400"><rect width="100%" height="100%" fill="#EFE7E1"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#7A6B6E" font-family="Arial" font-size="15">Image unavailable</text></svg>'
  );

const API_BASES = ["", "http://localhost:4000"];

const requestJson = async (path, options) => {
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options);
      if (!res.ok) continue;
      return await res.json();
    } catch {
      // Try next base URL.
    }
  }
  return null;
};


// ─── GLOBAL STYLES ───────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#FDF8F4;color:#2C1810;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#F5E6D8}::-webkit-scrollbar-thumb{background:#8B1A2C;border-radius:4px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
    @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .fade-up{animation:fadeUp .5s ease both}
    .fade-in{animation:fadeIn .4s ease both}
    .scale-in{animation:scaleIn .4s ease both}
    .card-hover{transition:transform .3s ease,box-shadow .3s ease;cursor:pointer}
    .card-hover:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(139,26,44,.16)!important}
    .btn-primary{transition:all .2s ease;cursor:pointer}
    .btn-primary:hover{background:#6B1422!important;transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,26,44,.3)}
    .btn-outline{transition:all .2s ease;cursor:pointer}
    .btn-outline:hover{background:#8B1A2C!important;color:white!important}
    .nav-link{transition:color .2s ease;cursor:pointer}
    .nav-link:hover{color:#8B1A2C!important}
    .wishlist-btn{transition:all .2s ease;cursor:pointer}
    .wishlist-btn:hover{transform:scale(1.3)!important}
    .platform-tag{transition:all .2s ease;cursor:pointer}
    .platform-tag:hover{background:#8B1A2C!important;color:white!important;border-color:#8B1A2C!important}
    input:focus,textarea:focus{outline:none!important;border-color:#8B1A2C!important;box-shadow:0 0 0 3px rgba(139,26,44,.12)!important}
    .skeleton{background:linear-gradient(90deg,#F5E6D8 25%,#FAF2EC 50%,#F5E6D8 75%);background-size:400px 100%;animation:shimmer 1.4s infinite}
    .float-card{animation:float 3s ease-in-out infinite}
    select{cursor:pointer}
    select:focus{outline:none;border-color:#8B1A2C!important}
  `}</style>
);

// ─── DATA ────────────────────────────────────────────────────────
// ─── UTILITIES ───────────────────────────────────────────────────
const scoreProduct = (p, q) => {
  const rel = q.toLowerCase().split(' ').filter(w=>w).reduce((acc,w)=>acc+(p.title.toLowerCase().includes(w)?20:0),0);
  return rel + p.rating*10 + 10000/p.price;
};
const discount = p => Math.round((1 - p.price/p.orig)*100);
const fmt = n => '₹' + n.toLocaleString('en-IN');
const groupByTitle = ps => {
  const m = {};
  ps.forEach(p=>{ if(!m[p.title]) m[p.title]=[]; m[p.title].push(p); });
  return Object.values(m);
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────
const Stars = ({ r, n, sm }) => (
  <span style={{display:'flex',alignItems:'center',gap:4}}>
    <span style={{color:'#F5A623',fontSize:sm?12:14}}>{'★'.repeat(Math.round(r))}{'☆'.repeat(5-Math.round(r))}</span>
    <span style={{fontSize:sm?11:12,color:'#9A8A8D'}}>{n?.toLocaleString()}</span>
  </span>
);

const PBadge = ({ platform }) => {
  const p = PLATFORMS[platform];
  return <span style={{background:p.bg,color:p.textColor,fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,display:'inline-block'}}>{p.icon} {p.name}</span>;
};

const Tag = ({ label, onClick, active }) => (
  <button className="platform-tag" onClick={onClick} style={{
    background:active?'#8B1A2C':'transparent', color:active?'white':'#8B1A2C',
    border:'1.5px solid #8B1A2C', borderRadius:20, padding:'6px 16px',
    fontSize:13, fontWeight:500, cursor:'pointer'
  }}>{label}</button>
);

// ─── NAVBAR ──────────────────────────────────────────────────────
const Navbar = ({ nav, wishlist, query, setQuery }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleSearch = (e) => { if(e.key==='Enter'&&query.trim()) nav('search',{q:query}); };
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(253,248,244,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid #EDE0D4',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
      {/* Logo */}
      <div onClick={()=>nav('home')} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:34,height:34,background:'#8B1A2C',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:700}}>S</div>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#8B1A2C',letterSpacing:'-0.5px'}}>ShopSphere</span>
      </div>
      {/* Links */}
      <div style={{display:'flex',gap:28,alignItems:'center'}}>
        {[['Home','home'],['Beauty','category'],['Electronics','category'],['Fashion','category']].map(([l,p])=>(
          <span key={l} className="nav-link" onClick={()=>nav(p,{cat:l.toLowerCase()})} style={{fontSize:14,fontWeight:500,color:'#2C1810',letterSpacing:0.2}}>{l}</span>
        ))}
      </div>
      {/* Search */}
      <div style={{display:'flex',alignItems:'center',background:'#F5E6D8',borderRadius:12,padding:'8px 14px',gap:8,flex:'0 1 240px'}}>
        <span style={{color:'#8B1A2C',fontSize:14}}>🔍</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleSearch}
          placeholder="Search products…" style={{border:'none',background:'transparent',outline:'none',fontSize:13,color:'#2C1810',width:'100%',fontFamily:"'DM Sans',sans-serif"}}/>
      </div>
      {/* Icons */}
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <span onClick={()=>nav('wishlist')} style={{cursor:'pointer',fontSize:20,position:'relative'}}>
          🤍<span style={{position:'absolute',top:-6,right:-6,background:'#8B1A2C',color:'white',borderRadius:'50%',width:16,height:16,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>{wishlist.length}</span>
        </span>
        <span onClick={()=>nav('login')} style={{cursor:'pointer',fontSize:20}}>👤</span>
      </div>
    </nav>
  );
};

// ─── PRODUCT CARD ────────────────────────────────────────────────
const ProductCard = ({ product, nav, wishlist, toggleWishlist, isCheapest, isTop, delay=0 }) => {
  const disc = discount(product);
  const isW = wishlist.includes(product.id);
  return (
    <div className="card-hover fade-up" onClick={()=>nav('product',{title:product.title,cat:product.category})}
      style={{background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.06)',animationDelay:`${delay}ms`,position:'relative'}}>
      {/* Heart */}
      <button className="wishlist-btn" onClick={e=>{e.stopPropagation();toggleWishlist(product.id);}}
        style={{position:'absolute',top:10,left:10,zIndex:3,background:'white',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,.1)',fontSize:15}}>
        {isW?'❤️':'🤍'}
      </button>
      {/* Badges */}
      <div style={{position:'absolute',top:10,right:10,zIndex:3,display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
        {disc>0&&<span style={{background:'#8B1A2C',color:'white',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>{disc}% OFF</span>}
        {isCheapest&&<span style={{background:'#EA580C',color:'white',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>Best Price 🔥</span>}
        {isTop&&<span style={{background:'#2563EB',color:'white',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>Top Match ⭐</span>}
      </div>
      {/* Img */}
      <div style={{height:190,background:'#FAF2EC',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <img src={product.image} alt={product.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s ease'}}
          onMouseOver={e=>e.target.style.transform='scale(1.06)'} onMouseOut={e=>e.target.style.transform='scale(1)'}
          onError={e=>{e.target.src=IMAGE_PLACEHOLDER;}}/>
      </div>
      {/* Body */}
      <div style={{padding:'14px 16px 16px'}}>
        <PBadge platform={product.platform}/>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:'#2C1810',margin:'8px 0 5px',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',minHeight:36}}>
          {product.title}
        </p>
        <Stars r={product.rating} n={product.reviews} sm/>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:'#8B1A2C'}}>{fmt(product.price)}</span>
          <span style={{fontSize:12,color:'#9A8A8D',textDecoration:'line-through'}}>{fmt(product.orig)}</span>
        </div>
        <button className="btn-primary" onClick={e=>{e.stopPropagation();window.open(product.link,'_blank');}}
          style={{width:'100%',background:'#8B1A2C',color:'white',border:'none',borderRadius:12,padding:'9px 0',marginTop:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.3}}>
          Buy Now →
        </button>
      </div>
    </div>
  );
};

// ─── HOME PAGE ───────────────────────────────────────────────────
const HomePage = ({ nav, wishlist, toggleWishlist, products }) => {
  const [searchQ, setSearchQ] = useState('');
  const [activePlatform, setActivePlatform] = useState(null);

  const discountedProducts = products
    .filter(p=>discount(p)>=25)
    .sort((a,b)=>discount(b)-discount(a))
    .slice(0,8);

  const catCards = [
    { label:'Beauty',      emoji:'💄', bg:'#FFF0F4', img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop', cat:'beauty' },
    { label:'Electronics', emoji:'📱', bg:'#F0F4FF', img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop', cat:'electronics' },
    { label:'Fashion',     emoji:'👗', bg:'#F4F0FF', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop', cat:'fashion' },
  ];

  const heroProduct = products.find(p=>p.category==='beauty'&&p.platform==='nykaa') || products[0];

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:480,marginTop:64}}>
        {/* Left */}
        <div style={{background:'linear-gradient(135deg,#8B1A2C 0%,#6B1422 60%,#3D0A12 100%)',padding:'60px 56px',display:'flex',flexDirection:'column',justifyContent:'center',gap:24}}>
          <div style={{fontSize:12,letterSpacing:3,color:'rgba(255,255,255,.6)',fontWeight:600,textTransform:'uppercase'}}>Compare · Save · Shop</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:54,fontWeight:900,color:'white',lineHeight:1.1,letterSpacing:'-1px'}}>
            Shop Smarter.<br/><em style={{fontStyle:'italic',color:'#F5E6D8'}}>Spend Less.</em>
          </h1>
          <p style={{color:'rgba(255,255,255,.7)',fontSize:15,lineHeight:1.6,maxWidth:380}}>
            Compare prices across Amazon, Flipkart, Nykaa & Myntra instantly. Find the best deal every time.
          </p>
          {/* Search Bar */}
          <div style={{display:'flex',background:'white',borderRadius:14,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.2)',maxWidth:460}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&searchQ.trim())nav('search',{q:searchQ});}}
              placeholder="Search any product…" style={{flex:1,border:'none',padding:'14px 20px',fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",color:'#2C1810'}}/>
            <button className="btn-primary" onClick={()=>searchQ.trim()&&nav('search',{q:searchQ})}
              style={{background:'#8B1A2C',color:'white',border:'none',padding:'14px 24px',fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>
              Search 🔍
            </button>
          </div>
          {/* Platform Tags */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {Object.entries(PLATFORMS).map(([k,v])=>(
              <button key={k} className="platform-tag" onClick={()=>{setActivePlatform(activePlatform===k?null:k);}}
                style={{background:activePlatform===k?'white':'rgba(255,255,255,.15)',color:activePlatform===k?'#8B1A2C':'white',border:activePlatform===k?'2px solid white':'2px solid rgba(255,255,255,.3)',borderRadius:20,padding:'7px 18px',fontSize:13,fontWeight:500,cursor:'pointer',transition:'all .2s'}}>
                {v.icon} {v.name}
              </button>
            ))}
          </div>
        </div>
        {/* Right */}
        <div style={{background:'#F5E6D8',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&h=500&fit=crop" alt="hero"
            style={{width:'100%',height:'100%',objectFit:'cover',opacity:.7}}/>
          {heroProduct&&(
            <div className="float-card" style={{position:'absolute',bottom:32,right:32,background:'white',borderRadius:20,padding:'16px 20px',boxShadow:'0 12px 40px rgba(0,0,0,.2)',maxWidth:230,cursor:'pointer'}}
              onClick={()=>nav('product',{title:heroProduct.title,cat:heroProduct.category})}>
              <PBadge platform={heroProduct.platform}/>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:'#2C1810',margin:'8px 0 4px',lineHeight:1.3}}>{heroProduct.title}</p>
              <Stars r={heroProduct.rating} n={heroProduct.reviews} sm/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#8B1A2C',marginTop:6}}>{fmt(heroProduct.price)}</div>
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{padding:'60px 48px',background:'#FDF8F4'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
          <div>
            <p style={{fontSize:12,letterSpacing:3,color:'#8B1A2C',fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Browse</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:'#2C1810'}}>Shop by Category</h2>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {catCards.map((c,i)=>(
            <div key={c.label} className="card-hover fade-up" style={{background:c.bg,borderRadius:20,overflow:'hidden',animationDelay:`${i*80}ms`}}
              onClick={()=>nav('category',{cat:c.cat})}>
              <div style={{height:140,overflow:'hidden'}}>
                <img src={c.img} alt={c.label} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}}/>
              </div>
              <div style={{padding:'20px 24px 24px'}}>
                <div style={{fontSize:28,marginBottom:8}}>{c.emoji}</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#2C1810',marginBottom:6}}>{c.label}</h3>
                <p style={{fontSize:13,color:'#7A6B6E',lineHeight:1.5}}>Discover best prices from all top platforms</p>
                <div style={{marginTop:14,color:'#8B1A2C',fontWeight:600,fontSize:13}}>Shop Now →</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCOUNTED PRODUCTS ── */}
      <section style={{padding:'48px',background:'#FAF2EC'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div>
            <p style={{fontSize:12,letterSpacing:3,color:'#8B1A2C',fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Hot Deals</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:'#2C1810'}}>Discounted Products</h2>
          </div>
          <button className="btn-primary" onClick={()=>nav('search',{q:'discount'})}
            style={{background:'#8B1A2C',color:'white',border:'none',borderRadius:12,padding:'12px 24px',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:8}}>
            View All 🛒
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {discountedProducts.slice(0,8).map((p,i)=>(
            <ProductCard key={p.id} product={p} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} delay={i*60}
              isCheapest={p===discountedProducts.filter(x=>x.title===p.title).sort((a,b)=>a.price-b.price)[0]}/>
          ))}
        </div>
      </section>

      {/* ── ALL INDIVIDUAL LISTINGS ── */}
      <section style={{padding:'48px',background:'#FDF8F4'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div>
            <p style={{fontSize:12,letterSpacing:3,color:'#8B1A2C',fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Catalog</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:'#2C1810'}}>All Individual Items</h2>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {products.map((p,i)=>(
            <ProductCard key={p.id} product={p} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} delay={i*20}/>
          ))}
        </div>
      </section>

      {/* ── QUOTE SECTION ── */}
      <section style={{background:'linear-gradient(135deg,#1A0A0E 0%,#2D1B1F 100%)',padding:'80px 80px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
        <div>
          <div style={{fontSize:80,color:'#8B1A2C',fontFamily:"'Playfair Display',serif",lineHeight:.8,marginBottom:24,opacity:.5}}>"</div>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:'italic',color:'white',lineHeight:1.6,marginBottom:24}}>
            The best deals aren't found by luck — they're found by those who compare.
          </p>
          <div style={{width:48,height:3,background:'#8B1A2C',marginBottom:16,borderRadius:2}}></div>
          <p style={{color:'rgba(255,255,255,.5)',fontSize:14,letterSpacing:2,textTransform:'uppercase',fontWeight:500}}>ShopSphere Philosophy</p>
        </div>
        <div style={{position:'relative'}}>
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&h=380&fit=crop" alt="shopping"
            style={{width:'100%',borderRadius:20,opacity:.8}} onError={e=>{e.target.style.display='none';}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,#1A0A0E,transparent)',borderRadius:20}}></div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{padding:'72px 48px',background:'#FDF8F4'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:700,color:'#2C1810',marginBottom:40}}>Contact Us</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:32,background:'#F5E6D8',borderRadius:24,overflow:'hidden'}}>
          <div style={{position:'relative',minHeight:300}}>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&h=400&fit=crop" alt="contact"
              style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.background='#EDE0D4';}}/>
          </div>
          <div style={{padding:'40px 40px 40px 20px'}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#2C1810',marginBottom:24}}>Ask how we can help you</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              {['Name *','Email *'].map(ph=>(
                <input key={ph} placeholder={ph} style={{border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",background:'white',transition:'border-color .2s'}}/>
              ))}
            </div>
            <textarea rows={4} placeholder="Message *" style={{width:'100%',border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",background:'white',resize:'vertical',marginBottom:16,transition:'border-color .2s'}}/>
            <button className="btn-primary" style={{width:'100%',background:'#8B1A2C',color:'white',border:'none',borderRadius:12,padding:'14px',fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
              Send Message ✉️
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:'#1A0A0E',padding:'56px 48px 28px',color:'rgba(255,255,255,.6)'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:40}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
              <div style={{width:36,height:36,background:'#8B1A2C',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:16,fontWeight:700}}>S</div>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'white'}}>ShopSphere</span>
            </div>
            <p style={{fontSize:13,lineHeight:1.7,maxWidth:260,marginBottom:20}}>Compare prices across India's top e-commerce platforms in one place.</p>
            <div style={{display:'flex',gap:12}}>
              {['📘','🐦','📷','💼'].map((icon,i)=>(
                <div key={i} style={{width:36,height:36,background:'rgba(255,255,255,.08)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,transition:'background .2s'}}>{icon}</div>
              ))}
            </div>
          </div>
          {[
            {title:'Menu', links:['Home','Store','Blog','Sale']},
            {title:'Quick Links', links:['Cart','Wishlist','Account','Privacy Policy']},
            {title:'Platforms', links:['Amazon','Flipkart','Nykaa','Myntra']},
          ].map(col=>(
            <div key={col.title}>
              <h4 style={{color:'white',fontWeight:600,fontSize:15,marginBottom:16}}>{col.title}</h4>
              {col.links.map(l=><div key={l} style={{marginBottom:10,fontSize:13,cursor:'pointer',transition:'color .2s'}}
                onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.6)'}>{l}</div>)}
            </div>
          ))}
        </div>
        {/* Newsletter */}
        <div style={{textAlign:'center',borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:32,marginBottom:24}}>
          <h3 style={{color:'white',fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:16}}>Subscribe for exclusive offers</h3>
          <div style={{display:'flex',justifyContent:'center',gap:0,maxWidth:400,margin:'0 auto'}}>
            <input placeholder="Email…" style={{flex:1,border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.08)',borderRadius:'12px 0 0 12px',padding:'11px 18px',color:'white',fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
            <button className="btn-primary" style={{background:'#8B1A2C',color:'white',border:'none',borderRadius:'0 12px 12px 0',padding:'11px 22px',fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Submit</button>
          </div>
          <p style={{fontSize:12,marginTop:12}}>By subscribing you agree with our <span style={{color:'#8B1A2C',cursor:'pointer'}}>Privacy Policy</span></p>
        </div>
        <div style={{textAlign:'center',borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:20,fontSize:12}}>
          © 2025 ShopSphere. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

// ─── CATEGORY PAGE ───────────────────────────────────────────────
const CategoryPage = ({ cat, nav, wishlist, toggleWishlist, products }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceMax, setPriceMax] = useState(999999);
  const [electronicsLive, setElectronicsLive] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadElectronicsLive = async () => {
      if (cat !== 'electronics') {
        setElectronicsLive([]);
        return;
      }

      const fetchProducts = async (platform, query, page = 1) => {
        const payload = await requestJson(
          `/api/products/platform/${platform}?query=${encodeURIComponent(query)}&limit=24&page=${page}`
        );
        return Array.isArray(payload?.products) ? payload.products : [];
      };

      const fromDbAmazon = await requestJson('/api/products/all?platform=amazon&category=electronics&limit=500');
      const fromDbFlipkart = await requestJson('/api/products/all?platform=flipkart&category=electronics&limit=500');
      const preloaded = [
        ...(Array.isArray(fromDbAmazon?.products) ? fromDbAmazon.products : []),
        ...(Array.isArray(fromDbFlipkart?.products) ? fromDbFlipkart.products : []),
      ];

      if (preloaded.length < 16) {
        await requestJson('/api/sync/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit: 10,
            pages: { amazon: 4, flipkart: 6, nykaa: 1, myntra: 1 },
          }),
        });
      }

      const collectQuery = async (platform, query) => {
        const pages = [1, 2, 3];
        const batches = await Promise.all(pages.map((page) => fetchProducts(platform, query, page)));
        return batches.flat();
      };

      const [a1, a2, a3, f1, f2, f3] = await Promise.all([
        collectQuery('amazon', 'smartphone'),
        collectQuery('amazon', 'laptop'),
        collectQuery('amazon', 'wireless earbuds'),
        collectQuery('flipkart', 'smartphone'),
        collectQuery('flipkart', 'laptop'),
        collectQuery('flipkart', 'wireless earbuds'),
      ]);

      const seen = new Set();
      const merged = [preloaded, a1, a2, a3, f1, f2, f3].flat().filter((item) => {
        if (!item?.link || seen.has(item.link)) return false;
        seen.add(item.link);
        return true;
      });

      if (isMounted) {
        setElectronicsLive(merged);
      }
    };

    loadElectronicsLive();

    return () => {
      isMounted = false;
    };
  }, [cat]);

  const catName = cat.charAt(0).toUpperCase()+cat.slice(1);
  const baseCategoryProducts = cat === 'electronics' && electronicsLive.length > 0
    ? electronicsLive
    : products;

  const categoryProducts = baseCategoryProducts.filter((p) => {
    if (cat !== 'electronics') {
      return p.category === cat;
    }
    return p.category === 'electronics' && (p.platform === 'amazon' || p.platform === 'flipkart');
  });

  const maxPrice = Math.max(100, ...categoryProducts.map(p=>p.price));

  useEffect(() => {
    if (cat === 'electronics' && !['all', 'amazon', 'flipkart'].includes(filter)) {
      setFilter('all');
    }
  }, [cat, filter]);

  useEffect(() => {
    if (categoryProducts.length === 0) {
      setPriceMax(100);
      return;
    }

    setPriceMax((prev) => {
      if (prev > maxPrice || prev < 100) return maxPrice;
      if (prev === 999999) return maxPrice;
      return prev;
    });
  }, [maxPrice, categoryProducts.length]);
  
  const groups = groupByTitle(categoryProducts);
  
  const filteredProds = categoryProducts
    .filter(p=>filter==='all'||p.platform===filter)
    .filter(p=>p.price<=priceMax);

  const sorted = [...filteredProds].sort((a,b)=>
    sortBy==='price_asc'?a.price-b.price:
    sortBy==='price_desc'?b.price-a.price:
    sortBy==='rating'?b.rating-a.rating:
    (b.rating*10+10000/b.price)-(a.rating*10+10000/a.price)
  );

  // Find cheapest per title group
  const cheapestIds = new Set(groups.map(g=>g.sort((a,b)=>a.price-b.price)[0].id));
  const topScoreId = [...categoryProducts].sort((a,b)=>(b.rating*10+10000/b.price)-(a.rating*10+10000/a.price))[0]?.id;

  const catHero = {
    beauty:     { img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=300&fit=crop', tagline:'Discover Beauty Secrets' },
    electronics:{ img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop', tagline:'Cutting-Edge Tech Deals' },
    fashion:    { img:'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=300&fit=crop', tagline:'Style Meets Savings' },
  };
  const hero = catHero[cat] || catHero.beauty;

  return (
    <div style={{marginTop:64}}>
      {/* Banner */}
      <div style={{position:'relative',height:220,overflow:'hidden'}}>
        <img src={hero.img} alt={catName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(139,26,44,.8),rgba(26,10,14,.5))',display:'flex',alignItems:'center',padding:'0 56px'}}>
          <div>
            <p style={{fontSize:12,letterSpacing:4,color:'rgba(255,255,255,.7)',fontWeight:600,textTransform:'uppercase',marginBottom:12}}>{hero.tagline}</p>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:900,color:'white',letterSpacing:'-1px'}}>{catName}</h1>
            <p style={{color:'rgba(255,255,255,.7)',marginTop:8,fontSize:15}}>{categoryProducts.length} products · 4 platforms</p>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:28,padding:'32px 40px',alignItems:'start'}}>
        {/* Sidebar Filters */}
        <aside style={{background:'white',borderRadius:20,padding:24,boxShadow:'0 4px 16px rgba(0,0,0,.06)',position:'sticky',top:80}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#2C1810',marginBottom:20}}>Filters</h3>
          
          <div style={{marginBottom:24}}>
            <p style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Platform</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:filter==='all'?'#8B1A2C':'#2C1810'}}>
                <input type="radio" name="pf" checked={filter==='all'} onChange={()=>setFilter('all')} style={{accentColor:'#8B1A2C'}}/> All Platforms
              </label>
              {Object.entries(PLATFORMS)
                .filter(([k]) => (cat === 'electronics' ? k === 'amazon' || k === 'flipkart' : true))
                .map(([k,v])=>(
                <label key={k} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:filter===k?'#8B1A2C':'#2C1810'}}>
                  <input type="radio" name="pf" checked={filter===k} onChange={()=>setFilter(k)} style={{accentColor:'#8B1A2C'}}/> {v.icon} {v.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <p style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Max Price</p>
            <input type="range" min={100} max={maxPrice} value={priceMax} onChange={e=>setPriceMax(+e.target.value)}
              style={{width:'100%',accentColor:'#8B1A2C',marginBottom:6}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#7A6B6E'}}>
              <span>₹100</span><span style={{color:'#8B1A2C',fontWeight:600}}>{fmt(priceMax)}</span>
            </div>
          </div>

          <button className="btn-outline" onClick={()=>{setFilter('all');setPriceMax(maxPrice);setSortBy('popular');}}
            style={{width:'100%',border:'1.5px solid #8B1A2C',color:'#8B1A2C',background:'transparent',borderRadius:12,padding:'10px',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
            Reset Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <p style={{fontSize:14,color:'#7A6B6E'}}><strong style={{color:'#2C1810'}}>{sorted.length}</strong> products found</p>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{border:'1.5px solid #EDE0D4',borderRadius:10,padding:'8px 14px',fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#2C1810',background:'white',fontWeight:500}}>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {sorted.map((p,i)=>(
              <ProductCard key={p.id} product={p} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist}
                isCheapest={cheapestIds.has(p.id)} isTop={p.id===topScoreId} delay={i*50}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SEARCH PAGE ─────────────────────────────────────────────────
const SearchPage = ({ q, nav, wishlist, toggleWishlist, products }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [liveResults, setLiveResults] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveSearch = async () => {
      if (!q?.trim()) {
        setLiveResults([]);
        return;
      }

      try {
        const payload = await requestJson(`/api/products/search?query=${encodeURIComponent(q)}&limit=8`);
        if (!payload) return;
        const data = Array.isArray(payload?.products) ? payload.products : [];
        if (isMounted) {
          setLiveResults(data);
        }
      } catch {
        if (isMounted) {
          setLiveResults([]);
        }
      }
    };

    fetchLiveSearch();

    return () => {
      isMounted = false;
    };
  }, [q]);

  const sourceProducts = liveResults.length > 0 ? liveResults : products;

  const scored = sourceProducts
    .map(p=>({...p, score:scoreProduct(p,q)}))
    .filter(p=>p.score>0||p.title.toLowerCase().includes(q.toLowerCase()));
  const relevant = scored;
  
  const sorted = [...relevant]
    .filter(p=>filter==='all'||p.platform===filter)
    .sort((a,b)=>
      sortBy==='score'?b.score-a.score:
      sortBy==='price_asc'?a.price-b.price:
      sortBy==='price_desc'?b.price-a.price:
      b.rating-a.rating
    );

  const cheapestId = [...relevant].sort((a,b)=>a.price-b.price)[0]?.id;
  const topId = [...relevant].sort((a,b)=>b.score-a.score)[0]?.id;

  return (
    <div style={{marginTop:64,minHeight:'100vh',background:'#FDF8F4'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#8B1A2C,#6B1422)',padding:'48px 48px 36px',color:'white'}}>
        <p style={{fontSize:12,letterSpacing:3,opacity:.7,textTransform:'uppercase',fontWeight:600,marginBottom:12}}>Search Results</p>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,letterSpacing:'-0.5px'}}>
          Results for "{q}"
        </h1>
        <p style={{opacity:.7,marginTop:8,fontSize:15}}>{sorted.length} products found across all platforms</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:28,padding:'32px 40px',alignItems:'start'}}>
        {/* Filters */}
        <aside style={{background:'white',borderRadius:20,padding:24,boxShadow:'0 4px 16px rgba(0,0,0,.06)',position:'sticky',top:80}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#2C1810',marginBottom:20}}>Filter</h3>
          <p style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Platform</p>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
              <input type="radio" name="sf" checked={filter==='all'} onChange={()=>setFilter('all')} style={{accentColor:'#8B1A2C'}}/> All
            </label>
            {Object.entries(PLATFORMS).map(([k,v])=>(
              <label key={k} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:filter===k?'#8B1A2C':'#2C1810'}}>
                <input type="radio" name="sf" checked={filter===k} onChange={()=>setFilter(k)} style={{accentColor:'#8B1A2C'}}/>{v.icon} {v.name}
              </label>
            ))}
          </div>
          <p style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Sort</p>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[['score','Best Match ⭐'],['price_asc','Cheapest First 🔥'],['price_desc','Priciest First'],['rating','Top Rated ★']].map(([v,l])=>(
              <label key={v} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:sortBy===v?'#8B1A2C':'#2C1810'}}>
                <input type="radio" name="ss" checked={sortBy===v} onChange={()=>setSortBy(v)} style={{accentColor:'#8B1A2C'}}/>{l}
              </label>
            ))}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {sorted.map((p,i)=>(
              <ProductCard key={p.id} product={p} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist}
                isCheapest={p.id===cheapestId} isTop={p.id===topId} delay={i*40}/>
            ))}
          </div>
          {sorted.length===0&&(
            <div style={{textAlign:'center',padding:'80px 0',color:'#7A6B6E'}}>
              <div style={{fontSize:64,marginBottom:16}}>🔍</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:'#2C1810',marginBottom:8}}>No results found</h3>
              <p>Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PRODUCT DETAIL PAGE ─────────────────────────────────────────
const ProductPage = ({ title, nav, wishlist, toggleWishlist, products }) => {
  const variants = products.filter(p=>p.title===title);
  if(!variants.length) return <div style={{marginTop:64,padding:48,textAlign:'center'}}><h2>Product not found</h2></div>;

  const sorted = [...variants].sort((a,b)=>a.price-b.price);
  const cheapest = sorted[0];
  const p = cheapest;
  const disc = discount(p);
  const isW = wishlist.includes(p.id);

  // Related products from same category
  const related = products.filter(x=>x.category===p.category&&x.title!==title).slice(0,4);

  return (
    <div style={{marginTop:64,background:'#FDF8F4',minHeight:'100vh'}}>
      {/* Breadcrumb */}
      <div style={{padding:'20px 48px',fontSize:13,color:'#7A6B6E',display:'flex',gap:8,alignItems:'center'}}>
        <span style={{cursor:'pointer',color:'#8B1A2C'}} onClick={()=>nav('home')}>Home</span>
        <span>›</span>
        <span style={{cursor:'pointer',color:'#8B1A2C'}} onClick={()=>nav('category',{cat:p.category})}>{p.category.charAt(0).toUpperCase()+p.category.slice(1)}</span>
        <span>›</span>
        <span style={{color:'#2C1810',fontWeight:500}}>{p.title.slice(0,40)}…</span>
      </div>

      <div style={{padding:'0 48px 48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'start'}}>
        {/* Image */}
        <div>
          <div style={{background:'#FAF2EC',borderRadius:24,overflow:'hidden',height:420,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <img src={p.image} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.src=IMAGE_PLACEHOLDER;}}/>
          </div>
          <div style={{display:'flex',gap:12}}>
            {sorted.slice(0,3).map(v=>(
              <div key={v.id} style={{flex:1,background:'white',borderRadius:12,padding:8,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.06)',transition:'all .2s',border:'1.5px solid transparent'}}
                onMouseOver={e=>e.currentTarget.style.borderColor='#8B1A2C'} onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}>
                <img src={v.image} alt="" style={{width:'100%',height:64,objectFit:'cover',borderRadius:8}} onError={e=>{e.target.style.display='none';}}/>
                <div style={{fontSize:10,textAlign:'center',marginTop:4,color:'#8B1A2C',fontWeight:600}}>{PLATFORMS[v.platform].name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {variants.map(v=><PBadge key={v.id} platform={v.platform}/>)}
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:'#2C1810',marginBottom:16,lineHeight:1.25}}>
            {p.title}
          </h1>
          <Stars r={p.rating} n={p.reviews}/>
          <div style={{display:'flex',alignItems:'center',gap:16,marginTop:16,marginBottom:24}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:'#8B1A2C'}}>{fmt(cheapest.price)}</span>
            <span style={{fontSize:18,color:'#9A8A8D',textDecoration:'line-through'}}>{fmt(p.orig)}</span>
            {disc>0&&<span style={{background:'#8B1A2C',color:'white',fontSize:13,fontWeight:700,padding:'4px 12px',borderRadius:12}}>{disc}% OFF</span>}
          </div>

          {/* Best Deal Highlight */}
          <div style={{background:'linear-gradient(135deg,#FFF8E7,#FFF3E0)',border:'1.5px solid #F5A623',borderRadius:16,padding:'16px 20px',marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:700,color:'#B45309',marginBottom:4}}>🔥 Best Deal on {PLATFORMS[cheapest.platform].name}</div>
            <div style={{fontSize:13,color:'#7A6B6E'}}>Cheapest option among {variants.length} platforms compared</div>
          </div>

          <div style={{display:'flex',gap:12,marginBottom:28}}>
            <button className="btn-primary" onClick={()=>window.open(cheapest.link,'_blank')}
              style={{flex:1,background:'#8B1A2C',color:'white',border:'none',borderRadius:14,padding:'16px',fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>
              Buy Now on {PLATFORMS[cheapest.platform].name} →
            </button>
            <button className="wishlist-btn" onClick={()=>toggleWishlist(p.id)}
              style={{width:52,height:52,background:isW?'#FFF0F4':'white',border:`1.5px solid ${isW?'#8B1A2C':'#EDE0D4'}`,borderRadius:14,fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {isW?'❤️':'🤍'}
            </button>
          </div>

          {/* Features */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[['⚡','Fast Delivery','Within 2-3 days'],['🔒','Secure Payment','100% safe checkout'],['↩️','Easy Returns','7-day return policy'],['✅','Verified Products','Original & authentic']].map(([ico,t,s])=>(
              <div key={t} style={{background:'white',borderRadius:12,padding:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:20,marginBottom:4}}>{ico}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#2C1810'}}>{t}</div>
                <div style={{fontSize:12,color:'#7A6B6E'}}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Comparison Table */}
      <div style={{padding:'0 48px 48px'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:'#2C1810',marginBottom:24}}>
          Compare Across Platforms
        </h2>
        <div style={{background:'white',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.06)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#8B1A2C',color:'white'}}>
                {['Platform','Price','Original Price','Discount','Rating','Reviews','Action'].map(h=>(
                  <th key={h} style={{padding:'16px 20px',textAlign:'left',fontSize:13,fontWeight:600,letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((v,i)=>{
                const isC = v.id===cheapest.id;
                return (
                  <tr key={v.id} style={{background:isC?'#FFF8E7':i%2===0?'white':'#FDF8F4',borderBottom:'1px solid #EDE0D4'}}>
                    <td style={{padding:'16px 20px'}}><PBadge platform={v.platform}/></td>
                    <td style={{padding:'16px 20px'}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:isC?'#EA580C':'#2C1810'}}>{fmt(v.price)}</span>
                      {isC&&<span style={{marginLeft:8,fontSize:11,fontWeight:700,color:'#EA580C'}}>🔥 Cheapest</span>}
                    </td>
                    <td style={{padding:'16px 20px',color:'#9A8A8D',textDecoration:'line-through',fontSize:14}}>{fmt(v.orig)}</td>
                    <td style={{padding:'16px 20px'}}>
                      <span style={{background:'#F5E6D8',color:'#8B1A2C',fontWeight:700,fontSize:13,padding:'3px 10px',borderRadius:10}}>{discount(v)}%</span>
                    </td>
                    <td style={{padding:'16px 20px'}}><Stars r={v.rating} n={null}/></td>
                    <td style={{padding:'16px 20px',fontSize:13,color:'#7A6B6E'}}>{v.reviews.toLocaleString()}</td>
                    <td style={{padding:'16px 20px'}}>
                      <button className="btn-primary" onClick={()=>window.open(v.link,'_blank')}
                        style={{background:isC?'#8B1A2C':'white',color:isC?'white':'#8B1A2C',border:`1.5px solid #8B1A2C`,borderRadius:10,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                        Buy Here
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Products */}
      {related.length>0&&(
        <div style={{padding:'0 48px 64px'}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:'#2C1810',marginBottom:24}}>You May Also Like</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
            {related.map((rp,i)=>(
              <ProductCard key={rp.id} product={rp} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} delay={i*60}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── WISHLIST PAGE ────────────────────────────────────────────────
const WishlistPage = ({ nav, wishlist, toggleWishlist, products }) => {
  const items = products.filter(p=>wishlist.includes(p.id));
  return (
    <div style={{marginTop:64,padding:'48px',minHeight:'80vh',background:'#FDF8F4'}}>
      <div style={{marginBottom:32}}>
        <p style={{fontSize:12,letterSpacing:3,color:'#8B1A2C',fontWeight:600,textTransform:'uppercase',marginBottom:8}}>My Collection</p>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:700,color:'#2C1810'}}>Wishlist ❤️</h1>
        <p style={{color:'#7A6B6E',marginTop:8}}>{items.length} saved product{items.length!==1?'s':''}</p>
      </div>
      {items.length===0?(
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <div style={{fontSize:80,marginBottom:16}}>🤍</div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:'#2C1810',marginBottom:12}}>Your wishlist is empty</h3>
          <p style={{color:'#7A6B6E',marginBottom:24}}>Save products you love for later</p>
          <button className="btn-primary" onClick={()=>nav('home')}
            style={{background:'#8B1A2C',color:'white',border:'none',borderRadius:14,padding:'14px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
            Start Shopping
          </button>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {items.map((p,i)=><ProductCard key={p.id} product={p} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} delay={i*60}/>)}
        </div>
      )}
    </div>
  );
};

// ─── AUTH PAGES ───────────────────────────────────────────────────
const AuthPage = ({ type, nav }) => {
  const isLogin = type==='login';
  const [form, setForm] = useState({name:'',email:'',password:'',confirm:''});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  
  const handle = () => {
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setDone(true); setTimeout(()=>nav('home'),1500); },1200);
  };

  return (
    <div style={{marginTop:64,minHeight:'calc(100vh - 64px)',background:'linear-gradient(135deg,#FDF8F4 0%,#F5E6D8 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:460,background:'white',borderRadius:24,overflow:'hidden',boxShadow:'0 20px 60px rgba(139,26,44,.15)'}}>
        <div style={{background:'linear-gradient(135deg,#8B1A2C,#6B1422)',padding:'40px 40px 32px',textAlign:'center'}}>
          <div style={{width:56,height:56,background:'rgba(255,255,255,.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>
            {isLogin?'🔓':'✨'}
          </div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:'white',marginBottom:8}}>
            {isLogin?'Welcome Back':'Join ShopSphere'}
          </h2>
          <p style={{color:'rgba(255,255,255,.7)',fontSize:14}}>{isLogin?'Sign in to your account':'Create your free account today'}</p>
        </div>
        <div style={{padding:'36px 40px'}}>
          {done?(
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:'#2C1810',marginBottom:6}}>{isLogin?'Welcome back!':'Account created!'}</h3>
              <p style={{color:'#7A6B6E',fontSize:14}}>Redirecting to home…</p>
            </div>
          ):(
            <>
              {!isLogin&&(
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:6,display:'block'}}>Full Name</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"
                    style={{width:'100%',border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",transition:'border-color .2s',background:'#FDF8F4'}}/>
                </div>
              )}
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:6,display:'block'}}>Email Address</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"
                  style={{width:'100%',border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",transition:'border-color .2s',background:'#FDF8F4'}}/>
              </div>
              <div style={{marginBottom:isLogin?8:16}}>
                <label style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:6,display:'block'}}>Password</label>
                <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"
                  style={{width:'100%',border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",transition:'border-color .2s',background:'#FDF8F4'}}/>
              </div>
              {!isLogin&&(
                <div style={{marginBottom:8}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#2C1810',marginBottom:6,display:'block'}}>Confirm Password</label>
                  <input type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••"
                    style={{width:'100%',border:'1.5px solid #EDE0D4',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:"'DM Sans',sans-serif",transition:'border-color .2s',background:'#FDF8F4'}}/>
                </div>
              )}
              {isLogin&&<div style={{textAlign:'right',marginBottom:20}}><span style={{fontSize:13,color:'#8B1A2C',cursor:'pointer',fontWeight:500}}>Forgot password?</span></div>}
              <button className="btn-primary" onClick={handle} disabled={loading}
                style={{width:'100%',background:loading?'#C4758B':'#8B1A2C',color:'white',border:'none',borderRadius:14,padding:'14px',fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginTop:8,cursor:loading?'wait':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {loading?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> {isLogin?'Signing in…':'Creating account…'}</> : (isLogin?'Sign In →':'Create Account →')}
              </button>
              <p style={{textAlign:'center',fontSize:13,color:'#7A6B6E',marginTop:20}}>
                {isLogin?'New here? ':'Already have an account? '}
                <span style={{color:'#8B1A2C',cursor:'pointer',fontWeight:600}} onClick={()=>nav(isLogin?'signup':'login')}>
                  {isLogin?'Create an account':'Sign in'}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState({ page:'home', params:{} });
  const [wishlist, setWishlist] = useState([]);
  const [navQuery, setNavQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [liveState, setLiveState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let isMounted = true;

    const loadLiveProducts = async () => {
      const dedupeByLink = (items) => {
        const seen = new Set();
        return items.filter((item) => {
          if (!item?.link || seen.has(item.link)) return false;
          seen.add(item.link);
          return true;
        });
      };

      const fetchEndpoint = async (url) => {
        const payload = await requestJson(url);
        if (!payload) return [];
        return Array.isArray(payload?.products) ? payload.products : [];
      };

      const fetchSeedFile = async () => {
        try {
          const res = await fetch('/seed-products.json');
          if (!res.ok) return [];
          const payload = await res.json();
          return Array.isArray(payload) ? payload : [];
        } catch {
          return [];
        }
      };

      try {
        const fromAll = await fetchEndpoint('/api/products/all?limit=1200');

        let liveProducts = fromAll;

        if (liveProducts.length < 12) {
          await requestJson('/api/sync/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 10 }),
          });

          const fromAllAfterSync = await fetchEndpoint('/api/products/all?limit=1200');
          if (fromAllAfterSync.length > liveProducts.length) {
            liveProducts = fromAllAfterSync;
          }
        }

        const seedProducts = await fetchEndpoint('/api/products/discover?query=trending&limit=14');

        if (seedProducts.length > 0) {
          liveProducts = dedupeByLink([liveProducts, seedProducts].flat());
        }

        if (liveProducts.length < 8) {
          await requestJson('/api/sync/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 8 }),
          });

          const discoverAfterSync = await fetchEndpoint('/api/products/discover?query=trending&limit=14');
          if (discoverAfterSync.length > liveProducts.length) {
            liveProducts = discoverAfterSync;
          }

          const extraBuckets = await Promise.all([
            fetchEndpoint('/api/products/search?query=earbuds&limit=6'),
            fetchEndpoint('/api/products/search?query=lipstick&limit=6'),
            fetchEndpoint('/api/products/search?query=jeans&limit=6'),
            fetchEndpoint('/api/products/search?query=handbag&limit=6'),
          ]);

          liveProducts = dedupeByLink([liveProducts, ...extraBuckets].flat());
        }

        if (liveProducts.length === 0) {
          const seeded = await fetchSeedFile();
          liveProducts = dedupeByLink(seeded);
        }

        if (!isMounted) return;

        if (liveProducts.length > 0) {
          setProducts(liveProducts);
          setLiveState({ loading: false, error: '' });
          return;
        }

        setLiveState({ loading: false, error: 'No products returned from API or seed file.' });
      } catch (error) {
        const seeded = await fetchSeedFile();
        if (isMounted && seeded.length > 0) {
          setProducts(dedupeByLink(seeded));
          setLiveState({ loading: false, error: '' });
          return;
        }

        if (isMounted) {
          setLiveState({ loading: false, error: 'Backend unavailable and seed file empty.' });
        }
        console.warn('Live product API unavailable.', error);
      }
    };

    loadLiveProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const nav = useCallback((page, params={}) => {
    setRoute({ page, params });
    window.scrollTo({ top:0, behavior:'smooth' });
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w,id]);
  }, []);

  const { page, params } = route;

  if (liveState.loading) {
    return (
      <>
        <GlobalStyles/>
        <Navbar nav={nav} wishlist={wishlist} query={navQuery} setQuery={setNavQuery}/>
        <main style={{marginTop:64,minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FDF8F4'}}>
          <div style={{textAlign:'center',maxWidth:760,padding:24}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:30,color:'#2C1810'}}>Loading live products...</h2>
            <p style={{marginTop:10,color:'#7A6B6E'}}>Fetching real product images and links from Amazon, Flipkart, Nykaa, and Myntra.</p>
          </div>
        </main>
      </>
    );
  }

  if (!products.length) {
    return (
      <>
        <GlobalStyles/>
        <Navbar nav={nav} wishlist={wishlist} query={navQuery} setQuery={setNavQuery}/>
        <main style={{marginTop:64,minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FDF8F4',padding:24}}>
          <div style={{maxWidth:760,background:'white',border:'1px solid #EDE0D4',borderRadius:16,padding:24}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:30,color:'#2C1810',marginBottom:10}}>Live Data Not Available</h2>
            <p style={{color:'#7A6B6E',lineHeight:1.6,marginBottom:10}}>
              {liveState.error || 'This app is now configured to show only provider-backed products, not mock images.'}
            </p>
            <p style={{color:'#7A6B6E',lineHeight:1.6}}>Run npm run dev and keep both backend and frontend running to load accurate item images and URLs.</p>
          </div>
        </main>
      </>
    );
  }

  const renderPage = () => {
    if(page==='home')       return <HomePage nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
    if(page==='category')   return <CategoryPage cat={params.cat||'beauty'} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
    if(page==='search')     return <SearchPage q={params.q||''} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
    if(page==='product')    return <ProductPage title={params.title||''} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
    if(page==='wishlist')   return <WishlistPage nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
    if(page==='login')      return <AuthPage type="login" nav={nav}/>;
    if(page==='signup')     return <AuthPage type="signup" nav={nav}/>;
    return <HomePage nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products}/>;
  };

  return (
    <>
      <GlobalStyles/>
      <Navbar nav={nav} wishlist={wishlist} query={navQuery} setQuery={setNavQuery}/>
      <main>{renderPage()}</main>
    </>
  );
}

