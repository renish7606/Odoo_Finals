/**
 * DealFlow360 Pricing & Discounts Settings Page
 * Connected to `/api/v1/price-lists`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderPricingPage(priceLists = []) {
  const displayLists = priceLists.length > 0 ? priceLists : [
    { id: 1, name: 'Standard Enterprise Commercial', currency: 'INR', is_active: true, description: 'Default global commercial price schedule with standard volume discounts.' },
    { id: 2, name: 'Tier-1 Strategic Partner Rate Card', currency: 'INR', is_active: true, description: 'Discounted baseline for accredited M&A integration channels.' },
    { id: 3, name: 'Public Sector & FedRAMP Schedule', currency: 'INR', is_active: true, description: 'Statutory capped rate matrix for government and institutional accounts.' },
  ];

  const priceListRows = displayLists.map((pl) => `
    <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
      <td class="py-3 px-4 font-bold text-xs text-on-surface">${pl.name}</td>
      <td class="py-3 px-4 font-mono text-xs text-primary">${pl.currency || 'INR'}</td>
      <td class="py-3 px-4 text-xs text-on-surface-variant">${pl.description || 'Standard schedule'}</td>
      <td class="py-3 px-4">
        <span class="badge ${pl.is_active ? 'badge-success' : 'badge-neutral'} text-[10px]">
          ${pl.is_active ? 'Active' : 'Archived'}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button type="button" class="btn btn-secondary text-xs py-1 px-2.5">Edit Rules</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Discount Governance Matrix</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Pricing &amp; Discount Rules</h1>
          <p class="text-xs text-on-surface-variant">Customer tier allowances, category caps, and automated approval thresholds</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-add-pricelist">
          <span class="material-symbols-outlined text-base">add</span>
          New Price Schedule +
        </button>
      </div>

      <!-- 3 Governance Matrices from Wireframe -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Customer Tier Discounts -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-primary text-base">military_tech</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Customer Tier Allowances</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Bronze Tier</span>
              <span class="font-mono font-bold text-primary">5% Max Disc.</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Silver Tier</span>
              <span class="font-mono font-bold text-primary">10% Max Disc.</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Gold Tier</span>
              <span class="font-mono font-bold text-primary">15% Max Disc.</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Category Max Discounts -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-tertiary text-base">category</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Category Margin Protections</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Hardware Products</span>
              <span class="font-mono font-bold text-tertiary">20% Cap</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Software &amp; SaaS</span>
              <span class="font-mono font-bold text-tertiary">30% Cap</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Professional Services</span>
              <span class="font-mono font-bold text-tertiary">15% Cap</span>
            </div>
          </div>
        </div>

        <!-- Card 3: Escalation Threshold Routing -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-secondary text-base">rule</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Escalation Thresholds</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Within Category Limit</div>
              <div class="text-[11px] text-on-surface-variant mt-0.5">No approval needed • Auto-approved</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Over Limit / Tier Exception</div>
              <div class="text-[11px] text-error font-medium mt-0.5">Requires Sales Director sign-off</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Over Discretionary Ceiling</div>
              <div class="text-[11px] text-error font-medium mt-0.5">Sales Director then VP / Finance sign-off</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Lists Directory -->
      <div class="card card-extruded">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-on-surface">Master Price Schedules</h3>
            <p class="text-xs text-on-surface-variant">Active price books utilized across commercial quotation generators</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Price Schedule Name</th>
                <th class="py-2.5 px-4">Currency</th>
                <th class="py-2.5 px-4">Scope &amp; Description</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${priceListRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export async function loadPricing() {
  try {
    return await api.get('/price-lists');
  } catch {
    return [];
  }
}

export function setupPricingEvents() {
  const addBtn = document.getElementById('btn-add-pricelist');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      modal.show({
        title: 'New Commercial Price Schedule',
        content: `
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Schedule Name</label>
              <input id="pl-name-input" type="text" class="input-clay w-full" placeholder="e.g. EMEA Regional Partner Matrix" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Currency Code</label>
              <input id="pl-currency-input" type="text" class="input-clay w-full" value="INR" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Description</label>
              <input id="pl-desc-input" type="text" class="input-clay w-full" placeholder="Intended accounts or region" />
            </div>
          </div>
        `,
        confirmText: 'Create Schedule',
        onConfirm: async () => {
          const name = document.getElementById('pl-name-input').value.trim();
          const currency = document.getElementById('pl-currency-input').value.trim();
          const description = document.getElementById('pl-desc-input').value.trim();
          if (!name) throw new Error('Schedule name is required');
          await api.post('/price-lists', { name, currency, description });
          window.location.reload();
          return true;
        },
      });
    });
  }
}
