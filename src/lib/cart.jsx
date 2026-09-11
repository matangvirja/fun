import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);
const KEY = 'funfable_cart';

/**
 * Validate a parsed cart item so corrupted localStorage data can't break totals.
 * Returns true only for well-formed cart items.
 */
const isValidCartItem = (item) =>
  item &&
  typeof item === 'object' &&
  typeof item.product_id === 'string' &&
  item.product_id.length > 0 &&
  typeof item.name === 'string' &&
  typeof item.price === 'number' &&
  !Number.isNaN(item.price) &&
  item.price >= 0 &&
  typeof item.quantity === 'number' &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0;

/**
 * Safely parse cart from localStorage, filtering out any corrupted entries.
 */
const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    // JSON.parse failed — reset to empty cart
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCartFromStorage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // localStorage might be full or blocked — silently ignore
    }
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
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
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * i.quantity, 0);

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