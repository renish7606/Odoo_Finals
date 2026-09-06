/**
 * DealFlow360 Quotations Kanban (List) View
 * Matches exact wireframe design in screenshot: 5 columns (Draft, Pending Approval, Approved, Negotiation, Confirmed).
 */
import { api } from '../api.js';
import { auth } from '../auth.js';

export function renderQuotationsPage(quotations = [], viewScope = 'my', displayMode = 'kanban') {
  const user = auth.getUser() || { full_name: 'User', role: 'SalesRep' };

  // 5 Kanban Columns matching the wireframe
  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Draft',
      match: (st) => st.includes('draft'),
    },
    {
      id: 'pending',
      title: 'Pending Approval',
      match: (st) => st.includes('pending') || st.includes('review'),
    },
    {
      id: 'approved',
      title: 'Approved',
      match: (st) => st.includes('approved'),
    },
    {
      id: 'negotiation',
      title: 'Negotiation',
      match: (st) => st.includes('negotiat') || st.includes('sent'),
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      match: (st) => st.includes('confirmed') || st.includes('fulfilled'),
    },
  ];

  // Render a clean card for a quotation matching screenshot format: "Customer Name - $Amount"
  const renderKanbanCard = (q) => {
    const formattedAmount = Number(q.total_amount || 0).toLocaleString('en-IN');
    return `
      <div 
        class="quote-card card card-extruded border border-outline-variant/60 rounded-2xl p-4 cursor-pointer hover:border-primary transition-all space-y-1.5"
        onclick="window.location.hash='#/quotations/${q.id}'"
        data-ref="${(q.deal_reference || '').toLowerCase()}" 
        data-customer="${(q.customer_name || '').toLowerCase()}" 
        data-rep="${(q.rep_name || '').toLowerCase()}"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-on-surface">${q.customer_name || 'Customer'} - ₹${formattedAmount}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
          <span>${q.deal_reference || `DEAL-${q.id}`}</span>
          <span>${q.line_count || (q.lines ? q.lines.length : 0)} items</span>
        </div>
      </div>
    `;
  };

  // Build Kanban 5-column grid
  const kanbanColumnsHtml = kanbanColumns.map((col) => {
    const colQuotes = quotations.filter((q) => col.match((q.status || '').toLowerCase()));
    const cardsHtml = colQuotes.length === 0
      ? `<div class="p-4 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl">Empty</div>`
      : colQuotes.map(renderKanbanCard).join('');

    return `
      <div class="card card-extruded border border-outline-variant/60 rounded-2xl p-4 flex flex-col min-h-[380px] space-y-4 bg-surface-container-low/40">
        <!-- Column Header -->
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-2">
          <h3 class="font-bold text-sm text-on-surface">${col.title}</h3>
          <span class="badge badge-neutral text-xs font-bold font-mono">${colQuotes.length}</span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          ${cardsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Table view fallback
  const rowsHtml = quotations.length === 0
    ? `
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found for <strong>${user.full_name || 'your account'}</strong>.
        </td>
      </tr>
    `
    : quotations.map((q) => `
        <tr 
          class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40 cursor-pointer"
          onclick="window.location.hash='#/quotations/${q.id}'"
        >
          <td class="py-3 px-4 font-mono font-bold text-xs text-primary">${q.deal_reference || `DEAL-${q.id}`}</td>
          <td class="py-3 px-4 text-xs font-bold text-on-surface">${q.customer_name || 'Customer'}</td>
          <td class="py-3 px-4"><span class="badge badge-neutral text-[10px]">${q.customer_tier || 'Bronze'}</span></td>
          <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">₹${Number(q.total_amount || 0).toLocaleString('en-IN')}</td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${q.line_count || (q.lines ? q.lines.length : 0)} items</td>
          <td class="py-3 px-4"><span class="badge badge-primary text-xs">${q.status || 'Draft'}</span></td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${q.rep_name || 'Sales Rep'}</td>
          <td class="py-3 px-4 text-right">
            <a href="#/quotations/${q.id}" class="btn btn-secondary text-xs py-1 px-2.5">View</a>
          </td>
        </tr>
      `).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Title & Subtitle Matching Screenshot -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Quotations (List)</h1>
          <p class="text-xs text-on-surface-variant mt-1">Every quotation in the system, one row per quotation, click a row to open it</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- My vs All Scope Toggle -->
          <div class="flex items-center bg-surface-container p-1 rounded-xl border border-surface-container-high/60" id="quote-scope-toggle">
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${viewScope === 'my' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-scope="my">My Quotations</button>
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${viewScope === 'all' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-scope="all">All Workspace Deals</button>
          </div>
        </div>
      </div>

      <!-- Main Kanban Grid vs Table -->
      ${displayMode === 'kanban' ? `
        <!-- 5 Kanban Columns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" id="kanban-container">
          ${kanbanColumnsHtml}
        </div>
      ` : `
        <!-- Table View -->
        <div class="card card-extruded" id="table-container">
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
                  <th class="py-2.5 px-4">Assigned Rep</th>
                  <th class="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `}

      <!-- Bottom Actions Bar Matching Screenshot (+ New Quotation, Switch to Table/Kanban View) -->
      <div class="flex items-center gap-3 pt-2">
        <a href="#/quotation-detail" class="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2" id="btn-create-quote">
          <span class="material-symbols-outlined text-base">add</span>
          <span>+ New Quotation</span>
        </a>

        <button type="button" class="btn btn-secondary text-xs font-bold px-5 py-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high/60 flex items-center gap-2" id="btn-mode-toggle" data-target-mode="${displayMode === 'kanban' ? 'table' : 'kanban'}">
          <span class="material-symbols-outlined text-base">${displayMode === 'kanban' ? 'table_rows' : 'view_kanban'}</span>
          <span>${displayMode === 'kanban' ? 'Switch to Table View' : 'Switch to Kanban View'}</span>
        </button>
      </div>
    </div>
  `;
}

export async function loadQuotations(myOnly = true) {
  try {
    return await api.get(`/quotations?my_only=${myOnly}`);
  } catch (err) {
    return [];
  }
}

export function setupQuotationsEvents(onScopeChange, onModeChange) {
  const scopeButtons = document.querySelectorAll('#quote-scope-toggle button');
  scopeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const scope = btn.getAttribute('data-scope');
      if (typeof onScopeChange === 'function') {
        onScopeChange(scope === 'my');
      }
    });
  });

  const modeBtn = document.getElementById('btn-mode-toggle');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      const targetMode = modeBtn.getAttribute('data-target-mode');
      if (typeof onModeChange === 'function') {
        onModeChange(targetMode);
      }
    });
  }
}
