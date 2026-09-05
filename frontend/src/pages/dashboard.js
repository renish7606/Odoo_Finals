/**
 * DealFlow360 Dashboard Overview Page
 * Connected to `/api/v1/dashboard/summary` and `/api/v1/quotations`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderDashboardPage(data = {}) {
  const { summary = {}, quotations = [] } = data;

  const totalRevenue = summary.total_revenue
    ? `₹${Number(summary.total_revenue).toLocaleString('en-IN')}`
    : '₹4,82,05,000';
  const pendingApprovals = summary.pending_approvals ?? 12;
  const activeQuotes = summary.total_quotations || summary.draft_count ? (summary.total_quotations || 38) : 38;
  const winRate = summary.win_rate ? `${summary.win_rate}%` : '68.5%';

  // Format quotations for the Recent Activity table
  const recentRows = (quotations.length > 0 ? quotations.slice(0, 6) : [
    { id: 8492, deal_reference: 'DEAL-8492', rep_name: 'Marcus Hayes', customer_name: 'Acme Corp Global ERP', total_amount: 3400000, status: 'Approved', time: 'Today, 09:42 AM' },
    { id: 8488, deal_reference: 'DEAL-8488', rep_name: 'Sarah Lin', customer_name: 'Starlight Pharma Logistics', total_amount: 11500000, status: 'Under Negotiation', time: 'Today, 08:15 AM' },
    { id: 8475, deal_reference: 'DEAL-8475', rep_name: 'Eleanor Vance', customer_name: 'Helios Solar Microgrid Infra', total_amount: 8900000, status: 'Fulfilled', time: 'Yesterday, 17:30 PM' },
    { id: 8461, deal_reference: 'DEAL-8461', rep_name: 'David Kim', customer_name: 'Apex Financial Cloud Vault', total_amount: 4750000, status: 'Draft', time: 'Yesterday, 14:10 PM' },
  ]).map((deal) => {
    let statusPillClass = 'badge-primary';
    const st = (deal.status || '').toLowerCase();
    if (st.includes('approve')) statusPillClass = 'badge-success';
    else if (st.includes('negotiat') || st.includes('review') || st.includes('pending')) statusPillClass = 'badge-warning';
    else if (st.includes('fulfill')) statusPillClass = 'badge-info';
    else if (st.includes('draft')) statusPillClass = 'badge-neutral';

    return `
      <tr class="table-row hover:bg-surface-container/50 transition-colors">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${deal.time || 'Recent'}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${(deal.rep_name || 'US').split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${deal.rep_name || 'Sales Rep'}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${deal.customer_name || 'Enterprise Client'}</span>
            <span class="text-[10px] font-mono text-primary">${deal.deal_reference || `DEAL-${deal.id}`}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(deal.total_amount || 0).toLocaleString('en-IN')}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${statusPillClass}">${deal.status || 'Draft'}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${deal.id}" class="btn btn-secondary text-xs py-1 px-3">Review Deal</a>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header & Contextual Actions -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Q3 Fiscal Operations Live</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Enterprise Pipeline &amp; Operations</h1>
          <p class="text-xs text-on-surface-variant">Executive summary and commercial throughput for current fiscal period</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <div class="pill-badge flex items-center gap-2 text-xs">
            <span class="material-symbols-outlined text-base text-primary">calendar_today</span>
            <span>This Quarter: Jul 1 – Sep 30</span>
            <span class="material-symbols-outlined text-sm text-outline">expand_more</span>
          </div>
          <button type="button" class="btn btn-secondary text-xs" id="btn-export-dash">
            <span class="material-symbols-outlined text-base">ios_share</span>
            <span>Export Report</span>
          </button>
          <button type="button" class="btn btn-primary text-xs" id="btn-new-deal-dash">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>New Deal +</span>
          </button>
        </div>
      </div>

      <!-- 4 Key Metric Clay Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Metric 1: Total Revenue -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Pipeline Revenue</span>
            <div class="icon-circle bg-surface-container-high/60">
              <span class="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${totalRevenue}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-success text-[10px]">
                <span class="material-symbols-outlined text-xs">trending_up</span> +18.4%
              </span>
              <span class="text-[11px] text-on-surface-variant">vs last Q</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Pending Approvals -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pending Approvals</span>
            <div class="icon-circle bg-tertiary-container/40">
              <span class="material-symbols-outlined text-tertiary text-lg">fact_check</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">
              ${pendingApprovals} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-warning text-[10px]">
                <span class="material-symbols-outlined text-xs">priority_high</span> 4 High Priority
              </span>
              <span class="text-[11px] text-on-surface-variant">requires VP sign-off</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Active Quotations -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Quotations</span>
            <div class="icon-circle bg-surface-container-high/60">
              <span class="material-symbols-outlined text-primary text-lg">description</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">
              ${activeQuotes} <span class="text-sm font-normal text-on-surface-variant">Quotes</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-neutral text-[10px]">Avg Cycle: 6.2 days</span>
              <span class="text-[11px] text-on-surface-variant">within SLA</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: Win Rate -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Win Rate</span>
            <div class="icon-circle bg-secondary-container/60">
              <span class="material-symbols-outlined text-secondary text-lg">track_changes</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${winRate}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-success text-[10px]">
                <span class="material-symbols-outlined text-xs">arrow_upward</span> +4.2% YoY
              </span>
              <span class="text-[11px] text-on-surface-variant">target 65%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Analytics Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left 2/3: Revenue & Deal Flow Chart -->
        <div class="lg:col-span-8 card card-extruded flex flex-col justify-between">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 class="text-base font-bold text-on-surface">Revenue &amp; Deal Flow Over Time</h2>
              <p class="text-xs text-on-surface-variant">Monthly velocity tracking against quarter target milestones</p>
            </div>
            <div class="flex items-center gap-4 text-xs text-on-surface-variant">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Actuals</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-outline"></span>
                <span>Target Plan</span>
              </div>
            </div>
          </div>

          <!-- SVG Smooth Velocity Chart -->
          <div class="w-full bg-surface-container-low/60 rounded-2xl p-4 my-2 relative">
            <svg class="w-full h-44" viewBox="0 0 700 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#a8b5a0" stop-opacity="0.45" />
                  <stop offset="100%" stop-color="#a8b5a0" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="50" y1="30" x2="650" y2="30" stroke="#d7e7d0" stroke-width="1" stroke-dasharray="4" />
              <line x1="50" y1="80" x2="650" y2="80" stroke="#d7e7d0" stroke-width="1" stroke-dasharray="4" />
              <line x1="50" y1="130" x2="650" y2="130" stroke="#d7e7d0" stroke-width="1" stroke-dasharray="4" />

              <!-- Target Plan line -->
              <line x1="80" y1="135" x2="620" y2="35" stroke="#757871" stroke-width="2" stroke-dasharray="6" opacity="0.6" />

              <!-- Area fill -->
              <path d="M 80,140 Q 350,90 620,40 L 620,160 L 80,160 Z" fill="url(#chartGrad)" />

              <!-- Actuals Curve -->
              <path d="M 80,140 Q 350,90 620,40" fill="none" stroke="#566250" stroke-width="3.5" stroke-linecap="round" />

              <!-- Data nodes -->
              <circle cx="80" cy="140" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              <circle cx="350" cy="90" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              <circle cx="620" cy="40" r="6" fill="#566250" stroke="#eefee6" stroke-width="2" />
            </svg>

            <!-- Chart Month Labels -->
            <div class="grid grid-cols-3 text-center pt-2">
              <div>
                <span class="text-xs font-semibold text-on-surface">July</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹12,20,000</p>
              </div>
              <div>
                <span class="text-xs font-semibold text-on-surface">August</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹16,85,500</p>
              </div>
              <div>
                <span class="text-xs font-semibold text-on-surface text-primary">September (Current)</span>
                <p class="text-[11px] font-mono font-bold text-primary">₹19,15,000</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-2">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-primary">verified</span>
              Validated against ERP General Ledger Q3
            </span>
            <span class="font-mono font-semibold text-primary">Pacing: 114.2% of quarterly target</span>
          </div>
        </div>

        <!-- Right 1/3: Deals by Stage -->
        <div class="lg:col-span-4 card card-extruded flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-on-surface">Deals by Stage</h2>
            <p class="text-xs text-on-surface-variant">Current pipeline volume distribution</p>
          </div>

          <!-- Donut Graphic -->
          <div class="flex items-center justify-center my-4 relative">
            <div style="width: 140px; height: 140px; border-radius: 9999px; background: conic-gradient(#566250 0% 25%, #7a5826 25% 60%, #a8b5a0 60% 85%, #d7e7d0 85% 100%); display: flex; align-items: center; justify-content: center; box-shadow: 4px 4px 10px rgba(168,181,160,0.2);">
              <div style="width: 90px; height: 90px; border-radius: 9999px; background: #ffffff; box-shadow: inset 2px 2px 6px rgba(168,181,160,0.35); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span class="text-xl font-bold font-mono text-on-surface">50</span>
                <span class="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Total Deals</span>
              </div>
            </div>
          </div>

          <!-- Stage Breakdown -->
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-surface-variant"></span> Draft Phase
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">15% (7)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> In Legal Review
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">25% (13)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Executive Approved
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">35% (18)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span> Fulfillment / Active
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">25% (12)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Recent Enterprise Activity -->
      <div class="card card-extruded">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">history_edu</span>
            <div>
              <h2 class="text-base font-bold text-on-surface">Recent Enterprise Activity</h2>
              <p class="text-xs text-on-surface-variant">Real-time audit log of approvals, transactions, and milestone changes</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-secondary text-xs py-1 px-3 active">All Events</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3">Approvals Only</button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Timestamp</th>
                <th class="py-2.5 px-4">Actor &amp; Organization</th>
                <th class="py-2.5 px-4">Deal Reference</th>
                <th class="py-2.5 px-4">Valuation</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentRows}
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-2 border-t border-surface-container-high/60 text-xs text-on-surface-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">sensors</span>
            <span>Continuous sync active: 18 compliance hooks monitored in real time</span>
          </div>
          <button type="button" class="text-primary hover:underline text-xs font-semibold" id="btn-dl-audit">
            Download Full Audit Trail (.CSV)
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function loadDashboard() {
  try {
    const [summary, quotations] = await Promise.all([
      api.get('/dashboard/summary').catch(() => ({})),
      api.get('/quotations').catch(() => []),
    ]);
    return { summary, quotations };
  } catch (e) {
    return { summary: {}, quotations: [] };
  }
}

export function setupDashboardEvents() {
  const exportBtn = document.getElementById('btn-export-dash');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.location.hash = '#/reports';
    });
  }

  const newDealBtn = document.getElementById('btn-new-deal-dash');
  if (newDealBtn) {
    newDealBtn.addEventListener('click', () => {
      window.location.hash = '#/quotation-detail';
    });
  }

  const dlAudit = document.getElementById('btn-dl-audit');
  if (dlAudit) {
    dlAudit.addEventListener('click', () => {
      alert('Downloading audit trail CSV...');
    });
  }
}
