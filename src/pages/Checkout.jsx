import { db } from '@/api/supabaseClient';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/lib/cart';
import { useSiteSettings } from '@/lib/useSiteData';
import { useAuth } from '@/lib/AuthContext';

import { formatPrice } from '@/lib/format';
import { Image } from '@/components/ui/image';
import { Lock } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

export default function Checkout() {
  const qc = useQueryClient();
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useSiteSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: user?.user_metadata?.full_name || '',
    customer_email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const threshold = settings?.free_shipping_threshold || 1500;
  const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderError(null);
    try {
      const order = await db.entities.Order.create({
        created_by_id: user?.id || null,
        items: items.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, slug: i.slug })),
        subtotal,
        shipping,
        total,
        ...form,
        status: 'pending',
      });
      clear();
      qc.invalidateQueries({ queryKey: ['allOrders'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      try { await db.functions.invoke('syncOrderToSheet', { order }); } catch (e) { /* best effort */ }
      navigate(`/order/${order.id}`);
    } catch (err) {
      console.error('Order error:', err);
      setOrderError(err.message || 'Something went wrong placing your order. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-forest mb-3">Your Magic Box is empty</h1>
        <Link to="/shop" className="text-forest underline">Browse toys</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid lg:grid-cols-2 gap-12">
      <PageTitle title="Checkout" />
      <form onSubmit={submit} className="space-y-6">
        <h1 className="font-display text-4xl font-medium text-forest">Checkout</h1>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" value={form.customer_name} onChange={v => setForm({ ...form, customer_name: v })} required className="col-span-2" />
          <Field label="Email" type="email" value={form.customer_email} onChange={v => setForm({ ...form, customer_email: v })} required className="col-span-2" />
          <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} required className="col-span-2" />
          <Field label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} required />
          <Field label="ZIP" value={form.zip} onChange={v => setForm({ ...form, zip: v })} required />
        </div>
        {orderError && (
          <div className="p-4 squircle-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {orderError}
          </div>
        )}
        <button disabled={loading} className="w-full bg-forest text-paper squircle h-14 font-medium hover:bg-forest/90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> {loading ? 'Placing order…' : `Place order — ${formatPrice(total)}`}
        </button>
      </form>
      <div className="bg-card squircle-lg p-6 border border-border h-fit">
        <h2 className="font-display text-2xl font-medium text-forest mb-4">Order summary</h2>
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.product_id} className="flex gap-3">
              <div className="w-16 h-20 squircle-sm overflow-hidden bg-secondary flex-shrink-0">
                <Image src={i.image} alt={i.name} fittingType="fill" className="w-full h-full" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-forest text-sm">{i.name}</p>
                <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
              </div>
              <span className="font-medium text-forest text-sm">{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-5 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
          <div className="flex justify-between font-semibold text-forest text-lg pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full h-12 px-4 squircle-sm bg-card border border-border outline-none focus:border-forest" />
    </label>
  );
}
