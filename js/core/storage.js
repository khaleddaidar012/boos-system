const DB_KEY = 'library_db';

const Crypto = {
  _deriveKey(password, salt) {
    let key = '';
    let prev = password + salt;
    for (let i = 0; i < 64; i++) {
      let h = 0;
      for (let j = 0; j < prev.length; j++) {
        h = ((h << 5) - h + prev.charCodeAt(j)) | 0;
      }
      key += String.fromCharCode((Math.abs(h) % 94) + 33);
      prev = key + password + salt;
    }
    return key;
  },

  _xor(data, key) {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode((data.charCodeAt(i) ^ key.charCodeAt(i % key.length)) & 0xFF);
    }
    return result;
  },

  _utf8Encode(str) {
    try {
      return unescape(encodeURIComponent(str));
    } catch {
      let out = '';
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code < 0x80) {
          out += str.charAt(i);
        } else if (code < 0x800) {
          out += String.fromCharCode(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
        } else {
          out += String.fromCharCode(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
        }
      }
      return out;
    }
  },

  _utf8Decode(bytes) {
    try {
      return decodeURIComponent(escape(bytes));
    } catch {
      let out = '';
      let i = 0;
      while (i < bytes.length) {
        const c = bytes.charCodeAt(i);
        if (c < 0x80) {
          out += bytes.charAt(i++);
        } else if (c < 0xE0) {
          out += String.fromCharCode(((c & 0x1F) << 6) | (bytes.charCodeAt(i + 1) & 0x3F));
          i += 2;
        } else {
          out += String.fromCharCode(((c & 0x0F) << 12) | ((bytes.charCodeAt(i + 1) & 0x3F) << 6) | (bytes.charCodeAt(i + 2) & 0x3F));
          i += 3;
        }
      }
      return out;
    }
  },

  encrypt(data, password) {
    const salt = Array.from({length: 8}, () => Math.floor(Math.random() * 94 + 33)).map(c => String.fromCharCode(c)).join('');
    const key = this._deriveKey(password, salt);
    const json = JSON.stringify(data);
    const encoded = this._utf8Encode(json);
    const xored = this._xor(encoded, key);
    return btoa(salt + xored);
  },

  decrypt(cipherText, password) {
    try {
      const decoded = atob(cipherText);
      const salt = decoded.substring(0, 8);
      const xored = decoded.substring(8);
      const key = this._deriveKey(password, salt);
      const encoded = this._xor(xored, key);
      const json = this._utf8Decode(encoded);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  },

  hashPassword(password) {
    let h = 0;
    for (let i = 0; i < password.length; i++) {
      h = ((h << 5) - h + password.charCodeAt(i)) | 0;
    }
    let h2 = 0;
    for (let i = 0; i < password.length; i++) {
      h2 = ((h2 << 7) - h2 + password.charCodeAt(i) * 31) | 0;
    }
    return Math.abs(h).toString(36) + Math.abs(h2).toString(36);
  }
};

const Storage = {
  _dbCache: null,

  _emptyDb() {
    return {
      users: [], products: [], books: [], cart: [], transactions: [],
      trash: [], settings: { theme: 'light', language: 'en' },
      customAttributes: [], debts: { owed_to_library: [], we_owe: [] }, debt_logs: []
    };
  },

  _loadFromDisk() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return this._emptyDb();
      const data = JSON.parse(raw);
      const def = this._emptyDb();
      for (const k of Object.keys(def)) {
        if (!(k in data)) data[k] = def[k];
      }
      return data;
    } catch {
      return this._emptyDb();
    }
  },

  getDb() {
    this._dbCache = this._loadFromDisk();
    return this._dbCache;
  },

  saveDb(db) {
    this._dbCache = db;
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      if (typeof Snapshot !== 'undefined') Snapshot.onDataChange();
      return true;
    } catch (e) {
      console.error('saveDb error:', e);
      return false;
    }
  },

  initDb() {
    const db = this.getDb();
    if (!db) return;
    if (db.users && db.users.length > 0) return;
    db.users = [
      { id: 'usr_admin', username: 'admin', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() },
      { id: 'usr_worker', username: 'worker', password: 'worker123', role: 'worker', createdAt: new Date().toISOString() }
    ];
    db.products = [
      { id: 'prod_1', name: 'Riyad as-Salihin', type: 'books', price: 25, cost: 15, quantity: 50, image: '', description: 'Collection of hadith', attributes: { author: 'Imam Nawawi', language: 'en' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'prod_2', name: 'Cotton Thobe', type: 'clothes', price: 35, cost: 20, quantity: 45, image: '', description: 'Premium cotton thobe', attributes: { size: ['M','L','XL'], color: 'White' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'prod_3', name: 'Oud Al-Madinah', type: 'perfumes', price: 85, cost: 50, quantity: 25, image: '', description: 'Premium oud', attributes: { sizeMl: '50', fragranceType: 'oud' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    db.cart = [];
    db.transactions = [];
    db.trash = [];
    db.customAttributes = [];
    db.debts = { owed_to_library: [], we_owe: [] };
    db.debt_logs = [];
    this.saveDb(db);
  },

  get(key) {
    try {
      if (key === 'session') {
        const raw = sessionStorage.getItem('library_session');
        return raw ? JSON.parse(raw) : null;
      }
      if (key === 'settings') {
        const raw = localStorage.getItem('library_settings');
        return raw ? JSON.parse(raw) : null;
      }
      const db = this.getDb();
      if (!db) return null;
      return db[key] !== undefined ? db[key] : null;
    } catch (e) {
      return null;
    }
  },

  set(key, value) {
    try {
      if (key === 'session') {
        sessionStorage.setItem('library_session', JSON.stringify(value));
        return true;
      }
      if (key === 'settings') {
        localStorage.setItem('library_settings', JSON.stringify(value));
        return true;
      }
      const db = this.getDb();
      if (!db) return false;
      db[key] = value;
      return this.saveDb(db);
    } catch (e) {
      console.error('Storage.set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      const db = this.getDb();
      if (!db) return false;
      delete db[key];
      return this.saveDb(db);
    } catch (e) {
      return false;
    }
  },

  getAll() {
    const db = this.getDb() || this._emptyDb();
    return {
      users: db.users || [], products: db.products || [], books: db.books || [],
      cart: db.cart || [], transactions: db.transactions || [], trash: db.trash || [],
      settings: db.settings || { theme: 'light', language: 'en' },
      customAttributes: db.customAttributes || []
    };
  },

  exportData() {
    const db = this.getDb() || this._emptyDb();
    return {
      version: '6.0.0', exportedAt: new Date().toISOString(), ...db,
      dailySnapshots: typeof Snapshot !== 'undefined' ? Snapshot.getAllSnapshots() : [],
      snapshotHistory: typeof Snapshot !== 'undefined' ? Snapshot.getHistory() : []
    };
  },

  importData(data) {
    try {
      const db = this.getDb() || this._emptyDb();
      if (data.users) db.users = data.users;
      if (data.products) db.products = data.products;
      if (data.books) db.books = data.books;
      if (data.cart) db.cart = data.cart;
      if (data.transactions) db.transactions = data.transactions;
      if (data.trash) db.trash = data.trash;
      if (data.settings) db.settings = data.settings;
      if (data.customAttributes) db.customAttributes = data.customAttributes;
      if (data.debts) db.debts = data.debts;
      if (data.debt_logs) db.debt_logs = data.debt_logs;
      this.saveDb(db);
      if (data.dailySnapshots && Array.isArray(data.dailySnapshots)) {
        data.dailySnapshots.forEach(s => {
          if (s.date && typeof Snapshot !== 'undefined') localStorage.setItem(Snapshot.PREFIX + s.date, JSON.stringify(s));
        });
      }
      if (data.snapshotHistory) localStorage.setItem('library_snapshot_history', JSON.stringify(data.snapshotHistory));
      return true;
    } catch (e) {
      return false;
    }
  },

  restoreFromSnapshot(date) { return typeof Snapshot !== 'undefined' ? Snapshot.restoreFromSnapshot(date) : false; },
  getSnapshotHistory() { return typeof Snapshot !== 'undefined' ? Snapshot.getAllSnapshots() : []; }
};
