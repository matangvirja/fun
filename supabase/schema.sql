-- ==============================================================================
-- FunFable Supabase Database Schema & Seed Script
-- Run this in your Supabase Project's SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE & AUTH TRIGGER (User roles: 'admin' or 'user')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow admins full access to profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- First registered user or specific email can be given admin role if desired
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'user')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  age_min NUMERIC DEFAULT 0,
  age_max NUMERIC DEFAULT 12,
  "order" NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access to categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  images JSONB DEFAULT '[]'::jsonb,
  age_min NUMERIC DEFAULT 0,
  age_max NUMERIC DEFAULT 12,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  dominant_color TEXT DEFAULT '#88A494',
  stock NUMERIC DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  rating NUMERIC DEFAULT 5,
  review_count NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access to products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  address TEXT,
  city TEXT,
  zip TEXT,
  country TEXT DEFAULT 'India',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own orders or public confirmation"
  ON public.orders FOR SELECT
  USING (
    created_by_id IS NULL 
    OR auth.uid() = created_by_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admin full access to orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 5. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT DEFAULT 'Toys that tell stories.',
  hero_subtitle TEXT DEFAULT 'Thoughtfully made playthings for ages 0–12 — crafted to spark the next great adventure.',
  hero_theme TEXT DEFAULT 'The Summer of Building',
  hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
  hero_cta_text TEXT DEFAULT 'Explore the collection',
  announcement TEXT DEFAULT 'Free shipping on orders over ₹1,500 ✨',
  free_shipping_threshold NUMERIC DEFAULT 1500,
  story_title TEXT DEFAULT 'Play is the first language.',
  story_body TEXT DEFAULT 'FunFable began with a simple belief: the best toys don''t entertain a child, they invite them to invent. Every piece in our collection is chosen for its craft, its materials, and the open-ended stories it makes possible.',
  story_image TEXT DEFAULT 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  guarantee_text TEXT DEFAULT 'If a toy doesn''t spark joy within 30 days, return it for a full refund — no questions, no fuss. Play should feel good from the very first moment.',
  footer_tagline TEXT DEFAULT 'Thoughtful toys for curious minds.',
  google_sheet_id TEXT DEFAULT '',
  google_sheet_tab TEXT DEFAULT 'Orders',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access to site_settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 6. CONTACT INQUIRIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to contact_inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admin full access to contact_inquiries"
  ON public.contact_inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET FOR PRODUCT IMAGES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access for product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated or anon upload to product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow admin delete from product-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- ------------------------------------------------------------------------------
-- 8. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Default Site Settings
INSERT INTO public.site_settings (
  hero_title,
  hero_subtitle,
  hero_theme,
  hero_image,
  hero_cta_text,
  announcement,
  free_shipping_threshold,
  story_title,
  story_body,
  story_image,
  guarantee_text,
  footer_tagline
) VALUES (
  'Toys that tell stories.',
  'Thoughtfully made playthings for ages 0–12 — crafted to spark the next great adventure.',
  'The Summer of Building',
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
  'Explore the collection',
  'Free shipping on orders over ₹1,500 ✨',
  1500,
  'Play is the first language.',
  'FunFable began with a simple belief: the best toys don''t entertain a child, they invite them to invent. Every piece in our collection is chosen for its craft, its materials, and the open-ended stories it makes possible.',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  'If a toy doesn''t spark joy within 30 days, return it for a full refund — no questions, no fuss. Play should feel good from the very first moment.',
  'Thoughtful toys for curious minds.'
) ON CONFLICT DO NOTHING;

-- Starter Categories
INSERT INTO public.categories (id, name, slug, description, image, age_min, age_max, "order")
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Wooden Toys', 'wooden-toys', 'Classic handcrafted timber toys built to last generations.', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', 1, 6, 1),
  ('22222222-2222-2222-2222-222222222222', 'Building & STEM', 'building-stem', 'Engineering kits and architectural blocks to stretch growing minds.', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80', 4, 12, 2),
  ('33333333-3333-3333-3333-333333333333', 'Imaginative Play', 'imaginative-play', 'Costumes, puppets, and miniature worlds for boundless storytelling.', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80', 2, 8, 3),
  ('44444444-4444-4444-4444-444444444444', 'Arts & Crafts', 'arts-crafts', 'Non-toxic paints, clay, and maker kits for tactile creativity.', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', 3, 10, 4)
ON CONFLICT (slug) DO NOTHING;

-- Starter Products
INSERT INTO public.products (name, slug, tagline, description, price, compare_at_price, images, age_min, age_max, category_id, skills, featured, dominant_color, stock, status, rating, review_count)
VALUES
  (
    'Architect''s Wooden Balance Blocks',
    'architects-wooden-balance-blocks',
    '36-piece organic hardwood stacking stones',
    'Sculpted from sustainably harvested beechwood, each multi-faceted block challenges spatial awareness and balance. Finished in plant-based, non-toxic oils.',
    1499,
    1899,
    '["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    2, 8,
    '11111111-1111-1111-1111-111111111111',
    '["Fine Motor Skills", "Spatial Awareness", "Creativity"]'::jsonb,
    true,
    '#D4A373',
    25,
    'active',
    5,
    18
  ),
  (
    'Solar Rover Explorer Kit',
    'solar-rover-explorer-kit',
    'All-terrain STEM robotics crawler',
    'A hands-on introduction to solar energy and gear mechanics. Children build their own working planetary rover that moves in sunlight without batteries.',
    2199,
    2699,
    '["https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    6, 12,
    '22222222-2222-2222-2222-222222222222',
    '["Engineering", "Problem Solving", "Green Energy"]'::jsonb,
    true,
    '#2A9D8F',
    15,
    'active',
    4.9,
    12
  ),
  (
    'Enchanted Forest Puppet Playhouse',
    'enchanted-forest-puppet-playhouse',
    'Foldable organic cotton stage with 4 animal puppets',
    'Step into woodland tales with handmade cotton puppets and a pop-up reversible stage. Great for developing emotional empathy and language skills.',
    1899,
    2299,
    '["https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    3, 7,
    '33333333-3333-3333-3333-333333333333',
    '["Storytelling", "Emotional Empathy", "Language"]'::jsonb,
    true,
    '#E76F51',
    10,
    'active',
    5,
    9
  ),
  (
    'Botanical Plant Dye Painting Set',
    'botanical-plant-dye-painting-set',
    'Natural earth pigments & handmade brushes',
    'Created from petals, turmeric, spirulina, and berries. Safe, aromatic, and comes with textured watercolor paper and bamboo brushes.',
    1199,
    1499,
    '["https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    4, 10,
    '44444444-4444-4444-4444-444444444444',
    '["Sensory Exploration", "Color Mixing", "Artistry"]'::jsonb,
    false,
    '#F4A261',
    30,
    'active',
    4.8,
    14
  )
ON CONFLICT (slug) DO NOTHING;
