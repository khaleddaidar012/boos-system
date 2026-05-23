const Cashier = {
  cart: [],
  products: [],

  _loadProducts() {
    this.products = Storage.get('products') || [];
  },

  _loadCart() {
    this.cart = Storage.get('cart') || [];
  },

  _restoreStock(item) {
    this._loadProducts();
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      product.quantity += item.quantity;
      Storage.set('products', this.products);
    }
    this._loadProducts();
    this.renderProducts();
  },

  init() {
    this._loadCart();
    this._loadProducts();
    if (this.products.length === 0) {
      const oldBooks = Storage.get('books') || [];
      this.products = oldBooks.map(b => ({
        ...b,
        type: 'books',
        attributes: b.attributes || {}
      }));
    }
    this.renderCart();
    this.renderProducts();
    this.bindEvents();
  },

  renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const profitEl = document.getElementById('cartProfit');

    if (this.cart.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">${I18n.t('cartEmpty')}</div></div>`;
      if (totalEl) totalEl.textContent = '0';
      if (profitEl) profitEl.textContent = '0';
      return;
    }

    let total = 0;
    let profit = 0;

    container.innerHTML = this.cart.map((item, i) => {
      const itemTotal = item.price * item.quantity;
      const itemProfit = (item.price - item.cost) * item.quantity;
      total += itemTotal;
      profit += itemProfit;

      const locationLine = item.storageLocation
        ? `<div class="cart-item-location">📍 ${Helpers.escapeHtml(item.storageLocation)}</div>`
        : '';

      return `
        <div class="cart-item" style="animation-delay: ${i * 0.05}s">
          <div class="cart-item-info">
            <div class="cart-item-name">${Helpers.escapeHtml(item.name)}</div>
            <div class="cart-item-price">${Helpers.formatCurrency(item.price)} each</div>
            ${locationLine}
          </div>
          <div class="cart-item-qty">
            <button onclick="Cashier.updateQty(${i}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="Cashier.updateQty(${i}, 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="Cashier.removeItem(${i})">✕</button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = Helpers.formatCurrency(total);
    if (profitEl) profitEl.textContent = Helpers.formatCurrency(profit);
  },

  renderProducts() {
    const container = document.getElementById('quickAddBooks');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filtered = this.products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(searchTerm);
      const locationMatch = (p.storageLocation || '').toLowerCase().includes(searchTerm);
      let attrMatch = false;
      if (p.attributes) {
        attrMatch = Object.values(p.attributes).some(val => {
          const strVal = Array.isArray(val) ? val.join(' ') : String(val);
          return strVal.toLowerCase().includes(searchTerm);
        });
      }
      return nameMatch || locationMatch || attrMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-text">${I18n.t('noProducts')}</div></div>`;
      return;
    }

    container.innerHTML = filtered.map((product, i) => {
      const typeIcon = ProductTypes.getTypeIcon(product.type);
      const locationLine = product.storageLocation
        ? `<div class="quick-add-book-location">📍 ${Helpers.escapeHtml(product.storageLocation)}</div>`
        : '';
      const isOutOfStock = product.quantity === 0;
      const clickHandler = isOutOfStock
        ? `Cashier.showOutOfStockMessage('${Helpers.escapeHtml(product.name)}')`
        : `Cashier.quickAdd('${product.id}')`;
      const oosClass = isOutOfStock ? 'quick-add-book-out-of-stock' : '';

      return `
        <div class="quick-add-book ${oosClass}" onclick="${clickHandler}" style="animation-delay: ${i * 0.04}s">
          <div style="font-size:2rem;">${typeIcon}</div>
          <div class="quick-add-book-name">${Helpers.escapeHtml(product.name)}</div>
          <div class="quick-add-book-price">${Helpers.formatCurrency(product.price)}</div>
          <div class="quick-add-book-qty">${isOutOfStock ? I18n.t('outOfStock') : `Qty: ${product.quantity}`}</div>
          ${locationLine}
        </div>
      `;
    }).join('');

    requestAnimationFrame(() => {
      container.querySelectorAll('.quick-add-book').forEach((el, i) => {
        setTimeout(() => el.classList.add('fade-in'), i * 40);
      });
    });
  },

  showOutOfStockMessage(name) {
    Helpers.showToast(`"${name}" — ${I18n.t('outOfStock')}`, 'warning');
  },

  bindEvents() {
    document.getElementById('searchInput').addEventListener('input', Helpers.debounce(() => {
      this._loadProducts();
      this.renderProducts();
    }, 300));

    document.getElementById('clearCartBtn').addEventListener('click', () => {
      if (Helpers.confirm(I18n.t('confirmClearCart'))) {
        this.cart.forEach(item => this._restoreStock(item));
        this.cart = [];
        Storage.set('cart', this.cart);
        this.renderCart();
        this.renderProducts();
      }
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());
  },

  quickAdd(id) {
    this._loadProducts();
    const product = this.products.find(p => p.id === id);
    if (!product || product.quantity === 0) {
      Helpers.showToast(`"${product?.name || ''}" — ${I18n.t('outOfStock')}`, 'warning');
      return;
    }

    const qty = Helpers.prompt(I18n.t('enterQuantity'), '1');
    if (!qty) return;

    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) return;

    if (quantity > product.quantity) {
      Helpers.showToast(I18n.t('outOfStock'), 'danger');
      return;
    }

    product.quantity -= quantity;
    Storage.set('products', this.products);
    this._loadProducts();
    this.renderProducts();

    const existing = this.cart.find(c => c.productId === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId: id,
        name: product.name,
        type: product.type,
        price: product.price,
        cost: product.cost,
        quantity: quantity,
        storageLocation: product.storageLocation || ''
      });
    }

    Storage.set('cart', this.cart);
    this.renderCart();
    Helpers.showToast(`${product.name} added to cart`, 'success');
  },

  updateQty(index, delta) {
    const item = this.cart[index];
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(index);
      return;
    }

    const diff = newQty - item.quantity;
    this._loadProducts();
    let product = this.products.find(p => p.id === item.productId);

    if (diff > 0) {
      // Increasing cart quantity - need stock available
      if (!product || diff > product.quantity) {
        Helpers.showToast(I18n.t('outOfStock'), 'danger');
        return;
      }
      product.quantity -= diff;
      Storage.set('products', this.products);
    } else {
      // Decreasing cart quantity - restore stock
      if (product) {
        product.quantity += Math.abs(diff);
        Storage.set('products', this.products);
      }
    }

    item.quantity = newQty;
    Storage.set('cart', this.cart);
    this._loadProducts();
    this.renderCart();
    this.renderProducts();
  },

  removeItem(index) {
    const item = this.cart[index];
    if (!item) return;

    const items = document.querySelectorAll('.cart-item');
    const doRemove = () => {
      this._restoreStock(item);
      this.cart.splice(index, 1);
      Storage.set('cart', this.cart);
      this.renderCart();
      this.renderProducts();
    };

    if (items[index]) {
      items[index].classList.add('removing');
      setTimeout(doRemove, 250);
    } else {
      doRemove();
    }
  },

  checkout() {
    if (this.cart.length === 0) {
      Helpers.showToast(I18n.t('cartEmpty'), 'warning');
      return;
    }

    if (!Helpers.confirm(I18n.t('confirmCheckout'))) return;

    const now = new Date();
    let totalQuantity = 0;
    let totalPrice = 0;
    let totalProfit = 0;

    const soldItems = this.cart.map(item => {
      const itemTotal = item.price * item.quantity;
      const itemProfit = (item.price - item.cost) * item.quantity;
      totalQuantity += item.quantity;
      totalPrice += itemTotal;
      totalProfit += itemProfit;

      return {
        productId: item.productId,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        profit: itemProfit,
        storageLocation: item.storageLocation || ''
      };
    });

    // Stock already reduced at add-to-cart time, just record transaction
    const transactionNumber = (Storage.get('transactions') || []).length + 1;
    const transaction = {
      transactionId: `INV-${String(transactionNumber).padStart(4, '0')}`,
      timestamp: now.getTime(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      employee: Auth.getSession()?.username || 'unknown',
      items: soldItems,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
      totalProfit: totalProfit,
      paymentStatus: 'completed'
    };

    const transactions = Storage.get('transactions') || [];
    transactions.push(transaction);
    Storage.set('transactions', transactions);

    this.cart = [];
    Storage.set('cart', this.cart);
    this.renderCart();
    this.renderProducts();
    Helpers.showToast(I18n.t('successCheckout'), 'success');
  }
};
