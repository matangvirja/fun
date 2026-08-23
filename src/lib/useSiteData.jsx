import { db } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: async () => db.entities.Category.list('order', 100),
});

export const useProducts = (opts = {}) => useQuery({
  queryKey: ['products', opts],
  queryFn: async () => {
    let list = await db.entities.Product.filter({ status: 'active' }, '-created_date', 200);
    if (opts.featured) list = list.filter(p => p.featured);
    if (opts.age != null) list = list.filter(p => p.age_min <= opts.age && p.age_max >= opts.age);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.tagline || '').toLowerCase().includes(q));
    }
    return list;
  },
});

export const useProductBySlug = (slug) => useQuery({
  queryKey: ['product', slug],
  queryFn: async () => {
    const list = await db.entities.Product.filter({ slug }, '-created_date', 1);
    return list[0];
  },
  enabled: !!slug,
});

export const useSiteSettings = () => useQuery({
  queryKey: ['siteSettings'],
  queryFn: async () => {
    const list = await db.entities.SiteSettings.list('-created_date', 1);
    return list[0] || null;
  },
});
