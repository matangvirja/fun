import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { Plus } from 'lucide-react';

export default function ProductCard({ product, featured }) {
  const { add } = useCart();
  const color = product.dominant_color || '#88A494';
  return (
    <div className={`group relative ${featured ? 'sm:col-span-2' : ''}`}>
      <Link to={`/product/${product.slug || product.id}`} className="block">
        <div
          className="relative overflow-hidden squircle-lg bg-secondary transition-colors duration-500"
          style={{ ['--morph']: color + '22' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = color + '22')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
        >
          <div className={`relative ${featured ? 'aspect-[16/10]' : 'aspect-[4/5]'} overflow-hidden`}>
            <Image src={product.images?.[0]} alt={product.name} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); add(product, 1); }}
              className="w-full bg-forest text-paper squircle-sm h-11 flex items-center justify-center gap-2 font-medium text-sm hover:bg-forest/90"
            >
              <Plus className="w-4 h-4" /> Quick Add
            </button>
          </div>
        </div>
      </Link>
      <div className="mt-4 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-medium text-forest leading-tight">{product.name}</h3>
          <div className="flex items-baseline gap-2 flex-shrink-0">
            {product.compare_at_price ? <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span> : null}
            <span className="font-semibold text-forest">{formatPrice(product.price)}</span>
          </div>
        </div>
        {product.tagline && <p className="text-sm text-muted-foreground mt-1">{product.tagline}</p>}
        <div className="text-xs text-sage mt-2 font-medium">Ages {product.age_min}–{product.age_max}</div>
      </div>
    </div>
  );
}