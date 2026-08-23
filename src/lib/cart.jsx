import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);
const KEY = 'funfable_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        slug: product.slug,
        quantity: qty,
      }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((id) => setItems(prev => prev.filter(i => i.product_id !== id)), []);
  const updateQty = useCallback((id, qty) => setItems(prev => prev.map(i => i.product_id === id ? { ...i, quantity: Math.max(1, qty) } : i)), []);
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, count, subtotal, isOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};