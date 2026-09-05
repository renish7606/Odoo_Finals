/**
 * DealFlow360 Quotations List Page
 * Connected to `/api/v1/quotations`.
 */
import { api } from '../api.js';

export function renderQuotationsPage(quotations = []) {
  const totalValue = quotations.reduce((acc, q) => acc + (q.total_amount || 0), 0);
  const pendingCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('pending')).length;

  const rowsHtml = quotations.length === 0
    ? `
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found. Click <strong>New Quotation +</strong> to generate your first deal.
        </td>
      </tr>
    `
    : quotations.map((q) => {
        let statusClass = 'badge-primary';
        const st = (q.status || '').toLowerCase();
        if (st.includes('approved')) statusClass = 'badge-success';
        else if (st.includes('pending') || st.includes('review')) statusClass = 'badge-warning';
        else if (st.includes('negotiat')) statusClass = 'badge-info';
        else if (st.includes('fulfilled') || st.includes('confirmed')) statusClass = 'badge-success';
        else if (st.includes('rejected')) statusClass = 'badge-error';
        else if (st.includes('draft')) statusClass = 'badge-neutral';

        return `
          <tr class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40">
            <td class="py-3 px-4 font-mono font-bold text-xs text-primary">
              <a href="#/quotations/${q.id}" class="hover:underline">${q.deal_reference || `DEAL-${q.id}`}</a>
            </td>
            <td class="py-3 px-4">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">${q.customer_name || 'Customer'}</span>
                <span class="text-[10px] text-on-surface-variant">${q.customer_email || ''}</span>
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="badge badge-neutral text-[10px]">${q.customer_tier || 'Bronze'}</span>
            </td>
            <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">
              ₹${Number(q.total_amount || 0).toLocaleString('en-IN')}
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${q.line_count || (q.lines ? q.lines.length : 0)} items
            </td>
            <td class="py-3 px-4">
              <span class="badge ${statusClass}">${q.status || 'Draft'}</span>
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${q.rep_name || 'Eleanor Vance'}
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <a href="#/quotations/${q.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Edit / View Deal">
                  <span class="material-symbols-outlined text-sm">edit_note</span>
                  <span>View</span>
                </a>
                <a href="#/portal?id=${q.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal View">
                  <span class="material-symbols-outlined text-sm">open_in_browser</span>
                </a>
              </div>
            </td>
          </tr>
        `;
      }).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">CPQ Orchestration Engine</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Quotations &amp; Contracts</h1>
          <p class="text-xs text-on-surface-variant">Manage enterprise proposals, pricing escalations, and automated approval routings</p>
        </div>

        <div class="flex items-center gap-2.5">
          <a href="#/quotation-detail" class="btn btn-primary text-xs" id="btn-create-quote">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>New Quotation +</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Active Pipeline Value</span>
            <div class="text-xl font-bold text-on-surface mt-1">₹${Number(totalValue).toLocaleString('en-IN')}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">monetization_on</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Documents</span>
            <div class="text-xl font-bold text-on-surface mt-1">${quotations.length} Deals</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">folder_shared</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Pending Sign-off</span>
            <div class="text-xl font-bold text-tertiary mt-1">${pendingCount} Deals</div>
          </div>
          <div class="icon-circle bg-tertiary-container/40">
            <span class="material-symbols-outlined text-tertiary text-lg">pending_actions</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card card-extruded">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-surface-container-high/60">
          <div class="flex flex-wrap items-center gap-1.5" id="quote-filter-tabs">
            <button type="button" class="btn btn-secondary text-xs py-1 px-3 active" data-filter="all">All</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Draft">Draft</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Pending Approval">Pending</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Approved">Approved</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Under Negotiation">Negotiation</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Fulfilled">Fulfilled</button>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              id="quote-search-input"
              class="input-clay text-xs py-1.5 px-3 w-48"
              placeholder="Search ref or customer..."
            />
          </div>
        </div>

        <!-- Quotations Table -->
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="quotations-table">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Reference</th>
                <th class="py-2.5 px-4">Customer Account</th>
                <th class="py-2.5 px-4">Tier</th>
                <th class="py-2.5 px-4">Contract Value</th>
                <th class="py-2.5 px-4">Lines</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4">Rep</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export async function loadQuotations() {
  try {
    return await api.get('/quotations');
  } catch (err) {
    return [];
  }
}

export function setupQuotationsEvents() {
  const searchInput = document.getElementById('quote-search-input');
  const table = document.getElementById('quotations-table');

  if (searchInput && table) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  const tabs = document.querySelectorAll('#quote-filter-tabs button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          const text = row.textContent;
          row.style.display = text.includes(filter) ? '' : 'none';
        }
      });
    });
  });
}
