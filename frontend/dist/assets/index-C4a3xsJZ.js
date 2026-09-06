(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const e of a)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function n(a){const e={};return a.integrity&&(e.integrity=a.integrity),a.referrerPolicy&&(e.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?e.credentials="include":a.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function o(a){if(a.ep)return;a.ep=!0;const e=n(a);fetch(a.href,e)}})();const I="/api/v1";class _ extends Error{constructor(s,n,o){super(s),this.name="ApiError",this.status=n,this.data=o}}const p={getToken(){return localStorage.getItem("dealflow_token")},setToken(t){t?localStorage.setItem("dealflow_token",t):localStorage.removeItem("dealflow_token")},getHeaders(t={}){const s={"Content-Type":"application/json",...t},n=this.getToken();return n&&(s.Authorization=`Bearer ${n}`),s},async request(t,s={}){const n=`${I}${t}`,o=this.getHeaders(s.headers),a={...s,headers:o};a.body&&typeof a.body=="object"&&!(a.body instanceof FormData)&&(a.body=JSON.stringify(a.body));try{const e=await fetch(n,a);if(e.status===401&&!t.includes("/auth/login"))throw this.setToken(null),localStorage.removeItem("dealflow_user"),window.location.hash="#/login",new _("Session expired. Please sign in again.",401,null);if(e.status===204)return null;const r=e.headers.get("content-type")||"";let i=null;if(r.includes("application/json")?i=await e.json():i=await e.text(),!e.ok){const l=(i==null?void 0:i.detail)||(i==null?void 0:i.message)||`Request failed with status ${e.status}`;throw new _(l,e.status,i)}return i}catch(e){throw e instanceof _?e:new _(e.message||"Network connection failed",0,null)}},get(t,s){let n=t;if(s){const o=new URLSearchParams(s).toString();o&&(n+=`?${o}`)}return this.request(n,{method:"GET"})},post(t,s){return this.request(t,{method:"POST",body:s})},put(t,s){return this.request(t,{method:"PUT",body:s})},patch(t,s){return this.request(t,{method:"PATCH",body:s})},delete(t){return this.request(t,{method:"DELETE"})},async downloadFile(t,s){const n=`${I}${t}`,o=this.getToken(),a=o?{Authorization:`Bearer ${o}`}:{},e=await fetch(n,{headers:a});if(!e.ok)throw new Error(`Download failed with status ${e.status}`);const r=await e.blob(),i=window.URL.createObjectURL(r),l=document.createElement("a");l.href=i,l.download=s||"document.pdf",document.body.appendChild(l),l.click(),l.remove(),window.URL.revokeObjectURL(i)}},y={getUser(){try{const t=localStorage.getItem("dealflow_user");return t?JSON.parse(t):null}catch{return null}},setUser(t){t?localStorage.setItem("dealflow_user",JSON.stringify(t)):localStorage.removeItem("dealflow_user")},isAuthenticated(){return!!p.getToken()},async login(t,s,n){const o=await p.post("/auth/login",{email:t,password:s});if(o.access_token){p.setToken(o.access_token);try{const a=await p.get("/auth/me");return a.selected_role=n||a.role,this.setUser(a),{success:!0,user:a}}catch{const a={email:t,full_name:t.split("@")[0],role:n||"SalesRep",selected_role:n||"SalesRep"};return this.setUser(a),{success:!0,user:a}}}throw new Error("Authentication failed: No access token received")},async signup({full_name:t,email:s,password:n,role:o}){return await p.post("/auth/signup",{full_name:t,email:s,password:n,role:o})},logout(){p.setToken(null),this.setUser(null),window.location.hash="#/login"}};function b(t="quotations"){const s=y.getUser()||{full_name:"User",role:"SalesRep"},n=s.selected_role||s.role||"",o=[{key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"},{key:"quotations",label:"Quotations",icon:"request_quote",href:"#/quotations"},{key:"approvals",label:"Approvals",icon:"verified",href:"#/approvals"},{key:"fulfillment",label:"Fulfillment",icon:"assignment_turned_in",href:"#/fulfillment"},{key:"invoices",label:"Invoices",icon:"receipt_long",href:"#/invoices"},{key:"products",label:"Products",icon:"inventory_2",href:"#/products"},{key:"pricing",label:"Pricing",icon:"sell",href:"#/pricing"},{key:"subscriptions",label:"Subscriptions",icon:"sync",href:"#/subscriptions"},{key:"reports",label:"Reports",icon:"bar_chart",href:"#/reports"},{key:"messages",label:"Messages",icon:"chat_bubble",href:"#/messages"},{key:"profile",label:"Profile",icon:"account_circle",href:"#/profile"}];return n==="Admin"&&o.unshift({key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"}),`
    <header class="navbar-header">
      <div class="navbar-inner">
        <!-- Logo & Branding -->
        <div class="navbar-brand">
          <a href="#/quotations" class="flex items-center gap-3 text-inherit no-underline">
            <div class="logo-box">
              <svg class="w-6 h-6 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-dasharray="48" stroke-dashoffset="12" stroke-linecap="round" stroke-width="2.5"></circle>
                <circle cx="16" cy="16" fill="currentColor" r="4.5"></circle>
                <circle cx="23" cy="9" fill="currentColor" r="2.2"></circle>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-lg tracking-tight text-on-surface leading-none">DealFlow360</span>
              <span class="text-[10px] text-primary uppercase tracking-widest font-semibold mt-0.5">Enterprise M&amp;A</span>
            </div>
          </a>
        </div>

        <!-- Navigation Tabs -->
        <nav class="navbar-nav">
          ${o.map(e=>{const i=t===e.key||t==="quotation-detail"&&e.key==="quotations"?"nav-item-active":"nav-item-inactive";return`
        <a href="${e.href}" class="nav-item ${i}" data-route="${e.key}">
          <span class="material-symbols-outlined text-lg">${e.icon}</span>
          <span>${e.label}</span>
        </a>
      `}).join("")}
        </nav>

        <!-- Right User Actions -->
        <div class="navbar-actions">
          <div class="status-pill hidden sm:flex items-center gap-2">
            <span class="pulse-dot"></span>
            <span class="text-xs text-on-surface-variant font-medium">Q3 Pipeline</span>
            <span class="text-xs font-mono font-bold text-primary">99.4%</span>
          </div>

          <div class="h-6 w-px bg-outline-variant/50 hidden md:block"></div>

          <!-- User Profile & Logout Menu -->
          <div class="user-profile-menu flex items-center gap-3">
            <a href="#/profile" class="hidden lg:flex flex-col text-right no-underline">
              <span class="text-xs font-bold text-on-surface leading-tight">${s.full_name||"User"}</span>
              <span class="text-[11px] text-on-surface-variant leading-tight">${s.selected_role||s.role||"SalesRep"}</span>
            </a>
            <a href="#/profile" class="avatar-box no-underline" title="${s.full_name||"Profile"}">
              <span class="font-bold text-sm text-primary">${(s.full_name||"User").slice(0,2).toUpperCase()}</span>
            </a>
            <button type="button" id="btn-logout" class="icon-btn text-error hover:bg-error-container/40" title="Sign Out">
              <span class="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `}function v(){const t=document.getElementById("btn-logout");t&&t.addEventListener("click",()=>{confirm("Are you sure you want to sign out?")&&y.logout()})}function j(){return`
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
  `}function M(){const t=document.getElementById("login-form"),s=document.getElementById("login-error"),n=document.getElementById("btn-submit-login"),o=document.getElementById("toggle-pw"),a=document.getElementById("login-password"),e=document.getElementById("pw-icon");o&&a&&e&&o.addEventListener("click",()=>{a.type==="password"?(a.type="text",e.textContent="visibility_off"):(a.type="password",e.textContent="visibility")}),t&&t.addEventListener("submit",async r=>{r.preventDefault(),s.classList.add("hidden"),s.textContent="",n.disabled=!0,n.innerHTML='<span class="loading-spinner"></span> Authenticating...';const i=document.getElementById("login-email").value.trim(),l=a.value.trim();try{await y.login(i,l),window.location.hash="#/quotations"}catch(c){s.textContent=c.message||"Login failed. Check your credentials.",s.classList.remove("hidden")}finally{n.disabled=!1,n.innerHTML='<span><span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span></span>'}})}function F(){return`
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
            <p class="text-xs text-on-surface-variant mt-1">Join DealFlow360 workspace</p>
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
  `}function H(){const t=document.getElementById("signup-form"),s=document.getElementById("signup-error"),n=document.getElementById("signup-success"),o=document.getElementById("btn-submit-signup"),a=document.getElementById("signup-toggle-pw"),e=document.getElementById("signup-password"),r=document.getElementById("signup-pw-icon");a&&e&&r&&a.addEventListener("click",()=>{e.type==="password"?(e.type="text",r.textContent="visibility_off"):(e.type="password",r.textContent="visibility")}),t&&t.addEventListener("submit",async i=>{i.preventDefault(),s.classList.add("hidden"),s.textContent="",n.classList.add("hidden"),n.textContent="",o.disabled=!0,o.innerHTML='<span class="loading-spinner"></span> Creating Account...';const l=document.getElementById("signup-name").value.trim(),c=document.getElementById("signup-email").value.trim(),d=e.value,u=document.getElementById("signup-confirm-password").value;if(d!==u){s.textContent="Passwords do not match.",s.classList.remove("hidden"),o.disabled=!1,o.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}if(d.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden"),o.disabled=!1,o.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}try{await y.signup({full_name:l,email:c,password:d,role:"SalesRep"}),n.textContent="Account created successfully! Redirecting to login...",n.classList.remove("hidden"),t.reset(),setTimeout(()=>{window.location.hash="#/login"},1500)}catch(m){s.textContent=m.message||"Signup failed. Please try again.",s.classList.remove("hidden")}finally{o.disabled=!1,o.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>'}})}const E={show({title:t,content:s,onConfirm:n,confirmText:o="Confirm",cancelText:a="Cancel",showConfirm:e=!0}){const r=document.getElementById("df-modal-backdrop");r&&r.remove();const i=`
      <div id="df-modal-backdrop" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${t}</h3>
            <button type="button" class="modal-close-btn" id="df-modal-close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="modal-body">
            ${s}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="df-modal-cancel">${a}</button>
            ${e?`<button type="button" class="btn btn-primary" id="df-modal-confirm">${o}</button>`:""}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",i);const l=document.getElementById("df-modal-backdrop"),c=document.getElementById("df-modal-close"),d=document.getElementById("df-modal-cancel"),u=document.getElementById("df-modal-confirm"),m=()=>{l.classList.add("fade-out"),setTimeout(()=>l.remove(),200)};return c.addEventListener("click",m),d.addEventListener("click",m),l.addEventListener("click",x=>{x.target===l&&m()}),u&&n&&u.addEventListener("click",async()=>{u.disabled=!0,u.innerHTML='<span class="loading-spinner"></span> Processing...';try{await n()!==!1&&m()}catch(x){alert(x.message||"Action failed")}finally{u.disabled=!1,u.innerHTML=o}}),{close:m}}};function U(t={}){const{summary:s={},quotations:n=[]}=t,o=s.total_revenue?`₹${Number(s.total_revenue).toLocaleString("en-IN")}`:"₹4,82,05,000",a=s.pending_approvals??12,e=(s.total_quotations||s.draft_count)&&s.total_quotations||38,r=s.win_rate?`${s.win_rate}%`:"68.5%",i=(n.length>0?n.slice(0,6):[{id:8492,deal_reference:"DEAL-8492",rep_name:"Marcus Hayes",customer_name:"Acme Corp Global ERP",total_amount:34e5,status:"Approved",time:"Today, 09:42 AM"},{id:8488,deal_reference:"DEAL-8488",rep_name:"Sarah Lin",customer_name:"Starlight Pharma Logistics",total_amount:115e5,status:"Under Negotiation",time:"Today, 08:15 AM"},{id:8475,deal_reference:"DEAL-8475",rep_name:"Eleanor Vance",customer_name:"Helios Solar Microgrid Infra",total_amount:89e5,status:"Fulfilled",time:"Yesterday, 17:30 PM"},{id:8461,deal_reference:"DEAL-8461",rep_name:"David Kim",customer_name:"Apex Financial Cloud Vault",total_amount:475e4,status:"Draft",time:"Yesterday, 14:10 PM"}]).map(l=>{let c="badge-primary";const d=(l.status||"").toLowerCase();return d.includes("approve")?c="badge-success":d.includes("negotiat")||d.includes("review")||d.includes("pending")?c="badge-warning":d.includes("fulfill")?c="badge-info":d.includes("draft")&&(c="badge-neutral"),`
      <tr class="table-row hover:bg-surface-container/50 transition-colors">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${l.time||"Recent"}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${(l.rep_name||"US").split(" ").map(u=>u[0]).join("").substring(0,2)}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${l.rep_name||"Sales Rep"}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${l.customer_name||"Enterprise Client"}</span>
            <span class="text-[10px] font-mono text-primary">${l.deal_reference||`DEAL-${l.id}`}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(l.total_amount||0).toLocaleString("en-IN")}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${c}">${l.status||"Draft"}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${l.id}" class="btn btn-secondary text-xs py-1 px-3">Review Deal</a>
        </td>
      </tr>
    `}).join("");return`
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
            <div class="text-2xl font-bold tracking-tight text-on-surface">${o}</div>
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
              ${a} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
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
              ${e} <span class="text-sm font-normal text-on-surface-variant">Quotes</span>
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
            <div class="text-2xl font-bold tracking-tight text-on-surface">${r}</div>
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
              ${i}
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
  `}async function O(){try{const[t,s]=await Promise.all([p.get("/dashboard/summary").catch(()=>({})),p.get("/quotations").catch(()=>[])]);return{summary:t,quotations:s}}catch{return{summary:{},quotations:[]}}}function Q(){const t=document.getElementById("btn-export-dash");t&&t.addEventListener("click",()=>{window.location.hash="#/reports"});const s=document.getElementById("btn-new-deal-dash");s&&s.addEventListener("click",()=>{window.location.hash="#/quotation-detail"});const n=document.getElementById("btn-dl-audit");n&&n.addEventListener("click",()=>{alert("Downloading audit trail CSV...")})}function G(t=[],s="my",n="kanban"){const o=y.getUser()||{full_name:"User"},a=[{id:"draft",title:"Draft",match:l=>l.includes("draft")},{id:"pending",title:"Pending Approval",match:l=>l.includes("pending")||l.includes("review")},{id:"approved",title:"Approved",match:l=>l.includes("approved")},{id:"negotiation",title:"Negotiation",match:l=>l.includes("negotiat")||l.includes("sent")},{id:"confirmed",title:"Confirmed",match:l=>l.includes("confirmed")||l.includes("fulfilled")}],e=l=>{const c=Number(l.total_amount||0).toLocaleString("en-IN");return`
      <div 
        class="quote-card card card-extruded border border-outline-variant/60 rounded-2xl p-4 cursor-pointer hover:border-primary transition-all space-y-1.5"
        onclick="window.location.hash='#/quotations/${l.id}'"
        data-ref="${(l.deal_reference||"").toLowerCase()}" 
        data-customer="${(l.customer_name||"").toLowerCase()}" 
        data-rep="${(l.rep_name||"").toLowerCase()}"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-on-surface">${l.customer_name||"Customer"} - ₹${c}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
          <span>${l.deal_reference||`DEAL-${l.id}`}</span>
          <span>${l.line_count||(l.lines?l.lines.length:0)} items</span>
        </div>
      </div>
    `},r=a.map(l=>{const c=t.filter(u=>l.match((u.status||"").toLowerCase())),d=c.length===0?'<div class="p-4 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl">Empty</div>':c.map(e).join("");return`
      <div class="card card-extruded border border-outline-variant/60 rounded-2xl p-4 flex flex-col min-h-[380px] space-y-4 bg-surface-container-low/40">
        <!-- Column Header -->
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-2">
          <h3 class="font-bold text-sm text-on-surface">${l.title}</h3>
          <span class="badge badge-neutral text-xs font-bold font-mono">${c.length}</span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          ${d}
        </div>
      </div>
    `}).join(""),i=t.length===0?`
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found for <strong>${o.full_name||"your account"}</strong>.
        </td>
      </tr>
    `:t.map(l=>`
        <tr 
          class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40 cursor-pointer"
          onclick="window.location.hash='#/quotations/${l.id}'"
        >
          <td class="py-3 px-4 font-mono font-bold text-xs text-primary">${l.deal_reference||`DEAL-${l.id}`}</td>
          <td class="py-3 px-4 text-xs font-bold text-on-surface">${l.customer_name||"Customer"}</td>
          <td class="py-3 px-4"><span class="badge badge-neutral text-[10px]">${l.customer_tier||"Bronze"}</span></td>
          <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">₹${Number(l.total_amount||0).toLocaleString("en-IN")}</td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${l.line_count||(l.lines?l.lines.length:0)} items</td>
          <td class="py-3 px-4"><span class="badge badge-primary text-xs">${l.status||"Draft"}</span></td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${l.rep_name||"Sales Rep"}</td>
          <td class="py-3 px-4 text-right">
            <a href="#/quotations/${l.id}" class="btn btn-secondary text-xs py-1 px-2.5">View</a>
          </td>
        </tr>
      `).join("");return`
    <div class="page-container space-y-6">
      <!-- Title & Subtitle Matching Screenshot -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Quotations (List)</h1>
          <p class="text-xs text-on-surface-variant mt-1">Every quotation in the system, one row per quotation, click a row to open it</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- My vs All Scope Toggle -->
          <div class="flex items-center bg-surface-container p-1 rounded-xl border border-surface-container-high/60" id="quote-scope-toggle">
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${s==="my"?"bg-primary text-on-primary font-bold":"text-on-surface-variant hover:text-on-surface"}" data-scope="my">My Quotations</button>
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${s==="all"?"bg-primary text-on-primary font-bold":"text-on-surface-variant hover:text-on-surface"}" data-scope="all">All Workspace Deals</button>
          </div>
        </div>
      </div>

      <!-- Main Kanban Grid vs Table -->
      ${n==="kanban"?`
        <!-- 5 Kanban Columns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" id="kanban-container">
          ${r}
        </div>
      `:`
        <!-- Table View -->
        <div class="card card-extruded" id="table-container">
          <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
            <table class="w-full text-left border-collapse" id="quotations-table">
              <thead>
                <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th class="py-2.5 px-4">Reference</th>
                  <th class="py-2.5 px-4">Customer Account</th>
                  <th class="py-2.5 px-4">Tier</th>
                  <th class="py-2.5 px-4">Contract Value</th>
                  <th class="py-2.5 px-4">Lines</th>
                  <th class="py-2.5 px-4">Status</th>
                  <th class="py-2.5 px-4">Assigned Rep</th>
                  <th class="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${i}
              </tbody>
            </table>
          </div>
        </div>
      `}

      <!-- Bottom Actions Bar Matching Screenshot (+ New Quotation, Switch to Table/Kanban View) -->
      <div class="flex items-center gap-3 pt-2">
        <a href="#/quotation-detail" class="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2" id="btn-create-quote">
          <span class="material-symbols-outlined text-base">add</span>
          <span>+ New Quotation</span>
        </a>

        <button type="button" class="btn btn-secondary text-xs font-bold px-5 py-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high/60 flex items-center gap-2" id="btn-mode-toggle" data-target-mode="${n==="kanban"?"table":"kanban"}">
          <span class="material-symbols-outlined text-base">${n==="kanban"?"table_rows":"view_kanban"}</span>
          <span>${n==="kanban"?"Switch to Table View":"Switch to Kanban View"}</span>
        </button>
      </div>
    </div>
  `}async function V(t=!0){try{return await p.get(`/quotations?my_only=${t}`)}catch{return[]}}function z(t,s){document.querySelectorAll("#quote-scope-toggle button").forEach(a=>{a.addEventListener("click",()=>{const e=a.getAttribute("data-scope");typeof t=="function"&&t(e==="my")})});const o=document.getElementById("btn-mode-toggle");o&&o.addEventListener("click",()=>{const a=o.getAttribute("data-target-mode");typeof s=="function"&&s(a)})}function N(t={}){var u,m,x;const{quotation:s=null,products:n=[],customers:o=[]}=t,a=!s||!s.id,e=s||{id:0,deal_reference:"DEAL-NEW",customer_name:((u=o[0])==null?void 0:u.name)||"Acme Corp Global ERP",customer_email:((m=o[0])==null?void 0:m.email)||"procurement@acme.corp",customer_tier:((x=o[0])==null?void 0:x.tier)||"Gold",status:"Draft",lines:[]},r=!e.lines||e.lines.length===0?`
      <tr>
        <td colspan="7" class="text-center py-6 text-on-surface-variant text-xs">
          No line items added yet. Click <strong>Add Product Line +</strong> to populate this deal.
        </td>
      </tr>
    `:e.lines.map(f=>`
        <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
          <td class="py-2.5 px-4 font-bold text-xs text-on-surface">
            ${f.product_name||`Product #${f.product_id}`}
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface-variant">${f.sku||"SKU-STD"}</td>
          <td class="py-2.5 px-4">
            <span class="badge badge-neutral text-[10px]">${f.category_snapshot||"Hardware"}</span>
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">${f.quantity}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">₹${Number(f.unit_price).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-tertiary">${f.discount_percent||0}%</td>
          <td class="py-2.5 px-4 font-mono font-bold text-xs text-primary">₹${Number(f.line_total).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 text-right">
            ${a?"":`
              <button type="button" class="icon-btn text-error hover:bg-error-container/30 delete-line-btn" data-line-id="${f.id}" title="Remove Line">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            `}
          </td>
        </tr>
      `).join(""),i=e.lines?e.lines.reduce((f,h)=>f+(h.line_total||0),0):0,l=i;let c="badge-neutral";const d=(e.status||"").toLowerCase();return d.includes("approved")?c="badge-success":d.includes("pending")?c="badge-warning":d.includes("negotiat")?c="badge-info":(d.includes("fulfilled")||d.includes("confirmed"))&&(c="badge-success"),`
    <div class="page-container space-y-6">
      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
          <a href="#/quotations" class="hover:text-primary flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Quotations
          </a>
          <span>/</span>
          <span class="font-mono text-primary font-bold">${e.deal_reference||"DEAL-NEW"}</span>
        </div>

        <div class="flex items-center gap-2">
          ${a?"":`
            <a href="#/portal?id=${e.id}" class="btn btn-secondary text-xs" target="_blank">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              Customer Portal
            </a>
            <a href="#/fulfillment?id=${e.id}" class="btn btn-secondary text-xs">
              <span class="material-symbols-outlined text-sm">local_shipping</span>
              Split Warehouse
            </a>
          `}
        </div>
      </div>

      <!-- Header Banner -->
      <div class="card card-extruded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">${e.deal_reference||"New Commercial Deal"}</h1>
            <span class="badge ${c} text-xs">${e.status||"Draft"}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Enterprise Client: <strong class="text-on-surface">${e.customer_name}</strong> • Account Rep: Eleanor Vance
          </p>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="quote-action-bar">
          ${e.status==="Draft"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-submit-approval">
              <span class="material-symbols-outlined text-base">send_and_archive</span>
              Submit for Approval
            </button>
          `:""}
          ${e.status==="Pending Approval"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-approve-quote">
              <span class="material-symbols-outlined text-base">check_circle</span>
              Approve Quotation
            </button>
            <button type="button" class="btn btn-secondary text-xs text-error" id="btn-reject-quote">
              <span class="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          `:""}
          ${e.status==="Approved"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-send-portal">
              <span class="material-symbols-outlined text-base">outgoing_mail</span>
              Send to Customer Portal
            </button>
          `:""}
          ${e.status==="Under Negotiation"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-confirm-quote">
              <span class="material-symbols-outlined text-base">handshake</span>
              Confirm &amp; Finalize Deal
            </button>
          `:""}
          ${e.status==="Confirmed"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-fulfill-quote">
              <span class="material-symbols-outlined text-base">inventory</span>
              Trigger Fulfillment
            </button>
          `:""}
        </div>
      </div>

      <!-- Lifecycle Step Progress Bar -->
      <div class="card card-extruded">
        <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3">Orchestration Lifecycle</span>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-xl ${["Draft","Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(e.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            1. Draft &amp; CPQ
          </div>
          <div class="p-2.5 rounded-xl ${["Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(e.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            2. Review &amp; Governance
          </div>
          <div class="p-2.5 rounded-xl ${["Approved","Under Negotiation","Confirmed","Fulfilled"].includes(e.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            3. Customer Portal
          </div>
          <div class="p-2.5 rounded-xl ${["Confirmed","Fulfilled"].includes(e.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            4. Warehouse Split
          </div>
          <div class="p-2.5 rounded-xl ${e.status==="Fulfilled"?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            5. Invoiced &amp; Fulfilled
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Line Items Section (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="card card-extruded">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-on-surface">Quotation Line Items</h3>
                <p class="text-xs text-on-surface-variant">Products, recurring licenses, and custom delivery scopes</p>
              </div>
              <button type="button" class="btn btn-primary text-xs" id="btn-add-line-modal">
                <span class="material-symbols-outlined text-sm">add</span>
                Add Product Line +
              </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
              <table class="w-full text-left border-collapse" id="quote-lines-table">
                <thead>
                  <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-2.5 px-4">Product</th>
                    <th class="py-2.5 px-4">SKU</th>
                    <th class="py-2.5 px-4">Category</th>
                    <th class="py-2.5 px-4">Qty</th>
                    <th class="py-2.5 px-4">Unit Price</th>
                    <th class="py-2.5 px-4">Disc %</th>
                    <th class="py-2.5 px-4">Total</th>
                    <th class="py-2.5 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  ${r}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Commercial Summary Sidebar (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Deal Terms &amp; Account</h3>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-on-surface-variant block mb-1">Customer Account</span>
                <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                  ${e.customer_name}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-on-surface-variant block mb-1">Tier</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    ${e.customer_tier||"Gold"}
                  </div>
                </div>
                <div>
                  <span class="text-on-surface-variant block mb-1">Currency</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    INR (₹)
                  </div>
                </div>
              </div>
              <div>
                <span class="text-on-surface-variant block mb-1">Payment Terms</span>
                <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                  Net 30 Days (Direct Wire / NEFT)
                </div>
              </div>
            </div>
          </div>

          <!-- Total Calculation Card -->
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Commercial Summary</h3>
            <div class="space-y-2 text-xs border-b border-surface-container-high/60 pb-3">
              <div class="flex justify-between text-on-surface-variant">
                <span>Gross Subtotal</span>
                <span class="font-mono font-semibold text-on-surface">₹${Number(i).toLocaleString("en-IN")}</span>
              </div>
              <div class="flex justify-between text-tertiary">
                <span>Discounts Applied</span>
                <span class="font-mono font-semibold">-₹0.00</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>GST / Taxes</span>
                <span class="font-mono font-semibold">₹0.00</span>
              </div>
            </div>
            <div class="flex justify-between items-baseline pt-3">
              <span class="text-sm font-bold text-on-surface">Contract Value</span>
              <span class="text-xl font-bold font-mono text-primary">₹${Number(l).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}async function D(t){try{const[s,n,o]=await Promise.all([t?p.get(`/quotations/${t}`).catch(()=>null):null,p.get("/products").catch(()=>[]),p.get("/customers").catch(()=>[])]);return{quotation:s,products:n,customers:o}}catch{return{quotation:null,products:[],customers:[]}}}function T(t,s=[],n=[]){const o=document.getElementById("btn-add-line-modal");o&&o.addEventListener("click",()=>{const u=s.map(m=>`
        <option value="${m.id}">${m.name} — ₹${Number(m.base_price).toLocaleString("en-IN")} (${m.category})</option>
      `).join("");E.show({title:"Add Product Line Item",content:`
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Select Product</label>
              <select id="modal-product-select" class="input-clay w-full text-xs">
                ${u||'<option value="1">Enterprise Cloud Orchestration Node — ₹120,000</option>'}
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity</label>
              <input id="modal-product-qty" type="number" min="1" value="1" class="input-clay w-full text-xs" />
            </div>
          </div>
        `,confirmText:"Add to Quotation",onConfirm:async()=>{var h;const m=parseInt(document.getElementById("modal-product-select").value,10),x=parseFloat(document.getElementById("modal-product-qty").value)||1;if(!t||t==="0"||t===0||t==="undefined"){const w=((h=n[0])==null?void 0:h.id)||1,$=await p.post("/quotations",{customer_id:w});await p.post(`/quotations/${$.id}/lines`,{product_id:m,quantity:x}),window.location.hash=`#/quotations/${$.id}`,window.location.reload()}else await p.post(`/quotations/${t}/lines`,{product_id:m,quantity:x}),window.location.reload();return!0}})}),document.querySelectorAll(".delete-line-btn").forEach(u=>{u.addEventListener("click",async()=>{const m=u.getAttribute("data-line-id");confirm("Remove this line item from quotation?")&&(await p.delete(`/quotations/${t}/lines/${m}`),window.location.reload())})});const a=async u=>{await p.put(`/quotations/${t}`,{status:u}),window.location.reload()},e=document.getElementById("btn-submit-approval");e&&e.addEventListener("click",()=>a("Pending Approval"));const r=document.getElementById("btn-approve-quote");r&&r.addEventListener("click",()=>a("Approved"));const i=document.getElementById("btn-reject-quote");i&&i.addEventListener("click",()=>a("Rejected"));const l=document.getElementById("btn-send-portal");l&&l.addEventListener("click",()=>a("Under Negotiation"));const c=document.getElementById("btn-confirm-quote");c&&c.addEventListener("click",()=>a("Confirmed"));const d=document.getElementById("btn-fulfill-quote");d&&d.addEventListener("click",()=>a("Fulfilled"))}async function W(){try{return await p.get("/approvals")}catch{return[]}}function Y(t=[]){const s=t.length>0?t:[],n=s.filter(r=>r.status==="PENDING_MANAGER"||r.status==="PENDING_FINANCE").length,o=s.filter(r=>r.status==="RETURNED").length,a=s.filter(r=>r.status==="APPROVED").length,e=s.length===0?`
      <tr>
        <td colspan="5" class="text-on-surface-variant" style="text-align: center; padding: 2rem;">
          No approval requests found. Approvals are created when quotations exceed discount limits.
        </td>
      </tr>
    `:s.map(r=>{const i=r.blended_risk==="HIGH"?"font-bold":"";return`
        <tr class="approval-row" data-quotation-id="${r.quotation_id}" style="cursor: pointer;">
          <td class="font-bold text-on-surface">${r.quotation_ref}</td>
          <td class="text-on-surface">${r.customer_name}</td>
          <td class="text-on-surface ${i}">${r.blended_risk}</td>
          <td class="text-on-surface">${r.current_stage}</td>
          <td class="text-on-surface">${r.assigned_to}</td>
        </tr>
      `}).join("");return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approvals (List)</h1>
        <p class="text-sm text-on-surface-variant">Every quotation that needed, needs, or is going through discount approval</p>
      </div>

      <!-- Status Badges -->
      <div class="flex items-center gap-3" style="flex-wrap: wrap;">
        <span class="badge" id="filter-pending" style="background-color: #e67e22; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${n} Pending
        </span>
        <span class="badge" id="filter-returned" style="background-color: #e74c3c; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${o} Returned
        </span>
        <span class="badge" id="filter-approved" style="background-color: #22c55e; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${a} Approved
        </span>
      </div>

      <!-- Approvals Table -->
      <div class="card card-extruded" style="padding: 0; overflow: hidden;">
        <div class="clay-table-wrapper">
          <table class="clay-table" style="font-size: 14px;">
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Blended Risk</th>
                <th>Stage</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody id="approvals-tbody">
              ${e}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hint -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </p>
      </div>

      <!-- Filter Button -->
      <div>
        <button id="btn-filter-pending" type="button" class="btn btn-secondary" style="padding: 0.5rem 1.2rem; font-size: 13px;">
          Filter: Pending Only
        </button>
      </div>
    </div>
  `}function J(){document.querySelectorAll(".approval-row").forEach(e=>{e.addEventListener("click",()=>{const r=e.getAttribute("data-quotation-id");window.location.hash=`#/approval-detail/${r}`})});const t=document.getElementById("btn-filter-pending");if(t){let e=!1;t.addEventListener("click",()=>{e=!e,t.textContent=e?"Show All":"Filter: Pending Only",document.querySelectorAll(".approval-row").forEach(i=>{const l=i.children[3],c=l?l.textContent.trim():"";if(e){const d=c.includes("Sales")||c.includes("Finance")||c==="Pending";i.style.display=d?"":"none"}else i.style.display=""})})}const s=document.getElementById("filter-pending"),n=document.getElementById("filter-returned"),o=document.getElementById("filter-approved");function a(e){document.querySelectorAll(".approval-row").forEach(i=>{const l=i.children[3],c=l?l.textContent.trim():"";if(e==="pending"){const d=c.includes("Sales")||c.includes("Finance")||c==="Pending";i.style.display=d?"":"none"}else e==="returned"?i.style.display=c==="Returned"?"":"none":e==="approved"&&(i.style.display=c==="Approved"||c==="Auto-Approved"?"":"none")})}s&&s.addEventListener("click",()=>a("pending")),n&&n.addEventListener("click",()=>a("returned")),o&&o.addEventListener("click",()=>a("approved"))}async function K(t){try{return await p.get(`/approvals/${t}`)}catch(s){return console.error("Failed to load approval detail",s),null}}function X(t){if(!t)return`
      <div class="page-container space-y-6">
        <div class="card card-extruded" style="padding: 2rem; text-align: center;">
          <h2 class="text-xl font-bold text-on-surface">Approval Not Found</h2>
          <p class="text-sm text-on-surface-variant" style="margin-top: 0.5rem;">This quotation does not have an approval request yet.</p>
          <a href="#/approvals" class="btn btn-primary" style="margin-top: 1rem; display: inline-block; text-decoration: none; padding: 0.5rem 1.5rem;">Back to Approvals</a>
        </div>
      </div>
    `;const s=t.blended_risk==="HIGH"?"#e67e22":t.blended_risk==="MEDIUM"?"#f1c40f":"#2ecc71",n="#5AA1E3",o=(t.lines||[]).map(c=>`
    <tr>
      <td class="text-on-surface">${c.product_name}</td>
      <td class="text-on-surface">${c.discount_given}%</td>
      <td class="text-on-surface">${c.limit_allowed}%</td>
      <td class="text-on-surface font-bold">${c.over_label}</td>
    </tr>
  `).join("")||`
    <tr>
      <td colspan="4" class="text-on-surface-variant" style="text-align: center; padding: 1rem;">No line items found</td>
    </tr>
  `,a=["Submitted","Sales Manager","Finance","Confirmed"],e=t.status==="APPROVED"?3:t.status==="PENDING_FINANCE"?2:t.status==="PENDING_MANAGER"?1:0,r=a.map((c,d)=>{let u="#6b7280",m="#6b7280";d<e?(u="#22c55e",m="#22c55e"):d===e&&(u="#3b82f6",m="#3b82f6");const x=d<a.length-1?`<div style="flex: 1; height: 2px; background: ${d<e?"#22c55e":"#6b7280"}; margin: 0 0.25rem;"></div>
         <div style="width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid ${d<e?"#22c55e":"#6b7280"}; margin-right: 0.25rem;"></div>`:"";return`
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 80px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${u}; border: 3px solid ${m};"></div>
        <span class="text-xs text-on-surface-variant" style="margin-top: 0.5rem; text-align: center;">${c}</span>
      </div>
      ${x?`<div style="display: flex; align-items: center; flex: 1;">${x}</div>`:""}
    `}).join(""),i=(t.audit_trail||[]).map(c=>`
    <tr>
      <td class="text-on-surface">${c.user}</td>
      <td class="text-on-surface">${c.action}</td>
      <td class="text-on-surface">${c.date}</td>
      <td class="text-on-surface">${c.note}</td>
    </tr>
  `).join("")||`
    <tr>
      <td colspan="4" class="text-on-surface-variant" style="text-align: center; padding: 1rem;">No audit trail entries yet</td>
    </tr>
  `,l=t.status==="PENDING_MANAGER"||t.status==="PENDING_FINANCE";return`
    <div class="page-container space-y-6" data-quotation-id="${t.quotation_id}">

      <!-- Back link -->
      <a href="#/approvals" class="text-sm text-primary flex items-center gap-1" style="text-decoration: none;">
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Back to Approvals List
      </a>

      <!-- Title -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approval Detail: ${t.quotation_ref} (${t.customer_name})</h1>
        <p class="text-sm text-on-surface-variant">Opened by clicking a row on the Approvals list</p>
      </div>

      <!-- Risk & Tier Badges -->
      <div class="flex items-center gap-3" style="flex-wrap: wrap;">
        <span class="badge" style="background-color: ${s}; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px;">
          Blended Risk: ${t.blended_risk}
        </span>
        <span class="badge" style="background-color: ${n}; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px;">
          Customer Tier: ${t.customer_tier}
        </span>
      </div>

      <!-- Why This Quote Was Flagged -->
      <div class="space-y-3">
        <h2 class="text-lg font-bold text-primary">Why This Quote Was Flagged</h2>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table" style="font-size: 14px;">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Discount Given</th>
                  <th>Limit Allowed</th>
                  <th>Over By</th>
                </tr>
              </thead>
              <tbody>
                ${o}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pipeline Visualization -->
      <div class="card card-extruded" style="padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0;">
          ${r}
        </div>
      </div>

      <!-- Audit Trail -->
      <div class="space-y-3">
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table" style="font-size: 14px;">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${i}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      ${l?`
        <div class="flex items-center gap-3" style="flex-wrap: wrap;">
          <button id="btn-approve" type="button" class="btn" style="background-color: #22c55e; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Approve
          </button>
          <button id="btn-return" type="button" class="btn" style="background-color: #e67e22; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Return for Revision
          </button>
          <button id="btn-reject" type="button" class="btn" style="background-color: #e74c3c; color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Reject
          </button>
        </div>
      `:`
        <div class="card card-extruded" style="padding: 1rem; text-align: center;">
          <span class="text-sm font-bold text-on-surface">This approval has been ${t.status.toLowerCase().replace("_"," ")}.</span>
        </div>
      `}

    </div>
  `}function Z(t){const s=document.getElementById("btn-approve"),n=document.getElementById("btn-return"),o=document.getElementById("btn-reject");s&&s.addEventListener("click",async()=>{const a=prompt("Approval note (optional):")||"";try{await p.post(`/approvals/${t}/decide`,{decision:"APPROVE",reason:a}),alert("Approval granted successfully!"),window.location.hash="#/approvals"}catch(e){alert("Error: "+(e.message||"Approval failed"))}}),n&&n.addEventListener("click",async()=>{const a=prompt("Reason for returning (required):");if(!a){alert("A reason is required to return for revision.");return}try{await p.post(`/approvals/${t}/decide`,{decision:"RETURN",reason:a}),alert("Returned for revision."),window.location.hash="#/approvals"}catch(e){alert("Error: "+(e.message||"Action failed"))}}),o&&o.addEventListener("click",async()=>{const a=prompt("Reason for rejection (required):");if(!a){alert("A reason is required to reject.");return}try{await p.post(`/approvals/${t}/decide`,{decision:"REJECT",reason:a}),alert("Approval rejected."),window.location.hash="#/approvals"}catch(e){alert("Error: "+(e.message||"Action failed"))}})}async function tt(){try{const t=await p.get("/products");return Array.isArray(t)?t:[]}catch{return[]}}function et(t=[]){const s=t.length>0?t:[],n=s.filter(r=>r.is_active!==!1).length,o=s.filter(r=>r.is_active===!1).length,a=new Set(s.map(r=>r.category)),e=s.length===0?`
      <tr>
        <td colspan="7" class="text-center text-on-surface-variant" style="padding: 2rem;">
          No products found. Click <strong class="text-primary">+ New Product</strong> to add one.
        </td>
      </tr>
    `:s.map(r=>{const i=Number(r.base_price||0),l=Number(r.tax_rate||0),c=r.unit||"Each",d=r.is_active!==!1,u=d?"badge-success":"badge-error",m=d?"Active":"Archived";return`
        <tr class="product-row" data-product-id="${r.id}" style="cursor:pointer">
          <td class="font-bold text-on-surface">${r.name}</td>
          <td>
            <span class="badge badge-neutral">${r.category||"-"}</span>
          </td>
          <td class="text-on-surface-variant">-</td>
          <td class="font-mono font-bold text-primary">$${i.toLocaleString()}</td>
          <td class="text-on-surface-variant">${c}</td>
          <td class="text-on-surface-variant">${l}%</td>
          <td><span class="badge ${u}">${m}</span></td>
        </tr>
      `}).join("");return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Product Catalog</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Product catalog</h1>
          <p class="text-sm text-on-surface-variant">Every product, variant and price list in one place.</p>
        </div>

        <div class="flex items-center gap-3">
          <button type="button" class="btn btn-primary" id="btn-new-product" style="padding: 0.6rem 1.5rem;">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>New Product</span>
          </button>
          <a href="#/pricing" class="btn btn-secondary" style="padding: 0.6rem 1.5rem; text-decoration:none;">
            <span class="material-symbols-outlined text-base">sell</span>
            <span>Manage Price fields</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Products</span>
            <div class="text-xl font-bold text-on-surface mt-1">${n} active, ${o} archived</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">inventory_2</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Pricelists</span>
            <div class="text-xl font-bold text-on-surface mt-1">${a.size} categories</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">list_alt</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Variants</span>
            <div class="text-xl font-bold text-on-surface mt-1">${s.length} SKUs</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">category</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Products</span>
        
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Variants</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Tax</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${e}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Hint -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Click a product row to open general info, variants and tier/currency price lists.
        </p>
      </div>
    </div>
  `}function st(){const t=document.getElementById("btn-new-product");t&&t.addEventListener("click",()=>{window.location.hash="#/product-detail/new"}),document.querySelectorAll(".product-row").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-product-id");window.location.hash=`#/product-detail/${n}`})})}async function at(t){if(t==="new")return{product:null,variants:[]};try{const s=await p.get("/products"),n=Array.isArray(s)?s.find(a=>String(a.id)===String(t)):null;let o=[];if(n)try{o=await p.get(`/products/${t}/variants`)}catch{o=[]}return{product:n,variants:Array.isArray(o)?o:[]}}catch{return{product:null,variants:[]}}}function nt(t){const{product:s,variants:n}=t,o=!s,a=(s==null?void 0:s.name)||"",e=(s==null?void 0:s.category)||"",r=(s==null?void 0:s.base_price)||"",i=(s==null?void 0:s.unit)||"",l=(s==null?void 0:s.description)||"",c=(s==null?void 0:s.tax_rate)||"",d="",u={};(n||[]).forEach(x=>{u[x.attribute_name]||(u[x.attribute_name]={values:[],extraPrices:[]}),u[x.attribute_name].values.push(x.value),u[x.attribute_name].extraPrices.push(Number(x.extra_price||0))});const m=Object.keys(u).length>0?Object.entries(u).map(([x,f])=>{const h=f.values.join(", "),w=f.extraPrices.map(k=>k===0?"0":`+$${k}`),$=[...new Set(w)];return`
          <tr>
            <td class="font-bold text-on-surface">${x}</td>
            <td class="text-on-surface-variant">${h}</td>
            <td class="text-on-surface-variant font-mono text-primary">${$.join("/")}</td>
          </tr>
        `}).join(""):'<tr><td colspan="3" class="text-center py-6 text-on-surface-variant text-sm">No variants added yet</td></tr>';return`
    <div class="page-container space-y-6">
      <!-- Back link & Title -->
      <div>
        <a href="#/products" class="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline mb-2" style="text-decoration:none">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Back to Products
        </a>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">${o?"New Product":"Product and pricelist"}</h1>
      </div>

      <!-- General Info -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">General Info</span>
        
        <div class="card card-extruded">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <!-- Left Column -->
            <div class="space-y-4">
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Product name</label>
                <input type="text" id="pd-name" class="input-clay w-full" value="${a}" placeholder="Enter product name" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Category</label>
                <input type="text" id="pd-category" class="input-clay w-full" value="${e}" placeholder="e.g. Hardware, Services" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Price</label>
                <input type="number" id="pd-price" class="input-clay w-full font-mono" value="${r}" placeholder="0.00" step="0.01" min="0" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Unit</label>
                <input type="text" id="pd-unit" class="input-clay w-full" value="${i}" placeholder="e.g. Each, License" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Description</label>
                <input type="text" id="pd-description" class="input-clay w-full" value="${l}" placeholder="Product description" />
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="space-y-4">
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Tax %</label>
                <input type="number" id="pd-tax" class="input-clay w-full font-mono" value="${c}" placeholder="0" step="0.01" min="0" />
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Subscription</label>
                <div class="flex items-center gap-3">
                  <select id="pd-subscription" class="input-clay" style="width: 100px;">
                    <option value="no" selected>No</option>
                    <option value="yes" >Yes</option>
                  </select>
                  <span class="text-xs text-on-surface-variant italic">If yes, recurring will be visible</span>
                </div>
              </div>
              
              <div id="recurring-group" style="display:none; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Recurring</label>
                <select id="pd-recurring" class="input-clay" style="max-width: 200px;">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Quantity</label>
                <div class="flex items-center gap-3">
                  <input type="number" id="pd-qty" class="input-clay font-mono" style="width: 100px;" value="${d}" placeholder="0" min="0" step="1" />
                  <span class="text-xs text-on-surface-variant italic">(Integer field)</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Product Variants -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Product Variants</span>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Values</th>
                  <th>Extra price</th>
                </tr>
              </thead>
              <tbody>
                ${m}
              </tbody>
            </table>
            ${o?"":`
            <div class="bg-surface-container-low flex items-center gap-3" style="padding: 1rem; border-top: 1px solid var(--color-surface-container-high);">
              <input type="text" id="new-attr-name" class="input-clay" style="flex:1" placeholder="Attribute (e.g. Color)" />
              <input type="text" id="new-attr-value" class="input-clay" style="flex:1" placeholder="Value (e.g. Blue)" />
              <input type="number" id="new-attr-price" class="input-clay font-mono" style="width: 120px" placeholder="Extra price" step="0.01" min="0" value="0" />
              <button type="button" class="btn btn-secondary" id="btn-add-variant" style="padding: 0.5rem 1.5rem">+ Add</button>
            </div>
            `}
          </div>
        </div>
      </div>

      <!-- Pricelists -->
      <div class="space-y-3">
        <span class="text-sm font-bold text-primary px-1">Pricelists</span>
        <div class="card card-extruded" style="padding: 0; overflow: hidden;">
          <div class="clay-table-wrapper">
            <table class="clay-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Currency</th>
                  <th>Price Rule</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-bold text-on-surface">Bronze</td>
                  <td class="text-on-surface-variant">USD</td>
                  <td class="text-on-surface-variant">Price, no adjustment</td>
                </tr>
                <tr>
                  <td class="font-bold text-on-surface">Gold</td>
                  <td class="text-on-surface-variant">USD/EUR</td>
                  <td class="text-on-surface-variant">Price minus 10 percent base</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="card card-extruded" style="background: var(--color-surface-container-low); border: 1px solid var(--color-surface-container-high); padding: 1rem;">
        <p class="text-sm text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">info</span>
          Product details should be filled. ${o?"":"Recurring order with this product will be invoiced at the beginning of the period."}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pb-8">
        <button type="button" class="btn btn-primary" id="btn-save-product" style="padding: 0.6rem 2rem;">
          <span class="material-symbols-outlined text-base">save</span>
          <span>${o?"Create Product":"Save Changes"}</span>
        </button>
        <a href="#/products" class="btn btn-secondary" style="padding: 0.6rem 2rem; text-decoration:none;">Cancel</a>
      </div>
    </div>
  `}function rt(t){const s=document.getElementById("pd-subscription"),n=document.getElementById("recurring-group");if(s&&n){const e=()=>{n.style.display=s.value==="yes"?"grid":"none"};s.addEventListener("change",e),e()}const o=document.getElementById("btn-add-variant");o&&t&&t!=="new"&&o.addEventListener("click",async()=>{var l,c,d,u,m;const e=(c=(l=document.getElementById("new-attr-name"))==null?void 0:l.value)==null?void 0:c.trim(),r=(u=(d=document.getElementById("new-attr-value"))==null?void 0:d.value)==null?void 0:u.trim(),i=parseFloat((m=document.getElementById("new-attr-price"))==null?void 0:m.value)||0;if(!e||!r){alert("Please fill in attribute name and value.");return}o.disabled=!0;try{await p.post(`/products/${t}/variants`,{attribute_name:e,value:r,extra_price:i}),window.location.hash=`#/product-detail/${t}`,window.dispatchEvent(new HashChangeEvent("hashchange"))}catch(x){alert(x.message||"Failed to add variant"),o.disabled=!1}});const a=document.getElementById("btn-save-product");a&&a.addEventListener("click",async()=>{var m,x,f,h,w,$,k,S,P,B;const e=(x=(m=document.getElementById("pd-name"))==null?void 0:m.value)==null?void 0:x.trim(),r=(h=(f=document.getElementById("pd-category"))==null?void 0:f.value)==null?void 0:h.trim(),i=parseFloat((w=document.getElementById("pd-price"))==null?void 0:w.value)||0,l=(k=($=document.getElementById("pd-unit"))==null?void 0:$.value)==null?void 0:k.trim(),c=parseFloat((S=document.getElementById("pd-tax"))==null?void 0:S.value)||0,d=((B=(P=document.getElementById("pd-description"))==null?void 0:P.value)==null?void 0:B.trim())||null;if(!e||!r||!l){alert("Please fill in product name, category, and unit.");return}const u={name:e,category:r,base_price:i,unit:l,tax_rate:c,description:d};a.disabled=!0,a.innerHTML='<span class="material-symbols-outlined text-lg">hourglass_top</span><span>Saving...</span>';try{if(!t||t==="new"){const C=await p.post("/products",u);window.location.hash=`#/product-detail/${C.id}`}else{try{await p.put(`/products/${t}`,u)}catch{}window.location.hash="#/products"}}catch(C){alert(C.message||"Failed to save product"),a.disabled=!1,a.innerHTML=`<span class="material-symbols-outlined text-lg">save</span><span>${t==="new"?"Create Product":"Save Changes"}</span>`}})}async function ot(){try{return await p.get("/discount-rules")}catch(t){return console.error("Failed to load discount rules",t),{tiers:[],categories:[],chains:[]}}}function it(t){const s=t.tiers||[],n=t.categories||[];t.chains;const o={Bronze:1,Silver:2,Gold:3};s.sort((r,i)=>(o[r.customer_tier]||99)-(o[i.customer_tier]||99));const a=s.map((r,i)=>`
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="tier-name-${i}" value="${r.customer_tier}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="tier-disc-${i}" value="${r.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join(""),e=n.map((r,i)=>`
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="cat-name-${i}" value="${r.category}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="cat-disc-${i}" value="${r.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join("");return`
    <div class="page-container space-y-6" data-tiers-count="${s.length}" data-categories-count="${n.length}">
      
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
                  ${a}
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
                  ${e}
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
  `}function lt(){const t=document.getElementById("btn-save-config");t&&t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Saving...";const s=document.querySelector(".page-container"),n=parseInt(s.getAttribute("data-tiers-count"))||0,o=parseInt(s.getAttribute("data-categories-count"))||0,a={tiers:[],categories:[],chains:[{min_score:1,required_level:"MANAGER_ONLY"}]};for(let e=0;e<n;e++)a.tiers.push({customer_tier:document.getElementById("tier-name-"+e).value,max_discount_percent:parseFloat(document.getElementById("tier-disc-"+e).value)});for(let e=0;e<o;e++)a.categories.push({category:document.getElementById("cat-name-"+e).value,max_discount_percent:parseFloat(document.getElementById("cat-disc-"+e).value)});try{await p.put("/discount-rules",a),alert("Configuration saved successfully!"),window.location.reload()}catch(e){alert("Error saving configuration: "+e.message),t.disabled=!1,t.textContent="Save configuration"}})}function ct(t=[]){const s=t.length>0?t:[{id:1,name:"Acme Corp Global ERP",email:"procurement@acmeww.com",tier:"Gold",created_at:"2025-01-15"},{id:2,name:"Starlight Pharma Logistics",email:"operations@starlightpharma.com",tier:"Silver",created_at:"2025-02-01"},{id:3,name:"Helios Solar Microgrid Infra",email:"infrastructure@heliosmicro.io",tier:"Gold",created_at:"2025-02-18"},{id:4,name:"Apex Financial Cloud Vault",email:"finops@apexvault.com",tier:"Bronze",created_at:"2025-03-02"}],n=s.map(o=>{let a="badge-primary";const e=(o.tier||"Bronze").toLowerCase();return e.includes("gold")?a="badge-warning":e.includes("silver")&&(a="badge-neutral"),`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="avatar-sm">
              <span>${o.name.substring(0,2).toUpperCase()}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${o.name}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">ID #${o.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">${o.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${a} text-[10px] font-bold">${o.tier||"Bronze"}</span>
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          ${o.created_at?new Date(o.created_at).toLocaleDateString():"Active"}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-primary text-xs py-1 px-2.5 create-deal-for-cust-btn" data-cust-id="${o.id}">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>New Deal</span>
            </button>
            <a href="#/portal?customerId=${o.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal">
              <span class="material-symbols-outlined text-sm">open_in_browser</span>
            </a>
          </div>
        </td>
      </tr>
    `}).join("");return`
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
            <div class="text-xl font-bold text-on-surface mt-1">${s.length} Enterprise Entities</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">corporate_fare</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Gold Tier Entities</span>
            <div class="text-xl font-bold text-tertiary mt-1">
              ${s.filter(o=>(o.tier||"").toLowerCase().includes("gold")).length} Accounts
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
              ${n}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function dt(){try{return await p.get("/customers")}catch{return[]}}function pt(){const t=document.getElementById("cust-search-input"),s=document.getElementById("customers-table");t&&s&&t.addEventListener("input",o=>{const a=o.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(a)?"":"none"})});const n=document.getElementById("btn-add-customer");n&&n.addEventListener("click",()=>{E.show({title:"Add Enterprise Client Account",content:`
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
        `,confirmText:"Create Account",onConfirm:async()=>{const o=document.getElementById("new-cust-name").value.trim(),a=document.getElementById("new-cust-email").value.trim(),e=document.getElementById("new-cust-tier").value;if(!o||!a)throw new Error("Company name and email are required");return await p.post("/customers",{name:o,email:a,tier:e}),window.location.reload(),!0}})}),document.querySelectorAll(".create-deal-for-cust-btn").forEach(o=>{o.addEventListener("click",async()=>{const a=parseInt(o.getAttribute("data-cust-id"),10);try{const e=await p.post("/quotations",{customer_id:a});window.location.hash=`#/quotations/${e.id}`}catch(e){alert(e.message||"Failed to create quotation")}})})}function ut(t={}){const{quotation:s=null}=t,n=s||{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",total_amount:34e4,status:"Under Negotiation",lines:[{product_name:"Enterprise Cloud Orchestration Node",quantity:2,unit_price:12e4,line_total:24e4},{product_name:"Architecture Consulting & Migration SLA",quantity:1,unit_price:1e5,line_total:1e5}]},o=["Confirmed","Fulfilled"].includes(n.status);return`
    <div class="page-container space-y-6">
      <!-- Portal Top Banner -->
      <div class="card card-extruded bg-surface-container-low/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="logo-box">
            <span class="material-symbols-outlined text-primary text-xl">verified</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-on-surface">Customer Negotiation Portal</h1>
              <span class="badge ${o?"badge-success":"badge-info"} text-xs">${n.status||"Under Negotiation"}</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Secure Procurement Portal for <strong class="text-on-surface">${n.customer_name}</strong> • ${n.deal_reference||`DEAL-${n.id}`}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${o?`
            <div class="pill-badge flex items-center gap-1.5 text-xs text-primary font-bold">
              <span class="material-symbols-outlined text-base">verified_user</span>
              Digitally Signed &amp; Ratified
            </div>
          `:`
            <button type="button" class="btn btn-primary text-xs" id="btn-portal-accept">
              <span class="material-symbols-outlined text-base">draw</span>
              <span>Accept &amp; Digitally Sign</span>
            </button>
          `}
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Contract Breakdown (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="card card-extruded">
            <h3 class="text-base font-bold text-on-surface mb-3">Formal Quotation Summary</h3>
            <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-2.5 px-4">Item Scope</th>
                    <th class="py-2.5 px-4">Qty</th>
                    <th class="py-2.5 px-4">Rate</th>
                    <th class="py-2.5 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(n.lines||[]).map(a=>`
                    <tr class="table-row border-b border-surface-container-high/40 text-xs">
                      <td class="py-3 px-4 font-bold text-on-surface">${a.product_name||`Item #${a.product_id}`}</td>
                      <td class="py-3 px-4 font-mono">${a.quantity}</td>
                      <td class="py-3 px-4 font-mono">₹${Number(a.unit_price).toLocaleString("en-IN")}</td>
                      <td class="py-3 px-4 font-mono font-bold text-primary text-right">₹${Number(a.line_total).toLocaleString("en-IN")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-surface-container flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface">Total Contract Amount</span>
              <span class="text-xl font-bold font-mono text-primary">₹${Number(n.total_amount||34e4).toLocaleString("en-IN")}</span>
            </div>

            <div class="mt-3 text-[11px] text-on-surface-variant space-y-1">
              <p>• Commercial Terms: Net 30 Direct Wire Transfer upon delivery acceptance.</p>
              <p>• Legal Jurisdiction: Delaware Master Services Framework Agreement.</p>
              <p>• Price validity: 30 Calendar Days from quotation issuance.</p>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Negotiation & Counter-Offer Thread (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="card card-extruded flex flex-col justify-between h-full">
            <div>
              <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-3 mb-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-lg">forum</span>
                  <h3 class="text-sm font-bold text-on-surface">Negotiation Thread</h3>
                </div>
                <span class="badge badge-neutral text-[10px]">Encrypted Channel</span>
              </div>

              <!-- Messages Container -->
              <div class="space-y-3 text-xs max-h-72 overflow-y-auto pr-1" id="portal-messages-list">
                <!-- Sales Rep Message -->
                <div class="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-primary">Eleanor Vance (DealFlow360)</span>
                    <span class="text-[10px] text-on-surface-variant">Today, 08:30 AM</span>
                  </div>
                  <p class="text-on-surface">
                    Hello procurement team, we have prepared the proposal for your M&amp;A integration project with multi-region deployment included.
                  </p>
                </div>

                <!-- Customer Message -->
                <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
                    <span class="text-[10px] text-on-surface-variant">Today, 09:15 AM</span>
                  </div>
                  <p class="text-on-surface">
                    Thank you Eleanor. We are reviewing the SLA terms. Can we confirm 24/7 dedicated telephone support is included in the migration line?
                  </p>
                </div>
              </div>
            </div>

            <!-- Reply Box -->
            <div class="mt-4 pt-3 border-t border-surface-container-high/60 space-y-2">
              <textarea
                id="portal-reply-text"
                rows="3"
                class="input-clay w-full text-xs p-2.5 rounded-xl resize-none"
                placeholder="Post counter-offer, SLA question, or term modification..."
              ></textarea>

              <div class="flex items-center justify-between">
                <span class="text-[10px] text-on-surface-variant">Press Enter or click send</span>
                <button type="button" class="btn btn-primary text-xs py-1.5 px-3" id="btn-send-portal-msg">
                  <span class="material-symbols-outlined text-sm">send</span>
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}async function mt(t){try{const s=await p.get("/quotations"),n=t?s.find(o=>o.id===parseInt(t,10)):s[0];return n?{quotation:await p.get(`/quotations/${n.id}`).catch(()=>n)}:{quotation:null}}catch{return{quotation:null}}}function xt(t){const s=(t==null?void 0:t.id)||8492,n=document.getElementById("btn-portal-accept");n&&n.addEventListener("click",async()=>{if(confirm("Confirm digital signature and ratify this commercial agreement?"))try{await p.put(`/quotations/${s}`,{status:"Confirmed"}),alert("Quotation digitally signed and ratified! Deal status updated to Confirmed."),window.location.reload()}catch(r){alert(r.message||"Signature failed")}});const o=document.getElementById("btn-send-portal-msg"),a=document.getElementById("portal-reply-text"),e=document.getElementById("portal-messages-list");o&&a&&e&&o.addEventListener("click",()=>{const r=a.value.trim();if(!r)return;const i=`
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${r}</p>
        </div>
      `;e.insertAdjacentHTML("beforeend",i),a.value="",e.scrollTop=e.scrollHeight})}const ft=[{id:1,deal_reference:"DEAL-0001",customer_name:"Bronze Buyer",status:"Confirmed",line_count:2,total_amount:1300},{id:2,deal_reference:"DEAL-0002",customer_name:"Gold Buyer",status:"Confirmed",line_count:1,total_amount:1500}];function bt(t={}){var e,r;const s=(e=t.warehouses)!=null&&e.length?t.warehouses:[{id:1,name:"Equinix NY4 North America Hub",code:"WH-US-EAST",location:"Secaucus, NJ"},{id:2,name:"Frankfurt FRA1 European Gateway",code:"WH-EU-CENTRAL",location:"Frankfurt, DE"}],n=(r=t.quotations)!=null&&r.length?t.quotations.filter(i=>i.line_count>0&&!["Fulfilled","Rejected"].includes(i.status)):ft.filter(i=>i.line_count>0),o=s.map(i=>`<div class="card card-extruded"><div class="flex items-start justify-between"><span class="badge badge-primary font-mono text-[10px]">${i.code||`WH-${i.id}`}</span><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">warehouse</span></div></div><h3 class="text-sm font-bold mt-3">${i.name}</h3><p class="text-xs text-on-surface-variant">${i.location||"Global Hub"}</p><div class="pt-2 mt-3 border-t border-surface-container-high/60 text-xs"><span class="text-on-surface-variant">Available stock</span><strong class="block text-primary">Live inventory view</strong></div></div>`).join(""),a=n.map(i=>`<a class="fulfillment-order-row" href="#/fulfillment/${i.id}"><div><strong class="block text-sm">${i.deal_reference||`DEAL-${String(i.id).padStart(4,"0")}`}</strong><span class="text-[11px] text-on-surface-variant">${i.customer_name||"Customer entity"}</span></div><div><strong class="block text-sm">${i.line_count||0} line items</strong><span class="text-[11px] text-on-surface-variant">${i.total_amount?`₹${Number(i.total_amount).toLocaleString("en-IN")}`:"Awaiting allocation"}</span></div><div><span class="badge badge-warning text-[10px]">Awaiting Fulfillment</span></div><span class="material-symbols-outlined text-on-surface-variant">chevron_right</span></a>`).join("");return`<div class="page-container space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Smart logistics &amp; warehousing</span></div><h1 class="text-2xl font-bold tracking-tight">Fulfillment &amp; Stock Allocation</h1><p class="text-xs text-on-surface-variant">Review awaiting orders, inspect stock coverage, and route each shipment.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-suggest-split"><span class="material-symbols-outlined text-base">auto_fix_high</span><span>Auto-Suggest Optimal Split</span></button></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${o}</div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Awaiting Fulfillment</h2><p class="text-xs text-on-surface-variant">Select an order to open its fulfillment detail and stock plan.</p></div><span class="badge badge-warning text-[10px]">${n.length} pending</span></div><div class="space-y-2">${a||'<p class="text-sm text-on-surface-variant py-6 text-center">No orders are awaiting fulfillment.</p>'}</div></section></div>`}async function vt(){try{const[t,s]=await Promise.all([p.get("/warehouses").catch(()=>[]),p.get("/quotations").catch(()=>[])]);return{warehouses:t,quotations:s}}catch{return{warehouses:[],quotations:[]}}}function gt(){var t;(t=document.getElementById("btn-suggest-split"))==null||t.addEventListener("click",()=>alert("Open an awaiting order to calculate its live warehouse split."))}function yt(t={}){var e;const s=t.quote||{},n=t.split||{lines:[],status:"suggested",shipment_count:0,estimated_cost:0},o=s.lines||[],a=(e=n.lines)!=null&&e.length?n.lines.map(r=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${r.product_name||`Product #${r.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity_required||r.quantity_fulfilled+r.quantity_backordered||0}</td><td class="py-3 px-4 text-xs">${r.warehouse_name||"Backorder"}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity_fulfilled}</td><td class="py-3 px-4 font-mono text-xs ${r.quantity_backordered?"text-error font-bold":""}">${r.quantity_backordered}</td><td class="py-3 px-4"><span class="badge ${r.quantity_backordered?"badge-warning":"badge-success"} text-[10px]">${r.quantity_backordered?"Partial":"Allocated"}</span></td></tr>`).join(""):o.map(r=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${r.product_name||`Product #${r.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity}</td><td class="py-3 px-4 text-xs">Awaiting split</td><td class="py-3 px-4 font-mono text-xs">0</td><td class="py-3 px-4 font-mono text-xs text-tertiary">${r.quantity}</td><td class="py-3 px-4"><span class="badge badge-warning text-[10px]">Awaiting</span></td></tr>`).join("");return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">${s.deal_reference||`DEAL-${s.id||""}`}</span></div><div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Awaiting fulfillment</span></div><h1 class="text-xl font-bold mt-2">${s.deal_reference||"Fulfillment Detail"}</h1><p class="text-sm font-bold mt-1">${s.customer_name||"Customer entity"}</p><p class="text-xs text-on-surface-variant mt-1">Review stock coverage and confirm the warehouse allocation before dispatch.</p></div><div class="flex gap-2"><button type="button" class="btn btn-secondary text-xs" id="btn-open-override"><span class="material-symbols-outlined text-sm">edit_note</span><span>Manual Override</span></button><button type="button" class="btn btn-primary text-xs" id="btn-accept-fulfillment"><span class="material-symbols-outlined text-sm">done_all</span><span>Accept &amp; Dispatch</span></button></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded fulfillment-stat"><span>Order value</span><strong>₹${Number(s.total_amount||0).toLocaleString("en-IN")}</strong><em>${s.status||"Confirmed"}</em></div><div class="card card-extruded fulfillment-stat"><span>Shipment count</span><strong>${n.shipment_count||0}</strong><em>Suggested warehouse routes</em></div><div class="card card-extruded fulfillment-stat"><span>Estimated freight</span><strong>₹${Number(n.estimated_cost||0).toLocaleString("en-IN")}</strong><em>${n.has_backorders?"Backorder requires review":"Stock covered"}</em></div></div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Stock Allocation Detail</h2><p class="text-xs text-on-surface-variant">Live suggested split for each quotation line.</p></div><span class="badge badge-primary text-[10px]">${n.status||"suggested"}</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="text-[11px] font-bold uppercase text-on-surface-variant bg-surface-container-low/50"><th class="py-2.5 px-4">Product</th><th class="py-2.5 px-4">Required</th><th class="py-2.5 px-4">Warehouse</th><th class="py-2.5 px-4">Allocated</th><th class="py-2.5 px-4">Backorder</th><th class="py-2.5 px-4">State</th></tr></thead><tbody>${a||'<tr><td colspan="6" class="py-8 text-center text-xs text-on-surface-variant">No quotation lines found.</td></tr>'}</tbody></table></div></section><section class="card card-extruded"><h2 class="text-base font-bold mb-3">Dispatch Readiness</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer</span><strong>${s.customer_name||"Unknown customer"}</strong></div><div><span class="detail-label">Line items</span><strong>${o.length}</strong></div><div><span class="detail-label">Target service level</span><strong class="text-primary">48 hours after acceptance</strong></div></div></section></div>`}async function ht(t){const[s,n]=await Promise.all([p.get(`/quotations/${t}`).catch(()=>null),p.get(`/fulfillment/suggested-split?quotation_id=${t}`).catch(()=>null)]);return{quote:s,split:n}}function wt(t){var s,n;(s=document.getElementById("btn-open-override"))==null||s.addEventListener("click",()=>{window.location.hash=`#/fulfillment-override/${t}`}),(n=document.getElementById("btn-accept-fulfillment"))==null||n.addEventListener("click",async()=>{var o;try{const a=await p.get(`/quotations/${t}`);if(!((o=a==null?void 0:a.lines)!=null&&o.length)){alert("This quotation has no line items to dispatch. Add a product line before accepting fulfillment.");return}await p.get(`/fulfillment/suggested-split?quotation_id=${t}`),await p.post("/fulfillment/accept",{quotation_id:Number(t)}),alert("Fulfillment accepted and stock reserved."),window.location.hash="#/fulfillment"}catch(a){alert(`Could not accept fulfillment: ${a.message}. Configure warehouse stock before dispatching.`)}})}function $t(t={}){var a;const s=((a=t.lines)==null?void 0:a[0])||{},n=s.discount_percent!=null?`${s.discount_percent}%`:"Not set";return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment Detail</span></a><span class="text-xs text-outline">/ Manual Override</span></div><div class="card card-extruded"><div class="flex items-center gap-3"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">gavel</span></div><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Pending approval workflow</span></div><h1 class="text-xl font-bold mt-1">Manual Override</h1><p class="text-xs text-on-surface-variant">Submit a controlled commercial change for manager approval.</p></div></div></div><form id="manual-override-form" class="space-y-4"><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">1. Override Type</h2><p class="text-xs text-on-surface-variant">Choose which commercial term requires an exception.</p></div><select id="override-type" class="input-clay w-full" required><option value="Discount override">Discount override</option><option value="Price override">Price override</option><option value="Quantity override">Quantity override</option><option value="Payment-term override">Payment-term override</option></select></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">2. Current vs New Value</h2><p class="text-xs text-on-surface-variant">Quotation: <strong>${t.deal_reference||`DEAL-${t.id||""}`}</strong> · Customer: <strong>${t.customer_name||"Customer entity"}</strong></p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><label>Current value<input id="current-value" class="input-clay w-full mt-1" value="${n}" required /></label><label>Allowed maximum<input id="allowed-maximum" class="input-clay w-full mt-1" value="15%" required /></label><label>New value<input id="new-value" class="input-clay w-full mt-1" placeholder="e.g. 20%" required /></label></div></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">3. Reason</h2><p class="text-xs text-on-surface-variant">Explain the customer or deal event that requires this override.</p></div><textarea id="override-reason" class="input-clay w-full" rows="3" minlength="10" required placeholder="Customer requested additional discount for bulk order."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">4. Business Justification</h2><p class="text-xs text-on-surface-variant">Include expected order value, customer importance, competitive pricing, or strategic deal context.</p></div><textarea id="business-justification" class="input-clay w-full" rows="4" minlength="10" required placeholder="Expected annual order of ₹25 Lakhs; strategic expansion account."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">5. Supporting Information</h2><p class="text-xs text-on-surface-variant">Optional competitor quote or document reference.</p></div><textarea id="supporting-information" class="input-clay w-full" rows="2" placeholder="Competitor quote ID, attachment reference, or additional context"></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">6. Approval</h2><p class="text-xs text-on-surface-variant">Select the responsible manager. The request will be submitted as Pending Approval.</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><label>Approver<select id="approver" class="input-clay w-full mt-1" required><option value="Sales Manager">Sales Manager</option><option value="Finance Operations">Finance Operations</option><option value="Administrator">Administrator</option></select></label><div><span class="detail-label">Override status</span><span class="badge badge-warning text-[10px]">Pending Approval</span></div></div></section><div class="flex justify-end gap-2"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs">Cancel</a><button type="submit" class="btn btn-primary text-xs"><span class="material-symbols-outlined text-sm">send</span><span>Submit Override</span></button></div></form></div>`}async function Et(t){try{return await p.get(`/quotations/${t}`)}catch{return{id:t}}}function kt(t){var s;(s=document.getElementById("manual-override-form"))==null||s.addEventListener("submit",async n=>{n.preventDefault();const o=n.currentTarget;if(!o.checkValidity()){o.reportValidity();return}const a=e=>document.getElementById(e).value.trim();try{await p.post("/fulfillment/manual-override",{quotation_id:Number(t),override_type:a("override-type"),current_value:a("current-value"),allowed_maximum:a("allowed-maximum"),new_value:a("new-value"),reason:a("override-reason"),business_justification:a("business-justification"),supporting_information:a("supporting-information")||null,approver:a("approver")}),alert("Override submitted for approval."),window.location.hash=`#/fulfillment/${t}`}catch(e){alert(`Could not submit override: ${e.message}`)}})}function _t(t=[]){const s=Array.isArray(t)&&t.length>0?t:[{id:1,number:"INV-2024-1101",deal_ref:"DEAL-8492",customer_name:"Starlight Dynamics Inc.",milestone:"Series B Expansion",icon:"verified_user",amount:260925,status:"Pending",due_date:"Oct 28, 2024"},{id:2,number:"INV-2024-1102",deal_ref:"DEAL-8488",customer_name:"Nexus Health Systems",milestone:"Series B Milestone",icon:"receipt_long",amount:13e4,status:"Paid",due_date:"Oct 1, 2024"},{id:3,number:"INV-2024-1103",deal_ref:"DEAL-8475",customer_name:"Vanguard Logistics International",milestone:"Q3 Infrastructure",icon:"local_shipping",amount:45e3,status:"Pending",due_date:"Oct 15, 2024"},{id:4,number:"INV-2024-1104",deal_ref:"DEAL-8461",customer_name:"AeroSphere Aerospace Holdings",milestone:"Advisory Mandate Phase I",icon:"flight_takeoff",amount:222500,status:"Pending",due_date:"Nov 1, 2024"},{id:5,number:"INV-2024-1100",deal_ref:"DEAL-8450",customer_name:"Borealis CleanTech JV",milestone:"Escrow Release Tier 3",icon:"corporate_fare",amount:89200,status:"Overdue",due_date:"Sep 15, 2024"}],n=s.reduce((e,r)=>e+(Number(r.amount)||0),0),o=s.filter(e=>(e.status||"").toLowerCase()==="paid").length,a=s.map(e=>{const r=(e.status||"").toLowerCase();let i="";return r==="paid"?i='<span class="badge badge-success text-[10px]">Paid</span>':r==="overdue"?i='<span class="badge badge-error text-[10px]">Overdue</span>':i='<span class="badge badge-warning text-[10px]">Pending</span>',`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">
          <a href="#/invoices/${e.id}" class="hover:underline">${e.number||`INV-${e.id}`}</a>
        </td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${e.deal_ref||""}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${e.customer_name||"Customer"}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">₹${Number(e.amount).toLocaleString("en-IN")}</td>
        <td class="py-3 px-4 text-on-surface-variant">${e.due_date||"Net 30"}</td>
        <td class="py-3 px-4">${i}</td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <a href="#/invoices/${e.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="View Detail">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span>Preview</span>
            </a>
            <button type="button" class="btn btn-secondary text-xs py-1 px-2 download-pdf-btn" data-id="${e.id}" data-number="${e.number||`INV-${e.id}`}" title="Download PDF">
              <span class="material-symbols-outlined text-sm text-primary">download</span>
            </button>
            ${r!=="paid"?`
              <button type="button" class="btn btn-primary text-xs py-1 px-2.5 settle-btn" data-id="${e.id}">
                <span class="material-symbols-outlined text-sm">payments</span>
                <span>Settle</span>
              </button>
            `:""}
          </div>
        </td>
      </tr>
    `}).join("");return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Accounts Receivable &amp; Treasury</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Invoices &amp; Settlement Operations</h1>
          <p class="text-xs text-on-surface-variant">Corporate billing schedules, wire reconciliation, and payment execution</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Billed Volume</span>
            <div class="text-xl font-bold font-mono text-on-surface mt-1">₹${Number(n).toLocaleString("en-IN")}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">account_balance</span>
          </div>
        </div>
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Settled Invoices</span>
            <div class="text-xl font-bold font-mono text-primary mt-1">${o} of ${s.length} Paid</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
          </div>
        </div>
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Payment Terms Default</span>
            <div class="text-xl font-bold text-on-surface mt-1">Net 30 Direct Wire</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">schedule</span>
          </div>
        </div>
      </div>

      <!-- Invoice Ledger Table -->
      <div class="card card-extruded">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-on-surface">Invoice Ledger</h3>
            <p class="text-xs text-on-surface-variant">Click Preview to inspect formal tax invoice before customer delivery</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Invoice #</th>
                <th class="py-2.5 px-4">Quotation Ref</th>
                <th class="py-2.5 px-4">Customer Entity</th>
                <th class="py-2.5 px-4">Amount</th>
                <th class="py-2.5 px-4">Due Date</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${a}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function At(){try{const t=await p.get("/payments/invoices");return Array.isArray(t)?t:[]}catch{return[]}}function Lt(){document.querySelectorAll(".download-pdf-btn").forEach(s=>{s.addEventListener("click",async()=>{const n=s.getAttribute("data-id"),o=s.getAttribute("data-number");try{await p.downloadFile(`/payments/invoices/${n}/pdf`,`DealFlow360_Invoice_${o}.pdf`)}catch(a){alert("PDF download failed: "+a.message)}})}),document.querySelectorAll(".settle-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-id");window.location.hash=`#/invoices/${n}`})});const t=document.getElementById("btn-create-invoice");t&&t.addEventListener("click",()=>{alert("Batch invoice generation engine executed: All billable quotation milestones synchronized.")})}function Ct(t){if(!t||!t.id)return`
      <div class="page-container flex items-center justify-center min-h-[60vh]">
        <div class="card card-extruded p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span>
          <h2 class="text-lg font-bold text-on-surface">Invoice Not Found</h2>
          <p class="text-xs text-on-surface-variant mt-1">The requested invoice could not be loaded.</p>
          <a href="#/invoices" class="btn btn-primary text-xs mt-4">← Back to Invoices</a>
        </div>
      </div>
    `;const s=(t.status||"").toLowerCase()==="paid",n=t.lines||[],o=n.reduce((d,u)=>d+(Number(u.amount)||0),0)||Number(t.amount)||0,a=o*.065,e=o+a,r=t.payments||[];r.reduce((d,u)=>d+(Number(u.amount)||0),0);const i=s?'<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E9F3EC] text-[#3D6847] border border-[#C5E2CB]">Paid &amp; Reconciled</span>':'<span class="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-primary">Pending Payment</span>',l=n.map((d,u)=>`
    <tr class="border-b border-surface-container-high/30 hover:bg-surface-container/30 transition-colors">
      <td class="py-3 px-4 text-xs text-on-surface-variant font-mono">${u+1}</td>
      <td class="py-3 px-4">
        <span class="text-xs font-bold text-on-surface">${d.description||"Line Item"}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">${d.milestone||"MILESTONE"}</span>
      </td>
      <td class="py-3 px-4 text-right font-mono text-xs text-on-surface font-bold">
        ₹${Number(d.amount).toLocaleString("en-IN",{minimumFractionDigits:2})}
      </td>
    </tr>
  `).join(""),c=r.length>0?`
    <div class="card card-extruded space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
          <h3 class="text-sm font-bold text-on-surface">Payment Settlement History</h3>
        </div>
        <span class="badge badge-success text-[10px]">${r.length} Payment(s)</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] text-secondary uppercase tracking-wider border-b border-surface-container-high/40">
              <th class="py-2 px-4">Payment Ref</th>
              <th class="py-2 px-4">Date Credited</th>
              <th class="py-2 px-4 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody>
            ${r.map(d=>`
              <tr class="border-b border-surface-container-high/20">
                <td class="py-2.5 px-4 font-mono text-xs font-bold text-on-surface">${d.reference||`PAY-${d.id}`}</td>
                <td class="py-2.5 px-4 text-xs text-on-surface-variant">${d.paid_at||"Immediate"}</td>
                <td class="py-2.5 px-4 font-mono text-xs font-bold text-right text-[#3D6847]">₹${Number(d.amount).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"";return`
    <div class="page-container space-y-6">
      <!-- Back Navigation -->
      <div class="flex items-center gap-3">
        <a href="#/invoices" class="btn btn-secondary text-xs py-1.5 px-3">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Invoices</span>
        </a>
        <div class="h-5 w-px bg-outline-variant/40"></div>
        <span class="text-xs text-on-surface-variant">Invoices</span>
        <span class="text-xs text-outline">/</span>
        <span class="text-xs font-bold font-mono text-primary">${t.number||`INV-${t.id}`}</span>
      </div>

      <!-- Invoice Header Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary" style="box-shadow: inset 2px 2px 4px rgba(168,181,160,0.25), inset -2px -2px 4px rgba(255,255,255,0.85);">
              <span class="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-bold text-on-surface tracking-tight">Tax Invoice</h1>
                <span class="font-mono text-base text-primary font-bold">#${t.number||`INV-${t.id}`}</span>
              </div>
              <div class="flex items-center gap-2 mt-1 text-xs">
                ${i}
                <span class="text-outline">•</span>
                <span class="font-mono text-secondary">${t.deal_ref||"Commercial Deal"}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-secondary text-xs py-1.5 px-3" id="btn-download-pdf" data-id="${t.id}">
              <span class="material-symbols-outlined text-sm text-primary">download</span>
              <span>Download PDF</span>
            </button>
            ${s?"":`
              <button type="button" class="btn btn-primary text-xs py-1.5 px-4" id="btn-record-payment" data-id="${t.id}" data-amount="${e}">
                <span class="material-symbols-outlined text-sm">task_alt</span>
                <span>Record Payment</span>
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Billed To & Remittance Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Billed To -->
        <div class="card card-extruded space-y-2">
          <span class="text-[10px] text-primary uppercase font-bold tracking-widest">BILLED TO</span>
          <h3 class="text-sm font-bold text-on-surface">${t.customer_name||"Enterprise Customer"}</h3>
          <p class="text-xs text-on-surface-variant">Attn: Accounts Payable &amp; Financial Controller</p>
          <p class="font-mono text-xs text-secondary">${t.customer_address||"850 Third Avenue, New York, NY 10022"}</p>
          <div class="pt-2 mt-1 border-t border-surface-container-high/40">
            <span class="font-mono text-[11px] text-secondary bg-surface-container px-2.5 py-0.5 rounded-full">${t.tax_id||"EIN / TAX ID: US-94829104"}</span>
          </div>
        </div>

        <!-- Dates & Remittance -->
        <div class="card card-extruded space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[10px] text-secondary uppercase font-bold tracking-wider">Issued Date</span>
              <p class="font-mono text-xs text-on-surface font-bold mt-0.5">${t.issued_date||t.created_at||"N/A"}</p>
            </div>
            <div>
              <span class="text-[10px] text-secondary uppercase font-bold tracking-wider">Payment Due</span>
              <p class="font-mono text-xs text-primary font-bold mt-0.5">${t.due_date||"Net 30 Days"}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-surface-container-high/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-outline uppercase font-bold">Remit Routing (ACH/Wire)</span>
              <p class="font-mono text-[11px] text-on-surface-variant">JPMorgan Chase • Acct ***7719</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-mono text-[11px]" style="box-shadow: 2px 2px 5px rgba(168,181,160,0.18);">
              CURRENCY: INR (₹)
            </span>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="card card-extruded">
        <div class="flex items-center gap-2 pb-3 mb-2 border-b border-surface-container-high/40">
          <span class="material-symbols-outlined text-primary text-base">receipt_long</span>
          <h3 class="text-sm font-bold text-on-surface">Itemized Line Items &amp; Deliverables</h3>
        </div>
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/40">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low/50 text-[11px] text-secondary uppercase tracking-wider border-b border-surface-container-high/40">
                <th class="py-2.5 px-4 w-10">#</th>
                <th class="py-2.5 px-4">Item Description &amp; Deliverables</th>
                <th class="py-2.5 px-4 text-center">Milestone Tier</th>
                <th class="py-2.5 px-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${l}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals Summary -->
      <div class="card card-extruded">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <!-- Ledger Hash -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary" style="box-shadow: 2px 2px 5px rgba(168,181,160,0.2);">
              <span class="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <span class="text-xs text-on-surface font-bold">Ledger Hash Encrypted</span>
              <p class="font-mono text-[11px] text-secondary">SHA-256: 9b2d...f41a</p>
            </div>
          </div>

          <!-- Totals -->
          <div class="flex items-center gap-6 text-xs">
            <div class="text-right">
              <span class="text-[11px] text-secondary">Subtotal</span>
              <p class="font-mono font-bold text-on-surface">₹${Number(o).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-secondary">Tax (6.5%)</span>
              <p class="font-mono text-on-surface">₹${Number(a).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
            <div class="text-right px-4 py-2 rounded-xl bg-surface-container-low" style="box-shadow: 3px 3px 8px rgba(168,181,160,0.2),-2px -2px 6px rgba(255,255,255,0.9);">
              <span class="text-[10px] text-primary font-bold uppercase">Total Due</span>
              <p class="font-mono text-lg font-extrabold text-primary">₹${Number(e).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments History -->
      ${c}
    </div>
  `}async function St(t){try{return await p.get(`/payments/invoices/${t}`)}catch(s){return console.warn("Could not fetch invoice detail:",s),null}}function Pt(t){if(!t)return;const s=document.getElementById("btn-download-pdf");s&&s.addEventListener("click",async()=>{try{const a=`DealFlow360_Invoice_${t.number||t.id}.pdf`;await p.downloadFile(`/payments/invoices/${t.id}/pdf`,a)}catch(a){alert("Error generating PDF: "+a.message)}});const n=document.getElementById("btn-send-reminder");n&&n.addEventListener("click",()=>{alert(`Dispatched automated billing reminder to ${t.customer_name||"Buyer"} AP desk.`)});const o=document.getElementById("btn-record-payment");o&&o.addEventListener("click",()=>{const a=o.getAttribute("data-amount");E.show({title:"Record Payment Signoff",content:`
          <div class="space-y-4 text-xs">
            <p class="text-on-surface-variant">
              Record a settled financial transaction into the dedicated <b>Payment</b> ledger table.
            </p>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Payment Amount (₹)</label>
              <input id="payment-amount-input" type="number" step="0.01" class="input-clay w-full text-xs font-mono font-bold" value="${a||t.amount}" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Wire / Bank Reference</label>
              <input id="payment-ref-input" type="text" class="input-clay w-full text-xs font-mono" value="WIRE-CHASE-${Math.floor(1e5+Math.random()*9e5)}" />
            </div>
          </div>
        `,confirmText:"Execute Payment Signoff",onConfirm:async()=>{var i,l,c;const e=parseFloat((i=document.getElementById("payment-amount-input"))==null?void 0:i.value)||0,r=((c=(l=document.getElementById("payment-ref-input"))==null?void 0:l.value)==null?void 0:c.trim())||"WIRE-DIRECT";try{return await p.post(`/payments/invoices/${t.id}/pay`,{amount:e,reference:r}),alert(`Payment of ₹${e.toLocaleString("en-IN")} recorded successfully!`),window.location.hash=`#/invoices/${t.id}`,window.location.reload(),!0}catch(d){return alert("Failed to record payment: "+d.message),!1}}})})}const Bt=[{id:1,name:"Enterprise M&A Platform Core",cadence:"yearly",price:12e4,product_id:1},{id:2,name:"Deal Desk Executive Seat",cadence:"monthly",price:350,product_id:2},{id:3,name:"Mission-Critical 24/7 Support SLA",cadence:"yearly",price:45e3,product_id:3}],L=t=>`₹${Number(t||0).toLocaleString("en-IN")}`,It=t=>(t||"yearly").replace(/^./,s=>s.toUpperCase());function Nt(t=[]){const s=Array.isArray(t)&&t.length?t:Bt,n=s.filter(e=>e.is_active!==!1&&e.status!=="Canceled"),o=s.reduce((e,r)=>e+Number(r.price||0)/((r.cadence||"").toLowerCase()==="monthly"?1:12),0),a=s.map((e,r)=>{const i=It(e.cadence),l=e.is_active===!1||e.status==="Canceled"?"Canceled":"Active";return`<a class="subscription-row" href="#/subscriptions/${e.id}" data-search="${`${e.name} ${e.id} ${e.product_id}`.toLowerCase()}">
      <div class="subscription-plan-cell"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">${r%2?"memory":"cloud_sync"}</span></div><div class="min-w-0"><strong class="block text-sm text-on-surface truncate">${e.name}</strong><span class="text-[11px] text-on-surface-variant"><span class="font-mono">SUB-${String(e.id).padStart(4,"0")}</span> · Product ${e.product_id||"N/A"} · ${i} entitlement</span></div></div>
      <div><strong class="block text-sm text-on-surface">${e.customer_name||"Unassigned account"}</strong><span class="text-[11px] text-on-surface-variant">${e.tier||"Enterprise"} · Master agreement</span></div>
      <div><strong class="font-mono text-sm text-on-surface">${L(e.price)} <span class="text-[11px] font-sans text-on-surface-variant">/ ${i==="Monthly"?"mo":"yr"}</span></strong><span class="block text-[11px] text-on-surface-variant">${i} recurring billing</span></div>
      <div><strong class="font-mono text-xs text-on-surface">${e.next_bill||(r%2?"Nov 30, 2026":"Dec 15, 2026")}</strong><span class="block text-[11px] text-primary">Auto-renewal on</span></div>
      <div><span class="badge ${l==="Active"?"badge-success":"badge-warning"} text-[10px]">${l}</span></div><span class="subscription-row-arrow material-symbols-outlined" aria-hidden="true">chevron_right</span>
    </a>`}).join("");return`<div class="page-container space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Billing engine active · Ledger OK</span></div><h1 class="text-2xl font-bold tracking-tight text-on-surface">Subscriptions &amp; Recurring Billing</h1><p class="text-sm text-on-surface-variant">Manage recurring contracts, renewal timing, and billing schedules across customer entities.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-add-plan"><span class="material-symbols-outlined text-base">add_circle</span><span>New Subscription Plan</span></button></div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><div class="card card-extruded subscription-metric"><span>Active MRR Run-Rate</span><strong>${L(o)}<small>/mo</small></strong><em>ARR: ${L(o*12)}</em></div><div class="card card-extruded subscription-metric"><span>Active Subscriptions</span><strong>${n.length}</strong><em>${n.length} active contracts</em></div><div class="card card-extruded subscription-metric"><span>Gross Monthly Churn</span><strong>0.8%<small>vol/mo</small></strong><em>Benchmark &lt; 1.50%</em></div><div class="card card-extruded subscription-metric"><span>Auto-Renewal Pacing</span><strong>94.6%<small>secured</small></strong><em>45 in 60-day horizon</em></div></div>
    <section class="card card-extruded subscription-workspace"><div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-4"><div class="subscription-filters" role="tablist"><button type="button" class="subscription-filter active" data-filter="all">All Subscriptions <b>${s.length}</b></button><button type="button" class="subscription-filter" data-filter="active">Active <b>${n.length}</b></button><button type="button" class="subscription-filter" data-filter="renewal">Renewal Due <b>0</b></button><button type="button" class="subscription-filter" data-filter="suspended">Suspended / Trial <b>0</b></button></div><label class="subscription-search"><span class="material-symbols-outlined">search</span><input id="subscription-search" type="search" placeholder="Search customer, plan ID, or tag..." /></label></div><div class="subscription-table-head"><span>Plan &amp; entitlement</span><span>Customer entity</span><span>Commit value &amp; cycle</span><span>Next bill</span><span>State</span><span></span></div><div id="subscription-rows" class="space-y-2">${a}</div><p id="subscription-empty" class="hidden text-center text-sm text-on-surface-variant py-8">No subscriptions match this view.</p><div class="flex items-center justify-between gap-3 pt-4 text-xs text-on-surface-variant"><span>Showing <strong class="text-on-surface">${s.length}</strong> of ${s.length} recurring contracts</span><span class="font-mono">Page 1</span></div></section>
    <section class="card card-extruded space-y-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">calculate</span><div><h3 class="text-base font-bold">Mid-Cycle Seat Upgrade &amp; Proration</h3><p class="text-xs text-on-surface-variant">Preview the delta before changing a recurring contract.</p></div></div><div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"><label>Active plan<select class="input-clay w-full mt-1" id="prorate-plan"><option value="4200">Executive Seats (₹4,200/yr)</option><option value="120000">Enterprise Core (₹120k/yr)</option></select></label><label>Seats added<input type="number" id="prorate-seats" min="1" value="5" class="input-clay w-full mt-1" /></label><label>Days remaining<input type="number" id="prorate-days" min="1" max="365" value="142" class="input-clay w-full mt-1" /></label><label>Proration delta<div class="font-mono font-bold text-base text-primary p-2 mt-1 rounded-lg bg-surface-container" id="prorate-result">₹8,169.86</div></label></div></section>
  </div>`}async function Dt(){try{return await p.get("/subscriptions/plans")}catch{return[]}}function Tt(){var u;const t=document.getElementById("subscription-search"),s=[...document.querySelectorAll(".subscription-row")],n=document.getElementById("subscription-empty"),o=[...document.querySelectorAll(".subscription-filter")];let a="all";const e=()=>{const m=((t==null?void 0:t.value)||"").toLowerCase().trim();let x=0;s.forEach(f=>{const h=!m||f.dataset.search.includes(m),w=a!=="active"||f.querySelector(".badge-success");f.classList.toggle("hidden",!h||!w),h&&w&&(x+=1)}),n==null||n.classList.toggle("hidden",x>0)};t==null||t.addEventListener("input",e),o.forEach(m=>m.addEventListener("click",()=>{a=m.dataset.filter,o.forEach(x=>x.classList.toggle("active",x===m)),e()}));const r=document.getElementById("prorate-seats"),i=document.getElementById("prorate-days"),l=document.getElementById("prorate-plan"),c=document.getElementById("prorate-result"),d=()=>{c&&(c.textContent=L(Number(l==null?void 0:l.value)/365*Number((i==null?void 0:i.value)||0)*Number((r==null?void 0:r.value)||0)))};[r,i,l].forEach(m=>m==null?void 0:m.addEventListener("input",d)),(u=document.getElementById("btn-add-plan"))==null||u.addEventListener("click",()=>E.show({title:"New Subscription Plan",content:'<input id="plan-name-in" type="text" class="input-clay w-full" placeholder="Plan name" /><input id="plan-price-in" type="number" class="input-clay w-full mt-3" placeholder="Base rate (INR)" />',confirmText:"Create Plan",onConfirm:async()=>{const m=document.getElementById("plan-name-in").value.trim(),x=Number(document.getElementById("plan-price-in").value);if(!m||!x)throw new Error("Plan name and price are required");return await p.post("/subscriptions/plans",{name:m,cadence:"yearly",product_id:1,price:x}),window.location.reload(),!0}}))}const A=t=>`₹${Number(t||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`,R=t=>(t||"yearly").replace(/^./,s=>s.toUpperCase());function Rt(t){var r;if(!(t!=null&&t.id))return'<div class="page-container flex items-center justify-center min-h-[60vh]"><div class="card card-extruded p-8 text-center"><span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span><h2 class="text-lg font-bold">Subscription Not Found</h2><a href="#/subscriptions" class="btn btn-primary text-xs mt-4">Back to Subscriptions</a></div></div>';const s=t.schedules||[],n=s.filter(i=>i.status==="Billed").reduce((i,l)=>i+Number(l.amount||0),0),o=s.filter(i=>i.status==="Scheduled").reduce((i,l)=>i+Number(l.amount||0),0),a=s.length?s.map(i=>{var l;return`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 font-mono text-xs">${i.projected?"PROJECTED":`BILL-${String(i.id).padStart(5,"0")}`}</td><td class="py-3 px-4 font-mono text-xs">${i.billing_date||"Scheduled"}</td><td class="py-3 px-4 text-xs">${i.customer_name||((l=t.customers)==null?void 0:l[0])||"Unassigned account"}</td><td class="py-3 px-4 font-mono text-xs text-right font-bold">${A(i.amount)}</td><td class="py-3 px-4"><span class="badge ${i.status==="Billed"?"badge-success":"badge-warning"} text-[10px]">${i.status||"Scheduled"}</span></td></tr>`}).join(""):'<tr><td colspan="5" class="py-8 text-center text-xs text-on-surface-variant">No billing cycles have been generated for this subscription yet.</td></tr>',e=t.is_active!==!1;return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/subscriptions" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Subscriptions</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">SUB-${String(t.id).padStart(4,"0")}</span></div>
    <div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary"><span class="material-symbols-outlined text-3xl">receipt_long</span></div><div><div class="flex items-center gap-2 flex-wrap"><h1 class="text-xl font-bold text-on-surface">Billing Detail</h1><span class="badge ${e?"badge-success":"badge-error"} text-[10px]">${e?"Active":"Canceled"}</span></div><p class="text-sm font-bold text-on-surface mt-1">${t.name}</p><p class="text-xs text-on-surface-variant mt-1">Product ${t.product_id} · ${R(t.cadence)} recurring contract</p></div></div><div class="flex items-center gap-2">${e?'<button type="button" class="btn btn-secondary text-xs" id="btn-modify-subscription"><span class="material-symbols-outlined text-sm">edit_note</span><span>Modify Terms</span></button><button type="button" class="btn btn-secondary text-xs text-error" id="btn-cancel-subscription"><span class="material-symbols-outlined text-sm">bolt</span><span>Cancel Contract</span></button>':""}</div></div></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded subscription-detail-stat"><span>Contract Value</span><strong>${A(t.price)}</strong><em>per ${R(t.cadence).toLowerCase()} cycle</em></div><div class="card card-extruded subscription-detail-stat"><span>Billed To Date</span><strong>${A(n)}</strong><em>${s.filter(i=>i.status==="Billed").length} settled cycles</em></div><div class="card card-extruded subscription-detail-stat"><span>Scheduled Balance</span><strong>${A(o)}</strong><em>${s.filter(i=>i.status==="Scheduled").length} upcoming cycles</em></div></div>
    <section class="card card-extruded"><div class="flex items-center justify-between gap-3 mb-4"><div><h2 class="text-base font-bold">Billing Schedule</h2><p class="text-xs text-on-surface-variant">Every generated charge for this recurring contract.</p></div><span class="badge badge-primary text-[10px]">${s.length} cycles</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"><th class="py-2.5 px-4">Billing reference</th><th class="py-2.5 px-4">Billing date</th><th class="py-2.5 px-4">Customer entity</th><th class="py-2.5 px-4 text-right">Amount</th><th class="py-2.5 px-4">Status</th></tr></thead><tbody>${a}</tbody></table></div></section>
    <section class="card card-extruded"><div class="flex items-center gap-2 mb-3"><span class="material-symbols-outlined text-primary">account_balance</span><h2 class="text-base font-bold">Remittance &amp; Contract Context</h2></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer entity</span><strong>${((r=t.customers)==null?void 0:r.join(", "))||"Unassigned account"}</strong></div><div><span class="detail-label">Payment terms</span><strong>Net 30 · Direct wire</strong></div><div><span class="detail-label">Ledger status</span><strong class="text-primary">Reconciled and monitored</strong></div></div></section></div>`}async function qt(t){try{return await p.get(`/subscriptions/plans/${t}/billing-detail`)}catch(s){return console.warn("Could not fetch subscription billing detail:",s),null}}function jt(t){var s,n;(s=document.getElementById("btn-modify-subscription"))==null||s.addEventListener("click",()=>E.show({title:"Modify Subscription Terms",content:`<div class="space-y-3 text-xs"><label class="block font-bold">Plan name<input id="modify-plan-name" class="input-clay w-full mt-1" value="${t.name}" /></label><label class="block font-bold">Recurring price (INR)<input id="modify-plan-price" type="number" min="0.01" class="input-clay w-full mt-1" value="${t.price}" /></label><label class="block font-bold">Cadence<select id="modify-plan-cadence" class="input-clay w-full mt-1"><option value="monthly" ${t.cadence==="monthly"?"selected":""}>Monthly</option><option value="quarterly" ${t.cadence==="quarterly"?"selected":""}>Quarterly</option><option value="yearly" ${t.cadence==="yearly"?"selected":""}>Yearly</option></select></label></div>`,confirmText:"Save Terms",onConfirm:async()=>(await p.patch(`/subscriptions/plans/${t.id}`,{name:document.getElementById("modify-plan-name").value.trim(),price:Number(document.getElementById("modify-plan-price").value),cadence:document.getElementById("modify-plan-cadence").value}),window.location.hash=`#/subscriptions/${t.id}`,window.location.reload(),!0)})),(n=document.getElementById("btn-cancel-subscription"))==null||n.addEventListener("click",()=>{var a,e;const o=(e=(a=t==null?void 0:t.schedules)==null?void 0:a.find(r=>r.quotation_line_id))==null?void 0:e.quotation_line_id;E.show({title:"Cancel Subscription",content:'<p class="text-xs text-on-surface-variant">Future billing cycles will stop and this contract will be marked canceled.</p>',confirmText:"Cancel Contract",onConfirm:async()=>(o?await p.post(`/subscriptions/lines/${o}/cancel`,{}):await p.post(`/subscriptions/plans/${t.id}/cancel`,{}),window.location.hash="#/subscriptions",window.location.reload(),!0)})})}let g={period:"This Month",status:"All Statuses",product:"All Products"};async function q(t={}){try{const s=new URLSearchParams(t).toString();return{kpis:await p.get(`/reports/kpis?${s}`).catch(()=>null)}}catch{return{kpis:null}}}function Mt(t={}){const s=t.kpis||{quotes_created:0,avg_approval_time_hours:0,top_upsold_product:"None"},n=g.period.toLowerCase();return`
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
            <option ${g.period==="This Month"?"selected":""}>This Month</option>
            <option ${g.period==="Last Month"?"selected":""}>Last Month</option>
            <option ${g.period==="Q3"?"selected":""}>Q3</option>
            <option ${g.period==="YTD"?"selected":""}>YTD</option>
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
            <option ${g.status==="All Statuses"?"selected":""}>All Statuses</option>
            <option ${g.status==="Approved"?"selected":""}>Approved</option>
            <option ${g.status==="Pending"?"selected":""}>Pending</option>
            <option ${g.status==="Rejected"?"selected":""}>Rejected</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Product</label>
          <select id="filter-product" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option ${g.product==="All Products"?"selected":""}>All Products</option>
            <option ${g.product==="Care Plan 2yr"?"selected":""}>Care Plan 2yr</option>
            <option ${g.product==="Business Service"?"selected":""}>Business Service</option>
          </select>
        </div>
      </div>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Quotes Created</div>
          <div class="text-sm text-on-surface-variant" id="kpi-quotes">${s.quotes_created} ${n}</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Avg Approval Time</div>
          <div class="text-sm text-on-surface-variant" id="kpi-time">${s.avg_approval_time_hours} hours</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Top Upsold Product</div>
          <div class="text-sm text-on-surface-variant" id="kpi-product">${s.top_upsold_product}</div>
        </div>

      </div>

      <!-- Actions -->
      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
        <button type="button" class="btn btn-secondary" style="padding: 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--color-on-surface-variant); color: var(--color-on-surface);" id="btn-export-pdf">
          Export PDF
        </button>
      </div>

    </div>
  `}function Ft(){var s,n,o,a,e;const t=async()=>{g={period:document.getElementById("filter-period").value,status:document.getElementById("filter-status").value,product:document.getElementById("filter-product").value};const r=await q(g);r&&r.kpis&&(document.getElementById("kpi-quotes").textContent=`${r.kpis.quotes_created} ${g.period.toLowerCase()}`,document.getElementById("kpi-time").textContent=`${r.kpis.avg_approval_time_hours} hours`,document.getElementById("kpi-product").textContent=`${r.kpis.top_upsold_product}`)};(s=document.getElementById("filter-period"))==null||s.addEventListener("change",t),(n=document.getElementById("filter-status"))==null||n.addEventListener("change",t),(o=document.getElementById("filter-product"))==null||o.addEventListener("change",t),(a=document.getElementById("filter-team"))==null||a.addEventListener("change",t),(e=document.getElementById("btn-export-pdf"))==null||e.addEventListener("click",()=>{var l,c,d;const r=new URLSearchParams({period:((l=document.getElementById("filter-period"))==null?void 0:l.value)||"This Month",status:((c=document.getElementById("filter-status"))==null?void 0:c.value)||"All Statuses",product:((d=document.getElementById("filter-product"))==null?void 0:d.value)||"All Products"}),i=window.location.port==="5173"?"":"http://localhost:8000";window.open(`${i}/api/v1/reports/export/pdf?${r.toString()}`,"_blank")})}function Ht(){return`
    <div class="page-container space-y-6">
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Communication Hub</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Messages &amp; Deal Discussions</h1>
          <p class="text-xs text-on-surface-variant">Real-time negotiations, customer inquiries, and commercial approvals</p>
        </div>
      </div>

      <!-- Messages Interface -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Sidebar Thread List -->
        <div class="lg:col-span-4 space-y-3">
          <div class="card card-extruded space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-on-surface">Active Threads</h3>
              <span class="badge badge-primary text-[10px]">3 Conversations</span>
            </div>
            <div class="relative">
              <input type="text" placeholder="Search conversations..." class="input-field text-xs pl-8 py-1.5" />
              <span class="material-symbols-outlined absolute left-2.5 top-2 text-sm text-on-surface-variant">search</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="card card-extruded bg-primary-container/20 border-l-4 border-primary p-3 cursor-pointer">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface">Acme Corporation</span>
                <span class="text-[10px] text-on-surface-variant font-mono">10:42 AM</span>
              </div>
              <span class="text-[11px] font-semibold text-primary block mt-0.5">DEAL-8492 • Discount Request</span>
              <p class="text-xs text-on-surface-variant truncate mt-1">Can we request a 12% enterprise tier discount for early signing?</p>
            </div>

            <div class="card card-extruded hover:bg-surface-container-high/40 p-3 cursor-pointer transition-colors">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface">Globex Industries</span>
                <span class="text-[10px] text-on-surface-variant font-mono">Yesterday</span>
              </div>
              <span class="text-[11px] font-semibold text-on-surface-variant block mt-0.5">DEAL-7821 • Payment Terms</span>
              <p class="text-xs text-on-surface-variant truncate mt-1">Payment terms updated to Net 30. Ready for signature.</p>
            </div>

            <div class="card card-extruded hover:bg-surface-container-high/40 p-3 cursor-pointer transition-colors">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-on-surface">Initech Solutions</span>
                <span class="text-[10px] text-on-surface-variant font-mono">Sep 4</span>
              </div>
              <span class="text-[11px] font-semibold text-on-surface-variant block mt-0.5">DEAL-6104 • SLA Confirmation</span>
              <p class="text-xs text-on-surface-variant truncate mt-1">Thank you for attaching the 24/7 SLA schedule.</p>
            </div>
          </div>
        </div>

        <!-- Chat Main Area -->
        <div class="lg:col-span-8">
          <div class="card card-extruded flex flex-col h-[520px]">
            <!-- Header -->
            <div class="pb-3 border-b border-surface-container-high/60 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="avatar-box">
                  <span class="font-bold text-xs text-primary">AC</span>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-on-surface">Acme Corporation Negotiation</h3>
                  <span class="text-[11px] text-on-surface-variant">Deal Ref: DEAL-8492 • Quotation #8492</span>
                </div>
              </div>
              <span class="badge badge-info text-xs">Under Negotiation</span>
            </div>

            <!-- Messages Stream -->
            <div class="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2" id="messages-list">
              <div class="flex flex-col items-start max-w-[80%]">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-on-surface">Alice Johnson (Acme Sales Rep)</span>
                  <span class="text-[10px] text-on-surface-variant font-mono">10:15 AM</span>
                </div>
                <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
                  Hi team! Here is the revised quotation for the Enterprise Cloud Orchestration Node and Migration SLA.
                </div>
              </div>

              <div class="flex flex-col items-end ml-auto max-w-[80%]">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] text-on-surface-variant font-mono">10:30 AM</span>
                  <span class="text-[11px] font-bold text-primary">David Brown (Procurement Lead)</span>
                </div>
                <div class="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-xs text-xs">
                  We reviewed the line items. We are willing to finalize today if we can apply a 12% volume discount to the SLA package.
                </div>
              </div>

              <div class="flex flex-col items-start max-w-[80%]">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-on-surface">${(y.getUser()||{full_name:"User"}).full_name||"You"}</span>
                  <span class="text-[10px] text-on-surface-variant font-mono">10:42 AM</span>
                </div>
                <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
                  I will submit the 12% discount rule for Finance Operations approval right away.
                </div>
              </div>
            </div>

            <!-- Message Input Footer -->
            <div class="pt-3 border-t border-surface-container-high/60 flex items-center gap-2">
              <input type="text" id="msg-input" placeholder="Type your response or negotiation counter-offer..." class="input-field text-xs flex-1 py-2" />
              <button type="button" class="btn btn-primary text-xs" id="btn-send-msg">
                <span class="material-symbols-outlined text-base">send</span>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Ut(){const t=document.getElementById("btn-send-msg"),s=document.getElementById("msg-input"),n=document.getElementById("messages-list");if(t&&s&&n){const o=()=>{const a=s.value.trim();if(!a)return;const e=y.getUser()||{full_name:"You"},r=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),i=document.createElement("div");i.className="flex flex-col items-start max-w-[80%]",i.innerHTML=`
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-bold text-on-surface">${e.full_name}</span>
          <span class="text-[10px] text-on-surface-variant font-mono">${r}</span>
        </div>
        <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
          ${a}
        </div>
      `,n.appendChild(i),s.value="",n.scrollTop=n.scrollHeight};t.addEventListener("click",o),s.addEventListener("keydown",a=>{a.key==="Enter"&&o()})}}function Ot(){const t=y.getUser()||{full_name:"Alice Johnson",email:"salesrep@dealflow360.com",role:"SalesRep",phone:"+1 (555) 234-5678",address:"742 Evergreen Terrace, San Francisco, CA 94107",age:"28"},s=t.full_name?t.full_name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2):"US";return`
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
          ${t.selected_role||t.role||"Sales Representative"}
        </span>
      </div>

      <!-- Main Profile Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Left Column: User Summary Card (4 cols) -->
        <div class="md:col-span-4 space-y-4">
          <div class="card card-extruded flex flex-col items-center text-center p-6 space-y-4">
            <!-- Avatar Circle -->
            <div class="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-inner">
              <span class="font-bold text-3xl text-primary">${s}</span>
            </div>

            <div>
              <h2 class="text-lg font-bold text-on-surface">${t.full_name||"User Name"}</h2>
              <p class="text-xs text-on-surface-variant mt-0.5">${t.email||"user@dealflow360.com"}</p>
              <span class="badge badge-neutral text-[10px] mt-2 font-mono">${t.selected_role||t.role||"SalesRep"}</span>
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
                    value="${t.full_name||""}"
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
                    value="${t.email||""}"
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
                    value="${t.phone||""}"
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
                    value="${t.age||""}"
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
                >${t.address||""}</textarea>
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
  `}function Qt(){const t=document.getElementById("profile-form"),s=document.getElementById("prof-name"),n=document.getElementById("prof-phone"),o=document.getElementById("prof-age"),a=document.getElementById("prof-address"),e=document.getElementById("profile-msg"),r=document.getElementById("btn-profile-logout");t&&t.addEventListener("submit",i=>{i.preventDefault();const l=s.value.trim();if(!l)return;const c=y.getUser()||{};c.full_name=l,c.phone=n?n.value.trim():c.phone,c.age=o?o.value.trim():c.age,c.address=a?a.value.trim():c.address,y.setUser(c),e&&(e.classList.remove("hidden"),setTimeout(()=>e.classList.add("hidden"),3500))}),r&&r.addEventListener("click",()=>{confirm("Are you sure you want to sign out of DealFlow360?")&&y.logout()})}class Gt{constructor(){this.appEl=document.getElementById("app"),window.addEventListener("hashchange",()=>this.handleRoute())}init(){!window.location.hash||window.location.hash==="#/"?window.location.hash=y.isAuthenticated()?"#/quotations":"#/login":this.handleRoute()}parseHash(){const s=window.location.hash.slice(1)||"/login",[n]=s.split("?"),a=(n.startsWith("/")?n.slice(1):n).split("/"),e=a[0]||"quotations",r=a[1]||null,i=new URLSearchParams(window.location.hash.split("?")[1]||"");return{route:e,param:r,query:i}}showLoading(){this.appEl.innerHTML=`
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `}async handleRoute(){const{route:s,param:n,query:o}=this.parseHash(),a=y.isAuthenticated();if(!a&&s!=="login"&&s!=="signup"&&s!=="portal"){window.location.hash="#/login";return}if(a&&(s==="login"||s==="signup")){window.location.hash="#/quotations";return}switch(window.scrollTo(0,0),s){case"login":{this.appEl.innerHTML=j(),M();break}case"signup":{this.appEl.innerHTML=F(),H();break}case"dashboard":{const e=y.getUser();if((e?e.selected_role||e.role:"")!=="Admin"){window.location.hash="#/quotations";break}this.showLoading();const i=await O();this.appEl.innerHTML=`
          ${b("dashboard")}
          <main class="main-content">${U(i)}</main>
        `,v(),Q();break}case"quotations":{if(n){this.showLoading();const e=await D(n);this.appEl.innerHTML=`
            ${b("quotations")}
            <main class="main-content">${N(e)}</main>
          `,v(),T(n,e.products,e.customers)}else{this.showLoading();let e=!0,r="kanban";const i=async(l=e,c=r)=>{e=l,r=c;const d=await V(l);this.appEl.innerHTML=`
              ${b("quotations")}
              <main class="main-content">${G(d,l?"my":"all",c)}</main>
            `,v(),z(u=>i(u,r),u=>i(e,u))};await i(!0,"kanban")}break}case"quotation-detail":{this.showLoading();const e=n||o.get("id"),r=await D(e);this.appEl.innerHTML=`
          ${b("quotations")}
          <main class="main-content">${N(r)}</main>
        `,v(),T(e,r.products,r.customers);break}case"approvals":{this.showLoading();const e=await W();this.appEl.innerHTML=`
          ${b("approvals")}
          <main class="main-content">${Y(e)}</main>
        `,v(),J();break}case"approval-detail":{this.showLoading();const e=n||o.get("id"),r=await K(e);this.appEl.innerHTML=`
          ${b("approvals")}
          <main class="main-content">${X(r)}</main>
        `,v(),Z(e);break}case"products":{this.showLoading();const e=await tt();this.appEl.innerHTML=`
          ${b("products")}
          <main class="main-content">${et(e)}</main>
        `,v(),st();break}case"product-detail":{this.showLoading();const e=n||"new",r=await at(e);this.appEl.innerHTML=`
          ${b("products")}
          <main class="main-content">${nt(r)}</main>
        `,v(),rt(e);break}case"pricing":case"pricing-rules":{this.showLoading();const e=await ot();this.appEl.innerHTML=`
          ${b("pricing")}
          <main class="main-content">${it(e)}</main>
        `,v(),lt();break}case"customers":{this.showLoading();const e=await dt();this.appEl.innerHTML=`
          ${b("customers")}
          <main class="main-content">${ct(e)}</main>
        `,v(),pt();break}case"portal":{this.showLoading();const e=n||o.get("id"),r=await mt(e);this.appEl.innerHTML=`
          ${b("portal")}
          <main class="main-content">${ut(r)}</main>
        `,v(),xt(r.quotation);break}case"fulfillment":{if(this.showLoading(),n){const e=await ht(n);this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${yt(e)}</main>`,v(),wt(n)}else{const e=await vt();this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${bt(e)}</main>`,v(),gt()}break}case"fulfillment-override":{this.showLoading();const e=await Et(n);this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${$t(e)}</main>`,v(),kt(n);break}case"invoices":{if(n){this.showLoading();const e=await St(n);this.appEl.innerHTML=`
            ${b("invoices")}
            <main class="main-content">${Ct(e)}</main>
          `,v(),Pt(e)}else{this.showLoading();const e=await At();this.appEl.innerHTML=`
            ${b("invoices")}
            <main class="main-content">${_t(e)}</main>
          `,v(),Lt()}break}case"subscriptions":{if(this.showLoading(),n){const e=await qt(n);this.appEl.innerHTML=`${b("subscriptions")}<main class="main-content">${Rt(e)}</main>`,v(),jt(e)}else{const e=await Dt();this.appEl.innerHTML=`${b("subscriptions")}<main class="main-content">${Nt(e)}</main>`,v(),Tt()}break}case"reports":{this.showLoading();const e=await q();this.appEl.innerHTML=`
          ${b("reports")}
          <main class="main-content">${Mt(e)}</main>
        `,v(),Ft();break}case"messages":{this.appEl.innerHTML=`
          ${b("messages")}
          <main class="main-content">${Ht()}</main>
        `,v(),Ut();break}case"profile":{this.appEl.innerHTML=`
          ${b("profile")}
          <main class="main-content">${Ot()}</main>
        `,v(),Qt();break}default:{window.location.hash="#/quotations";break}}}}document.addEventListener("DOMContentLoaded",()=>{new Gt().init()});
