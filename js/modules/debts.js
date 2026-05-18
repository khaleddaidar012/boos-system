const Debts = {
  debts: { owed_to_library: [], we_owe: [] },
  logs: [],
  activeTab: 'owed_to_library',
  activeFilter: 'all',
  sortBy: 'newest',
  searchTerm: '',
  editingId: null,

  init() {
    this.debts = Storage.get('debts') || { owed_to_library: [], we_owe: [] };
    this.logs = Storage.get('debt_logs') || [];
    this.bindEvents();
    this.render();
    this.renderStats();
  },

  bindEvents() {
    document.getElementById('addDebtBtn').addEventListener('click', () => this.openModal());
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('debtForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });

    document.getElementById('paymentModalClose').addEventListener('click', () => this.closePaymentModal());
    document.getElementById('paymentCancelBtn').addEventListener('click', () => this.closePaymentModal());
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.processPayment();
    });

    document.getElementById('logModalClose').addEventListener('click', () => this.closeLogModal());

    document.getElementById('debtModal').addEventListener('click', (e) => {
      if (e.target.id === 'debtModal') this.closeModal();
    });
    document.getElementById('paymentModal').addEventListener('click', (e) => {
      if (e.target.id === 'paymentModal') this.closePaymentModal();
    });
    document.getElementById('logModal').addEventListener('click', (e) => {
      if (e.target.id === 'logModal') this.closeLogModal();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase().trim();
      this.render();
    });

    document.getElementById('debtFilters').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      this.activeFilter = tab.dataset.filter;
      document.querySelectorAll('#debtFilters .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.render();
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.render();
    });

    document.querySelectorAll('.debt-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.dataset.type;
        document.querySelectorAll('.debt-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.render();
        this.renderStats();
      });
    });

    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

    document.getElementById('totalAmount').addEventListener('input', () => this.updateStatusDisplay());
    document.getElementById('paidAmount').addEventListener('input', () => this.updateStatusDisplay());

    document.getElementById('debtList').addEventListener('click', (e) => {
      const header = e.target.closest('.debt-card-header');
      if (header) {
        const card = header.closest('.debt-card');
        const details = card.querySelector('.debt-card-details');
        const arrow = header.querySelector('.debt-expand-arrow');
        details.classList.toggle('expanded');
        arrow.classList.toggle('rotated');
      }
    });
  },

  updateStatusDisplay() {
    const total = parseFloat(document.getElementById('totalAmount').value) || 0;
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    const statusInput = document.getElementById('debtStatusDisplay');
    
    if (total === 0) {
      statusInput.value = '';
      return;
    }
    
    if (paid >= total) {
      statusInput.value = I18n.t('statusPaid');
      statusInput.style.color = 'var(--success)';
    } else if (paid > 0) {
      statusInput.value = I18n.t('statusPartial');
      statusInput.style.color = 'var(--warning)';
    } else {
      statusInput.value = I18n.t('statusUnpaid');
      statusInput.style.color = 'var(--danger)';
    }
  },

  getFilteredAndSortedDebts() {
    let debts = this.debts[this.activeTab] || [];

    if (this.searchTerm) {
      debts = debts.filter(d => 
        d.personName.toLowerCase().includes(this.searchTerm) ||
        (d.phone && d.phone.includes(this.searchTerm)) ||
        (d.notes && d.notes.toLowerCase().includes(this.searchTerm))
      );
    }

    if (this.activeFilter !== 'all') {
      debts = debts.filter(d => {
        const remaining = d.totalAmount - d.paidAmount;
        const isOverdue = d.dueDate && new Date(d.dueDate) < new Date() && remaining > 0;
        
        switch (this.activeFilter) {
          case 'unpaid': return d.paidAmount === 0;
          case 'partial': return d.paidAmount > 0 && remaining > 0;
          case 'paid': return remaining <= 0;
          case 'overdue': return isOverdue;
          default: return true;
        }
      });
    }

    debts.sort((a, b) => {
      switch (this.sortBy) {
        case 'highest':
          return (b.totalAmount - b.paidAmount) - (a.totalAmount - a.paidAmount);
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return dateA - dateB;
        case 'mostActive':
          return (b.transactions || []).length - (a.transactions || []).length;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return debts;
  },

  render() {
    const list = document.getElementById('debtList');
    const emptyState = document.getElementById('emptyState');
    const debts = this.getFilteredAndSortedDebts();

    if (debts.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    list.innerHTML = debts.map((debt, i) => this.renderDebtCard(debt, i)).join('');
  },

  renderDebtCard(debt, index) {
    const remaining = debt.totalAmount - debt.paidAmount;
    const isPaid = remaining <= 0;
    const isPartial = debt.paidAmount > 0 && !isPaid;
    const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isPaid;
    
    let statusClass = 'status-unpaid';
    let statusText = I18n.t('statusUnpaid');
    if (isPaid) {
      statusClass = 'status-paid';
      statusText = I18n.t('statusPaid');
    } else if (isPartial) {
      statusClass = 'status-partial';
      statusText = I18n.t('statusPartial');
    }
    if (isOverdue) {
      statusClass += ' status-overdue';
    }

    const progressPercent = debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
    
    const transactions = debt.transactions || [];
    const transactionsHtml = transactions.length > 0 
      ? transactions.map(t => `
          <div class="transaction-item">
            <span class="transaction-date">${t.date}</span>
            <span class="transaction-amount">+${Helpers.formatCurrency(t.amount)}</span>
            ${t.note ? `<span class="transaction-note">${Helpers.escapeHtml(t.note)}</span>` : ''}
          </div>
        `).join('')
      : `<div class="no-transactions-msg">${I18n.t('noTransactions')}</div>`;

    const paymentBtnLabel = this.activeTab === 'owed_to_library' ? I18n.t('receivePayment') : I18n.t('makePayment');

    return `
      <div class="debt-card ${statusClass} animate-slide-up stagger-${Math.min(index + 1, 6)}">
        <div class="debt-card-header">
          <div class="debt-card-info">
            <div class="debt-card-name">${Helpers.escapeHtml(debt.personName)}</div>
            ${debt.phone ? `<div class="debt-card-phone">📞 ${Helpers.escapeHtml(debt.phone)}</div>` : ''}
          </div>
          <div class="debt-card-amounts">
            <div class="debt-card-remaining">${Helpers.formatCurrency(remaining)}</div>
            <span class="debt-status-badge ${statusClass}">${statusText}</span>
          </div>
          <span class="debt-expand-arrow">▼</span>
        </div>
        <div class="debt-progress-bar">
          <div class="debt-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="debt-card-details">
          <div class="debt-details-grid">
            <div class="debt-detail-item">
              <span class="debt-detail-label">${I18n.t('totalAmount')}</span>
              <span class="debt-detail-value">${Helpers.formatCurrency(debt.totalAmount)}</span>
            </div>
            <div class="debt-detail-item">
              <span class="debt-detail-label">${I18n.t('paidAmount')}</span>
              <span class="debt-detail-value paid">${Helpers.formatCurrency(debt.paidAmount)}</span>
            </div>
            <div class="debt-detail-item">
              <span class="debt-detail-label">${I18n.t('remainingAmount')}</span>
              <span class="debt-detail-value remaining">${Helpers.formatCurrency(remaining)}</span>
            </div>
            ${debt.dueDate ? `
              <div class="debt-detail-item">
                <span class="debt-detail-label">${I18n.t('dueDate')}</span>
                <span class="debt-detail-value ${isOverdue ? 'overdue' : ''}">${debt.dueDate}</span>
              </div>
            ` : ''}
            <div class="debt-detail-item">
              <span class="debt-detail-label">${I18n.t('createdDate')}</span>
              <span class="debt-detail-value">${new Date(debt.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          ${debt.notes ? `
            <div class="debt-notes">
              <span class="debt-notes-label">${I18n.t('notes')}</span>
              <p>${Helpers.escapeHtml(debt.notes)}</p>
            </div>
          ` : ''}
          <div class="debt-transactions">
            <h5>📜 ${I18n.t('paymentHistory')}</h5>
            <div class="transactions-list">${transactionsHtml}</div>
          </div>
          <div class="debt-card-actions">
            ${!isPaid ? `
              <button class="btn btn-sm btn-success" onclick="Debts.openPaymentModal('${debt.id}')">${paymentBtnLabel}</button>
            ` : ''}
            <button class="btn btn-sm btn-primary" onclick="Debts.edit('${debt.id}')">✏️ ${I18n.t('edit')}</button>
            <button class="btn btn-sm btn-secondary" onclick="Debts.viewLogs('${debt.id}')">📋 ${I18n.t('viewLogs')}</button>
            <button class="btn btn-sm btn-danger" onclick="Debts.delete('${debt.id}')">🗑️ ${I18n.t('delete')}</button>
          </div>
        </div>
      </div>
    `;
  },

  renderStats() {
    const owedToUs = this.debts.owed_to_library || [];
    const weOwe = this.debts.we_owe || [];

    const totalOwed = owedToUs.reduce((sum, d) => sum + Math.max(d.totalAmount - d.paidAmount, 0), 0);
    const totalWeOwe = weOwe.reduce((sum, d) => sum + Math.max(d.totalAmount - d.paidAmount, 0), 0);

    const allDebts = [...owedToUs, ...weOwe];
    const unpaidCount = allDebts.filter(d => d.paidAmount === 0).length;
    const overdueCount = allDebts.filter(d => {
      const remaining = d.totalAmount - d.paidAmount;
      return d.dueDate && new Date(d.dueDate) < new Date() && remaining > 0;
    }).length;

    document.getElementById('statTotalOwed').textContent = Helpers.formatCurrency(totalOwed);
    document.getElementById('statTotalWeOwe').textContent = Helpers.formatCurrency(totalWeOwe);
    document.getElementById('statUnpaidCount').textContent = unpaidCount;
    document.getElementById('statOverdueCount').textContent = overdueCount;
  },

  openModal(debt = null) {
    const modal = document.getElementById('debtModal');
    const title = document.getElementById('modalTitle');

    document.getElementById('debtType').value = this.activeTab;

    if (debt) {
      this.editingId = debt.id;
      title.textContent = I18n.t('editDebt');
      document.getElementById('debtId').value = debt.id;
      document.getElementById('personName').value = debt.personName;
      document.getElementById('personPhone').value = debt.phone || '';
      document.getElementById('totalAmount').value = debt.totalAmount;
      document.getElementById('paidAmount').value = debt.paidAmount;
      document.getElementById('dueDate').value = debt.dueDate || '';
      document.getElementById('debtNotes').value = debt.notes || '';
    } else {
      this.editingId = null;
      title.textContent = I18n.t('addDebt');
      document.getElementById('debtForm').reset();
      document.getElementById('debtId').value = '';
      document.getElementById('paidAmount').value = '0';
    }

    this.updateStatusDisplay();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('debtModal').classList.remove('active');
    document.body.style.overflow = '';
    this.editingId = null;
  },

  save() {
    const debtType = document.getElementById('debtType').value;
    const personName = document.getElementById('personName').value.trim();
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;

    if (!personName || isNaN(totalAmount) || totalAmount <= 0) {
      Helpers.showToast(I18n.t('fillAllFields'), 'warning');
      return;
    }

    if (paidAmount > totalAmount) {
      Helpers.showToast(I18n.t('paidExceedsTotal'), 'warning');
      return;
    }

    const debt = {
      id: this.editingId || Helpers.genId('debt'),
      personName,
      phone: document.getElementById('personPhone').value.trim(),
      totalAmount,
      paidAmount,
      dueDate: document.getElementById('dueDate').value || null,
      notes: document.getElementById('debtNotes').value.trim(),
      transactions: [],
      updatedAt: new Date().toISOString()
    };

    if (this.editingId) {
      const idx = this.debts[debtType].findIndex(d => d.id === this.editingId);
      if (idx !== -1) {
        const oldDebt = this.debts[debtType][idx];
        debt.createdAt = oldDebt.createdAt;
        debt.transactions = oldDebt.transactions || [];
        
        if (oldDebt.totalAmount !== totalAmount || oldDebt.paidAmount !== paidAmount) {
          this.addLog(debt.id, debtType, 'updated', {
            oldTotal: oldDebt.totalAmount,
            newTotal: totalAmount,
            oldPaid: oldDebt.paidAmount,
            newPaid: paidAmount
          });
        }
        
        this.debts[debtType][idx] = debt;
      }
    } else {
      debt.createdAt = new Date().toISOString();
      this.debts[debtType].push(debt);
      this.addLog(debt.id, debtType, 'created', {
        totalAmount,
        paidAmount,
        personName
      });
    }

    this.saveData();
    this.render();
    this.renderStats();
    this.closeModal();
    Helpers.showToast(I18n.t('successSaved'), 'success');
  },

  edit(id) {
    const debt = this.debts[this.activeTab].find(d => d.id === id);
    if (debt) this.openModal(debt);
  },

  delete(id) {
    if (!Helpers.confirm(I18n.t('confirmDeleteDebt'))) return;

    const idx = this.debts[this.activeTab].findIndex(d => d.id === id);
    if (idx === -1) return;

    const debt = this.debts[this.activeTab][idx];
    this.addLog(id, this.activeTab, 'deleted', {
      personName: debt.personName,
      totalAmount: debt.totalAmount,
      paidAmount: debt.paidAmount
    });

    this.debts[this.activeTab].splice(idx, 1);
    this.saveData();
    this.render();
    this.renderStats();
    Helpers.showToast(I18n.t('successDeleted'), 'success');
  },

  openPaymentModal(id) {
    const debt = this.debts[this.activeTab].find(d => d.id === id);
    if (!debt) return;

    const remaining = debt.totalAmount - debt.paidAmount;
    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('paymentModalTitle');
    const info = document.getElementById('paymentDebtInfo');

    document.getElementById('paymentDebtId').value = id;
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentAmount').max = remaining;
    document.getElementById('paymentNote').value = '';

    const actionLabel = this.activeTab === 'owed_to_library' ? I18n.t('receivePayment') : I18n.t('makePayment');
    title.textContent = actionLabel;

    info.innerHTML = `
      <div class="payment-info-row">
        <span class="payment-info-label">${I18n.t('personName')}</span>
        <span class="payment-info-value">${Helpers.escapeHtml(debt.personName)}</span>
      </div>
      <div class="payment-info-row">
        <span class="payment-info-label">${I18n.t('totalAmount')}</span>
        <span class="payment-info-value">${Helpers.formatCurrency(debt.totalAmount)}</span>
      </div>
      <div class="payment-info-row">
        <span class="payment-info-label">${I18n.t('paidAmount')}</span>
        <span class="payment-info-value">${Helpers.formatCurrency(debt.paidAmount)}</span>
      </div>
      <div class="payment-info-row highlight">
        <span class="payment-info-label">${I18n.t('remainingAmount')}</span>
        <span class="payment-info-value">${Helpers.formatCurrency(remaining)}</span>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.body.style.overflow = '';
  },

  processPayment() {
    const debtId = document.getElementById('paymentDebtId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const note = document.getElementById('paymentNote').value.trim();

    if (isNaN(amount) || amount <= 0) {
      Helpers.showToast(I18n.t('invalidPaymentAmount'), 'warning');
      return;
    }

    const debt = this.debts[this.activeTab].find(d => d.id === debtId);
    if (!debt) return;

    const remaining = debt.totalAmount - debt.paidAmount;
    if (amount > remaining) {
      Helpers.showToast(I18n.t('paymentExceedsRemaining'), 'warning');
      return;
    }

    const transaction = {
      id: Helpers.genId('txn'),
      amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      note,
      admin: Auth.getSession()?.username || 'unknown'
    };

    if (!debt.transactions) debt.transactions = [];
    debt.transactions.push(transaction);
    debt.paidAmount += amount;
    debt.updatedAt = new Date().toISOString();

    this.addLog(debtId, this.activeTab, 'payment', {
      amount,
      remainingAfter: debt.totalAmount - debt.paidAmount,
      personName: debt.personName
    });

    this.saveData();
    this.render();
    this.renderStats();
    this.closePaymentModal();

    const isFullyPaid = debt.totalAmount - debt.paidAmount <= 0;
    if (isFullyPaid) {
      Helpers.showToast(I18n.t('debtFullyPaid'), 'success');
    } else {
      Helpers.showToast(I18n.t('paymentRecorded'), 'success');
    }
  },

  viewLogs(id) {
    const debt = this.debts[this.activeTab].find(d => d.id === id);
    if (!debt) return;

    const debtLogs = this.logs.filter(l => l.debtId === id);
    const list = document.getElementById('debtLogsList');

    if (debtLogs.length === 0) {
      list.innerHTML = `<div class="no-logs-msg">${I18n.t('noLogs')}</div>`;
    } else {
      list.innerHTML = debtLogs.map(log => `
        <div class="log-item">
          <div class="log-header">
            <span class="log-action log-action-${log.action}">${this.getLogActionLabel(log.action)}</span>
            <span class="log-date">${new Date(log.timestamp).toLocaleString()}</span>
          </div>
          <div class="log-details">
            ${Object.entries(log.details || {}).map(([key, value]) => `
              <span class="log-detail">
                <strong>${key}:</strong> ${typeof value === 'number' ? Helpers.formatCurrency(value) : Helpers.escapeHtml(String(value))}
              </span>
            `).join('')}
          </div>
          <div class="log-admin">By: ${Helpers.escapeHtml(log.admin)}</div>
        </div>
      `).join('');
    }

    document.getElementById('logModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeLogModal() {
    document.getElementById('logModal').classList.remove('active');
    document.body.style.overflow = '';
  },

  getLogActionLabel(action) {
    const labels = {
      created: I18n.t('logCreated'),
      updated: I18n.t('logUpdated'),
      payment: I18n.t('logPayment'),
      deleted: I18n.t('logDeleted')
    };
    return labels[action] || action;
  },

  addLog(debtId, debtType, action, details) {
    const log = {
      id: Helpers.genId('log'),
      debtId,
      debtType,
      action,
      details,
      timestamp: new Date().toISOString(),
      admin: Auth.getSession()?.username || 'unknown'
    };
    this.logs.push(log);
    Storage.set('debt_logs', this.logs);
  },

  saveData() {
    Storage.set('debts', this.debts);
  },

  exportData() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: Auth.getSession()?.username || 'unknown',
      debts: this.debts,
      logs: this.logs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debts-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Helpers.showToast(I18n.t('successExport'), 'success');
  }
};
