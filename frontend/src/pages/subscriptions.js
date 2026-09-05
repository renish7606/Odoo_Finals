/**
 * DealFlow360 Subscriptions Management Page
 * Connected to `/api/v1/subscriptions/plans`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderSubscriptionsPage(plans = []) {
  const displayPlans = plans.length > 0 ? plans : [
    { id: 1, name: 'Enterprise M&A Platform Core', cadence: 'Annual', price: 120000, description: 'Unlimited deals, SOC2 audit telemetry, custom ERP connectors and dedicated cluster.' },
    { id: 2, name: 'Deal Desk Executive Seat', cadence: 'Monthly', price: 350, description: 'Individual deal builder, discount escalation approval authority, and audit rights.' },
    { id: 3, name: 'Mission-Critical 24/7 Support SLA', cadence: 'Annual', price: 45000, description: 'Sub-15 minute incident response with named technical account manager.' },
  ];

  const planCardsHtml = displayPlans.map((plan) => `
    <div class="card card-extruded flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between">
          <span class="badge badge-primary text-[10px]">${plan.cadence || 'Annual'}</span>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-base">sync</span>
          </div>
        </div>
        <h3 class="text-base font-bold text-on-surface mt-2">${plan.name}</h3>
        <p class="text-xs text-on-surface-variant mt-1">${plan.description || 'Configured recurring license plan'}</p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">Billing Rate</span>
          <span class="font-mono font-bold text-lg text-primary">₹${Number(plan.price).toLocaleString('en-IN')}</span>
          <span class="text-[10px] text-on-surface-variant">/ ${plan.cadence === 'Monthly' ? 'mo' : 'yr'}</span>
        </div>
        <button type="button" class="btn btn-secondary text-xs py-1.5 px-3 subscribe-plan-btn" data-plan-id="${plan.id}" data-plan-name="${plan.name}">
          <span>Attach to Deal</span>
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
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Recurring Revenue Engine</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Subscriptions &amp; ARR Management</h1>
          <p class="text-xs text-on-surface-variant">Recurring tier plans, mid-cycle seat proration, and automated contract renewals</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-add-plan">
          <span class="material-symbols-outlined text-base">add</span>
          <span>New Subscription Plan +</span>
        </button>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${planCardsHtml}
      </div>

      <!-- Proration & Upgrade Sandbox Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-3">
          <span class="material-symbols-outlined text-primary text-lg">calculate</span>
          <div>
            <h3 class="text-base font-bold text-on-surface">Mid-Cycle Seat Upgrade &amp; Proration Calculator</h3>
            <p class="text-xs text-on-surface-variant">Simulate delta charges when adding or upgrading commercial seats mid-term</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-on-surface-variant">Active Plan</label>
            <select class="input-clay w-full text-xs" id="prorate-plan">
              <option value="120000">Enterprise Core (₹120k/yr)</option>
              <option value="4200">Executive Seats (₹4,200/yr)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-on-surface-variant">Seats Added</label>
            <input type="number" id="prorate-seats" min="1" value="5" class="input-clay w-full text-xs" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-on-surface-variant">Days Remaining in Cycle</label>
            <input type="number" id="prorate-days" min="1" max="365" value="142" class="input-clay w-full text-xs" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-on-surface-variant">Computed Proration Delta</label>
            <div class="font-mono font-bold text-base text-primary p-2 rounded-lg bg-surface-container" id="prorate-result">
              ₹8,169.86
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function loadSubscriptions() {
  try {
    return await api.get('/subscriptions/plans').catch(() => []);
  } catch {
    return [];
  }
}

export function setupSubscriptionsEvents() {
  const calcSeats = document.getElementById('prorate-seats');
  const calcDays = document.getElementById('prorate-days');
  const resultEl = document.getElementById('prorate-result');

  const recalculate = () => {
    if (!calcSeats || !calcDays || !resultEl) return;
    const seats = parseFloat(calcSeats.value) || 0;
    const days = parseFloat(calcDays.value) || 0;
    const annualPerSeat = 4200;
    const proration = (annualPerSeat / 365) * days * seats;
    resultEl.textContent = `₹${proration.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (calcSeats) calcSeats.addEventListener('input', recalculate);
  if (calcDays) calcDays.addEventListener('input', recalculate);

  const addPlanBtn = document.getElementById('btn-add-plan');
  if (addPlanBtn) {
    addPlanBtn.addEventListener('click', () => {
      modal.show({
        title: 'New Subscription Plan',
        content: `
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Plan Name</label>
              <input id="plan-name-in" type="text" class="input-clay w-full" placeholder="e.g. AI Governance Addon" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Cadence</label>
              <select id="plan-cadence-in" class="input-clay w-full">
                <option value="Annual">Annual</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Base Rate (INR)</label>
              <input id="plan-price-in" type="number" class="input-clay w-full" placeholder="50000" />
            </div>
          </div>
        `,
        confirmText: 'Create Plan',
        onConfirm: async () => {
          const name = document.getElementById('plan-name-in').value.trim();
          const cadence = document.getElementById('plan-cadence-in').value;
          const price = parseFloat(document.getElementById('plan-price-in').value) || 0;
          if (!name) throw new Error('Plan name required');
          await api.post('/subscriptions/plans', { name, cadence, price });
          window.location.reload();
          return true;
        },
      });
    });
  }
}
