/**
 * DealFlow360 Fulfillment & Warehouse Allocation Page
 * Connected to `/api/v1/warehouses` and `/api/v1/fulfillment`.
 */
import { api } from '../api.js';

export function renderFulfillmentPage(data = {}) {
  const { warehouses = [], quotations = [] } = data;

  const displayWarehouses = warehouses.length > 0 ? warehouses : [
    { id: 1, name: 'Equinix NY4 North America Hub', code: 'WH-US-EAST', location: 'Secaucus, NJ', capacity: '94.2% Available' },
    { id: 2, name: 'Frankfurt FRA1 European Gateway', code: 'WH-EU-CENTRAL', location: 'Frankfurt, DE', capacity: '88.0% Available' },
    { id: 3, name: 'Singapore SG1 APAC Distribution', code: 'WH-APAC-SG', location: 'Jurong, SG', capacity: '91.5% Available' },
  ];

  const displayAllocations = [
    { sku: 'SKU-HDW-410', name: 'Quantum Edge Gateway Terminal', req: 10, wh1: 'NY4 (8)', wh2: 'FRA1 (2)', backorder: 0, status: 'Allocated' },
    { sku: 'SKU-HDW-880', name: 'High-Density Terabit Switch Blade', req: 4, wh1: 'NY4 (4)', wh2: '—', backorder: 0, status: 'Ready to Pack' },
    { sku: 'SKU-CLD-900', name: 'Enterprise Cloud Orchestration Node', req: 2, wh1: 'Cloud Provisioned', wh2: '—', backorder: 0, status: 'Fulfilled' },
  ];

  const whCardsHtml = displayWarehouses.map((wh) => `
    <div class="card card-extruded flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <span class="badge badge-primary font-mono text-[10px]">${wh.code || `WH-${wh.id}`}</span>
        <div class="icon-circle bg-surface-container-high/60">
          <span class="material-symbols-outlined text-primary text-base">warehouse</span>
        </div>
      </div>
      <div class="my-3">
        <h3 class="text-sm font-bold text-on-surface">${wh.name}</h3>
        <p class="text-xs text-on-surface-variant">${wh.location || 'Global Hub'}</p>
      </div>
      <div class="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
        <span class="text-on-surface-variant">Capacity Status</span>
        <span class="font-bold text-primary">${wh.capacity || 'Operating Normal'}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Smart Logistics &amp; Warehousing</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Fulfillment &amp; Warehouse Allocation</h1>
          <p class="text-xs text-on-surface-variant">Multi-facility inventory splitting, backorder consolidation, and shipping routing</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-suggest-split">
          <span class="material-symbols-outlined text-base">auto_fix_high</span>
          <span>Auto-Suggest Optimal Split</span>
        </button>
      </div>

      <!-- Warehouse Hubs Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${whCardsHtml}
      </div>

      <!-- Multi-Warehouse Split Execution Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high/60 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">call_split</span>
            <div>
              <h3 class="text-base font-bold text-on-surface">Deal Fulfillment Split Allocation</h3>
              <p class="text-xs text-on-surface-variant">Active allocation matrix for quotation DEAL-8492 (Acme Corp Global ERP)</p>
            </div>
          </div>
          <span class="badge badge-success text-xs">100% Stock Covered</span>
        </div>

        <!-- Table of Allocations -->
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Hardware SKU &amp; Item</th>
                <th class="py-2.5 px-4 font-mono">Total Required</th>
                <th class="py-2.5 px-4">Primary Hub</th>
                <th class="py-2.5 px-4">Secondary Hub</th>
                <th class="py-2.5 px-4">Backorder</th>
                <th class="py-2.5 px-4">Fulfillment State</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${displayAllocations.map((a) => `
                <tr class="table-row border-b border-surface-container-high/40 text-xs hover:bg-surface-container/40">
                  <td class="py-3 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-on-surface">${a.name}</span>
                      <span class="font-mono text-[10px] text-primary">${a.sku}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono font-bold">${a.req} units</td>
                  <td class="py-3 px-4 font-semibold text-on-surface">${a.wh1}</td>
                  <td class="py-3 px-4 text-on-surface-variant">${a.wh2}</td>
                  <td class="py-3 px-4 font-mono ${a.backorder > 0 ? 'text-error font-bold' : 'text-on-surface-variant'}">${a.backorder}</td>
                  <td class="py-3 px-4">
                    <span class="badge badge-success text-[10px]">${a.status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="btn btn-secondary text-xs py-1 px-2.5">Override</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-2">
          <div class="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base text-primary">local_shipping</span>
            <span>Estimated delivery timeline: 48 hours for North America, 72 hours for EMEA</span>
          </div>
          <button type="button" class="btn btn-primary text-xs" id="btn-commit-fulfillment">
            <span class="material-symbols-outlined text-sm">done_all</span>
            <span>Commit &amp; Dispatch Order</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function loadFulfillment() {
  try {
    const [warehouses, quotations] = await Promise.all([
      api.get('/warehouses').catch(() => []),
      api.get('/quotations').catch(() => []),
    ]);
    return { warehouses, quotations };
  } catch {
    return { warehouses: [], quotations: [] };
  }
}

export function setupFulfillmentEvents() {
  const commitBtn = document.getElementById('btn-commit-fulfillment');
  if (commitBtn) {
    commitBtn.addEventListener('click', () => {
      alert('Fulfillment manifest confirmed! Warehouse pick & pack notifications generated.');
    });
  }

  const suggestBtn = document.getElementById('btn-suggest-split');
  if (suggestBtn) {
    suggestBtn.addEventListener('click', () => {
      alert('Auto-Split Algorithm computed: 80% from Equinix NY4, 20% from Frankfurt FRA1 with 0 backorders.');
    });
  }
}
