(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const t of n)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function i(n){const t={};return n.integrity&&(t.integrity=n.integrity),n.referrerPolicy&&(t.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?t.credentials="include":n.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(n){if(n.ep)return;n.ep=!0;const t=i(n);fetch(n.href,t)}})();const C="/api/v1";class w extends Error{constructor(s,i,a){super(s),this.name="ApiError",this.status=i,this.data=a}}const c={getToken(){return localStorage.getItem("dealflow_token")},setToken(e){e?localStorage.setItem("dealflow_token",e):localStorage.removeItem("dealflow_token")},getHeaders(e={}){const s={"Content-Type":"application/json",...e},i=this.getToken();return i&&(s.Authorization=`Bearer ${i}`),s},async request(e,s={}){const i=`${C}${e}`,a=this.getHeaders(s.headers),n={...s,headers:a};n.body&&typeof n.body=="object"&&!(n.body instanceof FormData)&&(n.body=JSON.stringify(n.body));try{const t=await fetch(i,n);if(t.status===401&&!e.includes("/auth/login"))throw this.setToken(null),localStorage.removeItem("dealflow_user"),window.location.hash="#/login",new w("Session expired. Please sign in again.",401,null);if(t.status===204)return null;const r=t.headers.get("content-type")||"";let l=null;if(r.includes("application/json")?l=await t.json():l=await t.text(),!t.ok){const o=(l==null?void 0:l.detail)||(l==null?void 0:l.message)||`Request failed with status ${t.status}`;throw new w(o,t.status,l)}return l}catch(t){throw t instanceof w?t:new w(t.message||"Network connection failed",0,null)}},get(e,s){let i=e;if(s){const a=new URLSearchParams(s).toString();a&&(i+=`?${a}`)}return this.request(i,{method:"GET"})},post(e,s){return this.request(e,{method:"POST",body:s})},put(e,s){return this.request(e,{method:"PUT",body:s})},delete(e){return this.request(e,{method:"DELETE"})}},b={getUser(){try{const e=localStorage.getItem("dealflow_user");return e?JSON.parse(e):null}catch{return null}},setUser(e){e?localStorage.setItem("dealflow_user",JSON.stringify(e)):localStorage.removeItem("dealflow_user")},isAuthenticated(){return!!c.getToken()},async login(e,s,i){const a=await c.post("/auth/login",{email:e,password:s});if(a.access_token){c.setToken(a.access_token);try{const n=await c.get("/auth/me");return n.selected_role=i||n.role,this.setUser(n),{success:!0,user:n}}catch{const n={email:e,full_name:e.split("@")[0],role:i||"SalesRep",selected_role:i||"SalesRep"};return this.setUser(n),{success:!0,user:n}}}throw new Error("Authentication failed: No access token received")},async signup({full_name:e,email:s,password:i,role:a}){return await c.post("/auth/signup",{full_name:e,email:s,password:i,role:a})},logout(){c.setToken(null),this.setUser(null),window.location.hash="#/login"}};function x(e="quotations"){const s=b.getUser()||{full_name:"User",role:"SalesRep"},i=s.selected_role||s.role||"",a=[{key:"quotations",label:"My Quotations",icon:"request_quote",href:"#/quotations"},{key:"messages",label:"Messages",icon:"chat_bubble",href:"#/messages"},{key:"profile",label:"Profile",icon:"account_circle",href:"#/profile"}];return i==="Admin"&&a.unshift({key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"}),`
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
          ${a.map(t=>{const l=e===t.key||e==="quotation-detail"&&t.key==="quotations"?"nav-item-active":"nav-item-inactive";return`
        <a href="${t.href}" class="nav-item ${l}" data-route="${t.key}">
          <span class="material-symbols-outlined text-lg">${t.icon}</span>
          <span>${t.label}</span>
        </a>
      `}).join("")}
        </nav>

        <!-- Right User Actions -->
        <div class="navbar-actions">
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
  `}function f(){const e=document.getElementById("btn-logout");e&&e.addEventListener("click",()=>{confirm("Are you sure you want to sign out?")&&b.logout()})}function L(){return`
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
  `}function _(){const e=document.getElementById("login-form"),s=document.getElementById("login-error"),i=document.getElementById("btn-submit-login"),a=document.getElementById("toggle-pw"),n=document.getElementById("login-password"),t=document.getElementById("pw-icon");a&&n&&t&&a.addEventListener("click",()=>{n.type==="password"?(n.type="text",t.textContent="visibility_off"):(n.type="password",t.textContent="visibility")}),e&&e.addEventListener("submit",async r=>{r.preventDefault(),s.classList.add("hidden"),s.textContent="",i.disabled=!0,i.innerHTML='<span class="loading-spinner"></span> Authenticating...';const l=document.getElementById("login-email").value.trim(),o=n.value.trim();try{await b.login(l,o),window.location.hash="#/quotations"}catch(d){s.textContent=d.message||"Login failed. Check your credentials.",s.classList.remove("hidden")}finally{i.disabled=!1,i.innerHTML='<span><span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span></span>'}})}function P(){return`
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
  `}function D(){const e=document.getElementById("signup-form"),s=document.getElementById("signup-error"),i=document.getElementById("signup-success"),a=document.getElementById("btn-submit-signup"),n=document.getElementById("signup-toggle-pw"),t=document.getElementById("signup-password"),r=document.getElementById("signup-pw-icon");n&&t&&r&&n.addEventListener("click",()=>{t.type==="password"?(t.type="text",r.textContent="visibility_off"):(t.type="password",r.textContent="visibility")}),e&&e.addEventListener("submit",async l=>{l.preventDefault(),s.classList.add("hidden"),s.textContent="",i.classList.add("hidden"),i.textContent="",a.disabled=!0,a.innerHTML='<span class="loading-spinner"></span> Creating Account...';const o=document.getElementById("signup-name").value.trim(),d=document.getElementById("signup-email").value.trim(),u=t.value,p=document.getElementById("signup-confirm-password").value;if(u!==p){s.textContent="Passwords do not match.",s.classList.remove("hidden"),a.disabled=!1,a.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}if(u.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden"),a.disabled=!1,a.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}try{await b.signup({full_name:o,email:d,password:u,role:"SalesRep"}),i.textContent="Account created successfully! Redirecting to login...",i.classList.remove("hidden"),e.reset(),setTimeout(()=>{window.location.hash="#/login"},1500)}catch(m){s.textContent=m.message||"Signup failed. Please try again.",s.classList.remove("hidden")}finally{a.disabled=!1,a.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>'}})}const y={show({title:e,content:s,onConfirm:i,confirmText:a="Confirm",cancelText:n="Cancel",showConfirm:t=!0}){const r=document.getElementById("df-modal-backdrop");r&&r.remove();const l=`
      <div id="df-modal-backdrop" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${e}</h3>
            <button type="button" class="modal-close-btn" id="df-modal-close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="modal-body">
            ${s}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="df-modal-cancel">${n}</button>
            ${t?`<button type="button" class="btn btn-primary" id="df-modal-confirm">${a}</button>`:""}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",l);const o=document.getElementById("df-modal-backdrop"),d=document.getElementById("df-modal-close"),u=document.getElementById("df-modal-cancel"),p=document.getElementById("df-modal-confirm"),m=()=>{o.classList.add("fade-out"),setTimeout(()=>o.remove(),200)};return d.addEventListener("click",m),u.addEventListener("click",m),o.addEventListener("click",g=>{g.target===o&&m()}),p&&i&&p.addEventListener("click",async()=>{p.disabled=!0,p.innerHTML='<span class="loading-spinner"></span> Processing...';try{await i()!==!1&&m()}catch(g){alert(g.message||"Action failed")}finally{p.disabled=!1,p.innerHTML=a}}),{close:m}}};function I(e={}){const{summary:s={},quotations:i=[]}=e,a=s.total_revenue?`₹${Number(s.total_revenue).toLocaleString("en-IN")}`:"₹4,82,05,000",n=s.pending_approvals??12,t=(s.total_quotations||s.draft_count)&&s.total_quotations||38,r=s.win_rate?`${s.win_rate}%`:"68.5%",l=(i.length>0?i.slice(0,6):[{id:8492,deal_reference:"DEAL-8492",rep_name:"Marcus Hayes",customer_name:"Acme Corp Global ERP",total_amount:34e5,status:"Approved",time:"Today, 09:42 AM"},{id:8488,deal_reference:"DEAL-8488",rep_name:"Sarah Lin",customer_name:"Starlight Pharma Logistics",total_amount:115e5,status:"Under Negotiation",time:"Today, 08:15 AM"},{id:8475,deal_reference:"DEAL-8475",rep_name:"Eleanor Vance",customer_name:"Helios Solar Microgrid Infra",total_amount:89e5,status:"Fulfilled",time:"Yesterday, 17:30 PM"},{id:8461,deal_reference:"DEAL-8461",rep_name:"David Kim",customer_name:"Apex Financial Cloud Vault",total_amount:475e4,status:"Draft",time:"Yesterday, 14:10 PM"}]).map(o=>{let d="badge-primary";const u=(o.status||"").toLowerCase();return u.includes("approve")?d="badge-success":u.includes("negotiat")||u.includes("review")||u.includes("pending")?d="badge-warning":u.includes("fulfill")?d="badge-info":u.includes("draft")&&(d="badge-neutral"),`
      <tr class="table-row hover:bg-surface-container/50 transition-colors">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${o.time||"Recent"}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${(o.rep_name||"US").split(" ").map(p=>p[0]).join("").substring(0,2)}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${o.rep_name||"Sales Rep"}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${o.customer_name||"Enterprise Client"}</span>
            <span class="text-[10px] font-mono text-primary">${o.deal_reference||`DEAL-${o.id}`}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(o.total_amount||0).toLocaleString("en-IN")}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${d}">${o.status||"Draft"}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${o.id}" class="btn btn-secondary text-xs py-1 px-3">Review Deal</a>
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
            <div class="text-2xl font-bold tracking-tight text-on-surface">${a}</div>
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
              ${n} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
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
              ${t} <span class="text-sm font-normal text-on-surface-variant">Quotes</span>
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
              ${l}
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
  `}async function B(){try{const[e,s]=await Promise.all([c.get("/dashboard/summary").catch(()=>({})),c.get("/quotations").catch(()=>[])]);return{summary:e,quotations:s}}catch{return{summary:{},quotations:[]}}}function T(){const e=document.getElementById("btn-export-dash");e&&e.addEventListener("click",()=>{window.location.hash="#/reports"});const s=document.getElementById("btn-new-deal-dash");s&&s.addEventListener("click",()=>{window.location.hash="#/quotation-detail"});const i=document.getElementById("btn-dl-audit");i&&i.addEventListener("click",()=>{alert("Downloading audit trail CSV...")})}function j(e=[],s="my",i="kanban"){const a=b.getUser()||{full_name:"User"},n=[{id:"draft",title:"Draft",match:o=>o.includes("draft")},{id:"pending",title:"Pending Approval",match:o=>o.includes("pending")||o.includes("review")},{id:"approved",title:"Approved",match:o=>o.includes("approved")},{id:"negotiation",title:"Negotiation",match:o=>o.includes("negotiat")||o.includes("sent")},{id:"confirmed",title:"Confirmed",match:o=>o.includes("confirmed")||o.includes("fulfilled")}],t=o=>{const d=Number(o.total_amount||0).toLocaleString("en-IN");return`
      <div 
        class="quote-card card card-extruded border border-outline-variant/60 rounded-2xl p-4 cursor-pointer hover:border-primary transition-all space-y-1.5"
        onclick="window.location.hash='#/quotations/${o.id}'"
        data-ref="${(o.deal_reference||"").toLowerCase()}" 
        data-customer="${(o.customer_name||"").toLowerCase()}" 
        data-rep="${(o.rep_name||"").toLowerCase()}"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-on-surface">${o.customer_name||"Customer"} - ₹${d}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
          <span>${o.deal_reference||`DEAL-${o.id}`}</span>
          <span>${o.line_count||(o.lines?o.lines.length:0)} items</span>
        </div>
      </div>
    `},r=n.map(o=>{const d=e.filter(p=>o.match((p.status||"").toLowerCase())),u=d.length===0?'<div class="p-4 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl">Empty</div>':d.map(t).join("");return`
      <div class="card card-extruded border border-outline-variant/60 rounded-2xl p-4 flex flex-col min-h-[380px] space-y-4 bg-surface-container-low/40">
        <!-- Column Header -->
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-2">
          <h3 class="font-bold text-sm text-on-surface">${o.title}</h3>
          <span class="badge badge-neutral text-xs font-bold font-mono">${d.length}</span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          ${u}
        </div>
      </div>
    `}).join(""),l=e.length===0?`
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found for <strong>${a.full_name||"your account"}</strong>.
        </td>
      </tr>
    `:e.map(o=>`
        <tr 
          class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40 cursor-pointer"
          onclick="window.location.hash='#/quotations/${o.id}'"
        >
          <td class="py-3 px-4 font-mono font-bold text-xs text-primary">${o.deal_reference||`DEAL-${o.id}`}</td>
          <td class="py-3 px-4 text-xs font-bold text-on-surface">${o.customer_name||"Customer"}</td>
          <td class="py-3 px-4"><span class="badge badge-neutral text-[10px]">${o.customer_tier||"Bronze"}</span></td>
          <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">₹${Number(o.total_amount||0).toLocaleString("en-IN")}</td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${o.line_count||(o.lines?o.lines.length:0)} items</td>
          <td class="py-3 px-4"><span class="badge badge-primary text-xs">${o.status||"Draft"}</span></td>
          <td class="py-3 px-4 text-xs text-on-surface-variant">${o.rep_name||"Sales Rep"}</td>
          <td class="py-3 px-4 text-right">
            <a href="#/quotations/${o.id}" class="btn btn-secondary text-xs py-1 px-2.5">View</a>
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
      ${i==="kanban"?`
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
                ${l}
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

        <button type="button" class="btn btn-secondary text-xs font-bold px-5 py-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high/60 flex items-center gap-2" id="btn-mode-toggle" data-target-mode="${i==="kanban"?"table":"kanban"}">
          <span class="material-symbols-outlined text-base">${i==="kanban"?"table_rows":"view_kanban"}</span>
          <span>${i==="kanban"?"Switch to Table View":"Switch to Kanban View"}</span>
        </button>
      </div>
    </div>
  `}async function q(e=!0){try{return await c.get(`/quotations?my_only=${e}`)}catch{return[]}}function R(e,s){document.querySelectorAll("#quote-scope-toggle button").forEach(n=>{n.addEventListener("click",()=>{const t=n.getAttribute("data-scope");typeof e=="function"&&e(t==="my")})});const a=document.getElementById("btn-mode-toggle");a&&a.addEventListener("click",()=>{const n=a.getAttribute("data-target-mode");typeof s=="function"&&s(n)})}function k(e={}){var p,m,g;const{quotation:s=null,products:i=[],customers:a=[]}=e,n=!s||!s.id,t=s||{id:0,deal_reference:"DEAL-NEW",customer_name:((p=a[0])==null?void 0:p.name)||"Acme Corp Global ERP",customer_email:((m=a[0])==null?void 0:m.email)||"procurement@acme.corp",customer_tier:((g=a[0])==null?void 0:g.tier)||"Gold",status:"Draft",lines:[]},r=!t.lines||t.lines.length===0?`
      <tr>
        <td colspan="7" class="text-center py-6 text-on-surface-variant text-xs">
          No line items added yet. Click <strong>Add Product Line +</strong> to populate this deal.
        </td>
      </tr>
    `:t.lines.map(v=>`
        <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
          <td class="py-2.5 px-4 font-bold text-xs text-on-surface">
            ${v.product_name||`Product #${v.product_id}`}
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface-variant">${v.sku||"SKU-STD"}</td>
          <td class="py-2.5 px-4">
            <span class="badge badge-neutral text-[10px]">${v.category_snapshot||"Hardware"}</span>
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">${v.quantity}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">₹${Number(v.unit_price).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-tertiary">${v.discount_percent||0}%</td>
          <td class="py-2.5 px-4 font-mono font-bold text-xs text-primary">₹${Number(v.line_total).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 text-right">
            ${n?"":`
              <button type="button" class="icon-btn text-error hover:bg-error-container/30 delete-line-btn" data-line-id="${v.id}" title="Remove Line">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            `}
          </td>
        </tr>
      `).join(""),l=t.lines?t.lines.reduce((v,h)=>v+(h.line_total||0),0):0,o=l;let d="badge-neutral";const u=(t.status||"").toLowerCase();return u.includes("approved")?d="badge-success":u.includes("pending")?d="badge-warning":u.includes("negotiat")?d="badge-info":(u.includes("fulfilled")||u.includes("confirmed"))&&(d="badge-success"),`
    <div class="page-container space-y-6">
      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
          <a href="#/quotations" class="hover:text-primary flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Quotations
          </a>
          <span>/</span>
          <span class="font-mono text-primary font-bold">${t.deal_reference||"DEAL-NEW"}</span>
        </div>

        <div class="flex items-center gap-2">
          ${n?"":`
            <a href="#/portal?id=${t.id}" class="btn btn-secondary text-xs" target="_blank">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              Customer Portal
            </a>
            <a href="#/fulfillment?id=${t.id}" class="btn btn-secondary text-xs">
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
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">${t.deal_reference||"New Commercial Deal"}</h1>
            <span class="badge ${d} text-xs">${t.status||"Draft"}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Enterprise Client: <strong class="text-on-surface">${t.customer_name}</strong> • Account Rep: Eleanor Vance
          </p>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="quote-action-bar">
          ${t.status==="Draft"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-submit-approval">
              <span class="material-symbols-outlined text-base">send_and_archive</span>
              Submit for Approval
            </button>
          `:""}
          ${t.status==="Pending Approval"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-approve-quote">
              <span class="material-symbols-outlined text-base">check_circle</span>
              Approve Quotation
            </button>
            <button type="button" class="btn btn-secondary text-xs text-error" id="btn-reject-quote">
              <span class="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          `:""}
          ${t.status==="Approved"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-send-portal">
              <span class="material-symbols-outlined text-base">outgoing_mail</span>
              Send to Customer Portal
            </button>
          `:""}
          ${t.status==="Under Negotiation"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-confirm-quote">
              <span class="material-symbols-outlined text-base">handshake</span>
              Confirm &amp; Finalize Deal
            </button>
          `:""}
          ${t.status==="Confirmed"?`
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
          <div class="p-2.5 rounded-xl ${["Draft","Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(t.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            1. Draft &amp; CPQ
          </div>
          <div class="p-2.5 rounded-xl ${["Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(t.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            2. Review &amp; Governance
          </div>
          <div class="p-2.5 rounded-xl ${["Approved","Under Negotiation","Confirmed","Fulfilled"].includes(t.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            3. Customer Portal
          </div>
          <div class="p-2.5 rounded-xl ${["Confirmed","Fulfilled"].includes(t.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            4. Warehouse Split
          </div>
          <div class="p-2.5 rounded-xl ${t.status==="Fulfilled"?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
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
                  ${t.customer_name}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-on-surface-variant block mb-1">Tier</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    ${t.customer_tier||"Gold"}
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
                <span class="font-mono font-semibold text-on-surface">₹${Number(l).toLocaleString("en-IN")}</span>
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
              <span class="text-xl font-bold font-mono text-primary">₹${Number(o).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}async function A(e){try{const[s,i,a]=await Promise.all([e?c.get(`/quotations/${e}`).catch(()=>null):null,c.get("/products").catch(()=>[]),c.get("/customers").catch(()=>[])]);return{quotation:s,products:i,customers:a}}catch{return{quotation:null,products:[],customers:[]}}}function $(e,s=[],i=[]){const a=document.getElementById("btn-add-line-modal");a&&a.addEventListener("click",()=>{const p=s.map(m=>`
        <option value="${m.id}">${m.name} — ₹${Number(m.base_price).toLocaleString("en-IN")} (${m.category})</option>
      `).join("");y.show({title:"Add Product Line Item",content:`
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Select Product</label>
              <select id="modal-product-select" class="input-clay w-full text-xs">
                ${p||'<option value="1">Enterprise Cloud Orchestration Node — ₹120,000</option>'}
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity</label>
              <input id="modal-product-qty" type="number" min="1" value="1" class="input-clay w-full text-xs" />
            </div>
          </div>
        `,confirmText:"Add to Quotation",onConfirm:async()=>{var h;const m=parseInt(document.getElementById("modal-product-select").value,10),g=parseFloat(document.getElementById("modal-product-qty").value)||1;if(!e||e==="0"||e===0||e==="undefined"){const S=((h=i[0])==null?void 0:h.id)||1,E=await c.post("/quotations",{customer_id:S});await c.post(`/quotations/${E.id}/lines`,{product_id:m,quantity:g}),window.location.hash=`#/quotations/${E.id}`,window.location.reload()}else await c.post(`/quotations/${e}/lines`,{product_id:m,quantity:g}),window.location.reload();return!0}})}),document.querySelectorAll(".delete-line-btn").forEach(p=>{p.addEventListener("click",async()=>{const m=p.getAttribute("data-line-id");confirm("Remove this line item from quotation?")&&(await c.delete(`/quotations/${e}/lines/${m}`),window.location.reload())})});const n=async p=>{await c.put(`/quotations/${e}`,{status:p}),window.location.reload()},t=document.getElementById("btn-submit-approval");t&&t.addEventListener("click",()=>n("Pending Approval"));const r=document.getElementById("btn-approve-quote");r&&r.addEventListener("click",()=>n("Approved"));const l=document.getElementById("btn-reject-quote");l&&l.addEventListener("click",()=>n("Rejected"));const o=document.getElementById("btn-send-portal");o&&o.addEventListener("click",()=>n("Under Negotiation"));const d=document.getElementById("btn-confirm-quote");d&&d.addEventListener("click",()=>n("Confirmed"));const u=document.getElementById("btn-fulfill-quote");u&&u.addEventListener("click",()=>n("Fulfilled"))}function M(e=[]){const s=e.filter(n=>(n.status||"").toLowerCase().includes("pending")||(n.status||"").toLowerCase().includes("draft")),i=s.length>0?s:[{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",customer_tier:"Gold",total_amount:34e4,rep_name:"Marcus Hayes",discount:"18%",limit:"15%",reason:"Multi-region deployment incentive requested for 3-year upfront commitment."},{id:8488,deal_reference:"DEAL-8488",customer_name:"Starlight Pharma Logistics",customer_tier:"Silver",total_amount:115e4,rep_name:"Sarah Lin",discount:"14%",limit:"10%",reason:"Competitive displacement against legacy SAP stack."},{id:8461,deal_reference:"DEAL-8461",customer_name:"Apex Financial Cloud Vault",customer_tier:"Bronze",total_amount:475e3,rep_name:"David Kim",discount:"8%",limit:"5%",reason:"Volume licensing ramp-up structure."}],a=i.map(n=>`
    <div class="card card-extruded space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
        <div class="flex items-center gap-3">
          <span class="font-mono font-bold text-sm text-primary">${n.deal_reference||`DEAL-${n.id}`}</span>
          <span class="badge badge-warning text-[10px]">VP Sign-off Required</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-on-surface-variant">Contract Valuation</span>
          <div class="font-mono font-bold text-base text-on-surface">$${Number(n.total_amount||34e4).toLocaleString()}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-on-surface-variant block mb-1">Customer Account</span>
          <div class="font-bold text-on-surface">${n.customer_name}</div>
          <span class="badge badge-neutral text-[10px] mt-1">${n.customer_tier||"Gold"} Tier</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Discount Threshold</span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-error">${n.discount||"15%"} Requested</span>
            <span class="text-on-surface-variant">(Max allowed: ${n.limit||"10%"})</span>
          </div>
          <span class="text-[10px] text-error font-semibold mt-1 block">Tier Exception Triggered</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Sales Representative</span>
          <div class="font-bold text-on-surface">${n.rep_name||"Eleanor Vance"}</div>
          <span class="text-[10px] text-on-surface-variant">Enterprise Mid-Market</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant">
        <strong class="text-on-surface">Escalation Note:</strong>
        ${n.reason||"Requested commercial discount exceeding sales representative discretion for multi-year upfront commitment."}
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high/60">
        <a href="#/quotations/${n.id}" class="btn btn-secondary text-xs">
          <span class="material-symbols-outlined text-sm">visibility</span>
          Inspect Line Items
        </a>
        <button type="button" class="btn btn-secondary text-xs text-error reject-approval-btn" data-id="${n.id}">
          <span class="material-symbols-outlined text-sm">close</span>
          Reject
        </button>
        <button type="button" class="btn btn-primary text-xs approve-deal-btn" data-id="${n.id}">
          <span class="material-symbols-outlined text-sm">check</span>
          Authorize &amp; Approve
        </button>
      </div>
    </div>
  `).join("");return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Executive Governance</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Approvals &amp; Pricing Escalations</h1>
          <p class="text-xs text-on-surface-variant">Commercial discount gates, threshold waivers, and executive sign-off queues</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="badge badge-warning text-xs">
            <span class="material-symbols-outlined text-sm">gavel</span>
            ${i.length} Escalations Pending
          </span>
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <button type="button" class="btn btn-secondary py-1 px-3 active">All Pending (${i.length})</button>
        <button type="button" class="btn btn-secondary py-1 px-3">High Priority (4)</button>
        <button type="button" class="btn btn-secondary py-1 px-3">Discount Exception (6)</button>
        <button type="button" class="btn btn-secondary py-1 px-3">Legal Terms (2)</button>
      </div>

      <!-- Approvals List -->
      <div class="space-y-4">
        ${a}
      </div>
    </div>
  `}async function N(){try{return await c.get("/quotations")}catch{return[]}}function H(){document.querySelectorAll(".approve-deal-btn").forEach(e=>{e.addEventListener("click",async()=>{const s=e.getAttribute("data-id");try{await c.put(`/quotations/${s}`,{status:"Approved"}),alert(`Deal #${s} has been successfully approved.`),window.location.reload()}catch(i){alert(i.message||"Approval failed")}})}),document.querySelectorAll(".reject-approval-btn").forEach(e=>{e.addEventListener("click",async()=>{const s=e.getAttribute("data-id");if(confirm(`Reject quotation #${s}?`))try{await c.put(`/quotations/${s}`,{status:"Rejected"}),alert(`Deal #${s} has been rejected.`),window.location.reload()}catch(i){alert(i.message||"Action failed")}})})}function F(e=[]){return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="card card-extruded">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="max-w-2xl">
            <div class="flex items-center gap-2 mb-1">
              <span class="pulse-dot"></span>
              <span class="text-xs font-bold text-primary tracking-widest uppercase">SKU Catalog v4.9 • CPQ Synced</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">Product &amp; Service Master Catalog</h1>
            <p class="text-xs text-on-surface-variant mt-1">
              Configure master SKUs, rate cards, and billing recurrence units across commercial tiers with automated M&amp;A transaction governance.
            </p>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container">
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase">Active Multi-Tenancy</span>
              <div class="font-mono font-bold text-lg text-on-surface">1,489 SKUs</div>
            </div>
            <div class="h-8 w-px bg-outline-variant/50"></div>
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase">Avg Deal ACV</span>
              <div class="font-mono font-bold text-lg text-primary">₹184.2K</div>
            </div>
          </div>
        </div>

        <!-- Filter Chips & Search -->
        <div class="mt-4 pt-4 border-t border-surface-container-high/60 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5" id="product-category-filters">
            <button type="button" class="btn btn-secondary text-xs py-1 px-3 active" data-cat="all">All SKUs</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Hardware">Hardware</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Cloud Infrastructure">Cloud</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Software & SaaS">Software / SaaS</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-cat="Professional Services">Services</button>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              id="product-search-input"
              class="input-clay text-xs py-1.5 px-3 w-52"
              placeholder="Search SKU or name..."
            />
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="products-grid">
        ${(e.length>0?e:[{id:1,name:"Enterprise Cloud Orchestration Node",sku:"SKU-CLD-900",category:"Cloud Infrastructure",base_price:18500,description:"High-throughput container runtime cluster with 99.99% uptime SLA."},{id:2,name:"Quantum Edge Gateway Terminal",sku:"SKU-HDW-410",category:"Hardware",base_price:45e3,description:"Ruggedized hardware cryptographic accelerator for zero-trust branch networks."},{id:3,name:"Enterprise M&A CPQ Core Engine",sku:"SKU-SFT-101",category:"Software & SaaS",base_price:12e4,description:"Complete dealflow, quotation rules, and multitenancy pricing engine."},{id:4,name:"Architecture Consulting & Migration SLA",sku:"SKU-SRV-050",category:"Professional Services",base_price:35e3,description:"Dedicated enterprise solutions architect team with 24/7 priority support."},{id:5,name:"AI Compliance & Anomaly Sentinel",sku:"SKU-SFT-202",category:"Software & SaaS",base_price:64e3,description:"Continuous transaction monitoring for antitrust, sanction, and margin slippage."},{id:6,name:"High-Density Terabit Switch Blade",sku:"SKU-HDW-880",category:"Hardware",base_price:82e3,description:"Carrier-grade spine switch with sub-microsecond packet latency."}]).map(a=>`
    <div class="card card-extruded flex flex-col justify-between space-y-4 product-card" data-category="${a.category||"All"}">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge-neutral font-mono text-[10px]">${a.sku||`SKU-${a.id}`}</span>
          <span class="badge badge-primary text-[10px]">${a.category||"Standard"}</span>
        </div>
        <h3 class="text-sm font-bold text-on-surface line-clamp-2">${a.name}</h3>
        <p class="text-xs text-on-surface-variant mt-2 line-clamp-3">
          ${a.description||"Configured for enterprise production environments with automated compliance telemetry."}
        </p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">List Price</span>
          <span class="font-mono font-bold text-base text-primary">$${Number(a.base_price).toLocaleString()}</span>
        </div>
        <button type="button" class="btn btn-primary text-xs py-1.5 px-3 add-to-deal-btn" data-product-id="${a.id}" data-product-name="${a.name}">
          <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
          <span>Add to Deal</span>
        </button>
      </div>
    </div>
  `).join("")}
      </div>
    </div>
  `}async function U(){try{return await c.get("/products")}catch{return[]}}function G(){const e=document.getElementById("product-search-input"),s=document.querySelectorAll(".product-card");e&&e.addEventListener("input",a=>{const n=a.target.value.toLowerCase();s.forEach(t=>{const r=t.textContent.toLowerCase();t.style.display=r.includes(n)?"":"none"})});const i=document.querySelectorAll("#product-category-filters button");i.forEach(a=>{a.addEventListener("click",()=>{i.forEach(t=>t.classList.remove("active")),a.classList.add("active");const n=a.getAttribute("data-cat");s.forEach(t=>{if(n==="all")t.style.display="";else{const r=t.getAttribute("data-category");t.style.display=r.includes(n)?"":"none"}})})}),document.querySelectorAll(".add-to-deal-btn").forEach(a=>{a.addEventListener("click",async()=>{const n=a.getAttribute("data-product-id"),t=a.getAttribute("data-product-name");y.show({title:`Add ${t} to Quotation`,content:`
          <div class="space-y-3 text-xs">
            <p class="text-on-surface-variant">Configure quantity to append this SKU to an active deal:</p>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity Units</label>
              <input type="number" id="quick-add-qty" min="1" value="1" class="input-clay w-full" />
            </div>
          </div>
        `,confirmText:"Generate Deal",onConfirm:async()=>{const r=parseFloat(document.getElementById("quick-add-qty").value)||1,l=await c.post("/quotations",{customer_id:1});return await c.post(`/quotations/${l.id}/lines`,{product_id:parseInt(n,10),quantity:r}),window.location.hash=`#/quotations/${l.id}`,!0}})})})}function Q(e=[]){return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Discount Governance Matrix</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Pricing &amp; Discount Rules</h1>
          <p class="text-xs text-on-surface-variant">Customer tier allowances, category caps, and automated approval thresholds</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-add-pricelist">
          <span class="material-symbols-outlined text-base">add</span>
          New Price Schedule +
        </button>
      </div>

      <!-- 3 Governance Matrices from Wireframe -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Customer Tier Discounts -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-primary text-base">military_tech</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Customer Tier Allowances</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Bronze Tier</span>
              <span class="font-mono font-bold text-primary">5% Max Disc.</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Silver Tier</span>
              <span class="font-mono font-bold text-primary">10% Max Disc.</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Gold Tier</span>
              <span class="font-mono font-bold text-primary">15% Max Disc.</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Category Max Discounts -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-tertiary text-base">category</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Category Margin Protections</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Hardware Products</span>
              <span class="font-mono font-bold text-tertiary">20% Cap</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Software &amp; SaaS</span>
              <span class="font-mono font-bold text-tertiary">30% Cap</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="font-bold text-on-surface">Professional Services</span>
              <span class="font-mono font-bold text-tertiary">15% Cap</span>
            </div>
          </div>
        </div>

        <!-- Card 3: Escalation Threshold Routing -->
        <div class="card card-extruded space-y-3">
          <div class="flex items-center gap-2 border-b border-surface-container-high/60 pb-2">
            <span class="material-symbols-outlined text-secondary text-base">rule</span>
            <h3 class="text-xs font-bold text-on-surface uppercase tracking-wider">Escalation Thresholds</h3>
          </div>
          <div class="space-y-2 text-xs">
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Within Category Limit</div>
              <div class="text-[11px] text-on-surface-variant mt-0.5">No approval needed • Auto-approved</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Over Limit / Tier Exception</div>
              <div class="text-[11px] text-error font-medium mt-0.5">Requires Sales Director sign-off</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container">
              <div class="font-bold text-on-surface">Over Discretionary Ceiling</div>
              <div class="text-[11px] text-error font-medium mt-0.5">Sales Director then VP / Finance sign-off</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Lists Directory -->
      <div class="card card-extruded">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-on-surface">Master Price Schedules</h3>
            <p class="text-xs text-on-surface-variant">Active price books utilized across commercial quotation generators</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Price Schedule Name</th>
                <th class="py-2.5 px-4">Currency</th>
                <th class="py-2.5 px-4">Scope &amp; Description</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${(e.length>0?e:[{id:1,name:"Standard Enterprise Commercial",currency:"INR",is_active:!0,description:"Default global commercial price schedule with standard volume discounts."},{id:2,name:"Tier-1 Strategic Partner Rate Card",currency:"INR",is_active:!0,description:"Discounted baseline for accredited M&A integration channels."},{id:3,name:"Public Sector & FedRAMP Schedule",currency:"INR",is_active:!0,description:"Statutory capped rate matrix for government and institutional accounts."}]).map(a=>`
    <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
      <td class="py-3 px-4 font-bold text-xs text-on-surface">${a.name}</td>
      <td class="py-3 px-4 font-mono text-xs text-primary">${a.currency||"INR"}</td>
      <td class="py-3 px-4 text-xs text-on-surface-variant">${a.description||"Standard schedule"}</td>
      <td class="py-3 px-4">
        <span class="badge ${a.is_active?"badge-success":"badge-neutral"} text-[10px]">
          ${a.is_active?"Active":"Archived"}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button type="button" class="btn btn-secondary text-xs py-1 px-2.5">Edit Rules</button>
      </td>
    </tr>
  `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function V(){try{return await c.get("/price-lists")}catch{return[]}}function W(){const e=document.getElementById("btn-add-pricelist");e&&e.addEventListener("click",()=>{y.show({title:"New Commercial Price Schedule",content:`
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Schedule Name</label>
              <input id="pl-name-input" type="text" class="input-clay w-full" placeholder="e.g. EMEA Regional Partner Matrix" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Currency Code</label>
              <input id="pl-currency-input" type="text" class="input-clay w-full" value="INR" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Description</label>
              <input id="pl-desc-input" type="text" class="input-clay w-full" placeholder="Intended accounts or region" />
            </div>
          </div>
        `,confirmText:"Create Schedule",onConfirm:async()=>{const s=document.getElementById("pl-name-input").value.trim(),i=document.getElementById("pl-currency-input").value.trim(),a=document.getElementById("pl-desc-input").value.trim();if(!s)throw new Error("Schedule name is required");return await c.post("/price-lists",{name:s,currency:i,description:a}),window.location.reload(),!0}})})}function O(e=[]){const s=e.length>0?e:[{id:1,name:"Acme Corp Global ERP",email:"procurement@acmeww.com",tier:"Gold",created_at:"2025-01-15"},{id:2,name:"Starlight Pharma Logistics",email:"operations@starlightpharma.com",tier:"Silver",created_at:"2025-02-01"},{id:3,name:"Helios Solar Microgrid Infra",email:"infrastructure@heliosmicro.io",tier:"Gold",created_at:"2025-02-18"},{id:4,name:"Apex Financial Cloud Vault",email:"finops@apexvault.com",tier:"Bronze",created_at:"2025-03-02"}],i=s.map(a=>{let n="badge-primary";const t=(a.tier||"Bronze").toLowerCase();return t.includes("gold")?n="badge-warning":t.includes("silver")&&(n="badge-neutral"),`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="avatar-sm">
              <span>${a.name.substring(0,2).toUpperCase()}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${a.name}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">ID #${a.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">${a.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${n} text-[10px] font-bold">${a.tier||"Bronze"}</span>
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          ${a.created_at?new Date(a.created_at).toLocaleDateString():"Active"}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-primary text-xs py-1 px-2.5 create-deal-for-cust-btn" data-cust-id="${a.id}">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>New Deal</span>
            </button>
            <a href="#/portal?customerId=${a.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal">
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
              ${s.filter(a=>(a.tier||"").toLowerCase().includes("gold")).length} Accounts
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
              ${i}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function K(){try{return await c.get("/customers")}catch{return[]}}function z(){const e=document.getElementById("cust-search-input"),s=document.getElementById("customers-table");e&&s&&e.addEventListener("input",a=>{const n=a.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(n)?"":"none"})});const i=document.getElementById("btn-add-customer");i&&i.addEventListener("click",()=>{y.show({title:"Add Enterprise Client Account",content:`
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
        `,confirmText:"Create Account",onConfirm:async()=>{const a=document.getElementById("new-cust-name").value.trim(),n=document.getElementById("new-cust-email").value.trim(),t=document.getElementById("new-cust-tier").value;if(!a||!n)throw new Error("Company name and email are required");return await c.post("/customers",{name:a,email:n,tier:t}),window.location.reload(),!0}})}),document.querySelectorAll(".create-deal-for-cust-btn").forEach(a=>{a.addEventListener("click",async()=>{const n=parseInt(a.getAttribute("data-cust-id"),10);try{const t=await c.post("/quotations",{customer_id:n});window.location.hash=`#/quotations/${t.id}`}catch(t){alert(t.message||"Failed to create quotation")}})})}function J(e={}){const{quotation:s=null}=e,i=s||{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",total_amount:34e4,status:"Under Negotiation",lines:[{product_name:"Enterprise Cloud Orchestration Node",quantity:2,unit_price:12e4,line_total:24e4},{product_name:"Architecture Consulting & Migration SLA",quantity:1,unit_price:1e5,line_total:1e5}]},a=["Confirmed","Fulfilled"].includes(i.status);return`
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
              <span class="badge ${a?"badge-success":"badge-info"} text-xs">${i.status||"Under Negotiation"}</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Secure Procurement Portal for <strong class="text-on-surface">${i.customer_name}</strong> • ${i.deal_reference||`DEAL-${i.id}`}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${a?`
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
                  ${(i.lines||[]).map(n=>`
                    <tr class="table-row border-b border-surface-container-high/40 text-xs">
                      <td class="py-3 px-4 font-bold text-on-surface">${n.product_name||`Item #${n.product_id}`}</td>
                      <td class="py-3 px-4 font-mono">${n.quantity}</td>
                      <td class="py-3 px-4 font-mono">₹${Number(n.unit_price).toLocaleString("en-IN")}</td>
                      <td class="py-3 px-4 font-mono font-bold text-primary text-right">₹${Number(n.line_total).toLocaleString("en-IN")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-surface-container flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface">Total Contract Amount</span>
              <span class="text-xl font-bold font-mono text-primary">₹${Number(i.total_amount||34e4).toLocaleString("en-IN")}</span>
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
  `}async function Y(e){try{const s=await c.get("/quotations"),i=e?s.find(a=>a.id===parseInt(e,10)):s[0];return i?{quotation:await c.get(`/quotations/${i.id}`).catch(()=>i)}:{quotation:null}}catch{return{quotation:null}}}function Z(e){const s=(e==null?void 0:e.id)||8492,i=document.getElementById("btn-portal-accept");i&&i.addEventListener("click",async()=>{if(confirm("Confirm digital signature and ratify this commercial agreement?"))try{await c.put(`/quotations/${s}`,{status:"Confirmed"}),alert("Quotation digitally signed and ratified! Deal status updated to Confirmed."),window.location.reload()}catch(r){alert(r.message||"Signature failed")}});const a=document.getElementById("btn-send-portal-msg"),n=document.getElementById("portal-reply-text"),t=document.getElementById("portal-messages-list");a&&n&&t&&a.addEventListener("click",()=>{const r=n.value.trim();if(!r)return;const l=`
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${r}</p>
        </div>
      `;t.insertAdjacentHTML("beforeend",l),n.value="",t.scrollTop=t.scrollHeight})}function X(e={}){const{warehouses:s=[],quotations:i=[]}=e,a=s.length>0?s:[{id:1,name:"Equinix NY4 North America Hub",code:"WH-US-EAST",location:"Secaucus, NJ",capacity:"94.2% Available"},{id:2,name:"Frankfurt FRA1 European Gateway",code:"WH-EU-CENTRAL",location:"Frankfurt, DE",capacity:"88.0% Available"},{id:3,name:"Singapore SG1 APAC Distribution",code:"WH-APAC-SG",location:"Jurong, SG",capacity:"91.5% Available"}],n=[{sku:"SKU-HDW-410",name:"Quantum Edge Gateway Terminal",req:10,wh1:"NY4 (8)",wh2:"FRA1 (2)",backorder:0,status:"Allocated"},{sku:"SKU-HDW-880",name:"High-Density Terabit Switch Blade",req:4,wh1:"NY4 (4)",wh2:"—",backorder:0,status:"Ready to Pack"},{sku:"SKU-CLD-900",name:"Enterprise Cloud Orchestration Node",req:2,wh1:"Cloud Provisioned",wh2:"—",backorder:0,status:"Fulfilled"}];return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Smart Logistics &amp; Warehousing</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Fulfillment &amp; Warehouse Allocation</h1>
          <p class="text-xs text-on-surface-variant">Multi-facility inventory splitting, backorder consolidation, and shipping routing</p>
        </div>

        <button type="button" class="btn btn-primary text-xs" id="btn-suggest-split">
          <span class="material-symbols-outlined text-base">auto_fix_high</span>
          <span>Auto-Suggest Optimal Split</span>
        </button>
      </div>

      <!-- Warehouse Hubs Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${a.map(r=>`
    <div class="card card-extruded flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <span class="badge badge-primary font-mono text-[10px]">${r.code||`WH-${r.id}`}</span>
        <div class="icon-circle bg-surface-container-high/60">
          <span class="material-symbols-outlined text-primary text-base">warehouse</span>
        </div>
      </div>
      <div class="my-3">
        <h3 class="text-sm font-bold text-on-surface">${r.name}</h3>
        <p class="text-xs text-on-surface-variant">${r.location||"Global Hub"}</p>
      </div>
      <div class="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
        <span class="text-on-surface-variant">Capacity Status</span>
        <span class="font-bold text-primary">${r.capacity||"Operating Normal"}</span>
      </div>
    </div>
  `).join("")}
      </div>

      <!-- Multi-Warehouse Split Execution Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high/60 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">call_split</span>
            <div>
              <h3 class="text-base font-bold text-on-surface">Deal Fulfillment Split Allocation</h3>
              <p class="text-xs text-on-surface-variant">Active allocation matrix for quotation DEAL-8492 (Acme Corp Global ERP)</p>
            </div>
          </div>
          <span class="badge badge-success text-xs">100% Stock Covered</span>
        </div>

        <!-- Table of Allocations -->
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Hardware SKU &amp; Item</th>
                <th class="py-2.5 px-4 font-mono">Total Required</th>
                <th class="py-2.5 px-4">Primary Hub</th>
                <th class="py-2.5 px-4">Secondary Hub</th>
                <th class="py-2.5 px-4">Backorder</th>
                <th class="py-2.5 px-4">Fulfillment State</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${n.map(r=>`
                <tr class="table-row border-b border-surface-container-high/40 text-xs hover:bg-surface-container/40">
                  <td class="py-3 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-on-surface">${r.name}</span>
                      <span class="font-mono text-[10px] text-primary">${r.sku}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono font-bold">${r.req} units</td>
                  <td class="py-3 px-4 font-semibold text-on-surface">${r.wh1}</td>
                  <td class="py-3 px-4 text-on-surface-variant">${r.wh2}</td>
                  <td class="py-3 px-4 font-mono ${r.backorder>0?"text-error font-bold":"text-on-surface-variant"}">${r.backorder}</td>
                  <td class="py-3 px-4">
                    <span class="badge badge-success text-[10px]">${r.status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="btn btn-secondary text-xs py-1 px-2.5">Override</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-2">
          <div class="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base text-primary">local_shipping</span>
            <span>Estimated delivery timeline: 48 hours for North America, 72 hours for EMEA</span>
          </div>
          <button type="button" class="btn btn-primary text-xs" id="btn-commit-fulfillment">
            <span class="material-symbols-outlined text-sm">done_all</span>
            <span>Commit &amp; Dispatch Order</span>
          </button>
        </div>
      </div>
    </div>
  `}async function tt(){try{const[e,s]=await Promise.all([c.get("/warehouses").catch(()=>[]),c.get("/quotations").catch(()=>[])]);return{warehouses:e,quotations:s}}catch{return{warehouses:[],quotations:[]}}}function et(){const e=document.getElementById("btn-commit-fulfillment");e&&e.addEventListener("click",()=>{alert("Fulfillment manifest confirmed! Warehouse pick & pack notifications generated.")});const s=document.getElementById("btn-suggest-split");s&&s.addEventListener("click",()=>{alert("Auto-Split Algorithm computed: 80% from Equinix NY4, 20% from Frankfurt FRA1 with 0 backorders.")})}function st(e=[]){const s=e.length>0?e:[{id:1041,number:"INV-1041",deal_ref:"DEAL-8492",customer:"Acme Corp Global ERP",amount:34e4,due:"2025-10-15",status:"Paid"},{id:1042,number:"INV-1042",deal_ref:"DEAL-8488",customer:"Starlight Pharma Logistics",amount:115e4,due:"2025-10-20",status:"Pending"},{id:1043,number:"INV-1043",deal_ref:"DEAL-8475",customer:"Helios Solar Microgrid Infra",amount:89e4,due:"2025-09-30",status:"Overdue"},{id:1044,number:"INV-1044",deal_ref:"DEAL-8461",customer:"Apex Financial Cloud Vault",amount:475e3,due:"2025-10-25",status:"Pending"}],i=s.reduce((t,r)=>t+(r.amount||0),0),a=s.filter(t=>(t.status||"").toLowerCase()==="paid").length,n=s.map(t=>{let r="badge-warning";const l=(t.status||"").toLowerCase();return l==="paid"?r="badge-success":l==="overdue"&&(r="badge-error"),`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">${t.number||`INV-${t.id}`}</td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${t.deal_ref||"DEAL-8492"}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${t.customer||"Enterprise Account"}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">$${Number(t.amount).toLocaleString()}</td>
        <td class="py-3 px-4 text-on-surface-variant">${t.due||"Net 30"}</td>
        <td class="py-3 px-4">
          <span class="badge ${r} text-[10px]">${t.status||"Pending"}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-secondary text-xs py-1 px-2.5 preview-invoice-btn"
              data-id="${t.id}"
              data-num="${t.number||`INV-${t.id}`}"
              data-customer="${t.customer}"
              data-amount="${t.amount}"
              data-status="${t.status}">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span>Preview</span>
            </button>
            ${t.status!=="Paid"?`
              <button type="button" class="btn btn-primary text-xs py-1 px-2.5 pay-invoice-btn" data-id="${t.id}">
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

        <button type="button" class="btn btn-primary text-xs" id="btn-create-invoice">
          <span class="material-symbols-outlined text-base">receipt</span>
          <span>Generate Tax Invoice +</span>
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Billed Volume</span>
            <div class="text-xl font-bold font-mono text-on-surface mt-1">$${Number(i).toLocaleString()}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">account_balance</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Settled Invoices</span>
            <div class="text-xl font-bold font-mono text-primary mt-1">${a} of ${s.length} Paid</div>
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

      <!-- Invoices Table Card -->
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
              ${n}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function at(){try{return await c.get("/payments/invoices").catch(()=>[])}catch{return[]}}function nt(){document.querySelectorAll(".preview-invoice-btn").forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("data-num"),i=e.getAttribute("data-customer"),a=Number(e.getAttribute("data-amount")||0).toLocaleString(),n=e.getAttribute("data-status");y.show({title:`Tax Invoice Preview — ${s}`,content:`
          <div class="space-y-4 text-xs">
            <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
              <div>
                <span class="text-[10px] text-on-surface-variant block uppercase">Billed To</span>
                <strong class="text-on-surface text-sm">${i}</strong>
                <div class="text-on-surface-variant text-[11px]">100 Enterprise Blvd, Suite 400</div>
              </div>
              <div class="text-right">
                <span class="badge ${n==="Paid"?"badge-success":"badge-warning"} text-xs">${n}</span>
                <div class="font-mono text-[11px] text-on-surface-variant mt-1">Due: Net 30</div>
              </div>
            </div>

            <div class="border rounded-xl border-surface-container-high/60 overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-surface-container text-[11px] text-on-surface-variant">
                  <tr>
                    <th class="py-2 px-3">Description</th>
                    <th class="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t border-surface-container-high/60">
                    <td class="py-2 px-3">Commercial Quotation Scope &amp; Licenses</td>
                    <td class="py-2 px-3 font-mono font-bold text-right">₹${a}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="p-3 rounded-xl bg-surface-container-lowest flex justify-between items-center font-bold text-sm">
              <span>Total Payable</span>
              <span class="text-primary font-mono">₹${a}</span>
            </div>

            <p class="text-[10px] text-on-surface-variant text-center">
              Wire instructions: Chase Manhattan Bank • SWIFT: CHASUS33 • ACCT: 9820-4102-339
            </p>
          </div>
        `,confirmText:"Download PDF",cancelText:"Close",onConfirm:()=>(alert("Generating authenticated cryptographic PDF receipt..."),!0)})})}),document.querySelectorAll(".pay-invoice-btn").forEach(e=>{e.addEventListener("click",async()=>{const s=e.getAttribute("data-id");try{await c.post(`/payments/invoices/${s}/pay`,{}),alert(`Invoice #${s} marked as Paid!`),window.location.reload()}catch(i){alert(i.message||"Payment simulation failed")}})})}function it(e=[]){return`
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
        ${(e.length>0?e:[{id:1,name:"Enterprise M&A Platform Core",cadence:"Annual",price:12e4,description:"Unlimited deals, SOC2 audit telemetry, custom ERP connectors and dedicated cluster."},{id:2,name:"Deal Desk Executive Seat",cadence:"Monthly",price:350,description:"Individual deal builder, discount escalation approval authority, and audit rights."},{id:3,name:"Mission-Critical 24/7 Support SLA",cadence:"Annual",price:45e3,description:"Sub-15 minute incident response with named technical account manager."}]).map(a=>`
    <div class="card card-extruded flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between">
          <span class="badge badge-primary text-[10px]">${a.cadence||"Annual"}</span>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-base">sync</span>
          </div>
        </div>
        <h3 class="text-base font-bold text-on-surface mt-2">${a.name}</h3>
        <p class="text-xs text-on-surface-variant mt-1">${a.description||"Configured recurring license plan"}</p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">Billing Rate</span>
          <span class="font-mono font-bold text-lg text-primary">₹${Number(a.price).toLocaleString("en-IN")}</span>
          <span class="text-[10px] text-on-surface-variant">/ ${a.cadence==="Monthly"?"mo":"yr"}</span>
        </div>
        <button type="button" class="btn btn-secondary text-xs py-1.5 px-3 subscribe-plan-btn" data-plan-id="${a.id}" data-plan-name="${a.name}">
          <span>Attach to Deal</span>
        </button>
      </div>
    </div>
  `).join("")}
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
  `}async function rt(){try{return await c.get("/subscriptions/plans").catch(()=>[])}catch{return[]}}function ot(){const e=document.getElementById("prorate-seats"),s=document.getElementById("prorate-days"),i=document.getElementById("prorate-result"),a=()=>{if(!e||!s||!i)return;const t=parseFloat(e.value)||0,r=parseFloat(s.value)||0,o=4200/365*r*t;i.textContent=`₹${o.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`};e&&e.addEventListener("input",a),s&&s.addEventListener("input",a);const n=document.getElementById("btn-add-plan");n&&n.addEventListener("click",()=>{y.show({title:"New Subscription Plan",content:`
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
        `,confirmText:"Create Plan",onConfirm:async()=>{const t=document.getElementById("plan-name-in").value.trim(),r=document.getElementById("plan-cadence-in").value,l=parseFloat(document.getElementById("plan-price-in").value)||0;if(!t)throw new Error("Plan name required");return await c.post("/subscriptions/plans",{name:t,cadence:r,price:l}),window.location.reload(),!0}})})}function lt(e={}){const{stalled:s=[],reports:i=null}=e,a=s.length>0?s:[{id:8461,ref:"DEAL-8461",customer:"Apex Financial Cloud Vault",stage:"Draft Phase",days:18,risk:"High — Rep Inactive 12 Days"},{id:8440,ref:"DEAL-8440",customer:"Vanguard Aerospace Systems",stage:"Legal Terms Review",days:24,risk:"Medium — Redlines in Queue"},{id:8425,ref:"DEAL-8425",customer:"Nordic Marine Telecom",stage:"Pending Approval",days:9,risk:"Low — Escalation Pending VP"}];return`
    <div class="page-container space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Executive BI Telemetry</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Analytics &amp; Executive Reporting</h1>
          <p class="text-xs text-on-surface-variant">Deal velocity metrics, slippage monitoring, and audit export generation</p>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-secondary text-xs" id="btn-export-csv">
            <span class="material-symbols-outlined text-base">csv</span>
            <span>Export CSV</span>
          </button>
          <button type="button" class="btn btn-primary text-xs" id="btn-export-pdf">
            <span class="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Generate Executive PDF</span>
          </button>
        </div>
      </div>

      <!-- Key KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Q3 Closed Revenue</span>
            <div class="text-xl font-bold font-mono text-primary mt-1">₹4,820,500</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">trending_up</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Avg Deal Velocity</span>
            <div class="text-xl font-bold font-mono text-on-surface mt-1">14.2 Days</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">speed</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">At-Risk Slippage</span>
            <div class="text-xl font-bold font-mono text-error mt-1">${a.length} Stalled Deals</div>
          </div>
          <div class="icon-circle bg-error-container/40">
            <span class="material-symbols-outlined text-error text-lg">warning</span>
          </div>
        </div>
      </div>

      <!-- Stalled Deals & Deal Health Monitoring Card -->
      <div class="card card-extruded space-y-4">
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-tertiary text-lg">crisis_alert</span>
            <div>
              <h3 class="text-base font-bold text-on-surface">Deal Health &amp; Slippage Warnings</h3>
              <p class="text-xs text-on-surface-variant">Continuous heuristic tracking of stalled deals exceeding standard stage duration SLAs</p>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Deal Reference</th>
                <th class="py-2.5 px-4">Customer Account</th>
                <th class="py-2.5 px-4">Stagnant Stage</th>
                <th class="py-2.5 px-4 font-mono">Days in Stage</th>
                <th class="py-2.5 px-4">Heuristic Risk Assessment</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${a.map(n=>`
                <tr class="table-row border-b border-surface-container-high/40 text-xs hover:bg-surface-container/40">
                  <td class="py-3 px-4 font-mono font-bold text-primary">
                    <a href="#/quotations/${n.id||8461}" class="hover:underline">${n.ref||`DEAL-${n.id}`}</a>
                  </td>
                  <td class="py-3 px-4 font-bold text-on-surface">${n.customer}</td>
                  <td class="py-3 px-4 text-on-surface-variant">${n.stage}</td>
                  <td class="py-3 px-4 font-mono font-bold text-error">${n.days} Days</td>
                  <td class="py-3 px-4">
                    <span class="badge badge-warning text-[10px]">${n.risk}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="btn btn-secondary text-xs py-1 px-2.5 nudge-rep-btn" data-id="${n.id||8461}">
                      <span class="material-symbols-outlined text-sm">notifications_active</span>
                      <span>Nudge Rep</span>
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function ct(){try{const[e,s]=await Promise.all([c.get("/reports/quotations").catch(()=>null),c.get("/deal_health/stalled").catch(()=>[])]);return{reports:e,stalled:s}}catch{return{reports:null,stalled:[]}}}function dt(){const e=document.getElementById("btn-export-csv");e&&e.addEventListener("click",()=>{window.open("/api/v1/reports/quotations/export/csv","_blank")});const s=document.getElementById("btn-export-pdf");s&&s.addEventListener("click",()=>{alert("Compiling executive board briefing deck (PDF format)...")}),document.querySelectorAll(".nudge-rep-btn").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-id");alert(`Automated SLA notification dispatch sent to assigned sales rep for Deal #${a}.`)})})}function pt(){return`
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
                  <span class="text-[11px] font-bold text-on-surface">${(b.getUser()||{full_name:"User"}).full_name||"You"}</span>
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
  `}function ut(){const e=document.getElementById("btn-send-msg"),s=document.getElementById("msg-input"),i=document.getElementById("messages-list");if(e&&s&&i){const a=()=>{const n=s.value.trim();if(!n)return;const t=b.getUser()||{full_name:"You"},r=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),l=document.createElement("div");l.className="flex flex-col items-start max-w-[80%]",l.innerHTML=`
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-bold text-on-surface">${t.full_name}</span>
          <span class="text-[10px] text-on-surface-variant font-mono">${r}</span>
        </div>
        <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
          ${n}
        </div>
      `,i.appendChild(l),s.value="",i.scrollTop=i.scrollHeight};e.addEventListener("click",a),s.addEventListener("keydown",n=>{n.key==="Enter"&&a()})}}function mt(){const e=b.getUser()||{full_name:"Alice Johnson",email:"salesrep@dealflow360.com",role:"SalesRep",phone:"+1 (555) 234-5678",address:"742 Evergreen Terrace, San Francisco, CA 94107",age:"28"},s=e.full_name?e.full_name.split(" ").map(i=>i[0]).join("").toUpperCase().slice(0,2):"US";return`
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
          ${e.selected_role||e.role||"Sales Representative"}
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
              <h2 class="text-lg font-bold text-on-surface">${e.full_name||"User Name"}</h2>
              <p class="text-xs text-on-surface-variant mt-0.5">${e.email||"user@dealflow360.com"}</p>
              <span class="badge badge-neutral text-[10px] mt-2 font-mono">${e.selected_role||e.role||"SalesRep"}</span>
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
                    value="${e.full_name||""}"
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
                    value="${e.email||""}"
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
                    value="${e.phone||""}"
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
                    value="${e.age||""}"
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
                >${e.address||""}</textarea>
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
  `}function xt(){const e=document.getElementById("profile-form"),s=document.getElementById("prof-name"),i=document.getElementById("prof-phone"),a=document.getElementById("prof-age"),n=document.getElementById("prof-address"),t=document.getElementById("profile-msg"),r=document.getElementById("btn-profile-logout");e&&e.addEventListener("submit",l=>{l.preventDefault();const o=s.value.trim();if(!o)return;const d=b.getUser()||{};d.full_name=o,d.phone=i?i.value.trim():d.phone,d.age=a?a.value.trim():d.age,d.address=n?n.value.trim():d.address,b.setUser(d),t&&(t.classList.remove("hidden"),setTimeout(()=>t.classList.add("hidden"),3500))}),r&&r.addEventListener("click",()=>{confirm("Are you sure you want to sign out of DealFlow360?")&&b.logout()})}class ft{constructor(){this.appEl=document.getElementById("app"),window.addEventListener("hashchange",()=>this.handleRoute())}init(){!window.location.hash||window.location.hash==="#/"?window.location.hash=b.isAuthenticated()?"#/quotations":"#/login":this.handleRoute()}parseHash(){const s=window.location.hash.slice(1)||"/login",[i]=s.split("?"),n=(i.startsWith("/")?i.slice(1):i).split("/"),t=n[0]||"quotations",r=n[1]||null,l=new URLSearchParams(window.location.hash.split("?")[1]||"");return{route:t,param:r,query:l}}showLoading(){this.appEl.innerHTML=`
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `}async handleRoute(){const{route:s,param:i,query:a}=this.parseHash(),n=b.isAuthenticated();if(!n&&s!=="login"&&s!=="signup"&&s!=="portal"){window.location.hash="#/login";return}if(n&&(s==="login"||s==="signup")){window.location.hash="#/quotations";return}switch(window.scrollTo(0,0),s){case"login":{this.appEl.innerHTML=L(),_();break}case"signup":{this.appEl.innerHTML=P(),D();break}case"dashboard":{const t=b.getUser();if((t?t.selected_role||t.role:"")!=="Admin"){window.location.hash="#/quotations";break}this.showLoading();const l=await B();this.appEl.innerHTML=`
          ${x("dashboard")}
          <main class="main-content">${I(l)}</main>
        `,f(),T();break}case"quotations":{if(i){this.showLoading();const t=await A(i);this.appEl.innerHTML=`
            ${x("quotations")}
            <main class="main-content">${k(t)}</main>
          `,f(),$(i,t.products,t.customers)}else{this.showLoading();let t=!0,r="kanban";const l=async(o=t,d=r)=>{t=o,r=d;const u=await q(o);this.appEl.innerHTML=`
              ${x("quotations")}
              <main class="main-content">${j(u,o?"my":"all",d)}</main>
            `,f(),R(p=>l(p,r),p=>l(t,p))};await l(!0,"kanban")}break}case"quotation-detail":{this.showLoading();const t=i||a.get("id"),r=await A(t);this.appEl.innerHTML=`
          ${x("quotations")}
          <main class="main-content">${k(r)}</main>
        `,f(),$(t,r.products,r.customers);break}case"approvals":{this.showLoading();const t=await N();this.appEl.innerHTML=`
          ${x("approvals")}
          <main class="main-content">${M(t)}</main>
        `,f(),H();break}case"products":{this.showLoading();const t=await U();this.appEl.innerHTML=`
          ${x("products")}
          <main class="main-content">${F(t)}</main>
        `,f(),G();break}case"pricing":case"pricing-rules":{this.showLoading();const t=await V();this.appEl.innerHTML=`
          ${x("pricing")}
          <main class="main-content">${Q(t)}</main>
        `,f(),W();break}case"customers":{this.showLoading();const t=await K();this.appEl.innerHTML=`
          ${x("customers")}
          <main class="main-content">${O(t)}</main>
        `,f(),z();break}case"portal":{this.showLoading();const t=i||a.get("id"),r=await Y(t);this.appEl.innerHTML=`
          ${x("portal")}
          <main class="main-content">${J(r)}</main>
        `,f(),Z(r.quotation);break}case"fulfillment":{this.showLoading();const t=await tt();this.appEl.innerHTML=`
          ${x("fulfillment")}
          <main class="main-content">${X(t)}</main>
        `,f(),et();break}case"invoices":{this.showLoading();const t=await at();this.appEl.innerHTML=`
          ${x("invoices")}
          <main class="main-content">${st(t)}</main>
        `,f(),nt();break}case"subscriptions":{this.showLoading();const t=await rt();this.appEl.innerHTML=`
          ${x("subscriptions")}
          <main class="main-content">${it(t)}</main>
        `,f(),ot();break}case"reports":{this.showLoading();const t=await ct();this.appEl.innerHTML=`
          ${x("reports")}
          <main class="main-content">${lt(t)}</main>
        `,f(),dt();break}case"messages":{this.appEl.innerHTML=`
          ${x("messages")}
          <main class="main-content">${pt()}</main>
        `,f(),ut();break}case"profile":{this.appEl.innerHTML=`
          ${x("profile")}
          <main class="main-content">${mt()}</main>
        `,f(),xt();break}default:{window.location.hash="#/quotations";break}}}}document.addEventListener("DOMContentLoaded",()=>{new ft().init()});
