/**
 * DealFlow360 User Profile & Account Settings Page
 */
import { auth } from '../auth.js';

export function renderProfilePage() {
  const user = auth.getUser() || {
    full_name: 'Alice Johnson',
    email: 'salesrep@dealflow360.com',
    role: 'SalesRep',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    age: '28',
  };

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return `
    <div class="page-container max-w-4xl mx-auto space-y-6 py-4">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container-high/60 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Account Settings</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">User Profile</h1>
          <p class="text-xs text-on-surface-variant">Update your personal contact details, physical address, and manage active sessions</p>
        </div>

        <span class="badge badge-primary text-xs font-bold px-3 py-1.5 self-start sm:self-center">
          ${user.selected_role || user.role || 'Sales Representative'}
        </span>
      </div>

      <!-- Main Profile Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Left Column: User Summary Card (4 cols) -->
        <div class="md:col-span-4 space-y-4">
          <div class="card card-extruded flex flex-col items-center text-center p-6 space-y-4">
            <!-- Avatar Circle -->
            <div class="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-inner">
              <span class="font-bold text-3xl text-primary">${initials}</span>
            </div>

            <div>
              <h2 class="text-lg font-bold text-on-surface">${user.full_name || 'User Name'}</h2>
              <p class="text-xs text-on-surface-variant mt-0.5">${user.email || 'user@dealflow360.com'}</p>
              <span class="badge badge-neutral text-[10px] mt-2 font-mono">${user.selected_role || user.role || 'SalesRep'}</span>
            </div>

            <div class="w-full pt-4 border-t border-surface-container-high/60 space-y-2.5 text-left text-xs">
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Account Status</span>
                <span class="badge badge-success text-[10px]">Active</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Security Level</span>
                <span class="font-mono text-primary font-bold">2FA Enabled</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-on-surface-variant">Node Region</span>
                <span class="font-mono">US-East (Equinix NY4)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Personal Information Form (8 cols) -->
        <div class="md:col-span-8 space-y-6">
          <div class="card card-extruded p-6 space-y-5">
            <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-3">
              <span class="material-symbols-outlined text-primary text-xl">manage_accounts</span>
              <h3 class="text-base font-bold text-on-surface">Personal Information</h3>
            </div>

            <form id="profile-form" class="space-y-4">
              <!-- Row 1: Name & Email -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-on-surface flex items-center gap-1.5" for="prof-name">
                    <span class="material-symbols-outlined text-sm text-secondary">person</span>
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    id="prof-name"
                    value="${user.full_name || ''}"
                    class="input-field text-xs"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-on-surface flex items-center gap-1.5" for="prof-email">
                    <span class="material-symbols-outlined text-sm text-secondary">mail</span>
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    id="prof-email"
                    value="${user.email || ''}"
                    class="input-field text-xs bg-surface-container/60 cursor-not-allowed"
                    readonly
                    disabled
                  />
                  <span class="text-[10px] text-on-surface-variant">Primary workspace email</span>
                </div>
              </div>

              <!-- Row 2: Phone & Age -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-on-surface flex items-center gap-1.5" for="prof-phone">
                    <span class="material-symbols-outlined text-sm text-secondary">call</span>
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    id="prof-phone"
                    value="${user.phone || ''}"
                    class="input-field text-xs"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-on-surface flex items-center gap-1.5" for="prof-age">
                    <span class="material-symbols-outlined text-sm text-secondary">cake</span>
                    <span>Age</span>
                  </label>
                  <input
                    type="number"
                    id="prof-age"
                    min="18"
                    max="120"
                    value="${user.age || ''}"
                    class="input-field text-xs"
                    placeholder="e.g. 28"
                  />
                </div>
              </div>

              <!-- Row 3: Address -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-on-surface flex items-center gap-1.5" for="prof-address">
                  <span class="material-symbols-outlined text-sm text-secondary">home_pin</span>
                  <span>Physical Address</span>
                </label>
                <textarea
                  id="prof-address"
                  rows="3"
                  class="input-field text-xs py-2 resize-none"
                  placeholder="Enter your street address, city, state and zip code"
                >${user.address || ''}</textarea>
              </div>

              <!-- Save Actions -->
              <div class="pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
                <span id="profile-msg" class="text-xs font-bold text-success hidden flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  <span>Profile updated successfully!</span>
                </span>
                <button type="submit" class="btn btn-primary text-xs font-bold py-2 px-5 ml-auto flex items-center gap-1.5 rounded-xl shadow-sm">
                  <span class="material-symbols-outlined text-base">save</span>
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sign Out Section at the End of the Page -->
      <div class="card card-extruded border-l-4 border-error p-6 space-y-3 mt-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-error text-xl">logout</span>
              <h3 class="text-base font-bold text-on-surface">Sign Out of Workspace</h3>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">End your current session on this device. You will need to log in again to access quotations and messages.</p>
          </div>

          <button
            type="button"
            id="btn-profile-logout"
            class="btn btn-primary bg-error text-on-error hover:bg-error/90 text-xs font-bold py-2.5 px-6 rounded-xl self-start sm:self-center shadow-sm flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-base">power_settings_new</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupProfileEvents() {
  const form = document.getElementById('profile-form');
  const nameInput = document.getElementById('prof-name');
  const phoneInput = document.getElementById('prof-phone');
  const ageInput = document.getElementById('prof-age');
  const addressInput = document.getElementById('prof-address');
  const msgEl = document.getElementById('profile-msg');
  const logoutBtn = document.getElementById('btn-profile-logout');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim();
      if (!newName) return;

      const user = auth.getUser() || {};
      user.full_name = newName;
      user.phone = phoneInput ? phoneInput.value.trim() : user.phone;
      user.age = ageInput ? ageInput.value.trim() : user.age;
      user.address = addressInput ? addressInput.value.trim() : user.address;

      auth.setUser(user);

      if (msgEl) {
        msgEl.classList.remove('hidden');
        setTimeout(() => msgEl.classList.add('hidden'), 3500);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out of DealFlow360?')) {
        auth.logout();
      }
    });
  }
}
