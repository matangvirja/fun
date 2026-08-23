import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Fallback initial data in case Supabase is not connected yet
const FALLBACK_CATEGORIES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Wooden Toys',
    slug: 'wooden-toys',
    description: 'Classic handcrafted timber toys built to last generations.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    age_min: 1,
    age_max: 6,
    order: 1,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Building & STEM',
    slug: 'building-stem',
    description: 'Engineering kits and architectural blocks to stretch growing minds.',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    age_min: 4,
    age_max: 12,
    order: 2,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Imaginative Play',
    slug: 'imaginative-play',
    description: 'Costumes, puppets, and miniature worlds for boundless storytelling.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
    age_min: 2,
    age_max: 8,
    order: 3,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Arts & Crafts',
    slug: 'arts-crafts',
    description: 'Non-toxic paints, clay, and maker kits for tactile creativity.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    age_min: 3,
    age_max: 10,
    order: 4,
  }
];

const FALLBACK_PRODUCTS = [
  {
    id: 'p1',
    name: "Architect's Wooden Balance Blocks",
    slug: 'architects-wooden-balance-blocks',
    tagline: '36-piece organic hardwood stacking stones',
    description: 'Sculpted from sustainably harvested beechwood, each multi-faceted block challenges spatial awareness and balance. Finished in plant-based, non-toxic oils.',
    price: 1499,
    compare_at_price: 1899,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
    ],
    age_min: 2,
    age_max: 8,
    category_id: '11111111-1111-1111-1111-111111111111',
    skills: ['Fine Motor Skills', 'Spatial Awareness', 'Creativity'],
    featured: true,
    dominant_color: '#D4A373',
    stock: 25,
    status: 'active',
    rating: 5,
    review_count: 18,
  },
  {
    id: 'p2',
    name: 'Solar Rover Explorer Kit',
    slug: 'solar-rover-explorer-kit',
    tagline: 'All-terrain STEM robotics crawler',
    description: 'A hands-on introduction to solar energy and gear mechanics. Children build their own working planetary rover that moves in sunlight without batteries.',
    price: 2199,
    compare_at_price: 2699,
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
    ],
    age_min: 6,
    age_max: 12,
    category_id: '22222222-2222-2222-2222-222222222222',
    skills: ['Engineering', 'Problem Solving', 'Green Energy'],
    featured: true,
    dominant_color: '#2A9D8F',
    stock: 15,
    status: 'active',
    rating: 4.9,
    review_count: 12,
  },
  {
    id: 'p3',
    name: 'Enchanted Forest Puppet Playhouse',
    slug: 'enchanted-forest-puppet-playhouse',
    tagline: 'Foldable organic cotton stage with 4 animal puppets',
    description: 'Step into woodland tales with handmade cotton puppets and a pop-up reversible stage. Great for developing emotional empathy and language skills.',
    price: 1899,
    compare_at_price: 2299,
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80'
    ],
    age_min: 3,
    age_max: 7,
    category_id: '33333333-3333-3333-3333-333333333333',
    skills: ['Storytelling', 'Emotional Empathy', 'Language'],
    featured: true,
    dominant_color: '#E76F51',
    stock: 10,
    status: 'active',
    rating: 5,
    review_count: 9,
  },
  {
    id: 'p4',
    name: 'Botanical Plant Dye Painting Set',
    slug: 'botanical-plant-dye-painting-set',
    tagline: 'Natural earth pigments & handmade brushes',
    description: 'Created from petals, turmeric, spirulina, and berries. Safe, aromatic, and comes with textured watercolor paper and bamboo brushes.',
    price: 1199,
    compare_at_price: 1499,
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'
    ],
    age_min: 4,
    age_max: 10,
    category_id: '44444444-4444-4444-4444-444444444444',
    skills: ['Sensory Exploration', 'Color Mixing', 'Artistry'],
    featured: false,
    dominant_color: '#F4A261',
    stock: 30,
    status: 'active',
    rating: 4.8,
    review_count: 14,
  }
];

const FALLBACK_SITE_SETTINGS = {
  id: 'default-settings',
  hero_title: 'Toys that tell stories.',
  hero_subtitle: 'Thoughtfully made playthings for ages 0–12 — crafted to spark the next great adventure.',
  hero_theme: 'The Summer of Building',
  hero_image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
  hero_cta_text: 'Explore the collection',
  announcement: 'Free shipping on orders over ₹1,500 ✨',
  free_shipping_threshold: 1500,
  story_title: 'Play is the first language.',
  story_body: "FunFable began with a simple belief: the best toys don't entertain a child, they invite them to invent. Every piece in our collection is chosen for its craft, its materials, and the open-ended stories it makes possible.",
  story_image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  guarantee_text: "If a toy doesn't spark joy within 30 days, return it for a full refund — no questions, no fuss. Play should feel good from the very first moment.",
  footer_tagline: 'Thoughtful toys for curious minds.',
  google_sheet_id: '',
  google_sheet_tab: 'Orders',
};

// Create the Supabase client instance (or empty fallback)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

// Helper to parse sort order: e.g. '-created_at' => { column: 'created_at', ascending: false }
const parseSort = (orderBy = '-created_at') => {
  if (!orderBy) return { column: 'created_at', ascending: false };
  let col = orderBy;
  let ascending = true;
  if (col.startsWith('-')) {
    ascending = false;
    col = col.substring(1);
  }
  if (col === 'created_date') col = 'created_at';
  return { column: col, ascending };
};

// Generic table adapter
const createEntityAdapter = (tableName, fallbackData = []) => {
  return {
    async list(orderBy = '-created_at', limit = 100) {
      if (!isSupabaseConfigured) {
        return fallbackData;
      }
      try {
        const { column, ascending } = parseSort(orderBy);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order(column, { ascending })
          .limit(limit);

        if (error) {
          console.warn(`[Supabase] Error listing ${tableName}:`, error.message);
          return fallbackData;
        }
        return data || [];
      } catch (e) {
        console.warn(`[Supabase] Fallback on ${tableName} list:`, e);
        return fallbackData;
      }
    },

    async filter(where = {}, orderBy = '-created_at', limit = 100) {
      if (!isSupabaseConfigured) {
        let res = [...fallbackData];
        Object.entries(where).forEach(([k, v]) => {
          res = res.filter(item => item[k] === v);
        });
        return res;
      }
      try {
        const { column, ascending } = parseSort(orderBy);
        let query = supabase.from(tableName).select('*');
        
        Object.entries(where).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            query = query.eq(key, val);
          }
        });

        const { data, error } = await query.order(column, { ascending }).limit(limit);
        if (error) {
          console.warn(`[Supabase] Error filtering ${tableName}:`, error.message);
          return fallbackData.filter(item => {
            return Object.entries(where).every(([k, v]) => item[k] === v);
          });
        }
        return data || [];
      } catch (e) {
        console.warn(`[Supabase] Fallback on ${tableName} filter:`, e);
        return [];
      }
    },

    async get(id) {
      if (!isSupabaseConfigured) {
        return fallbackData.find(item => item.id === id) || null;
      }
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },

    async create(payload) {
      if (!isSupabaseConfigured) {
        const newItem = { id: 'temp-' + Date.now(), ...payload, created_at: new Date().toISOString() };
        fallbackData.push(newItem);
        return newItem;
      }
      const { data, error } = await supabase
        .from(tableName)
        .insert([payload])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },

    async update(id, payload) {
      if (!isSupabaseConfigured) {
        const index = fallbackData.findIndex(item => item.id === id);
        if (index !== -1) {
          fallbackData[index] = { ...fallbackData[index], ...payload };
          return fallbackData[index];
        }
        return { id, ...payload };
      }
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },

    async delete(id) {
      if (!isSupabaseConfigured) {
        const idx = fallbackData.findIndex(item => item.id === id);
        if (idx !== -1) fallbackData.splice(idx, 1);
        return { success: true };
      }
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  };
};

export const entities = {
  Category: createEntityAdapter('categories', FALLBACK_CATEGORIES),
  Product: createEntityAdapter('products', FALLBACK_PRODUCTS),
  Order: createEntityAdapter('orders', []),
  SiteSettings: createEntityAdapter('site_settings', [FALLBACK_SITE_SETTINGS]),
};

// Supabase Auth Adapter
export const auth = {
  async me() {
    if (!isSupabaseConfigured) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch user role from profiles table
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      return {
        ...user,
        role: profile?.role || user.user_metadata?.role || 'user'
      };
    } catch {
      return {
        ...user,
        role: user.user_metadata?.role || 'user'
      };
    }
  },

  async loginViaEmailPassword(email, password) {
    if (!isSupabaseConfigured) {
      throw new Error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async register({ email, password }) {
    if (!isSupabaseConfigured) {
      throw new Error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async loginWithProvider(provider = 'google', returnTo = '/') {
    if (!isSupabaseConfigured) {
      throw new Error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    }
    const redirectTo = `${window.location.origin}${returnTo && returnTo !== '/' ? returnTo : ''}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      }
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async resetPasswordRequest(email) {
    if (!isSupabaseConfigured) return;
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
  },

  async resetPassword({ newPassword }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return data;
  },

  async logout(redirectUrl) {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(returnTo = window.location.pathname) {
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  }
};

// Storage & Integrations Adapter
export const integrations = {
  Core: {
    async UploadFile({ file }) {
      if (!isSupabaseConfigured) {
        // Fallback: create a local object URL for preview
        return { file_url: URL.createObjectURL(file) };
      }
      try {
        const fileExt = file.name.split('.').pop();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `${Date.now()}-${cleanFileName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.warn('[Supabase Storage upload error]:', uploadError.message);
          return { file_url: URL.createObjectURL(file) };
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return { file_url: data.publicUrl };
      } catch (e) {
        console.warn('[Supabase Storage upload fallback]:', e);
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};

// Functions Adapter
export const functions = {
  async invoke(functionName, payload = {}) {
    if (functionName === 'sendContactInquiry') {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('contact_inquiries').insert([{
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message
        }]);
        if (error) throw new Error(error.message);
      }
      return { success: true };
    }

    if (functionName === 'syncOrderToSheet') {
      // Order is already saved in Supabase orders table
      return { success: true };
    }

    return { success: true };
  }
};

// Unified DB export matching application conventions
export const db = {
  supabase,
  isConfigured: isSupabaseConfigured,
  entities,
  auth,
  integrations,
  functions,
};

export default db;
