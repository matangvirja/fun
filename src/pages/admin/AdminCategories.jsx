import { db } from '@/api/supabaseClient';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { slugify } from '@/lib/format';
import { Trash2, Pencil } from 'lucide-react';
import { Image } from '@/components/ui/image';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminCategories() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => db.entities.Category.list('order', 100) });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', age_min: 0, age_max: 12, order: 0 });

  const reset = () => { setEditing(null); setForm({ name: '', slug: '', description: '', image: '', age_min: 0, age_max: 12, order: 0 }); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, slug: (form.slug && form.slug.trim()) ? slugify(form.slug) : slugify(form.name), age_min: Number(form.age_min) || 0, age_max: Number(form.age_max) || 12, order: Number(form.order) || 0 };
      if (editing) {
        await db.entities.Category.update(editing, payload);
        toast({ title: 'Category updated', description: `"${payload.name}" updated successfully.` });
      } else {
        await db.entities.Category.create(payload);
        toast({ title: 'Category created', description: `"${payload.name}" added to the store.` });
      }
      reset();
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['allProducts'] });
    } catch (err) {
      toast({ title: 'Failed to save category', description: err.message || 'Error occurred.', variant: 'destructive' });
    }
  };

  const edit = (c) => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '', age_min: c.age_min || 0, age_max: c.age_max || 12, order: c.order || 0 }); };

  const del = async (id) => { 
    try {
      await db.entities.Category.delete(id); 
      qc.invalidateQueries({ queryKey: ['categories'] }); 
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['allProducts'] });
      toast({ title: 'Category deleted', description: 'Category removed successfully.' });
    } catch (err) {
      toast({ title: 'Failed to delete category', description: err.message || 'Error occurred.', variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-medium text-forest mb-8">Categories</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {(categories || []).map(c => (
            <div key={c.id} className="bg-card squircle-lg border border-border p-4 flex items-center gap-4">
              <div className="w-16 h-16 squircle-sm overflow-hidden bg-secondary flex-shrink-0">{c.image && <Image src={c.image} alt="" fittingType="fill" className="w-full h-full" />}</div>
              <div className="flex-1"><p className="font-medium text-forest">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug} · Ages {c.age_min}–{c.age_max}</p></div>
              <button onClick={() => edit(c)} className="w-9 h-9 flex items-center justify-center squircle-sm hover:bg-secondary"><Pencil className="w-4 h-4 text-forest" /></button>
              <button onClick={() => del(c.id)} className="w-9 h-9 flex items-center justify-center squircle-sm hover:bg-secondary"><Trash2 className="w-4 h-4 text-terracotta" /></button>
            </div>
          ))}
          {(categories || []).length === 0 && <p className="text-muted-foreground">No categories yet.</p>}
        </div>
        <form onSubmit={save} className="bg-card squircle-lg border border-border p-5 space-y-4 h-fit">
          <h2 className="font-display text-xl text-forest">{editing ? 'Edit category' : 'New category'}</h2>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="w-full h-11 px-3 squircle-sm bg-paper border border-border outline-none" />
          <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="slug (auto)" className="w-full h-11 px-3 squircle-sm bg-paper border border-border outline-none" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 squircle-sm bg-paper border border-border outline-none" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={form.age_min} onChange={e => setForm({ ...form, age_min: e.target.value })} placeholder="Min age" className="w-full h-11 px-3 squircle-sm bg-paper border border-border outline-none" />
            <input type="number" value={form.age_max} onChange={e => setForm({ ...form, age_max: e.target.value })} placeholder="Max age" className="w-full h-11 px-3 squircle-sm bg-paper border border-border outline-none" />
            <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="Order" className="w-full h-11 px-3 squircle-sm bg-paper border border-border outline-none" />
          </div>
          <ImageUploader images={form.image ? [form.image] : []} onChange={imgs => setForm({ ...form, image: imgs[0] || '' })} />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 h-11 squircle-sm bg-forest text-paper font-medium">{editing ? 'Update' : 'Create'}</button>
            {editing && <button type="button" onClick={reset} className="h-11 px-4 squircle-sm border border-border">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
