const Snapshot = {
  PREFIX: 'library_snapshot_',
  lastSnapshotTime: 0,
  cooldownMs: 30 * 60 * 1000,

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  },

  onDataChange() {
    const now = Date.now();
    if (now - this.lastSnapshotTime < this.cooldownMs) return;
    this.lastSnapshotTime = now;
    this.createSnapshot();
  },

  createSnapshot() {
    const today = this.getTodayKey();
    const snapshotKey = this.PREFIX + today;

    const snapshot = {
      timestamp: new Date().toISOString(),
      date: today,
      version: '3.0.0',
      books: Storage.get('books') || [],
      users: Storage.get('users') || [],
      transactions: Storage.get('transactions') || [],
      trash: Storage.get('trash') || [],
      cart: Storage.get('cart') || [],
      settings: Storage.get('settings') || { theme: 'light', language: 'en' }
    };

    try {
      localStorage.setItem(snapshotKey, JSON.stringify(snapshot));

      const history = this.getHistory();
      if (!history.includes(today)) {
        history.push(today);
        history.sort().reverse();
        if (history.length > 90) {
          const toRemove = history.slice(90);
          toRemove.forEach(oldDate => {
            localStorage.removeItem(this.PREFIX + oldDate);
          });
          history.splice(90);
        }
        localStorage.setItem('library_snapshot_history', JSON.stringify(history));
      }

      return true;
    } catch (e) {
      console.error('Snapshot save error:', e);
      return false;
    }
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('library_snapshot_history') || '[]');
    } catch {
      return [];
    }
  },

  getSnapshot(date) {
    try {
      const data = localStorage.getItem(this.PREFIX + date);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getLatestSnapshot() {
    const history = this.getHistory();
    if (history.length === 0) return null;
    return this.getSnapshot(history[0]);
  },

  getAllSnapshots() {
    const history = this.getHistory();
    return history.map(date => {
      const snapshot = this.getSnapshot(date);
      return snapshot ? {
        date: snapshot.date,
        timestamp: snapshot.timestamp,
        booksCount: snapshot.books?.length || 0,
        transactionsCount: snapshot.transactions?.length || 0,
        usersCount: snapshot.users?.length || 0,
        trashCount: snapshot.trash?.length || 0,
        size: JSON.stringify(snapshot).length
      } : null;
    }).filter(Boolean);
  },

  restoreFromSnapshot(date) {
    const snapshot = this.getSnapshot(date);
    if (!snapshot) return false;

    try {
      if (snapshot.books) Storage.set('books', snapshot.books);
      if (snapshot.users) Storage.set('users', snapshot.users);
      if (snapshot.transactions) Storage.set('transactions', snapshot.transactions);
      if (snapshot.trash) Storage.set('trash', snapshot.trash);
      if (snapshot.cart) Storage.set('cart', snapshot.cart);
      if (snapshot.settings) Storage.set('settings', snapshot.settings);
      return true;
    } catch (e) {
      console.error('Restore from snapshot error:', e);
      return false;
    }
  },

  deleteSnapshot(date) {
    if (date === this.getTodayKey()) return false;
    localStorage.removeItem(this.PREFIX + date);
    let history = this.getHistory();
    history = history.filter(d => d !== date);
    localStorage.setItem('library_snapshot_history', JSON.stringify(history));
    return true;
  },

  clearOldSnapshots(daysToKeep = 30) {
    const history = this.getHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    history.forEach(date => {
      if (date < cutoffStr && date !== this.getTodayKey()) {
        this.deleteSnapshot(date);
      }
    });
  },

  exportSnapshotAsFile(date) {
    const snapshot = this.getSnapshot(date);
    if (!snapshot) return false;

    try {
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-snapshot-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Export snapshot error:', e);
      return false;
    }
  },

  initAutoSnapshot() {
    this.createSnapshot();

    setInterval(() => {
      this.createSnapshot();
    }, 60 * 60 * 1000);

    window.addEventListener('beforeunload', () => {
      this.createSnapshot();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.createSnapshot();
      }
    });
  }
};
