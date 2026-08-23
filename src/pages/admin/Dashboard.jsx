import { db } from '@/api/base44Client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Link } from 'react-router-dom';
import { Package, ShoppingCart, IndianRupee, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function Dashboard() {
  const { data: products } = useQuery({ queryKey: ['allProducts'], queryFn: () => db.entities.Product.list('-created_date', 500) });
  const { data: orders } = useQuery({ queryKey: ['allOrders'], queryFn: () => db.entities.Order.list('-created_date', 500) });
  const revenue = (orders || []).reduce((s, o) => s + (o.total || 0), 0);
  const stats = [
    { label: 'Products', value: (products || []).length, icon: Package },
    { label: 'Orders', value: (orders || []).length, icon: ShoppingCart },
    { label: 'Revenue', value: formatPrice(revenue), icon: IndianRupee },
    { label: 'Active products', value: (products || []).filter(p => p.status === 'active').length, icon: TrendingUp },
  ];
  return (
    <div>
      <h1 className="font-display text-4xl font-medium text-forest mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-card squircle-lg p-6 border border-border">
            <s.icon className="w-5 h-5 text-sage mb-3" />
            <p className="text-3xl font-display font-semibold text-forest">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card squircle-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-medium text-forest">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-forest hover:text-terracotta">View all</Link>
        </div>
        {(orders || []).length === 0 ? <p className="text-muted-foreground text-sm">No orders yet.</p> : (
          <div className="space-y-2">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div><p className="font-medium text-forest text-sm">{o.customer_name || 'Guest'}</p><p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p></div>
                <div className="text-right"><p className="font-medium text-forest text-sm">{formatPrice(o.total)}</p><p className="text-xs text-muted-foreground capitalize">{o.status}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
