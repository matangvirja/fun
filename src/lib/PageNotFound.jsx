import { db } from '@/api/supabaseClient';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await db.auth.me();
                return { user, isAuthenticated: !!user };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* 404 Error Code */}
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-forest/30 font-display">404</h1>
                        <div className="h-0.5 w-16 bg-sage mx-auto"></div>
                    </div>
                    
                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-medium text-forest font-display">
                            Page Not Found
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The page <span className="font-medium text-forest">"{pageName}"</span> could not be found.
                        </p>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-6">
                        <Link 
                            to="/" 
                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-paper bg-forest squircle-sm hover:bg-forest/90 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
