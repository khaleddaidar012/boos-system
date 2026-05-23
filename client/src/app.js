import Theme from "./services/theme.js"
import Router from "./services/router.js"
import Sidebar from "./components/common/sidebar.js"
import Navbar from "./components/common/navbar.js"

import PageDashboard from "./pages/dashboard.js"
import PageInventory from "./pages/inventory.js"
import PagePos from "./pages/pos.js"
import PageAnalytics from "./pages/analytics.js"
import PageEmployees from "./pages/employees.js"

const pageTitleMap = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/pos": "Point of Sale",
  "/analytics": "Analytics",
  "/employees": "Employees",
}

function init() {
  Theme.init()

  const sidebarEl = document.getElementById("sidebar")
  const navbarEl = document.getElementById("navbar")
  const contentEl = document.getElementById("content")

  const router = new Router("#content")

  const sidebar = Sidebar({
    container: sidebarEl,
    router,
    userRole: "admin",
  })

  const navbar = Navbar({
    container: navbarEl,
    sidebar,
    theme: Theme,
    pageTitle: "Dashboard",
  })

  router.beforeEach((path) => {
    const title = pageTitleMap[path] || "ERP System"
    document.title = `${title} | ERP System`
    navbar.setTitle(title)
    sidebar.updateActive(path)
  })

  router.addRoute("/dashboard", PageDashboard)
  router.addRoute("/inventory", PageInventory)
  router.addRoute("/pos", PagePos)
  router.addRoute("/analytics", PageAnalytics)
  router.addRoute("/employees", PageEmployees)

  sidebar.render()
  navbar.render()
  router.init()
}

document.addEventListener("DOMContentLoaded", init)
