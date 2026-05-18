const Analytics = {
  transactions: [],
  currentFilter: 'today',
  customStartDate: null,
  customEndDate: null,

  init() {
    this.transactions = Storage.get('transactions') || [];
    this.bindFilterEvents();
    this.applyFilter();
  },

  bindFilterEvents() {
    const filterBtns = document.querySelectorAll('.time-filter-btn');
    const customRange = document.getElementById('customDateRange');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;

        if (this.currentFilter === 'custom') {
          customRange.classList.add('visible');
        } else {
          customRange.classList.remove('visible');
          this.applyFilter();
        }
      });
    });

    const applyCustomBtn = document.getElementById('applyCustomRange');
    if (applyCustomBtn) {
      applyCustomBtn.addEventListener('click', () => {
        const start = document.getElementById('customStartDate').value;
        const end = document.getElementById('customEndDate').value;
        if (start && end) {
          this.customStartDate = start;
          this.customEndDate = end;
          this.applyFilter();
        }
      });
    }

    const txnList = document.getElementById('transactionsList');
    if (txnList) {
      txnList.addEventListener('click', (e) => {
        const header = e.target.closest('.txn-header');
        if (header) {
          const details = header.nextElementSibling;
          details.classList.toggle('expanded');
        }
      });
    }
  },

  applyFilter() {
    const filtered = this.getFilteredTransactions().map(t => this.normalizeTransaction(t));
    this.renderStats(filtered);
    this.renderChart(filtered);
    this.renderTransactions(filtered);
    this.renderBestSellers(filtered);
    this.renderLowStock(filtered);
  },

  getFilteredTransactions() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return this.transactions.filter(t => {
      const txnDate = t.date ? (t.date.length > 10 ? t.date.split('T')[0] : t.date) : '';
      const txnTimestamp = t.timestamp || (t.date ? new Date(t.date).getTime() : 0);

      switch (this.currentFilter) {
        case 'today':
          return txnDate === today;

        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return txnDate === yesterday.toISOString().split('T')[0];
        }

        case 'last7days': {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return txnTimestamp >= sevenDaysAgo.getTime();
        }

        case 'thisWeek': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return txnTimestamp >= startOfWeek.getTime();
        }

        case 'lastWeek': {
          const startOfLastWeek = new Date(now);
          startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7);
          startOfLastWeek.setHours(0, 0, 0, 0);
          const endOfLastWeek = new Date(startOfLastWeek);
          endOfLastWeek.setDate(endOfLastWeek.getDate() + 7);
          return txnTimestamp >= startOfLastWeek.getTime() && txnTimestamp < endOfLastWeek.getTime();
        }

        case 'thisMonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return txnTimestamp >= startOfMonth.getTime();
        }

        case 'lastMonth': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return txnTimestamp >= startOfLastMonth.getTime() && txnTimestamp < endOfLastMonth.getTime();
        }

        case 'last30days': {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return txnTimestamp >= thirtyDaysAgo.getTime();
        }

        case 'custom':
          if (this.customStartDate && this.customEndDate) {
            return txnDate >= this.customStartDate && txnDate <= this.customEndDate;
          }
          return true;

        case 'all':
        default:
          return true;
      }
    });
  },

  normalizeTransaction(t) {
    return {
      transactionId: t.transactionId || t.id || 'N/A',
      timestamp: t.timestamp || (t.date ? new Date(t.date).getTime() : 0),
      date: t.date ? (t.date.length > 10 ? t.date.split('T')[0] : t.date) : '',
      time: t.time || (t.date ? new Date(t.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''),
      employee: t.employee || t.cashier || 'unknown',
      items: t.items || [],
      totalQuantity: t.totalQuantity || (t.items ? t.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0),
      totalPrice: t.totalPrice || t.total || 0,
      totalProfit: t.totalProfit || t.profit || 0,
      paymentStatus: t.paymentStatus || 'completed'
    };
  },

  renderStats(transactions) {
    const totalSales = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalProfit = transactions.reduce((sum, t) => sum + (t.totalProfit || 0), 0);
    const totalOrders = transactions.length;
    const totalProductsSold = transactions.reduce((sum, t) => sum + t.totalQuantity, 0);

    AnimatedCounter.animate(document.getElementById('totalSales'), totalSales, 600);
    AnimatedCounter.animate(document.getElementById('totalProfit'), totalProfit, 600);
    AnimatedCounter.animate(document.getElementById('totalOrders'), totalOrders, 600);
    AnimatedCounter.animate(document.getElementById('totalProductsSold'), totalProductsSold, 600);

    ['totalSales', 'totalProfit', 'totalOrders', 'totalProductsSold'].forEach((id, i) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.closest('.stat-card')?.classList.add('animate-in');
      }, i * 100);
    });
  },

  renderChart(transactions) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const days = [];
    const now = new Date();
    let numDays = 7;

    if (['last7days', 'thisWeek', 'lastWeek', 'last30days'].includes(this.currentFilter)) {
      numDays = this.currentFilter === 'last30days' ? 30 : 7;
    } else if (this.currentFilter === 'thisMonth' || this.currentFilter === 'lastMonth') {
      numDays = 30;
    } else if (this.currentFilter === 'custom' && this.customStartDate && this.customEndDate) {
      const start = new Date(this.customStartDate);
      const end = new Date(this.customEndDate);
      numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: 0,
        profit: 0
      });
    }

    transactions.forEach(t => {
      const day = days.find(d => d.date === t.date);
      if (day) {
        day.sales += t.totalPrice;
        day.profit += t.totalProfit || 0;
      }
    });

    const maxVal = Math.max(...days.map(d => d.sales), 1);
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 250;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / days.length - 4;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartHeight * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      const val = maxVal * (1 - i / 4);
      ctx.fillText(Helpers.formatCurrency(val), padding.left - 8, y + 4);
    }

    days.forEach((day, i) => {
      const x = padding.left + i * (chartWidth / days.length) + 2;
      const barHeight = (day.sales / maxVal) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim());
      gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim());

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';

      const labelX = x + barWidth / 2;
      const labelY = height - padding.bottom + 15;

      if (numDays <= 15 || i % Math.ceil(numDays / 10) === 0) {
        ctx.save();
        ctx.translate(labelX, labelY);
        ctx.rotate(Math.PI / 6);
        ctx.fillText(day.label, 0, 0);
        ctx.restore();
      }

      if (day.sales > 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(Helpers.formatCurrency(day.sales), x + barWidth / 2, y - 5);
      }
    });
  },

  renderTransactions(transactions) {
    const list = document.getElementById('transactionsList');
    const emptyState = document.getElementById('emptyState');

    if (!list) return;

    if (transactions.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    list.innerHTML = sorted.map((t, i) => `
      <div class="txn-item" style="animation-delay: ${i * 0.06}s">
        <div class="txn-header">
          <div class="txn-info">
            <span class="txn-id">${t.transactionId}</span>
            <span class="txn-employee">${Helpers.escapeHtml(t.employee)}</span>
          </div>
          <div class="txn-summary">
            <span class="txn-total">${Helpers.formatCurrency(t.totalPrice)}</span>
            <span class="txn-date">${t.date} ${t.time}</span>
          </div>
        </div>
        <div class="txn-details">
          <table class="txn-details-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              ${t.items.map(item => `
                <tr>
                  <td>${Helpers.escapeHtml(item.name)}</td>
                  <td>${item.quantity}</td>
                  <td>${Helpers.formatCurrency(item.price)}</td>
                  <td>${Helpers.formatCurrency(item.profit)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="txn-details-footer">
            <span>Total Items: ${t.totalQuantity}</span>
            <span>Total Profit: ${Helpers.formatCurrency(t.totalProfit)}</span>
          </div>
        </div>
      </div>
    `).join('');

    PageTransitions.animateList(list, '.txn-item');
  },

  renderBestSellers(transactions) {
    const container = document.getElementById('bestSellers');
    if (!container) return;

    const productSales = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    if (bestSellers.length === 0) {
      container.innerHTML = '<p class="empty-state-subtext">No sales data for this period</p>';
      return;
    }

    container.innerHTML = bestSellers.map((product, i) => `
      <div class="best-seller-item" style="animation-delay: ${i * 0.08}s">
        <span class="best-seller-rank">#${i + 1}</span>
        <span class="best-seller-name">${Helpers.escapeHtml(product.name)}</span>
        <span class="best-seller-qty">${product.quantity} sold</span>
        <span class="best-seller-revenue">${Helpers.formatCurrency(product.revenue)}</span>
      </div>
    `).join('');

    PageTransitions.animateList(container, '.best-seller-item');
  },

  renderLowStock(transactions) {
    const container = document.getElementById('lowStock');
    if (!container) return;

    const products = Storage.get('products') || [];
    const lowStockProducts = products.filter(p => p.quantity < 10).sort((a, b) => a.quantity - b.quantity).slice(0, 5);

    if (lowStockProducts.length === 0) {
      container.innerHTML = '<p class="empty-state-subtext">All products are well stocked</p>';
      return;
    }

    container.innerHTML = lowStockProducts.map((product, i) => `
      <div class="low-stock-item" style="animation-delay: ${i * 0.08}s">
        <span class="low-stock-name">${Helpers.escapeHtml(product.name)}</span>
        <span class="low-stock-qty ${product.quantity === 0 ? 'out-of-stock' : 'low-stock'}">
          ${product.quantity === 0 ? I18n.t('outOfStock') : `${product.quantity} ${I18n.t('left')}`}
        </span>
      </div>
    `).join('');

    PageTransitions.animateList(container, '.low-stock-item');
  }
};
