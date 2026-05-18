const AutoBackup = {
  KEY_LAST_BACKUP: 'autobackup_last_run',
  KEY_BACKUP_DATA: 'autobackup_latest',
  KEY_BACKUP_HISTORY: 'autobackup_history',
  INTERVAL_MS: 24 * 60 * 60 * 1000,

  _getMasterPassword() {
    try {
      return localStorage.getItem('admin_master_pw');
    } catch {
      return null;
    }
  },

  _getTodayKey() {
    return new Date().toISOString().split('T')[0];
  },

  _collectFullData() {
    const db = Storage.getDb();
    if (!db) return null;
    return {
      version: '6.0.0',
      exportedAt: new Date().toISOString(),
      users: db.users || [],
      products: db.products || [],
      books: db.books || [],
      cart: db.cart || [],
      transactions: db.transactions || [],
      trash: db.trash || [],
      settings: db.settings || { theme: 'light', language: 'en' },
      customAttributes: db.customAttributes || [],
      debts: db.debts || { owed_to_library: [], we_owe: [] },
      debt_logs: db.debt_logs || []
    };
  },

  run() {
    const pw = this._getMasterPassword();
    if (!pw) return false;

    const data = this._collectFullData();
    if (!data) return false;

    try {
      const encrypted = Crypto.encrypt(data, pw);
      const hash = Crypto.hashPassword(JSON.stringify(data) + pw);

      const backup = {
        type: 'daily-secure-backup',
        version: '6.0.0',
        timestamp: new Date().toISOString(),
        date: this._getTodayKey(),
        data: encrypted,
        hash: hash
      };

      localStorage.setItem(this.KEY_BACKUP_DATA, JSON.stringify(backup));
      localStorage.setItem(this.KEY_LAST_BACKUP, backup.timestamp);

      const history = this.getHistory();
      const existingIdx = history.findIndex(h => h.date === backup.date);
      if (existingIdx !== -1) {
        history[existingIdx] = {
          date: backup.date,
          timestamp: backup.timestamp,
          hash: hash
        };
      } else {
        history.push({
          date: backup.date,
          timestamp: backup.timestamp,
          hash: hash
        });
      }
      history.sort((a, b) => b.date.localeCompare(a.date));
      if (history.length > 30) history.splice(30);
      localStorage.setItem(this.KEY_BACKUP_HISTORY, JSON.stringify(history));

      return true;
    } catch (e) {
      console.error('AutoBackup run error:', e);
      return false;
    }
  },

  checkAndRun() {
    const lastRun = localStorage.getItem(this.KEY_LAST_BACKUP);
    const now = Date.now();

    if (!lastRun) {
      this.run();
      return;
    }

    const lastTime = new Date(lastRun).getTime();
    if (now - lastTime >= this.INTERVAL_MS) {
      this.run();
    }
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_BACKUP_HISTORY) || '[]');
    } catch {
      return [];
    }
  },

  getLatest() {
    try {
      const raw = localStorage.getItem(this.KEY_BACKUP_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getLastRunTime() {
    return localStorage.getItem(this.KEY_LAST_BACKUP);
  },

  restoreLatest() {
    const backup = this.getLatest();
    if (!backup) return { success: false, error: 'noBackup' };

    const pw = this._getMasterPassword();
    if (!pw) return { success: false, error: 'noMasterPw' };

    try {
      const decrypted = Crypto.decrypt(backup.data, pw);
      if (!decrypted) return { success: false, error: 'decryptFailed' };

      const verifyHash = Crypto.hashPassword(JSON.stringify(decrypted) + pw);
      if (verifyHash !== backup.hash) return { success: false, error: 'hashMismatch' };

      Storage.importData(decrypted);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'restoreFailed' };
    }
  },

  exportLatestAsFile() {
    const backup = this.getLatest();
    if (!backup) return false;

    try {
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-daily-backup-${backup.date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('AutoBackup export error:', e);
      return false;
    }
  }
};

const Backup = {
  _requireAdmin() {
    if (!Auth.isAdmin()) {
      console.warn('[Backup] Export blocked: user is not admin');
      Helpers.showToast('Access denied: admin only', 'danger');
      return false;
    }
    return true;
  },

  exportPlain() {
    if (!this._requireAdmin()) return false;

    const pw = prompt(I18n.t('enterBackupPassword') || 'Enter admin password to export:');
    if (!pw) return false;

    if (pw !== 'khaled012') {
      Helpers.showToast('Wrong password', 'danger');
      return false;
    }

    try {
      const db = Storage.getDb();
      if (!db) throw new Error('Database not accessible');

      const data = {
        type: 'plain-export',
        version: '6.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: Auth.getSession()?.username || 'unknown',
        data: {
          products: db.products || [],
          transactions: db.transactions || [],
          trash: db.trash || [],
          customAttributes: db.customAttributes || [],
          debts: db.debts || { owed_to_library: [], we_owe: [] },
          debt_logs: db.debt_logs || []
        }
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-plain-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Helpers.showToast(I18n.t('successExport'), 'success');
      return true;
    } catch (e) {
      console.error('Plain export error:', e);
      Helpers.showToast('Export failed: ' + e.message, 'danger');
      return false;
    }
  },

  exportSecure() {
    if (!this._requireAdmin()) return false;

    try {
      const db = Storage.getDb();
      if (!db) throw new Error('Database not accessible');

      const rawData = {
        version: '6.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: Auth.getSession()?.username || 'unknown',
        users: db.users || [],
        products: db.products || [],
        books: db.books || [],
        cart: db.cart || [],
        transactions: db.transactions || [],
        trash: db.trash || [],
        settings: db.settings || { theme: 'light', language: 'en' },
        customAttributes: db.customAttributes || [],
        debts: db.debts || { owed_to_library: [], we_owe: [] },
        debt_logs: db.debt_logs || [],
        dailySnapshots: typeof Snapshot !== 'undefined' ? Snapshot.getAllSnapshots() : [],
        snapshotHistory: typeof Snapshot !== 'undefined' ? Snapshot.getHistory() : []
      };

      const pw = prompt(I18n.t('enterBackupPassword') || 'Enter backup password:');
      if (!pw) return false;

      const encrypted = Crypto.encrypt(rawData, pw);
      const hash = Crypto.hashPassword(JSON.stringify(rawData) + pw);

      const data = {
        type: 'secure-backup',
        version: '6.0.0',
        exportedAt: new Date().toISOString(),
        data: encrypted,
        hash: hash
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-secure-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Helpers.showToast(I18n.t('successExport'), 'success');
      return true;
    } catch (e) {
      console.error('Secure export error:', e);
      Helpers.showToast('Export failed: ' + e.message, 'danger');
      return false;
    }
  },

  importData(file) {
    if (!file || file.type !== 'application/json') {
      Helpers.showToast(I18n.t('errorImport'), 'danger');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.version) {
          throw new Error('Invalid backup file structure');
        }

        if (data.type === 'secure-backup') {
          const pw = prompt(I18n.t('enterRestorePassword') || 'Enter backup password to decrypt:');
          if (!pw) return;

          const decrypted = Crypto.decrypt(data.data, pw);
          if (!decrypted) {
            Helpers.showToast(I18n.t('wrongPassword') || 'Wrong password or corrupted file', 'danger');
            return;
          }

          const verifyHash = Crypto.hashPassword(JSON.stringify(decrypted) + pw);
          if (verifyHash !== data.hash) {
            Helpers.showToast('File integrity check failed. Wrong password or corrupted file.', 'danger');
            return;
          }

          const success = Storage.importData(decrypted);
          if (success) {
            Helpers.showToast(I18n.t('successImport'), 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error('Import failed');
          }
        } else if (data.type === 'plain-export') {
          if (!Helpers.confirm('Import plain data? This will merge with existing data.')) return;
          const plainData = data.data || {};
          const db = Storage.getDb() || Storage._emptyDb();
          if (plainData.products) db.products = plainData.products;
          if (plainData.transactions) db.transactions = plainData.transactions;
          if (plainData.trash) db.trash = plainData.trash;
          if (plainData.customAttributes) db.customAttributes = plainData.customAttributes;
          if (plainData.debts) db.debts = plainData.debts;
          if (plainData.debt_logs) db.debt_logs = plainData.debt_logs;
          Storage.saveDb(db);
          Helpers.showToast(I18n.t('successImport'), 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else if (data.type === 'daily-secure-backup') {
          const masterPw = localStorage.getItem('admin_master_pw');
          if (!masterPw) {
            Helpers.showToast('No master password set. Admin must set one in settings.', 'warning');
            return;
          }

          const decrypted = Crypto.decrypt(data.data, masterPw);
          if (!decrypted) {
            Helpers.showToast('Wrong password or corrupted file', 'danger');
            return;
          }

          const verifyHash = Crypto.hashPassword(JSON.stringify(decrypted) + masterPw);
          if (verifyHash !== data.hash) {
            Helpers.showToast('File integrity check failed.', 'danger');
            return;
          }

          const success = Storage.importData(decrypted);
          if (success) {
            Helpers.showToast(I18n.t('successImport'), 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error('Import failed');
          }
        } else {
          const success = Storage.importData(data);
          if (success) {
            Helpers.showToast(I18n.t('successImport'), 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error('Import failed');
          }
        }
      } catch (err) {
        console.error('Import error:', err);
        Helpers.showToast('Import failed: Invalid or corrupted file', 'danger');
      }
    };

    reader.onerror = () => {
      Helpers.showToast('Import failed: Could not read file', 'danger');
    };

    reader.readAsText(file);
  },

  validateBackup(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve({
            valid: !!data.version,
            type: data.type || 'legacy',
            version: data.version || 'unknown',
            exportedAt: data.exportedAt || 'unknown',
            encrypted: data.type === 'secure-backup' || data.type === 'daily-secure-backup'
          });
        } catch {
          resolve({ valid: false });
        }
      };
      reader.readAsText(file);
    });
  },

  restoreFromSnapshot(date) {
    if (!Helpers.confirm(`Restore system state from ${date}? This will replace current data.`)) return;
    const success = Storage.restoreFromSnapshot(date);
    if (success) {
      Helpers.showToast(`System restored from ${date}`, 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      Helpers.showToast('Restore failed: Snapshot not found', 'danger');
    }
  }
};
