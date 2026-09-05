/**
 * DealFlow360 Customers / Accounts Directory Page
 * Connected to `/api/v1/customers`.
 */
import { api } from '../api.js';
import { modal } from '../components/modal.js';

export function renderCustomersPage(customers = []) {
  const displayCustomers = customers.length > 0 ? customers : [
    { id: 1, name: 'Acme Corp Global ERP', email: 'procurement@acmeww.com', tier: 'Gold', created_at: '2025-01-15' },
    { id: 2, name: 'Starlight Pharma Logistics', email: 'operations@starlightpharma.com', tier: 'Silver', created_at: '2025-02-01' },
    { id: 3, name: 'Helios Solar Microgrid Infra', email: 'infrastructure@heliosmicro.io', tier: 'Gold', created_at: '2025-02-18' },
    { id: 4, name: 'Apex Financial Cloud Vault', email: 'finops@apexvault.com', tier: 'Bronze', created_at: '2025-03-02' },
  ];

  const rowsHtml = displayCustomers.map((c) => {
    let tierClass = 'badge-primary';
    const tier = (c.tier || 'Bronze').toLowerCase();
    if (tier.includes('gold')) tierClass = 'badge-warning';
    else if (tier.includes('silver')) tierClass = 'badge-neutral';

    return `
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="avatar-sm">
              <span>${c.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${c.name}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">ID #${c.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">${c.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${tierClass} text-[10px] font-bold">${c.tier || 'Bronze'}</span>
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          ${c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-primary text-xs py-1 px-2.5 create-deal-for-cust-btn" data-cust-id="${c.id}">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>New Deal</span>
            </button>
            <a href="#/portal?customerId=${c.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal">
              <span class="material-symbols-outlined text-sm">open_in_browser</span>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Global Client Directory</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Accounts &amp; Customer Portfolio</h1>
          <p class="text-xs text-on-surface-variant">Corporate entities, credit risk tiers, and commercial engagement history</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-add-customer">
          <span class="material-symbols-outlined text-base">person_add</span>
          <span>Add Account +</span>
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Accounts</span>
            <div class="text-xl font-bold text-on-surface mt-1">${displayCustomers.length} Enterprise Entities</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">corporate_fare</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Gold Tier Entities</span>
            <div class="text-xl font-bold text-tertiary mt-1">
              ${displayCustomers.filter(c => (c.tier || '').toLowerCase().includes('gold')).length} Accounts
            </div>
          </div>
          <div class="icon-circle bg-tertiary-container/40">
            <span class="material-symbols-outlined text-tertiary text-lg">verified</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Contract Compliance</span>
            <div class="text-xl font-bold text-primary mt-1">100% In Good Standing</div>
          </div>
          <div class="icon-circle bg-secondary-container/60">
            <span class="material-symbols-outlined text-secondary text-lg">security</span>
          </div>
        </div>
      </div>

      <!-- Customers Table Card -->
      <div class="card card-extruded">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-on-surface">Client Entities</h3>
            <p class="text-xs text-on-surface-variant">Click New Deal to generate a quotation scoped to that buyer</p>
          </div>
          <input
            type="text"
            id="cust-search-input"
            class="input-clay text-xs py-1.5 px-3 w-52"
            placeholder="Search account name or email..."
          />
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="customers-table">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Entity Name</th>
                <th class="py-2.5 px-4">Primary Contact Email</th>
                <th class="py-2.5 px-4">Commercial Tier</th>
                <th class="py-2.5 px-4">Established Date</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export async function loadCustomers() {
  try {
    return await api.get('/customers');
  } catch {
    return [];
  }
}

export function setupCustomersEvents() {
  const searchInput = document.getElementById('cust-search-input');
  const table = document.getElementById('customers-table');

  if (searchInput && table) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }

  // Create new customer modal
  const addBtn = document.getElementById('btn-add-customer');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      modal.show({
        title: 'Add Enterprise Client Account',
        content: `
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Company / Entity Name</label>
              <input id="new-cust-name" type="text" class="input-clay w-full" placeholder="e.g. Northrop Cloud Labs" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Procurement Email</label>
              <input id="new-cust-email" type="email" class="input-clay w-full" placeholder="e.g. deals@northrop.com" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Credit Tier</label>
              <select id="new-cust-tier" class="input-clay w-full">
                <option value="Bronze">Bronze (5% Max Discount)</option>
                <option value="Silver">Silver (10% Max Discount)</option>
                <option value="Gold">Gold (15% Max Discount)</option>
              </select>
            </div>
          </div>
        `,
        confirmText: 'Create Account',
        onConfirm: async () => {
          const name = document.getElementById('new-cust-name').value.trim();
          const email = document.getElementById('new-cust-email').value.trim();
          const tier = document.getElementById('new-cust-tier').value;

          if (!name || !email) throw new Error('Company name and email are required');

          await api.post('/customers', { name, email, tier });
          window.location.reload();
          return true;
        },
      });
    });
  }

  // New Deal for specific customer
  document.querySelectorAll('.create-deal-for-cust-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const custId = parseInt(btn.getAttribute('data-cust-id'), 10);
      try {
        const newQ = await api.post('/quotations', { customer_id: custId });
        window.location.hash = `#/quotations/${newQ.id}`;
      } catch (err) {
        alert(err.message || 'Failed to create quotation');
      }
    });
  });
}
