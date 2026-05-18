const Auth = {
  login(username, password) {
    const users = Storage.get('users') || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const session = {
        userId: user.id,
        username: user.username,
        role: user.role,
        loginAt: new Date().toISOString()
      };
      sessionStorage.setItem('library_session', JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, error: 'loginError' };
  },

  logout() {
    sessionStorage.removeItem('library_session');
    window.location.href = 'index.html';
  },

  getSession() {
    try {
      const raw = sessionStorage.getItem('library_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  isAdmin() {
    const session = this.getSession();
    return session?.role === 'admin';
  },

  isWorker() {
    const session = this.getSession();
    return session?.role === 'worker';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }
};
