import { dealHealthStore } from '../data/dealHealth.js';

export async function loadDealHealth() {
  await dealHealthStore.fetchHealthData();
  return {};
}

export function renderDealHealthPage() {
  const stalledCount = dealHealthStore.getStalledDeals().length;
  const anomalyCount = dealHealthStore.getDiscountAnomalies().length;
  const slippageCount = dealHealthStore.getDeliverySlippages().length;
  const flaggedItems = dealHealthStore.getFlaggedItems();
  
  const recentRows = flaggedItems.length > 0 ? flaggedItems.map((deal) => {
    let actionBadge = 'badge-warning';
    if (deal.actionStatus === 'Nudge sent') actionBadge = 'badge-info';
    else if (deal.actionStatus === 'Escalated to Manager') actionBadge = 'badge-primary';
    else if (deal.actionStatus === 'Resolved') actionBadge = 'badge-success';
    
    return `
      <tr class="table-row hover:bg-surface-container/50 transition-colors cursor-pointer activity-row group" data-deal-id="${deal.id}">
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${deal.dealName}</span>
            <span class="text-[10px] text-on-surface-variant">${deal.customerName} • Rep: ${deal.repName}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ${deal.displayIssue}
        </td>
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">
          ${deal.flaggedDate}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${actionBadge}">● ${deal.actionStatus}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-2 opacity-0 group-[.selected]:opacity-100 transition-opacity">
            <button class="btn btn-secondary text-xs py-1 px-3 btn-nudge" data-id="${deal.id}" ${deal.actionStatus !== 'Action Required' ? 'disabled' : ''}>Nudge Rep</button>
            <button class="btn btn-secondary text-xs py-1 px-3 btn-escalate" data-id="${deal.id}" ${deal.actionStatus !== 'Action Required' && deal.actionStatus !== 'Nudge sent' ? 'disabled' : ''}>Escalate</button>
            <button class="btn btn-primary text-xs py-1 px-3 btn-resolve" data-id="${deal.id}" data-issue="${deal.issues[0]}">Resolve Risk</button>
          </div>
        </td>
      </tr>
    `;
  }).join('') : `
    <tr id="activity-empty-row">
      <td colspan="5" class="py-6 text-center text-xs text-on-surface-variant">
        No at-risk deals found.
      </td>
    </tr>
  `;

  return `
    <div class="page-container space-y-6" id="deal-health-page-root">
      <!-- Header & Contextual Actions -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Real-time Telemetry Active</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Deal Health and Anomaly Dashboard</h1>
          <p class="text-xs text-on-surface-variant">Real-time flags for stalled deals and unusual discount patterns</p>
        </div>
      </div>

      <!-- 3 Key Metric Clay Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Metric 1: Stalled Deals -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stalled Deals</span>
            <div class="icon-circle bg-secondary-container/60">
              <span class="material-symbols-outlined text-secondary text-lg">hourglass_top</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${stalledCount}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">quotes idle 7+ days</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Discount Anomalies -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Discount Anomalies</span>
            <div class="icon-circle bg-tertiary-container/40">
              <span class="material-symbols-outlined text-tertiary text-lg">percent</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${anomalyCount}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">above rep average</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Delivery Slippage -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery Slippage</span>
            <div class="icon-circle bg-error-container/40">
              <span class="material-symbols-outlined text-error text-lg">local_shipping</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${slippageCount}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">promise dates at risk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Flagged Deals Table -->
      <div class="card card-extruded">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary text-xl">crisis_alert</span>
          <div>
            <h2 class="text-base font-bold text-on-surface">Flagged Deals</h2>
            <p class="text-xs text-on-surface-variant">Requires immediate review and action</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="flagged-deals-table">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Deal</th>
                <th class="py-2.5 px-4">Issue</th>
                <th class="py-2.5 px-4">Flagged Date</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="flagged-tbody">
              ${recentRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function setupDealHealthEvents() {
  const root = document.getElementById('deal-health-page-root');
  if (!root) return;

  const updateUI = () => {
    if (window.location.hash === '#/deal-health') {
        const contentDiv = document.getElementById('app-content');
        if (contentDiv) {
            contentDiv.innerHTML = renderDealHealthPage();
            setupDealHealthEvents();
        }
    }
  };

  const unsubscribe = dealHealthStore.subscribe(updateUI);

  if (window._dealHealthUnsub) window._dealHealthUnsub();
  window._dealHealthUnsub = unsubscribe;

  root.querySelectorAll('.activity-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Ignore if clicking a button
      if (e.target.closest('button')) return;
      
      // Deselect all
      root.querySelectorAll('.activity-row').forEach(r => {
        r.classList.remove('selected');
        r.classList.remove('bg-surface-container-high/40');
      });
      // Select clicked
      row.classList.add('selected');
      row.classList.add('bg-surface-container-high/40');
    });
  });

  root.querySelectorAll('.btn-nudge').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      e.target.disabled = true;
      e.target.textContent = 'Nudging...';
      await dealHealthStore.nudgeRep(id);
    });
  });

  root.querySelectorAll('.btn-escalate').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      e.target.disabled = true;
      e.target.textContent = 'Escalating...';
      await dealHealthStore.escalateDeal(id);
    });
  });

  root.querySelectorAll('.btn-resolve').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      const issue = e.target.getAttribute('data-issue');
      e.target.disabled = true;
      e.target.textContent = 'Resolving...';
      await dealHealthStore.resolveRisk(id, issue);
    });
  });
}
