import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const roleRank: Record<string, number> = {
  citizen: 0, analyst: 1, authority_operator: 2, authority_supervisor: 3,
};

export function ProtectedRoute({ minRole, children }: { minRole: string; children: React.ReactNode }) {
  const { session, role, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if ((roleRank[role ?? 'citizen'] ?? 0) < roleRank[minRole]) return <Navigate to="/citizen" replace />;
  return <>{children}</>;
}