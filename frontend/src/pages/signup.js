/**
 * DealFlow360 Signup Page
 * Registration form for new users with role selection.
 */
import { auth } from '../auth.js';

export function renderSignupPage() {
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
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">Create Account</h1>
            <p class="text-xs text-on-surface-variant mt-1">Join DealFlow360 to get started</p>
          </div>

          <!-- Error Alert Banner -->
          <div id="signup-error" class="hidden mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium"></div>

          <!-- Success Alert Banner -->
          <div id="signup-success" class="hidden mb-4 p-3 rounded-xl text-xs font-medium" style="background: var(--color-primary-fixed); color: var(--color-primary);"></div>

          <!-- Signup Form -->
          <form id="signup-form" class="space-y-4">
            <!-- Full Name -->
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="signup-name">Full Name</label>
              <div class="relative flex items-center">
                <input
                  id="signup-name"
                  type="text"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="John Doe"
                  minlength="1"
                  maxlength="255"
                />
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">person</span>
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="signup-email">Work Email</label>
              <div class="relative flex items-center">
                <input
                  id="signup-email"
                  type="email"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="you@company.com"
                />
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">alternate_email</span>
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="signup-password">Password</label>
              <div class="relative flex items-center">
                <input
                  id="signup-password"
                  type="password"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="Min 8 characters"
                  minlength="8"
                />
                <button type="button" id="signup-toggle-pw" class="absolute right-3 text-secondary hover:text-on-surface">
                  <span class="material-symbols-outlined text-base" id="signup-pw-icon">visibility</span>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="signup-confirm-password">Confirm Password</label>
              <div class="relative flex items-center">
                <input
                  id="signup-confirm-password"
                  type="password"
                  required
                  class="input-clay w-full pr-10 text-sm h-11"
                  placeholder="Re-enter password"
                  minlength="8"
                />
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">lock</span>
              </div>
            </div>

            <!-- Role Dropdown -->
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-on-surface-variant" for="signup-role">Select Role</label>
              <div class="relative flex items-center">
                <select
                  id="signup-role"
                  class="input-clay w-full text-sm h-11 appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="SalesRep">Sales Representative</option>
                  <option value="SalesManager">Sales Manager</option>
                  <option value="FinanceOps">Finance</option>
                  <option value="Customer">Customer</option>
                </select>
                <span class="material-symbols-outlined text-secondary absolute right-3 text-base pointer-events-none">expand_more</span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button type="submit" id="btn-submit-signup" class="btn btn-primary w-full h-11 text-sm font-semibold justify-center gap-2 rounded-xl shadow-sm">
                <span>Create Account</span>
                <span class="material-symbols-outlined text-base">person_add</span>
              </button>
            </div>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-5 pt-4" style="border-top: 1px solid var(--color-outline-variant);">
            <p class="text-xs text-on-surface-variant">
              Already have an account?
              <a href="#/login" class="text-primary font-semibold hover:underline cursor-pointer">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupSignupEvents() {
  const form = document.getElementById('signup-form');
  const errorEl = document.getElementById('signup-error');
  const successEl = document.getElementById('signup-success');
  const submitBtn = document.getElementById('btn-submit-signup');
  const togglePw = document.getElementById('signup-toggle-pw');
  const pwField = document.getElementById('signup-password');
  const pwIcon = document.getElementById('signup-pw-icon');

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
      successEl.classList.add('hidden');
      successEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Account...';

      const full_name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = pwField.value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      const role = document.getElementById('signup-role').value;

      // Client-side validation
      if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';
        return;
      }

      if (password.length < 8) {
        errorEl.textContent = 'Password must be at least 8 characters.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';
        return;
      }

      try {
        await auth.signup({ full_name, email, password, role });
        successEl.textContent = 'Account created successfully! Redirecting to login...';
        successEl.classList.remove('hidden');
        form.reset();
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      } catch (err) {
        errorEl.textContent = err.message || 'Signup failed. Please try again.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';
      }
    });
  }
}
