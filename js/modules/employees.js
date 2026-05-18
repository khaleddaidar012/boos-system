const Employees = {
  users: [],
  editingId: null,

  init() {
    this.users = Storage.get('users') || [];
    this.render();
    this.bindEvents();
  },

  render() {
    const body = document.getElementById('employeesBody');
    const emptyState = document.getElementById('emptyState');
    const table = body.closest('table');

    if (this.users.length === 0) {
      table.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    body.innerHTML = this.users.map(user => `
      <tr>
        <td>${Helpers.escapeHtml(user.username)}</td>
        <td><span class="badge badge-${user.role === 'admin' ? 'admin' : 'worker'}">${I18n.t(user.role)}</span></td>
        <td>${Helpers.formatDate(user.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="Employees.edit('${user.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="Employees.delete('${user.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    document.getElementById('addEmployeeBtn').addEventListener('click', () => this.openModal());

    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());

    document.getElementById('employeeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });

    document.getElementById('employeeModal').addEventListener('click', (e) => {
      if (e.target.id === 'employeeModal') this.closeModal();
    });
  },

  openModal(user = null) {
    const modal = document.getElementById('employeeModal');
    const title = document.getElementById('modalTitle');

    if (user) {
      this.editingId = user.id;
      title.textContent = I18n.t('editEmployee');
      document.getElementById('employeeId').value = user.id;
      document.getElementById('employeeUsername').value = user.username;
      document.getElementById('employeePassword').value = '';
      document.getElementById('employeePassword').placeholder = I18n.t('changePassword');
      document.getElementById('employeeRole').value = user.role;
    } else {
      this.editingId = null;
      title.textContent = I18n.t('addEmployee');
      document.getElementById('employeeForm').reset();
      document.getElementById('employeeId').value = '';
      document.getElementById('employeePassword').placeholder = '';
    }

    modal.classList.add('active');
  },

  closeModal() {
    document.getElementById('employeeModal').classList.remove('active');
    this.editingId = null;
  },

  save() {
    const username = document.getElementById('employeeUsername').value.trim();
    const password = document.getElementById('employeePassword').value;
    const role = document.getElementById('employeeRole').value;

    if (!username || !role) {
      Helpers.showToast(I18n.t('fillAllFields'), 'warning');
      return;
    }

    if (this.editingId) {
      const idx = this.users.findIndex(u => u.id === this.editingId);
      if (idx === -1) return;

      if (this.users.some(u => u.username === username && u.id !== this.editingId)) {
        Helpers.showToast(I18n.t('usernameExists'), 'warning');
        return;
      }

      this.users[idx].username = username;
      this.users[idx].role = role;
      if (password) {
        this.users[idx].password = password;
      }
    } else {
      if (!password) {
        Helpers.showToast(I18n.t('fillAllFields'), 'warning');
        return;
      }

      if (this.users.some(u => u.username === username)) {
        Helpers.showToast(I18n.t('usernameExists'), 'warning');
        return;
      }

      this.users.push({
        id: Helpers.genId('usr'),
        username: username,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
      });
    }

    Storage.set('users', this.users);
    this.render();
    this.closeModal();
    Helpers.showToast(I18n.t('successSaved'), 'success');
  },

  edit(id) {
    const user = this.users.find(u => u.id === id);
    if (user) this.openModal(user);
  },

  delete(id) {
    if (!Helpers.confirm(I18n.t('confirmDelete'))) return;

    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return;

    this.users.splice(idx, 1);
    Storage.set('users', this.users);
    this.render();
    Helpers.showToast('Employee deleted', 'success');
  }
};
