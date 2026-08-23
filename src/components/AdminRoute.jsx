import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminRoute({ children }) {
  const { user, role, authChecked, isLoadingAuth, logout } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-paper">
        <div className="w-10 h-10 border-4 border-sage-soft border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in at all, send them to login with return destination
  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  // If logged in but role is not admin, show clear access restricted message
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
              Logged in as <span className="font-semibold text-forest">{user.email}</span> (role: <span className="capitalize">{role || 'user'}</span>). This area requires administrator permissions.
            </p>
          </div>

          <div className="bg-secondary p-4 squircle-sm text-xs text-left text-muted-foreground space-y-1">
            <p className="font-semibold text-forest">How to grant admin access in Supabase:</p>
            <p>1. Go to your Supabase Dashboard → <strong>Table Editor</strong> → <strong>profiles</strong>.</p>
            <p>2. Set the <strong>role</strong> column for your user to <code className="bg-card px-1 py-0.5 rounded border border-border">admin</code>.</p>
            <p>3. Refresh this page.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full h-11">
                <ArrowLeft className="w-4 h-4 mr-2" /> Storefront
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              className="flex-1 h-11"
              onClick={() => logout(`/login?returnTo=${encodeURIComponent(location.pathname)}`)}
            >
              <LogOut className="w-4 h-4 mr-2" /> Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}