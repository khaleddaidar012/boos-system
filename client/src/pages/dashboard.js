const PageDashboard = {
  render(container) {
    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <h2 style="font-size:1.5rem;font-weight:700">Dashboard Overview</h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-bottom:2rem">
          <div class="card" style="padding:1.5rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color)">
            <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Total Products</div>
            <div style="font-size:2rem;font-weight:700;color:var(--text-primary);margin:0.5rem 0">0</div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">Items in inventory</div>
          </div>

          <div class="card" style="padding:1.5rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color)">
            <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Today Sales</div>
            <div style="font-size:2rem;font-weight:700;color:var(--text-primary);margin:0.5rem 0">$0.00</div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">Revenue today</div>
          </div>

          <div class="card" style="padding:1.5rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color)">
            <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Active Employees</div>
            <div style="font-size:2rem;font-weight:700;color:var(--text-primary);margin:0.5rem 0">0</div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">Staff on shift</div>
          </div>

          <div class="card" style="padding:1.5rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color)">
            <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Pending Orders</div>
            <div style="font-size:2rem;font-weight:700;color:var(--text-primary);margin:0.5rem 0">0</div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">Awaiting processing</div>
          </div>
        </div>

        <div class="card" style="padding:2rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color);text-align:center">
          <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3">📊</div>
          <h3 style="margin-bottom:0.5rem">Analytics Coming Soon</h3>
          <p style="color:var(--text-muted)">Dashboard charts and reports will be available after data is populated.</p>
        </div>
      </div>
    `
  },
}

export default PageDashboard
