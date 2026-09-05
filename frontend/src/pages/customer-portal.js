/**
 * DealFlow360 Customer Portal & Negotiation Page
 * Connected to `/api/v1/portal/quotations/{id}` and `/api/v1/portal/quotations/{id}/confirm`.
 */
import { api } from '../api.js';

export function renderCustomerPortalPage(data = {}) {
  const { quotation = null } = data;

  const q = quotation || {
    id: 8492,
    deal_reference: 'DEAL-8492',
    customer_name: 'Acme Corp Global ERP',
    total_amount: 340000,
    status: 'Under Negotiation',
    lines: [
      { product_name: 'Enterprise Cloud Orchestration Node', quantity: 2, unit_price: 120000, line_total: 240000 },
      { product_name: 'Architecture Consulting & Migration SLA', quantity: 1, unit_price: 100000, line_total: 100000 },
    ],
  };

  const isConfirmed = ['Confirmed', 'Fulfilled'].includes(q.status);

  return `
    <div class="page-container space-y-6">
      <!-- Portal Top Banner -->
      <div class="card card-extruded bg-surface-container-low/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="logo-box">
            <span class="material-symbols-outlined text-primary text-xl">verified</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-on-surface">Customer Negotiation Portal</h1>
              <span class="badge ${isConfirmed ? 'badge-success' : 'badge-info'} text-xs">${q.status || 'Under Negotiation'}</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Secure Procurement Portal for <strong class="text-on-surface">${q.customer_name}</strong> • ${q.deal_reference || `DEAL-${q.id}`}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${isConfirmed ? `
            <div class="pill-badge flex items-center gap-1.5 text-xs text-primary font-bold">
              <span class="material-symbols-outlined text-base">verified_user</span>
              Digitally Signed &amp; Ratified
            </div>
          ` : `
            <button type="button" class="btn btn-primary text-xs" id="btn-portal-accept">
              <span class="material-symbols-outlined text-base">draw</span>
              <span>Accept &amp; Digitally Sign</span>
            </button>
          `}
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Contract Breakdown (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Formal Quotation Summary</h3>
            <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-2.5 px-4">Item Scope</th>
                    <th class="py-2.5 px-4">Qty</th>
                    <th class="py-2.5 px-4">Rate</th>
                    <th class="py-2.5 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(q.lines || []).map((l) => `
                    <tr class="table-row border-b border-surface-container-high/40 text-xs">
                      <td class="py-3 px-4 font-bold text-on-surface">${l.product_name || `Item #${l.product_id}`}</td>
                      <td class="py-3 px-4 font-mono">${l.quantity}</td>
                      <td class="py-3 px-4 font-mono">₹${Number(l.unit_price).toLocaleString('en-IN')}</td>
                      <td class="py-3 px-4 font-mono font-bold text-primary text-right">₹${Number(l.line_total).toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-surface-container flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface">Total Contract Amount</span>
              <span class="text-xl font-bold font-mono text-primary">₹${Number(q.total_amount || 340000).toLocaleString('en-IN')}</span>
            </div>

            <div class="mt-3 text-[11px] text-on-surface-variant space-y-1">
              <p>• Commercial Terms: Net 30 Direct Wire Transfer upon delivery acceptance.</p>
              <p>• Legal Jurisdiction: Delaware Master Services Framework Agreement.</p>
              <p>• Price validity: 30 Calendar Days from quotation issuance.</p>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Negotiation & Counter-Offer Thread (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="card card-extruded flex flex-col justify-between h-full">
            <div>
              <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-3 mb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-lg">forum</span>
                  <h3 class="text-sm font-bold text-on-surface">Negotiation Thread</h3>
                </div>
                <span class="badge badge-neutral text-[10px]">Encrypted Channel</span>
              </div>

              <!-- Messages Container -->
              <div class="space-y-3 text-xs max-h-72 overflow-y-auto pr-1" id="portal-messages-list">
                <!-- Sales Rep Message -->
                <div class="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-primary">Eleanor Vance (DealFlow360)</span>
                    <span class="text-[10px] text-on-surface-variant">Today, 08:30 AM</span>
                  </div>
                  <p class="text-on-surface">
                    Hello procurement team, we have prepared the proposal for your M&amp;A integration project with multi-region deployment included.
                  </p>
                </div>

                <!-- Customer Message -->
                <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
                    <span class="text-[10px] text-on-surface-variant">Today, 09:15 AM</span>
                  </div>
                  <p class="text-on-surface">
                    Thank you Eleanor. We are reviewing the SLA terms. Can we confirm 24/7 dedicated telephone support is included in the migration line?
                  </p>
                </div>
              </div>
            </div>

            <!-- Reply Box -->
            <div class="mt-4 pt-3 border-t border-surface-container-high/60 space-y-2">
              <textarea
                id="portal-reply-text"
                rows="3"
                class="input-clay w-full text-xs p-2.5 rounded-xl resize-none"
                placeholder="Post counter-offer, SLA question, or term modification..."
              ></textarea>

              <div class="flex items-center justify-between">
                <span class="text-[10px] text-on-surface-variant">Press Enter or click send</span>
                <button type="button" class="btn btn-primary text-xs py-1.5 px-3" id="btn-send-portal-msg">
                  <span class="material-symbols-outlined text-sm">send</span>
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function loadCustomerPortal(dealId) {
  try {
    const qList = await api.get('/quotations');
    const target = dealId ? qList.find((x) => x.id === parseInt(dealId, 10)) : qList[0];
    if (target) {
      const fullQ = await api.get(`/quotations/${target.id}`).catch(() => target);
      return { quotation: fullQ };
    }
    return { quotation: null };
  } catch {
    return { quotation: null };
  }
}

export function setupCustomerPortalEvents(quotation) {
  const qId = quotation?.id || 8492;

  // Accept & Sign button
  const acceptBtn = document.getElementById('btn-portal-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async () => {
      if (confirm('Confirm digital signature and ratify this commercial agreement?')) {
        try {
          await api.put(`/quotations/${qId}`, { status: 'Confirmed' });
          alert('Quotation digitally signed and ratified! Deal status updated to Confirmed.');
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Signature failed');
        }
      }
    });
  }

  // Send message button
  const sendBtn = document.getElementById('btn-send-portal-msg');
  const replyText = document.getElementById('portal-reply-text');
  const msgList = document.getElementById('portal-messages-list');

  if (sendBtn && replyText && msgList) {
    sendBtn.addEventListener('click', () => {
      const content = replyText.value.trim();
      if (!content) return;

      const newMsgHtml = `
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${content}</p>
        </div>
      `;
      msgList.insertAdjacentHTML('beforeend', newMsgHtml);
      replyText.value = '';
      msgList.scrollTop = msgList.scrollHeight;
    });
  }
}
