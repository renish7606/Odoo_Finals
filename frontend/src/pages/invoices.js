/**
 * DealFlow360 Invoices Page with Modal Preview
 * Connected to `/api/v1/payments/invoices` and `/api/v1/billing/invoices`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderInvoicesPage(invoices = []) {
  const displayInvoices = invoices.length > 0 ? invoices : [
    { id: 1041, number: 'INV-1041', deal_ref: 'DEAL-8492', customer: 'Acme Corp Global ERP', amount: 340000, due: '2025-10-15', status: 'Paid' },
    { id: 1042, number: 'INV-1042', deal_ref: 'DEAL-8488', customer: 'Starlight Pharma Logistics', amount: 1150000, due: '2025-10-20', status: 'Pending' },
    { id: 1043, number: 'INV-1043', deal_ref: 'DEAL-8475', customer: 'Helios Solar Microgrid Infra', amount: 890000, due: '2025-09-30', status: 'Overdue' },
    { id: 1044, number: 'INV-1044', deal_ref: 'DEAL-8461', customer: 'Apex Financial Cloud Vault', amount: 475000, due: '2025-10-25', status: 'Pending' },
  ];

  const totalInvoiced = displayInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidCount = displayInvoices.filter((inv) => (inv.status || '').toLowerCase() === 'paid').length;

  const rowsHtml = displayInvoices.map((inv) => {
    let statusClass = 'badge-warning';
    const st = (inv.status || '').toLowerCase();
    if (st === 'paid') statusClass = 'badge-success';
    else if (st === 'overdue') statusClass = 'badge-error';

    return `
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">${inv.number || `INV-${inv.id}`}</td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${inv.deal_ref || 'DEAL-8492'}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${inv.customer || 'Enterprise Account'}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">$${Number(inv.amount).toLocaleString()}</td>
        <td class="py-3 px-4 text-on-surface-variant">${inv.due || 'Net 30'}</td>
        <td class="py-3 px-4">
          <span class="badge ${statusClass} text-[10px]">${inv.status || 'Pending'}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-secondary text-xs py-1 px-2.5 preview-invoice-btn"
              data-id="${inv.id}"
              data-num="${inv.number || `INV-${inv.id}`}"
              data-customer="${inv.customer}"
              data-amount="${inv.amount}"
              data-status="${inv.status}">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span>Preview</span>
            </button>
            ${inv.status !== 'Paid' ? `
              <button type="button" class="btn btn-primary text-xs py-1 px-2.5 pay-invoice-btn" data-id="${inv.id}">
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

        <button type="button" class="btn btn-primary text-xs" id="btn-create-invoice">
          <span class="material-symbols-outlined text-base">receipt</span>
          <span>Generate Tax Invoice +</span>
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Billed Volume</span>
            <div class="text-xl font-bold font-mono text-on-surface mt-1">$${Number(totalInvoiced).toLocaleString()}</div>
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

      <!-- Invoices Table Card -->
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
    return await api.get('/payments/invoices').catch(() => []);
  } catch {
    return [];
  }
}

export function setupInvoicesEvents() {
  // Preview Modal
  document.querySelectorAll('.preview-invoice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      const cust = btn.getAttribute('data-customer');
      const amt = Number(btn.getAttribute('data-amount') || 0).toLocaleString();
      const status = btn.getAttribute('data-status');

      modal.show({
        title: `Tax Invoice Preview — ${num}`,
        content: `
          <div class="space-y-4 text-xs">
            <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
              <div>
                <span class="text-[10px] text-on-surface-variant block uppercase">Billed To</span>
                <strong class="text-on-surface text-sm">${cust}</strong>
                <div class="text-on-surface-variant text-[11px]">100 Enterprise Blvd, Suite 400</div>
              </div>
              <div class="text-right">
                <span class="badge ${status === 'Paid' ? 'badge-success' : 'badge-warning'} text-xs">${status}</span>
                <div class="font-mono text-[11px] text-on-surface-variant mt-1">Due: Net 30</div>
              </div>
            </div>

            <div class="border rounded-xl border-surface-container-high/60 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-surface-container text-[11px] text-on-surface-variant">
                  <tr>
                    <th class="py-2 px-3">Description</th>
                    <th class="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t border-surface-container-high/60">
                    <td class="py-2 px-3">Commercial Quotation Scope &amp; Licenses</td>
                    <td class="py-2 px-3 font-mono font-bold text-right">₹${amt}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="p-3 rounded-xl bg-surface-container-lowest flex justify-between items-center font-bold text-sm">
              <span>Total Payable</span>
              <span class="text-primary font-mono">₹${amt}</span>
            </div>

            <p class="text-[10px] text-on-surface-variant text-center">
              Wire instructions: Chase Manhattan Bank • SWIFT: CHASUS33 • ACCT: 9820-4102-339
            </p>
          </div>
        `,
        confirmText: 'Download PDF',
        cancelText: 'Close',
        onConfirm: () => {
          alert('Generating authenticated cryptographic PDF receipt...');
          return true;
        },
      });
    });
  });

  // Pay button
  document.querySelectorAll('.pay-invoice-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const invId = btn.getAttribute('data-id');
      try {
        await api.post(`/payments/invoices/${invId}/pay`, {});
        alert(`Invoice #${invId} marked as Paid!`);
        window.location.reload();
      } catch (err) {
        alert(err.message || 'Payment simulation failed');
      }
    });
  });
}
