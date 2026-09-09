import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  KanbanSquare,
  Users,
  CheckSquare,
  Package,
  CreditCard,
  Receipt,
  Activity,
  BarChart3,
  Box,
  Tags,
  Percent,
  Warehouse as WarehouseIcon,
  CalendarClock,
  ArrowUpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';
import { cn } from '../../utils/format';
import type { UserRole, FeatureKey } from '../../types';
import { type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
  feature?: FeatureKey;
  badge?: number;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, feature: 'dashboard' },
  { label: 'Quotations', path: '/quotations', icon: FileText, feature: 'quotation' },
  { label: 'Pipeline', path: '/pipeline', icon: KanbanSquare, roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
  { label: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare, feature: 'approvals' },
  { label: 'Fulfillment', path: '/fulfillment', icon: Package, feature: 'fulfillment' },
  { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard, feature: 'subscriptions' },
  { label: 'Billing', path: '/billing', icon: Receipt, feature: 'invoice' },
  { label: 'Deal Health', path: '/deal-health', icon: Activity, feature: 'deal_health' },
  { label: 'Reports', path: '/reports', icon: BarChart3, feature: 'report' },
];

const adminNav: NavItem[] = [
  { label: 'Products', path: '/admin/products', icon: Box, feature: 'product' },
  { label: 'Price Lists', path: '/admin/price-lists', icon: Tags, roles: ['ADMIN'] },
  { label: 'Discount Rules', path: '/admin/discount-rules', icon: Percent, roles: ['ADMIN'] },
  { label: 'Warehouses', path: '/admin/warehouses', icon: WarehouseIcon, roles: ['ADMIN'] },
  { label: 'Subscription Plans', path: '/admin/subscription-plans', icon: CalendarClock, roles: ['ADMIN'] },
  { label: 'Upsell Rules', path: '/admin/upsell-rules', icon: ArrowUpCircle, roles: ['ADMIN'] },
  { label: 'Settings', path: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout, canAccessFeature } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isItemVisible = (item: NavItem) => {
    if (user.role === 'ADMIN') return true;
    if (item.feature) {
      return canAccessFeature(item.feature, 'read');
    }
    if (item.roles) {
      return item.roles.includes(user.role);
    }
    return true;
  };

  const visibleMain = mainNav.filter(isItemVisible);
  const visibleAdmin = adminNav.filter(isItemVisible);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 whitespace-nowrap">DealFlow360</p>
            <p className="text-[10px] text-slate-500 whitespace-nowrap">Sales Operations</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {!collapsed && <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main</p>}
        <div className="space-y-0.5">
          {visibleMain.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  collapsed && 'justify-center px-2'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {visibleAdmin.length > 0 && (
          <>
            {!collapsed && <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-4">Admin</p>}
            <div className="space-y-0.5">
              {visibleAdmin.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      collapsed && 'justify-center px-2'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-slate-100 p-2 flex-shrink-0">
        <div className={cn('flex items-center gap-2.5 p-2 rounded-lg', !collapsed && 'hover:bg-slate-50 cursor-pointer')}>
          <Avatar name={user.name} color={user.avatarColor} size="md" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
