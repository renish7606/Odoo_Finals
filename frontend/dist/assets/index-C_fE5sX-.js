(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();const V="/api/v1";class D extends Error{constructor(s,i,n){super(s),this.name="ApiError",this.status=i,this.data=n}}const c={getToken(){return localStorage.getItem("dealflow_token")},setToken(a){a?localStorage.setItem("dealflow_token",a):localStorage.removeItem("dealflow_token")},getHeaders(a={}){const s={"Content-Type":"application/json",...a},i=this.getToken();return i&&(s.Authorization=`Bearer ${i}`),s},async request(a,s={}){const i=`${V}${a}`,n=this.getHeaders(s.headers),e={...s,headers:n};e.body&&typeof e.body=="object"&&!(e.body instanceof FormData)&&(e.body=JSON.stringify(e.body));try{const t=await fetch(i,e);if(t.status===401&&!a.includes("/auth/login"))throw this.setToken(null),localStorage.removeItem("dealflow_user"),window.location.hash="#/login",new D("Session expired. Please sign in again.",401,null);if(t.status===204)return null;const r=t.headers.get("content-type")||"";let o=null;if(r.includes("application/json")?o=await t.json():o=await t.text(),!t.ok){const m=(o==null?void 0:o.detail)||(o==null?void 0:o.message)||`Request failed with status ${t.status}`;throw new D(m,t.status,o)}return o}catch(t){throw t instanceof D?t:new D(t.message||"Network connection failed",0,null)}},get(a,s){let i=a;if(s){const n=new URLSearchParams(s).toString();n&&(i+=`?${n}`)}return this.request(i,{method:"GET"})},post(a,s){return this.request(a,{method:"POST",body:s})},put(a,s){return this.request(a,{method:"PUT",body:s})},delete(a){return this.request(a,{method:"DELETE"})}},L={getUser(){try{const a=localStorage.getItem("dealflow_user");return a?JSON.parse(a):null}catch{return null}},setUser(a){a?localStorage.setItem("dealflow_user",JSON.stringify(a)):localStorage.removeItem("dealflow_user")},isAuthenticated(){return!!c.getToken()},async login(a,s){const i=await c.post("/auth/login",{email:a,password:s});if(i.access_token){c.setToken(i.access_token);try{const n=await c.get("/auth/me");return this.setUser(n),{success:!0,user:n}}catch{const n={email:a,full_name:"Eleanor Vance",role:"Sales Director"};return this.setUser(n),{success:!0,user:n}}}throw new Error("Authentication failed: No access token received")},logout(){c.setToken(null),this.setUser(null),window.location.hash="#/login"}};function g(a="dashboard"){const s=L.getUser()||{full_name:"Eleanor Vance",role:"Sales Director"};return`
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
          ${[{key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"},{key:"quotations",label:"Quotations",icon:"request_quote",href:"#/quotations"},{key:"approvals",label:"Approvals",icon:"verified",href:"#/approvals"},{key:"fulfillment",label:"Fulfillment",icon:"assignment_turned_in",href:"#/fulfillment"},{key:"invoices",label:"Invoices",icon:"receipt_long",href:"#/invoices"},{key:"customers",label:"Customers",icon:"corporate_fare",href:"#/customers"},{key:"products",label:"Products",icon:"inventory_2",href:"#/products"},{key:"pricing",label:"Pricing",icon:"sell",href:"#/pricing"},{key:"subscriptions",label:"Subscriptions",icon:"sync",href:"#/subscriptions"},{key:"reports",label:"Reports",icon:"bar_chart",href:"#/reports"},{key:"portal",label:"Portal",icon:"open_in_browser",href:"#/portal"}].map(e=>{const r=a===e.key||a==="quotation-detail"&&e.key==="quotations"?"nav-item-active":"nav-item-inactive";return`
        <a href="${e.href}" class="nav-item ${r}" data-route="${e.key}">
          <span class="material-symbols-outlined text-lg">${e.icon}</span>
          <span>${e.label}</span>
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
  `}function y(){const a=document.getElementById("btn-logout");a&&a.addEventListener("click",()=>{confirm("Are you sure you want to sign out?")&&L.logout()})}function O(){return`
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
  `}function W(){const a=document.getElementById("login-form"),s=document.getElementById("login-error"),i=document.getElementById("btn-submit-login"),n=document.getElementById("toggle-pw"),e=document.getElementById("login-password"),t=document.getElementById("pw-icon");n&&e&&t&&n.addEventListener("click",()=>{e.type==="password"?(e.type="text",t.textContent="visibility_off"):(e.type="password",t.textContent="visibility")}),document.querySelectorAll(".sso-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-provider");alert(`Initiating SAML 2.0 / OIDC handshake with ${o}...`)})}),a&&a.addEventListener("submit",async r=>{r.preventDefault(),s.classList.add("hidden"),s.textContent="",i.disabled=!0,i.innerHTML='<span class="loading-spinner"></span> Authenticating...';const o=document.getElementById("login-email").value.trim(),m=e.value.trim();try{await L.login(o,m),window.location.hash="#/dashboard"}catch(l){s.textContent=l.message||"Login failed. Check your credentials.",s.classList.remove("hidden")}finally{i.disabled=!1,i.innerHTML='<span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span>'}})}function z(a={}){const{summary:s={},quotations:i=[]}=a,n=s.total_revenue?`₹${Number(s.total_revenue).toLocaleString("en-IN")}`:"₹4,82,05,000",e=s.pending_approvals??1,t=(s.total_quotations||s.draft_count)&&s.total_quotations||5,r=s.win_rate?`${s.win_rate}%`:"40%",m=(i.length>0?i.slice(0,6):[{id:8492,deal_reference:"DEAL-0005",rep_name:"Marcus Vance",customer_name:"Terra Motors OEM",total_amount:0,status:"Approved",time:"Recent"},{id:8488,deal_reference:"DEAL-0004",rep_name:"Eleanor Vance",customer_name:"Zenith Retail AI",total_amount:0,status:"Pending Approval",time:"Recent"},{id:8475,deal_reference:"DEAL-0003",rep_name:"Marcus Vance",customer_name:"Starlight Dynamics Inc.",total_amount:0,status:"Under Negotiation",time:"Recent"},{id:8461,deal_reference:"DEAL-0001",rep_name:"Local Sales Rep",customer_name:"Bronze Buyer",total_amount:1300,status:"Draft",time:"Recent"},{id:8462,deal_reference:"DEAL-0002",rep_name:"Local Sales Manager",customer_name:"Gold Buyer",total_amount:1500,status:"Confirmed",time:"Recent"}]).map(l=>{let x="badge-primary";const d=(l.status||"").toLowerCase(),u=d.includes("approve")||d.includes("pending")||d.includes("negotiat");d.includes("approve")?x="badge-success":d.includes("negotiat")||d.includes("review")||d.includes("pending")?x="badge-warning":d.includes("fulfill")||d.includes("confirm")?x="badge-info":d.includes("draft")&&(x="badge-neutral");const v=l.rep_name||l.rep&&l.rep.full_name||"Sales Rep",f=v.split(" ").map(P=>P[0]).join("").substring(0,2).toUpperCase()||"SR",h=l.customer_name||l.customer&&l.customer.name||"Client Organization",w=l.deal_reference||(l.id?`DEAL-${String(l.id).padStart(4,"0")}`:"DEAL-0001");return`
      <tr class="table-row hover:bg-surface-container/50 transition-colors activity-row" data-status="${l.status||"Draft"}" data-is-approval="${u?"true":"false"}" data-deal-id="${l.id}">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${l.time||"Recent"}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${f}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${v}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${h}</span>
            <span class="text-[10px] font-mono text-primary">${w}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(l.total_amount||0).toLocaleString("en-IN")}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${x}">● ${l.status||"Draft"}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${l.id}" class="btn btn-secondary text-xs py-1 px-3 btn-review-deal" data-id="${l.id}">Review Deal</a>
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
          <!-- Quarter Date Selector -->
          <div class="quarter-dropdown-wrapper" id="quarter-selector-wrapper">
            <div class="pill-badge flex items-center gap-2 text-xs select-none" id="btn-quarter-toggle" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
              <span class="material-symbols-outlined text-base text-primary select-none">calendar_today</span>
              <span id="current-quarter-label">This Quarter: Jul 1 – Sep 30</span>
              <span class="material-symbols-outlined text-sm text-outline transition-transform duration-200 select-none" id="quarter-chevron">expand_more</span>
            </div>
            <div class="quarter-menu" id="quarter-dropdown-menu">
              <div class="quarter-menu-item selected" data-label="This Quarter: Jul 1 – Sep 30">This Quarter: Jul 1 – Sep 30</div>
              <div class="quarter-menu-item" data-label="Q2: Apr 1 – Jun 30">Q2: Apr 1 – Jun 30</div>
              <div class="quarter-menu-item" data-label="Q1: Jan 1 – Mar 31">Q1: Jan 1 – Mar 31</div>
              <div class="quarter-menu-item" data-label="Q4: Oct 1 – Dec 31">Q4: Oct 1 – Dec 31</div>
            </div>
          </div>

          <!-- New Deal + Button -->
          <button type="button" class="btn btn-primary text-xs flex items-center gap-1.5" id="btn-new-deal-dash">
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
              <span class="badge badge-success text-[10px] flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">trending_up</span> +18.4%
              </span>
              <span class="text-[11px] text-on-surface-variant">vs last Q</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Pending Approvals -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/approvals'">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pending Approvals</span>
            <div class="icon-circle bg-tertiary-container/40">
              <span class="material-symbols-outlined text-tertiary text-lg">fact_check</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">
              ${e} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-warning text-[10px]">
                ● 4 High Priority
              </span>
              <span class="text-[11px] text-on-surface-variant">requires VP sign-off</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Active Quotations -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/quotations'">
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
              <span class="badge badge-success text-[10px] flex items-center gap-1">
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

        <!-- Right 1/3: Interactive Deals by Stage Donut -->
        <div class="lg:col-span-4 card card-extruded flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-on-surface">Deals by Stage</h2>
            <p class="text-xs text-on-surface-variant">Current pipeline volume distribution</p>
          </div>

          <!-- Interactive SVG Donut Graphic with hoverable slices & clean center text -->
          <div class="flex items-center justify-center my-4 relative" id="deals-donut-container">
            <!-- Tooltip formatted exactly as requested -->
            <div id="donut-tooltip" class="donut-tooltip">
              <div class="font-bold text-xs" id="tt-stage">Executive Approved</div>
              <div class="text-[11px] text-on-surface-variant" id="tt-deals">18 deals</div>
              <div class="font-bold text-[11px] text-primary" id="tt-percent">35%</div>
            </div>

            <div class="relative w-[140px] h-[140px] flex items-center justify-center">
              <svg class="w-[140px] h-[140px]" viewBox="0 0 160 160">
                <defs>
                  <filter id="center-cutout-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2.5" flood-color="#a8b5a0" flood-opacity="0.3" />
                  </filter>
                </defs>

                <!-- Base Track -->
                <circle cx="80" cy="80" r="56" fill="none" stroke="#eefee6" stroke-width="24" />

                <!-- Group rotated so slices start at 12 o'clock -->
                <g transform="rotate(-90 80 80)">
                  <!-- 1. Draft Phase: 15% (7 deals) - #a8b5a0 -->
                  <circle
                    class="donut-slice"
                    id="slice-draft"
                    cx="80" cy="80" r="56"
                    fill="none"
                    stroke="#a8b5a0"
                    stroke-width="24"
                    stroke-dasharray="52.78 299.08"
                    stroke-dashoffset="0"
                    data-stage="Draft Phase"
                    data-deals="7 deals"
                    data-percent="15%"
                    data-count="7"
                    data-color="#a8b5a0"
                  />

                  <!-- 2. In Legal Review: 25% (13 deals) - #7a5826 -->
                  <circle
                    class="donut-slice"
                    id="slice-review"
                    cx="80" cy="80" r="56"
                    fill="none"
                    stroke="#7a5826"
                    stroke-width="24"
                    stroke-dasharray="87.96 263.9"
                    stroke-dashoffset="-52.78"
                    data-stage="In Legal Review"
                    data-deals="13 deals"
                    data-percent="25%"
                    data-count="13"
                    data-color="#7a5826"
                  />

                  <!-- 3. Executive Approved: 35% (18 deals) - #566250 -->
                  <circle
                    class="donut-slice"
                    id="slice-approved"
                    cx="80" cy="80" r="56"
                    fill="none"
                    stroke="#566250"
                    stroke-width="24"
                    stroke-dasharray="123.15 228.71"
                    stroke-dashoffset="-140.74"
                    data-stage="Executive Approved"
                    data-deals="18 deals"
                    data-percent="35%"
                    data-count="18"
                    data-color="#566250"
                  />

                  <!-- 4. Fulfillment / Active: 25% (12 deals) - #8c9a84 -->
                  <circle
                    class="donut-slice"
                    id="slice-fulfillment"
                    cx="80" cy="80" r="56"
                    fill="none"
                    stroke="#8c9a84"
                    stroke-width="24"
                    stroke-dasharray="87.96 263.9"
                    stroke-dashoffset="-263.89"
                    data-stage="Fulfillment / Active"
                    data-deals="12 deals"
                    data-percent="25%"
                    data-count="12"
                    data-color="#8c9a84"
                  />
                </g>

                <!-- Center Hole Cutout -->
                <circle cx="80" cy="80" r="44" fill="#ffffff" filter="url(#center-cutout-shadow)" />
              </svg>

              <!-- Center Text: Clean, balanced 2-line hierarchy -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-2">
                <span id="donut-center-val" class="text-2xl font-bold font-mono text-on-surface leading-none transition-all">50</span>
                <span id="donut-center-lbl" class="text-xs font-semibold text-on-surface-variant transition-colors mt-1">Total Deals</span>
              </div>
            </div>
          </div>

          <!-- Existing Stage Breakdown List -->
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Draft Phase">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-surface-variant" style="background-color: #a8b5a0;"></span> Draft Phase
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">15% (7)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="In Legal Review">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container" style="background-color: #7a5826;"></span> In Legal Review
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">25% (13)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Executive Approved">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-primary" style="background-color: #566250;"></span> Executive Approved
              </span>
              <span class="font-mono font-semibold text-on-surface-variant">35% (18)</span>
            </div>
            <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="Fulfillment / Active">
              <span class="flex items-center gap-2 text-on-surface">
                <span class="w-2.5 h-2.5 rounded-full bg-secondary" style="background-color: #8c9a84;"></span> Fulfillment / Active
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

          <!-- Existing Event Filter Buttons -->
          <div class="flex items-center gap-2">
            <button type="button" id="btn-filter-all" class="btn btn-secondary text-xs py-1 px-3 active">All Events</button>
            <button type="button" id="btn-filter-approvals" class="btn btn-secondary text-xs py-1 px-3">Approvals Only</button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="activity-table">
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
            <tbody id="activity-tbody">
              ${m}
              <tr id="activity-empty-row" class="hidden">
                <td colspan="6" class="py-6 text-center text-xs text-on-surface-variant">
                  No approval-related activity found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-2 border-t border-surface-container-high/60 text-xs text-on-surface-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">sensors</span>
            <span>Continuous sync active: 18 compliance hooks monitored in real time</span>
          </div>
          <!-- Download Full Audit Trail (.CSV) -->
          <button type="button" class="text-primary hover:underline text-xs font-semibold" id="btn-dl-audit">
            Download Full Audit Trail (.CSV)
          </button>
        </div>
      </div>
    </div>
  `}async function K(){try{const[a,s]=await Promise.all([c.get("/dashboard/summary").catch(()=>({})),c.get("/quotations").catch(()=>[])]);return{summary:a,quotations:s}}catch{return{summary:{},quotations:[]}}}function J(){const a=document.getElementById("btn-new-deal-dash");a&&a.addEventListener("click",()=>{window.location.hash="#/quotation-detail"});const s=document.getElementById("btn-quarter-toggle"),i=document.getElementById("quarter-dropdown-menu"),n=document.getElementById("current-quarter-label"),e=document.getElementById("quarter-chevron");s&&i&&(s.addEventListener("click",p=>{p.stopPropagation(),i.classList.contains("show")?(i.classList.remove("show"),e.style.transform="rotate(0deg)"):(i.classList.add("show"),e.style.transform="rotate(180deg)")}),document.querySelectorAll(".quarter-menu-item").forEach(p=>{p.addEventListener("click",()=>{document.querySelectorAll(".quarter-menu-item").forEach(b=>b.classList.remove("selected")),p.classList.add("selected"),n&&(n.textContent=p.getAttribute("data-label")),i.classList.remove("show"),e&&(e.style.transform="rotate(0deg)")})}),document.addEventListener("click",p=>{p.target.closest("#quarter-selector-wrapper")||(i.classList.remove("show"),e&&(e.style.transform="rotate(0deg)"))}));const t=document.getElementById("donut-center-val"),r=document.getElementById("donut-center-lbl"),o=document.getElementById("donut-tooltip"),m=document.getElementById("tt-stage"),l=document.getElementById("tt-deals"),x=document.getElementById("tt-percent"),d=document.querySelectorAll(".donut-slice"),u=document.querySelectorAll(".legend-item");function v(p){d.forEach(b=>{if(b.getAttribute("data-stage")===p){b.classList.add("active-slice"),b.style.opacity="1";const $=b.getAttribute("data-deals"),_=b.getAttribute("data-count"),A=b.getAttribute("data-percent"),S=b.getAttribute("data-color");t&&(t.textContent=_,t.style.color=S),r&&(r.textContent=p,r.style.color=S),o&&m&&l&&x&&(m.textContent=p,l.textContent=$,x.textContent=A,o.classList.add("visible"))}else b.classList.remove("active-slice"),b.style.opacity="0.4"})}function f(){d.forEach(p=>{p.classList.remove("active-slice"),p.style.opacity="1"}),t&&(t.textContent="50",t.style.color="var(--color-on-surface)"),r&&(r.textContent="Total Deals",r.style.color="var(--color-on-surface-variant)"),o&&o.classList.remove("visible")}d.forEach(p=>{p.addEventListener("mouseenter",()=>{v(p.getAttribute("data-stage"))}),p.addEventListener("mouseleave",f)}),u.forEach(p=>{p.addEventListener("mouseenter",()=>{v(p.getAttribute("data-stage"))}),p.addEventListener("mouseleave",f)});const h=document.getElementById("btn-filter-all"),w=document.getElementById("btn-filter-approvals"),P=document.querySelectorAll(".activity-row"),I=document.getElementById("activity-empty-row");function q(p){let b=0;P.forEach(E=>{const $=E.getAttribute("data-is-approval")==="true";p==="all"||p==="approvals"&&$?(E.classList.remove("hidden"),b++):E.classList.add("hidden")}),I&&(b===0?I.classList.remove("hidden"):I.classList.add("hidden"))}h&&w&&(h.addEventListener("click",()=>{h.classList.add("active"),w.classList.remove("active"),q("all")}),w.addEventListener("click",()=>{w.classList.add("active"),h.classList.remove("active"),q("approvals")})),document.querySelectorAll(".btn-review-deal").forEach(p=>{p.addEventListener("click",b=>{const E=p.getAttribute("data-id");E&&(window.location.hash=`#/quotations/${E}`)})});const T=document.getElementById("btn-dl-audit");T&&T.addEventListener("click",()=>{const p=document.querySelectorAll(".activity-row"),b=[["Timestamp","Actor","Role","Customer / Organization","Deal Reference","Valuation","Status"]];p.forEach(S=>{const k=S.querySelectorAll("td");if(k.length>=5){const Q=k[0].innerText.trim(),B=k[1].querySelector(".font-bold"),j=k[1].querySelector(".text-on-surface-variant"),R=k[2].querySelector(".font-semibold"),N=k[2].querySelector(".font-mono"),U=k[3].innerText.trim(),G=k[4].innerText.replace("●","").trim();b.push([`"${Q}"`,`"${B?B.innerText.trim():""}"`,`"${j?j.innerText.trim():""}"`,`"${R?R.innerText.trim():""}"`,`"${N?N.innerText.trim():""}"`,`"${U}"`,`"${G}"`])}});const E=b.map(S=>S.join(",")).join(`
`),$=new Blob([E],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL($),A=document.createElement("a");A.setAttribute("href",_),A.setAttribute("download",`dealflow360_audit_trail_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(A),A.click(),document.body.removeChild(A),URL.revokeObjectURL(_)})}function Y(a=[]){const s=a.reduce((e,t)=>e+(t.total_amount||0),0),i=a.filter(e=>(e.status||"").toLowerCase().includes("pending")).length,n=a.length===0?`
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found. Click <strong>New Quotation +</strong> to generate your first deal.
        </td>
      </tr>
    `:a.map(e=>{let t="badge-primary";const r=(e.status||"").toLowerCase();return r.includes("approved")?t="badge-success":r.includes("pending")||r.includes("review")?t="badge-warning":r.includes("negotiat")?t="badge-info":r.includes("fulfilled")||r.includes("confirmed")?t="badge-success":r.includes("rejected")?t="badge-error":r.includes("draft")&&(t="badge-neutral"),`
          <tr class="table-row hover:bg-surface-container/50 transition-colors border-b border-surface-container-high/40">
            <td class="py-3 px-4 font-mono font-bold text-xs text-primary">
              <a href="#/quotations/${e.id}" class="hover:underline">${e.deal_reference||`DEAL-${e.id}`}</a>
            </td>
            <td class="py-3 px-4">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">${e.customer_name||"Customer"}</span>
                <span class="text-[10px] text-on-surface-variant">${e.customer_email||""}</span>
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="badge badge-neutral text-[10px]">${e.customer_tier||"Bronze"}</span>
            </td>
            <td class="py-3 px-4 font-mono font-bold text-xs text-on-surface">
              ₹${Number(e.total_amount||0).toLocaleString("en-IN")}
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${e.line_count||(e.lines?e.lines.length:0)} items
            </td>
            <td class="py-3 px-4">
              <span class="badge ${t}">${e.status||"Draft"}</span>
            </td>
            <td class="py-3 px-4 text-xs text-on-surface-variant">
              ${e.rep_name||"Eleanor Vance"}
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <a href="#/quotations/${e.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Edit / View Deal">
                  <span class="material-symbols-outlined text-sm">edit_note</span>
                  <span>View</span>
                </a>
                <a href="#/portal?id=${e.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal View">
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
            <div class="text-xl font-bold text-on-surface mt-1">${a.length} Deals</div>
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
  `}async function Z(){try{return await c.get("/quotations")}catch{return[]}}function X(){const a=document.getElementById("quote-search-input"),s=document.getElementById("quotations-table");a&&s&&a.addEventListener("input",n=>{const e=n.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{const o=r.textContent.toLowerCase();r.style.display=o.includes(e)?"":"none"})});const i=document.querySelectorAll("#quote-filter-tabs button");i.forEach(n=>{n.addEventListener("click",()=>{i.forEach(r=>r.classList.remove("active")),n.classList.add("active");const e=n.getAttribute("data-filter");s.querySelectorAll("tbody tr").forEach(r=>{if(e==="all")r.style.display="";else{const o=r.textContent;r.style.display=o.includes(e)?"":"none"}})})})}const C={show({title:a,content:s,onConfirm:i,confirmText:n="Confirm",cancelText:e="Cancel",showConfirm:t=!0}){const r=document.getElementById("df-modal-backdrop");r&&r.remove();const o=`
      <div id="df-modal-backdrop" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${a}</h3>
            <button type="button" class="modal-close-btn" id="df-modal-close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="modal-body">
            ${s}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="df-modal-cancel">${e}</button>
            ${t?`<button type="button" class="btn btn-primary" id="df-modal-confirm">${n}</button>`:""}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",o);const m=document.getElementById("df-modal-backdrop"),l=document.getElementById("df-modal-close"),x=document.getElementById("df-modal-cancel"),d=document.getElementById("df-modal-confirm"),u=()=>{m.classList.add("fade-out"),setTimeout(()=>m.remove(),200)};return l.addEventListener("click",u),x.addEventListener("click",u),m.addEventListener("click",v=>{v.target===m&&u()}),d&&i&&d.addEventListener("click",async()=>{d.disabled=!0,d.innerHTML='<span class="loading-spinner"></span> Processing...';try{await i()!==!1&&u()}catch(v){alert(v.message||"Action failed")}finally{d.disabled=!1,d.innerHTML=n}}),{close:u}}};function M(a={}){var d,u,v;const{quotation:s=null,products:i=[],customers:n=[]}=a,e=!s||!s.id,t=s||{id:0,deal_reference:"DEAL-NEW",customer_name:((d=n[0])==null?void 0:d.name)||"Acme Corp Global ERP",customer_email:((u=n[0])==null?void 0:u.email)||"procurement@acme.corp",customer_tier:((v=n[0])==null?void 0:v.tier)||"Gold",status:"Draft",lines:[]},r=!t.lines||t.lines.length===0?`
      <tr>
        <td colspan="7" class="text-center py-6 text-on-surface-variant text-xs">
          No line items added yet. Click <strong>Add Product Line +</strong> to populate this deal.
        </td>
      </tr>
    `:t.lines.map(f=>`
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
            ${e?"":`
              <button type="button" class="icon-btn text-error hover:bg-error-container/30 delete-line-btn" data-line-id="${f.id}" title="Remove Line">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            `}
          </td>
        </tr>
      `).join(""),o=t.lines?t.lines.reduce((f,h)=>f+(h.line_total||0),0):0,m=o;let l="badge-neutral";const x=(t.status||"").toLowerCase();return x.includes("approved")?l="badge-success":x.includes("pending")?l="badge-warning":x.includes("negotiat")?l="badge-info":(x.includes("fulfilled")||x.includes("confirmed"))&&(l="badge-success"),`
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
          ${e?"":`
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
            <span class="badge ${l} text-xs">${t.status||"Draft"}</span>
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
              <span class="text-xl font-bold font-mono text-primary">₹${Number(m).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}async function H(a){try{const[s,i,n]=await Promise.all([a?c.get(`/quotations/${a}`).catch(()=>null):null,c.get("/products").catch(()=>[]),c.get("/customers").catch(()=>[])]);return{quotation:s,products:i,customers:n}}catch{return{quotation:null,products:[],customers:[]}}}function F(a,s=[],i=[]){const n=document.getElementById("btn-add-line-modal");n&&n.addEventListener("click",()=>{const d=s.map(u=>`
        <option value="${u.id}">${u.name} — $${Number(u.base_price).toLocaleString()} (${u.category})</option>
      `).join("");C.show({title:"Add Product Line Item",content:`
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Select Product</label>
              <select id="modal-product-select" class="input-clay w-full text-xs">
                ${d||'<option value="1">Enterprise M&A CPQ Core — ₹120,000</option>'}
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity</label>
              <input id="modal-product-qty" type="number" min="1" value="1" class="input-clay w-full text-xs" />
            </div>
          </div>
        `,confirmText:"Add to Quotation",onConfirm:async()=>{var f;const u=parseInt(document.getElementById("modal-product-select").value,10),v=parseFloat(document.getElementById("modal-product-qty").value)||1;if(a)await c.post(`/quotations/${a}/lines`,{product_id:u,quantity:v}),window.location.reload();else{const h=((f=i[0])==null?void 0:f.id)||1,w=await c.post("/quotations",{customer_id:h});await c.post(`/quotations/${w.id}/lines`,{product_id:u,quantity:v}),window.location.hash=`#/quotations/${w.id}`}return!0}})}),document.querySelectorAll(".delete-line-btn").forEach(d=>{d.addEventListener("click",async()=>{const u=d.getAttribute("data-line-id");confirm("Remove this line item from quotation?")&&(await c.delete(`/quotations/${a}/lines/${u}`),window.location.reload())})});const e=async d=>{await c.put(`/quotations/${a}`,{status:d}),window.location.reload()},t=document.getElementById("btn-submit-approval");t&&t.addEventListener("click",()=>e("Pending Approval"));const r=document.getElementById("btn-approve-quote");r&&r.addEventListener("click",()=>e("Approved"));const o=document.getElementById("btn-reject-quote");o&&o.addEventListener("click",()=>e("Rejected"));const m=document.getElementById("btn-send-portal");m&&m.addEventListener("click",()=>e("Under Negotiation"));const l=document.getElementById("btn-confirm-quote");l&&l.addEventListener("click",()=>e("Confirmed"));const x=document.getElementById("btn-fulfill-quote");x&&x.addEventListener("click",()=>e("Fulfilled"))}function tt(a=[]){const s=a.filter(e=>(e.status||"").toLowerCase().includes("pending")||(e.status||"").toLowerCase().includes("draft")),i=s.length>0?s:[{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",customer_tier:"Gold",total_amount:34e4,rep_name:"Marcus Hayes",discount:"18%",limit:"15%",reason:"Multi-region deployment incentive requested for 3-year upfront commitment."},{id:8488,deal_reference:"DEAL-8488",customer_name:"Starlight Pharma Logistics",customer_tier:"Silver",total_amount:115e4,rep_name:"Sarah Lin",discount:"14%",limit:"10%",reason:"Competitive displacement against legacy SAP stack."},{id:8461,deal_reference:"DEAL-8461",customer_name:"Apex Financial Cloud Vault",customer_tier:"Bronze",total_amount:475e3,rep_name:"David Kim",discount:"8%",limit:"5%",reason:"Volume licensing ramp-up structure."}],n=i.map(e=>`
    <div class="card card-extruded space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
        <div class="flex items-center gap-3">
          <span class="font-mono font-bold text-sm text-primary">${e.deal_reference||`DEAL-${e.id}`}</span>
          <span class="badge badge-warning text-[10px]">VP Sign-off Required</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-on-surface-variant">Contract Valuation</span>
          <div class="font-mono font-bold text-base text-on-surface">$${Number(e.total_amount||34e4).toLocaleString()}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-on-surface-variant block mb-1">Customer Account</span>
          <div class="font-bold text-on-surface">${e.customer_name}</div>
          <span class="badge badge-neutral text-[10px] mt-1">${e.customer_tier||"Gold"} Tier</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Discount Threshold</span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-error">${e.discount||"15%"} Requested</span>
            <span class="text-on-surface-variant">(Max allowed: ${e.limit||"10%"})</span>
          </div>
          <span class="text-[10px] text-error font-semibold mt-1 block">Tier Exception Triggered</span>
        </div>
        <div>
          <span class="text-on-surface-variant block mb-1">Sales Representative</span>
          <div class="font-bold text-on-surface">${e.rep_name||"Eleanor Vance"}</div>
          <span class="text-[10px] text-on-surface-variant">Enterprise Mid-Market</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant">
        <strong class="text-on-surface">Escalation Note:</strong>
        ${e.reason||"Requested commercial discount exceeding sales representative discretion for multi-year upfront commitment."}
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high/60">
        <a href="#/quotations/${e.id}" class="btn btn-secondary text-xs">
          <span class="material-symbols-outlined text-sm">visibility</span>
          Inspect Line Items
        </a>
        <button type="button" class="btn btn-secondary text-xs text-error reject-approval-btn" data-id="${e.id}">
          <span class="material-symbols-outlined text-sm">close</span>
          Reject
        </button>
        <button type="button" class="btn btn-primary text-xs approve-deal-btn" data-id="${e.id}">
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
  `}async function et(){try{return await c.get("/quotations")}catch{return[]}}function at(){document.querySelectorAll(".approve-deal-btn").forEach(a=>{a.addEventListener("click",async()=>{const s=a.getAttribute("data-id");try{await c.put(`/quotations/${s}`,{status:"Approved"}),alert(`Deal #${s} has been successfully approved.`),window.location.reload()}catch(i){alert(i.message||"Approval failed")}})}),document.querySelectorAll(".reject-approval-btn").forEach(a=>{a.addEventListener("click",async()=>{const s=a.getAttribute("data-id");if(confirm(`Reject quotation #${s}?`))try{await c.put(`/quotations/${s}`,{status:"Rejected"}),alert(`Deal #${s} has been rejected.`),window.location.reload()}catch(i){alert(i.message||"Action failed")}})})}function st(a=[]){return`
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
        ${(a.length>0?a:[{id:1,name:"Enterprise Cloud Orchestration Node",sku:"SKU-CLD-900",category:"Cloud Infrastructure",base_price:18500,description:"High-throughput container runtime cluster with 99.99% uptime SLA."},{id:2,name:"Quantum Edge Gateway Terminal",sku:"SKU-HDW-410",category:"Hardware",base_price:45e3,description:"Ruggedized hardware cryptographic accelerator for zero-trust branch networks."},{id:3,name:"Enterprise M&A CPQ Core Engine",sku:"SKU-SFT-101",category:"Software & SaaS",base_price:12e4,description:"Complete dealflow, quotation rules, and multitenancy pricing engine."},{id:4,name:"Architecture Consulting & Migration SLA",sku:"SKU-SRV-050",category:"Professional Services",base_price:35e3,description:"Dedicated enterprise solutions architect team with 24/7 priority support."},{id:5,name:"AI Compliance & Anomaly Sentinel",sku:"SKU-SFT-202",category:"Software & SaaS",base_price:64e3,description:"Continuous transaction monitoring for antitrust, sanction, and margin slippage."},{id:6,name:"High-Density Terabit Switch Blade",sku:"SKU-HDW-880",category:"Hardware",base_price:82e3,description:"Carrier-grade spine switch with sub-microsecond packet latency."}]).map(n=>`
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
  `}async function nt(){try{return await c.get("/products")}catch{return[]}}function it(){const a=document.getElementById("product-search-input"),s=document.querySelectorAll(".product-card");a&&a.addEventListener("input",n=>{const e=n.target.value.toLowerCase();s.forEach(t=>{const r=t.textContent.toLowerCase();t.style.display=r.includes(e)?"":"none"})});const i=document.querySelectorAll("#product-category-filters button");i.forEach(n=>{n.addEventListener("click",()=>{i.forEach(t=>t.classList.remove("active")),n.classList.add("active");const e=n.getAttribute("data-cat");s.forEach(t=>{if(e==="all")t.style.display="";else{const r=t.getAttribute("data-category");t.style.display=r.includes(e)?"":"none"}})})}),document.querySelectorAll(".add-to-deal-btn").forEach(n=>{n.addEventListener("click",async()=>{const e=n.getAttribute("data-product-id"),t=n.getAttribute("data-product-name");C.show({title:`Add ${t} to Quotation`,content:`
          <div class="space-y-3 text-xs">
            <p class="text-on-surface-variant">Configure quantity to append this SKU to an active deal:</p>
            <div>
              <label class="block font-semibold mb-1 text-on-surface-variant">Quantity Units</label>
              <input type="number" id="quick-add-qty" min="1" value="1" class="input-clay w-full" />
            </div>
          </div>
        `,confirmText:"Generate Deal",onConfirm:async()=>{const r=parseFloat(document.getElementById("quick-add-qty").value)||1,o=await c.post("/quotations",{customer_id:1});return await c.post(`/quotations/${o.id}/lines`,{product_id:parseInt(e,10),quantity:r}),window.location.hash=`#/quotations/${o.id}`,!0}})})})}function rt(a=[]){return`
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
              ${(a.length>0?a:[{id:1,name:"Standard Enterprise Commercial",currency:"INR",is_active:!0,description:"Default global commercial price schedule with standard volume discounts."},{id:2,name:"Tier-1 Strategic Partner Rate Card",currency:"INR",is_active:!0,description:"Discounted baseline for accredited M&A integration channels."},{id:3,name:"Public Sector & FedRAMP Schedule",currency:"INR",is_active:!0,description:"Statutory capped rate matrix for government and institutional accounts."}]).map(n=>`
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
  `}async function ot(){try{return await c.get("/price-lists")}catch{return[]}}function ct(){const a=document.getElementById("btn-add-pricelist");a&&a.addEventListener("click",()=>{C.show({title:"New Commercial Price Schedule",content:`
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
        `,confirmText:"Create Schedule",onConfirm:async()=>{const s=document.getElementById("pl-name-input").value.trim(),i=document.getElementById("pl-currency-input").value.trim(),n=document.getElementById("pl-desc-input").value.trim();if(!s)throw new Error("Schedule name is required");return await c.post("/price-lists",{name:s,currency:i,description:n}),window.location.reload(),!0}})})}function lt(a=[]){const s=a.length>0?a:[{id:1,name:"Acme Corp Global ERP",email:"procurement@acmeww.com",tier:"Gold",created_at:"2025-01-15"},{id:2,name:"Starlight Pharma Logistics",email:"operations@starlightpharma.com",tier:"Silver",created_at:"2025-02-01"},{id:3,name:"Helios Solar Microgrid Infra",email:"infrastructure@heliosmicro.io",tier:"Gold",created_at:"2025-02-18"},{id:4,name:"Apex Financial Cloud Vault",email:"finops@apexvault.com",tier:"Bronze",created_at:"2025-03-02"}],i=s.map(n=>{let e="badge-primary";const t=(n.tier||"Bronze").toLowerCase();return t.includes("gold")?e="badge-warning":t.includes("silver")&&(e="badge-neutral"),`
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
          <span class="badge ${e} text-[10px] font-bold">${n.tier||"Bronze"}</span>
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
  `}async function dt(){try{return await c.get("/customers")}catch{return[]}}function pt(){const a=document.getElementById("cust-search-input"),s=document.getElementById("customers-table");a&&s&&a.addEventListener("input",n=>{const e=n.target.value.toLowerCase();s.querySelectorAll("tbody tr").forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(e)?"":"none"})});const i=document.getElementById("btn-add-customer");i&&i.addEventListener("click",()=>{C.show({title:"Add Enterprise Client Account",content:`
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
        `,confirmText:"Create Account",onConfirm:async()=>{const n=document.getElementById("new-cust-name").value.trim(),e=document.getElementById("new-cust-email").value.trim(),t=document.getElementById("new-cust-tier").value;if(!n||!e)throw new Error("Company name and email are required");return await c.post("/customers",{name:n,email:e,tier:t}),window.location.reload(),!0}})}),document.querySelectorAll(".create-deal-for-cust-btn").forEach(n=>{n.addEventListener("click",async()=>{const e=parseInt(n.getAttribute("data-cust-id"),10);try{const t=await c.post("/quotations",{customer_id:e});window.location.hash=`#/quotations/${t.id}`}catch(t){alert(t.message||"Failed to create quotation")}})})}function ut(a={}){const{quotation:s=null}=a,i=s||{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",total_amount:34e4,status:"Under Negotiation",lines:[{product_name:"Enterprise Cloud Orchestration Node",quantity:2,unit_price:12e4,line_total:24e4},{product_name:"Architecture Consulting & Migration SLA",quantity:1,unit_price:1e5,line_total:1e5}]},n=["Confirmed","Fulfilled"].includes(i.status);return`
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
                  ${(i.lines||[]).map(e=>`
                    <tr class="table-row border-b border-surface-container-high/40 text-xs">
                      <td class="py-3 px-4 font-bold text-on-surface">${e.product_name||`Item #${e.product_id}`}</td>
                      <td class="py-3 px-4 font-mono">${e.quantity}</td>
                      <td class="py-3 px-4 font-mono">₹${Number(e.unit_price).toLocaleString("en-IN")}</td>
                      <td class="py-3 px-4 font-mono font-bold text-primary text-right">₹${Number(e.line_total).toLocaleString("en-IN")}</td>
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
  `}async function mt(a){try{const s=await c.get("/quotations"),i=a?s.find(n=>n.id===parseInt(a,10)):s[0];return i?{quotation:await c.get(`/quotations/${i.id}`).catch(()=>i)}:{quotation:null}}catch{return{quotation:null}}}function xt(a){const s=(a==null?void 0:a.id)||8492,i=document.getElementById("btn-portal-accept");i&&i.addEventListener("click",async()=>{if(confirm("Confirm digital signature and ratify this commercial agreement?"))try{await c.put(`/quotations/${s}`,{status:"Confirmed"}),alert("Quotation digitally signed and ratified! Deal status updated to Confirmed."),window.location.reload()}catch(r){alert(r.message||"Signature failed")}});const n=document.getElementById("btn-send-portal-msg"),e=document.getElementById("portal-reply-text"),t=document.getElementById("portal-messages-list");n&&e&&t&&n.addEventListener("click",()=>{const r=e.value.trim();if(!r)return;const o=`
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${r}</p>
        </div>
      `;t.insertAdjacentHTML("beforeend",o),e.value="",t.scrollTop=t.scrollHeight})}function ft(a={}){const{warehouses:s=[],quotations:i=[]}=a,n=s.length>0?s:[{id:1,name:"Equinix NY4 North America Hub",code:"WH-US-EAST",location:"Secaucus, NJ",capacity:"94.2% Available"},{id:2,name:"Frankfurt FRA1 European Gateway",code:"WH-EU-CENTRAL",location:"Frankfurt, DE",capacity:"88.0% Available"},{id:3,name:"Singapore SG1 APAC Distribution",code:"WH-APAC-SG",location:"Jurong, SG",capacity:"91.5% Available"}],e=[{sku:"SKU-HDW-410",name:"Quantum Edge Gateway Terminal",req:10,wh1:"NY4 (8)",wh2:"FRA1 (2)",backorder:0,status:"Allocated"},{sku:"SKU-HDW-880",name:"High-Density Terabit Switch Blade",req:4,wh1:"NY4 (4)",wh2:"—",backorder:0,status:"Ready to Pack"},{sku:"SKU-CLD-900",name:"Enterprise Cloud Orchestration Node",req:2,wh1:"Cloud Provisioned",wh2:"—",backorder:0,status:"Fulfilled"}];return`
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
        ${n.map(r=>`
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
              ${e.map(r=>`
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
  `}async function bt(){try{const[a,s]=await Promise.all([c.get("/warehouses").catch(()=>[]),c.get("/quotations").catch(()=>[])]);return{warehouses:a,quotations:s}}catch{return{warehouses:[],quotations:[]}}}function vt(){const a=document.getElementById("btn-commit-fulfillment");a&&a.addEventListener("click",()=>{alert("Fulfillment manifest confirmed! Warehouse pick & pack notifications generated.")});const s=document.getElementById("btn-suggest-split");s&&s.addEventListener("click",()=>{alert("Auto-Split Algorithm computed: 80% from Equinix NY4, 20% from Frankfurt FRA1 with 0 backorders.")})}function gt(a=[]){const s=a.length>0?a:[{id:1041,number:"INV-1041",deal_ref:"DEAL-8492",customer:"Acme Corp Global ERP",amount:34e4,due:"2025-10-15",status:"Paid"},{id:1042,number:"INV-1042",deal_ref:"DEAL-8488",customer:"Starlight Pharma Logistics",amount:115e4,due:"2025-10-20",status:"Pending"},{id:1043,number:"INV-1043",deal_ref:"DEAL-8475",customer:"Helios Solar Microgrid Infra",amount:89e4,due:"2025-09-30",status:"Overdue"},{id:1044,number:"INV-1044",deal_ref:"DEAL-8461",customer:"Apex Financial Cloud Vault",amount:475e3,due:"2025-10-25",status:"Pending"}],i=s.reduce((t,r)=>t+(r.amount||0),0),n=s.filter(t=>(t.status||"").toLowerCase()==="paid").length,e=s.map(t=>{let r="badge-warning";const o=(t.status||"").toLowerCase();return o==="paid"?r="badge-success":o==="overdue"&&(r="badge-error"),`
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
              ${e}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function yt(){try{return await c.get("/payments/invoices").catch(()=>[])}catch{return[]}}function ht(){document.querySelectorAll(".preview-invoice-btn").forEach(a=>{a.addEventListener("click",()=>{const s=a.getAttribute("data-num"),i=a.getAttribute("data-customer"),n=Number(a.getAttribute("data-amount")||0).toLocaleString(),e=a.getAttribute("data-status");C.show({title:`Tax Invoice Preview — ${s}`,content:`
          <div class="space-y-4 text-xs">
            <div class="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
              <div>
                <span class="text-[10px] text-on-surface-variant block uppercase">Billed To</span>
                <strong class="text-on-surface text-sm">${i}</strong>
                <div class="text-on-surface-variant text-[11px]">100 Enterprise Blvd, Suite 400</div>
              </div>
              <div class="text-right">
                <span class="badge ${e==="Paid"?"badge-success":"badge-warning"} text-xs">${e}</span>
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
                    <td class="py-2 px-3 font-mono font-bold text-right">₹${n}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="p-3 rounded-xl bg-surface-container-lowest flex justify-between items-center font-bold text-sm">
              <span>Total Payable</span>
              <span class="text-primary font-mono">₹${n}</span>
            </div>

            <p class="text-[10px] text-on-surface-variant text-center">
              Wire instructions: Chase Manhattan Bank • SWIFT: CHASUS33 • ACCT: 9820-4102-339
            </p>
          </div>
        `,confirmText:"Download PDF",cancelText:"Close",onConfirm:()=>(alert("Generating authenticated cryptographic PDF receipt..."),!0)})})}),document.querySelectorAll(".pay-invoice-btn").forEach(a=>{a.addEventListener("click",async()=>{const s=a.getAttribute("data-id");try{await c.post(`/payments/invoices/${s}/pay`,{}),alert(`Invoice #${s} marked as Paid!`),window.location.reload()}catch(i){alert(i.message||"Payment simulation failed")}})})}function wt(a=[]){return`
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
        ${(a.length>0?a:[{id:1,name:"Enterprise M&A Platform Core",cadence:"Annual",price:12e4,description:"Unlimited deals, SOC2 audit telemetry, custom ERP connectors and dedicated cluster."},{id:2,name:"Deal Desk Executive Seat",cadence:"Monthly",price:350,description:"Individual deal builder, discount escalation approval authority, and audit rights."},{id:3,name:"Mission-Critical 24/7 Support SLA",cadence:"Annual",price:45e3,description:"Sub-15 minute incident response with named technical account manager."}]).map(n=>`
    <div class="card card-extruded flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between">
          <span class="badge badge-primary text-[10px]">${n.cadence||"Annual"}</span>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-base">sync</span>
          </div>
        </div>
        <h3 class="text-base font-bold text-on-surface mt-2">${n.name}</h3>
        <p class="text-xs text-on-surface-variant mt-1">${n.description||"Configured recurring license plan"}</p>
      </div>

      <div class="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block uppercase">Billing Rate</span>
          <span class="font-mono font-bold text-lg text-primary">₹${Number(n.price).toLocaleString("en-IN")}</span>
          <span class="text-[10px] text-on-surface-variant">/ ${n.cadence==="Monthly"?"mo":"yr"}</span>
        </div>
        <button type="button" class="btn btn-secondary text-xs py-1.5 px-3 subscribe-plan-btn" data-plan-id="${n.id}" data-plan-name="${n.name}">
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
  `}async function Et(){try{return await c.get("/subscriptions/plans").catch(()=>[])}catch{return[]}}function kt(){const a=document.getElementById("prorate-seats"),s=document.getElementById("prorate-days"),i=document.getElementById("prorate-result"),n=()=>{if(!a||!s||!i)return;const t=parseFloat(a.value)||0,r=parseFloat(s.value)||0,m=4200/365*r*t;i.textContent=`₹${m.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`};a&&a.addEventListener("input",n),s&&s.addEventListener("input",n);const e=document.getElementById("btn-add-plan");e&&e.addEventListener("click",()=>{C.show({title:"New Subscription Plan",content:`
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
        `,confirmText:"Create Plan",onConfirm:async()=>{const t=document.getElementById("plan-name-in").value.trim(),r=document.getElementById("plan-cadence-in").value,o=parseFloat(document.getElementById("plan-price-in").value)||0;if(!t)throw new Error("Plan name required");return await c.post("/subscriptions/plans",{name:t,cadence:r,price:o}),window.location.reload(),!0}})})}function At(a={}){const{stalled:s=[],reports:i=null}=a,n=s.length>0?s:[{id:8461,ref:"DEAL-8461",customer:"Apex Financial Cloud Vault",stage:"Draft Phase",days:18,risk:"High — Rep Inactive 12 Days"},{id:8440,ref:"DEAL-8440",customer:"Vanguard Aerospace Systems",stage:"Legal Terms Review",days:24,risk:"Medium — Redlines in Queue"},{id:8425,ref:"DEAL-8425",customer:"Nordic Marine Telecom",stage:"Pending Approval",days:9,risk:"Low — Escalation Pending VP"}];return`
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
              ${n.map(e=>`
                <tr class="table-row border-b border-surface-container-high/40 text-xs hover:bg-surface-container/40">
                  <td class="py-3 px-4 font-mono font-bold text-primary">
                    <a href="#/quotations/${e.id||8461}" class="hover:underline">${e.ref||`DEAL-${e.id}`}</a>
                  </td>
                  <td class="py-3 px-4 font-bold text-on-surface">${e.customer}</td>
                  <td class="py-3 px-4 text-on-surface-variant">${e.stage}</td>
                  <td class="py-3 px-4 font-mono font-bold text-error">${e.days} Days</td>
                  <td class="py-3 px-4">
                    <span class="badge badge-warning text-[10px]">${e.risk}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="btn btn-secondary text-xs py-1 px-2.5 nudge-rep-btn" data-id="${e.id||8461}">
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
  `}async function St(){try{const[a,s]=await Promise.all([c.get("/reports/quotations").catch(()=>null),c.get("/deal_health/stalled").catch(()=>[])]);return{reports:a,stalled:s}}catch{return{reports:null,stalled:[]}}}function Ct(){const a=document.getElementById("btn-export-csv");a&&a.addEventListener("click",()=>{window.open("/api/v1/reports/quotations/export/csv","_blank")});const s=document.getElementById("btn-export-pdf");s&&s.addEventListener("click",()=>{alert("Compiling executive board briefing deck (PDF format)...")}),document.querySelectorAll(".nudge-rep-btn").forEach(i=>{i.addEventListener("click",()=>{const n=i.getAttribute("data-id");alert(`Automated SLA notification dispatch sent to assigned sales rep for Deal #${n}.`)})})}class $t{constructor(){this.appEl=document.getElementById("app"),window.addEventListener("hashchange",()=>this.handleRoute())}init(){!window.location.hash||window.location.hash==="#/"?window.location.hash=L.isAuthenticated()?"#/dashboard":"#/login":this.handleRoute()}parseHash(){const s=window.location.hash.slice(1)||"/login",[i]=s.split("?"),e=(i.startsWith("/")?i.slice(1):i).split("/"),t=e[0]||"dashboard",r=e[1]||null,o=new URLSearchParams(window.location.hash.split("?")[1]||"");return{route:t,param:r,query:o}}showLoading(){this.appEl.innerHTML=`
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `}async handleRoute(){const{route:s,param:i,query:n}=this.parseHash(),e=L.isAuthenticated();if(!e&&s!=="login"&&s!=="portal"){window.location.hash="#/login";return}if(e&&s==="login"){window.location.hash="#/dashboard";return}switch(window.scrollTo(0,0),s){case"login":{this.appEl.innerHTML=O(),W();break}case"dashboard":{this.showLoading();const t=await K();this.appEl.innerHTML=`
          ${g("dashboard")}
          <main class="main-content">${z(t)}</main>
        `,y(),J();break}case"quotations":{if(i){this.showLoading();const t=await H(i);this.appEl.innerHTML=`
            ${g("quotations")}
            <main class="main-content">${M(t)}</main>
          `,y(),F(i,t.products,t.customers)}else{this.showLoading();const t=await Z();this.appEl.innerHTML=`
            ${g("quotations")}
            <main class="main-content">${Y(t)}</main>
          `,y(),X()}break}case"quotation-detail":{this.showLoading();const t=i||n.get("id"),r=await H(t);this.appEl.innerHTML=`
          ${g("quotations")}
          <main class="main-content">${M(r)}</main>
        `,y(),F(t,r.products,r.customers);break}case"approvals":{this.showLoading();const t=await et();this.appEl.innerHTML=`
          ${g("approvals")}
          <main class="main-content">${tt(t)}</main>
        `,y(),at();break}case"products":{this.showLoading();const t=await nt();this.appEl.innerHTML=`
          ${g("products")}
          <main class="main-content">${st(t)}</main>
        `,y(),it();break}case"pricing":case"pricing-rules":{this.showLoading();const t=await ot();this.appEl.innerHTML=`
          ${g("pricing")}
          <main class="main-content">${rt(t)}</main>
        `,y(),ct();break}case"customers":{this.showLoading();const t=await dt();this.appEl.innerHTML=`
          ${g("customers")}
          <main class="main-content">${lt(t)}</main>
        `,y(),pt();break}case"portal":{this.showLoading();const t=i||n.get("id"),r=await mt(t);this.appEl.innerHTML=`
          ${g("portal")}
          <main class="main-content">${ut(r)}</main>
        `,y(),xt(r.quotation);break}case"fulfillment":{this.showLoading();const t=await bt();this.appEl.innerHTML=`
          ${g("fulfillment")}
          <main class="main-content">${ft(t)}</main>
        `,y(),vt();break}case"invoices":{this.showLoading();const t=await yt();this.appEl.innerHTML=`
          ${g("invoices")}
          <main class="main-content">${gt(t)}</main>
        `,y(),ht();break}case"subscriptions":{this.showLoading();const t=await Et();this.appEl.innerHTML=`
          ${g("subscriptions")}
          <main class="main-content">${wt(t)}</main>
        `,y(),kt();break}case"reports":{this.showLoading();const t=await St();this.appEl.innerHTML=`
          ${g("reports")}
          <main class="main-content">${At(t)}</main>
        `,y(),Ct();break}default:{window.location.hash="#/dashboard";break}}}}document.addEventListener("DOMContentLoaded",()=>{new $t().init()});
