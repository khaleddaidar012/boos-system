const Theme = {
  init() {
    try {
      const raw = localStorage.getItem('library_settings');
      const settings = raw ? JSON.parse(raw) : null;
      const theme = settings?.theme || 'light';
      this.apply(theme);
    } catch {}
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
    try {
      const raw = localStorage.getItem('library_settings');
      const settings = raw ? JSON.parse(raw) : { theme: 'light', language: 'en' };
      settings.theme = newTheme;
      localStorage.setItem('library_settings', JSON.stringify(settings));
    } catch {}
  },

  getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};
