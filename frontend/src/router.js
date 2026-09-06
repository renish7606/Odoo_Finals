/**
 * DealFlow360 SPA Hash Router
 */
import { auth } from './auth.js';
import { renderNavbar, setupNavbarEvents } from './components/navbar.js';

// Page modules
import { renderLoginPage, setupLoginEvents } from './pages/login.js';
import { renderDashboardPage, loadDashboard, setupDashboardEvents } from './pages/dashboard.js';
import { renderQuotationsPage, loadQuotations, setupQuotationsEvents } from './pages/quotations.js';
import { renderQuotationDetailPage, loadQuotationDetail, setupQuotationDetailEvents } from './pages/quotation-detail.js';
import { renderApprovalsPage, loadApprovals, setupApprovalsEvents } from './pages/approvals.js';
import { renderProductsPage, loadProducts, setupProductsEvents } from './pages/products.js';
import { renderPricingPage, loadPricing, setupPricingEvents } from './pages/pricing.js';
import { renderCustomersPage, loadCustomers, setupCustomersEvents } from './pages/customers.js';
import { renderCustomerPortalPage, loadCustomerPortal, setupCustomerPortalEvents } from './pages/customer-portal.js';
import { renderFulfillmentPage, loadFulfillment, setupFulfillmentEvents } from './pages/fulfillment.js';
import { renderFulfillmentDetailPage, loadFulfillmentDetail, setupFulfillmentDetailEvents } from './pages/fulfillment-detail.js';
import { renderManualOverridePage, loadManualOverride, setupManualOverrideEvents } from './pages/fulfillment-override.js';
import { renderInvoicesPage, loadInvoices, setupInvoicesEvents } from './pages/invoices.js';
import { renderInvoiceDetailPage, loadInvoiceDetail, setupInvoiceDetailEvents } from './pages/invoice-detail.js';
import { renderSubscriptionsPage, loadSubscriptions, setupSubscriptionsEvents } from './pages/subscriptions.js';
import { renderSubscriptionDetailPage, loadSubscriptionDetail, setupSubscriptionDetailEvents } from './pages/subscription-detail.js';
import { renderReportsPage, loadReports, setupReportsEvents } from './pages/reports.js';

export class Router {
  constructor() {
    this.appEl = document.getElementById('app');
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = auth.isAuthenticated() ? '#/dashboard' : '#/login';
    } else {
      this.handleRoute();
    }
  }

  parseHash() {
    const raw = window.location.hash.slice(1) || '/login';
    const [pathWithParams] = raw.split('?');
    const path = pathWithParams.startsWith('/') ? pathWithParams.slice(1) : pathWithParams;
    const parts = path.split('/');
    const route = parts[0] || 'dashboard';
    const param = parts[1] || null;

    // Search params
    const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return { route, param, query };
  }

  showLoading() {
    this.appEl.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `;
  }

  async handleRoute() {
    const { route, param, query } = this.parseHash();

    // Authentication Guard
    const isAuthed = auth.isAuthenticated();
    if (!isAuthed && route !== 'login' && route !== 'portal') {
      window.location.hash = '#/login';
      return;
    }
    if (isAuthed && route === 'login') {
      window.location.hash = '#/dashboard';
      return;
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Route dispatch
    switch (route) {
      case 'login': {
        this.appEl.innerHTML = renderLoginPage();
        setupLoginEvents();
        break;
      }

      case 'dashboard': {
        this.showLoading();
        const data = await loadDashboard();
        this.appEl.innerHTML = `
          ${renderNavbar('dashboard')}
          <main class="main-content">${renderDashboardPage(data)}</main>
        `;
        setupNavbarEvents();
        setupDashboardEvents();
        break;
      }

      case 'quotations': {
        if (param) {
          // Quotation detail route: #/quotations/:id
          this.showLoading();
          const data = await loadQuotationDetail(param);
          this.appEl.innerHTML = `
            ${renderNavbar('quotations')}
            <main class="main-content">${renderQuotationDetailPage(data)}</main>
          `;
          setupNavbarEvents();
          setupQuotationDetailEvents(param, data.products, data.customers);
        } else {
          this.showLoading();
          const quotes = await loadQuotations();
          this.appEl.innerHTML = `
            ${renderNavbar('quotations')}
            <main class="main-content">${renderQuotationsPage(quotes)}</main>
          `;
          setupNavbarEvents();
          setupQuotationsEvents();
        }
        break;
      }

      case 'quotation-detail': {
        this.showLoading();
        const quoteId = param || query.get('id');
        const data = await loadQuotationDetail(quoteId);
        this.appEl.innerHTML = `
          ${renderNavbar('quotations')}
          <main class="main-content">${renderQuotationDetailPage(data)}</main>
        `;
        setupNavbarEvents();
        setupQuotationDetailEvents(quoteId, data.products, data.customers);
        break;
      }

      case 'approvals': {
        this.showLoading();
        const quotes = await loadApprovals();
        this.appEl.innerHTML = `
          ${renderNavbar('approvals')}
          <main class="main-content">${renderApprovalsPage(quotes)}</main>
        `;
        setupNavbarEvents();
        setupApprovalsEvents();
        break;
      }

      case 'products': {
        this.showLoading();
        const products = await loadProducts();
        this.appEl.innerHTML = `
          ${renderNavbar('products')}
          <main class="main-content">${renderProductsPage(products)}</main>
        `;
        setupNavbarEvents();
        setupProductsEvents();
        break;
      }

      case 'pricing':
      case 'pricing-rules': {
        this.showLoading();
        const priceLists = await loadPricing();
        this.appEl.innerHTML = `
          ${renderNavbar('pricing')}
          <main class="main-content">${renderPricingPage(priceLists)}</main>
        `;
        setupNavbarEvents();
        setupPricingEvents();
        break;
      }

      case 'customers': {
        this.showLoading();
        const customers = await loadCustomers();
        this.appEl.innerHTML = `
          ${renderNavbar('customers')}
          <main class="main-content">${renderCustomersPage(customers)}</main>
        `;
        setupNavbarEvents();
        setupCustomersEvents();
        break;
      }

      case 'portal': {
        this.showLoading();
        const dealId = param || query.get('id');
        const data = await loadCustomerPortal(dealId);
        this.appEl.innerHTML = `
          ${renderNavbar('portal')}
          <main class="main-content">${renderCustomerPortalPage(data)}</main>
        `;
        setupNavbarEvents();
        setupCustomerPortalEvents(data.quotation);
        break;
      }

      case 'fulfillment': {
        this.showLoading();
        if (param) {
          const data = await loadFulfillmentDetail(param);
          this.appEl.innerHTML = `${renderNavbar('fulfillment')}<main class="main-content">${renderFulfillmentDetailPage(data)}</main>`;
          setupNavbarEvents();
          setupFulfillmentDetailEvents(param);
        } else {
          const data = await loadFulfillment();
          this.appEl.innerHTML = `${renderNavbar('fulfillment')}<main class="main-content">${renderFulfillmentPage(data)}</main>`;
          setupNavbarEvents();
          setupFulfillmentEvents();
        }
        break;
      }

      case 'fulfillment-override': {
        this.showLoading();
        const quote = await loadManualOverride(param);
        this.appEl.innerHTML = `${renderNavbar('fulfillment')}<main class="main-content">${renderManualOverridePage(quote)}</main>`;
        setupNavbarEvents();
        setupManualOverrideEvents(param);
        break;
      }

      case 'invoices': {
        if (param) {
          // Invoice detail page: #/invoices/:id
          this.showLoading();
          const inv = await loadInvoiceDetail(param);
          this.appEl.innerHTML = `
            ${renderNavbar('invoices')}
            <main class="main-content">${renderInvoiceDetailPage(inv)}</main>
          `;
          setupNavbarEvents();
          setupInvoiceDetailEvents(inv);
        } else {
          // Invoice list page: #/invoices
          this.showLoading();
          const invoices = await loadInvoices();
          this.appEl.innerHTML = `
            ${renderNavbar('invoices')}
            <main class="main-content">${renderInvoicesPage(invoices)}</main>
          `;
          setupNavbarEvents();
          setupInvoicesEvents();
        }
        break;
      }

      case 'subscriptions': {
        this.showLoading();
        if (param) {
          const detail = await loadSubscriptionDetail(param);
          this.appEl.innerHTML = `${renderNavbar('subscriptions')}<main class="main-content">${renderSubscriptionDetailPage(detail)}</main>`;
          setupNavbarEvents();
          setupSubscriptionDetailEvents(detail);
        } else {
          const plans = await loadSubscriptions();
          this.appEl.innerHTML = `${renderNavbar('subscriptions')}<main class="main-content">${renderSubscriptionsPage(plans)}</main>`;
          setupNavbarEvents();
          setupSubscriptionsEvents();
        }
        break;
      }

      case 'reports': {
        this.showLoading();
        const data = await loadReports();
        this.appEl.innerHTML = `
          ${renderNavbar('reports')}
          <main class="main-content">${renderReportsPage(data)}</main>
        `;
        setupNavbarEvents();
        setupReportsEvents();
        break;
      }

      default: {
        window.location.hash = '#/dashboard';
        break;
      }
    }
  }
}
