import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { formatPrice } from '@/lib/format';
import { Eye, X, Download } from 'lucide-react';
import { downloadInvoice } from '@/lib/invoice';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({ queryKey: ['allOrders'], queryFn: () => db.entities.Order.list('-created_date', 500) });
  const [view, setView] = useState(null);

  const updateStatus = async (id, status) => {
    await db.entities.Order.update(id, { status });
    qc.invalidateQueries({ queryKey: ['allOrders'] });
    setView(o => (o && o.id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-medium text-forest mb-8">Orders</h1>
      <div className="bg-card squircle-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {(orders || []).map(o => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-4 text-sm text-muted-foreground">#{o.id.slice(0, 8)}</td>
                <td className="p-4"><p className="font-medium text-forest text-sm">{o.customer_name || 'Guest'}</p><p className="text-xs text-muted-foreground">{o.customer_email}</p></td>
                <td className="p-4 font-medium text-forest text-sm">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="bg-paper border border-border squircle-sm h-9 px-2 text-sm outline-none capitalize">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => downloadInvoice(o)} title="Download invoice" className="w-9 h-9 flex items-center justify-center squircle-sm hover:bg-secondary"><Download className="w-4 h-4 text-forest" /></button>
                    <button onClick={() => setView(o)} title="View order" className="w-9 h-9 flex items-center justify-center squircle-sm hover:bg-secondary"><Eye className="w-4 h-4 text-forest" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders || []).length === 0 && <p className="p-8 text-center text-muted-foreground">No orders yet.</p>}
      </div>
      {view && (
        <div className="fixed inset-0 bg-forest/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div className="bg-card squircle-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-display text-xl text-forest">Order #{view.id.slice(0, 8)}</h3><button onClick={() => setView(null)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-1 text-sm mb-4">
              <p><span className="text-muted-foreground">Customer:</span> {view.customer_name}</p>
              <p><span className="text-muted-foreground">Email:</span> {view.customer_email}</p>
              <p><span className="text-muted-foreground">Address:</span> {view.address}, {view.city} {view.zip}</p>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              {view.items?.map((i, idx) => (<div key={idx} className="flex justify-between text-sm"><span>{i.name} × {i.quantity}</span><span className="font-medium">{formatPrice(i.price * i.quantity)}</span></div>))}
            </div>
            <div className="border-t border-border mt-4 pt-3 flex justify-between font-semibold text-forest"><span>Total</span><span>{formatPrice(view.total)}</span></div>
            <button onClick={() => downloadInvoice(view)} className="mt-5 w-full h-11 flex items-center justify-center gap-2 bg-forest text-paper squircle-sm text-sm font-medium hover:bg-forest/90"><Download className="w-4 h-4" /> Download Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
}
