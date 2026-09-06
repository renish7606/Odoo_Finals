(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const Y={},st=(Y==null?void 0:Y.VITE_API_BASE_URL)||"/api/v1";class G extends Error{constructor(e,n,r){super(e),this.name="ApiError",this.status=n,this.data=r}}const u={getToken(){return localStorage.getItem("dealflow_token")},setToken(t){t?localStorage.setItem("dealflow_token",t):localStorage.removeItem("dealflow_token")},getHeaders(t={}){const e={"Content-Type":"application/json",...t},n=this.getToken();return n&&(e.Authorization=`Bearer ${n}`),e},async request(t,e={}){const n=`${st}${t}`,r=this.getHeaders(e.headers),s={...e,headers:r};s.body&&typeof s.body=="object"&&!(s.body instanceof FormData)&&(s.body=JSON.stringify(s.body));try{const a=await fetch(n,s);if(a.status===401&&!t.includes("/auth/login"))throw this.setToken(null),localStorage.removeItem("dealflow_user"),window.location.hash="#/login",new G("Session expired. Please sign in again.",401,null);if(a.status===204)return null;const i=a.headers.get("content-type")||"";let l=null;if(i.includes("application/json")?l=await a.json():l=await a.text(),!a.ok){const o=(l==null?void 0:l.detail)||(l==null?void 0:l.message)||`Request failed with status ${a.status}`;throw new G(o,a.status,l)}return l}catch(a){throw a instanceof G?a:new G(a.message||"Network connection failed",0,null)}},get(t,e){let n=t;if(e){const r=new URLSearchParams(e).toString();r&&(n+=`?${r}`)}return this.request(n,{method:"GET"})},post(t,e){return this.request(t,{method:"POST",body:e})},put(t,e){return this.request(t,{method:"PUT",body:e})},patch(t,e){return this.request(t,{method:"PATCH",body:e})},delete(t){return this.request(t,{method:"DELETE"})},async downloadFile(t,e){const n=`${st}${t}`,r=this.getToken(),s=r?{Authorization:`Bearer ${r}`}:{},a=await fetch(n,{headers:s});if(!a.ok)throw new Error(`Download failed with status ${a.status}`);const i=await a.blob(),l=window.URL.createObjectURL(i),o=document.createElement("a");o.href=l,o.download=e||"document.pdf",document.body.appendChild(o),o.click(),o.remove(),window.URL.revokeObjectURL(l)}},S={getUser(){try{const t=localStorage.getItem("dealflow_user");return t?JSON.parse(t):null}catch{return null}},setUser(t){t?localStorage.setItem("dealflow_user",JSON.stringify(t)):localStorage.removeItem("dealflow_user")},isAuthenticated(){return!!u.getToken()},async login(t,e,n){const r=await u.post("/auth/login",{email:t,password:e});if(r.access_token){u.setToken(r.access_token);try{const s=await u.get("/auth/me");return s.selected_role=n||s.role,this.setUser(s),{success:!0,user:s}}catch{const s={email:t,full_name:t.split("@")[0],role:n||"SalesRep",selected_role:n||"SalesRep"};return this.setUser(s),{success:!0,user:s}}}throw new Error("Authentication failed: No access token received")},async signup({full_name:t,email:e,password:n,role:r}){return await u.post("/auth/signup",{full_name:t,email:e,password:n,role:r})},logout(){u.setToken(null),this.setUser(null),window.location.hash="#/login"}};function w(t="quotations"){const e=S.getUser()||{full_name:"User",role:"SalesRep"},n=e.selected_role||e.role||"",r=[{key:"dashboard",label:"Dashboard",icon:"dashboard",href:"#/dashboard"},{key:"quotations",label:"Quotations",icon:"request_quote",href:"#/quotations"},{key:"approvals",label:"Approvals",icon:"verified",href:"#/approvals"},{key:"deal-health",label:"Deal Health",icon:"crisis_alert",href:"#/deal-health"},{key:"fulfillment",label:"Fulfillment",icon:"assignment_turned_in",href:"#/fulfillment"},{key:"invoices",label:"Invoices",icon:"receipt_long",href:"#/invoices"},{key:"products",label:"Products",icon:"inventory_2",href:"#/products"},{key:"pricing",label:"Pricing",icon:"sell",href:"#/pricing"},{key:"subscriptions",label:"Subscriptions",icon:"sync",href:"#/subscriptions"},{key:"reports",label:"Reports",icon:"bar_chart",href:"#/reports"},{key:"messages",label:"Messages",icon:"chat_bubble",href:"#/messages"},{key:"profile",label:"Profile",icon:"account_circle",href:"#/profile"}],s={SalesRep:["dashboard","quotations","customers","products"],SalesManager:["dashboard","quotations","approvals","pricing","reports"],FinanceOps:["dashboard","approvals","fulfillment","invoices","subscriptions"],Admin:["dashboard","quotations","approvals","deal-health","fulfillment","invoices","customers","products","pricing","subscriptions","reports"],Customer:["quotations","messages","profile"]},a=s[n]||s.SalesRep;return`
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
          ${r.filter(o=>a.includes(o.key)).map(o=>{const d=t===o.key||t==="quotation-detail"&&o.key==="quotations"?"nav-item-active":"nav-item-inactive",p=n==="Customer"&&o.key==="quotations"?"My Quotations":o.label;return`
        <a href="${o.href}" class="nav-item ${d}" data-route="${o.key}">
          <span class="material-symbols-outlined text-lg">${o.icon}</span>
          <span>${p}</span>
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
              <span class="text-xs font-bold text-on-surface leading-tight">${e.full_name||"User"}</span>
              <span class="text-[11px] text-on-surface-variant leading-tight">${e.selected_role||e.role||"SalesRep"}</span>
            </a>
            <a href="#/profile" class="avatar-box no-underline" title="${e.full_name||"Profile"}">
              <span class="font-bold text-sm text-primary">${(e.full_name||"User").slice(0,2).toUpperCase()}</span>
            </a>
            <button type="button" id="btn-logout" class="icon-btn text-error hover:bg-error-container/40" title="Sign Out">
              <span class="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `}function $(){const t=document.getElementById("btn-logout");t&&t.addEventListener("click",()=>{confirm("Are you sure you want to sign out?")&&S.logout()})}function xt(){return`
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
  `}function vt(){const t=document.getElementById("login-form"),e=document.getElementById("login-error"),n=document.getElementById("btn-submit-login"),r=document.getElementById("toggle-pw"),s=document.getElementById("login-password"),a=document.getElementById("pw-icon");r&&s&&a&&r.addEventListener("click",()=>{s.type==="password"?(s.type="text",a.textContent="visibility_off"):(s.type="password",a.textContent="visibility")}),t&&t.addEventListener("submit",async i=>{i.preventDefault(),e.classList.add("hidden"),e.textContent="",n.disabled=!0,n.innerHTML='<span class="loading-spinner"></span> Authenticating...';const l=document.getElementById("login-email").value.trim(),o=s.value.trim();try{await S.login(l,o),window.location.hash="#/quotations"}catch(c){e.textContent=c.message||"Login failed. Check your credentials.",e.classList.remove("hidden")}finally{n.disabled=!1,n.innerHTML='<span><span>Sign In to DealFlow360</span><span class="material-symbols-outlined text-base">arrow_forward</span></span>'}})}function bt(){return`
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
  `}function gt(){const t=document.getElementById("signup-form"),e=document.getElementById("signup-error"),n=document.getElementById("signup-success"),r=document.getElementById("btn-submit-signup"),s=document.getElementById("signup-toggle-pw"),a=document.getElementById("signup-password"),i=document.getElementById("signup-pw-icon");s&&a&&i&&s.addEventListener("click",()=>{a.type==="password"?(a.type="text",i.textContent="visibility_off"):(a.type="password",i.textContent="visibility")}),t&&t.addEventListener("submit",async l=>{l.preventDefault(),e.classList.add("hidden"),e.textContent="",n.classList.add("hidden"),n.textContent="",r.disabled=!0,r.innerHTML='<span class="loading-spinner"></span> Creating Account...';const o=document.getElementById("signup-name").value.trim(),c=document.getElementById("signup-email").value.trim(),d=a.value,p=document.getElementById("signup-confirm-password").value;if(d!==p){e.textContent="Passwords do not match.",e.classList.remove("hidden"),r.disabled=!1,r.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}if(d.length<8){e.textContent="Password must be at least 8 characters.",e.classList.remove("hidden"),r.disabled=!1,r.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>';return}try{await S.signup({full_name:o,email:c,password:d,role:"SalesRep"}),n.textContent="Account created successfully! Redirecting to login...",n.classList.remove("hidden"),t.reset(),setTimeout(()=>{window.location.hash="#/login"},1500)}catch(m){e.textContent=m.message||"Signup failed. Please try again.",e.classList.remove("hidden")}finally{r.disabled=!1,r.innerHTML='<span>Create Account</span><span class="material-symbols-outlined text-base">person_add</span>'}})}class yt{constructor(){this.deals=[],this.listeners=[],this.loaded=!1}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(n=>n!==e)}}notify(){this.listeners.forEach(e=>e(this.deals)),this.saveToStorage()}saveToStorage(){localStorage.setItem("dealHealthState",JSON.stringify(this.deals))}loadFromStorage(){const e=localStorage.getItem("dealHealthState");if(e)try{return this.deals=JSON.parse(e),this.loaded=!0,!0}catch(n){console.error("Failed to parse deal health state",n)}return!1}async fetchHealthData(){this.loadFromStorage(),this.notify();try{const[e,n,r,s]=await Promise.all([u.get("/deal_health/stalled").catch(()=>[]),u.get("/deal_health/anomalies").catch(()=>[]),u.get("/deal_health/slippage").catch(()=>[]),u.get("/quotations").catch(()=>[])]),a={};s.forEach(o=>a[o.id]=o);const i={},l=(o,c,d)=>{if(!i[o]){const p=a[o];if(!p)return;i[o]={id:p.id,dealRef:p.deal_reference,dealName:`Quote ${p.deal_reference}`,customerName:p.customer_name||"Unknown",repName:p.rep_name||"Unknown",issues:[],issueDetails:{},flaggedDate:new Date().toISOString().split("T")[0],actionStatus:"Action Required"}}i[o].issues.includes(c)||(i[o].issues.push(c),i[o].issueDetails[c]=d)};e.forEach(o=>l(o.quotation_id,"stalled",{daysInactive:o.days_inactive})),n.forEach(o=>l(o.quotation_id,"discount_anomaly",{discountGiven:o.discount_given,repAvg:o.rep_average_discount})),r.forEach(o=>l(o.quotation_id,"delivery_slippage",{daysDelayed:o.days_delayed})),this.deals=Object.values(i),this.loaded=!0,this.notify()}catch(e){console.error("Failed to fetch deal health data",e)}}getStalledDeals(){return this.deals.filter(e=>e.issues.includes("stalled"))}getDiscountAnomalies(){return this.deals.filter(e=>e.issues.includes("discount_anomaly"))}getDeliverySlippages(){return this.deals.filter(e=>e.issues.includes("delivery_slippage"))}getAtRiskDeals(){return this.deals.filter(e=>e.issues.length>0)}getAtRiskCount(){return this.getAtRiskDeals().length}getActiveFlagsCount(){return this.deals.reduce((e,n)=>e+n.issues.length,0)}getFlaggedItems(){return this.deals.filter(e=>e.issues.length>0).map(e=>{var r,s,a,i,l,o;const n=[];if(e.issues.includes("stalled")&&n.push(`Idle ${((s=(r=e.issueDetails)==null?void 0:r.stalled)==null?void 0:s.daysInactive)||7}+ days`),e.issues.includes("discount_anomaly")){const c=((i=(a=e.issueDetails)==null?void 0:a.discount_anomaly)==null?void 0:i.discountGiven)||0,d=((o=(l=e.issueDetails)==null?void 0:l.discount_anomaly)==null?void 0:o.repAvg)||0;n.push(`Discount ${c}% vs avg ${d}%`)}return e.issues.includes("delivery_slippage")&&n.push("Fulfillment delayed"),{...e,displayIssue:n.join(" & ")}})}async nudgeRep(e){const n=this.deals.find(r=>r.id===e);if(n)try{await u.post(`/deal_health/${e}/nudge`),n.actionStatus="Nudge sent",this.notify()}catch(r){console.error("Failed to nudge",r)}}async escalateDeal(e){const n=this.deals.find(r=>r.id===e);if(n)try{await u.post(`/deal_health/${e}/escalate`),n.actionStatus="Escalated to Manager",this.notify()}catch(r){console.error("Failed to escalate",r)}}async resolveRisk(e,n=null){const r=this.deals.find(s=>s.id===e);if(r)try{await u.post(`/deal_health/${e}/resolve`,{issue_type:n}),n?r.issues=r.issues.filter(s=>s!==n):r.issues=[],r.issues.length===0&&(r.actionStatus="Resolved"),this.notify()}catch(s){console.error("Failed to resolve",s)}}simulateStalledDeal(e){let n=this.deals.find(r=>r.id===e.id);n?n.issues.includes("stalled")||(n.issues.push("stalled"),n.issueDetails||(n.issueDetails={}),n.issueDetails.stalled={daysInactive:8},n.actionStatus="Action Required",this.notify()):(this.deals.push({id:e.id,dealRef:e.deal_reference,dealName:`Quote ${e.deal_reference}`,customerName:e.customer_name||"Unknown",repName:e.rep_name||"Unknown",issues:["stalled"],issueDetails:{stalled:{daysInactive:8}},flaggedDate:new Date().toISOString().split("T")[0],actionStatus:"Action Required"}),this.notify())}}const I=new yt;function z(t,e,n,r){const s=r*Math.PI/180;return{x:Number((t+n*Math.cos(s)).toFixed(2)),y:Number((e+n*Math.sin(s)).toFixed(2))}}function ht(t,e,n,r,s,a){const i=z(t,e,n,a),l=z(t,e,n,s),o=z(t,e,r,a),c=z(t,e,r,s),d=a-s<=180?"0":"1";return["M",i.x,i.y,"A",n,n,0,d,0,l.x,l.y,"L",c.x,c.y,"A",r,r,0,d,1,o.x,o.y,"Z"].join(" ")}function wt(t={}){const{summary:e={},quotations:n=[]}=t,r=e.total_revenue!==void 0?`₹${Number(e.total_revenue).toLocaleString("en-IN")}`:"₹1,68,395",s=e.pending_approvals??2,a=e.total_quotations??(e.draft_count?e.draft_count:12);e.win_rate!==void 0&&`${e.win_rate}`;const i=e.at_risk_count??I.getAtRiskCount(),l=e.active_flags_count??I.getActiveFlagsCount(),o=I.getStalledDeals().length||3,c=I.getDeliverySlippages().length||1,d=[{key:"Approved",name:"Executive Approved",color:"#566250"},{key:"Confirmed",name:"Confirmed Order",color:"#3b82f6"},{key:"Fulfilled",name:"Fulfillment / Active",color:"#8c9a84"},{key:"Pending Approval",name:"In Legal / Review",color:"#7a5826"},{key:"Under Negotiation",name:"Under Negotiation",color:"#d97706"},{key:"Sent",name:"Sent to Client",color:"#6366f1"},{key:"Draft",name:"Draft Phase",color:"#a8b5a0"},{key:"Rejected",name:"Rejected Deals",color:"#dc2626"}],p=e.stage_breakdown||{Approved:2,Confirmed:2,Fulfilled:1,"Pending Approval":2,"Under Negotiation":1,Sent:1,Draft:2,Rejected:1},m=d.map(v=>({...v,count:p[v.key]||0})).filter(v=>v.count>0),x=m.reduce((v,k)=>v+k.count,0)||e.total_quotations||12;let g=-90;const A=m.map(v=>{const k=v.count/x,E=k*360,D=g,R=g+Math.min(359.99,E);g+=E;const M=ht(110,110,96,62,D,R),j=Math.round(k*100);return`
      <path
        class="donut-slice"
        id="slice-${v.key.toLowerCase().replace(/[^a-z0-9]/g,"-")}"
        d="${M}"
        fill="${v.color}"
        stroke="#ffffff"
        stroke-width="2.5"
        data-stage="${v.name}"
        data-deals="${v.count} deal${v.count===1?"":"s"}"
        data-percent="${j}%"
        data-count="${v.count}"
        data-color="${v.color}"
      />
    `}).join(""),C=m.map(v=>{const k=Math.round(v.count/x*100);return`
      <div class="flex items-center justify-between cursor-pointer transition-colors p-1 rounded-md hover:bg-surface-container/60 legend-item" data-stage="${v.name}">
        <span class="flex items-center gap-2 text-on-surface">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${v.color};"></span> ${v.name}
        </span>
        <span class="font-mono font-semibold text-on-surface-variant">${k}% (${v.count})</span>
      </div>
    `}).join(""),h=(n.length>0?n.slice(0,6):[{id:1,deal_reference:"DEAL-0001",rep_name:"J. Rao",customer_name:"Acme Corp",total_amount:32e3,status:"Draft",time:"Recent"},{id:2,deal_reference:"DEAL-0002",rep_name:"S. Patel",customer_name:"Bela Industries",total_amount:18500,status:"Pending Approval",time:"Recent"},{id:3,deal_reference:"DEAL-0003",rep_name:"J. Rao",customer_name:"Nova Retail",total_amount:12400,status:"Approved",time:"Recent"},{id:4,deal_reference:"DEAL-0004",rep_name:"S. Patel",customer_name:"TechVault Inc",total_amount:45e3,status:"Confirmed",time:"Recent"},{id:5,deal_reference:"DEAL-0005",rep_name:"J. Rao",customer_name:"GreenLeaf Solutions",total_amount:28e3,status:"Fulfilled",time:"Recent"}]).map(v=>{let k="badge-primary";const E=(v.status||"").toLowerCase(),D=E.includes("approve")||E.includes("pending")||E.includes("negotiat");E.includes("approve")?k="badge-success":E.includes("negotiat")||E.includes("review")||E.includes("pending")?k="badge-warning":E.includes("fulfill")||E.includes("confirm")?k="badge-info":E.includes("draft")&&(k="badge-neutral");const R=v.rep_name||v.rep&&v.rep.full_name||"Sales Rep",M=R.split(" ").map(H=>H[0]).join("").substring(0,2).toUpperCase()||"SR",j=v.customer_name||v.customer&&v.customer.name||"Client Organization",O=v.deal_reference||(v.id?`DEAL-${String(v.id).padStart(4,"0")}`:"DEAL-0001"),F=v.time||(v.created_at?new Date(v.created_at).toLocaleDateString("en-IN",{month:"short",day:"numeric"}):"Recent");return`
      <tr class="table-row hover:bg-surface-container/50 transition-colors activity-row" data-status="${v.status||"Draft"}" data-is-approval="${D?"true":"false"}" data-deal-id="${v.id}">
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">${F}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="avatar-sm">
              <span>${M}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${R}</span>
              <span class="text-[10px] text-on-surface-variant">Account Exec</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${j}</span>
            <span class="text-[10px] font-mono text-primary">${O}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ₹${Number(v.total_amount||0).toLocaleString("en-IN")}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${k}">● ${v.status||"Draft"}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <a href="#/quotations/${v.id}" class="btn btn-secondary text-xs py-1 px-3 btn-review-deal" data-id="${v.id}">Review Deal</a>
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
            <div class="text-2xl font-bold tracking-tight text-on-surface">${r}</div>
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
              ${s} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
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
              ${a} <span class="text-sm font-normal text-on-surface-variant">Quotes</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-neutral text-[10px]">Avg Cycle: 6.2 days</span>
              <span class="text-[11px] text-on-surface-variant">within SLA</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: At Risk Deals -->
        <div class="card card-extruded flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onclick="window.location.hash='#/deal-health'">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">At Risk Deals</span>
            <div class="icon-circle bg-error-container/40">
              <span class="material-symbols-outlined text-error text-lg">crisis_alert</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">
              ${i} <span class="text-sm font-normal text-on-surface-variant">Deals</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="badge badge-error text-[10px] flex items-center gap-1">
                ● ${l} active risk flags
              </span>
              <span class="text-[11px] text-on-surface-variant">${o} stalled • ${c} delivery</span>
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
          <div class="w-full bg-surface-container-low/60 rounded-2xl p-4 my-2 relative" id="velocity-chart-card">
            <!-- Dynamic Interactive Tooltip -->
            <div id="velocity-chart-tooltip" class="velocity-tooltip">
              <div class="velocity-tt-month" id="vtt-month">September (Current)</div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Actual:</span>
                <span class="velocity-tt-val" id="vtt-actual">₹19,15,000</span>
              </div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Target:</span>
                <span class="velocity-tt-val" id="vtt-target">₹17,00,000</span>
              </div>
              <div class="velocity-tt-row">
                <span class="velocity-tt-label">Variance:</span>
                <span class="velocity-tt-val" id="vtt-variance">+₹2,15,000</span>
              </div>
              <div class="velocity-tt-status ahead" id="vtt-status">+12.6% Ahead of Target</div>
            </div>

            <svg class="w-full h-44 overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
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
              <line id="target-plan-line" x1="80" y1="135" x2="620" y2="35" stroke="#757871" stroke-width="2" stroke-dasharray="6" opacity="0.6" style="transition: stroke-width 0.2s ease, opacity 0.2s ease;" />

              <!-- Area fill -->
              <path d="M 80,140 Q 350,90 620,40 L 620,160 L 80,160 Z" fill="url(#chartGrad)" />

              <!-- Actuals Curve -->
              <path d="M 80,140 Q 350,90 620,40" fill="none" stroke="#566250" stroke-width="3.5" stroke-linecap="round" />

              <!-- Target association connector lines & markers (illuminated on hover) -->
              <line class="velocity-connector-line" id="vconn-0" x1="80" y1="140" x2="80" y2="135" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-0" cx="80" cy="135" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <line class="velocity-connector-line" id="vconn-1" x1="350" y1="90" x2="350" y2="85" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-1" cx="350" cy="85" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <line class="velocity-connector-line" id="vconn-2" x1="620" y1="40" x2="620" y2="35" stroke="#757871" stroke-width="1.5" stroke-dasharray="2,2" opacity="0" />
              <circle class="velocity-target-marker" id="vtgt-2" cx="620" cy="35" r="4.5" fill="#757871" stroke="#ffffff" stroke-width="1.5" opacity="0" />

              <!-- Data nodes (with generous hit area for effortless hover) -->
              <g class="velocity-node-group" id="vnode-0" data-index="0" data-month="July" data-actual="1220000" data-target="1100000">
                <circle cx="80" cy="140" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="80" cy="140" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              </g>

              <g class="velocity-node-group" id="vnode-1" data-index="1" data-month="August" data-actual="1685500" data-target="1420000">
                <circle cx="350" cy="90" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="350" cy="90" r="5.5" fill="#eefee6" stroke="#566250" stroke-width="3" />
              </g>

              <g class="velocity-node-group" id="vnode-2" data-index="2" data-month="September (Current)" data-actual="1915000" data-target="1700000">
                <circle cx="620" cy="40" r="22" fill="transparent" />
                <circle class="velocity-node-circle" cx="620" cy="40" r="6" fill="#566250" stroke="#eefee6" stroke-width="2" />
              </g>
            </svg>

            <!-- Chart Month Labels (also hoverable) -->
            <div class="grid grid-cols-3 text-center pt-2">
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="0">
                <span class="text-xs font-semibold text-on-surface">July</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹12,20,000</p>
              </div>
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="1">
                <span class="text-xs font-semibold text-on-surface">August</span>
                <p class="text-[11px] font-mono text-on-surface-variant">₹16,85,500</p>
              </div>
              <div class="velocity-month-col cursor-pointer transition-colors p-1 rounded-lg hover:bg-surface-container/60" data-index="2">
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
          <div class="deals-donut-container" id="deals-donut-container">
            <!-- Tooltip formatted exactly as requested: Stage name / Count / Percentage -->
            <div id="donut-tooltip" class="donut-tooltip">
              <div class="font-bold text-xs" id="tt-stage" style="color: var(--color-on-surface); font-weight: 700; font-size: 12px;">Executive Approved</div>
              <div id="tt-deals" style="color: var(--color-on-surface-variant); font-size: 11px; margin-top: 2px;">18 deals</div>
              <div class="font-mono font-bold" id="tt-percent" style="font-family: var(--font-mono); font-weight: 700; font-size: 12px; color: var(--color-primary); margin-top: 2px;">35%</div>
            </div>

            <div class="donut-chart-box">
              <svg class="donut-chart-svg" width="210" height="210" viewBox="0 0 220 220">
                ${A}
              </svg>

              <!-- Center Badge: White circular cutout with soft clay inset shadow & permanent Total Deals -->
              <div class="donut-center-badge">
                <span id="donut-center-val" class="donut-center-val">${x}</span>
                <span id="donut-center-lbl" class="donut-center-lbl">Total Deals</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Stage Breakdown List -->
          <div class="space-y-2 text-xs">
            ${C}
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
              ${h}
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
  `}async function $t(){try{const[t,e]=await Promise.all([u.get("/dashboard/summary").catch(()=>({})),u.get("/quotations").catch(()=>[]),I.fetchHealthData()]);return{summary:t,quotations:e}}catch{return{summary:{},quotations:[]}}}function Et(){const t=document.getElementById("btn-new-deal-dash");t&&t.addEventListener("click",()=>{window.location.hash="#/quotation-detail"});const e=document.getElementById("btn-quarter-toggle"),n=document.getElementById("quarter-dropdown-menu"),r=document.getElementById("current-quarter-label"),s=document.getElementById("quarter-chevron");e&&n&&(e.addEventListener("click",f=>{f.stopPropagation(),n.classList.contains("show")?(n.classList.remove("show"),s.style.transform="rotate(0deg)"):(n.classList.add("show"),s.style.transform="rotate(180deg)")}),document.querySelectorAll(".quarter-menu-item").forEach(f=>{f.addEventListener("click",()=>{document.querySelectorAll(".quarter-menu-item").forEach(b=>b.classList.remove("selected")),f.classList.add("selected"),r&&(r.textContent=f.getAttribute("data-label")),n.classList.remove("show"),s&&(s.style.transform="rotate(0deg)")})}),document.addEventListener("click",f=>{f.target.closest("#quarter-selector-wrapper")||(n.classList.remove("show"),s&&(s.style.transform="rotate(0deg)"))})),document.getElementById("velocity-chart-card");const a=document.getElementById("velocity-chart-tooltip"),i=document.getElementById("vtt-month"),l=document.getElementById("vtt-actual"),o=document.getElementById("vtt-target"),c=document.getElementById("vtt-variance"),d=document.getElementById("vtt-status"),p=document.querySelectorAll(".velocity-node-group"),m=document.querySelectorAll(".velocity-month-col"),x=document.getElementById("target-plan-line"),g=[{month:"July",actual:122e4,target:11e5,leftPct:18},{month:"August",actual:1685500,target:142e4,leftPct:50},{month:"September (Current)",actual:1915e3,target:17e5,leftPct:82}];function A(f){const b=g[f];if(!b||!a)return;p.forEach((_,B)=>{B===f?(_.classList.add("active"),_.style.opacity="1"):(_.classList.remove("active"),_.style.opacity="0.5")});for(let _=0;_<3;_++){const B=document.getElementById(`vconn-${_}`),Q=document.getElementById(`vtgt-${_}`);B&&(B.style.opacity=_===f?"1":"0"),Q&&(Q.style.opacity=_===f?"1":"0")}const y=b.actual-b.target,q=(y/b.target*100).toFixed(1),T=y>=0?"+":"-",N=y>=0;i&&(i.textContent=b.month),l&&(l.textContent=`₹${Number(b.actual).toLocaleString("en-IN")}`),o&&(o.textContent=`₹${Number(b.target).toLocaleString("en-IN")}`),c&&(c.textContent=`${T}₹${Number(Math.abs(y)).toLocaleString("en-IN")}`,c.style.color=N?"#2e6930":"var(--color-error)"),d&&(d.textContent=`${T}${q}% ${N?"Ahead of Target":"Behind Target"}`,d.className=`velocity-tt-status ${N?"ahead":"behind"}`),f===0?(a.style.left=`${b.leftPct}%`,a.style.top="12px",a.style.transform="translate(-25%, 0)"):f===1?(a.style.left=`${b.leftPct}%`,a.style.top="12px",a.style.transform="translate(-50%, 0)"):(a.style.left=`${b.leftPct}%`,a.style.top="12px",a.style.transform="translate(-75%, 0)"),a.classList.add("visible")}function C(){p.forEach(f=>{f.classList.remove("active"),f.style.opacity="1"});for(let f=0;f<3;f++){const b=document.getElementById(`vconn-${f}`),y=document.getElementById(`vtgt-${f}`);b&&(b.style.opacity="0"),y&&(y.style.opacity="0")}a&&a.classList.remove("visible")}p.forEach(f=>{f.addEventListener("mouseenter",()=>{const b=parseInt(f.getAttribute("data-index"),10);A(b)}),f.addEventListener("mouseleave",C)}),m.forEach(f=>{f.addEventListener("mouseenter",()=>{const b=parseInt(f.getAttribute("data-index"),10);A(b)}),f.addEventListener("mouseleave",C)}),x&&(x.addEventListener("mouseenter",()=>{x.setAttribute("stroke-width","3"),x.setAttribute("opacity","0.9")}),x.addEventListener("mouseleave",()=>{x.setAttribute("stroke-width","2"),x.setAttribute("opacity","0.6")}));const P=document.getElementById("deals-donut-container"),h=document.getElementById("donut-tooltip"),v=document.getElementById("tt-stage"),k=document.getElementById("tt-deals"),E=document.getElementById("tt-percent"),D=document.querySelectorAll(".donut-slice"),R=document.querySelectorAll(".legend-item");function M(f){if(!h||!P)return;const b=P.getBoundingClientRect(),y=f.clientX-b.left,q=f.clientY-b.top,T=Math.max(75,Math.min(b.width-75,y));q<65?(h.style.left=`${T}px`,h.style.top=`${q+18}px`,h.style.transform="translate(-50%, 0)"):(h.style.left=`${T}px`,h.style.top=`${q-12}px`,h.style.transform="translate(-50%, -100%)")}function j(f,b){D.forEach(y=>{if(y.getAttribute("data-stage")===f){y.classList.add("active-slice"),y.style.opacity="1";const T=y.getAttribute("data-deals"),N=y.getAttribute("data-percent"),_=y.getAttribute("data-color");h&&v&&k&&E&&(v.textContent=f,k.textContent=T,E.textContent=N,E.style.color=_||"var(--color-primary)",h.classList.add("visible"))}else y.classList.remove("active-slice"),y.style.opacity="0.45"}),b&&M(b)}function O(){D.forEach(f=>{f.classList.remove("active-slice"),f.style.opacity="1"}),h&&h.classList.remove("visible")}D.forEach(f=>{f.addEventListener("mouseenter",b=>{j(f.getAttribute("data-stage"),b)}),f.addEventListener("mousemove",b=>{M(b)}),f.addEventListener("mouseleave",O)}),R.forEach(f=>{f.addEventListener("mouseenter",()=>{j(f.getAttribute("data-stage")),h&&P&&(h.style.left="50%",h.style.top="12px",h.style.transform="translate(-50%, 0)")}),f.addEventListener("mouseleave",O)});const F=document.getElementById("btn-filter-all"),H=document.getElementById("btn-filter-approvals"),ut=document.querySelectorAll(".activity-row"),J=document.getElementById("activity-empty-row");function K(f){let b=0;ut.forEach(y=>{const q=y.getAttribute("data-is-approval")==="true";f==="all"||f==="approvals"&&q?(y.classList.remove("hidden"),b++):y.classList.add("hidden")}),J&&(b===0?J.classList.remove("hidden"):J.classList.add("hidden"))}F&&H&&(F.addEventListener("click",()=>{F.classList.add("active"),H.classList.remove("active"),K("all")}),H.addEventListener("click",()=>{H.classList.add("active"),F.classList.remove("active"),K("approvals")})),document.querySelectorAll(".btn-review-deal").forEach(f=>{f.addEventListener("click",b=>{const y=f.getAttribute("data-id");y&&(window.location.hash=`#/quotations/${y}`)})});const X=document.getElementById("btn-dl-audit");X&&X.addEventListener("click",()=>{const f=document.querySelectorAll(".activity-row"),b=[["Timestamp","Actor","Role","Customer / Organization","Deal Reference","Valuation","Status"]];f.forEach(_=>{const B=_.querySelectorAll("td");if(B.length>=5){const Q=B[0].innerText.trim(),Z=B[1].querySelector(".font-bold"),tt=B[1].querySelector(".text-on-surface-variant"),et=B[2].querySelector(".font-semibold"),at=B[2].querySelector(".font-mono"),mt=B[3].innerText.trim(),ft=B[4].innerText.replace("●","").trim();b.push([`"${Q}"`,`"${Z?Z.innerText.trim():""}"`,`"${tt?tt.innerText.trim():""}"`,`"${et?et.innerText.trim():""}"`,`"${at?at.innerText.trim():""}"`,`"${mt}"`,`"${ft}"`])}});const y=b.map(_=>_.join(",")).join(`
`),q=new Blob([y],{type:"text/csv;charset=utf-8;"}),T=URL.createObjectURL(q),N=document.createElement("a");N.setAttribute("href",T),N.setAttribute("download",`dealflow360_audit_trail_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(N),N.click(),document.body.removeChild(N),URL.revokeObjectURL(T)})}function kt(t=[],e="my",n="kanban"){const r=S.getUser()||{full_name:"User"},s=[{id:"draft",title:"Draft",match:o=>o.includes("draft")},{id:"pending",title:"Pending Approval",match:o=>o.includes("pending")||o.includes("review")},{id:"approved",title:"Approved",match:o=>o.includes("approved")},{id:"negotiation",title:"Negotiation",match:o=>o.includes("negotiat")||o.includes("sent")},{id:"confirmed",title:"Confirmed",match:o=>o.includes("confirmed")||o.includes("fulfilled")}],a=o=>{const c=Number(o.total_amount||0).toLocaleString("en-IN");return`
      <div 
        class="quote-card card card-extruded border border-outline-variant/60 rounded-2xl p-4 cursor-pointer hover:border-primary transition-all space-y-1.5"
        onclick="window.location.hash='#/quotations/${o.id}'"
        data-ref="${(o.deal_reference||"").toLowerCase()}" 
        data-customer="${(o.customer_name||"").toLowerCase()}" 
        data-rep="${(o.rep_name||"").toLowerCase()}"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-on-surface">${o.customer_name||"Customer"} - ₹${c}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
          <span>${o.deal_reference||`DEAL-${o.id}`}</span>
          <span>${o.line_count||(o.lines?o.lines.length:0)} items</span>
        </div>
      </div>
    `},i=s.map(o=>{const c=t.filter(p=>o.match((p.status||"").toLowerCase())),d=c.length===0?'<div class="p-4 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl">Empty</div>':c.map(a).join("");return`
      <div class="card card-extruded border border-outline-variant/60 rounded-2xl p-4 flex flex-col min-h-[380px] space-y-4 bg-surface-container-low/40">
        <!-- Column Header -->
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-2">
          <h3 class="font-bold text-sm text-on-surface">${o.title}</h3>
          <span class="badge badge-neutral text-xs font-bold font-mono">${c.length}</span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          ${d}
        </div>
      </div>
    `}).join(""),l=t.length===0?`
      <tr>
        <td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">
          No commercial quotations found for <strong>${r.full_name||"your account"}</strong>.
        </td>
      </tr>
    `:t.map(o=>`
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
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${e==="my"?"bg-primary text-on-primary font-bold":"text-on-surface-variant hover:text-on-surface"}" data-scope="my">My Quotations</button>
            <button type="button" class="btn text-xs py-1 px-3 rounded-lg ${e==="all"?"bg-primary text-on-primary font-bold":"text-on-surface-variant hover:text-on-surface"}" data-scope="all">All Workspace Deals</button>
          </div>
        </div>
      </div>

      <!-- Main Kanban Grid vs Table -->
      ${n==="kanban"?`
        <!-- 5 Kanban Columns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" id="kanban-container">
          ${i}
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

        <button type="button" class="btn btn-secondary text-xs font-bold px-5 py-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high/60 flex items-center gap-2" id="btn-mode-toggle" data-target-mode="${n==="kanban"?"table":"kanban"}">
          <span class="material-symbols-outlined text-base">${n==="kanban"?"table_rows":"view_kanban"}</span>
          <span>${n==="kanban"?"Switch to Table View":"Switch to Kanban View"}</span>
        </button>
      </div>
    </div>
  `}async function At(t=!0){try{return await u.get(`/quotations?my_only=${t}`)}catch{return[]}}function _t(t,e){document.querySelectorAll("#quote-scope-toggle button").forEach(s=>{s.addEventListener("click",()=>{const a=s.getAttribute("data-scope");typeof t=="function"&&t(a==="my")})});const r=document.getElementById("btn-mode-toggle");r&&r.addEventListener("click",()=>{const s=r.getAttribute("data-target-mode");typeof e=="function"&&e(s)})}const U={show({title:t,content:e,onConfirm:n,confirmText:r="Confirm",cancelText:s="Cancel",showConfirm:a=!0}){const i=document.getElementById("df-modal-backdrop");i&&i.remove();const l=`
      <div id="df-modal-backdrop" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${t}</h3>
            <button type="button" class="modal-close-btn" id="df-modal-close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="modal-body">
            ${e}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="df-modal-cancel">${s}</button>
            ${a?`<button type="button" class="btn btn-primary" id="df-modal-confirm">${r}</button>`:""}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",l);const o=document.getElementById("df-modal-backdrop"),c=document.getElementById("df-modal-close"),d=document.getElementById("df-modal-cancel"),p=document.getElementById("df-modal-confirm"),m=()=>{o.classList.add("fade-out"),setTimeout(()=>o.remove(),200)};return c.addEventListener("click",m),d.addEventListener("click",m),o.addEventListener("click",x=>{x.target===o&&m()}),p&&n&&p.addEventListener("click",async()=>{p.disabled=!0,p.innerHTML='<span class="loading-spinner"></span> Processing...';try{await n()!==!1&&m()}catch(x){alert(x.message||"Action failed")}finally{p.disabled=!1,p.innerHTML=r}}),{close:m}}};function nt(t={}){var p,m,x;const{quotation:e=null,products:n=[],customers:r=[]}=t,s=!e||!e.id,a=e||{id:0,deal_reference:"DEAL-NEW",customer_name:((p=r[0])==null?void 0:p.name)||"Acme Corp Global ERP",customer_email:((m=r[0])==null?void 0:m.email)||"procurement@acme.corp",customer_tier:((x=r[0])==null?void 0:x.tier)||"Gold",status:"Draft",lines:[]},i=!a.lines||a.lines.length===0?`
      <tr>
        <td colspan="7" class="text-center py-6 text-on-surface-variant text-xs">
          No line items added yet. Click <strong>Add Product Line +</strong> to populate this deal.
        </td>
      </tr>
    `:a.lines.map(g=>`
        <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
          <td class="py-2.5 px-4 font-bold text-xs text-on-surface">
            ${g.product_name||`Product #${g.product_id}`}
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface-variant">${g.sku||"SKU-STD"}</td>
          <td class="py-2.5 px-4">
            <span class="badge badge-neutral text-[10px]">${g.category_snapshot||"Hardware"}</span>
          </td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">${g.quantity}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-on-surface">₹${Number(g.unit_price).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 font-mono text-xs text-tertiary">${g.discount_percent||0}%</td>
          <td class="py-2.5 px-4 font-mono font-bold text-xs text-primary">₹${Number(g.line_total).toLocaleString("en-IN")}</td>
          <td class="py-2.5 px-4 text-right">
            ${s?"":`
              <button type="button" class="icon-btn text-error hover:bg-error-container/30 delete-line-btn" data-line-id="${g.id}" title="Remove Line">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            `}
          </td>
        </tr>
      `).join(""),l=a.lines?a.lines.reduce((g,A)=>g+(A.line_total||0),0):0,o=l;let c="badge-neutral";const d=(a.status||"").toLowerCase();return d.includes("approved")?c="badge-success":d.includes("pending")?c="badge-warning":d.includes("negotiat")?c="badge-info":(d.includes("fulfilled")||d.includes("confirmed"))&&(c="badge-success"),`
    <div class="page-container space-y-6">
      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
          <a href="#/quotations" class="hover:text-primary flex items-center gap-1 font-semibold">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Quotations
          </a>
          <span>/</span>
          <span class="font-mono text-primary font-bold">${a.deal_reference||"DEAL-NEW"}</span>
        </div>

        <div class="flex items-center gap-2">
          ${s?"":`
            <a href="#/portal?id=${a.id}" class="btn btn-secondary text-xs" target="_blank">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              Customer Portal
            </a>
            <a href="#/fulfillment?id=${a.id}" class="btn btn-secondary text-xs">
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
            <h1 class="text-2xl font-bold tracking-tight text-on-surface">${a.deal_reference||"New Commercial Deal"}</h1>
            <span class="badge ${c} text-xs">${a.status||"Draft"}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Enterprise Client: <strong class="text-on-surface">${a.customer_name}</strong> • Account Rep: Eleanor Vance
          </p>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="quote-action-bar">
          ${a.status==="Draft"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-submit-approval">
              <span class="material-symbols-outlined text-base">send_and_archive</span>
              Submit for Approval
            </button>
          `:""}
          ${a.status==="Pending Approval"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-approve-quote">
              <span class="material-symbols-outlined text-base">check_circle</span>
              Approve Quotation
            </button>
            <button type="button" class="btn btn-secondary text-xs text-error" id="btn-reject-quote">
              <span class="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          `:""}
          ${a.status==="Approved"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-send-portal">
              <span class="material-symbols-outlined text-base">outgoing_mail</span>
              Send to Customer Portal
            </button>
          `:""}
          ${a.status==="Under Negotiation"?`
            <button type="button" class="btn btn-primary text-xs" id="btn-confirm-quote">
              <span class="material-symbols-outlined text-base">handshake</span>
              Confirm &amp; Finalize Deal
            </button>
          `:""}
          ${a.status==="Confirmed"?`
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
          <div class="p-2.5 rounded-xl ${["Draft","Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(a.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            1. Draft &amp; CPQ
          </div>
          <div class="p-2.5 rounded-xl ${["Pending Approval","Approved","Under Negotiation","Confirmed","Fulfilled"].includes(a.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            2. Review &amp; Governance
          </div>
          <div class="p-2.5 rounded-xl ${["Approved","Under Negotiation","Confirmed","Fulfilled"].includes(a.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            3. Customer Portal
          </div>
          <div class="p-2.5 rounded-xl ${["Confirmed","Fulfilled"].includes(a.status)?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
            4. Warehouse Split
          </div>
          <div class="p-2.5 rounded-xl ${a.status==="Fulfilled"?"bg-primary text-on-primary font-bold":"bg-surface-container text-on-surface-variant"}">
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
                  ${i}
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
                  ${a.customer_name}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-on-surface-variant block mb-1">Tier</span>
                  <div class="font-semibold text-on-surface p-2 rounded-lg bg-surface-container">
                    ${a.customer_tier||"Gold"}
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
  `}async function rt(t){try{const[e,n,r]=await Promise.all([t?u.get(`/quotations/${t}`).catch(()=>null):null,u.get("/products").catch(()=>[]),u.get("/customers").catch(()=>[])]);return{quotation:e,products:n,customers:r}}catch{return{quotation:null,products:[],customers:[]}}}function ot(t,e=[],n=[]){const r=document.getElementById("btn-add-line-modal");r&&r.addEventListener("click",()=>{const p=e.map(m=>`
        <option value="${m.id}">${m.name} — ₹${Number(m.base_price).toLocaleString("en-IN")} (${m.category})</option>
      `).join("");U.show({title:"Add Product Line Item",content:`
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
        `,confirmText:"Add to Quotation",onConfirm:async()=>{var A;const m=parseInt(document.getElementById("modal-product-select").value,10),x=parseFloat(document.getElementById("modal-product-qty").value)||1;if(!t||t==="0"||t===0||t==="undefined"){const C=((A=n[0])==null?void 0:A.id)||1,P=await u.post("/quotations",{customer_id:C});await u.post(`/quotations/${P.id}/lines`,{product_id:m,quantity:x}),window.location.hash=`#/quotations/${P.id}`,window.location.reload()}else await u.post(`/quotations/${t}/lines`,{product_id:m,quantity:x}),window.location.reload();return!0}})}),document.querySelectorAll(".delete-line-btn").forEach(p=>{p.addEventListener("click",async()=>{const m=p.getAttribute("data-line-id");confirm("Remove this line item from quotation?")&&(await u.delete(`/quotations/${t}/lines/${m}`),window.location.reload())})});const s=async p=>{await u.put(`/quotations/${t}`,{status:p}),window.location.reload()},a=document.getElementById("btn-submit-approval");a&&a.addEventListener("click",()=>s("Pending Approval"));const i=document.getElementById("btn-approve-quote");i&&i.addEventListener("click",()=>s("Approved"));const l=document.getElementById("btn-reject-quote");l&&l.addEventListener("click",()=>s("Rejected"));const o=document.getElementById("btn-send-portal");o&&o.addEventListener("click",()=>s("Under Negotiation"));const c=document.getElementById("btn-confirm-quote");c&&c.addEventListener("click",()=>s("Confirmed"));const d=document.getElementById("btn-fulfill-quote");d&&d.addEventListener("click",()=>s("Fulfilled"))}async function Lt(){try{return await u.get("/approvals")}catch{return[]}}function St(t=[]){const e=t.length>0?t:[],n=e.filter(i=>i.status==="PENDING_MANAGER"||i.status==="PENDING_FINANCE").length,r=e.filter(i=>i.status==="RETURNED").length,s=e.filter(i=>i.status==="APPROVED").length,a=e.length===0?`
      <tr>
        <td colspan="5" class="text-on-surface-variant" style="text-align: center; padding: 2rem;">
          No approval requests found. Approvals are created when quotations exceed discount limits.
        </td>
      </tr>
    `:e.map(i=>{const l=i.blended_risk==="HIGH"?"font-bold":"";return`
        <tr class="approval-row" data-quotation-id="${i.quotation_id}" style="cursor: pointer;">
          <td class="font-bold text-on-surface">${i.quotation_ref}</td>
          <td class="text-on-surface">${i.customer_name}</td>
          <td class="text-on-surface ${l}">${i.blended_risk}</td>
          <td class="text-on-surface">${i.current_stage}</td>
          <td class="text-on-surface">${i.assigned_to}</td>
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
          ${r} Returned
        </span>
        <span class="badge" id="filter-approved" style="background-color: #22c55e; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          ${s} Approved
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
              ${a}
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
  `}function Ct(){document.querySelectorAll(".approval-row").forEach(a=>{a.addEventListener("click",()=>{const i=a.getAttribute("data-quotation-id");window.location.hash=`#/approval-detail/${i}`})});const t=document.getElementById("btn-filter-pending");if(t){let a=!1;t.addEventListener("click",()=>{a=!a,t.textContent=a?"Show All":"Filter: Pending Only",document.querySelectorAll(".approval-row").forEach(l=>{const o=l.children[3],c=o?o.textContent.trim():"";if(a){const d=c.includes("Sales")||c.includes("Finance")||c==="Pending";l.style.display=d?"":"none"}else l.style.display=""})})}const e=document.getElementById("filter-pending"),n=document.getElementById("filter-returned"),r=document.getElementById("filter-approved");function s(a){document.querySelectorAll(".approval-row").forEach(l=>{const o=l.children[3],c=o?o.textContent.trim():"";if(a==="pending"){const d=c.includes("Sales")||c.includes("Finance")||c==="Pending";l.style.display=d?"":"none"}else a==="returned"?l.style.display=c==="Returned"?"":"none":a==="approved"&&(l.style.display=c==="Approved"||c==="Auto-Approved"?"":"none")})}e&&e.addEventListener("click",()=>s("pending")),n&&n.addEventListener("click",()=>s("returned")),r&&r.addEventListener("click",()=>s("approved"))}async function It(t){try{return await u.get(`/approvals/${t}`)}catch(e){return console.error("Failed to load approval detail",e),null}}function Bt(t){if(!t)return`
      <div class="page-container space-y-6">
        <div class="card card-extruded" style="padding: 2rem; text-align: center;">
          <h2 class="text-xl font-bold text-on-surface">Approval Not Found</h2>
          <p class="text-sm text-on-surface-variant" style="margin-top: 0.5rem;">This quotation does not have an approval request yet.</p>
          <a href="#/approvals" class="btn btn-primary" style="margin-top: 1rem; display: inline-block; text-decoration: none; padding: 0.5rem 1.5rem;">Back to Approvals</a>
        </div>
      </div>
    `;const e=t.blended_risk==="HIGH"?"#e67e22":t.blended_risk==="MEDIUM"?"#f1c40f":"#2ecc71",n="#5AA1E3",r=(t.lines||[]).map(c=>`
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
  `,s=["Submitted","Sales Manager","Finance","Confirmed"],a=t.status==="APPROVED"?3:t.status==="PENDING_FINANCE"?2:t.status==="PENDING_MANAGER"?1:0,i=s.map((c,d)=>{let p="#6b7280",m="#6b7280";d<a?(p="#22c55e",m="#22c55e"):d===a&&(p="#3b82f6",m="#3b82f6");const x=d<s.length-1?`<div style="flex: 1; height: 2px; background: ${d<a?"#22c55e":"#6b7280"}; margin: 0 0.25rem;"></div>
         <div style="width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid ${d<a?"#22c55e":"#6b7280"}; margin-right: 0.25rem;"></div>`:"";return`
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 80px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${p}; border: 3px solid ${m};"></div>
        <span class="text-xs text-on-surface-variant" style="margin-top: 0.5rem; text-align: center;">${c}</span>
      </div>
      ${x?`<div style="display: flex; align-items: center; flex: 1;">${x}</div>`:""}
    `}).join(""),l=(t.audit_trail||[]).map(c=>`
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
  `,o=t.status==="PENDING_MANAGER"||t.status==="PENDING_FINANCE";return`
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
        <span class="badge" style="background-color: ${e}; color: white; padding: 0.4rem 1rem; font-size: 13px; font-weight: bold; border-radius: 6px;">
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
                ${r}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pipeline Visualization -->
      <div class="card card-extruded" style="padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0;">
          ${i}
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
                ${l}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      ${o?`
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
  `}function Pt(t){const e=document.getElementById("btn-approve"),n=document.getElementById("btn-return"),r=document.getElementById("btn-reject");e&&e.addEventListener("click",async()=>{const s=prompt("Approval note (optional):")||"";try{await u.post(`/approvals/${t}/decide`,{decision:"APPROVE",reason:s}),alert("Approval granted successfully!"),window.location.hash="#/approvals"}catch(a){alert("Error: "+(a.message||"Approval failed"))}}),n&&n.addEventListener("click",async()=>{const s=prompt("Reason for returning (required):");if(!s){alert("A reason is required to return for revision.");return}try{await u.post(`/approvals/${t}/decide`,{decision:"RETURN",reason:s}),alert("Returned for revision."),window.location.hash="#/approvals"}catch(a){alert("Error: "+(a.message||"Action failed"))}}),r&&r.addEventListener("click",async()=>{const s=prompt("Reason for rejection (required):");if(!s){alert("A reason is required to reject.");return}try{await u.post(`/approvals/${t}/decide`,{decision:"REJECT",reason:s}),alert("Approval rejected."),window.location.hash="#/approvals"}catch(a){alert("Error: "+(a.message||"Action failed"))}})}async function Dt(){try{const t=await u.get("/products");return Array.isArray(t)?t:[]}catch{return[]}}function Nt(t=[]){const e=t.length>0?t:[],n=e.filter(i=>i.is_active!==!1).length,r=e.filter(i=>i.is_active===!1).length,s=new Set(e.map(i=>i.category)),a=e.length===0?`
      <tr>
        <td colspan="7" class="text-center text-on-surface-variant" style="padding: 2rem;">
          No products found. Click <strong class="text-primary">+ New Product</strong> to add one.
        </td>
      </tr>
    `:e.map(i=>{const l=Number(i.base_price||0),o=Number(i.tax_rate||0),c=i.unit||"Each",d=i.is_active!==!1,p=d?"badge-success":"badge-error",m=d?"Active":"Archived";return`
        <tr class="product-row" data-product-id="${i.id}" style="cursor:pointer">
          <td class="font-bold text-on-surface">${i.name}</td>
          <td>
            <span class="badge badge-neutral">${i.category||"-"}</span>
          </td>
          <td class="text-on-surface-variant">-</td>
          <td class="font-mono font-bold text-primary">$${l.toLocaleString()}</td>
          <td class="text-on-surface-variant">${c}</td>
          <td class="text-on-surface-variant">${o}%</td>
          <td><span class="badge ${p}">${m}</span></td>
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
            <div class="text-xl font-bold text-on-surface mt-1">${n} active, ${r} archived</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">inventory_2</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Pricelists</span>
            <div class="text-xl font-bold text-on-surface mt-1">${s.size} categories</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">list_alt</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Variants</span>
            <div class="text-xl font-bold text-on-surface mt-1">${e.length} SKUs</div>
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
                ${a}
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
  `}function qt(){const t=document.getElementById("btn-new-product");t&&t.addEventListener("click",()=>{window.location.hash="#/product-detail/new"}),document.querySelectorAll(".product-row").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-product-id");window.location.hash=`#/product-detail/${n}`})})}async function Tt(t){if(t==="new")return{product:null,variants:[]};try{const e=await u.get("/products"),n=Array.isArray(e)?e.find(s=>String(s.id)===String(t)):null;let r=[];if(n)try{r=await u.get(`/products/${t}/variants`)}catch{r=[]}return{product:n,variants:Array.isArray(r)?r:[]}}catch{return{product:null,variants:[]}}}function Rt(t){const{product:e,variants:n}=t,r=!e,s=(e==null?void 0:e.name)||"",a=(e==null?void 0:e.category)||"",i=(e==null?void 0:e.base_price)||"",l=(e==null?void 0:e.unit)||"",o=(e==null?void 0:e.description)||"",c=(e==null?void 0:e.tax_rate)||"",d="",p={};(n||[]).forEach(x=>{p[x.attribute_name]||(p[x.attribute_name]={values:[],extraPrices:[]}),p[x.attribute_name].values.push(x.value),p[x.attribute_name].extraPrices.push(Number(x.extra_price||0))});const m=Object.keys(p).length>0?Object.entries(p).map(([x,g])=>{const A=g.values.join(", "),C=g.extraPrices.map(h=>h===0?"0":`+$${h}`),P=[...new Set(C)];return`
          <tr>
            <td class="font-bold text-on-surface">${x}</td>
            <td class="text-on-surface-variant">${A}</td>
            <td class="text-on-surface-variant font-mono text-primary">${P.join("/")}</td>
          </tr>
        `}).join(""):'<tr><td colspan="3" class="text-center py-6 text-on-surface-variant text-sm">No variants added yet</td></tr>';return`
    <div class="page-container space-y-6">
      <!-- Back link & Title -->
      <div>
        <a href="#/products" class="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline mb-2" style="text-decoration:none">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Back to Products
        </a>
        <h1 class="text-2xl font-bold tracking-tight text-on-surface">${r?"New Product":"Product and pricelist"}</h1>
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
                <input type="text" id="pd-name" class="input-clay w-full" value="${s}" placeholder="Enter product name" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Category</label>
                <input type="text" id="pd-category" class="input-clay w-full" value="${a}" placeholder="e.g. Hardware, Services" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Price</label>
                <input type="number" id="pd-price" class="input-clay w-full font-mono" value="${i}" placeholder="0.00" step="0.01" min="0" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Unit</label>
                <input type="text" id="pd-unit" class="input-clay w-full" value="${l}" placeholder="e.g. Each, License" />
              </div>
              <div style="display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 1rem;">
                <label class="text-sm font-bold text-on-surface">Description</label>
                <input type="text" id="pd-description" class="input-clay w-full" value="${o}" placeholder="Product description" />
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
            ${r?"":`
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
          Product details should be filled. ${r?"":"Recurring order with this product will be invoiced at the beginning of the period."}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pb-8">
        <button type="button" class="btn btn-primary" id="btn-save-product" style="padding: 0.6rem 2rem;">
          <span class="material-symbols-outlined text-base">save</span>
          <span>${r?"Create Product":"Save Changes"}</span>
        </button>
        <a href="#/products" class="btn btn-secondary" style="padding: 0.6rem 2rem; text-decoration:none;">Cancel</a>
      </div>
    </div>
  `}function Mt(t){const e=document.getElementById("pd-subscription"),n=document.getElementById("recurring-group");if(e&&n){const a=()=>{n.style.display=e.value==="yes"?"grid":"none"};e.addEventListener("change",a),a()}const r=document.getElementById("btn-add-variant");r&&t&&t!=="new"&&r.addEventListener("click",async()=>{var o,c,d,p,m;const a=(c=(o=document.getElementById("new-attr-name"))==null?void 0:o.value)==null?void 0:c.trim(),i=(p=(d=document.getElementById("new-attr-value"))==null?void 0:d.value)==null?void 0:p.trim(),l=parseFloat((m=document.getElementById("new-attr-price"))==null?void 0:m.value)||0;if(!a||!i){alert("Please fill in attribute name and value.");return}r.disabled=!0;try{await u.post(`/products/${t}/variants`,{attribute_name:a,value:i,extra_price:l}),window.location.hash=`#/product-detail/${t}`,window.dispatchEvent(new HashChangeEvent("hashchange"))}catch(x){alert(x.message||"Failed to add variant"),r.disabled=!1}});const s=document.getElementById("btn-save-product");s&&s.addEventListener("click",async()=>{var m,x,g,A,C,P,h,v,k,E;const a=(x=(m=document.getElementById("pd-name"))==null?void 0:m.value)==null?void 0:x.trim(),i=(A=(g=document.getElementById("pd-category"))==null?void 0:g.value)==null?void 0:A.trim(),l=parseFloat((C=document.getElementById("pd-price"))==null?void 0:C.value)||0,o=(h=(P=document.getElementById("pd-unit"))==null?void 0:P.value)==null?void 0:h.trim(),c=parseFloat((v=document.getElementById("pd-tax"))==null?void 0:v.value)||0,d=((E=(k=document.getElementById("pd-description"))==null?void 0:k.value)==null?void 0:E.trim())||null;if(!a||!i||!o){alert("Please fill in product name, category, and unit.");return}const p={name:a,category:i,base_price:l,unit:o,tax_rate:c,description:d};s.disabled=!0,s.innerHTML='<span class="material-symbols-outlined text-lg">hourglass_top</span><span>Saving...</span>';try{if(!t||t==="new"){const D=await u.post("/products",p);window.location.hash=`#/product-detail/${D.id}`}else{try{await u.put(`/products/${t}`,p)}catch{}window.location.hash="#/products"}}catch(D){alert(D.message||"Failed to save product"),s.disabled=!1,s.innerHTML=`<span class="material-symbols-outlined text-lg">save</span><span>${t==="new"?"Create Product":"Save Changes"}</span>`}})}async function jt(){try{return await u.get("/discount-rules")}catch(t){return console.error("Failed to load discount rules",t),{tiers:[],categories:[],chains:[]}}}function Ft(t){const e=t.tiers||[],n=t.categories||[];t.chains;const r={Bronze:1,Silver:2,Gold:3};e.sort((i,l)=>(r[i.customer_tier]||99)-(r[l.customer_tier]||99));const s=e.map((i,l)=>`
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="tier-name-${l}" value="${i.customer_tier}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="tier-disc-${l}" value="${i.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join(""),a=n.map((i,l)=>`
    <tr>
      <td class="font-bold text-on-surface">
        <input type="text" class="input-clay" style="width:100%; max-width: 150px;" id="cat-name-${l}" value="${i.category}" />
      </td>
      <td class="text-on-surface-variant font-mono text-primary">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" class="input-clay" style="width: 80px;" id="cat-disc-${l}" value="${i.max_discount_percent}" step="0.01" min="0" max="100" />
          <span>percent</span>
        </div>
      </td>
    </tr>
  `).join("");return`
    <div class="page-container space-y-6" data-tiers-count="${e.length}" data-categories-count="${n.length}">
      
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
                  ${s}
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
                  ${a}
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
  `}function Ht(){const t=document.getElementById("btn-save-config");t&&t.addEventListener("click",async()=>{t.disabled=!0,t.textContent="Saving...";const e=document.querySelector(".page-container"),n=parseInt(e.getAttribute("data-tiers-count"))||0,r=parseInt(e.getAttribute("data-categories-count"))||0,s={tiers:[],categories:[],chains:[{min_score:1,required_level:"MANAGER_ONLY"}]};for(let a=0;a<n;a++)s.tiers.push({customer_tier:document.getElementById("tier-name-"+a).value,max_discount_percent:parseFloat(document.getElementById("tier-disc-"+a).value)});for(let a=0;a<r;a++)s.categories.push({category:document.getElementById("cat-name-"+a).value,max_discount_percent:parseFloat(document.getElementById("cat-disc-"+a).value)});try{await u.put("/discount-rules",s),alert("Configuration saved successfully!"),window.location.reload()}catch(a){alert("Error saving configuration: "+a.message),t.disabled=!1,t.textContent="Save configuration"}})}function Ut(t=[]){const e=t.length>0?t:[{id:1,name:"Acme Corp Global ERP",email:"procurement@acmeww.com",tier:"Gold",created_at:"2025-01-15"},{id:2,name:"Starlight Pharma Logistics",email:"operations@starlightpharma.com",tier:"Silver",created_at:"2025-02-01"},{id:3,name:"Helios Solar Microgrid Infra",email:"infrastructure@heliosmicro.io",tier:"Gold",created_at:"2025-02-18"},{id:4,name:"Apex Financial Cloud Vault",email:"finops@apexvault.com",tier:"Bronze",created_at:"2025-03-02"}],n=e.map(r=>{let s="badge-primary";const a=(r.tier||"Bronze").toLowerCase();return a.includes("gold")?s="badge-warning":a.includes("silver")&&(s="badge-neutral"),`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="avatar-sm">
              <span>${r.name.substring(0,2).toUpperCase()}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${r.name}</span>
              <span class="text-[10px] text-on-surface-variant font-mono">ID #${r.id}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">${r.email}</td>
        <td class="py-3 px-4">
          <span class="badge ${s} text-[10px] font-bold">${r.tier||"Bronze"}</span>
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          ${r.created_at?new Date(r.created_at).toLocaleDateString():"Active"}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" class="btn btn-primary text-xs py-1 px-2.5 create-deal-for-cust-btn" data-cust-id="${r.id}">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>New Deal</span>
            </button>
            <a href="#/portal?customerId=${r.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="Customer Portal">
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
            <div class="text-xl font-bold text-on-surface mt-1">${e.length} Enterprise Entities</div>
          </div>
          <div class="icon-circle bg-surface-container-high/60">
            <span class="material-symbols-outlined text-primary text-lg">corporate_fare</span>
          </div>
        </div>

        <div class="card card-extruded flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-on-surface-variant uppercase">Gold Tier Entities</span>
            <div class="text-xl font-bold text-tertiary mt-1">
              ${e.filter(r=>(r.tier||"").toLowerCase().includes("gold")).length} Accounts
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
  `}async function Ot(){try{return await u.get("/customers")}catch{return[]}}function Qt(){const t=document.getElementById("cust-search-input"),e=document.getElementById("customers-table");t&&e&&t.addEventListener("input",r=>{const s=r.target.value.toLowerCase();e.querySelectorAll("tbody tr").forEach(i=>{i.style.display=i.textContent.toLowerCase().includes(s)?"":"none"})});const n=document.getElementById("btn-add-customer");n&&n.addEventListener("click",()=>{U.show({title:"Add Enterprise Client Account",content:`
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
        `,confirmText:"Create Account",onConfirm:async()=>{const r=document.getElementById("new-cust-name").value.trim(),s=document.getElementById("new-cust-email").value.trim(),a=document.getElementById("new-cust-tier").value;if(!r||!s)throw new Error("Company name and email are required");return await u.post("/customers",{name:r,email:s,tier:a}),window.location.reload(),!0}})}),document.querySelectorAll(".create-deal-for-cust-btn").forEach(r=>{r.addEventListener("click",async()=>{const s=parseInt(r.getAttribute("data-cust-id"),10);try{const a=await u.post("/quotations",{customer_id:s});window.location.hash=`#/quotations/${a.id}`}catch(a){alert(a.message||"Failed to create quotation")}})})}function Gt(t={}){const{quotation:e=null}=t,n=e||{id:8492,deal_reference:"DEAL-8492",customer_name:"Acme Corp Global ERP",total_amount:34e4,status:"Under Negotiation",lines:[{product_name:"Enterprise Cloud Orchestration Node",quantity:2,unit_price:12e4,line_total:24e4},{product_name:"Architecture Consulting & Migration SLA",quantity:1,unit_price:1e5,line_total:1e5}]},r=["Confirmed","Fulfilled"].includes(n.status);return`
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
              <span class="badge ${r?"badge-success":"badge-info"} text-xs">${n.status||"Under Negotiation"}</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Secure Procurement Portal for <strong class="text-on-surface">${n.customer_name}</strong> • ${n.deal_reference||`DEAL-${n.id}`}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${r?`
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
                  ${(n.lines||[]).map(s=>`
                    <tr class="table-row border-b border-surface-container-high/40 text-xs">
                      <td class="py-3 px-4 font-bold text-on-surface">${s.product_name||`Item #${s.product_id}`}</td>
                      <td class="py-3 px-4 font-mono">${s.quantity}</td>
                      <td class="py-3 px-4 font-mono">₹${Number(s.unit_price).toLocaleString("en-IN")}</td>
                      <td class="py-3 px-4 font-mono font-bold text-primary text-right">₹${Number(s.line_total).toLocaleString("en-IN")}</td>
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
  `}async function zt(t){try{const e=await u.get("/quotations"),n=t?e.find(r=>r.id===parseInt(t,10)):e[0];return n?{quotation:await u.get(`/quotations/${n.id}`).catch(()=>n)}:{quotation:null}}catch{return{quotation:null}}}function Vt(t){const e=(t==null?void 0:t.id)||8492,n=document.getElementById("btn-portal-accept");n&&n.addEventListener("click",async()=>{if(confirm("Confirm digital signature and ratify this commercial agreement?"))try{await u.put(`/quotations/${e}`,{status:"Confirmed"}),alert("Quotation digitally signed and ratified! Deal status updated to Confirmed."),window.location.reload()}catch(i){alert(i.message||"Signature failed")}});const r=document.getElementById("btn-send-portal-msg"),s=document.getElementById("portal-reply-text"),a=document.getElementById("portal-messages-list");r&&s&&a&&r.addEventListener("click",()=>{const i=s.value.trim();if(!i)return;const l=`
        <div class="p-3 rounded-2xl bg-surface-container-lowest border border-primary-container/60 shadow-sm ml-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-secondary">Procurement Lead (Acme Corp)</span>
            <span class="text-[10px] text-on-surface-variant">Just now</span>
          </div>
          <p class="text-on-surface">${i}</p>
        </div>
      `;a.insertAdjacentHTML("beforeend",l),s.value="",a.scrollTop=a.scrollHeight})}const Wt=[{id:1,deal_reference:"DEAL-0001",customer_name:"Bronze Buyer",status:"Confirmed",line_count:2,total_amount:1300},{id:2,deal_reference:"DEAL-0002",customer_name:"Gold Buyer",status:"Confirmed",line_count:1,total_amount:1500}];function Jt(t={}){var a,i;const e=(a=t.warehouses)!=null&&a.length?t.warehouses:[{id:1,name:"Equinix NY4 North America Hub",code:"WH-US-EAST",location:"Secaucus, NJ"},{id:2,name:"Frankfurt FRA1 European Gateway",code:"WH-EU-CENTRAL",location:"Frankfurt, DE"}],n=(i=t.quotations)!=null&&i.length?t.quotations.filter(l=>l.line_count>0&&!["Fulfilled","Rejected"].includes(l.status)):Wt.filter(l=>l.line_count>0),r=e.map(l=>`<div class="card card-extruded"><div class="flex items-start justify-between"><span class="badge badge-primary font-mono text-[10px]">${l.code||`WH-${l.id}`}</span><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">warehouse</span></div></div><h3 class="text-sm font-bold mt-3">${l.name}</h3><p class="text-xs text-on-surface-variant">${l.location||"Global Hub"}</p><div class="pt-2 mt-3 border-t border-surface-container-high/60 text-xs"><span class="text-on-surface-variant">Available stock</span><strong class="block text-primary">Live inventory view</strong></div></div>`).join(""),s=n.map(l=>`<a class="fulfillment-order-row" href="#/fulfillment/${l.id}"><div><strong class="block text-sm">${l.deal_reference||`DEAL-${String(l.id).padStart(4,"0")}`}</strong><span class="text-[11px] text-on-surface-variant">${l.customer_name||"Customer entity"}</span></div><div><strong class="block text-sm">${l.line_count||0} line items</strong><span class="text-[11px] text-on-surface-variant">${l.total_amount?`₹${Number(l.total_amount).toLocaleString("en-IN")}`:"Awaiting allocation"}</span></div><div><span class="badge badge-warning text-[10px]">Awaiting Fulfillment</span></div><span class="material-symbols-outlined text-on-surface-variant">chevron_right</span></a>`).join("");return`<div class="page-container space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Smart logistics &amp; warehousing</span></div><h1 class="text-2xl font-bold tracking-tight">Fulfillment &amp; Stock Allocation</h1><p class="text-xs text-on-surface-variant">Review awaiting orders, inspect stock coverage, and route each shipment.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-suggest-split"><span class="material-symbols-outlined text-base">auto_fix_high</span><span>Auto-Suggest Optimal Split</span></button></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${r}</div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Awaiting Fulfillment</h2><p class="text-xs text-on-surface-variant">Select an order to open its fulfillment detail and stock plan.</p></div><span class="badge badge-warning text-[10px]">${n.length} pending</span></div><div class="space-y-2">${s||'<p class="text-sm text-on-surface-variant py-6 text-center">No orders are awaiting fulfillment.</p>'}</div></section></div>`}async function Yt(){try{const[t,e]=await Promise.all([u.get("/warehouses").catch(()=>[]),u.get("/quotations").catch(()=>[])]);return{warehouses:t,quotations:e}}catch{return{warehouses:[],quotations:[]}}}function Kt(){var t;(t=document.getElementById("btn-suggest-split"))==null||t.addEventListener("click",async()=>{const e=document.getElementById("btn-suggest-split"),n=e.innerHTML;e.disabled=!0,e.innerHTML='<span class="loading-spinner w-4 h-4 border-2 border-primary border-t-transparent"></span><span>Calculating Split...</span>';try{const s=(await u.get("/quotations")).find(a=>a.line_count>0&&!["Fulfilled","Rejected"].includes(a.status));if(!s)throw new Error("No quotation with line items is awaiting fulfillment.");await u.get(`/fulfillment/suggested-split?quotation_id=${s.id}`),window.location.hash=`#/fulfillment/${s.id}`}catch(r){alert(`Could not calculate fulfillment split: ${r.message}`)}finally{e.disabled=!1,e.innerHTML=n}})}function Xt(t={}){var a;const e=t.quote||{},n=t.split||{lines:[],status:"suggested",shipment_count:0,estimated_cost:0},r=e.lines||[],s=(a=n.lines)!=null&&a.length?n.lines.map(i=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${i.product_name||`Product #${i.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${i.quantity_required||i.quantity_fulfilled+i.quantity_backordered||0}</td><td class="py-3 px-4 text-xs">${i.warehouse_name||"Backorder"}</td><td class="py-3 px-4 font-mono text-xs">${i.quantity_fulfilled}</td><td class="py-3 px-4 font-mono text-xs ${i.quantity_backordered?"text-error font-bold":""}">${i.quantity_backordered}</td><td class="py-3 px-4"><span class="badge ${i.quantity_backordered?"badge-warning":"badge-success"} text-[10px]">${i.quantity_backordered?"Partial":"Allocated"}</span></td></tr>`).join(""):r.map(i=>`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 text-xs font-bold">${i.product_name||`Product #${i.product_id}`}</td><td class="py-3 px-4 font-mono text-xs">${i.quantity}</td><td class="py-3 px-4 text-xs">Awaiting split</td><td class="py-3 px-4 font-mono text-xs">0</td><td class="py-3 px-4 font-mono text-xs text-tertiary">${i.quantity}</td><td class="py-3 px-4"><span class="badge badge-warning text-[10px]">Awaiting</span></td></tr>`).join("");return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">${e.deal_reference||`DEAL-${e.id||""}`}</span></div><div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Awaiting fulfillment</span></div><h1 class="text-xl font-bold mt-2">${e.deal_reference||"Fulfillment Detail"}</h1><p class="text-sm font-bold mt-1">${e.customer_name||"Customer entity"}</p><p class="text-xs text-on-surface-variant mt-1">Review stock coverage and confirm the warehouse allocation before dispatch.</p></div><div class="flex gap-2"><button type="button" class="btn btn-secondary text-xs" id="btn-open-override"><span class="material-symbols-outlined text-sm">edit_note</span><span>Manual Override</span></button><button type="button" class="btn btn-primary text-xs" id="btn-accept-fulfillment"><span class="material-symbols-outlined text-sm">done_all</span><span>Accept &amp; Dispatch</span></button></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded fulfillment-stat"><span>Order value</span><strong>₹${Number(e.total_amount||0).toLocaleString("en-IN")}</strong><em>${e.status||"Confirmed"}</em></div><div class="card card-extruded fulfillment-stat"><span>Shipment count</span><strong>${n.shipment_count||0}</strong><em>Suggested warehouse routes</em></div><div class="card card-extruded fulfillment-stat"><span>Estimated freight</span><strong>₹${Number(n.estimated_cost||0).toLocaleString("en-IN")}</strong><em>${n.has_backorders?"Backorder requires review":"Stock covered"}</em></div></div><section class="card card-extruded"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold">Stock Allocation Detail</h2><p class="text-xs text-on-surface-variant">Live suggested split for each quotation line.</p></div><span class="badge badge-primary text-[10px]">${n.status||"suggested"}</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="text-[11px] font-bold uppercase text-on-surface-variant bg-surface-container-low/50"><th class="py-2.5 px-4">Product</th><th class="py-2.5 px-4">Required</th><th class="py-2.5 px-4">Warehouse</th><th class="py-2.5 px-4">Allocated</th><th class="py-2.5 px-4">Backorder</th><th class="py-2.5 px-4">State</th></tr></thead><tbody>${s||'<tr><td colspan="6" class="py-8 text-center text-xs text-on-surface-variant">No quotation lines found.</td></tr>'}</tbody></table></div></section><section class="card card-extruded"><h2 class="text-base font-bold mb-3">Dispatch Readiness</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer</span><strong>${e.customer_name||"Unknown customer"}</strong></div><div><span class="detail-label">Line items</span><strong>${r.length}</strong></div><div><span class="detail-label">Target service level</span><strong class="text-primary">48 hours after acceptance</strong></div></div></section></div>`}async function Zt(t){const[e,n]=await Promise.all([u.get(`/quotations/${t}`).catch(()=>null),u.get(`/fulfillment/suggested-split?quotation_id=${t}`).catch(()=>null)]);return{quote:e,split:n}}function te(t){var e,n;(e=document.getElementById("btn-open-override"))==null||e.addEventListener("click",()=>{window.location.hash=`#/fulfillment-override/${t}`}),(n=document.getElementById("btn-accept-fulfillment"))==null||n.addEventListener("click",async()=>{var r;try{const s=await u.get(`/quotations/${t}`);if(!((r=s==null?void 0:s.lines)!=null&&r.length)){alert("This quotation has no line items to dispatch. Add a product line before accepting fulfillment.");return}await u.get(`/fulfillment/suggested-split?quotation_id=${t}`),await u.post("/fulfillment/accept",{quotation_id:Number(t)}),alert("Fulfillment accepted and stock reserved."),window.location.hash="#/fulfillment"}catch(s){alert(`Could not accept fulfillment: ${s.message}. Configure warehouse stock before dispatching.`)}})}function ee(t={}){var s;const e=((s=t.lines)==null?void 0:s[0])||{},n=e.discount_percent!=null?`${e.discount_percent}%`:"Not set";return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Fulfillment Detail</span></a><span class="text-xs text-outline">/ Manual Override</span></div><div class="card card-extruded"><div class="flex items-center gap-3"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">gavel</span></div><div><div class="flex items-center gap-2"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary uppercase tracking-widest">Pending approval workflow</span></div><h1 class="text-xl font-bold mt-1">Manual Override</h1><p class="text-xs text-on-surface-variant">Submit a controlled commercial change for manager approval.</p></div></div></div><form id="manual-override-form" class="space-y-4"><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">1. Override Type</h2><p class="text-xs text-on-surface-variant">Choose which commercial term requires an exception.</p></div><select id="override-type" class="input-clay w-full" required><option value="Discount override">Discount override</option><option value="Price override">Price override</option><option value="Quantity override">Quantity override</option><option value="Payment-term override">Payment-term override</option></select></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">2. Current vs New Value</h2><p class="text-xs text-on-surface-variant">Quotation: <strong>${t.deal_reference||`DEAL-${t.id||""}`}</strong> · Customer: <strong>${t.customer_name||"Customer entity"}</strong></p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><label>Current value<input id="current-value" class="input-clay w-full mt-1" value="${n}" required /></label><label>Allowed maximum<input id="allowed-maximum" class="input-clay w-full mt-1" value="15%" required /></label><label>New value<input id="new-value" class="input-clay w-full mt-1" placeholder="e.g. 20%" required /></label></div></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">3. Reason</h2><p class="text-xs text-on-surface-variant">Explain the customer or deal event that requires this override.</p></div><textarea id="override-reason" class="input-clay w-full" rows="3" minlength="10" required placeholder="Customer requested additional discount for bulk order."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">4. Business Justification</h2><p class="text-xs text-on-surface-variant">Include expected order value, customer importance, competitive pricing, or strategic deal context.</p></div><textarea id="business-justification" class="input-clay w-full" rows="4" minlength="10" required placeholder="Expected annual order of ₹25 Lakhs; strategic expansion account."></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">5. Supporting Information</h2><p class="text-xs text-on-surface-variant">Optional competitor quote or document reference.</p></div><textarea id="supporting-information" class="input-clay w-full" rows="2" placeholder="Competitor quote ID, attachment reference, or additional context"></textarea></section><section class="card card-extruded space-y-4"><div><h2 class="text-base font-bold">6. Approval</h2><p class="text-xs text-on-surface-variant">Select the responsible manager. The request will be submitted as Pending Approval.</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><label>Approver<select id="approver" class="input-clay w-full mt-1" required><option value="Sales Manager">Sales Manager</option><option value="Finance Operations">Finance Operations</option><option value="Administrator">Administrator</option></select></label><div><span class="detail-label">Override status</span><span class="badge badge-warning text-[10px]">Pending Approval</span></div></div></section><div class="flex justify-end gap-2"><a href="#/fulfillment/${t.id}" class="btn btn-secondary text-xs">Cancel</a><button type="submit" class="btn btn-primary text-xs"><span class="material-symbols-outlined text-sm">send</span><span>Submit Override</span></button></div></form></div>`}async function ae(t){try{return await u.get(`/quotations/${t}`)}catch{return{id:t}}}function se(t){var e;(e=document.getElementById("manual-override-form"))==null||e.addEventListener("submit",async n=>{n.preventDefault();const r=n.currentTarget;if(!r.checkValidity()){r.reportValidity();return}const s=a=>document.getElementById(a).value.trim();try{await u.post("/fulfillment/manual-override",{quotation_id:Number(t),override_type:s("override-type"),current_value:s("current-value"),allowed_maximum:s("allowed-maximum"),new_value:s("new-value"),reason:s("override-reason"),business_justification:s("business-justification"),supporting_information:s("supporting-information")||null,approver:s("approver")}),alert("Override submitted for approval."),window.location.hash=`#/fulfillment/${t}`}catch(a){alert(`Could not submit override: ${a.message}`)}})}function ne(t=[]){const e=Array.isArray(t)&&t.length>0?t:[{id:1,number:"INV-2024-1101",deal_ref:"DEAL-8492",customer_name:"Starlight Dynamics Inc.",milestone:"Series B Expansion",icon:"verified_user",amount:260925,status:"Pending",due_date:"Oct 28, 2024"},{id:2,number:"INV-2024-1102",deal_ref:"DEAL-8488",customer_name:"Nexus Health Systems",milestone:"Series B Milestone",icon:"receipt_long",amount:13e4,status:"Paid",due_date:"Oct 1, 2024"},{id:3,number:"INV-2024-1103",deal_ref:"DEAL-8475",customer_name:"Vanguard Logistics International",milestone:"Q3 Infrastructure",icon:"local_shipping",amount:45e3,status:"Pending",due_date:"Oct 15, 2024"},{id:4,number:"INV-2024-1104",deal_ref:"DEAL-8461",customer_name:"AeroSphere Aerospace Holdings",milestone:"Advisory Mandate Phase I",icon:"flight_takeoff",amount:222500,status:"Pending",due_date:"Nov 1, 2024"},{id:5,number:"INV-2024-1100",deal_ref:"DEAL-8450",customer_name:"Borealis CleanTech JV",milestone:"Escrow Release Tier 3",icon:"corporate_fare",amount:89200,status:"Overdue",due_date:"Sep 15, 2024"}],n=e.reduce((a,i)=>a+(Number(i.amount)||0),0),r=e.filter(a=>(a.status||"").toLowerCase()==="paid").length,s=e.map(a=>{const i=(a.status||"").toLowerCase();let l="";return i==="paid"?l='<span class="badge badge-success text-[10px]">Paid</span>':i==="overdue"?l='<span class="badge badge-error text-[10px]">Overdue</span>':l='<span class="badge badge-warning text-[10px]">Pending</span>',`
      <tr class="table-row border-b border-surface-container-high/40 hover:bg-surface-container/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-primary">
          <a href="#/invoices/${a.id}" class="hover:underline">${a.number||`INV-${a.id}`}</a>
        </td>
        <td class="py-3 px-4 font-mono text-on-surface-variant">${a.deal_ref||""}</td>
        <td class="py-3 px-4 font-bold text-on-surface">${a.customer_name||"Customer"}</td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">₹${Number(a.amount).toLocaleString("en-IN")}</td>
        <td class="py-3 px-4 text-on-surface-variant">${a.due_date||"Net 30"}</td>
        <td class="py-3 px-4">${l}</td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <a href="#/invoices/${a.id}" class="btn btn-secondary text-xs py-1 px-2.5" title="View Detail">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span>Preview</span>
            </a>
            <button type="button" class="btn btn-secondary text-xs py-1 px-2 download-pdf-btn" data-id="${a.id}" data-number="${a.number||`INV-${a.id}`}" title="Download PDF">
              <span class="material-symbols-outlined text-sm text-primary">download</span>
            </button>
            ${i!=="paid"?`
              <button type="button" class="btn btn-primary text-xs py-1 px-2.5 settle-btn" data-id="${a.id}">
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
            <div class="text-xl font-bold font-mono text-primary mt-1">${r} of ${e.length} Paid</div>
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
              ${s}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}async function re(){try{const t=await u.get("/payments/invoices");return Array.isArray(t)?t:[]}catch{return[]}}function oe(){document.querySelectorAll(".download-pdf-btn").forEach(e=>{e.addEventListener("click",async()=>{const n=e.getAttribute("data-id"),r=e.getAttribute("data-number");try{await u.downloadFile(`/payments/invoices/${n}/pdf`,`DealFlow360_Invoice_${r}.pdf`)}catch(s){alert("PDF download failed: "+s.message)}})}),document.querySelectorAll(".settle-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-id");window.location.hash=`#/invoices/${n}`})});const t=document.getElementById("btn-create-invoice");t&&t.addEventListener("click",()=>{alert("Batch invoice generation engine executed: All billable quotation milestones synchronized.")})}function ie(t){if(!t||!t.id)return`
      <div class="page-container flex items-center justify-center min-h-[60vh]">
        <div class="card card-extruded p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span>
          <h2 class="text-lg font-bold text-on-surface">Invoice Not Found</h2>
          <p class="text-xs text-on-surface-variant mt-1">The requested invoice could not be loaded.</p>
          <a href="#/invoices" class="btn btn-primary text-xs mt-4">← Back to Invoices</a>
        </div>
      </div>
    `;const e=(t.status||"").toLowerCase()==="paid",n=t.lines||[],r=n.reduce((d,p)=>d+(Number(p.amount)||0),0)||Number(t.amount)||0,s=r*.065,a=r+s,i=t.payments||[];i.reduce((d,p)=>d+(Number(p.amount)||0),0);const l=e?'<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E9F3EC] text-[#3D6847] border border-[#C5E2CB]">Paid &amp; Reconciled</span>':'<span class="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-primary">Pending Payment</span>',o=n.map((d,p)=>`
    <tr class="border-b border-surface-container-high/30 hover:bg-surface-container/30 transition-colors">
      <td class="py-3 px-4 text-xs text-on-surface-variant font-mono">${p+1}</td>
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
  `).join(""),c=i.length>0?`
    <div class="card card-extruded space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
          <h3 class="text-sm font-bold text-on-surface">Payment Settlement History</h3>
        </div>
        <span class="badge badge-success text-[10px]">${i.length} Payment(s)</span>
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
            ${i.map(d=>`
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
                ${l}
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
            ${e?"":`
              <button type="button" class="btn btn-primary text-xs py-1.5 px-4" id="btn-record-payment" data-id="${t.id}" data-amount="${a}">
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
              ${o}
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
              <p class="font-mono font-bold text-on-surface">₹${Number(r).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-secondary">Tax (6.5%)</span>
              <p class="font-mono text-on-surface">₹${Number(s).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
            <div class="text-right px-4 py-2 rounded-xl bg-surface-container-low" style="box-shadow: 3px 3px 8px rgba(168,181,160,0.2),-2px -2px 6px rgba(255,255,255,0.9);">
              <span class="text-[10px] text-primary font-bold uppercase">Total Due</span>
              <p class="font-mono text-lg font-extrabold text-primary">₹${Number(a).toLocaleString("en-IN",{minimumFractionDigits:2})}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments History -->
      ${c}
    </div>
  `}async function le(t){try{return await u.get(`/payments/invoices/${t}`)}catch(e){return console.warn("Could not fetch invoice detail:",e),null}}function ce(t){if(!t)return;const e=document.getElementById("btn-download-pdf");e&&e.addEventListener("click",async()=>{try{const s=`DealFlow360_Invoice_${t.number||t.id}.pdf`;await u.downloadFile(`/payments/invoices/${t.id}/pdf`,s)}catch(s){alert("Error generating PDF: "+s.message)}});const n=document.getElementById("btn-send-reminder");n&&n.addEventListener("click",()=>{alert(`Dispatched automated billing reminder to ${t.customer_name||"Buyer"} AP desk.`)});const r=document.getElementById("btn-record-payment");r&&r.addEventListener("click",()=>{const s=r.getAttribute("data-amount");U.show({title:"Record Payment Signoff",content:`
          <div class="space-y-4 text-xs">
            <p class="text-on-surface-variant">
              Record a settled financial transaction into the dedicated <b>Payment</b> ledger table.
            </p>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Payment Amount (₹)</label>
              <input id="payment-amount-input" type="number" step="0.01" class="input-clay w-full text-xs font-mono font-bold" value="${s||t.amount}" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-on-surface">Wire / Bank Reference</label>
              <input id="payment-ref-input" type="text" class="input-clay w-full text-xs font-mono" value="WIRE-CHASE-${Math.floor(1e5+Math.random()*9e5)}" />
            </div>
          </div>
        `,confirmText:"Execute Payment Signoff",onConfirm:async()=>{var l,o,c;const a=parseFloat((l=document.getElementById("payment-amount-input"))==null?void 0:l.value)||0,i=((c=(o=document.getElementById("payment-ref-input"))==null?void 0:o.value)==null?void 0:c.trim())||"WIRE-DIRECT";try{return await u.post(`/payments/invoices/${t.id}/pay`,{amount:a,reference:i}),alert(`Payment of ₹${a.toLocaleString("en-IN")} recorded successfully!`),window.location.hash=`#/invoices/${t.id}`,window.location.reload(),!0}catch(d){return alert("Failed to record payment: "+d.message),!1}}})})}const de=[{id:1,name:"Enterprise M&A Platform Core",cadence:"yearly",price:12e4,product_id:1},{id:2,name:"Deal Desk Executive Seat",cadence:"monthly",price:350,product_id:2},{id:3,name:"Mission-Critical 24/7 Support SLA",cadence:"yearly",price:45e3,product_id:3}],W=t=>`₹${Number(t||0).toLocaleString("en-IN")}`,pe=t=>(t||"yearly").replace(/^./,e=>e.toUpperCase());function ue(t=[]){const e=Array.isArray(t)&&t.length?t:de,n=e.filter(a=>a.is_active!==!1&&a.status!=="Canceled"),r=e.reduce((a,i)=>a+Number(i.price||0)/((i.cadence||"").toLowerCase()==="monthly"?1:12),0),s=e.map((a,i)=>{const l=pe(a.cadence),o=a.is_active===!1||a.status==="Canceled"?"Canceled":"Active";return`<a class="subscription-row" href="#/subscriptions/${a.id}" data-search="${`${a.name} ${a.id} ${a.product_id}`.toLowerCase()}">
      <div class="subscription-plan-cell"><div class="icon-circle bg-surface-container-high/60"><span class="material-symbols-outlined text-primary">${i%2?"memory":"cloud_sync"}</span></div><div class="min-w-0"><strong class="block text-sm text-on-surface truncate">${a.name}</strong><span class="text-[11px] text-on-surface-variant"><span class="font-mono">SUB-${String(a.id).padStart(4,"0")}</span> · Product ${a.product_id||"N/A"} · ${l} entitlement</span></div></div>
      <div><strong class="block text-sm text-on-surface">${a.customer_name||"Unassigned account"}</strong><span class="text-[11px] text-on-surface-variant">${a.tier||"Enterprise"} · Master agreement</span></div>
      <div><strong class="font-mono text-sm text-on-surface">${W(a.price)} <span class="text-[11px] font-sans text-on-surface-variant">/ ${l==="Monthly"?"mo":"yr"}</span></strong><span class="block text-[11px] text-on-surface-variant">${l} recurring billing</span></div>
      <div><strong class="font-mono text-xs text-on-surface">${a.next_bill||(i%2?"Nov 30, 2026":"Dec 15, 2026")}</strong><span class="block text-[11px] text-primary">Auto-renewal on</span></div>
      <div><span class="badge ${o==="Active"?"badge-success":"badge-warning"} text-[10px]">${o}</span></div><span class="subscription-row-arrow material-symbols-outlined" aria-hidden="true">chevron_right</span>
    </a>`}).join("");return`<div class="page-container space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="pulse-dot"></span><span class="text-xs font-bold text-primary tracking-widest uppercase">Billing engine active · Ledger OK</span></div><h1 class="text-2xl font-bold tracking-tight text-on-surface">Subscriptions &amp; Recurring Billing</h1><p class="text-sm text-on-surface-variant">Manage recurring contracts, renewal timing, and billing schedules across customer entities.</p></div><button type="button" class="btn btn-primary text-xs" id="btn-add-plan"><span class="material-symbols-outlined text-base">add_circle</span><span>New Subscription Plan</span></button></div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><div class="card card-extruded subscription-metric"><span>Active MRR Run-Rate</span><strong>${W(r)}<small>/mo</small></strong><em>ARR: ${W(r*12)}</em></div><div class="card card-extruded subscription-metric"><span>Active Subscriptions</span><strong>${n.length}</strong><em>${n.length} active contracts</em></div><div class="card card-extruded subscription-metric"><span>Gross Monthly Churn</span><strong>0.8%<small>vol/mo</small></strong><em>Benchmark &lt; 1.50%</em></div><div class="card card-extruded subscription-metric"><span>Auto-Renewal Pacing</span><strong>94.6%<small>secured</small></strong><em>45 in 60-day horizon</em></div></div>
    <section class="card card-extruded subscription-workspace"><div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-4"><div class="subscription-filters" role="tablist"><button type="button" class="subscription-filter active" data-filter="all">All Subscriptions <b>${e.length}</b></button><button type="button" class="subscription-filter" data-filter="active">Active <b>${n.length}</b></button><button type="button" class="subscription-filter" data-filter="renewal">Renewal Due <b>0</b></button><button type="button" class="subscription-filter" data-filter="suspended">Suspended / Trial <b>0</b></button></div><label class="subscription-search"><span class="material-symbols-outlined">search</span><input id="subscription-search" type="search" placeholder="Search customer, plan ID, or tag..." /></label></div><div class="subscription-table-head"><span>Plan &amp; entitlement</span><span>Customer entity</span><span>Commit value &amp; cycle</span><span>Next bill</span><span>State</span><span></span></div><div id="subscription-rows" class="space-y-2">${s}</div><p id="subscription-empty" class="hidden text-center text-sm text-on-surface-variant py-8">No subscriptions match this view.</p><div class="flex items-center justify-between gap-3 pt-4 text-xs text-on-surface-variant"><span>Showing <strong class="text-on-surface">${e.length}</strong> of ${e.length} recurring contracts</span><span class="font-mono">Page 1</span></div></section>
    <section class="card card-extruded space-y-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">calculate</span><div><h3 class="text-base font-bold">Mid-Cycle Seat Upgrade &amp; Proration</h3><p class="text-xs text-on-surface-variant">Preview the delta before changing a recurring contract.</p></div></div><div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"><label>Active plan<select class="input-clay w-full mt-1" id="prorate-plan"><option value="4200">Executive Seats (₹4,200/yr)</option><option value="120000">Enterprise Core (₹120k/yr)</option></select></label><label>Seats added<input type="number" id="prorate-seats" min="1" value="5" class="input-clay w-full mt-1" /></label><label>Days remaining<input type="number" id="prorate-days" min="1" max="365" value="142" class="input-clay w-full mt-1" /></label><label>Proration delta<div class="font-mono font-bold text-base text-primary p-2 mt-1 rounded-lg bg-surface-container" id="prorate-result">₹8,169.86</div></label></div></section>
  </div>`}async function me(){try{return await u.get("/subscriptions/plans")}catch{return[]}}function fe(){var p;const t=document.getElementById("subscription-search"),e=[...document.querySelectorAll(".subscription-row")],n=document.getElementById("subscription-empty"),r=[...document.querySelectorAll(".subscription-filter")];let s="all";const a=()=>{const m=((t==null?void 0:t.value)||"").toLowerCase().trim();let x=0;e.forEach(g=>{const A=!m||g.dataset.search.includes(m),C=s!=="active"||g.querySelector(".badge-success");g.classList.toggle("hidden",!A||!C),A&&C&&(x+=1)}),n==null||n.classList.toggle("hidden",x>0)};t==null||t.addEventListener("input",a),r.forEach(m=>m.addEventListener("click",()=>{s=m.dataset.filter,r.forEach(x=>x.classList.toggle("active",x===m)),a()}));const i=document.getElementById("prorate-seats"),l=document.getElementById("prorate-days"),o=document.getElementById("prorate-plan"),c=document.getElementById("prorate-result"),d=()=>{c&&(c.textContent=W(Number(o==null?void 0:o.value)/365*Number((l==null?void 0:l.value)||0)*Number((i==null?void 0:i.value)||0)))};[i,l,o].forEach(m=>m==null?void 0:m.addEventListener("input",d)),(p=document.getElementById("btn-add-plan"))==null||p.addEventListener("click",()=>U.show({title:"New Subscription Plan",content:'<input id="plan-name-in" type="text" class="input-clay w-full" placeholder="Plan name" /><input id="plan-price-in" type="number" class="input-clay w-full mt-3" placeholder="Base rate (INR)" />',confirmText:"Create Plan",onConfirm:async()=>{const m=document.getElementById("plan-name-in").value.trim(),x=Number(document.getElementById("plan-price-in").value);if(!m||!x)throw new Error("Plan name and price are required");return await u.post("/subscriptions/plans",{name:m,cadence:"yearly",product_id:1,price:x}),window.location.reload(),!0}}))}const V=t=>`₹${Number(t||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`,it=t=>(t||"yearly").replace(/^./,e=>e.toUpperCase());function xe(t){var i;if(!(t!=null&&t.id))return'<div class="page-container flex items-center justify-center min-h-[60vh]"><div class="card card-extruded p-8 text-center"><span class="material-symbols-outlined text-4xl text-outline mb-3">error_outline</span><h2 class="text-lg font-bold">Subscription Not Found</h2><a href="#/subscriptions" class="btn btn-primary text-xs mt-4">Back to Subscriptions</a></div></div>';const e=t.schedules||[],n=e.filter(l=>l.status==="Billed").reduce((l,o)=>l+Number(o.amount||0),0),r=e.filter(l=>l.status==="Scheduled").reduce((l,o)=>l+Number(o.amount||0),0),s=e.length?e.map(l=>{var o;return`<tr class="border-b border-surface-container-high/40"><td class="py-3 px-4 font-mono text-xs">${l.projected?"PROJECTED":`BILL-${String(l.id).padStart(5,"0")}`}</td><td class="py-3 px-4 font-mono text-xs">${l.billing_date||"Scheduled"}</td><td class="py-3 px-4 text-xs">${l.customer_name||((o=t.customers)==null?void 0:o[0])||"Unassigned account"}</td><td class="py-3 px-4 font-mono text-xs text-right font-bold">${V(l.amount)}</td><td class="py-3 px-4"><span class="badge ${l.status==="Billed"?"badge-success":"badge-warning"} text-[10px]">${l.status||"Scheduled"}</span></td></tr>`}).join(""):'<tr><td colspan="5" class="py-8 text-center text-xs text-on-surface-variant">No billing cycles have been generated for this subscription yet.</td></tr>',a=t.is_active!==!1;return`<div class="page-container space-y-6"><div class="flex items-center gap-3"><a href="#/subscriptions" class="btn btn-secondary text-xs py-1.5 px-3"><span class="material-symbols-outlined text-sm">arrow_back</span><span>Back to Subscriptions</span></a><span class="text-xs text-outline">/</span><span class="text-xs font-mono font-bold text-primary">SUB-${String(t.id).padStart(4,"0")}</span></div>
    <div class="card card-extruded"><div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary"><span class="material-symbols-outlined text-3xl">receipt_long</span></div><div><div class="flex items-center gap-2 flex-wrap"><h1 class="text-xl font-bold text-on-surface">Billing Detail</h1><span class="badge ${a?"badge-success":"badge-error"} text-[10px]">${a?"Active":"Canceled"}</span></div><p class="text-sm font-bold text-on-surface mt-1">${t.name}</p><p class="text-xs text-on-surface-variant mt-1">Product ${t.product_id} · ${it(t.cadence)} recurring contract</p></div></div><div class="flex items-center gap-2">${a?'<button type="button" class="btn btn-secondary text-xs" id="btn-modify-subscription"><span class="material-symbols-outlined text-sm">edit_note</span><span>Modify Terms</span></button><button type="button" class="btn btn-secondary text-xs text-error" id="btn-cancel-subscription"><span class="material-symbols-outlined text-sm">bolt</span><span>Cancel Contract</span></button>':""}</div></div></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="card card-extruded subscription-detail-stat"><span>Contract Value</span><strong>${V(t.price)}</strong><em>per ${it(t.cadence).toLowerCase()} cycle</em></div><div class="card card-extruded subscription-detail-stat"><span>Billed To Date</span><strong>${V(n)}</strong><em>${e.filter(l=>l.status==="Billed").length} settled cycles</em></div><div class="card card-extruded subscription-detail-stat"><span>Scheduled Balance</span><strong>${V(r)}</strong><em>${e.filter(l=>l.status==="Scheduled").length} upcoming cycles</em></div></div>
    <section class="card card-extruded"><div class="flex items-center justify-between gap-3 mb-4"><div><h2 class="text-base font-bold">Billing Schedule</h2><p class="text-xs text-on-surface-variant">Every generated charge for this recurring contract.</p></div><span class="badge badge-primary text-[10px]">${e.length} cycles</span></div><div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60"><table class="w-full text-left border-collapse"><thead><tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"><th class="py-2.5 px-4">Billing reference</th><th class="py-2.5 px-4">Billing date</th><th class="py-2.5 px-4">Customer entity</th><th class="py-2.5 px-4 text-right">Amount</th><th class="py-2.5 px-4">Status</th></tr></thead><tbody>${s}</tbody></table></div></section>
    <section class="card card-extruded"><div class="flex items-center gap-2 mb-3"><span class="material-symbols-outlined text-primary">account_balance</span><h2 class="text-base font-bold">Remittance &amp; Contract Context</h2></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"><div><span class="detail-label">Customer entity</span><strong>${((i=t.customers)==null?void 0:i.join(", "))||"Unassigned account"}</strong></div><div><span class="detail-label">Payment terms</span><strong>Net 30 · Direct wire</strong></div><div><span class="detail-label">Ledger status</span><strong class="text-primary">Reconciled and monitored</strong></div></div></section></div>`}async function ve(t){try{return await u.get(`/subscriptions/plans/${t}/billing-detail`)}catch(e){return console.warn("Could not fetch subscription billing detail:",e),null}}function be(t){var e,n;(e=document.getElementById("btn-modify-subscription"))==null||e.addEventListener("click",()=>U.show({title:"Modify Subscription Terms",content:`<div class="space-y-3 text-xs"><label class="block font-bold">Plan name<input id="modify-plan-name" class="input-clay w-full mt-1" value="${t.name}" /></label><label class="block font-bold">Recurring price (INR)<input id="modify-plan-price" type="number" min="0.01" class="input-clay w-full mt-1" value="${t.price}" /></label><label class="block font-bold">Cadence<select id="modify-plan-cadence" class="input-clay w-full mt-1"><option value="monthly" ${t.cadence==="monthly"?"selected":""}>Monthly</option><option value="quarterly" ${t.cadence==="quarterly"?"selected":""}>Quarterly</option><option value="yearly" ${t.cadence==="yearly"?"selected":""}>Yearly</option></select></label></div>`,confirmText:"Save Terms",onConfirm:async()=>(await u.patch(`/subscriptions/plans/${t.id}`,{name:document.getElementById("modify-plan-name").value.trim(),price:Number(document.getElementById("modify-plan-price").value),cadence:document.getElementById("modify-plan-cadence").value}),window.location.hash=`#/subscriptions/${t.id}`,window.location.reload(),!0)})),(n=document.getElementById("btn-cancel-subscription"))==null||n.addEventListener("click",()=>{var s,a;const r=(a=(s=t==null?void 0:t.schedules)==null?void 0:s.find(i=>i.quotation_line_id))==null?void 0:a.quotation_line_id;U.show({title:"Cancel Subscription",content:'<p class="text-xs text-on-surface-variant">Future billing cycles will stop and this contract will be marked canceled.</p>',confirmText:"Cancel Contract",onConfirm:async()=>(r?await u.post(`/subscriptions/lines/${r}/cancel`,{}):await u.post(`/subscriptions/plans/${t.id}/cancel`,{}),window.location.hash="#/subscriptions",window.location.reload(),!0)})})}let L={period:"This Month",status:"All Statuses",product:"All Products"};async function ct(t={}){try{const e=new URLSearchParams(t).toString();return{kpis:await u.get(`/reports/kpis?${e}`).catch(()=>null)}}catch{return{kpis:null}}}function ge(t={}){const e=t.kpis||{quotes_created:0,avg_approval_time_hours:0,top_upsold_product:"None"},n=L.period.toLowerCase();return`
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
            <option ${L.period==="This Month"?"selected":""}>This Month</option>
            <option ${L.period==="Last Month"?"selected":""}>Last Month</option>
            <option ${L.period==="Q3"?"selected":""}>Q3</option>
            <option ${L.period==="YTD"?"selected":""}>YTD</option>
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
            <option ${L.status==="All Statuses"?"selected":""}>All Statuses</option>
            <option ${L.status==="Approved"?"selected":""}>Approved</option>
            <option ${L.status==="Pending"?"selected":""}>Pending</option>
            <option ${L.status==="Rejected"?"selected":""}>Rejected</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant font-bold mb-2 block">Product</label>
          <select id="filter-product" style="width: 100%; padding: 0.7rem 1rem; font-size: 14px; appearance: auto; background-color: #ffffff; border: 2px solid var(--color-primary); border-radius: 10px; color: var(--color-on-surface); cursor: pointer;">
            <option ${L.product==="All Products"?"selected":""}>All Products</option>
            <option ${L.product==="Care Plan 2yr"?"selected":""}>Care Plan 2yr</option>
            <option ${L.product==="Business Service"?"selected":""}>Business Service</option>
          </select>
        </div>
      </div>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Quotes Created</div>
          <div class="text-sm text-on-surface-variant" id="kpi-quotes">${e.quotes_created} ${n}</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Avg Approval Time</div>
          <div class="text-sm text-on-surface-variant" id="kpi-time">${e.avg_approval_time_hours} hours</div>
        </div>

        <div class="card card-extruded" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="text-base font-bold text-on-surface">Top Upsold Product</div>
          <div class="text-sm text-on-surface-variant" id="kpi-product">${e.top_upsold_product}</div>
        </div>

      </div>

      <!-- Actions -->
      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
        <button type="button" class="btn btn-secondary" style="padding: 0.6rem 2rem; border-radius: 8px; border: 1px solid var(--color-on-surface-variant); color: var(--color-on-surface);" id="btn-export-pdf">
          Export PDF
        </button>
      </div>

    </div>
  `}function ye(){var e,n,r,s,a;const t=async()=>{L={period:document.getElementById("filter-period").value,status:document.getElementById("filter-status").value,product:document.getElementById("filter-product").value};const i=await ct(L);i&&i.kpis&&(document.getElementById("kpi-quotes").textContent=`${i.kpis.quotes_created} ${L.period.toLowerCase()}`,document.getElementById("kpi-time").textContent=`${i.kpis.avg_approval_time_hours} hours`,document.getElementById("kpi-product").textContent=`${i.kpis.top_upsold_product}`)};(e=document.getElementById("filter-period"))==null||e.addEventListener("change",t),(n=document.getElementById("filter-status"))==null||n.addEventListener("change",t),(r=document.getElementById("filter-product"))==null||r.addEventListener("change",t),(s=document.getElementById("filter-team"))==null||s.addEventListener("change",t),(a=document.getElementById("btn-export-pdf"))==null||a.addEventListener("click",()=>{var o,c,d;const i=new URLSearchParams({period:((o=document.getElementById("filter-period"))==null?void 0:o.value)||"This Month",status:((c=document.getElementById("filter-status"))==null?void 0:c.value)||"All Statuses",product:((d=document.getElementById("filter-product"))==null?void 0:d.value)||"All Products"}),l=window.location.port==="5173"?"":"http://localhost:8000";window.open(`${l}/api/v1/reports/export/pdf?${i.toString()}`,"_blank")})}function he(){return`
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
                  <span class="text-[11px] font-bold text-on-surface">${(S.getUser()||{full_name:"User"}).full_name||"You"}</span>
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
  `}function we(){const t=document.getElementById("btn-send-msg"),e=document.getElementById("msg-input"),n=document.getElementById("messages-list");if(t&&e&&n){const r=()=>{const s=e.value.trim();if(!s)return;const a=S.getUser()||{full_name:"You"},i=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),l=document.createElement("div");l.className="flex flex-col items-start max-w-[80%]",l.innerHTML=`
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-bold text-on-surface">${a.full_name}</span>
          <span class="text-[10px] text-on-surface-variant font-mono">${i}</span>
        </div>
        <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
          ${s}
        </div>
      `,n.appendChild(l),e.value="",n.scrollTop=n.scrollHeight};t.addEventListener("click",r),e.addEventListener("keydown",s=>{s.key==="Enter"&&r()})}}function $e(){const t=S.getUser()||{full_name:"Alice Johnson",email:"salesrep@dealflow360.com",role:"SalesRep",phone:"+1 (555) 234-5678",address:"742 Evergreen Terrace, San Francisco, CA 94107",age:"28"},e=t.full_name?t.full_name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2):"US";return`
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
              <span class="font-bold text-3xl text-primary">${e}</span>
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
  `}function Ee(){const t=document.getElementById("profile-form"),e=document.getElementById("prof-name"),n=document.getElementById("prof-phone"),r=document.getElementById("prof-age"),s=document.getElementById("prof-address"),a=document.getElementById("profile-msg"),i=document.getElementById("btn-profile-logout");t&&t.addEventListener("submit",l=>{l.preventDefault();const o=e.value.trim();if(!o)return;const c=S.getUser()||{};c.full_name=o,c.phone=n?n.value.trim():c.phone,c.age=r?r.value.trim():c.age,c.address=s?s.value.trim():c.address,S.setUser(c),a&&(a.classList.remove("hidden"),setTimeout(()=>a.classList.add("hidden"),3500))}),i&&i.addEventListener("click",()=>{confirm("Are you sure you want to sign out of DealFlow360?")&&S.logout()})}async function ke(){return await I.fetchHealthData(),{}}function dt(){const t=I.getStalledDeals().length,e=I.getDiscountAnomalies().length,n=I.getDeliverySlippages().length,r=I.getFlaggedItems(),s=r.length>0?r.map(a=>{let i="badge-warning";return a.actionStatus==="Nudge sent"?i="badge-info":a.actionStatus==="Escalated to Manager"?i="badge-primary":a.actionStatus==="Resolved"&&(i="badge-success"),`
      <tr class="table-row hover:bg-surface-container/50 transition-colors cursor-pointer activity-row group" data-deal-id="${a.id}">
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-on-surface">${a.dealName}</span>
            <span class="text-[10px] text-on-surface-variant">${a.customerName} • Rep: ${a.repName}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-bold text-on-surface">
          ${a.displayIssue}
        </td>
        <td class="py-3 px-4 text-xs font-mono text-on-surface-variant">
          ${a.flaggedDate}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${i}">● ${a.actionStatus}</span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-2 opacity-0 group-[.selected]:opacity-100 transition-opacity">
            <button class="btn btn-secondary text-xs py-1 px-3 btn-nudge" data-id="${a.id}" ${a.actionStatus!=="Action Required"?"disabled":""}>Nudge Rep</button>
            <button class="btn btn-secondary text-xs py-1 px-3 btn-escalate" data-id="${a.id}" ${a.actionStatus!=="Action Required"&&a.actionStatus!=="Nudge sent"?"disabled":""}>Escalate</button>
            <button class="btn btn-primary text-xs py-1 px-3 btn-resolve" data-id="${a.id}" data-issue="${a.issues[0]}">Resolve Risk</button>
          </div>
        </td>
      </tr>
    `}).join(""):`
    <tr id="activity-empty-row">
      <td colspan="5" class="py-6 text-center text-xs text-on-surface-variant">
        No at-risk deals found.
      </td>
    </tr>
  `;return`
    <div class="page-container space-y-6" id="deal-health-page-root">
      <!-- Header & Contextual Actions -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="pulse-dot"></span>
            <span class="text-xs font-bold text-primary tracking-widest uppercase">Real-time Telemetry Active</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-on-surface">Deal Health and Anomaly Dashboard</h1>
          <p class="text-xs text-on-surface-variant">Real-time flags for stalled deals and unusual discount patterns</p>
        </div>
      </div>

      <!-- 3 Key Metric Clay Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Metric 1: Stalled Deals -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stalled Deals</span>
            <div class="icon-circle bg-secondary-container/60">
              <span class="material-symbols-outlined text-secondary text-lg">hourglass_top</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${t}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">quotes idle 7+ days</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Discount Anomalies -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Discount Anomalies</span>
            <div class="icon-circle bg-tertiary-container/40">
              <span class="material-symbols-outlined text-tertiary text-lg">percent</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${e}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">above rep average</span>
            </div>
          </div>
        </div>

        <!-- Metric 3: Delivery Slippage -->
        <div class="card card-extruded flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery Slippage</span>
            <div class="icon-circle bg-error-container/40">
              <span class="material-symbols-outlined text-error text-lg">local_shipping</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-2xl font-bold tracking-tight text-on-surface">${n}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[11px] text-on-surface-variant">promise dates at risk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Flagged Deals Table -->
      <div class="card card-extruded">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary text-xl">crisis_alert</span>
          <div>
            <h2 class="text-base font-bold text-on-surface">Flagged Deals</h2>
            <p class="text-xs text-on-surface-variant">Requires immediate review and action</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
          <table class="w-full text-left border-collapse" id="flagged-deals-table">
            <thead>
              <tr class="border-b border-surface-container-high/60 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th class="py-2.5 px-4">Deal</th>
                <th class="py-2.5 px-4">Issue</th>
                <th class="py-2.5 px-4">Flagged Date</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="flagged-tbody">
              ${s}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function pt(){const t=document.getElementById("deal-health-page-root");if(!t)return;const e=()=>{if(window.location.hash==="#/deal-health"){const r=document.getElementById("app-content");r&&(r.innerHTML=dt(),pt())}},n=I.subscribe(e);window._dealHealthUnsub&&window._dealHealthUnsub(),window._dealHealthUnsub=n,t.querySelectorAll(".activity-row").forEach(r=>{r.addEventListener("click",s=>{s.target.closest("button")||(t.querySelectorAll(".activity-row").forEach(a=>{a.classList.remove("selected"),a.classList.remove("bg-surface-container-high/40")}),r.classList.add("selected"),r.classList.add("bg-surface-container-high/40"))})}),t.querySelectorAll(".btn-nudge").forEach(r=>{r.addEventListener("click",async s=>{s.stopPropagation();const a=parseInt(s.target.getAttribute("data-id"),10);s.target.disabled=!0,s.target.textContent="Nudging...",await I.nudgeRep(a)})}),t.querySelectorAll(".btn-escalate").forEach(r=>{r.addEventListener("click",async s=>{s.stopPropagation();const a=parseInt(s.target.getAttribute("data-id"),10);s.target.disabled=!0,s.target.textContent="Escalating...",await I.escalateDeal(a)})}),t.querySelectorAll(".btn-resolve").forEach(r=>{r.addEventListener("click",async s=>{s.stopPropagation();const a=parseInt(s.target.getAttribute("data-id"),10),i=s.target.getAttribute("data-issue");s.target.disabled=!0,s.target.textContent="Resolving...",await I.resolveRisk(a,i)})})}class Ae{constructor(){this.appEl=document.getElementById("app"),window.addEventListener("hashchange",()=>this.handleRoute())}init(){!window.location.hash||window.location.hash==="#/"?window.location.hash=S.isAuthenticated()?"#/quotations":"#/login":this.handleRoute()}parseHash(){const e=window.location.hash.slice(1)||"/login",[n]=e.split("?"),s=(n.startsWith("/")?n.slice(1):n).split("/"),a=s[0]||"quotations",i=s[1]||null,l=new URLSearchParams(window.location.hash.split("?")[1]||"");return{route:a,param:i,query:l}}showLoading(){this.appEl.innerHTML=`
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="card card-extruded p-6 flex flex-col items-center gap-3">
          <div class="loading-spinner w-8 h-8 border-3 border-primary border-t-transparent"></div>
          <span class="text-xs font-bold text-on-surface tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    `}async handleRoute(){const{route:e,param:n,query:r}=this.parseHash(),s=S.isAuthenticated();if(!s&&e!=="login"&&e!=="signup"&&e!=="portal"){window.location.hash="#/login";return}if(s&&(e==="login"||e==="signup")){window.location.hash="#/quotations";return}const a=S.getUser(),i=a?a.selected_role||a.role:"",l={SalesRep:["dashboard","quotations","customers","products","profile"],SalesManager:["dashboard","quotations","approvals","pricing","reports","profile"],FinanceOps:["dashboard","approvals","fulfillment","invoices","subscriptions","profile"],Admin:["dashboard","quotations","approvals","deal-health","fulfillment","invoices","customers","products","pricing","subscriptions","reports","profile"],Customer:["quotations","messages","profile"]};if(!["login","signup","portal"].includes(e)&&!(l[i]||l.SalesRep).includes(e)){window.location.hash="#/quotations";return}switch(window.scrollTo(0,0),e){case"login":{this.appEl.innerHTML=xt(),vt();break}case"signup":{this.appEl.innerHTML=bt(),gt();break}case"dashboard":{this.showLoading();const o=await $t();this.appEl.innerHTML=`
          ${w("dashboard")}
          <main class="main-content">${wt(o)}</main>
        `,$(),Et();break}case"deal-health":{this.showLoading(),await ke(),this.appEl.innerHTML=`
          ${w("deal-health")}
          <main class="main-content" id="app-content">${dt()}</main>
        `,$(),pt();break}case"quotations":{if(n){this.showLoading();const o=await rt(n);this.appEl.innerHTML=`
            ${w("quotations")}
            <main class="main-content">${nt(o)}</main>
          `,$(),ot(n,o.products,o.customers)}else{this.showLoading();let o=!0,c="kanban";const d=async(p=o,m=c)=>{o=p,c=m;const x=await At(p);this.appEl.innerHTML=`
              ${w("quotations")}
              <main class="main-content">${kt(x,p?"my":"all",m)}</main>
            `,$(),_t(g=>d(g,c),g=>d(o,g))};await d(!0,"kanban")}break}case"quotation-detail":{this.showLoading();const o=n||r.get("id"),c=await rt(o);this.appEl.innerHTML=`
          ${w("quotations")}
          <main class="main-content">${nt(c)}</main>
        `,$(),ot(o,c.products,c.customers);break}case"approvals":{this.showLoading();const o=await Lt();this.appEl.innerHTML=`
          ${w("approvals")}
          <main class="main-content">${St(o)}</main>
        `,$(),Ct();break}case"approval-detail":{this.showLoading();const o=n||r.get("id"),c=await It(o);this.appEl.innerHTML=`
          ${w("approvals")}
          <main class="main-content">${Bt(c)}</main>
        `,$(),Pt(o);break}case"products":{this.showLoading();const o=await Dt();this.appEl.innerHTML=`
          ${w("products")}
          <main class="main-content">${Nt(o)}</main>
        `,$(),qt();break}case"product-detail":{this.showLoading();const o=n||"new",c=await Tt(o);this.appEl.innerHTML=`
          ${w("products")}
          <main class="main-content">${Rt(c)}</main>
        `,$(),Mt(o);break}case"pricing":case"pricing-rules":{this.showLoading();const o=await jt();this.appEl.innerHTML=`
          ${w("pricing")}
          <main class="main-content">${Ft(o)}</main>
        `,$(),Ht();break}case"customers":{this.showLoading();const o=await Ot();this.appEl.innerHTML=`
          ${w("customers")}
          <main class="main-content">${Ut(o)}</main>
        `,$(),Qt();break}case"portal":{this.showLoading();const o=n||r.get("id"),c=await zt(o);this.appEl.innerHTML=`
          <main class="main-content portal-shell">${Gt(c)}</main>
        `,Vt(c.quotation);break}case"fulfillment":{if(this.showLoading(),n){const o=await Zt(n);this.appEl.innerHTML=`${w("fulfillment")}<main class="main-content">${Xt(o)}</main>`,$(),te(n)}else{const o=await Yt();this.appEl.innerHTML=`${w("fulfillment")}<main class="main-content">${Jt(o)}</main>`,$(),Kt()}break}case"fulfillment-override":{this.showLoading();const o=await ae(n);this.appEl.innerHTML=`${w("fulfillment")}<main class="main-content">${ee(o)}</main>`,$(),se(n);break}case"invoices":{if(n){this.showLoading();const o=await le(n);this.appEl.innerHTML=`
            ${w("invoices")}
            <main class="main-content">${ie(o)}</main>
          `,$(),ce(o)}else{this.showLoading();const o=await re();this.appEl.innerHTML=`
            ${w("invoices")}
            <main class="main-content">${ne(o)}</main>
          `,$(),oe()}break}case"subscriptions":{if(this.showLoading(),n){const o=await ve(n);this.appEl.innerHTML=`${w("subscriptions")}<main class="main-content">${xe(o)}</main>`,$(),be(o)}else{const o=await me();this.appEl.innerHTML=`${w("subscriptions")}<main class="main-content">${ue(o)}</main>`,$(),fe()}break}case"reports":{this.showLoading();const o=await ct();this.appEl.innerHTML=`
          ${w("reports")}
          <main class="main-content">${ge(o)}</main>
        `,$(),ye();break}case"messages":{this.appEl.innerHTML=`
          ${w("messages")}
          <main class="main-content">${he()}</main>
        `,$(),we();break}case"profile":{this.appEl.innerHTML=`
          ${w("profile")}
          <main class="main-content">${$e()}</main>
        `,$(),Ee();break}default:{window.location.hash="#/quotations";break}}}}function lt(){u.setToken(null),S.setUser(null),window.location.hash!=="#/login"&&window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/login`),new Ae().init()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",lt,{once:!0}):lt();
