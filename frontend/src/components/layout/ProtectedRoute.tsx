import type { UserRole, FeatureKey } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  feature?: FeatureKey;
  requiredLevel?: 'read' | 'edit';
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, feature, requiredLevel = 'read', children }: ProtectedRouteProps) {
  const { user, hasPermission, canAccessFeature } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const featureAllowed = feature ? canAccessFeature(feature, requiredLevel) : true;
  const roleAllowed = allowedRoles ? hasPermission(allowedRoles) : true;

  if (!featureAllowed || !roleAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">403 — Access Denied</h1>
          <p className="text-sm text-slate-500 mt-2">
            You don't have permission to access this page. Your role ({user.role.replace('_', ' ')}) does not have the required access level{feature ? ` for ${feature.replace('_', ' ')}` : ''}.
          </p>
          <a
            href={user.role === 'CUSTOMER' ? '/portal' : '/dashboard'}
            className="inline-flex items-center justify-center mt-6 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800"
          >
            {user.role === 'CUSTOMER' ? 'Back to My Quotation' : 'Back to Dashboard'}
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

