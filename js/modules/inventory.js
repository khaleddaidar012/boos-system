const Inventory = {
  products: [],
  editingId: null,
  activeFilter: 'all',
  advancedOpen: false,

  _loadProducts() {
    this.products = Storage.get('products') || [];
  },

  _saveProducts() {
    Storage.set('products', this.products);
  },

  init() {
    this._loadProducts();
    this.migrateOldData();
    this.renderFilterTabs();
    this.render();
    this.renderStats();
    this.bindEvents();
    this.populateTypeDropdown();
    this.applyRoleVisibility();
  },

  applyRoleVisibility() {
    const isAdmin = Auth.isAdmin();
    if (isAdmin) {
      document.querySelectorAll('.admin-only-field').forEach(el => {
        el.classList.add('visible');
      });
    }
  },

  migrateOldData() {
    const oldBooks = Storage.get('books');
    if (oldBooks && oldBooks.length > 0 && this.products.length === 0) {
      this.products = oldBooks.map(book => ({
        id: book.id,
        name: book.name,
        type: 'books',
        price: book.price,
        cost: book.cost,
        quantity: book.quantity,
        image: book.image || '',
        description: book.description || '',
        attributes: {
          author: book.author || '',
          language: book.language || 'ar'
        },
        createdAt: book.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      this._saveProducts();
    }
  },

  populateTypeDropdown() {
    const select = document.getElementById('productType');
    if (!select) return;
    const types = ProductTypes.getAllTypes();
    select.innerHTML = `<option value="" data-i18n="selectType">${I18n.t('selectType')}</option>` +
      types.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('');
  },

  renderFilterTabs() {
    const container = document.getElementById('filterTabs');
    if (!container) return;
    const types = ProductTypes.getAllTypes();
    container.innerHTML = `<button class="filter-tab ${this.activeFilter === 'all' ? 'active' : ''}" data-type="all">${I18n.t('filterAll')}</button>` +
      types.map(t => `<button class="filter-tab ${this.activeFilter === t.id ? 'active' : ''}" data-type="${t.id}">${t.icon} ${t.label}</button>`).join('');
  },

  render() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = this.products.slice();

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === this.activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm);
        const typeMatch = ProductTypes.getTypeLabel(p.type).toLowerCase().includes(searchTerm);
        const descMatch = (p.description || '').toLowerCase().includes(searchTerm);
        const locationMatch = (p.storageLocation || '').toLowerCase().includes(searchTerm);
        let attrMatch = false;
        if (p.attributes) {
          attrMatch = Object.values(p.attributes).some(val => {
            const strVal = Array.isArray(val) ? val.join(' ') : String(val);
            return strVal.toLowerCase().includes(searchTerm);
          });
        }
        return nameMatch || typeMatch || descMatch || locationMatch || attrMatch;
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = filtered.map((product, i) => this.renderProductCard(product, i)).join('');
  },

  getProductStatus(product) {
    if (product.quantity === 0) return 'out_of_stock';
    if (product.quantity < 10) return 'low_stock';
    return 'in_stock';
  },

  getStatusBadge(product) {
    const status = this.getProductStatus(product);
    switch (status) {
      case 'out_of_stock':
        return `<span class="badge badge-danger">${I18n.t('outOfStock')}</span>`;
      case 'low_stock':
        return `<span class="badge badge-warning">${I18n.t('lowStock')}: ${product.quantity}</span>`;
      default:
        return `<span class="badge badge-success">Qty: ${product.quantity}</span>`;
    }
  },

  renderProductCard(product, index) {
    const typeDef = ProductTypes.TYPES[product.type];
    const icon = typeDef ? typeDef.icon : '📦';
    const color = typeDef ? typeDef.color : '#8888a0';
    const cardAttrs = ProductTypes.getCardDisplayAttributes(product);

    const stockBadge = this.getStatusBadge(product);

    let attrHtml = '';
    if (cardAttrs.length > 0) {
      attrHtml = `<div class="product-card-attrs">${cardAttrs.map(a =>
        a.value ? `<span class="product-card-attr"><span class="attr-label">${a.label}:</span> ${Helpers.escapeHtml(String(a.value))}</span>` : ''
      ).filter(Boolean).join('')}</div>`;
    }

    let locationHtml = '';
    if (product.storageLocation) {
      locationHtml = `<div class="product-card-location">📍 ${Helpers.escapeHtml(product.storageLocation)}</div>`;
    }

    return `
      <div class="product-card animate-slide-up stagger-${Math.min(index + 1, 6)}" style="--card-color: ${color}">
        <div class="product-card-image">
          ${product.image
            ? `<img src="${Helpers.escapeHtml(product.image)}" alt="${Helpers.escapeHtml(product.name)}" onerror="this.parentElement.innerHTML='${icon}'">`
            : icon}
        </div>
        <div class="product-card-body">
          <div class="product-card-type" style="background: ${color}20; color: ${color}">${icon} ${ProductTypes.getTypeLabel(product.type)}</div>
          <div class="product-card-name">${Helpers.escapeHtml(product.name)}</div>
          <div class="product-card-price">${Helpers.formatCurrency(product.price)}</div>
          ${attrHtml}
          ${locationHtml}
          <div class="product-card-stock">${stockBadge}</div>
          <div class="product-card-actions">
            <button class="btn btn-sm btn-secondary" onclick="Inventory.info('${product.id}')">${I18n.t('info')}</button>
            <button class="btn btn-sm btn-primary ${product.quantity === 0 ? 'btn-disabled' : ''}" onclick="${product.quantity === 0 ? `Inventory.showOutOfStockMessage('${Helpers.escapeHtml(product.name)}')` : `Inventory.addToCart('${product.id}')`}">${I18n.t('addToCart')}</button>
            <button class="btn btn-sm btn-warning" onclick="Inventory.edit('${product.id}')">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="Inventory.delete('${product.id}')">🗑️</button>
          </div>
        </div>
      </div>`;
  },

  renderStats() {
    const total = this.products.length;
    const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStock = this.products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    const outOfStock = this.products.filter(p => p.quantity === 0).length;

    const statTotal = document.getElementById('statTotal');
    const statValue = document.getElementById('statValue');
    const statLowStock = document.getElementById('statLowStock');
    const statOutOfStock = document.getElementById('statOutOfStock');

    if (statTotal) statTotal.textContent = total;
    if (statValue) statValue.textContent = Helpers.formatCurrency(totalValue);
    if (statLowStock) statLowStock.textContent = lowStock;
    if (statOutOfStock) statOutOfStock.textContent = outOfStock;
  },

  bindEvents() {
    document.getElementById('searchInput').addEventListener('input', Helpers.debounce(() => {
      this._loadProducts();
      this.render();
    }, 300));

    document.getElementById('addProductBtn').addEventListener('click', () => this.openModal());

    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());

    document.getElementById('productForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });

    document.getElementById('productModal').addEventListener('click', (e) => {
      if (e.target.id === 'productModal') this.closeModal();
    });

    document.getElementById('productType').addEventListener('change', (e) => {
      this.renderDynamicAttributes(e.target.value);
    });

    document.getElementById('productPrice').addEventListener('input', () => this.updateProfitDisplay());
    document.getElementById('productCost').addEventListener('input', () => this.updateProfitDisplay());

    document.getElementById('filterTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      this.activeFilter = tab.dataset.type;
      this.renderFilterTabs();
      this.render();
    });

    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

    document.getElementById('customAttrClose').addEventListener('click', () => this.closeCustomAttrModal());
    document.getElementById('customAttrCancel').addEventListener('click', () => this.closeCustomAttrModal());

    document.getElementById('customAttrModal').addEventListener('click', (e) => {
      if (e.target.id === 'customAttrModal') this.closeCustomAttrModal();
    });

    document.getElementById('customAttrType').addEventListener('change', (e) => {
      const optionsGroup = document.getElementById('customAttrOptionsGroup');
      optionsGroup.style.display = (e.target.value === 'select') ? 'block' : 'none';
    });

    document.getElementById('customAttrForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCustomAttribute();
    });

    document.addEventListener('change', (e) => {
      if (e.target.closest('.multiselect-container')) {
        const container = e.target.closest('.multiselect-container');
        const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
        if (hiddenInput) {
          const checked = container.querySelectorAll('input[type="checkbox"]:checked');
          hiddenInput.value = Array.from(checked).map(cb => cb.value).join(',');
        }
        const label = e.target.closest('.multiselect-option');
        if (label) {
          label.classList.toggle('selected', e.target.checked);
        }
      }
    });
  },

  toggleAdvancedSection() {
    this.advancedOpen = !this.advancedOpen;
    const section = document.getElementById('advancedSection');
    const btn = document.getElementById('advancedToggleBtn');
    const btnText = btn.querySelector('[data-i18n="showAdvanced"], [data-i18n="hideAdvanced"]');

    if (this.advancedOpen) {
      section.classList.add('open');
      btn.classList.add('active');
      if (btnText) {
        btnText.setAttribute('data-i18n', 'hideAdvanced');
        btnText.textContent = I18n.t('hideAdvanced');
      }
    } else {
      section.classList.remove('open');
      btn.classList.remove('active');
      if (btnText) {
        btnText.setAttribute('data-i18n', 'showAdvanced');
        btnText.textContent = I18n.t('showAdvanced');
      }
    }
  },

  updateProfitDisplay() {
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const cost = parseFloat(document.getElementById('productCost').value) || 0;
    const profitField = document.getElementById('productProfit');

    if (price > 0 && cost > 0) {
      const profit = price - cost;
      const profitPercent = ((profit / cost) * 100).toFixed(1);
      profitField.value = `${Helpers.formatCurrency(profit)} (${profitPercent}%)`;
    } else {
      profitField.value = '';
    }
  },

  openModal(product = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');

    this.advancedOpen = false;
    document.getElementById('advancedSection').classList.remove('open');
    document.getElementById('advancedToggleBtn').classList.remove('active');
    const btnText = document.getElementById('advancedToggleBtn').querySelector('[data-i18n]');
    if (btnText) {
      btnText.setAttribute('data-i18n', 'showAdvanced');
      btnText.textContent = I18n.t('showAdvanced');
    }

    if (product) {
      this.editingId = product.id;
      title.textContent = I18n.t('editProduct');
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productType').value = product.type;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productCost').value = product.cost;
      document.getElementById('productQuantity').value = product.quantity;
      document.getElementById('productStorageLocation').value = product.storageLocation || '';
      document.getElementById('productImage').value = product.image || '';
      document.getElementById('productDescription').value = product.description || '';
      this.renderDynamicAttributes(product.type, product.attributes || {});
      this.updateProfitDisplay();
    } else {
      this.editingId = null;
      document.getElementById('productForm').reset();
      document.getElementById('productId').value = '';
      document.getElementById('dynamicAttributes').innerHTML = '';
      document.getElementById('productProfit').value = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    this.editingId = null;
  },

  renderDynamicAttributes(typeId, values = {}) {
    const container = document.getElementById('dynamicAttributes');
    if (!typeId) {
      container.innerHTML = '';
      return;
    }

    const attributes = ProductTypes.getAllAttributesForType(typeId);
    if (attributes.length === 0) {
      container.innerHTML = `<div class="no-attributes-msg">${I18n.t('noAttributes')}</div>`;
      return;
    }

    container.innerHTML = attributes.map(attr => {
      const value = values[attr.key] || '';
      return ProductTypes.renderAttributeInput(attr, value, 'dynamicAttributes');
    }).join('');

    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  },

  save() {
    const typeId = document.getElementById('productType').value;
    if (!typeId) {
      Helpers.showToast(I18n.t('selectType'), 'warning');
      return;
    }

    const attributes = {};
    const attrContainer = document.getElementById('dynamicAttributes');
    const attrFields = attrContainer.querySelectorAll('.attribute-field');

    attrFields.forEach(field => {
      const key = field.dataset.attrKey;
      const type = field.dataset.attrType;
      const attrDef = ProductTypes.getAllAttributesForType(typeId).find(a => a.key === key);
      if (attrDef) {
        const value = ProductTypes.getAttributeValue(attrDef, attrContainer);
        if (value !== '' && value !== null && value !== undefined) {
          attributes[key] = value;
        }
      }
    });

    // Reload fresh products from storage before saving
    this._loadProducts();

    const priceStr = document.getElementById('productPrice').value.trim();
    const costStr = document.getElementById('productCost').value.trim();
    const qtyStr = document.getElementById('productQuantity').value.trim();
    const storageLocation = document.getElementById('productStorageLocation').value.trim();

    const existingProduct = this.editingId ? this.products.find(p => p.id === this.editingId) : null;
    const oldStatus = existingProduct ? this.getProductStatus(existingProduct) : null;
    const oldLocation = existingProduct ? (existingProduct.storageLocation || '') : '';

    const quantity = qtyStr !== '' ? parseInt(qtyStr, 10) : 0;
    const newStatus = quantity === 0 ? 'out_of_stock' : quantity < 10 ? 'low_stock' : 'in_stock';

    const history = existingProduct ? { ...(existingProduct.history || {}) } : {};
    history.lastUpdated = new Date().toISOString();
    if (storageLocation) {
      history.lastStorageLocation = storageLocation;
    }
    if (oldStatus && oldStatus !== newStatus) {
      history.lastStatusChange = {
        from: oldStatus,
        to: newStatus,
        at: new Date().toISOString()
      };
    }
    if (!history.createdAt) {
      history.createdAt = new Date().toISOString();
    }

    const product = {
      id: this.editingId || Helpers.genId('prod'),
      name: document.getElementById('productName').value.trim(),
      type: typeId,
      price: priceStr !== '' ? Number(priceStr) : 0,
      cost: costStr !== '' ? Number(costStr) : 0,
      quantity: quantity,
      storageLocation: storageLocation,
      image: document.getElementById('productImage').value.trim(),
      description: document.getElementById('productDescription').value.trim(),
      attributes,
      history,
      updatedAt: new Date().toISOString()
    };

    if (this.editingId) {
      const idx = this.products.findIndex(p => p.id === this.editingId);
      if (idx !== -1) {
        product.createdAt = this.products[idx].createdAt;
        this.products[idx] = product;
      } else {
        this.products.push(product);
      }
    } else {
      product.createdAt = new Date().toISOString();
      this.products.push(product);
    }

    this._saveProducts();
    this._loadProducts();
    this.render();
    this.renderStats();
    this.closeModal();
    Helpers.showToast(I18n.t('successSaved'), 'success');
  },

  edit(id) {
    this._loadProducts();
    const product = this.products.find(p => p.id === id);
    if (product) this.openModal(product);
  },

  delete(id) {
    this._loadProducts();
    if (!Helpers.confirm(I18n.t('confirmDelete'))) return;

    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const product = this.products[idx];
    product.deletedAt = new Date().toISOString();
    product.deletedBy = Auth.getSession()?.username || 'unknown';

    const trash = Storage.get('trash') || [];
    trash.push(product);
    Storage.set('trash', trash);

    this.products.splice(idx, 1);
    this._saveProducts();
    this._loadProducts();
    this.render();
    this.renderStats();
    Helpers.showToast(I18n.t('successDeleted'), 'success');
  },

  info(id) {
    this._loadProducts();
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    const typeDef = ProductTypes.TYPES[product.type];
    const typeName = typeDef ? ProductTypes.getTypeLabel(product.type) : product.type;

    let attrLines = '';
    if (product.attributes && Object.keys(product.attributes).length > 0) {
      const allAttrs = ProductTypes.getAllAttributesForType(product.type);
      attrLines = '\n--- Attributes ---\n';
      for (const [key, value] of Object.entries(product.attributes)) {
        const attrDef = allAttrs.find(a => a.key === key);
        const label = attrDef ? ProductTypes.getAttributeLabel(attrDef) : key;
        const formatted = attrDef ? ProductTypes.formatAttributeValue(attrDef, value) : value;
        attrLines += `${label}: ${formatted}\n`;
      }
    }

    alert(`${product.name}\nType: ${typeName}\n\nPrice: ${Helpers.formatCurrency(product.price)}\nCost: ${Helpers.formatCurrency(product.cost)}\nQuantity: ${product.quantity}\nLocation: ${product.storageLocation || 'N/A'}\n${attrLines}\n${product.description || ''}`);
  },

  showOutOfStockMessage(name) {
    Helpers.showToast(`"${name}" — ${I18n.t('outOfStock')}`, 'warning');
  },

  addToCart(id) {
    this._loadProducts();
    const product = this.products.find(p => p.id === id);
    if (!product || product.quantity === 0) {
      this.showOutOfStockMessage(product?.name || '');
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

    const oldStatus = this.getProductStatus(product);
    product.quantity -= quantity;
    const newStatus = this.getProductStatus(product);
    this._saveProducts();

    this._loadProducts();
    this.render();
    this.renderStats();

    const cart = Storage.get('cart') || [];
    const existing = cart.find(c => c.productId === id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: id,
        name: product.name,
        type: product.type,
        price: product.price,
        cost: product.cost,
        quantity: quantity,
        storageLocation: product.storageLocation || ''
      });
    }

    Storage.set('cart', cart);

    if (newStatus === 'out_of_stock' && oldStatus !== 'out_of_stock') {
      Helpers.showToast(`${product.name} is now out of stock`, 'warning');
    } else {
      Helpers.showToast(`${product.name} added to cart`, 'success');
    }
  },

  exportData() {
    Backup.exportPlain();
  },

  openCustomAttrModal() {
    document.getElementById('customAttrModal').classList.add('active');
    document.getElementById('customAttrForm').reset();
    document.getElementById('customAttrOptionsGroup').style.display = 'none';
  },

  closeCustomAttrModal() {
    document.getElementById('customAttrModal').classList.remove('active');
  },

  saveCustomAttribute() {
    const key = document.getElementById('customAttrKey').value.trim().toLowerCase().replace(/\s+/g, '_');
    const label = document.getElementById('customAttrLabel').value.trim();
    const type = document.getElementById('customAttrType').value;
    const required = document.getElementById('customAttrRequired').checked;
    let options = [];

    if (type === 'select') {
      const optionsStr = document.getElementById('customAttrOptions').value.trim();
      if (optionsStr) {
        options = optionsStr.split(',').map(o => o.trim()).filter(Boolean).map(o => ({ value: o, label: o }));
      }
    }

    if (!key || !label) {
      Helpers.showToast(I18n.t('fillAllFields'), 'warning');
      return;
    }

    ProductTypes.addCustomAttribute({ key, label, type, required, options });
    this.closeCustomAttrModal();
    Helpers.showToast(I18n.t('successSaved'), 'success');

    if (document.getElementById('productType').value) {
      this.renderDynamicAttributes(document.getElementById('productType').value);
    }
  }
};
