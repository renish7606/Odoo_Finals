/**
 * DealFlow360 Admin Reporting Dashboard Page
 * Connected to `/api/v1/reports/kpis`
 */
import { api } from '../api.js';

let currentFilters = {
  period: 'This Month',
  status: 'All Statuses',
  product: 'All Products'
};

export async function loadReports(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const kpis = await api.get(`/reports/kpis?${query}`).catch(() => null);
    return { kpis };
  } catch {
    return { kpis: null };
  }
}

export function renderReportsPage(data = {}) {
  const kpis = data.kpis || {
    quotes_created: 0,
    avg_approval_time_hours: 0,
    top_upsold_product: 'None'
  };

  const periodText = currentFilters.period.toLowerCase();

  return `
    <div class="page-container" style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">Admin / Reporting Dashboard (Optional)</h1>
        <p class="text-sm text-on-surface-variant mt-1">Sales trends, approval bottlenecks and platform usage</p>
      </div>

      <!-- Filters -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Period</label>
          <select id="filter-period" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option ${currentFilters.period === 'This Month' ? 'selected' : ''}>This Month</option>
            <option ${currentFilters.period === 'Last Month' ? 'selected' : ''}>Last Month</option>
            <option ${currentFilters.period === 'Q3' ? 'selected' : ''}>Q3</option>
            <option ${currentFilters.period === 'YTD' ? 'selected' : ''}>YTD</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Sales Team</label>
          <select id="filter-team" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option>All Teams</option>
            <option>Enterprise Mid-Market</option>
            <option>SMB</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Approval Status</label>
          <select id="filter-status" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option ${currentFilters.status === 'All Statuses' ? 'selected' : ''}>All Statuses</option>
            <option ${currentFilters.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option ${currentFilters.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${currentFilters.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Product</label>
          <select id="filter-product" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option ${currentFilters.product === 'All Products' ? 'selected' : ''}>All Products</option>
            <option ${currentFilters.product === 'Care Plan 2yr' ? 'selected' : ''}>Care Plan 2yr</option>
            <option ${currentFilters.product === 'Business Service' ? 'selected' : ''}>Business Service</option>
          </select>
        </div>
      </div>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Quotes Created</div>
          <div class="text-sm text-on-surface-variant" id="kpi-quotes">${kpis.quotes_created} ${periodText}</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Avg Approval Time</div>
          <div class="text-sm text-on-surface-variant" id="kpi-time">${kpis.avg_approval_time_hours} hours</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Top Upsold Product</div>
          <div class="text-sm text-on-surface-variant" id="kpi-product">${kpis.top_upsold_product}</div>
        </div>

      </div>

      <!-- Actions -->
      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
        <button type="button" class="btn btn-secondary" style="padding: 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--color-on-surface-variant); color: var(--color-on-surface);" id="btn-export-pdf">
          Export PDF
        </button>
      </div>

    </div>
  `;
}

export function setupReportsEvents() {
  const updateDashboard = async () => {
    currentFilters = {
      period: document.getElementById('filter-period').value,
      status: document.getElementById('filter-status').value,
      product: document.getElementById('filter-product').value
    };

    const data = await loadReports(currentFilters);
    if (data && data.kpis) {
      document.getElementById('kpi-quotes').textContent = `${data.kpis.quotes_created} ${currentFilters.period.toLowerCase()}`;
      document.getElementById('kpi-time').textContent = `${data.kpis.avg_approval_time_hours} hours`;
      document.getElementById('kpi-product').textContent = `${data.kpis.top_upsold_product}`;
    }
  };

  document.getElementById('filter-period')?.addEventListener('change', updateDashboard);
  document.getElementById('filter-status')?.addEventListener('change', updateDashboard);
  document.getElementById('filter-product')?.addEventListener('change', updateDashboard);
  // Team filter is decorative based on backend capabilities, but we still listen to it
  document.getElementById('filter-team')?.addEventListener('change', updateDashboard);

  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    const params = new URLSearchParams({
      period: document.getElementById('filter-period')?.value || 'This Month',
      status: document.getElementById('filter-status')?.value || 'All Statuses',
      product: document.getElementById('filter-product')?.value || 'All Products',
    });
    // Try relative path first (works with Vite dev proxy), fall back to direct backend
    const baseUrl = window.location.port === '5173' ? '' : 'http://localhost:8000';
    window.open(`${baseUrl}/api/v1/reports/export/pdf?${params.toString()}`, '_blank');
  });
}
