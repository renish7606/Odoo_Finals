import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole, FeatureKey, AccessLevel, RBACMatrix } from '../types';
import { DEFAULT_RBAC_MATRIX } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginAsRole: (role: UserRole) => void;
  signup: (name: string, email: string, password: string, company?: string) => Promise<AuthResponse>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  rbacMatrix: RBACMatrix;
  getFeatureAccess: (feature: FeatureKey, role?: UserRole) => AccessLevel;
  canAccessFeature: (feature: FeatureKey, requiredLevel?: 'read' | 'edit') => boolean;
  updateRBACMatrix: (newMatrix: RBACMatrix) => void;
  resetRBACMatrix: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'dealflow360_auth';
const TOKEN_KEY = 'dealflow_token';
const RBAC_STORAGE_KEY = 'dealflow360_rbac_matrix';

const roleMap: Record<string, UserRole> = {
  Admin: 'ADMIN',
  SalesRep: 'SALES_REP',
  SalesManager: 'SALES_MANAGER',
  FinanceOps: 'FINANCE_OPS',
  Customer: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE_OPS: 'FINANCE_OPS',
  CUSTOMER: 'CUSTOMER',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [rbacMatrix, setRbacMatrix] = useState<RBACMatrix>(() => {
    try {
      const stored = localStorage.getItem(RBAC_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: RBACMatrix = { ...DEFAULT_RBAC_MATRIX };
        (Object.keys(DEFAULT_RBAC_MATRIX) as FeatureKey[]).forEach((k) => {
          merged[k] = { ...DEFAULT_RBAC_MATRIX[k], ...(parsed[k] || {}) };
          merged[k].ADMIN = 'edit';
        });
        return merged;
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_RBAC_MATRIX;
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setUser(mockUsers[0]);
      }
    } else {
      setUser(mockUsers[0]);
    }
  }, []);


  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      // 1. Attempt backend authentication against PostgreSQL
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem(TOKEN_KEY, data.access_token);
        }
        const mappedRole = roleMap[data.user?.role] || 'CUSTOMER';
        const authenticatedUser: User = {
          id: String(data.user?.id || Date.now()),
          name: data.user?.full_name || email.split('@')[0],
          email: data.user?.email || email,
          role: mappedRole,
          tenantId: 't-1',
          avatarColor: mappedRole === 'CUSTOMER' ? '#0F766E' : '#14B8A6',
        };
        setUser(authenticatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        setLoading(false);
        return { success: true, user: authenticatedUser };
      }

      // If backend responded with 401 / 422, check if it's one of our mock demo accounts
      const foundMock = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (foundMock) {
        setUser(foundMock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(foundMock));
        setLoading(false);
        return { success: true, user: foundMock };
      }

      const errData = await res.json().catch(() => null);
      setLoading(false);
      return { success: false, error: errData?.detail || 'Invalid email or password' };
    } catch {
      // Network fallback (e.g. backend temporarily unreachable)
      const foundMock = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (foundMock) {
        setUser(foundMock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(foundMock));
        setLoading(false);
        return { success: true, user: foundMock };
      }
      setLoading(false);
      return { success: false, error: 'Could not connect to authentication server' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    company?: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      // Direct POST to PostgreSQL via backend /auth/signup
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          password,
          role: 'Customer',
          company: company?.trim() || name.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem(TOKEN_KEY, data.access_token);
        }
        const newUser: User = {
          id: String(data.user?.id || Date.now()),
          name: data.user?.full_name || name,
          email: data.user?.email || email,
          role: 'CUSTOMER',
          tenantId: 't-1',
          avatarColor: '#0F766E',
        };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setLoading(false);
        return { success: true, user: newUser };
      }

      const errData = await res.json().catch(() => null);
      setLoading(false);
      return { success: false, error: errData?.detail || 'Registration failed' };
    } catch {
      // Fallback if backend offline
      const fallbackUser: User = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: 'CUSTOMER',
        tenantId: 't-1',
        avatarColor: '#0F766E',
      };
      setUser(fallbackUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const loginAsRole = (role: UserRole) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const hasPermission = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getFeatureAccess = (feature: FeatureKey, role?: UserRole): AccessLevel => {
    const targetRole = role || user?.role || 'CUSTOMER';
    if (targetRole === 'ADMIN') return 'edit';
    return rbacMatrix[feature]?.[targetRole] || 'none';
  };

  const canAccessFeature = (feature: FeatureKey, requiredLevel: 'read' | 'edit' = 'read'): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const access = rbacMatrix[feature]?.[user.role] || 'none';
    if (access === 'none') return false;
    if (requiredLevel === 'read') return access === 'read' || access === 'edit';
    if (requiredLevel === 'edit') return access === 'edit';
    return false;
  };

  const updateRBACMatrix = (newMatrix: RBACMatrix) => {
    const sanitized: RBACMatrix = { ...newMatrix };
    (Object.keys(sanitized) as FeatureKey[]).forEach((k) => {
      sanitized[k] = { ...sanitized[k], ADMIN: 'edit' };
    });
    setRbacMatrix(sanitized);
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(sanitized));
  };

  const resetRBACMatrix = () => {
    setRbacMatrix(DEFAULT_RBAC_MATRIX);
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(DEFAULT_RBAC_MATRIX));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsRole,
        signup,
        logout,
        hasPermission,
        rbacMatrix,
        getFeatureAccess,
        canAccessFeature,
        updateRBACMatrix,
        resetRBACMatrix,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
