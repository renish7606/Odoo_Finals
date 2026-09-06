/**
 * DealFlow360 Approval Detail Page
 * Shows full approval detail, risk breakdown, pipeline, audit trail, and action buttons.
 */
import { api } from '../api.js';

export async function loadApprovalDetail(quotationId) {
  try {
    return await api.get(`/approvals/${quotationId}`);
  } catch (err) {
    console.error('Failed to load approval detail', err);
    return null;
  }
}

export function renderApprovalDetailPage(data) {
  if (!data) {
    return `
      <div class="page-container space-y-6">
        <div class="card card-extruded" style="padding: 2rem; text-align: center;">
          <h2 class="text-xl font-bold text-on-surface">Approval Not Found</h2>
          <p class="text-sm text-on-surface-variant" style="margin-top: 0.5rem;">This quotation does not have an approval request yet.</p>
          <a href="#/approvals" class="btn btn-primary" style="margin-top: 1rem; display: inline-block; text-decoration: none; padding: 0.5rem 1.5rem;">Back to Approvals</a>
        </div>
      </div>
    `;
  }

  const riskColor = data.blended_risk === 'HIGH' ? '#e67e22' : data.blended_risk === 'MEDIUM' ? '#f1c40f' : '#2ecc71';
  const tierColor = '#5AA1E3';

  // Build line details table
  const lineRowsHtml = (data.lines || []).map(ln => `
    <tr>
      <td class="text-on-surface">${ln.product_name}</td>
      <td class="text-on-surface">${ln.discount_given}%</td>
      <td class="text-on-surface">${ln.limit_allowed}%</td>
      <td class="text-on-surface font-bold">${ln.over_label}</td>
    </tr>
  `).join('') || `
    <tr>
      <td colspan="4" class="text-on-surface-variant" style="text-align: center; padding: 1rem;">No line items found</td>
    </tr>
  `;

  // Build pipeline stages
  const pipelineStages = ['Submitted', 'Sales Manager', 'Finance', 'Confirmed'];
  const currentStageIndex = (() => {
    if (data.status === 'APPROVED') return 3;
    if (data.status === 'PENDING_FINANCE') return 2;
    if (data.status === 'PENDING_MANAGER') return 1;
    return 0;
  })();

  const pipelineHtml = pipelineStages.map((stage, idx) => {
    let dotColor = '#6b7280'; // grey
    let dotBorder = '#6b7280';
    if (idx < currentStageIndex) {
      dotColor = '#22c55e'; // green - completed
      dotBorder = '#22c55e';
    } else if (idx === currentStageIndex) {
      dotColor = '#3b82f6'; // blue - active
      dotBorder = '#3b82f6';
    }

    const connector = idx < pipelineStages.length - 1
      ? `<div style="flex: 1; height: 2px; background: ${idx < currentStageIndex ? '#22c55e' : '#6b7280'}; margin: 0 0.25rem;"></div>
         <div style="width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid ${idx < currentStageIndex ? '#22c55e' : '#6b7280'}; margin-right: 0.25rem;"></div>`
      : '';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 80px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${dotColor}; border: 3px solid ${dotBorder};"></div>
        <span class="text-xs text-on-surface-variant" style="margin-top: 0.5rem; text-align: center;">${stage}</span>
      </div>
      ${connector ? `<div style="display: flex; align-items: center; flex: 1;">${connector}</div>` : ''}
    `;
  }).join('');

  // Build audit trail table
  const auditRowsHtml = (data.audit_trail || []).map(entry => `
    <tr>
      <td class="text-on-surface">${entry.user}</td>
      <td class="text-on-surface">${entry.action}</td>
      <td class="text-on-surface">${entry.date}</td>
      <td class="text-on-surface">${entry.note}</td>
    </tr>
  `).join('') || `
    <tr>
      <td colspan="4" class="text-on-surface-variant" style="text-align: center; padding: 1rem;">No audit trail entries yet</td>
    </tr>
  `;

  const isPending = data.status === 'PENDING_MANAGER' || data.status === 'PENDING_FINANCE';

  return `
    <div class="page-container space-y-6" data-quotation-id="${data.quotation_id}">

      <!-- Back link -->
      <a href="#/approvals" class="text-sm text-primary flex items-center gap-1" style="text-decoration: none;">
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Back to Approvals List
      </a>

      <!-- Title -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approval Detail: ${data.quotation_ref} (${data.customer_name})</h1>
        <p class="text-sm text-on-surface-variant">Opened by clicking a row on the Approvals list</p>
      </div>

      <!-- Risk & Tier Badges -->
      <div class="flex items-center gap-3" style="flex-wrap: wrap;">
        <span class="badge" style="background-color: ${riskColor}; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px;">
          Blended Risk: ${data.blended_risk}
        </span>
        <span class="badge" style="background-color: ${tierColor}; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px;">
          Customer Tier: ${data.customer_tier}
        </span>
      </div>

      <!-- Why This Quote Was Flagged -->
      <div class="space-y-3">
        <h2 class="text-lg font-bold text-primary">Why This Quote Was Flagged</h2>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table" style="font-size: 14px;">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Discount Given</th>
                  <th>Limit Allowed</th>
                  <th>Over By</th>
                </tr>
              </thead>
              <tbody>
                ${lineRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pipeline Visualization -->
      <div class="card card-extruded" style="padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0;">
          ${pipelineHtml}
        </div>
      </div>

      <!-- Audit Trail -->
      <div class="space-y-3">
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table" style="font-size: 14px;">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${auditRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      ${isPending ? `
        <div class="flex items-center gap-3" style="flex-wrap: wrap;">
          <button id="btn-approve" type="button" class="btn" style="background-color: #22c55e; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Approve
          </button>
          <button id="btn-return" type="button" class="btn" style="background-color: #e67e22; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Return for Revision
          </button>
          <button id="btn-reject" type="button" class="btn" style="background-color: #e74c3c; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Reject
          </button>
        </div>
      ` : `
        <div class="card card-extruded" style="padding: 1rem; text-align: center;">
          <span class="text-sm font-bold text-on-surface">This approval has been ${data.status.toLowerCase().replace('_', ' ')}.</span>
        </div>
      `}

    </div>
  `;
}

export function setupApprovalDetailEvents(quotationId) {
  const approveBtn = document.getElementById('btn-approve');
  const returnBtn = document.getElementById('btn-return');
  const rejectBtn = document.getElementById('btn-reject');

  if (approveBtn) {
    approveBtn.addEventListener('click', async () => {
      const reason = prompt('Approval note (optional):') || '';
      try {
        await api.post(`/approvals/${quotationId}/decide`, { decision: 'APPROVE', reason });
        alert('Approval granted successfully!');
        window.location.hash = '#/approvals';
      } catch (err) {
        alert('Error: ' + (err.message || 'Approval failed'));
      }
    });
  }

  if (returnBtn) {
    returnBtn.addEventListener('click', async () => {
      const reason = prompt('Reason for returning (required):');
      if (!reason) { alert('A reason is required to return for revision.'); return; }
      try {
        await api.post(`/approvals/${quotationId}/decide`, { decision: 'RETURN', reason });
        alert('Returned for revision.');
        window.location.hash = '#/approvals';
      } catch (err) {
        alert('Error: ' + (err.message || 'Action failed'));
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', async () => {
      const reason = prompt('Reason for rejection (required):');
      if (!reason) { alert('A reason is required to reject.'); return; }
      try {
        await api.post(`/approvals/${quotationId}/decide`, { decision: 'REJECT', reason });
        alert('Approval rejected.');
        window.location.hash = '#/approvals';
      } catch (err) {
        alert('Error: ' + (err.message || 'Action failed'));
      }
    });
  }
}
