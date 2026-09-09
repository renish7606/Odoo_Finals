import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  FileText,
  CheckSquare,
  CreditCard,
  Receipt,
  Activity,
  BarChart3,
  Box,
  Package,
  MessageSquare,
  User as UserIcon,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Avatar } from '../ui';
import { cn, formatDateTime } from '../../utils/format';
import type { UserRole, FeatureKey } from '../../types';

export function TopNavbar() {
  const { user, logout, loginAsRole, canAccessFeature } = useAuth();
  const { notifications, markNotificationRead } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const userNotifications = user ? notifications.filter((n) => n.userId === user.id) : [];
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          // Always stay visible at or near the top of the page (<= 30px)
          if (currentScrollY <= 30) {
            setIsVisible(true);
          } else if (delta > 5) {
            // Scrolling down past threshold -> hide-fade-up and close open menus
            setIsVisible(false);
            setNotifOpen(false);
            setUserMenuOpen(false);
            setRoleMenuOpen(false);
            setMobileNavOpen(false);
          } else if (delta < -5) {
            // Scrolling up -> bring back navigation bar
            setIsVisible(true);
          }

          lastScrollY.current = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (role: UserRole) => {
    loginAsRole(role);
    setRoleMenuOpen(false);
    if (role === 'CUSTOMER') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  interface NavLinkItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    feature?: FeatureKey;
  }

  // Staff nav links with RBAC feature keys
  const staffLinks: NavLinkItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, feature: 'dashboard' },
    { label: 'Quotation', path: '/quotations', icon: FileText, feature: 'quotation' },
    { label: 'Approval', path: '/approvals', icon: CheckSquare, feature: 'approvals' },
    { label: 'Fulfillment', path: '/fulfillment', icon: Package, feature: 'fulfillment' },
    { label: 'Subscription', path: '/subscriptions', icon: CreditCard, feature: 'subscriptions' },
    { label: 'Invoice', path: '/billing', icon: Receipt, feature: 'invoice' },
    { label: 'Deal Health', path: '/deal-health', icon: Activity, feature: 'deal_health' },
    { label: 'Report', path: '/reports', icon: BarChart3, feature: 'report' },
    { label: 'Product', path: '/admin/products', icon: Box, feature: 'product' },
  ];

  // Customer nav links (My Quotation, Messages, Profile)
  const customerLinks: NavLinkItem[] = [
    { label: 'My Quotation', path: '/portal', icon: FileText },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const isInternal = user && user.role !== 'CUSTOMER';

  const visibleStaffLinks = staffLinks.filter((item) => {
    if (!item.feature) return true;
    if (user?.role === 'ADMIN') return true;
    return canAccessFeature(item.feature, 'read');
  });

  const currentLinks = isInternal ? visibleStaffLinks : customerLinks;

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: 'ADMIN', label: 'Admin User' },
    { role: 'SALES_REP', label: 'Sales Rep' },
    { role: 'SALES_MANAGER', label: 'Sales Manager' },
    { role: 'FINANCE_OPS', label: 'Finance Ops' },
    { role: 'CUSTOMER', label: 'Customer' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-1 transition-all duration-300 ease-in-out transform',
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      {/* Glassmorphic Rounded Floating Navbar */}
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_1px_4px_0_rgba(0,0,0,0.04)] px-4 py-2 flex items-center justify-between gap-4 transition-all">
        {/* Left: Brand Logo */}
        <div
          onClick={() => navigate(user?.role === 'CUSTOMER' ? '/portal' : '/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">
              DealFlow360
            </span>
            <span className="text-[10px] text-teal-700 font-medium leading-none">
              {user?.role === 'CUSTOMER' ? 'Customer Portal' : 'Sales Operations'}
            </span>
          </div>
        </div>

        {/* Center: Navigation Bar Links (Scrollable & Responsive) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[550px] lg:max-w-[720px] xl:max-w-[850px] py-1">
          {currentLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0',
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                )
              }
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Controls: Role Switcher, Notifications, User Menu, Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 transition-colors"
              title="Switch role for demo / testing"
            >
              <Shield className="w-3 h-3 text-teal-600" />
              <span className="hidden sm:inline text-[11px] font-semibold text-teal-800">
                {user?.role.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-elevated py-1.5 z-50 text-xs animate-slide-down">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSwitch(opt.role)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between',
                      user?.role === opt.role && 'font-bold text-teal-700 bg-teal-50/60'
                    )}
                  >
                    <span>{opt.label}</span>
                    {user?.role === opt.role && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-elevated z-50 animate-slide-down max-h-80 overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  <span className="text-[10px] text-slate-500">{unreadCount} unread</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
                  {userNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                  ) : (
                    userNotifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link) navigate(n.link);
                          setNotifOpen(false);
                        }}
                        className={cn(
                          'p-3 cursor-pointer hover:bg-slate-50 transition-colors',
                          !n.read && 'bg-teal-50/40'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full mt-1 flex-shrink-0',
                              n.read ? 'bg-slate-300' : 'bg-teal-600'
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              {user && <Avatar name={user.name} color={user.avatarColor} size="sm" />}
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-elevated z-50 animate-slide-down py-1">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> My Profile
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        navigate('/admin/settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-3.5 h-3.5" /> Admin Settings
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-elevated p-3 space-y-1 animate-slide-down">
          {currentLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold',
                  isActive ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
