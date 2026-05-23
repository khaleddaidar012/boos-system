const STORAGE_KEY = "erp_theme"

const Theme = {
  _current: "light",

  init() {
    const saved = this._load()
    this.apply(saved)
  },

  get() {
    return this._current
  },

  toggle() {
    const next = this._current === "dark" ? "light" : "dark"
    this.apply(next)
    return next
  },

  apply(theme) {
    this._current = theme
    document.documentElement.setAttribute("data-theme", theme)
    this._save(theme)
  },

  _load() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light"
    } catch {
      return "light"
    }
  },

  _save(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
    }
  },
}

export default Theme
