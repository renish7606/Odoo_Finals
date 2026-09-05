/**
 * Reusable Modal Component
 */

export const modal = {
  show({ title, content, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', showConfirm = true }) {
    const existing = document.getElementById('df-modal-backdrop');
    if (existing) existing.remove();

    const modalHtml = `
      <div id="df-modal-backdrop" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button type="button" class="modal-close-btn" id="df-modal-close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="df-modal-cancel">${cancelText}</button>
            ${showConfirm ? `<button type="button" class="btn btn-primary" id="df-modal-confirm">${confirmText}</button>` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const backdrop = document.getElementById('df-modal-backdrop');
    const closeBtn = document.getElementById('df-modal-close');
    const cancelBtn = document.getElementById('df-modal-cancel');
    const confirmBtn = document.getElementById('df-modal-confirm');

    const close = () => {
      backdrop.classList.add('fade-out');
      setTimeout(() => backdrop.remove(), 200);
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    if (confirmBtn && onConfirm) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
        try {
          const shouldClose = await onConfirm();
          if (shouldClose !== false) {
            close();
          }
        } catch (err) {
          alert(err.message || 'Action failed');
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = confirmText;
        }
      });
    }

    return { close };
  },
};
