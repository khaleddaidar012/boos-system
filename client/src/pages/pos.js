const PagePos = {
  render(container) {
    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <h2 style="font-size:1.5rem;font-weight:700">Point of Sale</h2>
        </div>

        <div class="card" style="padding:3rem;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-color);text-align:center">
          <div style="font-size:4rem;margin-bottom:1rem;opacity:0.3">🛒</div>
          <h3 style="margin-bottom:0.5rem">POS Module</h3>
          <p style="color:var(--text-muted);max-width:400px;margin:0 auto">
            Cashier interface, cart management, and checkout processing will be implemented here.
          </p>
        </div>
      </div>
    `
  },
}

export default PagePos
