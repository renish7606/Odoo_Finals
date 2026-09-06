/**
 * DealFlow360 Approvals List Page
 * Connected to `/api/v1/approvals`.
 */
import { api } from '../api.js';

export async function loadApprovals() {
  try {
    return await api.get('/approvals');
  } catch {
    return [];
  }
}

export function renderApprovalsPage(approvals = []) {
  const displayApprovals = approvals.length > 0 ? approvals : [];

  const pendingCount = displayApprovals.filter(a =>
    a.status === 'PENDING_MANAGER' || a.status === 'PENDING_FINANCE'
  ).length;
  const returnedCount = displayApprovals.filter(a => a.status === 'RETURNED').length;
  const approvedCount = displayApprovals.filter(a => a.status === 'APPROVED').length;

  const rowsHtml = displayApprovals.length === 0
    ? `
      <tr>
        <td colspan="5" class="text-on-surface-variant" style="text-align: center; padding: 2rem;">
          No approval requests found. Approvals are created when quotations exceed discount limits.
        </td>
      </tr>
    `
    : displayApprovals.map(a => {
      const riskClass = a.blended_risk === 'HIGH' ? 'font-bold' : '';
      return `
        <tr class="approval-row" data-quotation-id="${a.quotation_id}" style="cursor: pointer;">
          <td class="font-bold text-on-surface">${a.quotation_ref}</td>
          <td class="text-on-surface">${a.customer_name}</td>
          <td class="text-on-surface ${riskClass}">${a.blended_risk}</td>
          <td class="text-on-surface">${a.current_stage}</td>
          <td class="text-on-surface">${a.assigned_to}</td>
        </tr>
      `;
    }).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approvals (List)</h1>
        <p class="text-sm text-on-surface-variant">Every quotation that needed, needs, or is going through discount approval</p>
      </div>

      <!-- Status Badges -->
      <div class="flex items-center gap-3" style="flex-wrap: wrap;">
        <span class="badge" id="filter-pending" style="background-color: #e67e22; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${pendingCount} Pending
        </span>
        <span class="badge" id="filter-returned" style="background-color: #e74c3c; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${returnedCount} Returned
        </span>
        <span class="badge" id="filter-approved" style="background-color: #22c55e; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${approvedCount} Approved
        </span>
      </div>

      <!-- Approvals Table -->
      <div class="card card-extruded" style="padding: 0; overflow: hidden;">
        <div class="clay-table-wrapper">
          <table class="clay-table" style="font-size: 14px;">
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Blended Risk</th>
                <th>Stage</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody id="approvals-tbody">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hint -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </p>
      </div>

      <!-- Filter Button -->
      <div>
        <button id="btn-filter-pending" type="button" class="btn btn-secondary" style="padding: 0.5rem 1.2rem; font-size: 13px;">
          Filter: Pending Only
        </button>
      </div>
    </div>
  `;
}

export function setupApprovalsEvents() {
  // Row click -> navigate to approval detail
  document.querySelectorAll('.approval-row').forEach(row => {
    row.addEventListener('click', () => {
      const quotationId = row.getAttribute('data-quotation-id');
      window.location.hash = `#/approval-detail/${quotationId}`;
    });
  });

  // Filter: Pending Only toggle
  const filterBtn = document.getElementById('btn-filter-pending');
  if (filterBtn) {
    let showPendingOnly = false;
    filterBtn.addEventListener('click', () => {
      showPendingOnly = !showPendingOnly;
      filterBtn.textContent = showPendingOnly ? 'Show All' : 'Filter: Pending Only';

      const rows = document.querySelectorAll('.approval-row');
      rows.forEach(row => {
        const stageCell = row.children[3];
        const stage = stageCell ? stageCell.textContent.trim() : '';
        if (showPendingOnly) {
          const isPending = stage.includes('Sales') || stage.includes('Finance') || stage === 'Pending';
          row.style.display = isPending ? '' : 'none';
        } else {
          row.style.display = '';
        }
      });
    });
  }

  // Badge filter clicks
  const filterPending = document.getElementById('filter-pending');
  const filterReturned = document.getElementById('filter-returned');
  const filterApproved = document.getElementById('filter-approved');

  function filterByStatus(statusFilter) {
    const rows = document.querySelectorAll('.approval-row');
    rows.forEach(row => {
      const stageCell = row.children[3];
      const stage = stageCell ? stageCell.textContent.trim() : '';
      if (statusFilter === 'pending') {
        const isPending = stage.includes('Sales') || stage.includes('Finance') || stage === 'Pending';
        row.style.display = isPending ? '' : 'none';
      } else if (statusFilter === 'returned') {
        row.style.display = stage === 'Returned' ? '' : 'none';
      } else if (statusFilter === 'approved') {
        row.style.display = stage === 'Approved' || stage === 'Auto-Approved' ? '' : 'none';
      }
    });
  }

  if (filterPending) filterPending.addEventListener('click', () => filterByStatus('pending'));
  if (filterReturned) filterReturned.addEventListener('click', () => filterByStatus('returned'));
  if (filterApproved) filterApproved.addEventListener('click', () => filterByStatus('approved'));
}
