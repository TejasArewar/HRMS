// Employee form management
class EmployeeManager {
  constructor() {
    this.form = document.getElementById('employee-form');
    this.init();
  }

  init() {
    this.form.addEventListener('submit', e => { e.preventDefault(); this.handleSubmit(e); });
    this.form.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('blur',  () => this.validateField(inp));
      inp.addEventListener('input', () => this.clearError(inp));
    });
  }

  validateField(field) {
    const v = field.value.trim();
    let err = '';
    switch (field.name) {
      case 'employee_id':
        if (!v) err = 'Employee ID is required';
        else if (v.length < 2) err = 'Must be at least 2 characters';
        else if (!/^[A-Za-z0-9_-]+$/.test(v)) err = 'Letters, numbers, _ and - only';
        break;
      case 'full_name':
        if (!v) err = 'Full name is required';
        else if (v.length < 2) err = 'Must be at least 2 characters';
        break;
      case 'email':
        if (!v) err = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Enter a valid email';
        break;
      case 'department':
        if (!v) err = 'Department is required';
        break;
    }
    if (err) { this.showError(field, err); return false; }
    return true;
  }

  showError(field, msg) {
    field.classList.add('error');
    let el = field.parentNode.querySelector('.field-error');
    if (!el) { el = document.createElement('div'); el.className = 'field-error'; field.parentNode.appendChild(el); }
    el.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
  }

  clearError(field) {
    field.classList.remove('error');
    field.parentNode.querySelector('.field-error')?.remove();
  }

  validateAll() {
    return [...this.form.querySelectorAll('input[required]')].map(f => this.validateField(f)).every(Boolean);
  }

  async handleSubmit(e) {
    if (!this.validateAll()) return;
    const fd = new FormData(this.form);
    const payload = {
      employee_id: fd.get('employee_id').trim(),
      full_name:   fd.get('full_name').trim(),
      email:       fd.get('email').trim(),
      department:  fd.get('department').trim()
    };
    const btn = this.form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding…';
    btn.disabled = true;
    try {
      app.showLoading();
      const res  = await fetch('/api/employees/', { method: 'POST', headers: app.getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        app.showSuccess('Employee added successfully');
        this.form.reset();
        this.form.querySelectorAll('input').forEach(f => this.clearError(f));
        document.getElementById('add-employee-card').classList.remove('open');
        app.loadEmployees(1);
        app.updateStats();
      } else {
        if (data.error) app.showError(data.error);
        else this.handleServerErrors(data);
      }
    } catch { app.showError('Network error. Please try again.'); }
    finally  { app.hideLoading(); btn.innerHTML = orig; btn.disabled = false; }
  }

  handleServerErrors(errors) {
    Object.keys(errors).forEach(key => {
      const field = this.form.querySelector(`[name="${key}"]`);
      if (field) this.showError(field, Array.isArray(errors[key]) ? errors[key][0] : errors[key]);
    });
    if (!Object.keys(errors).some(k => this.form.querySelector(`[name="${k}"]`)))
      app.showError('Failed to add employee. Check your input.');
  }
}

// Inject field-error style
const s = document.createElement('style');
s.textContent = `
  .field input.error,.field select.error{border-color:var(--red)!important;box-shadow:0 0 0 3px rgba(248,113,113,.15)!important;}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
`;
document.head.appendChild(s);

const employeeManager = new EmployeeManager();
