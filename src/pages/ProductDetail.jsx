import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useProductBySlug, useProducts, useCategories } from '@/lib/useSiteData';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import ProductCard from '@/components/store/ProductCard';
import { Plus, Minus, Check, ArrowLeft, Star, Brain, Hand, Heart, Sparkles } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

const SKILL_ICONS = { 'Fine Motor Skills': Hand, 'Logic': Brain, 'Creativity': Sparkles, 'Empathy': Heart, 'Problem Solving': Brain, 'Social Skills': Heart, 'Gross Motor Skills': Hand, 'Balance': Hand, 'Color Recognition': Sparkles, 'Comfort': Heart, 'Self Expression': Sparkles };

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: products } = useProducts({});
  const { data: categories } = useCategories();
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) return <div className="max-w-7xl mx-auto px-5 py-20"><div className="aspect-[4/3] squircle-lg bg-secondary animate-pulse" /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-5 py-20 text-center"><p className="text-muted-foreground">Toy not found.</p><Link to="/shop" className="text-forest underline mt-2 inline-block">Back to shop</Link></div>;

  const category = categories?.find(c => c.id === product.category_id);
  const related = (products || []).filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
      <PageTitle title={product.name} />
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest mb-6"><ArrowLeft className="w-4 h-4" /> Back to shop</Link>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="squircle-lg overflow-hidden aspect-square bg-secondary">
            <Image src={product.images?.[activeImg] || product.images?.[0]} alt={product.name} fittingType="fill" className="w-full h-full" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 squircle-sm overflow-hidden border-2 ${activeImg === i ? 'border-forest' : 'border-transparent'}`}>
                  <Image src={img} alt="" fittingType="fill" className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {category && <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-2">{category.name}</p>}
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-forest mb-3">{product.name}</h1>
          {product.tagline && <p className="text-lg text-muted-foreground mb-4">{product.tagline}</p>}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 5) ? 'fill-terracotta text-terracotta' : 'text-border'}`} />)}
            </div>
            <span className="text-sm text-muted-foreground">{product.review_count || 0} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl font-semibold text-forest">{formatPrice(product.price)}</span>
            {product.compare_at_price ? <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span> : null}
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {product.skills?.length > 0 && (
            <div className="bg-card squircle-lg p-5 mb-6 border border-border">
              <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-3">Skills developed</p>
              <div className="flex flex-wrap gap-3">
                {product.skills.map(s => {
                  const Icon = SKILL_ICONS[s] || Sparkles;
                  return (
                    <div key={s} className="flex items-center gap-2 bg-sage-soft squircle-sm px-3 py-2">
                      <Icon className="w-4 h-4 text-forest" />
                      <span className="text-sm font-medium text-forest">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Ages {product.age_min}–{product.age_max}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-forest font-medium flex items-center gap-1"><Check className="w-4 h-4" /> {product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-border squircle-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center text-forest"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-11 h-12 flex items-center justify-center text-forest"><Plus className="w-4 h-4" /></button>
            </div>
            <button disabled={product.stock <= 0} onClick={() => { add(product, qty); openCart(); }} className="flex-1 bg-forest text-paper squircle h-12 font-medium hover:bg-forest/90 transition disabled:opacity-50">Add to Magic Box — {formatPrice(product.price * qty)}</button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-medium text-forest mb-8">You may also love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}