/**
 * DealFlow360 Login Page
 * Clean claymorphic login UI.
 */
import { auth } from '../auth.js';

export function renderLoginPage() {
  return `
    <div class="login-wrapper flex items-center justify-center min-h-screen w-full p-4">
      <!-- Ambient clay orbs -->
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>

      <!-- Main Centered Clay Card -->
      <div class="login-card-container w-full max-w-md mx-auto">
        <div class="card card-extruded login-card p-8">
          <!-- Logo & Header -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="logo-box mb-3">
              <svg class="w-10 h-10 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-dasharray="48" stroke-dashoffset="12" stroke-linecap="round" stroke-width="2.5"></circle>
                <circle cx="16" cy="16" fill="currentColor" r="4.5"></circle>
                <circle cx="23" cy="9" fill="currentColor" r="2.2"></circle>
              </svg>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">DealFlow360</h1>
          </div>

          <!-- Error Alert Banner -->
          <div id="login-error" class="hidden mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium"></div>

          <!-- Login Form -->
          <form id="login-form" class="space-y-4">
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="login-email">Work Email</label>
              <div class="relative flex items-center">
                <input
                  id="login-email"
                  type="email"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="admin@dealflow360.com"
                  value="admin@dealflow360.com"
                />
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">alternate_email</span>
              </div>
            </div>

            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="login-password">Password</label>
              <div class="relative flex items-center">
                <input
                  id="login-password"
                  type="password"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="••••••••••••"
                  value="ChangeMe123!"
                />
                <button type="button" id="toggle-pw" class="absolute right-3 text-secondary hover:text-on-surface">
                  <span class="material-symbols-outlined text-base" id="pw-icon">visibility</span>
                </button>
              </div>
            </div>


            <!-- Submit Button -->
            <div class="pt-3">
              <button type="submit" id="btn-submit-login" class="btn btn-primary w-full h-11 text-sm font-semibold justify-center gap-2 rounded-xl shadow-sm">
                <span>Sign In to DealFlow360</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </form>

          <!-- Sign Up Link -->
          <div class="text-center mt-5 pt-4" style="border-top: 1px solid var(--color-outline-variant);">
            <p class="text-xs text-on-surface-variant">
              Don't have an account?
              <a href="#/signup" class="text-primary font-semibold hover:underline cursor-pointer">Sign Up</a>
            </p>
          </div>
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
        window.location.hash = '#/quotations';
      } catch (err) {
        errorEl.textContent = err.message || 'Login failed. Check your credentials.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span><span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span></span>';
      }
    });
  }
}
