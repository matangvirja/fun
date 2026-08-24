import { useEffect } from 'react';
import { db, supabase, isSupabaseConfigured } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: async () => db.entities.Category.list('order', 100),
});

export const useProducts = (opts = {}) => useQuery({
  queryKey: ['products', opts],
  queryFn: async () => {
    let list = await db.entities.Product.filter({ status: 'active' }, '-created_at', 200);
    if (opts.featured) list = list.filter(p => p.featured);
    if (opts.age != null) list = list.filter(p => p.age_min <= opts.age && p.age_max >= opts.age);
    if (opts.category_id) list = list.filter(p => p.category_id === opts.category_id);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.tagline || '').toLowerCase().includes(q));
    }
    return list;
  },
});

export const useProductBySlug = (slugOrId) => useQuery({
  queryKey: ['product', slugOrId],
  queryFn: async () => {
    if (!slugOrId) return null;
    let list = await db.entities.Product.filter({ slug: slugOrId }, '-created_at', 1);
    if (list && list.length > 0) return list[0];
    
    // Fallback: try by direct ID
    try {
      const item = await db.entities.Product.get(slugOrId);
      if (item) return item;
    } catch {}

    // Fallback: search in list
    const all = await db.entities.Product.list('-created_at', 500);
    return all.find(p => p.slug === slugOrId || p.id === slugOrId) || null;
  },
  enabled: !!slugOrId,
});

export const useSiteSettings = () => useQuery({
  queryKey: ['siteSettings'],
  queryFn: async () => {
    const list = await db.entities.SiteSettings.list('-created_at', 1);
    return list[0] || null;
  },
});

/**
 * Hook to automatically synchronize and invalidate TanStack Query cache
 * upon local database mutations or Supabase Realtime postgres events.
 */
export const useRealtimeSync = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const invalidate = (tableName) => {
      if (!tableName || tableName === 'products') {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['allProducts'] });
        qc.invalidateQueries({ queryKey: ['product'] });
      }
      if (!tableName || tableName === 'categories') {
        qc.invalidateQueries({ queryKey: ['categories'] });
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['allProducts'] });
      }
      if (!tableName || tableName === 'site_settings') {
        qc.invalidateQueries({ queryKey: ['siteSettings'] });
      }
      if (!tableName || tableName === 'orders') {
        qc.invalidateQueries({ queryKey: ['allOrders'] });
        qc.invalidateQueries({ queryKey: ['orders'] });
      }
    };

    // 1. Local event listener (same tab/window)
    const handleLocalDbChange = (e) => {
      const tableName = e.detail?.tableName;
      invalidate(tableName);
    };
    window.addEventListener('funfable_db_change', handleLocalDbChange);

    // 2. Storage event listener (other tabs/windows)
    const handleStorage = (e) => {
      if (e.key && e.key.startsWith('funfable_store_')) {
        const table = e.key.replace('funfable_store_', '');
        invalidate(table);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Supabase Realtime channel subscription (if Supabase is configured)
    let channel;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('funfable_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          invalidate(payload.table);
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('funfable_db_change', handleLocalDbChange);
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [qc]);
};

