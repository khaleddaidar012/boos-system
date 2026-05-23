function Navbar(options = {}) {
  const { container, sidebar, theme, pageTitle = "Dashboard" } = options

  function render() {
    container.innerHTML = `
      <header class="navbar">
        <div class="navbar-left">
          <button class="navbar-toggle-btn" id="navToggle" title="Toggle menu">
            <svg viewBox="0 0 24 24"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
          </button>
          <h1 class="navbar-page-title" id="pageTitle">${pageTitle}</h1>
        </div>
        <div class="navbar-right">
          <button class="navbar-icon-btn" id="themeToggle" title="Toggle theme">
            <svg viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <button class="navbar-icon-btn" id="notifToggle" title="Notifications">
            <svg viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="navbar-badge">3</span>
          </button>
          <div class="navbar-profile" id="userProfile">
            <div class="navbar-avatar">A</div>
            <div>
              <div class="navbar-user-name">Admin</div>
              <div class="navbar-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </header>
    `
    bindEvents()
  }

  function bindEvents() {
    const toggleBtn = container.querySelector("#navToggle")
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => sidebar.toggleMobile())
    }

    const themeBtn = container.querySelector("#themeToggle")
    if (themeBtn && theme) {
      themeBtn.addEventListener("click", () => {
        theme.toggle()
        render()
        bindEvents()
      })
    }
  }

  function setTitle(title) {
    const el = container.querySelector("#pageTitle")
    if (el) el.textContent = title
  }

  return { render, setTitle }
}

export default Navbar
