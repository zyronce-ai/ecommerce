'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface WishlistContextValue {
  productIds: string[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue>({
  productIds: [], loading: false, isWishlisted: () => false,
  toggle: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetchWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) { setProductIds([]); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setProductIds(data.map((i: any) => i.productId));
      }
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!fetched.current) { fetched.current = true; fetchWishlist(); }
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productId: string) => productIds.includes(productId), [productIds]);

  const toggle = useCallback(async (productId: string) => {
    const token = getToken();
    if (!token) { toast.error('Please login to use wishlist'); return; }
    try {
      if (productIds.includes(productId)) {
        const res = await fetch(`${API}/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProductIds((prev) => prev.filter((id) => id !== productId));
      } else {
        const res = await fetch(`${API}/api/wishlist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) setProductIds((prev) => [...prev, productId]);
      }
    } catch { }
  }, [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, loading, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
