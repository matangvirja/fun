import { db } from '@/api/supabaseClient';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCategories } from '@/lib/useSiteData';
import { slugify } from '@/lib/format';
import ImageUploader from '@/components/admin/ImageUploader';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const EMPTY = { 
  name: '', 
  slug: '', 
  tagline: '', 
  description: '', 
  price: '', 
  compare_at_price: '', 
  age_min: 0, 
  age_max: 12, 
  category_id: '', 
  skills: [], 
  featured: false, 
  dominant_color: '#88A494', 
  stock: 10, 
  status: 'active', 
  rating: 5, 
  review_count: 0, 
  images: [] 
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: existing, isLoading } = useQuery({ 
    queryKey: ['product', id], 
    queryFn: () => db.entities.Product.get(id), 
    enabled: !isNew && !!id 
  });
  const [form, setForm] = useState(EMPTY);
  const [skillsText, setSkillsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({ ...EMPTY, ...existing });
      setSkillsText(Array.isArray(existing.skills) ? existing.skills.join(', ') : '');
    }
  }, [existing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      age_min: Number(form.age_min), 
      age_max: Number(form.age_max),
      stock: Number(form.stock), 
      rating: Number(form.rating), 
      review_count: Number(form.review_count),
      slug: form.slug || slugify(form.name),
      category_id: form.category_id || null,
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (isNew) await db.entities.Product.create(payload);
      else await db.entities.Product.update(id, payload);
      qc.invalidateQueries({ queryKey: ['allProducts'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (err) { 
      alert('Failed to save: ' + (err.message || '')); 
      setSaving(false); 
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading product...
      </div>
    );
  }

  return (
    <form onSubmit={save} className="max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="font-display text-4xl font-medium text-forest mb-8">{isNew ? 'New product' : 'Edit product'}</h1>
      <div className="space-y-5 bg-card squircle-lg border border-border p-6">
        <Field label="Name" value={form.name} onChange={v => set('name', v)} required />
        <Field label="Tagline" value={form.tagline} onChange={v => set('tagline', v)} />
        <Area label="Description" value={form.description} onChange={v => set('description', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" type="number" value={form.price} onChange={v => set('price', v)} required />
          <Field label="Compare-at price (₹)" type="number" value={form.compare_at_price || ''} onChange={v => set('compare_at_price', v)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Age min" type="number" value={form.age_min} onChange={v => set('age_min', v)} />
          <Field label="Age max" type="number" value={form.age_max} onChange={v => set('age_max', v)} />
          <Field label="Stock" type="number" value={form.stock} onChange={v => set('stock', v)} />
        </div>
        <label className="block">
          <span className="text-sm text-muted-foreground mb-1.5 block">Category</span>
          <select value={form.category_id || ''} onChange={e => set('category_id', e.target.value)} className="w-full h-12 px-4 squircle-sm bg-paper border border-border outline-none focus:border-forest">
            <option value="">Uncategorised</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <Field label="Skills developed (comma separated)" value={skillsText} onChange={setSkillsText} placeholder="Fine Motor Skills, Logic, Creativity" />
        <Field label="Dominant color (hex)" value={form.dominant_color} onChange={v => set('dominant_color', v)} />
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-muted-foreground mb-1.5 block">Status</span>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full h-12 px-4 squircle-sm bg-paper border border-border outline-none">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label className="flex items-center gap-3 mt-7">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-5 h-5 accent-[hsl(var(--forest))]" />
            <span className="text-sm font-medium text-forest">Featured product</span>
          </label>
        </div>
        <div>
          <span className="text-sm text-muted-foreground mb-1.5 block">Images</span>
          <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
        </div>
      </div>
      <button disabled={saving} className="mt-6 bg-forest text-paper squircle h-12 px-8 flex items-center gap-2 font-medium hover:bg-forest/90 disabled:opacity-50">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save product'}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full h-12 px-4 squircle-sm bg-paper border border-border outline-none focus:border-forest" />
    </label>
  );
}
function Area({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} className="w-full px-4 py-3 squircle-sm bg-paper border border-border outline-none focus:border-forest" />
    </label>
  );
}
