import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '@/lib/useSiteData';
import ProductCard from '@/components/store/ProductCard';
import AgeSlider from '@/components/store/AgeSlider';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const age = params.get('age') ? +params.get('age') : null;
  const category = params.get('category');
  const q = params.get('q') || '';
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ search: q });
  const [sort, setSort] = useState('featured');

  const catId = categories?.find(c => c.slug === category)?.id;
  const filtered = useMemo(() => {
    let list = products || [];
    if (catId) list = list.filter(p => p.category_id === catId);
    if (age != null) list = list.filter(p => p.age_min <= age && p.age_max >= age);
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'featured') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [products, catId, age, sort]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val === null || val === '') next.delete(key); else next.set(key, val);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-2">Discovery Archive</p>
        <h1 className="font-display text-4xl sm:text-6xl font-medium text-forest">
          {category ? categories?.find(c => c.slug === category)?.name : q ? `Results for "${q}"` : 'All toys'}
        </h1>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="space-y-8 h-fit lg:sticky lg:top-24">
          <div>
            <h3 className="font-medium text-forest mb-3">Shop by age</h3>
            <AgeSlider value={age ?? 3} onChange={(v) => setParam('age', v)} />
            {age != null && <button onClick={() => setParam('age', null)} className="text-xs text-terracotta mt-2">Clear age</button>}
          </div>
          <div>
            <h3 className="font-medium text-forest mb-3">Categories</h3>
            <div className="space-y-1">
              <button onClick={() => setParam('category', '')} className={`block w-full text-left py-1.5 text-sm ${!category ? 'text-forest font-medium' : 'text-muted-foreground hover:text-forest'}`}>All</button>
              {categories?.map(c => (
                <button key={c.id} onClick={() => setParam('category', c.slug)} className={`block w-full text-left py-1.5 text-sm ${category === c.slug ? 'text-forest font-medium' : 'text-muted-foreground hover:text-forest'}`}>{c.name}</button>
              ))}
            </div>
          </div>
        </aside>
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{filtered.length} toys</p>
            <select value={sort} onChange={e => setSort(e.target.value)} className="bg-card border border-border squircle-sm h-10 px-3 text-sm outline-none">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] squircle-lg bg-secondary animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No toys match your filters. Try a different age or category.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} featured={p.featured && i < 2} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}