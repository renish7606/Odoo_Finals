import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { UserRole } from '../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginAsRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError('Please enter an email address');
      return;
    }
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) {
      showSuccess('Signed in successfully');
      navigate('/dashboard');
    } else {
      showError('Login failed', 'No account found with that email');
    }
  };

  const handleQuickRole = (role: UserRole) => {
    loginAsRole(role);
    showSuccess(`Logged in as ${role.replace('_', ' ')}`);
    if (role === 'CUSTOMER') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  const demoRoles: { role: UserRole; title: string; email: string; color: string }[] = [
    { role: 'ADMIN', title: 'Admin', email: 'admin@dealflow360.com', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { role: 'SALES_REP', title: 'Sales Rep', email: 'alex@dealflow360.com', color: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
    { role: 'SALES_MANAGER', title: 'Sales Manager', email: 'sarah@dealflow360.com', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { role: 'FINANCE_OPS', title: 'Finance Ops', email: 'mike@dealflow360.com', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    { role: 'CUSTOMER', title: 'Customer Portal', email: 'customer@acme.com', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">DealFlow360</span>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold text-slate-700">
          Sales Operations & CPQ Platform
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-elevated rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-4" onSubmit={handleStandardLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@dealflow360.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Instant Quick-Login as Demo Role
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoRoles.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickRole(demo.role)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${demo.color}`}
                >
                  <span className="font-semibold">{demo.title}</span>
                  <span className="opacity-80">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
