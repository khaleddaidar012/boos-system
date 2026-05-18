const Backup = {
  exportData() {
    try {
      const data = Storage.exportData();

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Helpers.showToast(I18n.t('successExport'), 'success');
      return true;
    } catch (e) {
      console.error('Export error:', e);
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

        if (!data.version || !data.users || !data.books) {
          throw new Error('Invalid backup file structure');
        }

        const success = Storage.importData(data);

        if (success) {
          Helpers.showToast(I18n.t('successImport'), 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error('Import failed');
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
            valid: !!(data.version && data.users && data.books),
            version: data.version || 'unknown',
            exportedAt: data.exportedAt || 'unknown',
            usersCount: data.users?.length || 0,
            booksCount: data.books?.length || 0,
            transactionsCount: data.transactions?.length || 0,
            snapshotsCount: data.dailySnapshots?.length || 0
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      Helpers.showToast('Restore failed: Snapshot not found', 'danger');
    }
  }
};
