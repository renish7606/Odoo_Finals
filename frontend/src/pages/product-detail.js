/**
 * DealFlow360 Product Detail / New Product Page
 * Connected to `/api/v1/products` and `/api/v1/products/:id/variants`.
 */
import { api } from '../api.js';

export async function loadProductDetail(productId) {
  if (!productId || productId === 'new') {
    return { product: null, variants: [] };
  }
  try {
    const products = await api.get('/products');
    const product = Array.isArray(products) ? products.find(p => String(p.id) === String(productId)) : null;
    let variants = [];
    if (product) {
      try {
        variants = await api.get(`/products/${productId}/variants`);
      } catch { variants = []; }
    }
    return { product, variants: Array.isArray(variants) ? variants : [] };
  } catch {
    return { product: null, variants: [] };
  }
}

export function renderProductDetailPage(data) {
  const { product, variants } = data;
  const isNew = !product;
  const name = product?.name || '';
  const category = product?.category || '';
  const basePrice = product?.base_price || '';
  const unit = product?.unit || '';
  const description = product?.description || '';
  const taxRate = product?.tax_rate || '';
  const isSubscription = false;
  const quantityOnHand = '';

  const variantGroups = {};
  (variants || []).forEach(v => {
    if (!variantGroups[v.attribute_name]) {
      variantGroups[v.attribute_name] = { values: [], extraPrices: [] };
    }
    variantGroups[v.attribute_name].values.push(v.value);
    variantGroups[v.attribute_name].extraPrices.push(Number(v.extra_price || 0));
  });

  const variantRowsHtml = Object.keys(variantGroups).length > 0
    ? Object.entries(variantGroups).map(([attr, vData]) => {
        const valuesStr = vData.values.join(', ');
        const priceStrs = vData.extraPrices.map(p => p === 0 ? '0' : `+$${p}`);
        const uniquePrices = [...new Set(priceStrs)];
        return `
          <tr>
            <td class="font-bold text-on-surface">${attr}</td>
            <td class="text-on-surface-variant">${valuesStr}</td>
            <td class="text-on-surface-variant font-mono text-primary">${uniquePrices.join('/')}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="3" class="text-center py-6 text-on-surface-variant text-sm">No variants added yet</td></tr>';

  return `
    <div class="page-container space-y-6">
      <!-- Back link & Title -->
      <div>
        <a href="#/products" class="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline mb-2" style="text-decoration:none">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Back to Products
        </a>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">${isNew ? 'New Product' : 'Product and pricelist'}</h1>
      </div>

      <!-- General Info -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">General Info</span>
        
        <div class="card card-extruded">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <!-- Left Column -->
            <div class="space-y-4">
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Product name</label>
                <input type="text" id="pd-name" class="input-clay w-full" value="${name}" placeholder="Enter product name" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Category</label>
                <input type="text" id="pd-category" class="input-clay w-full" value="${category}" placeholder="e.g. Hardware, Services" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Price</label>
                <input type="number" id="pd-price" class="input-clay w-full font-mono" value="${basePrice}" placeholder="0.00" step="0.01" min="0" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Unit</label>
                <input type="text" id="pd-unit" class="input-clay w-full" value="${unit}" placeholder="e.g. Each, License" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Description</label>
                <input type="text" id="pd-description" class="input-clay w-full" value="${description}" placeholder="Product description" />
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="space-y-4">
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Tax %</label>
                <input type="number" id="pd-tax" class="input-clay w-full font-mono" value="${taxRate}" placeholder="0" step="0.01" min="0" />
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Subscription</label>
                <div class="flex items-center gap-3">
                  <select id="pd-subscription" class="input-clay" style="width: 100px;">
                    <option value="no" ${!isSubscription ? 'selected' : ''}>No</option>
                    <option value="yes" ${isSubscription ? 'selected' : ''}>Yes</option>
                  </select>
                  <span class="text-xs text-on-surface-variant italic">If yes, recurring will be visible</span>
                </div>
              </div>
              
              <div id="recurring-group" style="display:none; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Recurring</label>
                <select id="pd-recurring" class="input-clay" style="max-width: 200px;">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Quantity</label>
                <div class="flex items-center gap-3">
                  <input type="number" id="pd-qty" class="input-clay font-mono" style="width: 100px;" value="${quantityOnHand}" placeholder="0" min="0" step="1" />
                  <span class="text-xs text-on-surface-variant italic">(Integer field)</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Product Variants -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Product Variants</span>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Values</th>
                  <th>Extra price</th>
                </tr>
              </thead>
              <tbody>
                ${variantRowsHtml}
              </tbody>
            </table>
            ${!isNew ? `
            <div class="bg-surface-container-low flex items-center gap-3" style="padding: 1rem; border-top: 1px solid var(--color-surface-container-high);">
              <input type="text" id="new-attr-name" class="input-clay" style="flex:1" placeholder="Attribute (e.g. Color)" />
              <input type="text" id="new-attr-value" class="input-clay" style="flex:1" placeholder="Value (e.g. Blue)" />
              <input type="number" id="new-attr-price" class="input-clay font-mono" style="width: 120px" placeholder="Extra price" step="0.01" min="0" value="0" />
              <button type="button" class="btn btn-secondary" id="btn-add-variant" style="padding: 0.5rem 1.5rem">+ Add</button>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Pricelists -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Pricelists</span>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Currency</th>
                  <th>Price Rule</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-bold text-on-surface">Bronze</td>
                  <td class="text-on-surface-variant">USD</td>
                  <td class="text-on-surface-variant">Price, no adjustment</td>
                </tr>
                <tr>
                  <td class="font-bold text-on-surface">Gold</td>
                  <td class="text-on-surface-variant">USD/EUR</td>
                  <td class="text-on-surface-variant">Price minus 10 percent base</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Product details should be filled. ${!isNew ? 'Recurring order with this product will be invoiced at the beginning of the period.' : ''}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pb-8">
        <button type="button" class="btn btn-primary" id="btn-save-product" style="padding: 0.6rem 2rem;">
          <span class="material-symbols-outlined text-base">save</span>
          <span>${isNew ? 'Create Product' : 'Save Changes'}</span>
        </button>
        <a href="#/products" class="btn btn-secondary" style="padding: 0.6rem 2rem; text-decoration:none;">Cancel</a>
      </div>
    </div>
  `;
}

export function setupProductDetailEvents(productId) {
  const subSelect = document.getElementById('pd-subscription');
  const recurringGroup = document.getElementById('recurring-group');
  if (subSelect && recurringGroup) {
    const toggle = () => {
      recurringGroup.style.display = subSelect.value === 'yes' ? 'grid' : 'none';
    };
    subSelect.addEventListener('change', toggle);
    toggle();
  }

  const addVariantBtn = document.getElementById('btn-add-variant');
  if (addVariantBtn && productId && productId !== 'new') {
    addVariantBtn.addEventListener('click', async () => {
      const attrName = document.getElementById('new-attr-name')?.value?.trim();
      const attrValue = document.getElementById('new-attr-value')?.value?.trim();
      const extraPrice = parseFloat(document.getElementById('new-attr-price')?.value) || 0;
      if (!attrName || !attrValue) {
        alert('Please fill in attribute name and value.');
        return;
      }
      addVariantBtn.disabled = true;
      try {
        await api.post(`/products/${productId}/variants`, {
          attribute_name: attrName,
          value: attrValue,
          extra_price: extraPrice,
        });
        window.location.hash = `#/product-detail/${productId}`;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } catch (err) {
        alert(err.message || 'Failed to add variant');
        addVariantBtn.disabled = false;
      }
    });
  }

  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const name = document.getElementById('pd-name')?.value?.trim();
      const category = document.getElementById('pd-category')?.value?.trim();
      const price = parseFloat(document.getElementById('pd-price')?.value) || 0;
      const unit = document.getElementById('pd-unit')?.value?.trim();
      const taxRate = parseFloat(document.getElementById('pd-tax')?.value) || 0;
      const description = document.getElementById('pd-description')?.value?.trim() || null;

      if (!name || !category || !unit) {
        alert('Please fill in product name, category, and unit.');
        return;
      }

      const payload = {
        name,
        category,
        base_price: price,
        unit,
        tax_rate: taxRate,
        description,
      };

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-lg">hourglass_top</span><span>Saving...</span>';

      try {
        if (!productId || productId === 'new') {
          const created = await api.post('/products', payload);
          window.location.hash = `#/product-detail/${created.id}`;
        } else {
          try {
            await api.put(`/products/${productId}`, payload);
          } catch {}
          window.location.hash = '#/products';
        }
      } catch (err) {
        alert(err.message || 'Failed to save product');
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span class="material-symbols-outlined text-lg">save</span><span>${!productId || productId === 'new' ? 'Create Product' : 'Save Changes'}</span>`;
      }
    });
  }
}
