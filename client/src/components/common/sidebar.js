const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "grid", route: "/dashboard", roles: ["admin", "employee"] },
      { label: "Inventory", icon: "package", route: "/inventory", roles: ["admin", "employee"] },
      { label: "POS", icon: "shopping-cart", route: "/pos", roles: ["admin", "employee"] },
    ],
  },
  {
    section: "Management",
    items: [
      { label: "Employees", icon: "users", route: "/employees", roles: ["admin"] },
      { label: "Analytics", icon: "bar-chart", route: "/analytics", roles: ["admin"] },
    ],
  },
]

const ICONS = {
  grid: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  package: `<svg viewBox="0 0 24 24"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/></svg>`,
  "shopping-cart": `<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "bar-chart": `<svg viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
}

function isItemVisible(item, userRole) {
  if (userRole === "admin") return true
  return item.roles.includes(userRole) || item.roles.includes("employee")
}

function Sidebar(options = {}) {
  const { container, router, onToggle, userRole = "admin", collapsed = false } = options

  function render() {
    let html = `<div class="sidebar${collapsed ? " open" : ""}">
      <div class="sidebar-header">
        <div class="sidebar-logo">ERP</div>
        <span class="sidebar-title">ERP System</span>
      </div>
      <nav class="sidebar-nav">`

    for (const group of NAV_ITEMS) {
      const visibleItems = group.items.filter((item) => isItemVisible(item, userRole))
      if (visibleItems.length === 0) continue

      html += `<div class="sidebar-section-label">${group.section}</div>`

      for (const item of visibleItems) {
        const activeClass =
          router && router.getCurrentPath() === item.route ? " active" : ""
        const iconHtml = ICONS[item.icon] || ""
        html += `<a class="nav-item${activeClass}" data-route="${item.route}">
          <span class="nav-item-icon">${iconHtml}</span>
          <span class="nav-item-label">${item.label}</span>
        </a>`
      }
    }

    html += `</nav>
      <div class="sidebar-footer">
        <div style="font-size:0.75rem;color:var(--text-muted);text-align:center">
          ERP System v1.0.0
        </div>
      </div>
    </div>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>`

    container.innerHTML = html
    bindEvents()
  }

  function bindEvents() {
    container.querySelectorAll(".nav-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault()
        const route = el.dataset.route
        if (router) {
          router.navigate(route)
        }
        closeMobile()
      })
    })

    const overlay = container.querySelector("#sidebarOverlay")
    if (overlay) {
      overlay.addEventListener("click", closeMobile)
    }
  }

  function updateActive(route) {
    container.querySelectorAll(".nav-item").forEach((el) => {
      el.classList.toggle("active", el.dataset.route === route)
    })
  }

  function openMobile() {
    const sidebar = container.querySelector(".sidebar")
    const overlay = container.querySelector("#sidebarOverlay")
    if (sidebar) sidebar.classList.add("open")
    if (overlay) overlay.classList.add("visible")
  }

  function closeMobile() {
    const sidebar = container.querySelector(".sidebar")
    const overlay = container.querySelector("#sidebarOverlay")
    if (sidebar) sidebar.classList.remove("open")
    if (overlay) overlay.classList.remove("visible")
  }

  function toggleMobile() {
    const sidebar = container.querySelector(".sidebar")
    if (sidebar && sidebar.classList.contains("open")) {
      closeMobile()
    } else {
      openMobile()
    }
  }

  return { render, updateActive, openMobile, closeMobile, toggleMobile }
}

export default Sidebar
