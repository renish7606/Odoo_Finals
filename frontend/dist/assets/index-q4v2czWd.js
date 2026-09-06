(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const e of a)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function i(a){const e={};return a.integrity&&(e.integrity=a.integrity),a.referrerPolicy&&(e.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?e.credentials="include":a.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function n(a){if(a.ep)return;a.ep=!0;const e=i(a);fetch(a.href,e)}})();const _="/api/v1";class $ extends Error{constructor(s,i,n){super(s),this.name="ApiError",this.status=i,this.data=n}}const c={getToken(){return localStorage.getItem("dealflow_token")},setToken(t){t?localStorage.setItem("dealflow_token",t):localStorage.removeItem("dealflow_token")},getHeaders(t={}){const s={"Content-Type":"application/json",...t},i=this.getToken();return i&&(s.Authorization=`Bearer ${i}`),s},async request(t,s={}){const i=`${_}${t}`,n=this.getHeaders(s.headers),a={...s,headers:n};a.body&&typeof a.body=="object"&&!(a.body instanceof FormData)&&(a.body=JSON.stringify(a.body));try{const e=await fetch(i,a);if(e.status===401&&!t.includes("/auth/login"))throw this.setToken(null),localStorage.removeItem("dealflow_user"),window.location.hash="#/login",new $("Session expired. Please sign in again.",401,null);if(e.status===204)return null;const r=e.headers.get("content-type")||"";let o=null;if(r.includes("application/json")?o=await e.json():o=await e.text(),!e.ok){const l=(o==null?void 0:o.detail)||(o==null?void 0:o.message)||`Request failed with status ${e.status}`;throw new $(l,e.status,o)}return o}catch(e){throw e instanceof $?e:new $(e.message||"Network connection failed",0,null)}},get(t,s){let i=t;if(s){const n=new URLSearchParams(s).toString();n&&(i+=`?${n}`)}return this.request(i,{method:"GET"})},post(t,s){return this.request(t,{method:"POST",body:s})},put(t,s){return this.request(t,{method:"PUT",body:s})},patch(t,s){return this.request(t,{method:"PATCH",body:s})},delete(t){return this.request(t,{method:"DELETE"})},async downloadFile(t,s){const i=`${_}${t}`,n=this.getToken(),a=n?{Authorization:`Bearer ${n}`}:{},e=await fetch(i,{headers:a});if(!e.ok)throw new Error(`Download failed with status ${e.status}`);const r=await e.blob(),o=window.URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=s||"document.pdf",document.body.appendChild(l),l.click(),l.remove(),window.URL.revokeObjectURL(o)}},w={getUser(){try{const t=localStorage.getItem("dealflow_user");return t?JSON.parse(t):null}catch{return null}},setUser(t){t?localStorage.setItem("dealflow_user",JSON.stringify(t)):localStorage.removeItem("dealflow_user")},isAuthenticated(){return!!c.getToken()},async login(t,s){const i=await c.post("/auth/login",{email:t,password:s});if(i.access_token){c.setToken(i.access_token);try{const n=await c.get("/auth/me");return this.setUser(n),{success:!0,user:n}}catch{const n={email:t,full_name:"Eleanor Vance",role:"Sales Director"};return this.setUser(n),{success:!0,user:n}}}throw new Error("Authentication failed: No access token received")},logout(){c.setToken(null),this.setUser(null),window.location.hash="#/login"}};function b(t="dashboard"){const s=w.getUser()||{full_name:"Eleanor Vance",role:"Sales Director"};return`
    <header class="navbar-header">
      <div class="navbar-inner">
        <!-- Logo & Branding -->
        <div class="navbar-brand">
          <a href="#/dashboard" class="flex items-center gap-3 text-inherit no-underline">
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

        <!-- Scrollable Navigation Tabs -->
        <nav class="navbar-nav">
          ${[{key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"},{key:"quotations",label:"Quotations",icon:"request_quote",href:"#/quotations"},{key:"approvals",label:"Approvals",icon:"verified",href:"#/approvals"},{key:"fulfillment",label:"Fulfillment",icon:"assignment_turned_in",href:"#/fulfillment"},{key:"invoices",label:"Invoices",icon:"receipt_long",href:"#/invoices"},{key:"customers",label:"Customers",icon:"corporate_fare",href:"#/customers"},{key:"products",label:"Products",icon:"inventory_2",href:"#/products"},{key:"pricing",label:"Pricing",icon:"sell",href:"#/pricing"},{key:"subscriptions",label:"Subscriptions",icon:"sync",href:"#/subscriptions"},{key:"reports",label:"Reports",icon:"bar_chart",href:"#/reports"},{key:"portal",label:"Portal",icon:"open_in_browser",href:"#/portal"}].map(a=>{const r=t===a.key||t==="quotation-detail"&&a.key==="quotations"?"nav-item-active":"nav-item-inactive";return`
        <a href="${a.href}" class="nav-item ${r}" data-route="${a.key}">
          <span class="material-symbols-outlined text-lg">${a.icon}</span>
          <span>${a.label}</span>
        </a>
      `}).join("")}
        </nav>

        <!-- Right User Actions & Live Pipeline Status -->
        <div class="navbar-actions">
          <div class="status-pill hidden sm:flex items-center gap-2">
            <span class="pulse-dot"></span>
            <span class="text-xs text-on-surface-variant font-medium">Q3 Pipeline</span>
            <span class="text-xs font-mono font-bold text-primary">99.4%</span>
          </div>

          <button type="button" class="icon-btn relative" title="Notifications" id="btn-notifications">
            <span class="material-symbols-outlined text-lg text-on-surface-variant">notifications</span>
            <span class="notification-badge"></span>
          </button>

          <div class="h-6 w-px bg-outline-variant/50 hidden md:block"></div>

          <!-- User Profile & Logout Menu -->
          <div class="user-profile-menu flex items-center gap-3">
            <div class="hidden lg:flex flex-col text-right">
              <span class="text-xs font-bold text-on-surface leading-tight">${s.full_name||"Eleanor Vance"}</span>
              <span class="text-[11px] text-on-surface-variant leading-tight">${s.role||"Sales Director"}</span>
            </div>
            <div class="avatar-box" title="${s.full_name||"User"}">
              <span class="font-bold text-sm text-primary">EV</span>
            </div>
            <button type="button" id="btn-logout" class="icon-btn text-error hover:bg-error-container/40" title="Sign Out">
              <span class="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `}function v(){const t=document.getElementById("btn-logout");t&&t.addEventListener("click",()=>{confirm("Are you sure you want to sign out?")&&w.logout()})}function D(){return`
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
  `}function P(){const t=document.getElementById("login-form"),s=document.getElementById("login-error"),i=document.getElementById("btn-submit-login"),n=document.getElementById("toggle-pw"),a=document.getElementById("login-password"),e=document.getElementById("pw-icon");n&&a&&e&&n.addEventListener("click",()=>{a.type==="password"?(a.type="text",e.textContent="visibility_off"):(a.type="password",e.textContent="visibility")}),document.querySelectorAll(".sso-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-provider");alert(`Initiating SAML 2.0 / OIDC handshake with ${o}...`)})}),t&&t.addEventListener("submit",async r=>{r.preventDefault(),s.classList.add("hidden"),s.textContent="",i.disabled=!0,i.innerHTML='<span class="loading-spinner"></span> Authenticating...';const o=document.getElementById("login-email").value.trim(),l=a.value.trim();try{await w.login(o,l),window.location.hash="#/dashboard"}catch(m){s.textContent=m.message||"Login failed. Check your credentials.",s.classList.remove("hidden")}finally{i.disabled=!1,i.innerHTML='<span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span>'}})}const g={show({title:t,content:s,onConfirm:i,confirmText:n="Confirm",cancelText:a="Cancel",showConfirm:e=!0}){const r=document.getElementById("df-modal-backdrop");r&&r.remove();const o=`
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
            ${e?`<button type="button" class="btn btn-primary" id="df-modal-confirm">${n}</button>`:""}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",o);const l=document.getElementById("df-modal-backdrop"),m=document.getElementById("df-modal-close"),d=document.getElementById("df-modal-cancel"),u=document.getElementById("df-modal-confirm"),p=()=>{l.classList.add("fade-out"),setTimeout(()=>l.remove(),200)};return m.addEventListener("click",p),d.addEventListener("click",p),l.addEventListener("click",x=>{x.target===l&&p()}),u&&i&&u.addEventListener("click",async()=>{u.disabled=!0,u.innerHTML='<span class="loading-spinner"></span> Processing...';try{await i()!==!1&&p()}catch(x){alert(x.message||"Action failed")}finally{u.disabled=!1,u.innerHTML=n}}),{close:p}}};function I(t={}){const{summary:s={},quotations:i=[]}=t,n=s.total_revenue?`₹${Number(s.total_revenue).toLocaleString("en-IN")}`:"₹4,82,05,000",a=s.pending_approvals??12,e=(s.total_quotations||s.draft_count)&&s.total_quotations||38,r=s.win_rate?`${s.win_rate}%`:"68.5%",o=(i.length>0?i.slice(0,6):[{id:8492,deal_reference:"DEAL-8492",rep_name:"Marcus Hayes",customer_name:"Acme Corp Global ERP",total_amount:34e5,status:"Approved",time:"Today, 09:42 AM"},{id:8488,deal_reference:"DEAL-8488",rep_name:"Sarah Lin",customer_name:"Starlight Pharma Logistics",total_amount:115e5,status:"Under Negotiation",time:"Today, 08:15 AM"},{id:8475,deal_reference:"DEAL-8475",rep_name:"Eleanor Vance",customer_name:"Helios Solar Microgrid Infra",total_amount:89e5,status:"Fulfilled",time:"Yesterday, 17:30 PM"},{id:8461,deal_reference:"DEAL-8461",rep_name:"David Kim",customer_name:"Apex Financial Cloud Vault",total_amount:475e4,status:"Draft",time:"Yesterday, 14:10 PM"}]).map(l=>{let m="badge-primary";const d=(l.status||"").toLowerCase();return d.includes("approve")?m="badge-success":d.includes("negotiat")||d.includes("review")||d.includes("pending")?m="badge-warning":d.includes("fulfill")?m="badge-info":d.includes("draft")&&(m="badge-neutral"),`
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
          <span class="badge ${m}">${l.status||"Draft"}</span>
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
            <div class="text-2xl font-bold tracking-tight text-on-surface">${n}</div>
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
              ${o}
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
  `}async function B(){try{const[t,s]=await Promise.all([c.get("/dashboard/summary").catch(()=>({})),c.get("/quotations").catch(()=>[])]);return{summary:t,quotations:s}}catch{return{summary:{},quotations:[]}}}function N(){const t=document.getElementById("btn-export-dash");t&&t.addEventListener("click",()=>{window.location.hash="#/reports"});const s=document.getElementById("btn-new-deal-dash");s&&s.addEventListener("click",()=>{window.location.hash="#/quotation-detail"});const i=document.getElementById("btn-dl-audit");i&&i.addEventListener("click",()=>{alert("Downloading audit trail CSV...")})}function q(t=[]){const s=t.reduce((a,e)=>a+(e.total_amount||0),0),i=t.filter(a=>(a.status||"").toLowerCase().includes("pending")).length,n=t.length===0?`
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found. Click <strong>New Quotation +</strong> to generate your first deal.
        </td>
      </tr>
    `:t.map(a=>{let e="badge-primary";const r=(a.status||"").toLowerCase();return r.includes("approved")?e="badge-success":r.includes("pending")||r.includes("review")?e="badge-warning":r.includes("negotiat")?e="badge-info":r.includes("fulfilled")||r.includes("confirmed")?e="badge-success":r.includes("rejected")?e="badge-error":r.includes("draft")&&(e="badge-neutral"),`
          <tr class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40">
            <td class="py-3 px-4 font-mono font-bold text-xs text-primary">
              <a href="#/quotations/${a.id}" class="hover:underline">${a.deal_reference||`DEAL-${a.id}`}</a>
            </td>
            <td class="py-3 px-4">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">${a.customer_name||"Customer"}</span>
                <span class="text-[10px] text-on-surface-variant">${a.customer_email||""}</span>
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="badge badge-neutral text-[10px]">${a.customer_tier||"Bronze"}</span>
            </td>
            <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">
              ₹${Number(a.total_amount||0).toLocaleString("en-IN")}
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${a.line_count||(a.lines?a.lines.length:0)} items
            </td>
            <td class="py-3 px-4">
              <span class="badge ${e}">${a.status||"Draft"}</span>
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${a.rep_name||"Eleanor Vance"}
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <a href="#/quotations/${a.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Edit / View Deal">
                  <span class="material-symbols-outlined text-sm">edit_note</span>
                  <span>View</span>
                </a>
                <a href="#/portal?id=${a.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal View">
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
            <span class="text-xs font-bold text-primary tracking-widest uppercase">CPQ Orchestration Engine</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Quotations &amp; Contracts</h1>
          <p class="text-xs text-on-surface-variant">Manage enterprise proposals, pricing escalations, and automated approval routings</p>
        </div>

        <div class="flex items-center gap-2.5">
          <a href="#/quotation-detail" class="btn btn-primary text-xs" id="btn-create-quote">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>New Quotation +</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Active Pipeline Value</span>
            <div class="text-xl font-bold text-on-surface mt-1">₹${Number(s).toLocaleString("en-IN")}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">monetization_on</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Total Documents</span>
            <div class="text-xl font-bold text-on-surface mt-1">${t.length} Deals</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">folder_shared</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Pending Sign-off</span>
            <div class="text-xl font-bold text-tertiary mt-1">${i} Deals</div>
          </div>
          <div class="icon-circle bg-tertiary-container/40">
            <span class="material-symbols-outlined text-tertiary text-lg">pending_actions</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card card-extruded">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-surface-container-high/60">
          <div class="flex flex-wrap items-center gap-1.5" id="quote-filter-tabs">
            <button type="button" class="btn btn-secondary text-xs py-1 px-3 active" data-filter="all">All</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Draft">Draft</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Pending Approval">Pending</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Approved">Approved</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Under Negotiation">Negotiation</button>
            <button type="button" class="btn btn-secondary text-xs py-1 px-3" data-filter="Fulfilled">Fulfilled</button>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              id="quote-search-input"
              class="input-clay text-xs py-1.5 px-3 w-48"
              placeholder="Search ref or customer..."
            />
          </div>
        </div>

        <!-- Quotations Table -->
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
                <th class="py-2.5 px-4">Rep</th>
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
  `}async function j(){try{return await c.get("/quotations")}catch{return[]}}function T(){const t=document.getElementById("quote-search-input"),s=document.getElementById("quotations-table");t&&s&&t.addEventListener("input",n=>{const a=n.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{const o=r.textContent.toLowerCase();r.style.display=o.includes(a)?"":"none"})});const i=document.querySelectorAll("#quote-filter-tabs button");i.forEach(n=>{n.addEventListener("click",()=>{i.forEach(r=>r.classList.remove("active")),n.classList.add("active");const a=n.getAttribute("data-filter");s.querySelectorAll("tbody tr").forEach(r=>{if(a==="all")r.style.display="";else{const o=r.textContent;r.style.display=o.includes(a)?"":"none"}})})})}function S(t={}){var u,p,x;const{quotation:s=null,products:i=[],customers:n=[]}=t,a=!s||!s.id,e=s||{id:0,deal_reference:"DEAL-NEW",customer_name:((u=n[0])==null?void 0:u.name)||"Acme Corp Global ERP",customer_email:((p=n[0])==null?void 0:p.email)||"procurement@acme.corp",customer_tier:((x=n[0])==null?void 0:x.tier)||"Gold",status:"Draft",lines:[]},r=!e.lines||e.lines.length===0?`
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
      `).join(""),o=e.lines?e.lines.reduce((f,y)=>f+(y.line_total||0),0):0,l=o;let m="badge-neutral";const d=(e.status||"").toLowerCase();return d.includes("approved")?m="badge-success":d.includes("pending")?m="badge-warning":d.includes("negotiat")?m="badge-info":(d.includes("fulfilled")||d.includes("confirmed"))&&(m="badge-success"),`
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
            <span class="badge ${m} text-xs">${e.status||"Draft"}</span>
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
                <span class="font-mono font-semibold text-on-surface">₹${Number(o).toLocaleString("en-IN")}</span>
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
  `}async function C(t){try{const[s,i,n]=await Promise.all([t?c.get(`/quotations/${t}`).catch(()=>null):null,c.get("/products").catch(()=>[]),c.get("/customers").catch(()=>[])]);return{quotation:s,products:i,customers:n}}catch{return{quotation:null,products:[],customers:[]}}}function A(t,s=[],i=[]){const n=document.getElementById("btn-add-line-modal");n&&n.addEventListener("click",()=>{const u=s.map(p=>`
        <option value="${p.id}">${p.name} — $${Number(p.base_price).toLocaleString()} (${p.category})</option>
      `).join("");g.show({title:"Add Product Line Item",content:`
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Select Product</label>
              <select id="modal-product-select" class="input-clay w-full text-xs">
                ${u||'<option value="1">Enterprise M&A CPQ Core — ₹120,000</option>'}
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity</label>
              <input id="modal-product-qty" type="number" min="1" value="1" class="input-clay w-full text-xs" />
            </div>
          </div>
        `,confirmText:"Add to Quotation",onConfirm:async()=>{var f;const p=parseInt(document.getElementById("modal-product-select").value,10),x=parseFloat(document.getElementById("modal-product-qty").value)||1;if(t)await c.post(`/quotations/${t}/lines`,{product_id:p,quantity:x}),window.location.reload();else{const y=((f=i[0])==null?void 0:f.id)||1,h=await c.post("/quotations",{customer_id:y});await c.post(`/quotations/${h.id}/lines`,{product_id:p,quantity:x}),window.location.hash=`#/quotations/${h.id}`}return!0}})}),document.querySelectorAll(".delete-line-btn").forEach(u=>{u.addEventListener("click",async()=>{const p=u.getAttribute("data-line-id");confirm("Remove this line item from quotation?")&&(await c.delete(`/quotations/${t}/lines/${p}`),window.location.reload())})});const a=async u=>{await c.put(`/quotations/${t}`,{status:u}),window.location.reload()},e=document.getElementById("btn-submit-approval");e&&e.addEventListener("click",()=>a("Pending Approval"));const r=document.getElementById("btn-approve-quote");r&&r.addEventListener("click",()=>a("Approved"));const o=document.getElementById("btn-reject-quote");o&&o.addEventListener("click",()=>a("Rejected"));const l=document.getElementById("btn-send-portal");l&&l.addEventListener("click",()=>a("Under Negotiation"));const m=document.getElementById("btn-confirm-quote");m&&m.addEventListener("click",()=>a("Confirmed"));const d=document.getElementById("btn-fulfill-quote");d&&d.addEventListener("click",()=>a("Fulfilled"))}function R(t=[]){const s=t.filter(a=>(a.status||"").toLowerCase().includes("pending")||(a.status||"").toLowerCase().includes("draft")),i=s.length>0?s:[{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",customer_tier:"Gold",total_amount:34e4,rep_name:"Marcus Hayes",discount:"18%",limit:"15%",reason:"Multi-region deployment incentive requested for 3-year upfront commitment."},{id:8488,deal_reference:"DEAL-8488",customer_name:"Starlight Pharma Logistics",customer_tier:"Silver",total_amount:115e4,rep_name:"Sarah Lin",discount:"14%",limit:"10%",reason:"Competitive displacement against legacy SAP stack."},{id:8461,deal_reference:"DEAL-8461",customer_name:"Apex Financial Cloud Vault",customer_tier:"Bronze",total_amount:475e3,rep_name:"David Kim",discount:"8%",limit:"5%",reason:"Volume licensing ramp-up structure."}],n=i.map(a=>`
    <div class="card card-extruded space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
        <div class="flex items-center gap-3">
          <span class="font-mono font-bold text-sm text-primary">${a.deal_reference||`DEAL-${a.id}`}</span>
          <span class="badge badge-warning text-[10px]">VP Sign-off Required</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-on-surface-variant">Contract Valuation</span>
          <div class="font-mono font-bold text-base text-on-surface">$${Number(a.total_amount||34e4).toLocaleString()}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-on-surface-variant block mb-1">Customer Account</span>
          <div class="font-bold text-on-surface">${a.customer_name}</div>
          <span class="badge badge-neutral text-[10px] mt-1">${a.customer_tier||"Gold"} Tier</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Discount Threshold</span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-error">${a.discount||"15%"} Requested</span>
            <span class="text-on-surface-variant">(Max allowed: ${a.limit||"10%"})</span>
          </div>
          <span class="text-[10px] text-error font-semibold mt-1 block">Tier Exception Triggered</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Sales Representative</span>
          <div class="font-bold text-on-surface">${a.rep_name||"Eleanor Vance"}</div>
          <span class="text-[10px] text-on-surface-variant">Enterprise Mid-Market</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant">
        <strong class="text-on-surface">Escalation Note:</strong>
        ${a.reason||"Requested commercial discount exceeding sales representative discretion for multi-year upfront commitment."}
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high/60">
        <a href="#/quotations/${a.id}" class="btn btn-secondary text-xs">
          <span class="material-symbols-outlined text-sm">visibility</span>
          Inspect Line Items
        </a>
        <button type="button" class="btn btn-secondary text-xs text-error reject-approval-btn" data-id="${a.id}">
          <span class="material-symbols-outlined text-sm">close</span>
          Reject
        </button>
        <button type="button" class="btn btn-primary text-xs approve-deal-btn" data-id="${a.id}">
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
        ${n}
      </div>
    </div>
  `}async function M(){try{return await c.get("/quotations")}catch{return[]}}function H(){document.querySelectorAll(".approve-deal-btn").forEach(t=>{t.addEventListener("click",async()=>{const s=t.getAttribute("data-id");try{await c.put(`/quotations/${s}`,{status:"Approved"}),alert(`Deal #${s} has been successfully approved.`),window.location.reload()}catch(i){alert(i.message||"Approval failed")}})}),document.querySelectorAll(".reject-approval-btn").forEach(t=>{t.addEventListener("click",async()=>{const s=t.getAttribute("data-id");if(confirm(`Reject quotation #${s}?`))try{await c.put(`/quotations/${s}`,{status:"Rejected"}),alert(`Deal #${s} has been rejected.`),window.location.reload()}catch(i){alert(i.message||"Action failed")}})})}function F(t=[]){return`
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
        ${(t.length>0?t:[{id:1,name:"Enterprise Cloud Orchestration Node",sku:"SKU-CLD-900",category:"Cloud Infrastructure",base_price:18500,description:"High-throughput container runtime cluster with 99.99% uptime SLA."},{id:2,name:"Quantum Edge Gateway Terminal",sku:"SKU-HDW-410",category:"Hardware",base_price:45e3,description:"Ruggedized hardware cryptographic accelerator for zero-trust branch networks."},{id:3,name:"Enterprise M&A CPQ Core Engine",sku:"SKU-SFT-101",category:"Software & SaaS",base_price:12e4,description:"Complete dealflow, quotation rules, and multitenancy pricing engine."},{id:4,name:"Architecture Consulting & Migration SLA",sku:"SKU-SRV-050",category:"Professional Services",base_price:35e3,description:"Dedicated enterprise solutions architect team with 24/7 priority support."},{id:5,name:"AI Compliance & Anomaly Sentinel",sku:"SKU-SFT-202",category:"Software & SaaS",base_price:64e3,description:"Continuous transaction monitoring for antitrust, sanction, and margin slippage."},{id:6,name:"High-Density Terabit Switch Blade",sku:"SKU-HDW-880",category:"Hardware",base_price:82e3,description:"Carrier-grade spine switch with sub-microsecond packet latency."}]).map(n=>`
    <div class="card card-extruded flex flex-col justify-between space-y-4 product-card" data-category="${n.category||"All"}">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge-neutral font-mono text-[10px]">${n.sku||`SKU-${n.id}`}</span>
          <span class="badge badge-primary text-[10px]">${n.category||"Standard"}</span>
        </div>
        <h3 class="text-sm font-bold text-on-surface line-clamp-2">${n.name}</h3>
        <p class="text-xs text-on-surface-variant mt-2 line-clamp-3">
          ${n.description||"Configured for enterprise production environments with automated compliance telemetry."}
        </p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">List Price</span>
          <span class="font-mono font-bold text-base text-primary">$${Number(n.base_price).toLocaleString()}</span>
        </div>
        <button type="button" class="btn btn-primary text-xs py-1.5 px-3 add-to-deal-btn" data-product-id="${n.id}" data-product-name="${n.name}">
          <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
          <span>Add to Deal</span>
        </button>
      </div>
    </div>
  `).join("")}
      </div>
    </div>
  `}async function O(){try{return await c.get("/products")}catch{return[]}}function U(){const t=document.getElementById("product-search-input"),s=document.querySelectorAll(".product-card");t&&t.addEventListener("input",n=>{const a=n.target.value.toLowerCase();s.forEach(e=>{const r=e.textContent.toLowerCase();e.style.display=r.includes(a)?"":"none"})});const i=document.querySelectorAll("#product-category-filters button");i.forEach(n=>{n.addEventListener("click",()=>{i.forEach(e=>e.classList.remove("active")),n.classList.add("active");const a=n.getAttribute("data-cat");s.forEach(e=>{if(a==="all")e.style.display="";else{const r=e.getAttribute("data-category");e.style.display=r.includes(a)?"":"none"}})})}),document.querySelectorAll(".add-to-deal-btn").forEach(n=>{n.addEventListener("click",async()=>{const a=n.getAttribute("data-product-id"),e=n.getAttribute("data-product-name");g.show({title:`Add ${e} to Quotation`,content:`
          <div class="space-y-3 text-xs">
            <p class="text-on-surface-variant">Configure quantity to append this SKU to an active deal:</p>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity Units</label>
              <input type="number" id="quick-add-qty" min="1" value="1" class="input-clay w-full" />
            </div>
          </div>
        `,confirmText:"Generate Deal",onConfirm:async()=>{const r=parseFloat(document.getElementById("quick-add-qty").value)||1,o=await c.post("/quotations",{customer_id:1});return await c.post(`/quotations/${o.id}/lines`,{product_id:parseInt(a,10),quantity:r}),window.location.hash=`#/quotations/${o.id}`,!0}})})})}function V(t=[]){return`
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
              ${(t.length>0?t:[{id:1,name:"Standard Enterprise Commercial",currency:"INR",is_active:!0,description:"Default global commercial price schedule with standard volume discounts."},{id:2,name:"Tier-1 Strategic Partner Rate Card",currency:"INR",is_active:!0,description:"Discounted baseline for accredited M&A integration channels."},{id:3,name:"Public Sector & FedRAMP Schedule",currency:"INR",is_active:!0,description:"Statutory capped rate matrix for government and institutional accounts."}]).map(n=>`
    <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
      <td class="py-3 px-4 font-bold text-xs text-on-surface">${n.name}</td>
      <td class="py-3 px-4 font-mono text-xs text-primary">${n.currency||"INR"}</td>
      <td class="py-3 px-4 text-xs text-on-surface-variant">${n.description||"Standard schedule"}</td>
      <td class="py-3 px-4">
        <span class="badge ${n.is_active?"badge-success":"badge-neutral"} text-[10px]">
          ${n.is_active?"Active":"Archived"}
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
  `}async function Q(){try{return await c.get("/price-lists")}catch{return[]}}function G(){const t=document.getElementById("btn-add-pricelist");t&&t.addEventListener("click",()=>{g.show({title:"New Commercial Price Schedule",content:`
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
        `,confirmText:"Create Schedule",onConfirm:async()=>{const s=document.getElementById("pl-name-input").value.trim(),i=document.getElementById("pl-currency-input").value.trim(),n=document.getElementById("pl-desc-input").value.trim();if(!s)throw new Error("Schedule name is required");return await c.post("/price-lists",{name:s,currency:i,description:n}),window.location.reload(),!0}})})}function W(t=[]){const s=t.length>0?t:[{id:1,name:"Acme Corp Global ERP",email:"procurement@acmeww.com",tier:"Gold",created_at:"2025-01-15"},{id:2,name:"Starlight Pharma Logistics",email:"operations@starlightpharma.com",tier:"Silver",created_at:"2025-02-01"},{id:3,name:"Helios Solar Microgrid Infra",email:"infrastructure@heliosmicro.io",tier:"Gold",created_at:"2025-02-18"},{id:4,name:"Apex Financial Cloud Vault",email:"finops@apexvault.com",tier:"Bronze",created_at:"2025-03-02"}],i=s.map(n=>{let a="badge-primary";const e=(n.tier||"Bronze").toLowerCase();return e.includes("gold")?a="badge-warning":e.includes("silver")&&(a="badge-neutral"),`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="avatar-sm">
              <span>${n.name.substring(0,2).toUpperCase()}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${n.name}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">ID #${n.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">${n.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${a} text-[10px] font-bold">${n.tier||"Bronze"}</span>
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          ${n.created_at?new Date(n.created_at).toLocaleDateString():"Active"}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-primary text-xs py-1 px-2.5 create-deal-for-cust-btn" data-cust-id="${n.id}">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>New Deal</span>
            </button>
            <a href="#/portal?customerId=${n.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal">
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
              ${s.filter(n=>(n.tier||"").toLowerCase().includes("gold")).length} Accounts
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
  `}async function z(){try{return await c.get("/customers")}catch{return[]}}function K(){const t=document.getElementById("cust-search-input"),s=document.getElementById("customers-table");t&&s&&t.addEventListener("input",n=>{const a=n.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(a)?"":"none"})});const i=document.getElementById("btn-add-customer");i&&i.addEventListener("click",()=>{g.show({title:"Add Enterprise Client Account",content:`
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
        `,confirmText:"Create Account",onConfirm:async()=>{const n=document.getElementById("new-cust-name").value.trim(),a=document.getElementById("new-cust-email").value.trim(),e=document.getElementById("new-cust-tier").value;if(!n||!a)throw new Error("Company name and email are required");return await c.post("/customers",{name:n,email:a,tier:e}),window.location.reload(),!0}})}),document.querySelectorAll(".create-deal-for-cust-btn").forEach(n=>{n.addEventListener("click",async()=>{const a=parseInt(n.getAttribute("data-cust-id"),10);try{const e=await c.post("/quotations",{customer_id:a});window.location.hash=`#/quotations/${e.id}`}catch(e){alert(e.message||"Failed to create quotation")}})})}function J(t={}){const{quotation:s=null}=t,i=s||{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",total_amount:34e4,status:"Under Negotiation",lines:[{product_name:"Enterprise Cloud Orchestration Node",quantity:2,unit_price:12e4,line_total:24e4},{product_name:"Architecture Consulting & Migration SLA",quantity:1,unit_price:1e5,line_total:1e5}]},n=["Confirmed","Fulfilled"].includes(i.status);return`
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
              <span class="badge ${n?"badge-success":"badge-info"} text-xs">${i.status||"Under Negotiation"}</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Secure Procurement Portal for <strong class="text-on-surface">${i.customer_name}</strong> • ${i.deal_reference||`DEAL-${i.id}`}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${n?`
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
                  ${(i.lines||[]).map(a=>`
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
  `}async function Y(t){try{const s=await c.get("/quotations"),i=t?s.find(n=>n.id===parseInt(t,10)):s[0];return i?{quotation:await c.get(`/quotations/${i.id}`).catch(()=>i)}:{quotation:null}}catch{return{quotation:null}}}function X(t){const s=(t==null?void 0:t.id)||8492,i=document.getElementById("btn-portal-accept");i&&i.addEventListener("click",async()=>{if(confirm("Confirm digital signature and ratify this commercial agreement?"))try{await c.put(`/quotations/${s}`,{status:"Confirmed"}),alert("Quotation digitally signed and ratified! Deal status updated to Confirmed."),window.location.reload()}catch(r){alert(r.message||"Signature failed")}});const n=document.getElementById("btn-send-portal-msg"),a=document.getElementById("portal-reply-text"),e=document.getElementById("portal-messages-list");n&&a&&e&&n.addEventListener("click",()=>{const r=a.value.trim();if(!r)return;const o=`
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${r}</p>
        </div>
      `;e.insertAdjacentHTML("beforeend",o),a.value="",e.scrollTop=e.scrollHeight})}const Z=[{id:1,deal_reference:"DEAL-0001",customer_name:"Bronze Buyer",status:"Confirmed",line_count:2,total_amount:1300},{id:2,deal_reference:"DEAL-0002",customer_name:"Gold Buyer",status:"Confirmed",line_count:1,total_amount:1500}];function tt(t={}){var e,r;const s=(e=t.warehouses)!=null&&e.length?t.warehouses:[{id:1,name:"Equinix NY4 North America Hub",code:"WH-US-EAST",location:"Secaucus, NJ"},{id:2,name:"Frankfurt FRA1 European Gateway",code:"WH-EU-CENTRAL",location:"Frankfurt, DE"}],i=(r=t.quotations)!=null&&r.length?t.quotations.filter(o=>o.line_count>0&&!["Fulfilled","Rejected"].includes(o.status)):Z.filter(o=>o.line_count>0),n=s.map(o=>`<div class="card card-extruded"><div class="flex items-start justify-between"><span class="badge badge-primary font-mono text-[10px]">${o.code||`WH-${o.id}`}</span><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">warehouse</span></div></div><h3 class="text-sm font-bold mt-3">${o.name}</h3><p class="text-xs text-on-surface-variant">${o.location||"Global Hub"}</p><div class="pt-2 mt-3 border-t border-surface-container-high/60 text-xs"><span class="text-on-surface-variant">Available stock</span><strong class="block text-primary">Live inventory view</strong></div></div>`).join(""),a=i.map(o=>`<a class="fulfillment-order-row" href="#/fulfillment/${o.id}"><div><strong class="block text-sm">${o.deal_reference||`DEAL-${String(o.id).padStart(4,"0")}`}</strong><span class="text-[11px] text-on-surface-variant">${o.customer_name||"Customer entity"}</span></div><div><strong class="block text-sm">${o.line_count||0} line items</strong><span class="text-[11px] text-on-surface-variant">${o.total_amount?`₹${Number(o.total_amount).toLocaleString("en-IN")}`:"Awaiting allocation"}</span></div><div><span class="badge badge-warning text-[10px]">Awaiting Fulfillment</span></div><span class="material-symbols-outlined text-on-surface-variant">chevron_right</span></a>`).join("");return`<div class="page-container space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Smart logistics &amp; warehousing</span></div><h1 class="text-2xl font-bold tracking-tight">Fulfillment &amp; Stock Allocation</h1><p class="text-xs text-on-surface-variant">Review awaiting orders, inspect stock coverage, and route each shipment.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-suggest-split"><span class="material-symbols-outlined text-base">auto_fix_high</span><span>Auto-Suggest Optimal Split</span></button></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${n}</div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Awaiting Fulfillment</h2><p class="text-xs text-on-surface-variant">Select an order to open its fulfillment detail and stock plan.</p></div><span class="badge badge-warning text-[10px]">${i.length} pending</span></div><div class="space-y-2">${a||'<p class="text-sm text-on-surface-variant py-6 text-center">No orders are awaiting fulfillment.</p>'}</div></section></div>`}async function et(){try{const[t,s]=await Promise.all([c.get("/warehouses").catch(()=>[]),c.get("/quotations").catch(()=>[])]);return{warehouses:t,quotations:s}}catch{return{warehouses:[],quotations:[]}}}function st(){var t;(t=document.getElementById("btn-suggest-split"))==null||t.addEventListener("click",()=>alert("Open an awaiting order to calculate its live warehouse split."))}function at(t={}){var e;const s=t.quote||{},i=t.split||{lines:[],status:"suggested",shipment_count:0,estimated_cost:0},n=s.lines||[],a=(e=i.lines)!=null&&e.length?i.lines.map(r=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${r.product_name||`Product #${r.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity_required||r.quantity_fulfilled+r.quantity_backordered||0}</td><td class="py-3 px-4 text-xs">${r.warehouse_name||"Backorder"}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity_fulfilled}</td><td class="py-3 px-4 font-mono text-xs ${r.quantity_backordered?"text-error font-bold":""}">${r.quantity_backordered}</td><td class="py-3 px-4"><span class="badge ${r.quantity_backordered?"badge-warning":"badge-success"} text-[10px]">${r.quantity_backordered?"Partial":"Allocated"}</span></td></tr>`).join(""):n.map(r=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${r.product_name||`Product #${r.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${r.quantity}</td><td class="py-3 px-4 text-xs">Awaiting split</td><td class="py-3 px-4 font-mono text-xs">0</td><td class="py-3 px-4 font-mono text-xs text-tertiary">${r.quantity}</td><td class="py-3 px-4"><span class="badge badge-warning text-[10px]">Awaiting</span></td></tr>`).join("");return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">${s.deal_reference||`DEAL-${s.id||""}`}</span></div><div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Awaiting fulfillment</span></div><h1 class="text-xl font-bold mt-2">${s.deal_reference||"Fulfillment Detail"}</h1><p class="text-sm font-bold mt-1">${s.customer_name||"Customer entity"}</p><p class="text-xs text-on-surface-variant mt-1">Review stock coverage and confirm the warehouse allocation before dispatch.</p></div><div class="flex gap-2"><button type="button" class="btn btn-secondary text-xs" id="btn-open-override"><span class="material-symbols-outlined text-sm">edit_note</span><span>Manual Override</span></button><button type="button" class="btn btn-primary text-xs" id="btn-accept-fulfillment"><span class="material-symbols-outlined text-sm">done_all</span><span>Accept &amp; Dispatch</span></button></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded fulfillment-stat"><span>Order value</span><strong>₹${Number(s.total_amount||0).toLocaleString("en-IN")}</strong><em>${s.status||"Confirmed"}</em></div><div class="card card-extruded fulfillment-stat"><span>Shipment count</span><strong>${i.shipment_count||0}</strong><em>Suggested warehouse routes</em></div><div class="card card-extruded fulfillment-stat"><span>Estimated freight</span><strong>₹${Number(i.estimated_cost||0).toLocaleString("en-IN")}</strong><em>${i.has_backorders?"Backorder requires review":"Stock covered"}</em></div></div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Stock Allocation Detail</h2><p class="text-xs text-on-surface-variant">Live suggested split for each quotation line.</p></div><span class="badge badge-primary text-[10px]">${i.status||"suggested"}</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="text-[11px] font-bold uppercase text-on-surface-variant bg-surface-container-low/50"><th class="py-2.5 px-4">Product</th><th class="py-2.5 px-4">Required</th><th class="py-2.5 px-4">Warehouse</th><th class="py-2.5 px-4">Allocated</th><th class="py-2.5 px-4">Backorder</th><th class="py-2.5 px-4">State</th></tr></thead><tbody>${a||'<tr><td colspan="6" class="py-8 text-center text-xs text-on-surface-variant">No quotation lines found.</td></tr>'}</tbody></table></div></section><section class="card card-extruded"><h2 class="text-base font-bold mb-3">Dispatch Readiness</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer</span><strong>${s.customer_name||"Unknown customer"}</strong></div><div><span class="detail-label">Line items</span><strong>${n.length}</strong></div><div><span class="detail-label">Target service level</span><strong class="text-primary">48 hours after acceptance</strong></div></div></section></div>`}async function nt(t){const[s,i]=await Promise.all([c.get(`/quotations/${t}`).catch(()=>null),c.get(`/fulfillment/suggested-split?quotation_id=${t}`).catch(()=>null)]);return{quote:s,split:i}}function it(t){var s,i;(s=document.getElementById("btn-open-override"))==null||s.addEventListener("click",()=>{window.location.hash=`#/fulfillment-override/${t}`}),(i=document.getElementById("btn-accept-fulfillment"))==null||i.addEventListener("click",async()=>{var n;try{const a=await c.get(`/quotations/${t}`);if(!((n=a==null?void 0:a.lines)!=null&&n.length)){alert("This quotation has no line items to dispatch. Add a product line before accepting fulfillment.");return}await c.get(`/fulfillment/suggested-split?quotation_id=${t}`),await c.post("/fulfillment/accept",{quotation_id:Number(t)}),alert("Fulfillment accepted and stock reserved."),window.location.hash="#/fulfillment"}catch(a){alert(`Could not accept fulfillment: ${a.message}. Configure warehouse stock before dispatching.`)}})}function rt(t={}){var a;const s=((a=t.lines)==null?void 0:a[0])||{},i=s.discount_percent!=null?`${s.discount_percent}%`:"Not set";return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment Detail</span></a><span class="text-xs text-outline">/ Manual Override</span></div><div class="card card-extruded"><div class="flex items-center gap-3"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">gavel</span></div><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Pending approval workflow</span></div><h1 class="text-xl font-bold mt-1">Manual Override</h1><p class="text-xs text-on-surface-variant">Submit a controlled commercial change for manager approval.</p></div></div></div><form id="manual-override-form" class="space-y-4"><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">1. Override Type</h2><p class="text-xs text-on-surface-variant">Choose which commercial term requires an exception.</p></div><select id="override-type" class="input-clay w-full" required><option value="Discount override">Discount override</option><option value="Price override">Price override</option><option value="Quantity override">Quantity override</option><option value="Payment-term override">Payment-term override</option></select></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">2. Current vs New Value</h2><p class="text-xs text-on-surface-variant">Quotation: <strong>${t.deal_reference||`DEAL-${t.id||""}`}</strong> · Customer: <strong>${t.customer_name||"Customer entity"}</strong></p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><label>Current value<input id="current-value" class="input-clay w-full mt-1" value="${i}" required /></label><label>Allowed maximum<input id="allowed-maximum" class="input-clay w-full mt-1" value="15%" required /></label><label>New value<input id="new-value" class="input-clay w-full mt-1" placeholder="e.g. 20%" required /></label></div></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">3. Reason</h2><p class="text-xs text-on-surface-variant">Explain the customer or deal event that requires this override.</p></div><textarea id="override-reason" class="input-clay w-full" rows="3" minlength="10" required placeholder="Customer requested additional discount for bulk order."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">4. Business Justification</h2><p class="text-xs text-on-surface-variant">Include expected order value, customer importance, competitive pricing, or strategic deal context.</p></div><textarea id="business-justification" class="input-clay w-full" rows="4" minlength="10" required placeholder="Expected annual order of ₹25 Lakhs; strategic expansion account."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">5. Supporting Information</h2><p class="text-xs text-on-surface-variant">Optional competitor quote or document reference.</p></div><textarea id="supporting-information" class="input-clay w-full" rows="2" placeholder="Competitor quote ID, attachment reference, or additional context"></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">6. Approval</h2><p class="text-xs text-on-surface-variant">Select the responsible manager. The request will be submitted as Pending Approval.</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><label>Approver<select id="approver" class="input-clay w-full mt-1" required><option value="Sales Manager">Sales Manager</option><option value="Finance Operations">Finance Operations</option><option value="Administrator">Administrator</option></select></label><div><span class="detail-label">Override status</span><span class="badge badge-warning text-[10px]">Pending Approval</span></div></div></section><div class="flex justify-end gap-2"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs">Cancel</a><button type="submit" class="btn btn-primary text-xs"><span class="material-symbols-outlined text-sm">send</span><span>Submit Override</span></button></div></form></div>`}async function ot(t){try{return await c.get(`/quotations/${t}`)}catch{return{id:t}}}function ct(t){var s;(s=document.getElementById("manual-override-form"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const n=i.currentTarget;if(!n.checkValidity()){n.reportValidity();return}const a=e=>document.getElementById(e).value.trim();try{await c.post("/fulfillment/manual-override",{quotation_id:Number(t),override_type:a("override-type"),current_value:a("current-value"),allowed_maximum:a("allowed-maximum"),new_value:a("new-value"),reason:a("override-reason"),business_justification:a("business-justification"),supporting_information:a("supporting-information")||null,approver:a("approver")}),alert("Override submitted for approval."),window.location.hash=`#/fulfillment/${t}`}catch(e){alert(`Could not submit override: ${e.message}`)}})}function lt(t=[]){const s=Array.isArray(t)&&t.length>0?t:[{id:1,number:"INV-2024-1101",deal_ref:"DEAL-8492",customer_name:"Starlight Dynamics Inc.",milestone:"Series B Expansion",icon:"verified_user",amount:260925,status:"Pending",due_date:"Oct 28, 2024"},{id:2,number:"INV-2024-1102",deal_ref:"DEAL-8488",customer_name:"Nexus Health Systems",milestone:"Series B Milestone",icon:"receipt_long",amount:13e4,status:"Paid",due_date:"Oct 1, 2024"},{id:3,number:"INV-2024-1103",deal_ref:"DEAL-8475",customer_name:"Vanguard Logistics International",milestone:"Q3 Infrastructure",icon:"local_shipping",amount:45e3,status:"Pending",due_date:"Oct 15, 2024"},{id:4,number:"INV-2024-1104",deal_ref:"DEAL-8461",customer_name:"AeroSphere Aerospace Holdings",milestone:"Advisory Mandate Phase I",icon:"flight_takeoff",amount:222500,status:"Pending",due_date:"Nov 1, 2024"},{id:5,number:"INV-2024-1100",deal_ref:"DEAL-8450",customer_name:"Borealis CleanTech JV",milestone:"Escrow Release Tier 3",icon:"corporate_fare",amount:89200,status:"Overdue",due_date:"Sep 15, 2024"}],i=s.reduce((e,r)=>e+(Number(r.amount)||0),0),n=s.filter(e=>(e.status||"").toLowerCase()==="paid").length,a=s.map(e=>{const r=(e.status||"").toLowerCase();let o="";return r==="paid"?o='<span class="badge badge-success text-[10px]">Paid</span>':r==="overdue"?o='<span class="badge badge-error text-[10px]">Overdue</span>':o='<span class="badge badge-warning text-[10px]">Pending</span>',`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">
          <a href="#/invoices/${e.id}" class="hover:underline">${e.number||`INV-${e.id}`}</a>
        </td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${e.deal_ref||""}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${e.customer_name||"Customer"}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">₹${Number(e.amount).toLocaleString("en-IN")}</td>
        <td class="py-3 px-4 text-on-surface-variant">${e.due_date||"Net 30"}</td>
        <td class="py-3 px-4">${o}</td>
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
            <div class="text-xl font-bold font-mono text-on-surface mt-1">₹${Number(i).toLocaleString("en-IN")}</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">account_balance</span>
          </div>
        </div>
        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Settled Invoices</span>
            <div class="text-xl font-bold font-mono text-primary mt-1">${n} of ${s.length} Paid</div>
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
  `}async function dt(){try{const t=await c.get("/payments/invoices");return Array.isArray(t)?t:[]}catch{return[]}}function pt(){document.querySelectorAll(".download-pdf-btn").forEach(s=>{s.addEventListener("click",async()=>{const i=s.getAttribute("data-id"),n=s.getAttribute("data-number");try{await c.downloadFile(`/payments/invoices/${i}/pdf`,`DealFlow360_Invoice_${n}.pdf`)}catch(a){alert("PDF download failed: "+a.message)}})}),document.querySelectorAll(".settle-btn").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-id");window.location.hash=`#/invoices/${i}`})});const t=document.getElementById("btn-create-invoice");t&&t.addEventListener("click",()=>{alert("Batch invoice generation engine executed: All billable quotation milestones synchronized.")})}function ut(t){if(!t||!t.id)return`
      <div class="page-container flex items-center justify-center min-h-[60vh]">
        <div class="card card-extruded p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span>
          <h2 class="text-lg font-bold text-on-surface">Invoice Not Found</h2>
          <p class="text-xs text-on-surface-variant mt-1">The requested invoice could not be loaded.</p>
          <a href="#/invoices" class="btn btn-primary text-xs mt-4">← Back to Invoices</a>
        </div>
      </div>
    `;const s=(t.status||"").toLowerCase()==="paid",i=t.lines||[],n=i.reduce((d,u)=>d+(Number(u.amount)||0),0)||Number(t.amount)||0,a=n*.065,e=n+a,r=t.payments||[];r.reduce((d,u)=>d+(Number(u.amount)||0),0);const o=s?'<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E9F3EC] text-[#3D6847] border border-[#C5E2CB]">Paid &amp; Reconciled</span>':'<span class="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-primary">Pending Payment</span>',l=i.map((d,u)=>`
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
  `).join(""),m=r.length>0?`
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
                ${o}
                <span class="text-outline">•</span>
                <span class="font-mono text-secondary">${t.deal_ref||"Commercial Deal"}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-secondary text-xs py-1.5 px-3" id="btn-send-reminder">
              <span class="material-symbols-outlined text-sm">forward_to_inbox</span>
              <span>Send Reminder</span>
            </button>
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
              <p class="font-mono font-bold text-on-surface">₹${Number(n).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
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
      ${m}
    </div>
  `}async function mt(t){try{return await c.get(`/payments/invoices/${t}`)}catch(s){return console.warn("Could not fetch invoice detail:",s),null}}function xt(t){if(!t)return;const s=document.getElementById("btn-download-pdf");s&&s.addEventListener("click",async()=>{try{const a=`DealFlow360_Invoice_${t.number||t.id}.pdf`;await c.downloadFile(`/payments/invoices/${t.id}/pdf`,a)}catch(a){alert("Error generating PDF: "+a.message)}});const i=document.getElementById("btn-send-reminder");i&&i.addEventListener("click",()=>{alert(`Dispatched automated billing reminder to ${t.customer_name||"Buyer"} AP desk.`)});const n=document.getElementById("btn-record-payment");n&&n.addEventListener("click",()=>{const a=n.getAttribute("data-amount");g.show({title:"Record Payment Signoff",content:`
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
        `,confirmText:"Execute Payment Signoff",onConfirm:async()=>{var o,l,m;const e=parseFloat((o=document.getElementById("payment-amount-input"))==null?void 0:o.value)||0,r=((m=(l=document.getElementById("payment-ref-input"))==null?void 0:l.value)==null?void 0:m.trim())||"WIRE-DIRECT";try{return await c.post(`/payments/invoices/${t.id}/pay`,{amount:e,reference:r}),alert(`Payment of ₹${e.toLocaleString("en-IN")} recorded successfully!`),window.location.hash=`#/invoices/${t.id}`,window.location.reload(),!0}catch(d){return alert("Failed to record payment: "+d.message),!1}}})})}const ft=[{id:1,name:"Enterprise M&A Platform Core",cadence:"yearly",price:12e4,product_id:1},{id:2,name:"Deal Desk Executive Seat",cadence:"monthly",price:350,product_id:2},{id:3,name:"Mission-Critical 24/7 Support SLA",cadence:"yearly",price:45e3,product_id:3}],k=t=>`₹${Number(t||0).toLocaleString("en-IN")}`,bt=t=>(t||"yearly").replace(/^./,s=>s.toUpperCase());function vt(t=[]){const s=Array.isArray(t)&&t.length?t:ft,i=s.filter(e=>e.is_active!==!1&&e.status!=="Canceled"),n=s.reduce((e,r)=>e+Number(r.price||0)/((r.cadence||"").toLowerCase()==="monthly"?1:12),0),a=s.map((e,r)=>{const o=bt(e.cadence),l=e.is_active===!1||e.status==="Canceled"?"Canceled":"Active";return`<a class="subscription-row" href="#/subscriptions/${e.id}" data-search="${`${e.name} ${e.id} ${e.product_id}`.toLowerCase()}">
      <div class="subscription-plan-cell"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">${r%2?"memory":"cloud_sync"}</span></div><div class="min-w-0"><strong class="block text-sm text-on-surface truncate">${e.name}</strong><span class="text-[11px] text-on-surface-variant"><span class="font-mono">SUB-${String(e.id).padStart(4,"0")}</span> · Product ${e.product_id||"N/A"} · ${o} entitlement</span></div></div>
      <div><strong class="block text-sm text-on-surface">${e.customer_name||"Unassigned account"}</strong><span class="text-[11px] text-on-surface-variant">${e.tier||"Enterprise"} · Master agreement</span></div>
      <div><strong class="font-mono text-sm text-on-surface">${k(e.price)} <span class="text-[11px] font-sans text-on-surface-variant">/ ${o==="Monthly"?"mo":"yr"}</span></strong><span class="block text-[11px] text-on-surface-variant">${o} recurring billing</span></div>
      <div><strong class="font-mono text-xs text-on-surface">${e.next_bill||(r%2?"Nov 30, 2026":"Dec 15, 2026")}</strong><span class="block text-[11px] text-primary">Auto-renewal on</span></div>
      <div><span class="badge ${l==="Active"?"badge-success":"badge-warning"} text-[10px]">${l}</span></div><span class="subscription-row-arrow material-symbols-outlined" aria-hidden="true">chevron_right</span>
    </a>`}).join("");return`<div class="page-container space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Billing engine active · Ledger OK</span></div><h1 class="text-2xl font-bold tracking-tight text-on-surface">Subscriptions &amp; Recurring Billing</h1><p class="text-sm text-on-surface-variant">Manage recurring contracts, renewal timing, and billing schedules across customer entities.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-add-plan"><span class="material-symbols-outlined text-base">add_circle</span><span>New Subscription Plan</span></button></div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><div class="card card-extruded subscription-metric"><span>Active MRR Run-Rate</span><strong>${k(n)}<small>/mo</small></strong><em>ARR: ${k(n*12)}</em></div><div class="card card-extruded subscription-metric"><span>Active Subscriptions</span><strong>${i.length}</strong><em>${i.length} active contracts</em></div><div class="card card-extruded subscription-metric"><span>Gross Monthly Churn</span><strong>0.8%<small>vol/mo</small></strong><em>Benchmark &lt; 1.50%</em></div><div class="card card-extruded subscription-metric"><span>Auto-Renewal Pacing</span><strong>94.6%<small>secured</small></strong><em>45 in 60-day horizon</em></div></div>
    <section class="card card-extruded subscription-workspace"><div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-4"><div class="subscription-filters" role="tablist"><button type="button" class="subscription-filter active" data-filter="all">All Subscriptions <b>${s.length}</b></button><button type="button" class="subscription-filter" data-filter="active">Active <b>${i.length}</b></button><button type="button" class="subscription-filter" data-filter="renewal">Renewal Due <b>0</b></button><button type="button" class="subscription-filter" data-filter="suspended">Suspended / Trial <b>0</b></button></div><label class="subscription-search"><span class="material-symbols-outlined">search</span><input id="subscription-search" type="search" placeholder="Search customer, plan ID, or tag..." /></label></div><div class="subscription-table-head"><span>Plan &amp; entitlement</span><span>Customer entity</span><span>Commit value &amp; cycle</span><span>Next bill</span><span>State</span><span></span></div><div id="subscription-rows" class="space-y-2">${a}</div><p id="subscription-empty" class="hidden text-center text-sm text-on-surface-variant py-8">No subscriptions match this view.</p><div class="flex items-center justify-between gap-3 pt-4 text-xs text-on-surface-variant"><span>Showing <strong class="text-on-surface">${s.length}</strong> of ${s.length} recurring contracts</span><span class="font-mono">Page 1</span></div></section>
    <section class="card card-extruded space-y-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">calculate</span><div><h3 class="text-base font-bold">Mid-Cycle Seat Upgrade &amp; Proration</h3><p class="text-xs text-on-surface-variant">Preview the delta before changing a recurring contract.</p></div></div><div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"><label>Active plan<select class="input-clay w-full mt-1" id="prorate-plan"><option value="4200">Executive Seats (₹4,200/yr)</option><option value="120000">Enterprise Core (₹120k/yr)</option></select></label><label>Seats added<input type="number" id="prorate-seats" min="1" value="5" class="input-clay w-full mt-1" /></label><label>Days remaining<input type="number" id="prorate-days" min="1" max="365" value="142" class="input-clay w-full mt-1" /></label><label>Proration delta<div class="font-mono font-bold text-base text-primary p-2 mt-1 rounded-lg bg-surface-container" id="prorate-result">₹8,169.86</div></label></div></section>
  </div>`}async function gt(){try{return await c.get("/subscriptions/plans")}catch{return[]}}function yt(){var u;const t=document.getElementById("subscription-search"),s=[...document.querySelectorAll(".subscription-row")],i=document.getElementById("subscription-empty"),n=[...document.querySelectorAll(".subscription-filter")];let a="all";const e=()=>{const p=((t==null?void 0:t.value)||"").toLowerCase().trim();let x=0;s.forEach(f=>{const y=!p||f.dataset.search.includes(p),h=a!=="active"||f.querySelector(".badge-success");f.classList.toggle("hidden",!y||!h),y&&h&&(x+=1)}),i==null||i.classList.toggle("hidden",x>0)};t==null||t.addEventListener("input",e),n.forEach(p=>p.addEventListener("click",()=>{a=p.dataset.filter,n.forEach(x=>x.classList.toggle("active",x===p)),e()}));const r=document.getElementById("prorate-seats"),o=document.getElementById("prorate-days"),l=document.getElementById("prorate-plan"),m=document.getElementById("prorate-result"),d=()=>{m&&(m.textContent=k(Number(l==null?void 0:l.value)/365*Number((o==null?void 0:o.value)||0)*Number((r==null?void 0:r.value)||0)))};[r,o,l].forEach(p=>p==null?void 0:p.addEventListener("input",d)),(u=document.getElementById("btn-add-plan"))==null||u.addEventListener("click",()=>g.show({title:"New Subscription Plan",content:'<input id="plan-name-in" type="text" class="input-clay w-full" placeholder="Plan name" /><input id="plan-price-in" type="number" class="input-clay w-full mt-3" placeholder="Base rate (INR)" />',confirmText:"Create Plan",onConfirm:async()=>{const p=document.getElementById("plan-name-in").value.trim(),x=Number(document.getElementById("plan-price-in").value);if(!p||!x)throw new Error("Plan name and price are required");return await c.post("/subscriptions/plans",{name:p,cadence:"yearly",product_id:1,price:x}),window.location.reload(),!0}}))}const E=t=>`₹${Number(t||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`,L=t=>(t||"yearly").replace(/^./,s=>s.toUpperCase());function ht(t){var r;if(!(t!=null&&t.id))return'<div class="page-container flex items-center justify-center min-h-[60vh]"><div class="card card-extruded p-8 text-center"><span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span><h2 class="text-lg font-bold">Subscription Not Found</h2><a href="#/subscriptions" class="btn btn-primary text-xs mt-4">Back to Subscriptions</a></div></div>';const s=t.schedules||[],i=s.filter(o=>o.status==="Billed").reduce((o,l)=>o+Number(l.amount||0),0),n=s.filter(o=>o.status==="Scheduled").reduce((o,l)=>o+Number(l.amount||0),0),a=s.length?s.map(o=>{var l;return`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 font-mono text-xs">${o.projected?"PROJECTED":`BILL-${String(o.id).padStart(5,"0")}`}</td><td class="py-3 px-4 font-mono text-xs">${o.billing_date||"Scheduled"}</td><td class="py-3 px-4 text-xs">${o.customer_name||((l=t.customers)==null?void 0:l[0])||"Unassigned account"}</td><td class="py-3 px-4 font-mono text-xs text-right font-bold">${E(o.amount)}</td><td class="py-3 px-4"><span class="badge ${o.status==="Billed"?"badge-success":"badge-warning"} text-[10px]">${o.status||"Scheduled"}</span></td></tr>`}).join(""):'<tr><td colspan="5" class="py-8 text-center text-xs text-on-surface-variant">No billing cycles have been generated for this subscription yet.</td></tr>',e=t.is_active!==!1;return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/subscriptions" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Subscriptions</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">SUB-${String(t.id).padStart(4,"0")}</span></div>
    <div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary"><span class="material-symbols-outlined text-3xl">receipt_long</span></div><div><div class="flex items-center gap-2 flex-wrap"><h1 class="text-xl font-bold text-on-surface">Billing Detail</h1><span class="badge ${e?"badge-success":"badge-error"} text-[10px]">${e?"Active":"Canceled"}</span></div><p class="text-sm font-bold text-on-surface mt-1">${t.name}</p><p class="text-xs text-on-surface-variant mt-1">Product ${t.product_id} · ${L(t.cadence)} recurring contract</p></div></div><div class="flex items-center gap-2">${e?'<button type="button" class="btn btn-secondary text-xs" id="btn-modify-subscription"><span class="material-symbols-outlined text-sm">edit_note</span><span>Modify Terms</span></button><button type="button" class="btn btn-secondary text-xs text-error" id="btn-cancel-subscription"><span class="material-symbols-outlined text-sm">bolt</span><span>Cancel Contract</span></button>':""}</div></div></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded subscription-detail-stat"><span>Contract Value</span><strong>${E(t.price)}</strong><em>per ${L(t.cadence).toLowerCase()} cycle</em></div><div class="card card-extruded subscription-detail-stat"><span>Billed To Date</span><strong>${E(i)}</strong><em>${s.filter(o=>o.status==="Billed").length} settled cycles</em></div><div class="card card-extruded subscription-detail-stat"><span>Scheduled Balance</span><strong>${E(n)}</strong><em>${s.filter(o=>o.status==="Scheduled").length} upcoming cycles</em></div></div>
    <section class="card card-extruded"><div class="flex items-center justify-between gap-3 mb-4"><div><h2 class="text-base font-bold">Billing Schedule</h2><p class="text-xs text-on-surface-variant">Every generated charge for this recurring contract.</p></div><span class="badge badge-primary text-[10px]">${s.length} cycles</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"><th class="py-2.5 px-4">Billing reference</th><th class="py-2.5 px-4">Billing date</th><th class="py-2.5 px-4">Customer entity</th><th class="py-2.5 px-4 text-right">Amount</th><th class="py-2.5 px-4">Status</th></tr></thead><tbody>${a}</tbody></table></div></section>
    <section class="card card-extruded"><div class="flex items-center gap-2 mb-3"><span class="material-symbols-outlined text-primary">account_balance</span><h2 class="text-base font-bold">Remittance &amp; Contract Context</h2></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer entity</span><strong>${((r=t.customers)==null?void 0:r.join(", "))||"Unassigned account"}</strong></div><div><span class="detail-label">Payment terms</span><strong>Net 30 · Direct wire</strong></div><div><span class="detail-label">Ledger status</span><strong class="text-primary">Reconciled and monitored</strong></div></div></section></div>`}async function wt(t){try{return await c.get(`/subscriptions/plans/${t}/billing-detail`)}catch(s){return console.warn("Could not fetch subscription billing detail:",s),null}}function $t(t){var s,i;(s=document.getElementById("btn-modify-subscription"))==null||s.addEventListener("click",()=>g.show({title:"Modify Subscription Terms",content:`<div class="space-y-3 text-xs"><label class="block font-bold">Plan name<input id="modify-plan-name" class="input-clay w-full mt-1" value="${t.name}" /></label><label class="block font-bold">Recurring price (INR)<input id="modify-plan-price" type="number" min="0.01" class="input-clay w-full mt-1" value="${t.price}" /></label><label class="block font-bold">Cadence<select id="modify-plan-cadence" class="input-clay w-full mt-1"><option value="monthly" ${t.cadence==="monthly"?"selected":""}>Monthly</option><option value="quarterly" ${t.cadence==="quarterly"?"selected":""}>Quarterly</option><option value="yearly" ${t.cadence==="yearly"?"selected":""}>Yearly</option></select></label></div>`,confirmText:"Save Terms",onConfirm:async()=>(await c.patch(`/subscriptions/plans/${t.id}`,{name:document.getElementById("modify-plan-name").value.trim(),price:Number(document.getElementById("modify-plan-price").value),cadence:document.getElementById("modify-plan-cadence").value}),window.location.hash=`#/subscriptions/${t.id}`,window.location.reload(),!0)})),(i=document.getElementById("btn-cancel-subscription"))==null||i.addEventListener("click",()=>{var a,e;const n=(e=(a=t==null?void 0:t.schedules)==null?void 0:a.find(r=>r.quotation_line_id))==null?void 0:e.quotation_line_id;g.show({title:"Cancel Subscription",content:'<p class="text-xs text-on-surface-variant">Future billing cycles will stop and this contract will be marked canceled.</p>',confirmText:"Cancel Contract",onConfirm:async()=>(n?await c.post(`/subscriptions/lines/${n}/cancel`,{}):await c.post(`/subscriptions/plans/${t.id}/cancel`,{}),window.location.hash="#/subscriptions",window.location.reload(),!0)})})}function Et(t={}){const{stalled:s=[],reports:i=null}=t,n=s.length>0?s:[{id:8461,ref:"DEAL-8461",customer:"Apex Financial Cloud Vault",stage:"Draft Phase",days:18,risk:"High — Rep Inactive 12 Days"},{id:8440,ref:"DEAL-8440",customer:"Vanguard Aerospace Systems",stage:"Legal Terms Review",days:24,risk:"Medium — Redlines in Queue"},{id:8425,ref:"DEAL-8425",customer:"Nordic Marine Telecom",stage:"Pending Approval",days:9,risk:"Low — Escalation Pending VP"}];return`
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
            <div class="text-xl font-bold font-mono text-error mt-1">${n.length} Stalled Deals</div>
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
              ${n.map(a=>`
                <tr class="table-row border-b border-surface-container-high/40 text-xs hover:bg-surface-container/40">
                  <td class="py-3 px-4 font-mono font-bold text-primary">
                    <a href="#/quotations/${a.id||8461}" class="hover:underline">${a.ref||`DEAL-${a.id}`}</a>
                  </td>
                  <td class="py-3 px-4 font-bold text-on-surface">${a.customer}</td>
                  <td class="py-3 px-4 text-on-surface-variant">${a.stage}</td>
                  <td class="py-3 px-4 font-mono font-bold text-error">${a.days} Days</td>
                  <td class="py-3 px-4">
                    <span class="badge badge-warning text-[10px]">${a.risk}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="btn btn-secondary text-xs py-1 px-2.5 nudge-rep-btn" data-id="${a.id||8461}">
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
  `}async function kt(){try{const[t,s]=await Promise.all([c.get("/reports/quotations").catch(()=>null),c.get("/deal_health/stalled").catch(()=>[])]);return{reports:t,stalled:s}}catch{return{reports:null,stalled:[]}}}function _t(){const t=document.getElementById("btn-export-csv");t&&t.addEventListener("click",()=>{window.open("/api/v1/reports/quotations/export/csv","_blank")});const s=document.getElementById("btn-export-pdf");s&&s.addEventListener("click",()=>{alert("Compiling executive board briefing deck (PDF format)...")}),document.querySelectorAll(".nudge-rep-btn").forEach(i=>{i.addEventListener("click",()=>{const n=i.getAttribute("data-id");alert(`Automated SLA notification dispatch sent to assigned sales rep for Deal #${n}.`)})})}class St{constructor(){this.appEl=document.getElementById("app"),window.addEventListener("hashchange",()=>this.handleRoute())}init(){!window.location.hash||window.location.hash==="#/"?window.location.hash=w.isAuthenticated()?"#/dashboard":"#/login":this.handleRoute()}parseHash(){const s=window.location.hash.slice(1)||"/login",[i]=s.split("?"),a=(i.startsWith("/")?i.slice(1):i).split("/"),e=a[0]||"dashboard",r=a[1]||null,o=new URLSearchParams(window.location.hash.split("?")[1]||"");return{route:e,param:r,query:o}}showLoading(){this.appEl.innerHTML=`
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `}async handleRoute(){const{route:s,param:i,query:n}=this.parseHash(),a=w.isAuthenticated();if(!a&&s!=="login"&&s!=="portal"){window.location.hash="#/login";return}if(a&&s==="login"){window.location.hash="#/dashboard";return}switch(window.scrollTo(0,0),s){case"login":{this.appEl.innerHTML=D(),P();break}case"dashboard":{this.showLoading();const e=await B();this.appEl.innerHTML=`
          ${b("dashboard")}
          <main class="main-content">${I(e)}</main>
        `,v(),N();break}case"quotations":{if(i){this.showLoading();const e=await C(i);this.appEl.innerHTML=`
            ${b("quotations")}
            <main class="main-content">${S(e)}</main>
          `,v(),A(i,e.products,e.customers)}else{this.showLoading();const e=await j();this.appEl.innerHTML=`
            ${b("quotations")}
            <main class="main-content">${q(e)}</main>
          `,v(),T()}break}case"quotation-detail":{this.showLoading();const e=i||n.get("id"),r=await C(e);this.appEl.innerHTML=`
          ${b("quotations")}
          <main class="main-content">${S(r)}</main>
        `,v(),A(e,r.products,r.customers);break}case"approvals":{this.showLoading();const e=await M();this.appEl.innerHTML=`
          ${b("approvals")}
          <main class="main-content">${R(e)}</main>
        `,v(),H();break}case"products":{this.showLoading();const e=await O();this.appEl.innerHTML=`
          ${b("products")}
          <main class="main-content">${F(e)}</main>
        `,v(),U();break}case"pricing":case"pricing-rules":{this.showLoading();const e=await Q();this.appEl.innerHTML=`
          ${b("pricing")}
          <main class="main-content">${V(e)}</main>
        `,v(),G();break}case"customers":{this.showLoading();const e=await z();this.appEl.innerHTML=`
          ${b("customers")}
          <main class="main-content">${W(e)}</main>
        `,v(),K();break}case"portal":{this.showLoading();const e=i||n.get("id"),r=await Y(e);this.appEl.innerHTML=`
          ${b("portal")}
          <main class="main-content">${J(r)}</main>
        `,v(),X(r.quotation);break}case"fulfillment":{if(this.showLoading(),i){const e=await nt(i);this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${at(e)}</main>`,v(),it(i)}else{const e=await et();this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${tt(e)}</main>`,v(),st()}break}case"fulfillment-override":{this.showLoading();const e=await ot(i);this.appEl.innerHTML=`${b("fulfillment")}<main class="main-content">${rt(e)}</main>`,v(),ct(i);break}case"invoices":{if(i){this.showLoading();const e=await mt(i);this.appEl.innerHTML=`
            ${b("invoices")}
            <main class="main-content">${ut(e)}</main>
          `,v(),xt(e)}else{this.showLoading();const e=await dt();this.appEl.innerHTML=`
            ${b("invoices")}
            <main class="main-content">${lt(e)}</main>
          `,v(),pt()}break}case"subscriptions":{if(this.showLoading(),i){const e=await wt(i);this.appEl.innerHTML=`${b("subscriptions")}<main class="main-content">${ht(e)}</main>`,v(),$t(e)}else{const e=await gt();this.appEl.innerHTML=`${b("subscriptions")}<main class="main-content">${vt(e)}</main>`,v(),yt()}break}case"reports":{this.showLoading();const e=await kt();this.appEl.innerHTML=`
          ${b("reports")}
          <main class="main-content">${Et(e)}</main>
        `,v(),_t();break}default:{window.location.hash="#/dashboard";break}}}}document.addEventListener("DOMContentLoaded",()=>{new St().init()});
