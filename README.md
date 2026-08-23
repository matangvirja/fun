# FunFable — Toy Store (Powered by Supabase & Vite)

FunFable is a modern, handcrafted e-commerce web application for children's toys, built with React, Vite, Tailwind CSS, TanStack Query, and **Supabase** (Database, Auth & Storage).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A free [Supabase](https://supabase.com) account

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase

1. Create a new project in [Supabase](https://supabase.com/dashboard).
2. Go to **SQL Editor** in your Supabase dashboard and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
   - This creates all tables (`products`, `categories`, `orders`, `site_settings`, `profiles`, `contact_inquiries`), sets up Row Level Security (RLS) policies, creates the `product-images` storage bucket, and seeds starter data.
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Add your Supabase credentials (from **Project Settings > API**):
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Schema & Features

- **Storefront**: High-speed browsing for toys with filtering by age, category, and search terms.
- **Cart & Magic Box**: Client-side persisted cart with free shipping thresholds.
- **Checkout & Orders**: Orders saved to Supabase with automated user assignment and status tracking.
- **Admin Dashboard** (`/admin`):
  - Manage inventory & product catalog (`/admin/products`)
  - Create & organize categories (`/admin/categories`)
  - Review orders & download PDF invoices (`/admin/orders`)
  - Customize site copy, hero banners, and announcements (`/admin/settings`)
- **Supabase Storage**: Direct image uploads to the `product-images` bucket.
- **Supabase Auth**: Email/password and Google OAuth authentication with role-based access (`admin` vs `user`).

---

## 🛠️ Build & Verification

- **Development:** `npm run dev`
- **Production Build:** `npm run build`
- **Lint Check:** `npm run lint`
- **Type Check:** `npm run typecheck`
