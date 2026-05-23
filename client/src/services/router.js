class Router {
  constructor(outletSelector) {
    this._outlet = document.querySelector(outletSelector)
    this._routes = new Map()
    this._currentRoute = null
    this._beforeHooks = []
    this._onHashChange = this._onHashChange.bind(this)
  }

  addRoute(pattern, page) {
    this._routes.set(pattern, page)
    return this
  }

  beforeEach(hook) {
    this._beforeHooks.push(hook)
    return this
  }

  init() {
    window.addEventListener("hashchange", this._onHashChange)
    this._navigate(this._getHash())
  }

  destroy() {
    window.removeEventListener("hashchange", this._onHashChange)
  }

  navigate(path) {
    window.location.hash = path
  }

  getCurrentPath() {
    return this._getHash()
  }

  _getHash() {
    const raw = window.location.hash.replace(/^#/, "") || "/dashboard"
    return raw
  }

  _onHashChange() {
    this._navigate(this._getHash())
  }

  async _navigate(path) {
    const page = this._routes.get(path)
    if (!page) {
      this._renderNotFound(path)
      return
    }

    for (const hook of this._beforeHooks) {
      const result = hook(path, this._currentRoute)
      if (result === false) return
    }

    this._currentRoute = path

    if (this._outlet) {
      this._outlet.innerHTML = ""
      page.render(this._outlet)
      if (page.mount) {
        page.mount(this._outlet)
      }
    }
  }

  _renderNotFound(path) {
    if (this._outlet) {
      this._outlet.innerHTML = `
        <div style="text-align:center;padding:4rem 2rem">
          <h2>Page Not Found</h2>
          <p style="color:var(--text-muted);margin:1rem 0">No route matches <code>${path}</code></p>
          <a href="#/dashboard" style="color:var(--accent-primary)">Go to Dashboard</a>
        </div>
      `
    }
  }
}

export default Router
