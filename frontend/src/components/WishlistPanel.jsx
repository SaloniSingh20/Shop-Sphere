import { useEffect, useState } from "react";
import { fetchWishlist, removeWishlist } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../utils/format";

export function WishlistPanel() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchWishlist()
      .then((data) => setItems(data.wishlist || []))
      .catch(() => setItems([]));
  }, [isAuthenticated]);

  const visibleItems = isAuthenticated ? items : [];

  const removeItem = async (url) => {
    const data = await removeWishlist(url);
    setItems(data.wishlist || []);
  };

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h3 className="text-base font-bold text-zinc-800">Wishlist</h3>
      {!isAuthenticated && <p className="mt-2 text-sm text-zinc-500">Log in to use wishlist.</p>}
      {isAuthenticated && visibleItems.length === 0 && <p className="mt-2 text-sm text-zinc-500">No products saved yet.</p>}
      <ul className="mt-3 space-y-2">
        {visibleItems.slice(0, 8).map((item) => (
          <li key={item.product_url} className="rounded-lg border border-zinc-200 p-2 text-sm">
            <p className="line-clamp-1 font-semibold text-zinc-800">{item.title}</p>
            <p className="text-zinc-500">{item.platform} • {formatPrice(item.price)}</p>
            <button
              onClick={() => removeItem(item.product_url)}
              className="mt-1 text-xs font-semibold text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
