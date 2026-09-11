import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Settings, LogOut, Store, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isSupabaseConfigured } from '@/api/supabaseClient';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/settings', label: 'Site Settings', icon: Settings },
];

// Check if user is on the demo admin mode (localStorage-based, no real Supabase)
const isDemoMode = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('funfable_demo_admin') === 'true' &&
  !isSupabaseConfigured;

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const showDemoBanner = isDemoMode();

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-screen">
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="font-display text-2xl font-semibold text-forest">FunFable</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 squircle-sm text-sm font-medium ${active ? 'bg-forest text-paper' : 'text-forest/70 hover:bg-secondary'}`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 squircle-sm text-sm text-forest/70 hover:bg-secondary"><Store className="w-4 h-4" /> View store</Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2 squircle-sm text-sm text-forest/70 hover:bg-secondary"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </aside>
      <main className="flex-1 ml-64">
        {/* Demo mode warning banner — shown when Supabase is not configured */}
        {showDemoBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <span className="font-semibold">Demo mode active</span> — changes are stored in browser localStorage only.{' '}
              <a
                href="https://github.com/matangvirja/fun#-getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900"
              >
                Configure Supabase
              </a>{' '}
              to persist data and enable real authentication.
            </div>
          </div>
        )}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}