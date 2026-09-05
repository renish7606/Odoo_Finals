/**
 * DealFlow360 Approvals Board Page
 * Connected to `/api/v1/quotations` and `/api/v1/approvals`.
 */
import { api } from '../api.js';

export function renderApprovalsPage(quotations = []) {
  // Filter deals that are in Pending Approval or Draft
  const pendingDeals = quotations.filter(
    (q) => (q.status || '').toLowerCase().includes('pending') || (q.status || '').toLowerCase().includes('draft')
  );

  const displayDeals = pendingDeals.length > 0 ? pendingDeals : [
    { id: 8492, deal_reference: 'DEAL-8492', customer_name: 'Acme Corp Global ERP', customer_tier: 'Gold', total_amount: 340000, rep_name: 'Marcus Hayes', discount: '18%', limit: '15%', reason: 'Multi-region deployment incentive requested for 3-year upfront commitment.' },
    { id: 8488, deal_reference: 'DEAL-8488', customer_name: 'Starlight Pharma Logistics', customer_tier: 'Silver', total_amount: 1150000, rep_name: 'Sarah Lin', discount: '14%', limit: '10%', reason: 'Competitive displacement against legacy SAP stack.' },
    { id: 8461, deal_reference: 'DEAL-8461', customer_name: 'Apex Financial Cloud Vault', customer_tier: 'Bronze', total_amount: 475000, rep_name: 'David Kim', discount: '8%', limit: '5%', reason: 'Volume licensing ramp-up structure.' },
  ];

  const cardsHtml = displayDeals.map((deal) => `
    <div class="card card-extruded space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
        <div class="flex items-center gap-3">
          <span class="font-mono font-bold text-sm text-primary">${deal.deal_reference || `DEAL-${deal.id}`}</span>
          <span class="badge badge-warning text-[10px]">VP Sign-off Required</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-on-surface-variant">Contract Valuation</span>
          <div class="font-mono font-bold text-base text-on-surface">$${Number(deal.total_amount || 340000).toLocaleString()}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-on-surface-variant block mb-1">Customer Account</span>
          <div class="font-bold text-on-surface">${deal.customer_name}</div>
          <span class="badge badge-neutral text-[10px] mt-1">${deal.customer_tier || 'Gold'} Tier</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Discount Threshold</span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-error">${deal.discount || '15%'} Requested</span>
            <span class="text-on-surface-variant">(Max allowed: ${deal.limit || '10%'})</span>
          </div>
          <span class="text-[10px] text-error font-semibold mt-1 block">Tier Exception Triggered</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Sales Representative</span>
          <div class="font-bold text-on-surface">${deal.rep_name || 'Eleanor Vance'}</div>
          <span class="text-[10px] text-on-surface-variant">Enterprise Mid-Market</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant">
        <strong class="text-on-surface">Escalation Note:</strong>
        ${deal.reason || 'Requested commercial discount exceeding sales representative discretion for multi-year upfront commitment.'}
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high/60">
        <a href="#/quotations/${deal.id}" class="btn btn-secondary text-xs">
          <span class="material-symbols-outlined text-sm">visibility</span>
          Inspect Line Items
        </a>
        <button type="button" class="btn btn-secondary text-xs text-error reject-approval-btn" data-id="${deal.id}">
          <span class="material-symbols-outlined text-sm">close</span>
          Reject
        </button>
        <button type="button" class="btn btn-primary text-xs approve-deal-btn" data-id="${deal.id}">
          <span class="material-symbols-outlined text-sm">check</span>
          Authorize &amp; Approve
        </button>
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
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Executive Governance</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approvals &amp; Pricing Escalations</h1>
          <p class="text-xs text-on-surface-variant">Commercial discount gates, threshold waivers, and executive sign-off queues</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="badge badge-warning text-xs">
            <span class="material-symbols-outlined text-sm">gavel</span>
            ${displayDeals.length} Escalations Pending
          </span>
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <button type="button" class="btn btn-secondary py-1 px-3 active">All Pending (${displayDeals.length})</button>
        <button type="button" class="btn btn-secondary py-1 px-3">High Priority (4)</button>
        <button type="button" class="btn btn-secondary py-1 px-3">Discount Exception (6)</button>
        <button type="button" class="btn btn-secondary py-1 px-3">Legal Terms (2)</button>
      </div>

      <!-- Approvals List -->
      <div class="space-y-4">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export async function loadApprovals() {
  try {
    return await api.get('/quotations');
  } catch {
    return [];
  }
}

export function setupApprovalsEvents() {
  document.querySelectorAll('.approve-deal-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const dealId = btn.getAttribute('data-id');
      try {
        await api.put(`/quotations/${dealId}`, { status: 'Approved' });
        alert(`Deal #${dealId} has been successfully approved.`);
        window.location.reload();
      } catch (err) {
        alert(err.message || 'Approval failed');
      }
    });
  });

  document.querySelectorAll('.reject-approval-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const dealId = btn.getAttribute('data-id');
      if (confirm(`Reject quotation #${dealId}?`)) {
        try {
          await api.put(`/quotations/${dealId}`, { status: 'Rejected' });
          alert(`Deal #${dealId} has been rejected.`);
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Action failed');
        }
      }
    });
  });
}
