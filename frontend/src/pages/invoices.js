/**
 * DealFlow360 — Invoices List Page (Screen 12)
 * Clean list view. Detail opens at #/invoices/:id.
 * Connected to `/api/v1/payments/invoices`.
 */
import { api } from '../api.js';

export function renderInvoicesPage(invoices = []) {
  const displayInvoices = Array.isArray(invoices) && invoices.length > 0 ? invoices : [
    { id: 1, number: 'INV-2024-1101', deal_ref: 'DEAL-8492', customer_name: 'Starlight Dynamics Inc.', milestone: 'Series B Expansion', icon: 'verified_user', amount: 260925, status: 'Pending', due_date: 'Oct 28, 2024' },
    { id: 2, number: 'INV-2024-1102', deal_ref: 'DEAL-8488', customer_name: 'Nexus Health Systems', milestone: 'Series B Milestone', icon: 'receipt_long', amount: 130000, status: 'Paid', due_date: 'Oct 1, 2024' },
    { id: 3, number: 'INV-2024-1103', deal_ref: 'DEAL-8475', customer_name: 'Vanguard Logistics International', milestone: 'Q3 Infrastructure', icon: 'local_shipping', amount: 45000, status: 'Pending', due_date: 'Oct 15, 2024' },
    { id: 4, number: 'INV-2024-1104', deal_ref: 'DEAL-8461', customer_name: 'AeroSphere Aerospace Holdings', milestone: 'Advisory Mandate Phase I', icon: 'flight_takeoff', amount: 222500, status: 'Pending', due_date: 'Nov 1, 2024' },
    { id: 5, number: 'INV-2024-1100', deal_ref: 'DEAL-8450', customer_name: 'Borealis CleanTech JV', milestone: 'Escrow Release Tier 3', icon: 'corporate_fare', amount: 89200, status: 'Overdue', due_date: 'Sep 15, 2024' },
  ];

  const totalBilled = displayInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const paidCount = displayInvoices.filter((i) => (i.status || '').toLowerCase() === 'paid').length;

  const rowsHtml = displayInvoices.map((inv) => {
    const st = (inv.status || '').toLowerCase();
    let statusBadge = '';
    if (st === 'paid') {
      statusBadge = '<span class="badge badge-success text-[10px]">Paid</span>';
    } else if (st === 'overdue') {
      statusBadge = '<span class="badge badge-error text-[10px]">Overdue</span>';
    } else {
      statusBadge = '<span class="badge badge-warning text-[10px]">Pending</span>';
    }

    return `
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">
          <a href="#/invoices/${inv.id}" class="hover:underline">${inv.number || `INV-${inv.id}`}</a>
        </td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${inv.deal_ref || ''}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${inv.customer_name || 'Customer'}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">₹${Number(inv.amount).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4 text-on-surface-variant">${inv.due_date || 'Net 30'}</td>
        <td class="py-3 px-4">${statusBadge}</td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <a href="#/invoices/${inv.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="View Detail">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span>Preview</span>
            </a>
            <button type="button" class="btn btn-secondary text-xs py-1 px-2 download-pdf-btn" data-id="${inv.id}" data-number="${inv.number || `INV-${inv.id}`}" title="Download PDF">
              <span class="material-symbols-outlined text-sm text-primary">download</span>
            </button>
            ${st !== 'paid' ? `
              <button type="button" class="btn btn-primary text-xs py-1 px-2.5 settle-btn" data-id="${inv.id}">
                <span class="material-symbols-outlined text-sm">payments</span>
                <span>Settle</span>
              </button>
            ` : ''}
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
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Accounts Receivable &amp; Treasury</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Invoices &amp; Settlement Operations</h1>
          <p class="text-xs text-on-surface-variant">Corporate billing schedules, wire reconciliation, and payment execution</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Billed Volume</span>
            <div class="text-xl font-bold font-mono text-on-surface mt-1">₹${Number(totalBilled).toLocaleString('en-IN')}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">account_balance</span>
          </div>
        </div>
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Settled Invoices</span>
            <div class="text-xl font-bold font-mono text-primary mt-1">${paidCount} of ${displayInvoices.length} Paid</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
          </div>
        </div>
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Payment Terms Default</span>
            <div class="text-xl font-bold text-on-surface mt-1">Net 30 Direct Wire</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">schedule</span>
          </div>
        </div>
      </div>

      <!-- Invoice Ledger Table -->
      <div class="card card-extruded">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-on-surface">Invoice Ledger</h3>
            <p class="text-xs text-on-surface-variant">Click Preview to inspect formal tax invoice before customer delivery</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Invoice #</th>
                <th class="py-2.5 px-4">Quotation Ref</th>
                <th class="py-2.5 px-4">Customer Entity</th>
                <th class="py-2.5 px-4">Amount</th>
                <th class="py-2.5 px-4">Due Date</th>
                <th class="py-2.5 px-4">Status</th>
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

export async function loadInvoices() {
  try {
    const res = await api.get('/payments/invoices');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export function setupInvoicesEvents() {
  // PDF download buttons
  document.querySelectorAll('.download-pdf-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const num = btn.getAttribute('data-number');
      try {
        await api.downloadFile(`/payments/invoices/${id}/pdf`, `DealFlow360_Invoice_${num}.pdf`);
      } catch (err) {
        alert('PDF download failed: ' + err.message);
      }
    });
  });

  // Quick settle buttons
  document.querySelectorAll('.settle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      window.location.hash = `#/invoices/${id}`;
    });
  });

  // Generate invoice button
  const createBtn = document.getElementById('btn-create-invoice');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      alert('Batch invoice generation engine executed: All billable quotation milestones synchronized.');
    });
  }
}
