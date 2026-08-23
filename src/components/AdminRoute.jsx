import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert, Shield, ArrowLeft, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminRoute({ children }) {
  const { user, role, authChecked, isLoadingAuth, loginAsDemoAdmin, logout } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-paper">
        <div className="w-10 h-10 border-4 border-sage-soft border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in at all, show login options with instant Demo Admin button
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
        <div className="max-w-md w-full bg-card squircle-lg border border-border p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 squircle bg-forest text-paper flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-medium text-forest mb-2">Admin Portal</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Log in to manage products, categories, orders, invoices, and site settings.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              className="w-full h-12 bg-forest text-paper font-medium hover:bg-forest/90 flex items-center justify-center gap-2"
              onClick={() => loginAsDemoAdmin(location.pathname)}
            >
              <Sparkles className="w-4 h-4 text-terracotta" /> 
              Instant Demo Admin Access
            </Button>

            <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} className="block w-full">
              <Button variant="outline" className="w-full h-12 font-medium">
                <LogIn className="w-4 h-4 mr-2" /> Log In with Email / Supabase
              </Button>
            </Link>
          </div>

          <div className="pt-2 border-t border-border">
            <Link to="/" className="text-xs text-muted-foreground hover:text-forest inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but role is not admin, show clear access restricted message with quick demo switch
  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
        <div className="max-w-md w-full bg-card squircle-lg border border-border p-8 text-center space-y-5">
          <div className="w-16 h-16 squircle bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium text-forest mb-2">Admin Access Required</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Logged in as <span className="font-semibold text-forest">{user.email}</span> (role: <span className="capitalize">{role || 'user'}</span>).
            </p>
          </div>

          <div className="bg-secondary p-4 squircle-sm text-xs text-left text-muted-foreground space-y-1">
            <p className="font-semibold text-forest">To make this user an admin in Supabase:</p>
            <p>1. Open Supabase Dashboard → <strong>Table Editor</strong> → <strong>profiles</strong>.</p>
            <p>2. Set the <strong>role</strong> column to <code className="bg-card px-1 py-0.5 rounded border border-border">admin</code>.</p>
          </div>

          <div className="space-y-2 pt-2">
            <Button 
              className="w-full h-11 bg-forest text-paper"
              onClick={() => loginAsDemoAdmin(location.pathname)}
            >
              <Sparkles className="w-4 h-4 mr-2 text-terracotta" /> Switch to Demo Admin Mode
            </Button>
            <div className="flex gap-2">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full h-11">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Storefront
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1 h-11 text-destructive"
                onClick={() => logout(`/login?returnTo=${encodeURIComponent(location.pathname)}`)}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}