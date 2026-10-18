import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, auth, supabaseReadyPromise } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchProfile = async (supabaseUser) => {
    if (!supabaseUser) return null;
    try {
      if (isSupabaseConfigured) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', supabaseUser.id)
          .single();

        return {
          ...supabaseUser,
          role: profile?.role || supabaseUser.user_metadata?.role || 'user'
        };
      }
      return {
        ...supabaseUser,
        role: supabaseUser.user_metadata?.role || 'user'
      };
    } catch (e) {
      return {
        ...supabaseUser,
        role: supabaseUser.user_metadata?.role || 'user'
      };
    }
  };

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);

      await supabaseReadyPromise;

      if (!isSupabaseConfigured) {
        // Check for demo admin in local storage
        if (typeof window !== 'undefined' && localStorage.getItem('funfable_demo_admin') === 'true') {
          setUser({
            id: 'demo-admin-id',
            email: 'admin@funfable.store',
            role: 'admin',
            user_metadata: { full_name: 'Store Administrator' }
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        const userWithRole = await fetchProfile(session.user);
        setUser(userWithRole);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    let subscription;
    let cancelled = false;

    const init = async () => {
      await checkUserAuth();
      // Only subscribe to Supabase auth events if it's actually reachable
      await supabaseReadyPromise;
      if (!cancelled && isSupabaseConfigured) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const userWithRole = await fetchProfile(session.user);
            setUser(userWithRole);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setIsLoadingAuth(false);
          setAuthChecked(true);
        });
        subscription = data?.subscription;
      }
    };

    init();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [checkUserAuth]);

  const logout = async (redirectUrl = '/') => {
    try {
      await auth.logout(redirectUrl);
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navigateToLogin = (returnTo = window.location.pathname) => {
    auth.redirectToLogin(returnTo);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || 'user',
      isAuthenticated, 
      isLoadingAuth,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
