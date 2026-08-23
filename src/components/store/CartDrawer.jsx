import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useSiteSettings } from '@/lib/useSiteData';
import { formatPrice } from '@/lib/format';
import { Image } from '@/components/ui/image';

export default function CartDrawer() {
  const { items, isOpen, closeCart, remove, updateQty, subtotal } = useCart();
  const { data: settings } = useSiteSettings();
  const threshold = settings?.free_shipping_threshold || 1500;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);

  return (
    <>
      <div
        className={`fixed inset-0 bg-forest/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-paper z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 pt-6">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-sage to-terracotta transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            {remaining > 0
              ? <>Add <span className="font-semibold text-forest">{formatPrice(remaining)}</span> for free shipping ✨</>
              : <span className="text-forest font-semibold">You've unlocked free shipping! ✨</span>}
          </p>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">Your Magic Box</h2>
            <button onClick={closeCart} className="w-9 h-9 flex items-center justify-center squircle-sm hover:bg-secondary"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link to="/shop" onClick={closeCart} className="inline-block mt-4 text-forest font-medium underline">Start exploring</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product_id} className="flex gap-4">
                  <div className="w-20 h-24 squircle-sm overflow-hidden bg-secondary flex-shrink-0">
                    <Image src={item.image} alt={item.name} fittingType="fill" className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug || item.product_id}`} onClick={closeCart} className="font-medium text-forest hover:underline truncate block">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border squircle-sm">
                        <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-forest">–</button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-forest">+</button>
                      </div>
                      <button onClick={() => remove(item.product_id)} className="text-muted-foreground hover:text-terracotta"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl font-semibold text-forest">{formatPrice(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className="block w-full bg-forest text-paper squircle h-12 flex items-center justify-center font-medium hover:bg-forest/90 transition">Checkout</Link>
          </div>
        )}
      </aside>
    </>
  );
}