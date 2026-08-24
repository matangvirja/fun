import { db } from '@/api/supabaseClient';
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import ImageUploader from '@/components/admin/ImageUploader';
import { Save, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: settings } = useQuery({ 
    queryKey: ['siteSettings'], 
    queryFn: async () => { 
      const l = await db.entities.SiteSettings.list('-created_at', 1); 
      return l[0]; 
    } 
  });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { 
    if (settings && !form) setForm(settings); 
  }, [settings, form]);

  if (!form) return <div className="text-muted-foreground py-8">Loading site settings…</div>;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      if (settings?.id) {
        await db.entities.SiteSettings.update(settings.id, form);
      } else {
        await db.entities.SiteSettings.create(form);
      }
      qc.invalidateQueries({ queryKey: ['siteSettings'] });
      setSaving(false);
      toast({
        title: 'Settings saved!',
        description: 'Changes will immediately reflect across all storefront pages.',
      });
    } catch (err) { 
      toast({
        title: 'Failed to save settings',
        description: err.message || 'Unknown error occurred.',
        variant: 'destructive',
      });
      setSaving(false); 
    }
  };

  const handleResetData = () => {
    if (db.resetLocalDemoData) {
      db.resetLocalDemoData();
      qc.invalidateQueries();
      setForm(null);
      setConfirmReset(false);
      toast({
        title: 'Demo data restored',
        description: 'All default products, categories, and settings have been reset.',
      });
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl pb-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-medium text-forest">Site settings</h1>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="text-xs text-muted-foreground hover:text-terracotta border border-border squircle-sm px-3 py-2 flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Starter Demo Data
        </button>
      </div>

      {confirmReset && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 squircle-lg p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Reset all data to defaults?</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">This will reset all products, categories, settings, and orders in local demo storage.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setConfirmReset(false)} className="text-xs px-3 py-1.5 border border-border squircle-sm bg-card">Cancel</button>
            <button type="button" onClick={handleResetData} className="text-xs px-3 py-1.5 bg-terracotta text-white squircle-sm font-medium">Confirm Reset</button>
          </div>
        </div>
      )}

      <Section title="Announcement bar">
        <Field label="Announcement text" value={form.announcement || ''} onChange={v => set('announcement', v)} placeholder="Free shipping over ₹1,500 ✨" />
      </Section>
      <Section title="Home hero">
        <Field label="Hero title" value={form.hero_title || ''} onChange={v => set('hero_title', v)} />
        <Area label="Hero subtitle" value={form.hero_subtitle || ''} onChange={v => set('hero_subtitle', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Theme badge" value={form.hero_theme || ''} onChange={v => set('hero_theme', v)} />
          <Field label="CTA text" value={form.hero_cta_text || ''} onChange={v => set('hero_cta_text', v)} />
        </div>
        <div>
          <span className="text-sm text-muted-foreground mb-1.5 block">Hero image</span>
          <ImageUploader images={form.hero_image ? [form.hero_image] : []} onChange={imgs => set('hero_image', imgs[0] || '')} />
        </div>
      </Section>
      <Section title="Story section">
        <Field label="Story title" value={form.story_title || ''} onChange={v => set('story_title', v)} />
        <Area label="Story body" value={form.story_body || ''} onChange={v => set('story_body', v)} />
        <div>
          <span className="text-sm text-muted-foreground mb-1.5 block">Story image</span>
          <ImageUploader images={form.story_image ? [form.story_image] : []} onChange={imgs => set('story_image', imgs[0] || '')} />
        </div>
      </Section>
      <Section title="Commerce">
        <Field label="Free shipping threshold (₹)" type="number" value={form.free_shipping_threshold || ''} onChange={v => set('free_shipping_threshold', Number(v))} />
      </Section>
      <Section title="Google Sheets sync">
        <Field label="Spreadsheet ID" value={form.google_sheet_id || ''} onChange={v => set('google_sheet_id', v)} placeholder="1AbC... (from the sheet URL between /d/ and /edit)" />
        <Field label="Tab name" value={form.google_sheet_tab || ''} onChange={v => set('google_sheet_tab', v)} placeholder="Orders (defaults to 'Orders')" />
      </Section>
      <Section title="Footer & guarantee">
        <Area label="Guarantee text" value={form.guarantee_text || ''} onChange={v => set('guarantee_text', v)} />
        <Field label="Footer tagline" value={form.footer_tagline || ''} onChange={v => set('footer_tagline', v)} />
      </Section>
      <button disabled={saving} className="mt-6 bg-forest text-paper squircle h-12 px-8 flex items-center gap-2 font-medium hover:bg-forest/90 disabled:opacity-50 transition">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}

function Section({ title, children }) { 
  return (
    <div className="bg-card squircle-lg border border-border p-6 mb-5 space-y-4">
      <h2 className="font-display text-xl text-forest">{title}</h2>
      {children}
    </div>
  ); 
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) { 
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-12 px-4 squircle-sm bg-paper border border-border outline-none focus:border-forest" />
    </label>
  ); 
}

function Area({ label, value, onChange }) { 
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-4 py-3 squircle-sm bg-paper border border-border outline-none focus:border-forest" />
    </label>
  ); 
}
