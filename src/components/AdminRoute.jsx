import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function AdminRoute({ children }) {
  const { user, authChecked, isLoadingAuth } = useAuth();
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-paper">
        <div className="w-8 h-8 border-4 border-sage-soft border-t-forest rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}