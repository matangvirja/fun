import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useSiteSettings, useProducts, useCategories } from '@/lib/useSiteData';
import ProductCard from '@/components/store/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, Truck } from 'lucide-react';

export default function Home() {
  const { data: settings } = useSiteSettings();
  const { data: products } = useProducts({ featured: true });
  const { data: categories } = useCategories();
  const heroRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-16 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 z-10">
            <div className="inline-flex items-center gap-2 bg-sage-soft text-forest squircle-sm px-3 py-1.5 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" /> {settings?.hero_theme || 'The Summer of Building'}
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-medium text-forest leading-[0.95] tracking-tight text-balance">
              {settings?.hero_title || 'Toys that tell stories.'}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">{settings?.hero_subtitle || 'Thoughtfully made playthings for ages 0–12 — crafted to spark the next great adventure.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="bg-forest text-paper squircle h-14 px-7 flex items-center gap-2 font-medium hover:bg-forest/90 transition">{settings?.hero_cta_text || 'Explore the collection'} <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/shop?age=3" className="border border-border squircle h-14 px-7 flex items-center font-medium text-forest hover:bg-secondary transition">Shop by age</Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div ref={heroRef} className="relative transition-transform duration-300 ease-out">
              <div className="absolute -inset-8 bg-gradient-to-br from-sage/40 to-terracotta/30 blur-3xl rounded-full" />
              <div className="relative squircle-lg overflow-hidden aspect-[4/3] shadow-2xl">
                <Image src={settings?.hero_image} alt="FunFable hero" fittingType="fill" className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Leaf, label: 'Sustainably sourced' },
            { icon: ShieldCheck, label: 'Non-toxic & safe' },
            { icon: Truck, label: 'Free shipping over ₹1,500' },
            { icon: Sparkles, label: 'Curated by play experts' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <f.icon className="w-5 h-5 text-sage flex-shrink-0" />
              <span className="text-sm text-forest/80 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {categories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-forest">Explore by category</h2>
            <Link to="/shop" className="text-sm font-medium text-forest hover:text-terracotta flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 4).map(c => (
              <Link key={c.id} to={`/shop?category=${c.slug}`} className="group">
                <div className="relative squircle-lg overflow-hidden aspect-square bg-secondary">
                  <Image src={c.image} alt={c.name} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="font-display text-xl font-medium text-paper">{c.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-2">Curated Wonder</p>
          <h2 className="font-display text-3xl sm:text-5xl font-medium text-forest">This season's favourites</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {products?.slice(0, 5).map((p, i) => (
            <ProductCard key={p.id} product={p} featured={i === 0} />
          ))}
        </div>
      </section>

      <section id="story" className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="squircle-lg overflow-hidden aspect-[4/3] bg-secondary">
            <Image src={settings?.story_image} alt="Our story" fittingType="fill" className="w-full h-full" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-3">Our story</p>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-forest mb-5 text-balance">{settings?.story_title || 'Play is the first language.'}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{settings?.story_body || "FunFable began with a simple belief: the best toys don't entertain a child, they invite them to invent. Every piece in our collection is chosen for its craft, its materials, and the open-ended stories it makes possible."}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-6 font-medium text-forest hover:text-terracotta">Discover our makers <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      <section id="guarantee" className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="bg-forest text-paper squircle-lg p-10 sm:p-16 grain text-center">
          <ShieldCheck className="w-10 h-10 text-terracotta mx-auto mb-5" />
          <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4 text-balance">The FunFable Guarantee</h2>
          <p className="text-paper/70 max-w-xl mx-auto leading-relaxed">{settings?.guarantee_text || "If a toy doesn't spark joy within 30 days, return it for a full refund — no questions, no fuss. Play should feel good from the very first moment."}</p>
        </div>
      </section>
    </div>
  );
}