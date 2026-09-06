/**
 * DealFlow360 — Invoice Detail Page (Screen 13)
 * Separate page at #/invoices/:id showing full invoice detail.
 * Connected to `/api/v1/payments/invoices/:id`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderInvoiceDetailPage(inv) {
  if (!inv || !inv.id) {
    return `
      <div class="page-container flex items-center justify-center min-h-[60vh]">
        <div class="card card-extruded p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span>
          <h2 class="text-lg font-bold text-on-surface">Invoice Not Found</h2>
          <p class="text-xs text-on-surface-variant mt-1">The requested invoice could not be loaded.</p>
          <a href="#/invoices" class="btn btn-primary text-xs mt-4">← Back to Invoices</a>
        </div>
      </div>
    `;
  }

  const isPaid = (inv.status || '').toLowerCase() === 'paid';
  const lines = inv.lines || [];
  const subtotal = lines.reduce((acc, l) => acc + (Number(l.amount) || 0), 0) || Number(inv.amount) || 0;
  const tax = subtotal * 0.065;
  const total = subtotal + tax;
  const paymentsList = inv.payments || [];
  const totalPaid = paymentsList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, total - totalPaid);

  const statusBadge = isPaid
    ? '<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E9F3EC] text-[#3D6847] border border-[#C5E2CB]">Paid &amp; Reconciled</span>'
    : '<span class="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-primary">Pending Payment</span>';

  const linesHtml = lines.map((line, idx) => `
    <tr class="border-b border-surface-container-high/30 hover:bg-surface-container/30 transition-colors">
      <td class="py-3 px-4 text-xs text-on-surface-variant font-mono">${idx + 1}</td>
      <td class="py-3 px-4">
        <span class="text-xs font-bold text-on-surface">${line.description || 'Line Item'}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">${line.milestone || 'MILESTONE'}</span>
      </td>
      <td class="py-3 px-4 text-right font-mono text-xs text-on-surface font-bold">
        ₹${Number(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const paymentsHtml = paymentsList.length > 0 ? `
    <div class="card card-extruded space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
          <h3 class="text-sm font-bold text-on-surface">Payment Settlement History</h3>
        </div>
        <span class="badge badge-success text-[10px]">${paymentsList.length} Payment(s)</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] text-secondary uppercase tracking-wider border-b border-surface-container-high/40">
              <th class="py-2 px-4">Payment Ref</th>
              <th class="py-2 px-4">Date Credited</th>
              <th class="py-2 px-4 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsList.map((p) => `
              <tr class="border-b border-surface-container-high/20">
                <td class="py-2.5 px-4 font-mono text-xs font-bold text-on-surface">${p.reference || `PAY-${p.id}`}</td>
                <td class="py-2.5 px-4 text-xs text-on-surface-variant">${p.paid_at || 'Immediate'}</td>
                <td class="py-2.5 px-4 font-mono text-xs font-bold text-right text-[#3D6847]">₹${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  return `
    <div class="page-container space-y-6">
      <!-- Back Navigation -->
      <div class="flex items-center gap-3">
        <a href="#/invoices" class="btn btn-secondary text-xs py-1.5 px-3">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Invoices</span>
        </a>
        <div class="h-5 w-px bg-outline-variant/40"></div>
        <span class="text-xs text-on-surface-variant">Invoices</span>
        <span class="text-xs text-outline">/</span>
        <span class="text-xs font-bold font-mono text-primary">${inv.number || `INV-${inv.id}`}</span>
      </div>

      <!-- Invoice Header Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary" style="box-shadow: inset 2px 2px 4px rgba(168,181,160,0.25), inset -2px -2px 4px rgba(255,255,255,0.85);">
              <span class="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-bold text-on-surface tracking-tight">Tax Invoice</h1>
                <span class="font-mono text-base text-primary font-bold">#${inv.number || `INV-${inv.id}`}</span>
              </div>
              <div class="flex items-center gap-2 mt-1 text-xs">
                ${statusBadge}
                <span class="text-outline">•</span>
                <span class="font-mono text-secondary">${inv.deal_ref || 'Commercial Deal'}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-secondary text-xs py-1.5 px-3" id="btn-download-pdf" data-id="${inv.id}">
              <span class="material-symbols-outlined text-sm text-primary">download</span>
              <span>Download PDF</span>
            </button>
            ${!isPaid ? `
              <button type="button" class="btn btn-primary text-xs py-1.5 px-4" id="btn-record-payment" data-id="${inv.id}" data-amount="${total}">
                <span class="material-symbols-outlined text-sm">task_alt</span>
                <span>Record Payment</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Billed To & Remittance Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Billed To -->
        <div class="card card-extruded space-y-2">
          <span class="text-[10px] text-primary uppercase font-bold tracking-widest">BILLED TO</span>
          <h3 class="text-sm font-bold text-on-surface">${inv.customer_name || 'Enterprise Customer'}</h3>
          <p class="text-xs text-on-surface-variant">Attn: Accounts Payable &amp; Financial Controller</p>
          <p class="font-mono text-xs text-secondary">${inv.customer_address || '850 Third Avenue, New York, NY 10022'}</p>
          <div class="pt-2 mt-1 border-t border-surface-container-high/40">
            <span class="font-mono text-[11px] text-secondary bg-surface-container px-2.5 py-0.5 rounded-full">${inv.tax_id || 'EIN / TAX ID: US-94829104'}</span>
          </div>
        </div>

        <!-- Dates & Remittance -->
        <div class="card card-extruded space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[10px] text-secondary uppercase font-bold tracking-wider">Issued Date</span>
              <p class="font-mono text-xs text-on-surface font-bold mt-0.5">${inv.issued_date || inv.created_at || 'N/A'}</p>
            </div>
            <div>
              <span class="text-[10px] text-secondary uppercase font-bold tracking-wider">Payment Due</span>
              <p class="font-mono text-xs text-primary font-bold mt-0.5">${inv.due_date || 'Net 30 Days'}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-surface-container-high/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-outline uppercase font-bold">Remit Routing (ACH/Wire)</span>
              <p class="font-mono text-[11px] text-on-surface-variant">JPMorgan Chase • Acct ***7719</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-mono text-[11px]" style="box-shadow: 2px 2px 5px rgba(168,181,160,0.18);">
              CURRENCY: INR (₹)
            </span>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="card card-extruded">
        <div class="flex items-center gap-2 pb-3 mb-2 border-b border-surface-container-high/40">
          <span class="material-symbols-outlined text-primary text-base">receipt_long</span>
          <h3 class="text-sm font-bold text-on-surface">Itemized Line Items &amp; Deliverables</h3>
        </div>
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/40">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low/50 text-[11px] text-secondary uppercase tracking-wider border-b border-surface-container-high/40">
                <th class="py-2.5 px-4 w-10">#</th>
                <th class="py-2.5 px-4">Item Description &amp; Deliverables</th>
                <th class="py-2.5 px-4 text-center">Milestone Tier</th>
                <th class="py-2.5 px-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${linesHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals Summary -->
      <div class="card card-extruded">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <!-- Ledger Hash -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary" style="box-shadow: 2px 2px 5px rgba(168,181,160,0.2);">
              <span class="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <span class="text-xs text-on-surface font-bold">Ledger Hash Encrypted</span>
              <p class="font-mono text-[11px] text-secondary">SHA-256: 9b2d...f41a</p>
            </div>
          </div>

          <!-- Totals -->
          <div class="flex items-center gap-6 text-xs">
            <div class="text-right">
              <span class="text-[11px] text-secondary">Subtotal</span>
              <p class="font-mono font-bold text-on-surface">₹${Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-secondary">Tax (6.5%)</span>
              <p class="font-mono text-on-surface">₹${Number(tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="text-right px-4 py-2 rounded-xl bg-surface-container-low" style="box-shadow: 3px 3px 8px rgba(168,181,160,0.2),-2px -2px 6px rgba(255,255,255,0.9);">
              <span class="text-[10px] text-primary font-bold uppercase">Total Due</span>
              <p class="font-mono text-lg font-extrabold text-primary">₹${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments History -->
      ${paymentsHtml}
    </div>
  `;
}

export async function loadInvoiceDetail(invoiceId) {
  try {
    return await api.get(`/payments/invoices/${invoiceId}`);
  } catch (err) {
    console.warn('Could not fetch invoice detail:', err);
    return null;
  }
}

export function setupInvoiceDetailEvents(inv) {
  if (!inv) return;

  // Download PDF
  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      try {
        const filename = `DealFlow360_Invoice_${inv.number || inv.id}.pdf`;
        await api.downloadFile(`/payments/invoices/${inv.id}/pdf`, filename);
      } catch (err) {
        alert('Error generating PDF: ' + err.message);
      }
    });
  }

  // Send Reminder
  const reminderBtn = document.getElementById('btn-send-reminder');
  if (reminderBtn) {
    reminderBtn.addEventListener('click', () => {
      alert(`Dispatched automated billing reminder to ${inv.customer_name || 'Buyer'} AP desk.`);
    });
  }

  // Record Payment
  const recordPayBtn = document.getElementById('btn-record-payment');
  if (recordPayBtn) {
    recordPayBtn.addEventListener('click', () => {
      const totalAmount = recordPayBtn.getAttribute('data-amount');
      modal.show({
        title: 'Record Payment Signoff',
        content: `
          <div class="space-y-4 text-xs">
            <p class="text-on-surface-variant">
              Record a settled financial transaction into the dedicated <b>Payment</b> ledger table.
            </p>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Payment Amount (₹)</label>
              <input id="payment-amount-input" type="number" step="0.01" class="input-clay w-full text-xs font-mono font-bold" value="${totalAmount || inv.amount}" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Wire / Bank Reference</label>
              <input id="payment-ref-input" type="text" class="input-clay w-full text-xs font-mono" value="WIRE-CHASE-${Math.floor(100000 + Math.random() * 900000)}" />
            </div>
          </div>
        `,
        confirmText: 'Execute Payment Signoff',
        onConfirm: async () => {
          const amount = parseFloat(document.getElementById('payment-amount-input')?.value) || 0;
          const reference = document.getElementById('payment-ref-input')?.value?.trim() || 'WIRE-DIRECT';
          try {
            await api.post(`/payments/invoices/${inv.id}/pay`, { amount, reference });
            alert(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`);
            window.location.hash = `#/invoices/${inv.id}`;
            window.location.reload();
            return true;
          } catch (err) {
            alert('Failed to record payment: ' + err.message);
            return false;
          }
        },
      });
    });
  }
}
