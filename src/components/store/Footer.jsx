import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/lib/useSiteData';

export default function Footer() {
  const { data: settings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <footer className="mt-24 bg-forest text-paper grain">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-medium mb-4 text-balance">{settings?.footer_tagline || 'Stories worth growing into.'}</h2>
          <p className="text-paper/70 mb-6">Join the FunFable circle for new arrivals, play ideas, and members-only treats.</p>
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="your@email.com" className="flex-1 h-14 px-5 squircle-sm bg-paper/10 border border-paper/20 text-paper placeholder:text-paper/40 outline-none focus:border-terracotta" />
            <button className="h-14 px-8 squircle-sm bg-terracotta text-white font-medium hover:opacity-90 transition">{done ? 'Subscribed ✓' : 'Subscribe'}</button>
          </form>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-paper/10">
          <div>
            <div className="font-display text-2xl font-semibold mb-3">FunFable</div>
            <p className="text-paper/60 text-sm">{settings?.guarantee_text || 'Thoughtfully made toys for ages 0–12.'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-paper/90">Shop</h4>
            <ul className="space-y-2 text-sm text-paper/60">
              <li><Link to="/shop" className="hover:text-paper">All Toys</Link></li>
              <li><Link to="/shop?age=2" className="hover:text-paper">Ages 0–3</Link></li>
              <li><Link to="/shop?age=6" className="hover:text-paper">Ages 4–8</Link></li>
              <li><Link to="/shop?age=10" className="hover:text-paper">Ages 9–12</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-paper/90">Company</h4>
            <ul className="space-y-2 text-sm text-paper/60">
              <li><Link to="/about" className="hover:text-paper">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-paper">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-paper">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-paper/90">Support</h4>
            <ul className="space-y-2 text-sm text-paper/60">
              <li><Link to="/faq" className="hover:text-paper">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-paper">FAQ</Link></li>
              <li><Link to="/admin" className="hover:text-paper">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-12 border-t border-paper/10 text-center text-sm text-paper/50">© {new Date().getFullYear()} FunFable. Crafted for play.</div>
      </div>
    </footer>
  );
}