const PREFIX = 'library_';

const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Storage get error for ${key}:`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      Snapshot.onDataChange();
      return true;
    } catch (e) {
      console.error(`Storage set error for ${key}:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      Snapshot.onDataChange();
      return true;
    } catch (e) {
      console.error(`Storage remove error for ${key}:`, e);
      return false;
    }
  },

  getAll() {
    return {
      users: this.get('users') || [],
      products: this.get('products') || [],
      books: this.get('books') || [],
      cart: this.get('cart') || [],
      transactions: this.get('transactions') || [],
      trash: this.get('trash') || [],
      settings: this.get('settings') || { theme: 'light', language: 'en' },
      customAttributes: this.get('customAttributes') || []
    };
  },

  exportData() {
    return {
      version: '4.0.0',
      exportedAt: new Date().toISOString(),
      ...this.getAll(),
      dailySnapshots: Snapshot.getAllSnapshots(),
      snapshotHistory: Snapshot.getHistory()
    };
  },

  importData(data) {
    try {
      if (data.users) this.set('users', data.users);
      if (data.products) this.set('products', data.products);
      if (data.books) this.set('books', data.books);
      if (data.cart) this.set('cart', data.cart);
      if (data.transactions) this.set('transactions', data.transactions);
      if (data.trash) this.set('trash', data.trash);
      if (data.settings) this.set('settings', data.settings);
      if (data.customAttributes) this.set('customAttributes', data.customAttributes);

      if (data.dailySnapshots && Array.isArray(data.dailySnapshots)) {
        data.dailySnapshots.forEach(snapshot => {
          if (snapshot.date) {
            localStorage.setItem(Snapshot.PREFIX + snapshot.date, JSON.stringify(snapshot));
          }
        });
      }

      if (data.snapshotHistory) {
        localStorage.setItem('library_snapshot_history', JSON.stringify(data.snapshotHistory));
      }

      return true;
    } catch (e) {
      console.error('Import data error:', e);
      return false;
    }
  },

  restoreFromSnapshot(date) {
    return Snapshot.restoreFromSnapshot(date);
  },

  getSnapshotHistory() {
    return Snapshot.getAllSnapshots();
  }
};
