import { motion } from "framer-motion";
import { formatPrice } from "../utils/format";

const platformLogo = {
  Amazon: "https://logo.clearbit.com/amazon.in",
  Flipkart: "https://logo.clearbit.com/flipkart.com",
  Nykaa: "https://logo.clearbit.com/nykaa.com",
  Myntra: "https://logo.clearbit.com/myntra.com",
};

const MotionArticle = motion.article;

export function ProductCard({ product, onWishlist, wished, disabledWishlist }) {
  return (
    <MotionArticle
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">No image</div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-zinc-800">{product.title}</p>
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700">
            <img
              src={platformLogo[product.platform]}
              alt={product.platform}
              className="h-4 w-4 rounded-full"
              loading="lazy"
            />
            <span>{product.platform}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {product.meta?.bestPrice && (
            <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">Best Price</span>
          )}
          {product.meta?.bestRated && (
            <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700">Best Rated</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-zinc-900">{formatPrice(product.price)}</p>
            <p className="text-xs text-zinc-500">Rating: {product.rating ? product.rating.toFixed(1) : "N/A"}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onWishlist(product)}
              disabled={disabledWishlist}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-800 disabled:opacity-50"
            >
              {wished ? "Saved" : "Wishlist"}
            </button>
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Visit
            </a>
          </div>
        </div>
      </div>
    </MotionArticle>
  );
}
