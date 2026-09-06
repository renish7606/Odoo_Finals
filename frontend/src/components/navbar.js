/**
 * DealFlow360 Top Navigation Component
 * Matches the claymorphism design system in the wireframe.
 */
import { auth } from '../auth.js';

export function renderNavbar(activeRoute = 'quotations') {
  const user = auth.getUser() || { full_name: 'User', role: 'SalesRep' };
  const userRole = (user.selected_role || user.role || '').toLowerCase();
  const isCustomer = userRole === 'customer';

<<<<<<< HEAD
  const navItems = isCustomer
    ? [
        { key: 'quotations', label: 'My Quotations', icon: 'request_quote', href: '#/quotations' },
        { key: 'messages', label: 'Messages', icon: 'chat_bubble', href: '#/messages' },
        { key: 'profile', label: 'Profile', icon: 'account_circle', href: '#/profile' },
      ]
    : [
        { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '#/dashboard' },
        { key: 'quotations', label: 'Quotations', icon: 'request_quote', href: '#/quotations' },
        { key: 'approvals', label: 'Approvals', icon: 'verified', href: '#/approvals' },
        { key: 'deal-health', label: 'Deal Health', icon: 'crisis_alert', href: '#/deal-health' },
        { key: 'fulfillment', label: 'Fulfillment', icon: 'assignment_turned_in', href: '#/fulfillment' },
        { key: 'invoices', label: 'Invoices', icon: 'receipt_long', href: '#/invoices' },
        { key: 'customers', label: 'Customers', icon: 'corporate_fare', href: '#/customers' },
        { key: 'products', label: 'Products', icon: 'inventory_2', href: '#/products' },
        { key: 'pricing', label: 'Pricing', icon: 'sell', href: '#/pricing' },
        { key: 'subscriptions', label: 'Subscriptions', icon: 'sync', href: '#/subscriptions' },
        { key: 'reports', label: 'Reports', icon: 'bar_chart', href: '#/reports' },
        { key: 'messages', label: 'Messages', icon: 'chat_bubble', href: '#/messages' },
        { key: 'profile', label: 'Profile', icon: 'account_circle', href: '#/profile' },
      ];
=======
  const allNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '#/dashboard' },
    { key: 'quotations', label: 'Quotations', icon: 'request_quote', href: '#/quotations' },
    { key: 'approvals', label: 'Approvals', icon: 'verified', href: '#/approvals' },
    { key: 'deal-health', label: 'Deal Health', icon: 'crisis_alert', href: '#/deal-health' },
    { key: 'fulfillment', label: 'Fulfillment', icon: 'assignment_turned_in', href: '#/fulfillment' },
    { key: 'invoices', label: 'Invoices', icon: 'receipt_long', href: '#/invoices' },
    { key: 'products', label: 'Products', icon: 'inventory_2', href: '#/products' },
    { key: 'pricing', label: 'Pricing', icon: 'sell', href: '#/pricing' },
    { key: 'subscriptions', label: 'Subscriptions', icon: 'sync', href: '#/subscriptions' },
    { key: 'reports', label: 'Reports', icon: 'bar_chart', href: '#/reports' },
    { key: 'messages', label: 'Messages', icon: 'chat_bubble', href: '#/messages' },
    { key: 'profile', label: 'Profile', icon: 'account_circle', href: '#/profile' },
  ];

  const roleTabs = {
    SalesRep: ['dashboard', 'quotations', 'customers', 'products'],
    SalesManager: ['dashboard', 'quotations', 'approvals', 'pricing', 'reports'],
    FinanceOps: ['dashboard', 'approvals', 'fulfillment', 'invoices', 'subscriptions'],
    Admin: ['dashboard', 'quotations', 'approvals', 'deal-health', 'fulfillment', 'invoices', 'customers', 'products', 'pricing', 'subscriptions', 'reports'],
    Customer: ['quotations', 'messages', 'profile'],
  };
  const allowedTabs = roleTabs[userRole] || roleTabs.SalesRep;
  const navItems = allNavItems.filter((item) => allowedTabs.includes(item.key));
>>>>>>> 9fd844c (Add different LogIn)

  const navLinksHtml = navItems
    .map((item) => {
      const isActive = activeRoute === item.key || (activeRoute === 'quotation-detail' && item.key === 'quotations');
      const activeClass = isActive ? 'nav-item-active' : 'nav-item-inactive';
      const label = userRole === 'Customer' && item.key === 'quotations' ? 'My Quotations' : item.label;
      return `
        <a href="${item.href}" class="nav-item ${activeClass}" data-route="${item.key}">
          <span class="material-symbols-outlined text-lg">${item.icon}</span>
          <span>${label}</span>
        </a>
      `;
    })
    .join('');

  return `
    <header class="navbar-header">
      <div class="navbar-inner">
        <!-- Logo & Branding -->
        <div class="navbar-brand">
          <a href="#/quotations" class="flex items-center gap-3 text-inherit no-underline">
            <div class="logo-box">
              <svg class="w-6 h-6 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-dasharray="48" stroke-dashoffset="12" stroke-linecap="round" stroke-width="2.5"></circle>
                <circle cx="16" cy="16" fill="currentColor" r="4.5"></circle>
                <circle cx="23" cy="9" fill="currentColor" r="2.2"></circle>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-lg tracking-tight text-on-surface leading-none">DealFlow360</span>
              <span class="text-[10px] text-primary uppercase tracking-widest font-semibold mt-0.5">Enterprise M&amp;A</span>
            </div>
          </a>
        </div>

        <!-- Navigation Tabs -->
        <nav class="navbar-nav">
          ${navLinksHtml}
        </nav>

        <!-- Right User Actions -->
        <div class="navbar-actions">
          <div class="status-pill hidden sm:flex items-center gap-2">
            <span class="pulse-dot"></span>
            <span class="text-xs text-on-surface-variant font-medium">Q3 Pipeline</span>
            <span class="text-xs font-mono font-bold text-primary">99.4%</span>
          </div>

          <div class="h-6 w-px bg-outline-variant/50 hidden md:block"></div>

          <!-- User Profile & Logout Menu -->
          <div class="user-profile-menu flex items-center gap-3">
            <a href="#/profile" class="hidden lg:flex flex-col text-right no-underline">
              <span class="text-xs font-bold text-on-surface leading-tight">${user.full_name || 'User'}</span>
              <span class="text-[11px] text-on-surface-variant leading-tight">${user.selected_role || user.role || 'SalesRep'}</span>
            </a>
            <a href="#/profile" class="avatar-box no-underline" title="${user.full_name || 'Profile'}">
              <span class="font-bold text-sm text-primary">${(user.full_name || 'User').slice(0, 2).toUpperCase()}</span>
            </a>
            <button type="button" id="btn-logout" class="icon-btn text-error hover:bg-error-container/40" title="Sign Out">
              <span class="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function setupNavbarEvents() {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        auth.logout();
      }
    });
  }
}
