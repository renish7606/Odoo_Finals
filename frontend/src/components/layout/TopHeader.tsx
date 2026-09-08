import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Avatar } from '../ui';
import { Breadcrumb } from '../ui';
import { cn } from '../../utils/format';
import { formatDateTime } from '../../utils/format';

interface TopHeaderProps {
  title: string;
  breadcrumb: { label: string; path?: string }[];
  onMenuClick?: () => void;
  actions?: ReactNode;
}

export function TopHeader({ title, breadcrumb, onMenuClick, actions }: TopHeaderProps) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const userNotifications = user ? notifications.filter((n) => n.userId === user.id) : [];
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const routeLabelMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/quotations': 'Quotations',
    '/pipeline': 'Pipeline',
    '/customers': 'Customers',
    '/approvals': 'Approvals',
    '/fulfillment': 'Fulfillment',
    '/subscriptions': 'Subscriptions',
    '/billing': 'Billing',
    '/deal-health': 'Deal Health',
    '/reports': 'Reports',
  };

  const searchPlaceholder = user?.role === 'CUSTOMER' ? 'Search quotes...' : 'Search quotations, customers...';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-semibold text-slate-900 truncate">{title}</h1>
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumb} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-48 lg:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white border border-slate-200 rounded-xl shadow-elevated z-50 animate-slide-down max-h-96 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {userNotifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
                ) : (
                  userNotifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifOpen(false);
                      }}
                      className={cn(
                        'px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors',
                        !n.read && 'bg-teal-50/30'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.read ? 'bg-slate-300' : 'bg-teal-500')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {user && <Avatar name={user.name} color={user.avatarColor} size="sm" />}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{user?.role.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-elevated z-50 animate-slide-down overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <p className="text-xs text-teal-600 font-medium mt-1">{user?.role.replace('_', ' ')}</p>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {actions}
      </div>
    </header>
  );
}
