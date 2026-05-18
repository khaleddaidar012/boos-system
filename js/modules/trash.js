const Trash = {
  trash: [],

  _loadTrash() {
    this.trash = Storage.get('trash') || [];
  },

  init() {
    this._loadTrash();
    this.render();
  },

  render() {
    const body = document.getElementById('trashBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('trashTable');

    if (this.trash.length === 0) {
      table.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    const isAdmin = Auth.isAdmin();

    body.innerHTML = this.trash.map(item => `
      <tr>
        <td>${Helpers.escapeHtml(item.name)}</td>
        <td>${Helpers.formatCurrency(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${Helpers.formatDate(item.deletedAt)}</td>
        <td>${Helpers.escapeHtml(item.deletedBy || 'unknown')}</td>
        ${isAdmin ? `
        <td class="admin-only">
          <button class="btn btn-sm btn-success" onclick="Trash.restore('${item.id}')">${I18n.t('restore')}</button>
          <button class="btn btn-sm btn-danger" onclick="Trash.permanentDelete('${item.id}')">${I18n.t('permanentDelete')}</button>
        </td>
        ` : '<td></td>'}
      </tr>
    `).join('');
  },

  restore(id) {
    if (!Helpers.confirm(I18n.t('confirmRestore'))) return;

    this._loadTrash();
    const idx = this.trash.findIndex(t => t.id === id);
    if (idx === -1) return;

    const item = this.trash[idx];
    delete item.deletedAt;
    delete item.deletedBy;

    const products = Storage.get('products') || [];
    products.push(item);
    Storage.set('products', products);

    this.trash.splice(idx, 1);
    Storage.set('trash', this.trash);
    this.render();
    Helpers.showToast(I18n.t('successRestored'), 'success');
  },

  permanentDelete(id) {
    if (!Helpers.confirm(I18n.t('confirmPermanentDelete'))) return;

    this._loadTrash();
    const idx = this.trash.findIndex(t => t.id === id);
    if (idx === -1) return;

    this.trash.splice(idx, 1);
    Storage.set('trash', this.trash);
    this.render();
    Helpers.showToast('Item permanently deleted', 'success');
  }
};
