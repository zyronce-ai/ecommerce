'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  _product?: { name: string; price: number; images: string[] };
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  count: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [], loading: false, count: 0,
  addToCart: async () => {}, updateQuantity: async () => {}, removeFromCart: async () => {}, clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) { setItems([]); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const cartItems = await res.json() as CartItem[];
        const productIds = [...new Set(cartItems.map((i: CartItem) => i.productId))];
        let productMap: Record<string, any> = {};
        if (productIds.length > 0) {
          try { const all = await fetch(`${API}/api/products`).then(r => r.json()); productMap = Object.fromEntries(all.filter((p: any) => productIds.includes(p._id)).map((p: any) => [p._id, { name: p.name, price: p.price, images: p.images || [] }])); } catch {}
        }
        setItems(cartItems.map((i: CartItem) => ({ ...i, _product: productMap[i.productId] })));
      } else setItems([]);
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!fetched.current) { fetched.current = true; fetchCart(); }
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const token = getToken();
    if (!token) { toast.error('Please login to add items to cart'); return; }
    try {
      const res = await fetch(`${API}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchCart();
      toast.success('Added to cart');
    } catch (err: any) { toast.error(err.message); }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const token = getToken();
    if (!token) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    try {
      await fetch(`${API}/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQty }),
      });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
    } catch { }
  }, [items]);

  const removeFromCart = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API}/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, loading, count: items.length, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
