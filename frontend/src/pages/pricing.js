import { api } from '../api.js';

export async function loadPricing() {
  try {
    return await api.get('/discount-rules');
  } catch (err) {
    console.error('Failed to load discount rules', err);
    return { tiers: [], categories: [], chains: [] };
  }
}

export function renderPricingPage(data) {
  const tiers = data.tiers || [];
  const categories = data.categories || [];
  const chains = data.chains || [];

  const tierOrder = { Bronze: 1, Silver: 2, Gold: 3 };
  tiers.sort((a, b) => (tierOrder[a.customer_tier] || 99) - (tierOrder[b.customer_tier] || 99));

  const tierRowsHtml = tiers.map((t, idx) => `
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="tier-name-${idx}" value="${t.customer_tier}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="tier-disc-${idx}" value="${t.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join('');

  const catRowsHtml = categories.map((c, idx) => `
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="cat-name-${idx}" value="${c.category}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="cat-disc-${idx}" value="${c.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="page-container space-y-6" data-tiers-count="${tiers.length}" data-categories-count="${categories.length}">
      
      <!-- Top Title Bar -->
      <div style="background-color: var(--color-primary-container); color: var(--color-on-primary-container); padding: 1rem 1.5rem; border-radius: var(--radius-md) var(--radius-md) 0 0; margin-bottom: -1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <span class="text-sm font-bold">DealFlow360</span>
      </div>

      <!-- Main Panel (Dark in Wireframe, Using Clay in real app) -->
      <div class="card card-extruded space-y-6" style="border-top-left-radius: 0; border-top-right-radius: 0;">
        <h1 class="text-2xl font-bold tracking-tight text-on-surface mb-2">Discount tiers and approval chains</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Top Left Table -->
          <div class="space-y-3">
            <span class="text-sm text-on-surface-variant px-1 font-semibold">Tier Discount Ceilings</span>
            <div class="clay-table-wrapper" style="border: 1px solid var(--color-surface-container-high); border-radius: 20px;">
              <table class="clay-table" style="font-size: 14px;">
                <thead>
                  <tr style="background: transparent;">
                    <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Tier</th>
                    <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Max Discount</th>
                  </tr>
                </thead>
                <tbody>
                  ${tierRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Top Right Table -->
          <div class="space-y-3">
            <span class="text-sm text-on-surface-variant px-1 font-semibold">Category Discount ceilings</span>
            <div class="clay-table-wrapper" style="border: 1px solid var(--color-surface-container-high); border-radius: 20px;">
              <table class="clay-table" style="font-size: 14px;">
                <thead>
                  <tr style="background: transparent;">
                    <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Category</th>
                    <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Max Discount</th>
                  </tr>
                </thead>
                <tbody>
                  ${catRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Bottom Table -->
        <div class="space-y-3 pt-4">
          <span class="text-sm text-on-surface-variant px-1 font-semibold">Tier Discount Ceilings</span>
          <div class="clay-table-wrapper" style="border: 1px solid var(--color-surface-container-high); border-radius: 20px;">
            <table class="clay-table" style="font-size: 14px;">
              <thead>
                <tr style="background: transparent;">
                  <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Discount range</th>
                  <th style="font-size: 14px; text-transform: none; color: var(--color-on-surface); font-weight: normal; border-bottom: 1px solid var(--color-surface-container-high);">Max Discount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: transparent;">
                  <td class="text-on-surface">Within tier/Category limit</td>
                  <td class="text-on-surface">No approval needed</td>
                </tr>
                <tr style="background: transparent;">
                  <td class="text-on-surface">Over Limit,blended risk medium</td>
                  <td class="text-on-surface">Sales manager</td>
                </tr>
                <tr style="background: transparent;">
                  <td class="text-on-surface">Over limit,blended high risk</td>
                  <td class="text-on-surface">Sales manager then finance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-4">
          <button id="btn-save-config" type="button" class="btn btn-primary" style="padding: 0.6rem 2rem; background-color: #5AA1E3; color: white; border-radius: 8px;">
            Save configuration
          </button>
        </div>

      </div>
    </div>
  `;
}

export function setupPricingEvents() {
  const saveBtn = document.getElementById('btn-save-config');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      const container = document.querySelector('.page-container');
      const numTiers = parseInt(container.getAttribute('data-tiers-count')) || 0;
      const numCats = parseInt(container.getAttribute('data-categories-count')) || 0;

      const payload = {
        tiers: [],
        categories: [],
        chains: [
          { min_score: 1.0, required_level: "MANAGER_ONLY" }
        ]
      };

      for(let i=0; i<numTiers; i++) {
        payload.tiers.push({
          customer_tier: document.getElementById('tier-name-'+i).value,
          max_discount_percent: parseFloat(document.getElementById('tier-disc-'+i).value)
        });
      }

      for(let i=0; i<numCats; i++) {
        payload.categories.push({
          category: document.getElementById('cat-name-'+i).value,
          max_discount_percent: parseFloat(document.getElementById('cat-disc-'+i).value)
        });
      }

      try {
        await api.put('/discount-rules', payload);
        alert('Configuration saved successfully!');
        window.location.reload();
      } catch (err) {
        alert('Error saving configuration: ' + err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save configuration';
      }
    });
  }
}
