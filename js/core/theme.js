const Theme = {
  _storageKey: 'library_settings',

  init() {
    const settings = this._read();
    const theme = settings?.theme || 'light';
    this.apply(theme);
  },

  _read() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  _write(settings) {
    try { localStorage.setItem(this._storageKey, JSON.stringify(settings)); } catch {}
  },

  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    this.apply(newTheme);
    const settings = this._read() || { theme: 'light', language: 'en' };
    settings.theme = newTheme;
    this._write(settings);
  },

  getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};
