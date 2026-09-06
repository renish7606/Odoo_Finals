/**
 * DealFlow360 Product Catalog Page
 * Matches the wireframe: stats cards, table view, click-to-detail.
 * Uses the shared claymorphism design system.
 * Connected to `/api/v1/products`.
 */
import { api } from '../api.js';

export async function loadProducts() {
  try {
    const products = await api.get('/products');
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

export function renderProductsPage(products = []) {
  const displayProducts = products.length > 0 ? products : [];
  const activeCount = displayProducts.filter(p => p.is_active !== false).length;
  const archivedCount = displayProducts.filter(p => p.is_active === false).length;
  const categories = new Set(displayProducts.map(p => p.category));

  const rowsHtml = displayProducts.length === 0
    ? `
      <tr>
        <td colspan="7" class="text-center text-on-surface-variant" style="padding: 2rem;">
          No products found. Click <strong class="text-primary">+ New Product</strong> to add one.
        </td>
      </tr>
    `
    : displayProducts.map(p => {
      const price = Number(p.base_price || 0);
      const tax = Number(p.tax_rate || 0);
      const unit = p.unit || 'Each';
      const isActive = p.is_active !== false;
      const statusClass = isActive ? 'badge-success' : 'badge-error';
      const statusText = isActive ? 'Active' : 'Archived';

      return `
        <tr class="product-row" data-product-id="${p.id}" style="cursor:pointer">
          <td class="font-bold text-on-surface">${p.name}</td>
          <td>
            <span class="badge badge-neutral">${p.category || '-'}</span>
          </td>
          <td class="text-on-surface-variant">-</td>
          <td class="font-mono font-bold text-primary">$${price.toLocaleString()}</td>
          <td class="text-on-surface-variant">${unit}</td>
          <td class="text-on-surface-variant">${tax}%</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    }).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Product Catalog</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Product catalog</h1>
          <p class="text-sm text-on-surface-variant">Every product, variant and price list in one place.</p>
        </div>

        <div class="flex items-center gap-3">
          <button type="button" class="btn btn-primary" id="btn-new-product" style="padding: 0.6rem 1.5rem;">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>New Product</span>
          </button>
          <a href="#/pricing" class="btn btn-secondary" style="padding: 0.6rem 1.5rem; text-decoration:none;">
            <span class="material-symbols-outlined text-base">sell</span>
            <span>Manage Price fields</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Products</span>
            <div class="text-xl font-bold text-on-surface mt-1">${activeCount} active, ${archivedCount} archived</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">inventory_2</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Pricelists</span>
            <div class="text-xl font-bold text-on-surface mt-1">${categories.size} categories</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">list_alt</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Variants</span>
            <div class="text-xl font-bold text-on-surface mt-1">${displayProducts.length} SKUs</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">category</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Products</span>
        
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Tax</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Hint -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Click a product row to open general info, variants and tier/currency price lists.
        </p>
      </div>
    </div>
  `;
}

export function setupProductsEvents() {
  const newBtn = document.getElementById('btn-new-product');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      window.location.hash = '#/product-detail/new';
    });
  }

  document.querySelectorAll('.product-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-product-id');
      window.location.hash = `#/product-detail/${id}`;
    });
  });
}
