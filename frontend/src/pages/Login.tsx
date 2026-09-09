import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, UserPlus, LogIn, Building, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { UserRole } from '../types';

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const { login, signup, loginAsRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success && result.user) {
      showSuccess(`Welcome back, ${result.user.name}`);
      if (result.user.role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } else {
      showError('Login failed', result.error || 'Invalid email or password');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showError('Please enter your full name');
      return;
    }
    if (!signupEmail.trim()) {
      showError('Please enter your work email');
      return;
    }
    if (signupPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }
    if (signupPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const result = await signup(fullName, signupEmail, signupPassword, company);
    setSubmitting(false);

    if (result.success) {
      showSuccess('Account created successfully!', 'Credentials added to database. Welcome to your portal.');
      navigate('/portal');
    } else {
      showError('Sign up failed', result.error || 'Could not register user');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">DealFlow360</span>
        </div>
        <h2 className="mt-3 text-center text-lg font-semibold text-slate-700">
          Sales Operations & Customer Negotiation Portal
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-elevated rounded-3xl border border-slate-200 sm:px-9">
          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form className="space-y-4" onSubmit={handleStandardLogin}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@dealflow360.com or customer@acme.com"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SIGN UP FORM (New Customer Account) */
            <form className="space-y-3.5" onSubmit={handleSignup}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="john@acme.com"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password (min 8 chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{submitting ? 'Creating Account & Saving to Database...' : 'Register & Enter Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Account credentials are saved securely in PostgreSQL with bcrypt encryption.
              </p>
            </form>
          )}

          {/* Quick Login for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Demo Role Access
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {demoRoles.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickRole(demo.role)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${demo.color}`}
                >
                  <span className="font-semibold">{demo.title}</span>
                  <span className="opacity-75 text-[11px]">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
