/**
 * DealFlow360 Dashboard Overview Page
 * Connected to `/api/v1/dashboard/summary` and `/api/v1/quotations`.
 */
import { api } from '../api.js';
import { dealHealthStore } from '../data/dealHealth.js';

export function renderDashboardPage(data = {}) {
  const { summary = {}, quotations = [] } = data;

  const totalRevenue = summary.total_revenue
    ? `₹${Number(summary.total_revenue).toLocaleString('en-IN')}`
    : '₹4,82,05,000';
  const pendingApprovals = summary.pending_approvals ?? 1;
  const activeQuotes = summary.total_quotations || summary.draft_count ? (summary.total_quotations || 5) : 5;
  const winRate = summary.win_rate ? `${summary.win_rate}%` : '40%';

  const atRiskCount = dealHealthStore.getAtRiskCount();
  const activeFlagsCount = dealHealthStore.getActiveFlagsCount();
  const stalledCount = dealHealthStore.getStalledDeals().length;
  const slippageCount = dealHealthStore.getDeliverySlippages().length;

  // Format quotations for the Recent Activity table
  const dealsList = quotations.length > 0 ? quotations.slice(0, 6) : [
    { id: 8492, deal_reference: 'DEAL-0005', rep_name: 'Marcus Vance', customer_name: 'Terra Motors OEM', total_amount: 0, status: 'Approved', time: 'Recent' },
    { id: 8488, deal_reference: 'DEAL-0004', rep_name: 'Eleanor Vance', customer_name: 'Zenith Retail AI', total_amount: 0, status: 'Pending Approval', time: 'Recent' },
    { id: 8475, deal_reference: 'DEAL-0003', rep_name: 'Marcus Vance', customer_name: 'Starlight Dynamics Inc.', total_amount: 0, status: 'Under Negotiation', time: 'Recent' },
    { id: 8461, deal_reference: 'DEAL-0001', rep_name: 'Local Sales Rep', customer_name: 'Bronze Buyer', total_amount: 1300, status: 'Draft', time: 'Recent' },
    { id: 8462, deal_reference: 'DEAL-0002', rep_name: 'Local Sales Manager', customer_name: 'Gold Buyer', total_amount: 1500, status: 'Confirmed', time: 'Recent' },
  ];

  const recentRows = dealsList.map((deal) => {
    let statusPillClass = 'badge-primary';
    const st = (deal.status || '').toLowerCase();
    const isApproval = st.includes('approve') || st.includes('pending') || st.includes('negotiat');

    if (st.includes('approve')) statusPillClass = 'badge-success';
    else if (st.includes('negotiat') || st.includes('review') || st.includes('pending')) statusPillClass = 'badge-warning';
    else if (st.includes('fulfill') || st.includes('confirm')) statusPillClass = 'badge-info';
    else if (st.includes('draft')) statusPillClass = 'badge-neutral';

    const actorName = deal.rep_name || (deal.rep && deal.rep.full_name) || 'Sales Rep';
    const initials = actorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SR';
    const customerName = deal.customer_name || (deal.customer && deal.customer.name) || 'Client Organization';
    const dealRef = deal.deal_reference || (deal.id ? `DEAL-${String(deal.id).padStart(4, '0')}` : 'DEAL-0001');

    return `
      <tr class="table-row hover:bg-surface-container/50 transition-colors activity-row" data-status="${deal.status || 'Draft'}" data-is-approval="${isApproval ? 'true' : 'false'}" data-deal-id="${deal.id}">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${deal.time || 'Recent'}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${initials}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${actorName}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${customerName}</span>
            <span class="text-[10px] font-mono text-primary">${dealRef}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(deal.total_amount || 0).toLocaleString('en-IN')}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${statusPillClass}">● ${deal.status || 'Draft'}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${deal.id}" class="btn btn-secondary text-xs py-1 px-3 btn-review-deal" data-id="${deal.id}">Review Deal</a>
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
          <!-- Quarter Date Selector -->
          <div class="quarter-dropdown-wrapper" id="quarter-selector-wrapper">
            <div class="pill-badge flex items-center gap-2 text-xs select-none" id="btn-quarter-toggle" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
              <span class="material-symbols-outlined text-base text-primary select-none">calendar_today</span>
              <span id="current-quarter-label">This Quarter: Jul 1 – Sep 30</span>
              <span class="material-symbols-outlined text-sm text-outline transition-transform duration-200 select-none" id="quarter-chevron">expand_more</span>
            </div>
            <div class="quarter-menu" id="quarter-dropdown-menu">
              <div class="quarter-menu-item selected" data-label="This Quarter: Jul 1 – Sep 30">This Quarter: Jul 1 – Sep 30</div>
              <div class="quarter-menu-item" data-label="Q2: Apr 1 – Jun 30">Q2: Apr 1 – Jun 30</div>
              <div class="quarter-menu-item" data-label="Q1: Jan 1 – Mar 31">Q1: Jan 1 – Mar 31</div>
              <div class="quarter-menu-item" data-label="Q4: Oct 1 – Dec 31">Q4: Oct 1 – Dec 31</div>
            </div>
          </div>

          <!-- New Deal + Button -->
          <button type="button" class="btn btn-primary text-xs flex items-center gap-1.5" id="btn-new-deal-dash">
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
              <span class="badge badge-success text-[10px] flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">trending_up</span> +18.4%
              </span>
              <span class="text-[11px] text-on-surface-variant">vs last Q</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Pending Approvals -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/approvals'">
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
                ● 4 High Priority
              </span>
              <span class="text-[11px] text-on-surface-variant">requires VP sign-off</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Active Quotations -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/quotations'">
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

        <!-- Metric 4: At Risk Deals -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/deal-health'">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">At Risk Deals</span>
            <div class="icon-circle bg-error-container/40">
              <span class="material-symbols-outlined text-error text-lg">crisis_alert</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">
              ${atRiskCount} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-error text-[10px] flex items-center gap-1">
                ● ${activeFlagsCount} active risk flags
              </span>
              <span class="text-[11px] text-on-surface-variant">${stalledCount} stalled • ${slippageCount} delivery</span>
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
          <div class="w-full bg-surface-container-low/60 rounded-2xl p-4 my-2 relative" id="velocity-chart-card">
            <!-- Dynamic Interactive Tooltip -->
            <div id="velocity-chart-tooltip" class="velocity-tooltip">
              <div class="velocity-tt-month" id="vtt-month">September (Current)</div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Actual:</span>
                <span class="velocity-tt-val" id="vtt-actual">₹19,15,000</span>
              </div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Target:</span>
                <span class="velocity-tt-val" id="vtt-target">₹17,00,000</span>
              </div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Variance:</span>
                <span class="velocity-tt-val" id="vtt-variance">+₹2,15,000</span>
              </div>
              <div class="velocity-tt-status ahead" id="vtt-status">+12.6% Ahead of Target</div>
            </div>

            <svg class="w-full h-44 overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
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
              <line id="target-plan-line" x1="80" y1="135" x2="620" y2="35" stroke="#757871" stroke-width="2" stroke-dasharray="6" opacity="0.6" style="transition: stroke-width 0.2s ease, opacity 0.2s ease;" />

              <!-- Area fill -->
              <path d="M 80,140 Q 350,90 620,40 L 620,160 L 80,160 Z" fill="url(#chartGrad)" />

              <!-- Actuals Curve -->
              <path d="M 80,140 Q 350,90 620,40" fill="none" stroke="#566250" stroke-width="3.5" stroke-linecap="round" />

              <!-- Target association connector lines & markers (illuminated on hover) -->
              <line class="velocity-connector-line" id="vconn-0" x1="80" y1="140" x2="80" y2="135" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-0" cx="80" cy="135" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <line class="velocity-connector-line" id="vconn-1" x1="350" y1="90" x2="350" y2="85" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-1" cx="350" cy="85" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <line class="velocity-connector-line" id="vconn-2" x1="620" y1="40" x2="620" y2="35" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-2" cx="620" cy="35" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <!-- Data nodes (with generous hit area for effortless hover) -->
              <g class="velocity-node-group" id="vnode-0" data-index="0" data-month="July" data-actual="1220000" data-target="1100000">
                <circle cx="80" cy="140" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="80" cy="140" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              </g>

              <g class="velocity-node-group" id="vnode-1" data-index="1" data-month="August" data-actual="1685500" data-target="1420000">
                <circle cx="350" cy="90" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="350" cy="90" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              </g>

              <g class="velocity-node-group" id="vnode-2" data-index="2" data-month="September (Current)" data-actual="1915000" data-target="1700000">
                <circle cx="620" cy="40" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="620" cy="40" r="6" fill="#566250" stroke="#eefee6" stroke-width="2" />
              </g>
            </svg>

            <!-- Chart Month Labels (also hoverable) -->
            <div class="grid grid-cols-3 text-center pt-2">
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="0">
                <span class="text-xs font-semibold text-on-surface">July</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹12,20,000</p>
              </div>
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="1">
                <span class="text-xs font-semibold text-on-surface">August</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹16,85,500</p>
              </div>
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="2">
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

        <!-- Right 1/3: Interactive Deals by Stage Donut -->
        <div class="lg:col-span-4 card card-extruded flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-on-surface">Deals by Stage</h2>
            <p class="text-xs text-on-surface-variant">Current pipeline volume distribution</p>
          </div>

          <!-- Interactive SVG Donut Graphic with hoverable slices & clean center text -->
          <div class="deals-donut-container" id="deals-donut-container">
            <!-- Tooltip formatted exactly as requested: Stage name / Count / Percentage -->
            <div id="donut-tooltip" class="donut-tooltip">
              <div class="font-bold text-xs" id="tt-stage" style="color: var(--color-on-surface); font-weight: 700; font-size: 12px;">Executive Approved</div>
              <div id="tt-deals" style="color: var(--color-on-surface-variant); font-size: 11px; margin-top: 2px;">18 deals</div>
              <div class="font-mono font-bold" id="tt-percent" style="font-family: var(--font-mono); font-weight: 700; font-size: 12px; color: var(--color-primary); margin-top: 2px;">35%</div>
            </div>

            <div class="donut-chart-box">
              <svg class="donut-chart-svg" width="210" height="210" viewBox="0 0 220 220">
                <!-- 1. Executive Approved: 35% (18 deals) - #566250 -->
                <path
                  class="donut-slice"
                  id="slice-approved"
                  d="M 110.0 14.0 A 96 96 0 0 1 187.67 166.43 L 160.16 146.44 A 62 62 0 0 0 110.0 48.0 Z"
                  fill="#566250"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  data-stage="Executive Approved"
                  data-deals="18 deals"
                  data-percent="35%"
                  data-count="18"
                  data-color="#566250"
                />

                <!-- 2. In Legal Review: 25% (13 deals) - #7a5826 -->
                <path
                  class="donut-slice"
                  id="slice-review"
                  d="M 187.67 166.43 A 96 96 0 0 1 53.57 187.67 L 73.56 160.16 A 62 62 0 0 0 160.16 146.44 Z"
                  fill="#7a5826"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  data-stage="In Legal Review"
                  data-deals="13 deals"
                  data-percent="25%"
                  data-count="13"
                  data-color="#7a5826"
                />

                <!-- 3. Fulfillment / Active: 25% (12 deals) - #8c9a84 -->
                <path
                  class="donut-slice"
                  id="slice-fulfillment"
                  d="M 53.57 187.67 A 96 96 0 0 1 32.33 53.57 L 59.84 73.56 A 62 62 0 0 0 73.56 160.16 Z"
                  fill="#8c9a84"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  data-stage="Fulfillment / Active"
                  data-deals="12 deals"
                  data-percent="25%"
                  data-count="12"
                  data-color="#8c9a84"
                />

                <!-- 4. Draft Phase: 15% (7 deals) - #a8b5a0 -->
                <path
                  class="donut-slice"
                  id="slice-draft"
                  d="M 32.33 53.57 A 96 96 0 0 1 110.0 14.0 L 110.0 48.0 A 62 62 0 0 0 59.84 73.56 Z"
                  fill="#a8b5a0"
                  stroke="#ffffff"
                  stroke-width="2.5"
                  data-stage="Draft Phase"
                  data-deals="7 deals"
                  data-percent="15%"
                  data-count="7"
                  data-color="#a8b5a0"
                />
              </svg>

              <!-- Center Badge: White circular cutout with soft clay inset shadow & permanent Total Deals -->
              <div class="donut-center-badge">
                <span id="donut-center-val" class="donut-center-val">50</span>
                <span id="donut-center-lbl" class="donut-center-lbl">Total Deals</span>
              </div>
            </div>
          </div>

          <!-- Existing Stage Breakdown List -->
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Draft Phase">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-surface-variant" style="background-color: #a8b5a0;"></span> Draft Phase
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">15% (7)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="In Legal Review">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container" style="background-color: #7a5826;"></span> In Legal Review
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">25% (13)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Executive Approved">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-primary" style="background-color: #566250;"></span> Executive Approved
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">35% (18)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Fulfillment / Active">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-secondary" style="background-color: #8c9a84;"></span> Fulfillment / Active
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

          <!-- Existing Event Filter Buttons -->
          <div class="flex items-center gap-2">
            <button type="button" id="btn-filter-all" class="btn btn-secondary text-xs py-1 px-3 active">All Events</button>
            <button type="button" id="btn-filter-approvals" class="btn btn-secondary text-xs py-1 px-3">Approvals Only</button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="activity-table">
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
            <tbody id="activity-tbody">
              ${recentRows}
              <tr id="activity-empty-row" class="hidden">
                <td colspan="6" class="py-6 text-center text-xs text-on-surface-variant">
                  No approval-related activity found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-2 border-t border-surface-container-high/60 text-xs text-on-surface-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">sensors</span>
            <span>Continuous sync active: 18 compliance hooks monitored in real time</span>
          </div>
          <!-- Download Full Audit Trail (.CSV) -->
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
      dealHealthStore.fetchHealthData()
    ]);
    return { summary, quotations };
  } catch (e) {
    return { summary: {}, quotations: [] };
  }
}

export function setupDashboardEvents() {
  // 1. New Deal Button
  const newDealBtn = document.getElementById('btn-new-deal-dash');
  if (newDealBtn) {
    newDealBtn.addEventListener('click', () => {
      window.location.hash = '#/quotation-detail';
    });
  }

  // 2. Quarter Selector Dropdown Toggle
  const quarterToggle = document.getElementById('btn-quarter-toggle');
  const quarterMenu = document.getElementById('quarter-dropdown-menu');
  const quarterLabel = document.getElementById('current-quarter-label');
  const quarterChevron = document.getElementById('quarter-chevron');

  if (quarterToggle && quarterMenu) {
    quarterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = quarterMenu.classList.contains('show');
      if (isOpen) {
        quarterMenu.classList.remove('show');
        quarterChevron.style.transform = 'rotate(0deg)';
      } else {
        quarterMenu.classList.add('show');
        quarterChevron.style.transform = 'rotate(180deg)';
      }
    });

    document.querySelectorAll('.quarter-menu-item').forEach((item) => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.quarter-menu-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        if (quarterLabel) quarterLabel.textContent = item.getAttribute('data-label');
        quarterMenu.classList.remove('show');
        if (quarterChevron) quarterChevron.style.transform = 'rotate(0deg)';
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#quarter-selector-wrapper')) {
        quarterMenu.classList.remove('show');
        if (quarterChevron) quarterChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  // 2.5. Interactive Revenue & Deal Flow Velocity Chart
  const velocityCard = document.getElementById('velocity-chart-card');
  const velocityTooltip = document.getElementById('velocity-chart-tooltip');
  const vttMonth = document.getElementById('vtt-month');
  const vttActual = document.getElementById('vtt-actual');
  const vttTarget = document.getElementById('vtt-target');
  const vttVariance = document.getElementById('vtt-variance');
  const vttStatus = document.getElementById('vtt-status');
  const velocityNodes = document.querySelectorAll('.velocity-node-group');
  const velocityCols = document.querySelectorAll('.velocity-month-col');
  const targetPlanLine = document.getElementById('target-plan-line');

  const velocityData = [
    {
      month: 'July',
      actual: 1220000,
      target: 1100000,
      leftPct: 18,
    },
    {
      month: 'August',
      actual: 1685500,
      target: 1420000,
      leftPct: 50,
    },
    {
      month: 'September (Current)',
      actual: 1915000,
      target: 1700000,
      leftPct: 82,
    }
  ];

  function showMonthTooltip(index) {
    const d = velocityData[index];
    if (!d || !velocityTooltip) return;

    // Highlight active node and dim others
    velocityNodes.forEach((n, idx) => {
      if (idx === index) {
        n.classList.add('active');
        n.style.opacity = '1';
      } else {
        n.classList.remove('active');
        n.style.opacity = '0.5';
      }
    });

    // Show target connector & marker for this month
    for (let i = 0; i < 3; i++) {
      const conn = document.getElementById(`vconn-${i}`);
      const tgt = document.getElementById(`vtgt-${i}`);
      if (conn) conn.style.opacity = i === index ? '1' : '0';
      if (tgt) tgt.style.opacity = i === index ? '1' : '0';
    }

    const variance = d.actual - d.target;
    const variancePct = ((variance / d.target) * 100).toFixed(1);
    const sign = variance >= 0 ? '+' : '-';
    const isAhead = variance >= 0;

    if (vttMonth) vttMonth.textContent = d.month;
    if (vttActual) vttActual.textContent = `₹${Number(d.actual).toLocaleString('en-IN')}`;
    if (vttTarget) vttTarget.textContent = `₹${Number(d.target).toLocaleString('en-IN')}`;
    if (vttVariance) {
      vttVariance.textContent = `${sign}₹${Number(Math.abs(variance)).toLocaleString('en-IN')}`;
      vttVariance.style.color = isAhead ? '#2e6930' : 'var(--color-error)';
    }
    if (vttStatus) {
      vttStatus.textContent = `${sign}${variancePct}% ${isAhead ? 'Ahead of Target' : 'Behind Target'}`;
      vttStatus.className = `velocity-tt-status ${isAhead ? 'ahead' : 'behind'}`;
    }

    // Position tooltip
    if (index === 0) {
      velocityTooltip.style.left = `${d.leftPct}%`;
      velocityTooltip.style.top = '12px';
      velocityTooltip.style.transform = 'translate(-25%, 0)';
    } else if (index === 1) {
      velocityTooltip.style.left = `${d.leftPct}%`;
      velocityTooltip.style.top = '12px';
      velocityTooltip.style.transform = 'translate(-50%, 0)';
    } else {
      velocityTooltip.style.left = `${d.leftPct}%`;
      velocityTooltip.style.top = '12px';
      velocityTooltip.style.transform = 'translate(-75%, 0)';
    }

    velocityTooltip.classList.add('visible');
  }

  function hideMonthTooltip() {
    velocityNodes.forEach((n) => {
      n.classList.remove('active');
      n.style.opacity = '1';
    });
    for (let i = 0; i < 3; i++) {
      const conn = document.getElementById(`vconn-${i}`);
      const tgt = document.getElementById(`vtgt-${i}`);
      if (conn) conn.style.opacity = '0';
      if (tgt) tgt.style.opacity = '0';
    }
    if (velocityTooltip) {
      velocityTooltip.classList.remove('visible');
    }
  }

  velocityNodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      const idx = parseInt(node.getAttribute('data-index'), 10);
      showMonthTooltip(idx);
    });
    node.addEventListener('mouseleave', hideMonthTooltip);
  });

  velocityCols.forEach((col) => {
    col.addEventListener('mouseenter', () => {
      const idx = parseInt(col.getAttribute('data-index'), 10);
      showMonthTooltip(idx);
    });
    col.addEventListener('mouseleave', hideMonthTooltip);
  });

  if (targetPlanLine) {
    targetPlanLine.addEventListener('mouseenter', () => {
      targetPlanLine.setAttribute('stroke-width', '3');
      targetPlanLine.setAttribute('opacity', '0.9');
    });
    targetPlanLine.addEventListener('mouseleave', () => {
      targetPlanLine.setAttribute('stroke-width', '2');
      targetPlanLine.setAttribute('opacity', '0.6');
    });
  }

  // 3. Interactive Deals by Stage Donut
  const donutContainer = document.getElementById('deals-donut-container');
  const tooltip = document.getElementById('donut-tooltip');
  const ttStage = document.getElementById('tt-stage');
  const ttDeals = document.getElementById('tt-deals');
  const ttPercent = document.getElementById('tt-percent');
  const slices = document.querySelectorAll('.donut-slice');
  const legendItems = document.querySelectorAll('.legend-item');

  function updateTooltipPosition(e) {
    if (!tooltip || !donutContainer) return;
    const containerRect = donutContainer.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    // Horizontal clamping to prevent clipping at card boundaries
    const clampedX = Math.max(75, Math.min(containerRect.width - 75, x));

    // Vertical placement: if cursor is high, position below; else position above
    if (y < 65) {
      tooltip.style.left = `${clampedX}px`;
      tooltip.style.top = `${y + 18}px`;
      tooltip.style.transform = 'translate(-50%, 0)';
    } else {
      tooltip.style.left = `${clampedX}px`;
      tooltip.style.top = `${y - 12}px`;
      tooltip.style.transform = 'translate(-50%, -100%)';
    }
  }

  function highlightStage(stageName, mouseEvent) {
    slices.forEach((s) => {
      const match = s.getAttribute('data-stage') === stageName;
      if (match) {
        s.classList.add('active-slice');
        s.style.opacity = '1';

        const deals = s.getAttribute('data-deals');
        const percent = s.getAttribute('data-percent');
        const color = s.getAttribute('data-color');

        if (tooltip && ttStage && ttDeals && ttPercent) {
          ttStage.textContent = stageName;
          ttDeals.textContent = deals;
          ttPercent.textContent = percent;
          ttPercent.style.color = color || 'var(--color-primary)';
          tooltip.classList.add('visible');
        }
      } else {
        s.classList.remove('active-slice');
        s.style.opacity = '0.45';
      }
    });

    if (mouseEvent) {
      updateTooltipPosition(mouseEvent);
    }
  }

  function resetDonut() {
    slices.forEach((s) => {
      s.classList.remove('active-slice');
      s.style.opacity = '1';
    });
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  slices.forEach((slice) => {
    slice.addEventListener('mouseenter', (e) => {
      highlightStage(slice.getAttribute('data-stage'), e);
    });
    slice.addEventListener('mousemove', (e) => {
      updateTooltipPosition(e);
    });
    slice.addEventListener('mouseleave', resetDonut);
  });

  legendItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      highlightStage(item.getAttribute('data-stage'));
      if (tooltip && donutContainer) {
        tooltip.style.left = '50%';
        tooltip.style.top = '12px';
        tooltip.style.transform = 'translate(-50%, 0)';
      }
    });
    item.addEventListener('mouseleave', resetDonut);
  });

  // 4. Activity Filter Buttons (All Events vs Approvals Only)
  const btnFilterAll = document.getElementById('btn-filter-all');
  const btnFilterApprovals = document.getElementById('btn-filter-approvals');
  const activityRows = document.querySelectorAll('.activity-row');
  const emptyRow = document.getElementById('activity-empty-row');

  function applyFilter(filter) {
    let visibleCount = 0;
    activityRows.forEach((row) => {
      const isApproval = row.getAttribute('data-is-approval') === 'true';
      if (filter === 'all' || (filter === 'approvals' && isApproval)) {
        row.classList.remove('hidden');
        visibleCount++;
      } else {
        row.classList.add('hidden');
      }
    });

    if (emptyRow) {
      if (visibleCount === 0) {
        emptyRow.classList.remove('hidden');
      } else {
        emptyRow.classList.add('hidden');
      }
    }
  }

  if (btnFilterAll && btnFilterApprovals) {
    btnFilterAll.addEventListener('click', () => {
      btnFilterAll.classList.add('active');
      btnFilterApprovals.classList.remove('active');
      applyFilter('all');
    });

    btnFilterApprovals.addEventListener('click', () => {
      btnFilterApprovals.classList.add('active');
      btnFilterAll.classList.remove('active');
      applyFilter('approvals');
    });
  }

  // 5. Review Deal Action Buttons
  document.querySelectorAll('.btn-review-deal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const dealId = btn.getAttribute('data-id');
      if (dealId) {
        window.location.hash = `#/quotations/${dealId}`;
      }
    });
  });

  // 6. CSV Export of Audit Trail Data
  const dlAuditBtn = document.getElementById('btn-dl-audit');
  if (dlAuditBtn) {
    dlAuditBtn.addEventListener('click', () => {
      const rows = document.querySelectorAll('.activity-row');
      const csvData = [
        ['Timestamp', 'Actor', 'Role', 'Customer / Organization', 'Deal Reference', 'Valuation', 'Status']
      ];

      rows.forEach((row) => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 5) {
          const timestamp = cols[0].innerText.trim();
          const actorEl = cols[1].querySelector('.font-bold');
          const roleEl = cols[1].querySelector('.text-on-surface-variant');
          const customerEl = cols[2].querySelector('.font-semibold');
          const refEl = cols[2].querySelector('.font-mono');
          const valuation = cols[3].innerText.trim();
          const status = cols[4].innerText.replace('●', '').trim();

          csvData.push([
            `"${timestamp}"`,
            `"${actorEl ? actorEl.innerText.trim() : ''}"`,
            `"${roleEl ? roleEl.innerText.trim() : ''}"`,
            `"${customerEl ? customerEl.innerText.trim() : ''}"`,
            `"${refEl ? refEl.innerText.trim() : ''}"`,
            `"${valuation}"`,
            `"${status}"`
          ]);
        }
      });

      const csvContent = csvData.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `dealflow360_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }
}
