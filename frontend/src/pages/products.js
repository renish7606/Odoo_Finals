/**
 * DealFlow360 Product Catalog Page
 * Connected to `/api/v1/products`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderProductsPage(products = []) {
  const displayProducts = products.length > 0 ? products : [
    { id: 1, name: 'Enterprise Cloud Orchestration Node', sku: 'SKU-CLD-900', category: 'Cloud Infrastructure', base_price: 18500, description: 'High-throughput container runtime cluster with 99.99% uptime SLA.' },
    { id: 2, name: 'Quantum Edge Gateway Terminal', sku: 'SKU-HDW-410', category: 'Hardware', base_price: 45000, description: 'Ruggedized hardware cryptographic accelerator for zero-trust branch networks.' },
    { id: 3, name: 'Enterprise M&A CPQ Core Engine', sku: 'SKU-SFT-101', category: 'Software & SaaS', base_price: 120000, description: 'Complete dealflow, quotation rules, and multitenancy pricing engine.' },
    { id: 4, name: 'Architecture Consulting & Migration SLA', sku: 'SKU-SRV-050', category: 'Professional Services', base_price: 35000, description: 'Dedicated enterprise solutions architect team with 24/7 priority support.' },
    { id: 5, name: 'AI Compliance & Anomaly Sentinel', sku: 'SKU-SFT-202', category: 'Software & SaaS', base_price: 64000, description: 'Continuous transaction monitoring for antitrust, sanction, and margin slippage.' },
    { id: 6, name: 'High-Density Terabit Switch Blade', sku: 'SKU-HDW-880', category: 'Hardware', base_price: 82000, description: 'Carrier-grade spine switch with sub-microsecond packet latency.' },
  ];

  const cardsHtml = displayProducts.map((p) => `
    <div class="card card-extruded flex flex-col justify-between space-y-4 product-card" data-category="${p.category || 'All'}">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge-neutral font-mono text-[10px]">${p.sku || `SKU-${p.id}`}</span>
          <span class="badge badge-primary text-[10px]">${p.category || 'Standard'}</span>
        </div>
        <h3 class="text-sm font-bold text-on-surface line-clamp-2">${p.name}</h3>
        <p class="text-xs text-on-surface-variant mt-2 line-clamp-3">
          ${p.description || 'Configured for enterprise production environments with automated compliance telemetry.'}
        </p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">List Price</span>
          <span class="font-mono font-bold text-base text-primary">$${Number(p.base_price).toLocaleString()}</span>
        </div>
        <button type="button" class="btn btn-primary text-xs py-1.5 px-3 add-to-deal-btn" data-product-id="${p.id}" data-product-name="${p.name}">
          <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
          <span>Add to Deal</span>
        </button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="card card-extruded">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="max-w-2xl">
            <div class="flex items-center gap-2 mb-1">
              <span class="pulse-dot"></span>
              <span class="text-xs font-bold text-primary tracking-widest uppercase">SKU Catalog v4.9 • CPQ Synced</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">Product &amp; Service Master Catalog</h1>
            <p class="text-xs text-on-surface-variant mt-1">
              Configure master SKUs, rate cards, and billing recurrence units across commercial tiers with automated M&amp;A transaction governance.
            </p>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container">
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase">Active Multi-Tenancy</span>
              <div class="font-mono font-bold text-lg text-on-surface">1,489 SKUs</div>
            </div>
            <div class="h-8 w-px bg-outline-variant/50"></div>
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase">Avg Deal ACV</span>
              <div class="font-mono font-bold text-lg text-primary">₹184.2K</div>
            </div>
          </div>
        </div>

        <!-- Filter Chips & Search -->
        <div class="mt-4 pt-4 border-t border-surface-container-high/60 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5" id="product-category-filters">
            <button type="button" class="btn btn-secondary text-xs py-1 px-3 active" data-cat="all">All SKUs</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Hardware">Hardware</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Cloud Infrastructure">Cloud</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Software & SaaS">Software / SaaS</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Professional Services">Services</button>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              id="product-search-input"
              class="input-clay text-xs py-1.5 px-3 w-52"
              placeholder="Search SKU or name..."
            />
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="products-grid">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export async function loadProducts() {
  try {
    return await api.get('/products');
  } catch {
    return [];
  }
}

export function setupProductsEvents() {
  const searchInput = document.getElementById('product-search-input');
  const cards = document.querySelectorAll('.product-card');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  const filterBtns = document.querySelectorAll('#product-category-filters button');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      cards.forEach((card) => {
        if (cat === 'all') {
          card.style.display = '';
        } else {
          const cardCat = card.getAttribute('data-category');
          card.style.display = cardCat.includes(cat) ? '' : 'none';
        }
      });
    });
  });

  // Add to Deal button
  document.querySelectorAll('.add-to-deal-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const prodId = btn.getAttribute('data-product-id');
      const prodName = btn.getAttribute('data-product-name');

      modal.show({
        title: `Add ${prodName} to Quotation`,
        content: `
          <div class="space-y-3 text-xs">
            <p class="text-on-surface-variant">Configure quantity to append this SKU to an active deal:</p>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity Units</label>
              <input type="number" id="quick-add-qty" min="1" value="1" class="input-clay w-full" />
            </div>
          </div>
        `,
        confirmText: 'Generate Deal',
        onConfirm: async () => {
          const qty = parseFloat(document.getElementById('quick-add-qty').value) || 1;
          // Create draft quotation
          const newQ = await api.post('/quotations', { customer_id: 1 });
          await api.post(`/quotations/${newQ.id}/lines`, { product_id: parseInt(prodId, 10), quantity: qty });
          window.location.hash = `#/quotations/${newQ.id}`;
          return true;
        },
      });
    });
  });
}
