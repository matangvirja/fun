import { db } from '@/api/supabaseClient';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { useCategories } from '@/lib/useSiteData';
import { formatPrice } from '@/lib/format';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ['allProducts'], queryFn: () => db.entities.Product.list('-created_at', 500) });
  const { data: categories } = useCategories();
  const [confirm, setConfirm] = useState(null);
  const catName = (id) => categories?.find(c => c.id === id)?.name || '—';

  const del = async (id) => {
    await db.entities.Product.delete(id);
    setConfirm(null);
    qc.invalidateQueries({ queryKey: ['allProducts'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-medium text-forest">Products</h1>
        <Link to="/admin/products/new" className="bg-forest text-paper squircle h-11 px-5 flex items-center gap-2 font-medium hover:bg-forest/90"><Plus className="w-4 h-4" /> New product</Link>
      </div>
      <div className="bg-card squircle-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {(products || []).map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 squircle-sm overflow-hidden bg-secondary flex-shrink-0">{p.images?.[0] && <Image src={p.images[0]} alt="" fittingType="fill" className="w-full h-full" />}</div>
                    <div><p className="font-medium text-forest text-sm">{p.name}</p><p className="text-xs text-muted-foreground">Ages {p.age_min}–{p.age_max}</p></div>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{catName(p.category_id)}</td>
                <td className="p-4 text-sm font-medium text-forest">{formatPrice(p.price)}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.stock}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 squircle-sm ${p.status === 'active' ? 'bg-sage-soft text-forest' : 'bg-secondary text-muted-foreground'}`}>{p.status}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link to={`/admin/products/${p.id}`} className="w-8 h-8 flex items-center justify-center squircle-sm hover:bg-secondary"><Pencil className="w-4 h-4 text-forest" /></Link>
                    <button onClick={() => setConfirm(p)} className="w-8 h-8 flex items-center justify-center squircle-sm hover:bg-secondary"><Trash2 className="w-4 h-4 text-terracotta" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirm && (
        <div className="fixed inset-0 bg-forest/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-card squircle-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl text-forest mb-2">Delete product?</h3>
            <p className="text-sm text-muted-foreground mb-5">"{confirm.name}" will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 h-11 squircle-sm border border-border font-medium">Cancel</button>
              <button onClick={() => del(confirm.id)} className="flex-1 h-11 squircle-sm bg-terracotta text-white font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
