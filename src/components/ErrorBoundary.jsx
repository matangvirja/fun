import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * React Error Boundary — catches unexpected render errors in the component tree
 * and shows a friendly fallback UI instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, errors can be reported to a monitoring service (e.g. Sentry) here
    console.error('[FunFable Error Boundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 squircle bg-terracotta/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-terracotta" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-medium text-forest">Something went wrong</h1>
              <p className="text-muted-foreground leading-relaxed">
                An unexpected error occurred. You can try refreshing the page, or go back to the homepage.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-forest">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 p-3 bg-secondary squircle-sm text-xs text-destructive overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-forest text-paper squircle-sm h-11 px-5 font-medium hover:bg-forest/90 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 border border-border squircle-sm h-11 px-5 font-medium text-forest hover:bg-secondary transition text-sm"
              >
                <Home className="w-4 h-4" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
