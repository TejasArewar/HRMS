// HRMS Lite — Main App
class HRMSApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.employeePagination  = { currentPage: 1, totalPages: 1, totalCount: 0 };
    this.attendancePagination = { currentPage: 1, totalPages: 1, totalCount: 0 };
    this.currentFilters = { employee: '', dateFrom: '', dateTo: '', employeeSearch: '' };
    this.init();
  }

  getHeaders() { return { 'Content-Type': 'application/json' }; }

  init() {
    this.setupNav();
    this.setupMobileSidebar();
    this.setupModal();
    this.setupMessages();
    this.setupPagination();
    this.setupSearch();
    this.setupFilters();
    this.setupDashboardControls();
    this.setupCollapsibles();
    this.setCurrentDate();
    this.loadDashboard();
    this.updateStats();
  }

  /* ── Navigation ── */
  setupNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  }

  switchTab(name) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${name}-tab`).classList.add('active');
    this.currentTab = name;
    if (name === 'dashboard')  this.loadDashboard();
    if (name === 'employees')  this.loadEmployees();
    if (name === 'attendance') { this.loadAttendance(); this.populateEmployeeDropdowns(); }
    this.closeSidebar();
  }

  /* ── Mobile sidebar ── */
  setupMobileSidebar() {
    const toggle  = document.getElementById('menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    if (toggle)  toggle.addEventListener('click', () => this.toggleSidebar());
    if (overlay) overlay.addEventListener('click', () => this.closeSidebar());
  }
  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
  }
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  }

  /* ── Collapsible add-forms ── */
  setupCollapsibles() {
    const toggleAdd = document.getElementById('toggle-add-employee');
    const cancelAdd = document.getElementById('cancel-add-employee');
    const addCard   = document.getElementById('add-employee-card');
    if (toggleAdd) toggleAdd.addEventListener('click', () => addCard.classList.toggle('open'));
    if (cancelAdd) cancelAdd.addEventListener('click', () => addCard.classList.remove('open'));

    const toggleMark = document.getElementById('toggle-mark-attendance');
    const cancelMark = document.getElementById('cancel-mark-attendance');
    const markCard   = document.getElementById('mark-attendance-card');
    if (toggleMark) toggleMark.addEventListener('click', () => markCard.classList.toggle('open'));
    if (cancelMark) cancelMark.addEventListener('click', () => markCard.classList.remove('open'));
  }

  /* ── Modal ── */
  setupModal() {
    document.getElementById('confirm-no').addEventListener('click', () => this.hideModal());
    document.getElementById('confirm-modal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this.hideModal();
    });
  }
  showModal() {
    document.getElementById('confirm-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  hideModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ── Toast notifications ── */
  setupMessages() {}
  showError(msg)   { this.toast(msg, 'error'); }
  showSuccess(msg) { this.toast(msg, 'success'); }

  toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="toast-icon fas fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
                    <span class="toast-msg">${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 320);
    }, type === 'error' ? 5000 : 3000);
  }

  /* ── Loading bar ── */
  showLoading() {
    const bar = document.getElementById('loading-bar');
    bar.classList.remove('done');
    bar.classList.add('active');
  }
  hideLoading() {
    const bar = document.getElementById('loading-bar');
    bar.classList.remove('active');
    bar.classList.add('done');
    setTimeout(() => bar.classList.remove('done'), 400);
  }

  /* ── Pagination setup ── */
  setupPagination() {
    document.getElementById('employees-prev-btn').addEventListener('click', () => {
      if (this.employeePagination.currentPage > 1)
        this.loadEmployees(this.employeePagination.currentPage - 1);
    });
    document.getElementById('employees-next-btn').addEventListener('click', () => {
      if (this.employeePagination.currentPage < this.employeePagination.totalPages)
        this.loadEmployees(this.employeePagination.currentPage + 1);
    });
    document.getElementById('attendance-prev-btn').addEventListener('click', () => {
      if (this.attendancePagination.currentPage > 1)
        this.loadAttendance(this.attendancePagination.currentPage - 1, this.currentFilters);
    });
    document.getElementById('attendance-next-btn').addEventListener('click', () => {
      if (this.attendancePagination.currentPage < this.attendancePagination.totalPages)
        this.loadAttendance(this.attendancePagination.currentPage + 1, this.currentFilters);
    });
  }

  /* ── Search ── */
  setupSearch() {
    document.getElementById('employee-search').addEventListener('input', e => {
      this.currentFilters.employeeSearch = e.target.value;
      this.searchEmployees(e.target.value);
    });
  }

  /* ── Filters ── */
  setupFilters() {
    document.getElementById('apply-date-filter').addEventListener('click', () => this.applyDateFilter());
    document.getElementById('clear-date-filter').addEventListener('click', () => this.clearDateFilter());
    document.getElementById('filter-date-from').addEventListener('change', e => { this.currentFilters.dateFrom = e.target.value; });
    document.getElementById('filter-date-to').addEventListener('change', e => { this.currentFilters.dateTo = e.target.value; });
  }

  /* ── Dashboard controls ── */
  setupDashboardControls() {
    document.getElementById('refresh-dashboard').addEventListener('click', () => {
      const icon = document.querySelector('#refresh-dashboard i');
      icon.style.transition = 'transform .6s';
      icon.style.transform = 'rotate(360deg)';
      setTimeout(() => { icon.style.transition = ''; icon.style.transform = ''; }, 650);
      this.loadDashboard();
    });
    document.getElementById('dashboard-month-filter').addEventListener('change', e => {
      this.filterDashboardByMonth(e.target.value);
    });
  }

  setCurrentDate() {
    document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
  }

  /* ── Load employees ── */
  async loadEmployees(page = 1) {
    try {
      this.showLoading();
      const res  = await fetch(`/api/employees/?page=${page}`);
      const data = await res.json();
      if (res.ok) {
        this.employeePagination = {
          currentPage: data.current_page || page,
          totalPages:  data.total_pages  || 1,
          totalCount:  data.count        || 0
        };
        this.renderEmployees(data.results || data);
        this.updateEmployeePagination();
        this.populateEmployeeDropdowns();
        this.updateStats();
        if (this.currentFilters.employeeSearch) this.searchEmployees(this.currentFilters.employeeSearch);
      } else { this.showError('Failed to load employees'); }
    } catch { this.showError('Network error while loading employees'); }
    finally  { this.hideLoading(); }
  }

  /* ── Load attendance ── */
  async loadAttendance(page = 1, filters = null) {
    try {
      this.showLoading();
      const f = filters || this.currentFilters;
      let url = f.employee ? `/api/attendance/${f.employee}/?page=${page}` : `/api/attendance/list/?page=${page}`;
      const params = new URLSearchParams();
      if (f.dateFrom) params.append('date_from', f.dateFrom);
      if (f.dateTo)   params.append('date_to',   f.dateTo);
      if (params.toString()) url += (url.includes('?') ? '&' : '?') + params.toString();

      const res  = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        this.attendancePagination = {
          currentPage: data.current_page || page,
          totalPages:  data.total_pages  || 1,
          totalCount:  data.count        || 0
        };
        this.renderAttendance(data.results || data.attendance_records || data);
        this.updateAttendancePagination();
        this.updateStats();
      } else { this.showError('Failed to load attendance records'); }
    } catch { this.showError('Network error while loading attendance'); }
    finally  { this.hideLoading(); }
  }

  /* ── Render employees ── */
  renderEmployees(employees) {
    const tbody = document.getElementById('employees-tbody');
    const empty = document.getElementById('employees-empty');
    if (!employees || !employees.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = employees.map((e, i) => `
      <tr style="animation-delay:${i * 0.05}s">
        <td><span class="emp-id">${this.esc(e.employee_id)}</span></td>
        <td><strong>${this.esc(e.full_name)}</strong></td>
        <td style="color:var(--text-2)">${this.esc(e.email)}</td>
        <td><span class="badge badge-dept">${this.esc(e.department)}</span></td>
        <td style="color:var(--text-3)">${this.fmtDate(e.created_at)}</td>
        <td>
          <button class="btn-del" onclick="app.confirmDeleteEmployee(${e.id},'${this.esc(e.full_name)}')">
            <i class="fas fa-trash-can"></i> Delete
          </button>
        </td>
      </tr>`).join('');
  }

  /* ── Render attendance ── */
  renderAttendance(records) {
    const tbody = document.getElementById('attendance-tbody');
    const empty = document.getElementById('attendance-empty');
    if (!records || !records.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = records.map((r, i) => `
      <tr style="animation-delay:${i * 0.05}s">
        <td><span class="emp-id">${this.esc(r.employee_id_display)}</span></td>
        <td><strong>${this.esc(r.employee_name)}</strong></td>
        <td style="color:var(--text-2)">${this.fmtDate(r.date)}</td>
        <td><span class="badge badge-${r.status.toLowerCase()}">
          <i class="fas fa-${r.status === 'Present' ? 'circle-check' : 'circle-xmark'}"></i>
          ${r.status}
        </span></td>
        <td style="color:var(--text-3)">${this.fmtDateTime(r.created_at)}</td>
      </tr>`).join('');
  }

  /* ── Pagination renderers ── */
  updateEmployeePagination() {
    const c = this.employeePagination;
    const container = document.getElementById('employees-pagination');
    if (c.totalPages <= 1) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    const start = (c.currentPage - 1) * 10 + 1;
    const end   = Math.min(c.currentPage * 10, c.totalCount);
    document.getElementById('employees-pagination-info').textContent = `${start}–${end} of ${c.totalCount}`;
    document.getElementById('employees-prev-btn').disabled = c.currentPage === 1;
    document.getElementById('employees-next-btn').disabled = c.currentPage === c.totalPages;
    document.getElementById('employees-page-numbers').innerHTML = this.buildPageNumbers(c, 'employees');
  }

  updateAttendancePagination() {
    const c = this.attendancePagination;
    const container = document.getElementById('attendance-pagination');
    if (c.totalPages <= 1) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    const start = (c.currentPage - 1) * 10 + 1;
    const end   = Math.min(c.currentPage * 10, c.totalCount);
    document.getElementById('attendance-pagination-info').textContent = `${start}–${end} of ${c.totalCount}`;
    document.getElementById('attendance-prev-btn').disabled = c.currentPage === 1;
    document.getElementById('attendance-next-btn').disabled = c.currentPage === c.totalPages;
    document.getElementById('attendance-page-numbers').innerHTML = this.buildPageNumbers(c, 'attendance');
  }

  buildPageNumbers({ currentPage, totalPages }, type) {
    const pages = new Set([1, totalPages]);
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.add(i);
    const sorted = [...pages].sort((a, b) => a - b);
    let html = '', prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) html += `<span class="page-ellipsis">…</span>`;
      const fn = type === 'employees' ? `app.loadEmployees(${p})` : `app.loadAttendance(${p},app.currentFilters)`;
      html += `<button class="page-number${p === currentPage ? ' active' : ''}" onclick="${fn}">${p}</button>`;
      prev = p;
    }
    return html;
  }

  /* ── Dropdowns ── */
  populateEmployeeDropdowns() {
    fetch('/api/employees/')
      .then(r => r.json())
      .then(data => this.updateDropdowns(data.results || data))
      .catch(() => {});
  }

  updateDropdowns(employees) {
    const atSel = document.getElementById('attendance-employee');
    const ftSel = document.getElementById('filter-employee');
    atSel.innerHTML = '<option value="">Select Employee</option>';
    ftSel.innerHTML = '<option value="">All Employees</option>';
    employees.forEach(e => {
      const label = `${e.employee_id} — ${e.full_name}`;
      atSel.appendChild(new Option(label, e.employee_id));
      ftSel.appendChild(new Option(label, e.employee_id));
    });
    ftSel.onchange = e => {
      this.currentFilters.employee = e.target.value;
      e.target.value ? this.filterAttendanceByEmployee(e.target.value) : this.loadAttendance(1);
    };
  }

  async filterAttendanceByEmployee(employeeId) {
    this.currentFilters.employee = employeeId;
    try {
      this.showLoading();
      let url = `/api/attendance/${employeeId}/?page=1`;
      const params = new URLSearchParams();
      if (this.currentFilters.dateFrom) params.append('date_from', this.currentFilters.dateFrom);
      if (this.currentFilters.dateTo)   params.append('date_to',   this.currentFilters.dateTo);
      if (params.toString()) url += '&' + params.toString();
      const res  = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        this.attendancePagination = { currentPage: data.current_page || 1, totalPages: data.total_pages || 1, totalCount: data.count || 0 };
        this.renderAttendance(data.results || data.attendance_records);
        this.updateAttendancePagination();
      } else { this.showError('Failed to load employee attendance'); }
    } catch { this.showError('Network error'); }
    finally  { this.hideLoading(); }
  }

  applyDateFilter() {
    const from = document.getElementById('filter-date-from').value;
    const to   = document.getElementById('filter-date-to').value;
    if (from && to && new Date(from) > new Date(to)) { this.showError('From date cannot be after To date'); return; }
    this.currentFilters.dateFrom = from;
    this.currentFilters.dateTo   = to;
    this.attendancePagination.currentPage = 1;
    this.loadAttendance(1, this.currentFilters);
    if (from || to) this.showSuccess('Filter applied');
  }

  clearDateFilter() {
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value   = '';
    this.currentFilters.dateFrom = '';
    this.currentFilters.dateTo   = '';
    this.attendancePagination.currentPage = 1;
    this.currentFilters.employee ? this.filterAttendanceByEmployee(this.currentFilters.employee) : this.loadAttendance(1);
    this.showSuccess('Filter cleared');
  }

  /* ── Dashboard ── */
  async loadDashboard() {
    try {
      this.showLoading();
      const res  = await fetch('/api/dashboard/');
      const data = await res.json();
      if (res.ok) { this.renderDashboard(data); this.populateMonthFilter(); }
      else { this.showError('Failed to load dashboard'); }
    } catch { this.showError('Network error'); }
    finally  { this.hideLoading(); }
  }

  renderDashboard(data) {
    const s = data.summary;
    this.animateCounter('dashboard-total-employees', s.total_employees);
    this.animateCounter('dashboard-present-today',   s.present_today);
    this.animateCounter('dashboard-absent-today',    s.absent_today);
    document.getElementById('dashboard-attendance-rate').textContent = `${s.attendance_rate}%`;
    this.renderEmployeeSummary(data.employee_summary);
    this.renderRecentActivity(data.recent_activity);
  }

  renderEmployeeSummary(list) {
    const tbody = document.getElementById('dashboard-summary-tbody');
    const empty = document.getElementById('dashboard-summary-empty');
    if (!list || !list.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    tbody.innerHTML = list.map((e, i) => `
      <tr style="animation-delay:${i * 0.05}s">
        <td><span class="emp-id">${this.esc(e.employee_id)}</span></td>
        <td><strong>${this.esc(e.full_name)}</strong></td>
        <td><span class="badge badge-dept">${this.esc(e.department)}</span></td>
        <td style="color:var(--text-2)">${e.total_days}</td>
        <td style="color:var(--green);font-weight:600">${e.present_days}</td>
        <td style="color:var(--red);font-weight:600">${e.absent_days}</td>
        <td>
          <div class="rate-wrap">
            <div class="rate-bar"><div class="rate-fill" style="width:${e.attendance_rate}%"></div></div>
            <span class="rate-pct">${e.attendance_rate}%</span>
          </div>
        </td>
      </tr>`).join('');
  }

  renderRecentActivity(list) {
    const feed  = document.getElementById('recent-activity-list');
    const empty = document.getElementById('recent-activity-empty');
    if (!list || !list.length) { feed.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    feed.innerHTML = list.map((a, i) => `
      <div class="activity-item" style="animation-delay:${i * 0.05}s">
        <div class="act-dot ${a.status.toLowerCase()}">
          <i class="fas fa-${a.status === 'Present' ? 'circle-check' : 'circle-xmark'}"></i>
        </div>
        <div class="act-body">
          <div class="act-name">${this.esc(a.employee_name)} <span style="color:var(--text-3);font-weight:400">(${this.esc(a.employee_id)})</span></div>
          <div class="act-info">Marked <strong style="color:${a.status === 'Present' ? 'var(--green)' : 'var(--red)'}">${a.status}</strong> · ${this.fmtDate(a.date)}</div>
        </div>
        <div class="act-time">${this.relTime(a.created_at)}</div>
      </div>`).join('');
  }

  populateMonthFilter() {
    const sel = document.getElementById('dashboard-month-filter');
    sel.innerHTML = '<option value="">Current Month</option>';
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      sel.appendChild(new Option(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), v));
    }
  }

  async filterDashboardByMonth(val) {
    if (!val) { this.loadDashboard(); return; }
    try {
      this.showLoading();
      const res  = await fetch(`/api/dashboard/?month=${val}`);
      const data = await res.json();
      if (res.ok) this.renderDashboard(data);
      else this.showError('Failed to filter dashboard');
    } catch { this.showError('Network error'); }
    finally  { this.hideLoading(); }
  }

  /* ── Stats ── */
  async updateStats() {
    try {
      const [er, ar] = await Promise.all([fetch('/api/employees/'), fetch('/api/attendance/list/')]);
      const [ed, ad] = await Promise.all([er.json(), ar.json()]);
      const te = ed.count || ed.length || 0;
      const ta = ad.count || ad.length || 0;
      this.animateCounter('total-employees',   te);
      this.animateCounter('topbar-employees',  te);
      this.animateCounter('total-attendance',  ta);
    } catch {}
  }

  /* ── Delete ── */
  confirmDeleteEmployee(id, name) {
    document.getElementById('confirm-message').textContent =
      `Delete "${name}"? All their attendance records will also be removed.`;
    document.getElementById('confirm-yes').onclick = () => { this.deleteEmployee(id); this.hideModal(); };
    this.showModal();
  }

  async deleteEmployee(id) {
    try {
      this.showLoading();
      const res = await fetch(`/api/employees/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        this.showSuccess('Employee deleted');
        this.loadEmployees(this.employeePagination.currentPage);
        if (this.currentTab === 'attendance') this.loadAttendance(this.attendancePagination.currentPage);
        this.updateStats();
      } else { this.showError('Failed to delete employee'); }
    } catch { this.showError('Network error'); }
    finally  { this.hideLoading(); }
  }

  /* ── Search ── */
  searchEmployees(query) {
    const rows  = document.querySelectorAll('#employees-tbody tr');
    const empty = document.getElementById('employees-empty');
    let visible = 0;
    rows.forEach(row => {
      const match = row.textContent.toLowerCase().includes(query.toLowerCase());
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    const noResults = visible === 0 && query.trim();
    empty.classList.toggle('hidden', !noResults);
    if (query.trim()) {
      document.getElementById('employees-pagination').classList.add('hidden');
    } else {
      this.updateEmployeePagination();
    }
  }

  /* ── Animate counter ── */
  animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent) || 0;
    const dur   = 800;
    const t0    = performance.now();
    const tick  = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor(start + (target - start) * p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── Helpers ── */
  esc(t) {
    const d = document.createElement('div');
    d.textContent = String(t ?? '');
    return d.innerHTML;
  }

  fmtDate(s) {
    return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  fmtDateTime(s) {
    return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  relTime(s) {
    const diff = Math.floor((Date.now() - new Date(s)) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}

const app = new HRMSApp();
