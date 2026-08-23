import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Shield, LogOut } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useSiteSettings, useCategories } from '@/lib/useSiteData';
import { useAuth } from '@/lib/AuthContext';
import AgeSlider from './AgeSlider';

export default function Navbar() {
  const { count, openCart } = useCart();
  const { data: settings } = useSiteSettings();
  const { data: categories } = useCategories();
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => { 
    e.preventDefault(); 
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`); 
      setMobileOpen(false); 
    }
  };

  return (
    <div className="sticky top-0 z-40">
      {settings?.announcement && (
        <div className="bg-forest text-paper text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide">
          {settings.announcement}
        </div>
      )}
      <header className="bg-paper/85 backdrop-blur-md border-b border-border">
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-2xl font-semibold text-forest tracking-tight">FunFable</Link>
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-forest/80">
              <Link to="/shop" className="hover:text-forest transition">Shop All</Link>
              <div className="relative" onMouseEnter={() => setAgeOpen(true)} onMouseLeave={() => setAgeOpen(false)}>
                <button className="hover:text-forest transition">Shop by Age</button>
                {ageOpen && (
                  <div className="absolute top-full left-0 pt-3 w-72">
                    <div className="bg-card squircle shadow-xl border border-border p-5">
                      <AgeSlider onChange={(age) => { navigate(`/shop?age=${age}`); setAgeOpen(false); }} />
                    </div>
                  </div>
                )}
              </div>
              {categories?.slice(0, 3).map(c => (
                <Link key={c.id} to={`/shop?category=${c.slug}`} className="hover:text-forest transition">{c.name}</Link>
              ))}
              <Link to="/about" className="hover:text-forest transition">Our Story</Link>
              <Link to="/contact" className="hover:text-forest transition">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="hidden sm:flex items-center bg-card border border-border squircle-sm px-3 h-10">
              <Search className="w-4 h-4 text-forest/50" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search toys" className="bg-transparent outline-none px-2 text-sm w-32 lg:w-48" />
            </form>

            {/* User Profile / Admin Link */}
            <div className="relative">
              {isAuthenticated ? (
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  title={user?.email || 'Account'} 
                  className="w-10 h-10 flex items-center justify-center squircle-sm bg-card border border-border hover:bg-secondary transition"
                >
                  {role === 'admin' ? <Shield className="w-5 h-5 text-forest" /> : <User className="w-5 h-5 text-forest" />}
                </button>
              ) : (
                <Link 
                  to="/login" 
                  title="Log in" 
                  className="w-10 h-10 flex items-center justify-center squircle-sm bg-card border border-border hover:bg-secondary transition"
                >
                  <User className="w-5 h-5 text-forest" />
                </Link>
              )}

              {userMenuOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card squircle-sm shadow-xl border border-border p-2 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-forest truncate">{user?.email}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{role}</p>
                  </div>
                  {role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-forest hover:bg-secondary rounded transition"
                    >
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition text-left"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>

            <button onClick={openCart} className="relative w-10 h-10 flex items-center justify-center squircle-sm bg-card border border-border hover:bg-secondary transition">
              <ShoppingBag className="w-5 h-5 text-forest" />
              {count > 0 && <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center squircle-sm bg-card border border-border">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-paper px-5 py-4 space-y-3">
            <form onSubmit={submitSearch} className="flex items-center bg-card border border-border squircle-sm px-3 h-10">
              <Search className="w-4 h-4 text-forest/50" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search toys" className="bg-transparent outline-none px-2 text-sm w-full" />
            </form>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-1 font-medium">Shop All</Link>
            <div className="py-1">
              <div className="text-sm text-muted-foreground mb-2">Shop by Age</div>
              <AgeSlider onChange={(age) => { navigate(`/shop?age=${age}`); setMobileOpen(false); }} />
            </div>
            {categories?.map(c => <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="block py-1 font-medium">{c.name}</Link>)}
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-1 font-medium">Our Story</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-1 font-medium">Contact</Link>
            {isAuthenticated ? (
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{user?.email}</p>
                  {role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-xs text-forest underline">Admin Dashboard</Link>}
                </div>
                <button onClick={() => logout()} className="text-xs text-destructive">Log out</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-1 font-medium text-forest">Log in</Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}