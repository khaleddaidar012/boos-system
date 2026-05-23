const UIKit = {
  /* ========================================
     MODAL SYSTEM
  ======================================== */

  openModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;

    const overlay = el.closest('.modal-overlay') || el;
    overlay.classList.add('active');

    document.body.style.overflow = 'hidden';

    if (!overlay.hasAttribute('data-esc-bound')) {
      overlay.setAttribute('data-esc-bound', 'true');
      const handler = (e) => {
        if (e.key === 'Escape') {
          UIKit.closeModal(overlay);
        }
      };
      document.addEventListener('keydown', handler);
      overlay._escHandler = handler;
    }

    const closeBtns = overlay.querySelectorAll('.modal-close');
    closeBtns.forEach((btn) => {
      if (!btn.hasAttribute('data-close-bound')) {
        btn.setAttribute('data-close-bound', 'true');
        btn.addEventListener('click', () => UIKit.closeModal(overlay));
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        UIKit.closeModal(overlay);
      }
    });
  },

  closeModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;

    const overlay = el.closest('.modal-overlay') || el;
    overlay.classList.remove('active');

    document.body.style.overflow = '';

    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
      delete overlay._escHandler;
    }

    overlay.removeAttribute('data-esc-bound');
  },

  /* ========================================
     BUTTON LOADING STATE
  ======================================== */

  showLoading(btn) {
    if (typeof btn === 'string') btn = document.querySelector(btn);
    if (!btn) return;
    btn.classList.add('btn-loading');
    btn.disabled = true;
  },

  hideLoading(btn) {
    if (typeof btn === 'string') btn = document.querySelector(btn);
    if (!btn) return;
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  },

  /* ========================================
     BUTTON CREATION HELPER
  ======================================== */

  createButton({ text, type = 'primary', size = '', block = false, icon = '', loading = false, disabled = false, className = '', onClick } = {}) {
    const btn = document.createElement('button');
    btn.className = `btn btn-${type}`;
    if (size) btn.classList.add(`btn-${size}`);
    if (block) btn.classList.add('btn-block');
    if (loading) btn.classList.add('btn-loading');
    if (disabled) btn.disabled = true;
    if (className) btn.classList.add(...className.split(' '));

    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.textContent = icon;
      btn.appendChild(iconEl);
    }

    if (text) {
      const textEl = document.createTextNode(text);
      btn.appendChild(textEl);
    }

    if (onClick) {
      btn.addEventListener('click', onClick);
    }

    return btn;
  },

  /* ========================================
     TOAST SYSTEM (replaces Helpers.showToast)
  ======================================== */

  showToast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.ui-toast-container');
    let container;
    if (existing) {
      container = existing;
    } else {
      container = document.createElement('div');
      container.className = 'ui-toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:0.5rem;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.style.cssText = 'animation: slideDown 0.3s ease forwards;min-width:280px;box-shadow:var(--shadow-lg);';

    const iconMap = {
      success: '\u2713',
      danger: '\u2717',
      warning: '\u26A0',
      info: '\u2139'
    };

    const iconSpan = document.createElement('span');
    iconSpan.textContent = iconMap[type] || '';
    toast.appendChild(iconSpan);

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00D7';
    closeBtn.style.cssText = 'margin-left:auto;background:none;border:none;color:inherit;font-size:1.25rem;cursor:pointer;opacity:0.7;';
    closeBtn.addEventListener('click', () => toast.remove());
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
          if (container.children.length === 0) container.remove();
        }, 300);
      }
    }, duration);
  },

  /* ========================================
     CONFIRM MODAL (replaces browser confirm)
  ======================================== */

  confirm({ title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary', onConfirm, onCancel } = {}) {
    const existing = document.querySelector('.ui-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active ui-confirm-overlay';
    overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'max-width:400px;width:90%;';

    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
      </div>
      <div class="modal-body">
        <p style="color:var(--text-secondary);margin:0;">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
        <button class="btn btn-${variant} modal-confirm-btn">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const cleanup = () => {
      overlay.removeEventListener('click', outsideClick);
      document.removeEventListener('keydown', escHandler);
      if (overlay.parentNode) overlay.remove();
      if (modal.parentNode) modal.remove();
      document.body.style.overflow = '';
    };

    const outsideClick = (e) => {
      if (e.target === overlay) {
        cleanup();
        if (onCancel) onCancel();
      }
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        if (onCancel) onCancel();
      }
    };

    overlay.addEventListener('click', outsideClick);
    document.addEventListener('keydown', escHandler);

    modal.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      cleanup();
      if (onCancel) onCancel();
    });

    modal.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      cleanup();
      if (onConfirm) onConfirm();
    });
  }
};
