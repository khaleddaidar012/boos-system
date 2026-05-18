const Theme = {
  init() {
    const settings = Storage.get('settings');
    const theme = settings?.theme || 'light';
    this.apply(theme);
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
    const settings = Storage.get('settings') || { theme: 'light', language: 'en' };
    settings.theme = newTheme;
    Storage.set('settings', settings);
  },

  getTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};
