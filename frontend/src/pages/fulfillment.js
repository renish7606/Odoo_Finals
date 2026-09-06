import { api } from '../api.js';

const fallbackOrders = [
  { id: 1, deal_reference: 'DEAL-0001', customer_name: 'Bronze Buyer', status: 'Confirmed', line_count: 2, total_amount: 1300 },
  { id: 2, deal_reference: 'DEAL-0002', customer_name: 'Gold Buyer', status: 'Confirmed', line_count: 1, total_amount: 1500 },
];

export function renderFulfillmentPage(data = {}) {
  const warehouses = data.warehouses?.length ? data.warehouses : [
    { id: 1, name: 'Equinix NY4 North America Hub', code: 'WH-US-EAST', location: 'Secaucus, NJ' },
    { id: 2, name: 'Frankfurt FRA1 European Gateway', code: 'WH-EU-CENTRAL', location: 'Frankfurt, DE' },
  ];
  const orders = data.quotations?.length ? data.quotations.filter((quote) => quote.line_count > 0 && !['Fulfilled', 'Rejected'].includes(quote.status)) : fallbackOrders.filter((quote) => quote.line_count > 0);
  const warehouseHtml = warehouses.map((warehouse) => `<div class="card card-extruded"><div class="flex items-start justify-between"><span class="badge badge-primary font-mono text-[10px]">${warehouse.code || `WH-${warehouse.id}`}</span><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">warehouse</span></div></div><h3 class="text-sm font-bold mt-3">${warehouse.name}</h3><p class="text-xs text-on-surface-variant">${warehouse.location || 'Global Hub'}</p><div class="pt-2 mt-3 border-t border-surface-container-high/60 text-xs"><span class="text-on-surface-variant">Available stock</span><strong class="block text-primary">Live inventory view</strong></div></div>`).join('');
  const orderRows = orders.map((order) => `<a class="fulfillment-order-row" href="#/fulfillment/${order.id}"><div><strong class="block text-sm">${order.deal_reference || `DEAL-${String(order.id).padStart(4, '0')}`}</strong><span class="text-[11px] text-on-surface-variant">${order.customer_name || 'Customer entity'}</span></div><div><strong class="block text-sm">${order.line_count || 0} line items</strong><span class="text-[11px] text-on-surface-variant">${order.total_amount ? `₹${Number(order.total_amount).toLocaleString('en-IN')}` : 'Awaiting allocation'}</span></div><div><span class="badge badge-warning text-[10px]">Awaiting Fulfillment</span></div><span class="material-symbols-outlined text-on-surface-variant">chevron_right</span></a>`).join('');
  return `<div class="page-container space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Smart logistics &amp; warehousing</span></div><h1 class="text-2xl font-bold tracking-tight">Fulfillment &amp; Stock Allocation</h1><p class="text-xs text-on-surface-variant">Review awaiting orders, inspect stock coverage, and route each shipment.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-suggest-split"><span class="material-symbols-outlined text-base">auto_fix_high</span><span>Auto-Suggest Optimal Split</span></button></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${warehouseHtml}</div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Awaiting Fulfillment</h2><p class="text-xs text-on-surface-variant">Select an order to open its fulfillment detail and stock plan.</p></div><span class="badge badge-warning text-[10px]">${orders.length} pending</span></div><div class="space-y-2">${orderRows || '<p class="text-sm text-on-surface-variant py-6 text-center">No orders are awaiting fulfillment.</p>'}</div></section></div>`;
}

export async function loadFulfillment() { try { const [warehouses, quotations] = await Promise.all([api.get('/warehouses').catch(() => []), api.get('/quotations').catch(() => [])]); return { warehouses, quotations }; } catch { return { warehouses: [], quotations: [] }; } }

export function setupFulfillmentEvents() { document.getElementById('btn-suggest-split')?.addEventListener('click', () => alert('Open an awaiting order to calculate its live warehouse split.')); }
