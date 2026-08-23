import { db } from '@/api/supabaseClient';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order } = useQuery({ 
    queryKey: ['order', id], 
    queryFn: () => db.entities.Order.get(id), 
    enabled: !!id 
  });

  return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <CheckCircle2 className="w-16 h-16 text-sage mx-auto mb-6" />
      <h1 className="font-display text-4xl sm:text-5xl font-medium text-forest mb-3">Thank you!</h1>
      <p className="text-muted-foreground mb-2">Your order has been placed successfully.</p>
      {order && <p className="text-sm text-muted-foreground">Order #{order.id?.slice(0, 8)} · {formatPrice(order.total)}</p>}
      <Link to="/shop" className="inline-flex items-center mt-8 bg-forest text-paper squircle h-12 px-8 font-medium hover:bg-forest/90">Continue shopping</Link>
    </div>
  );
}
