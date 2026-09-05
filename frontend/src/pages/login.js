/**
 * DealFlow360 Login Page
 * Faithful reproduction of the claymorphic login UI.
 */
import { auth } from '../auth.js';

export function renderLoginPage() {
  return `
    <div class="login-wrapper">
      <!-- Ambient clay orbs -->
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>

      <!-- Main Centered Clay Card -->
      <div class="login-card-container">
        <div class="card card-extruded login-card">
          <!-- Logo & Header -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="logo-box mb-3">
              <svg class="w-8 h-8 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-dasharray="48" stroke-dashoffset="12" stroke-linecap="round" stroke-width="2.5"></circle>
                <circle cx="16" cy="16" fill="currentColor" r="4.5"></circle>
                <circle cx="23" cy="9" fill="currentColor" r="2.2"></circle>
              </svg>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">DealFlow360</h1>
            <p class="text-[11px] font-bold text-secondary mt-1 uppercase tracking-widest">Enterprise Deal &amp; Revenue Orchestration</p>
            <p class="text-xs text-on-surface-variant mt-2">Welcome back, please sign in to your workspace</p>
          </div>

          <!-- Error Alert Banner -->
          <div id="login-error" class="hidden mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium"></div>

          <!-- Login Form -->
          <form id="login-form" class="space-y-4">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-on-surface-variant" for="login-email">Work Email</label>
                <span class="text-[10px] font-mono text-secondary">SSO Enabled</span>
              </div>
              <div class="relative flex items-center">
                <input
                  id="login-email"
                  type="email"
                  required
                  class="input-clay w-full pr-10 text-sm"
                  placeholder="admin@dealflow360.com"
                  value="admin@dealflow360.com"
                />
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">alternate_email</span>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-on-surface-variant" for="login-password">Password</label>
                <span class="text-[11px] text-primary hover:underline cursor-pointer">Forgot password?</span>
              </div>
              <div class="relative flex items-center">
                <input
                  id="login-password"
                  type="password"
                  required
                  class="input-clay w-full pr-10 text-sm"
                  placeholder="••••••••••••"
                  value="ChangeMe123!"
                />
                <button type="button" id="toggle-pw" class="absolute right-3 text-secondary hover:text-on-surface">
                  <span class="material-symbols-outlined text-base" id="pw-icon">visibility</span>
                </button>
              </div>
            </div>

            <!-- Remember me toggle -->
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
                <input type="checkbox" checked class="accent-primary" />
                <span>Remember this workstation</span>
              </label>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">v4.12-pro</span>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button type="submit" id="btn-submit-login" class="btn btn-primary w-full py-3 text-sm justify-center">
                <span>Sign In to DealFlow360</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-5 flex items-center justify-center">
            <div class="w-full h-px bg-outline-variant/50"></div>
            <span class="absolute bg-surface-container-lowest px-3 text-[10px] font-bold text-secondary uppercase tracking-wider">Enterprise Single Sign-On</span>
          </div>

          <!-- SSO Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button type="button" class="btn btn-secondary justify-center text-xs py-2.5 sso-btn" data-provider="Google Workspace">
              <svg class="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4"></path>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
              <span>Workspace</span>
            </button>
            <button type="button" class="btn btn-secondary justify-center text-xs py-2.5 sso-btn" data-provider="Okta Verify">
              <svg class="w-4 h-4 mr-1.5 text-on-surface" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"></path>
              </svg>
              <span>Okta Verify</span>
            </button>
          </div>

          <!-- Node Status -->
          <div class="mt-4 p-2 rounded-full bg-surface-container flex items-center justify-between px-3 text-[11px] text-on-surface-variant">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>US-East Node (Equinix NY4)</span>
            </div>
            <span class="font-mono text-secondary">Latency 18ms</span>
          </div>
        </div>

        <!-- Security footer -->
        <div class="mt-4 text-center text-[11px] text-secondary">
          <p class="flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-xs">verified_user</span>
            <span>SOC2 Type II Certified • 256-bit Enterprise Encryption</span>
          </p>
          <p class="text-[10px] text-outline mt-0.5">Institutional grade security for M&amp;A pipeline governance</p>
        </div>
      </div>
    </div>
  `;
}

export function setupLoginEvents() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('btn-submit-login');
  const togglePw = document.getElementById('toggle-pw');
  const pwField = document.getElementById('login-password');
  const pwIcon = document.getElementById('pw-icon');

  if (togglePw && pwField && pwIcon) {
    togglePw.addEventListener('click', () => {
      if (pwField.type === 'password') {
        pwField.type = 'text';
        pwIcon.textContent = 'visibility_off';
      } else {
        pwField.type = 'password';
        pwIcon.textContent = 'visibility';
      }
    });
  }

  document.querySelectorAll('.sso-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      alert(`Initiating SAML 2.0 / OIDC handshake with ${provider}...`);
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Authenticating...';

      const email = document.getElementById('login-email').value.trim();
      const password = pwField.value.trim();

      try {
        await auth.login(email, password);
        window.location.hash = '#/dashboard';
      } catch (err) {
        errorEl.textContent = err.message || 'Login failed. Check your credentials.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span>';
      }
    });
  }
}
