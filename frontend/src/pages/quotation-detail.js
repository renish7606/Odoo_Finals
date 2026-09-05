/**
 * DealFlow360 Quotation Detail & Builder Page
 * Handles single quotation inspection, line adding/removing, and status transitions.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderQuotationDetailPage(data = {}) {
  const { quotation = null, products = [], customers = [] } = data;
  const isNew = !quotation || !quotation.id;

  const q = quotation || {
    id: 0,
    deal_reference: 'DEAL-NEW',
    customer_name: customers[0]?.name || 'Acme Corp Global ERP',
    customer_email: customers[0]?.email || 'procurement@acme.corp',
    customer_tier: customers[0]?.tier || 'Gold',
    status: 'Draft',
    lines: [],
    total_amount: 0,
  };

  const linesHtml = (!q.lines || q.lines.length === 0)
    ? `
      <tr>
        <td colspan="7" class="text-center py-6 text-on-surface-variant text-xs">
          No line items added yet. Click <strong>Add Product Line +</strong> to populate this deal.
        </td>
      </tr>
    `
    : q.lines.map((line) => `
        <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
          <td class="py-2.5 px-4 font-bold text-xs text-on-surface">
            ${line.product_name || `Product #${line.product_id}`}
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface-variant">${line.sku || 'SKU-STD'}</td>
          <td class="py-2.5 px-4">
            <span class="badge badge-neutral text-[10px]">${line.category_snapshot || 'Hardware'}</span>
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">${line.quantity}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">₹${Number(line.unit_price).toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-tertiary">${line.discount_percent || 0}%</td>
          <td class="py-2.5 px-4 font-mono font-bold text-xs text-primary">₹${Number(line.line_total).toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-4 text-right">
            ${!isNew ? `
              <button type="button" class="icon-btn text-error hover:bg-error-container/30 delete-line-btn" data-line-id="${line.id}" title="Remove Line">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            ` : ''}
          </td>
        </tr>
      `).join('');

  const subtotal = q.lines ? q.lines.reduce((sum, l) => sum + (l.line_total || 0), 0) : 0;
  const grandTotal = subtotal;

  let statusBadgeClass = 'badge-neutral';
  const st = (q.status || '').toLowerCase();
  if (st.includes('approved')) statusBadgeClass = 'badge-success';
  else if (st.includes('pending')) statusBadgeClass = 'badge-warning';
  else if (st.includes('negotiat')) statusBadgeClass = 'badge-info';
  else if (st.includes('fulfilled') || st.includes('confirmed')) statusBadgeClass = 'badge-success';

  return `
    <div class="page-container space-y-6">
      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
          <a href="#/quotations" class="hover:text-primary flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Quotations
          </a>
          <span>/</span>
          <span class="font-mono text-primary font-bold">${q.deal_reference || 'DEAL-NEW'}</span>
        </div>

        <div class="flex items-center gap-2">
          ${!isNew ? `
            <a href="#/portal?id=${q.id}" class="btn btn-secondary text-xs" target="_blank">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              Customer Portal
            </a>
            <a href="#/fulfillment?id=${q.id}" class="btn btn-secondary text-xs">
              <span class="material-symbols-outlined text-sm">local_shipping</span>
              Split Warehouse
            </a>
          ` : ''}
        </div>
      </div>

      <!-- Header Banner -->
      <div class="card card-extruded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">${q.deal_reference || 'New Commercial Deal'}</h1>
            <span class="badge ${statusBadgeClass} text-xs">${q.status || 'Draft'}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Enterprise Client: <strong class="text-on-surface">${q.customer_name}</strong> • Account Rep: Eleanor Vance
          </p>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="quote-action-bar">
          ${q.status === 'Draft' ? `
            <button type="button" class="btn btn-primary text-xs" id="btn-submit-approval">
              <span class="material-symbols-outlined text-base">send_and_archive</span>
              Submit for Approval
            </button>
          ` : ''}
          ${q.status === 'Pending Approval' ? `
            <button type="button" class="btn btn-primary text-xs" id="btn-approve-quote">
              <span class="material-symbols-outlined text-base">check_circle</span>
              Approve Quotation
            </button>
            <button type="button" class="btn btn-secondary text-xs text-error" id="btn-reject-quote">
              <span class="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          ` : ''}
          ${q.status === 'Approved' ? `
            <button type="button" class="btn btn-primary text-xs" id="btn-send-portal">
              <span class="material-symbols-outlined text-base">outgoing_mail</span>
              Send to Customer Portal
            </button>
          ` : ''}
          ${q.status === 'Under Negotiation' ? `
            <button type="button" class="btn btn-primary text-xs" id="btn-confirm-quote">
              <span class="material-symbols-outlined text-base">handshake</span>
              Confirm &amp; Finalize Deal
            </button>
          ` : ''}
          ${q.status === 'Confirmed' ? `
            <button type="button" class="btn btn-primary text-xs" id="btn-fulfill-quote">
              <span class="material-symbols-outlined text-base">inventory</span>
              Trigger Fulfillment
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Lifecycle Step Progress Bar -->
      <div class="card card-extruded">
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3">Orchestration Lifecycle</span>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-xl ${['Draft', 'Pending Approval', 'Approved', 'Under Negotiation', 'Confirmed', 'Fulfilled'].includes(q.status) ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'}">
            1. Draft &amp; CPQ
          </div>
          <div class="p-2.5 rounded-xl ${['Pending Approval', 'Approved', 'Under Negotiation', 'Confirmed', 'Fulfilled'].includes(q.status) ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'}">
            2. Review &amp; Governance
          </div>
          <div class="p-2.5 rounded-xl ${['Approved', 'Under Negotiation', 'Confirmed', 'Fulfilled'].includes(q.status) ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'}">
            3. Customer Portal
          </div>
          <div class="p-2.5 rounded-xl ${['Confirmed', 'Fulfilled'].includes(q.status) ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'}">
            4. Warehouse Split
          </div>
          <div class="p-2.5 rounded-xl ${q.status === 'Fulfilled' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'}">
            5. Invoiced &amp; Fulfilled
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Line Items Section (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="card card-extruded">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-on-surface">Quotation Line Items</h3>
                <p class="text-xs text-on-surface-variant">Products, recurring licenses, and custom delivery scopes</p>
              </div>
              <button type="button" class="btn btn-primary text-xs" id="btn-add-line-modal">
                <span class="material-symbols-outlined text-sm">add</span>
                Add Product Line +
              </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
              <table class="w-full text-left border-collapse" id="quote-lines-table">
                <thead>
                  <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-2.5 px-4">Product</th>
                    <th class="py-2.5 px-4">SKU</th>
                    <th class="py-2.5 px-4">Category</th>
                    <th class="py-2.5 px-4">Qty</th>
                    <th class="py-2.5 px-4">Unit Price</th>
                    <th class="py-2.5 px-4">Disc %</th>
                    <th class="py-2.5 px-4">Total</th>
                    <th class="py-2.5 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  ${linesHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Commercial Summary Sidebar (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Deal Terms &amp; Account</h3>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-on-surface-variant block mb-1">Customer Account</span>
                <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                  ${q.customer_name}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-on-surface-variant block mb-1">Tier</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    ${q.customer_tier || 'Gold'}
                  </div>
                </div>
                <div>
                  <span class="text-on-surface-variant block mb-1">Currency</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    INR (₹)
                  </div>
                </div>
              </div>
              <div>
                <span class="text-on-surface-variant block mb-1">Payment Terms</span>
                <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                  Net 30 Days (Direct Wire / NEFT)
                </div>
              </div>
            </div>
          </div>

          <!-- Total Calculation Card -->
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Commercial Summary</h3>
            <div class="space-y-2 text-xs border-b border-surface-container-high/60 pb-3">
              <div class="flex justify-between text-on-surface-variant">
                <span>Gross Subtotal</span>
                <span class="font-mono font-semibold text-on-surface">₹${Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div class="flex justify-between text-tertiary">
                <span>Discounts Applied</span>
                <span class="font-mono font-semibold">-₹0.00</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>GST / Taxes</span>
                <span class="font-mono font-semibold">₹0.00</span>
              </div>
            </div>
            <div class="flex justify-between items-baseline pt-3">
              <span class="text-sm font-bold text-on-surface">Contract Value</span>
              <span class="text-xl font-bold font-mono text-primary">₹${Number(grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function loadQuotationDetail(id) {
  try {
    const [quotation, products, customers] = await Promise.all([
      id ? api.get(`/quotations/${id}`).catch(() => null) : null,
      api.get('/products').catch(() => []),
      api.get('/customers').catch(() => []),
    ]);
    return { quotation, products, customers };
  } catch (err) {
    return { quotation: null, products: [], customers: [] };
  }
}

export function setupQuotationDetailEvents(quotationId, products = [], customers = []) {
  // Add Line Item Modal
  const addLineBtn = document.getElementById('btn-add-line-modal');
  if (addLineBtn) {
    addLineBtn.addEventListener('click', () => {
      const productOptions = products.map((p) => `
        <option value="${p.id}">${p.name} — $${Number(p.base_price).toLocaleString()} (${p.category})</option>
      `).join('');

      modal.show({
        title: 'Add Product Line Item',
        content: `
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Select Product</label>
              <select id="modal-product-select" class="input-clay w-full text-xs">
                ${productOptions || '<option value="1">Enterprise M&A CPQ Core — ₹120,000</option>'}
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity</label>
              <input id="modal-product-qty" type="number" min="1" value="1" class="input-clay w-full text-xs" />
            </div>
          </div>
        `,
        confirmText: 'Add to Quotation',
        onConfirm: async () => {
          const prodId = parseInt(document.getElementById('modal-product-select').value, 10);
          const qty = parseFloat(document.getElementById('modal-product-qty').value) || 1;

          if (!quotationId) {
            // Need to create quotation first
            const custId = customers[0]?.id || 1;
            const newQ = await api.post('/quotations', { customer_id: custId });
            await api.post(`/quotations/${newQ.id}/lines`, { product_id: prodId, quantity: qty });
            window.location.hash = `#/quotations/${newQ.id}`;
          } else {
            await api.post(`/quotations/${quotationId}/lines`, { product_id: prodId, quantity: qty });
            window.location.reload();
          }
          return true;
        },
      });
    });
  }

  // Delete line buttons
  document.querySelectorAll('.delete-line-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lineId = btn.getAttribute('data-line-id');
      if (confirm('Remove this line item from quotation?')) {
        await api.delete(`/quotations/${quotationId}/lines/${lineId}`);
        window.location.reload();
      }
    });
  });

  // Status updates
  const updateStatus = async (newStatus) => {
    await api.put(`/quotations/${quotationId}`, { status: newStatus });
    window.location.reload();
  };

  const submitBtn = document.getElementById('btn-submit-approval');
  if (submitBtn) submitBtn.addEventListener('click', () => updateStatus('Pending Approval'));

  const approveBtn = document.getElementById('btn-approve-quote');
  if (approveBtn) approveBtn.addEventListener('click', () => updateStatus('Approved'));

  const rejectBtn = document.getElementById('btn-reject-quote');
  if (rejectBtn) rejectBtn.addEventListener('click', () => updateStatus('Rejected'));

  const sendPortalBtn = document.getElementById('btn-send-portal');
  if (sendPortalBtn) sendPortalBtn.addEventListener('click', () => updateStatus('Under Negotiation'));

  const confirmBtn = document.getElementById('btn-confirm-quote');
  if (confirmBtn) confirmBtn.addEventListener('click', () => updateStatus('Confirmed'));

  const fulfillBtn = document.getElementById('btn-fulfill-quote');
  if (fulfillBtn) fulfillBtn.addEventListener('click', () => updateStatus('Fulfilled'));
}
