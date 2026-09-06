/**
 * DealFlow360 Messages & Communication Hub Page
 */
import { auth } from '../auth.js';

export function renderMessagesPage() {
  const user = auth.getUser() || { full_name: 'User', role: 'SalesRep' };

  return `
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
                  <span class="text-[11px] font-bold text-on-surface">${user.full_name || 'You'}</span>
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
  `;
}

export function setupMessagesEvents() {
  const sendBtn = document.getElementById('btn-send-msg');
  const msgInput = document.getElementById('msg-input');
  const messagesList = document.getElementById('messages-list');

  if (sendBtn && msgInput && messagesList) {
    const handleSend = () => {
      const text = msgInput.value.trim();
      if (!text) return;

      const user = auth.getUser() || { full_name: 'You' };
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg = document.createElement('div');
      newMsg.className = 'flex flex-col items-start max-w-[80%]';
      newMsg.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-bold text-on-surface">${user.full_name}</span>
          <span class="text-[10px] text-on-surface-variant font-mono">${now}</span>
        </div>
        <div class="bg-surface-container p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface border border-surface-container-high/60">
          ${text}
        </div>
      `;
      messagesList.appendChild(newMsg);
      msgInput.value = '';
      messagesList.scrollTop = messagesList.scrollHeight;
    };

    sendBtn.addEventListener('click', handleSend);
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}
