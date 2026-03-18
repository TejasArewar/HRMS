// Attendance form management
class AttendanceManager {
  constructor() {
    this.form = document.getElementById('attendance-form');
    this.init();
  }

  init() {
    this.form.addEventListener('submit', e => { e.preventDefault(); this.handleSubmit(e); });
    this.form.querySelectorAll('input, select').forEach(f => {
      f.addEventListener('blur',   () => this.validateField(f));
      f.addEventListener('change', () => this.clearError(f));
    });
  }

  validateField(field) {
    const v = field.value.trim();
    let err = '';
    switch (field.name) {
      case 'employee_id':
        if (!v) err = 'Please select an employee';
        break;
      case 'date': {
        if (!v) { err = 'Date is required'; break; }
        const today = new Date().toISOString().split('T')[0];
        if (v > today) { err = 'Cannot mark attendance for future dates'; break; }
        const limit = new Date(); limit.setDate(limit.getDate() - 30);
        if (v < limit.toISOString().split('T')[0]) err = 'Cannot mark attendance older than 30 days';
        break;
      }
      case 'status':
        if (!v) err = 'Please select a status';
        break;
    }
    if (err) { this.showError(field, err); return false; }
    return true;
  }

  showError(field, msg) {
    field.classList.add('error');
    let el = field.closest('.field')?.querySelector('.field-error');
    if (!el) {
      el = document.createElement('div');
      el.className = 'field-error';
      field.closest('.field')?.appendChild(el);
    }
    el.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
  }

  clearError(field) {
    field.classList.remove('error');
    field.closest('.field')?.querySelector('.field-error')?.remove();
  }

  validateAll() {
    return [...this.form.querySelectorAll('[required]')].map(f => this.validateField(f)).every(Boolean);
  }

  async handleSubmit(e) {
    if (!this.validateAll()) return;
    const fd = new FormData(this.form);
    const payload = { employee_id: fd.get('employee_id'), date: fd.get('date'), status: fd.get('status') };
    const btn  = this.form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marking…';
    btn.disabled = true;
    try {
      app.showLoading();
      const res  = await fetch('/api/attendance/', { method: 'POST', headers: app.getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        app.showSuccess(`Marked ${payload.status} successfully`);
        this.form.reset();
        this.form.querySelectorAll('input,select').forEach(f => this.clearError(f));
        app.setCurrentDate();
        document.getElementById('mark-attendance-card').classList.remove('open');
        app.loadAttendance(app.attendancePagination.currentPage);
        app.updateStats();
        this.showStatusPop(payload.status);
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
      app.showError('Failed to mark attendance. Check your input.');
  }

  showStatusPop(status) {
    const pop = document.createElement('div');
    pop.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
      background:var(--bg-2);border:2px solid ${status === 'Present' ? 'var(--green)' : 'var(--red)'};
      border-radius:50%;width:100px;height:100px;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:4px;z-index:5000;
      transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .3s;opacity:0;
      color:${status === 'Present' ? 'var(--green)' : 'var(--red)'};font-weight:700;font-size:12px;
    `;
    pop.innerHTML = `<i class="fas fa-${status === 'Present' ? 'circle-check' : 'circle-xmark'}" style="font-size:32px"></i>${status}`;
    document.body.appendChild(pop);
    requestAnimationFrame(() => { pop.style.transform = 'translate(-50%,-50%) scale(1)'; pop.style.opacity = '1'; });
    setTimeout(() => {
      pop.style.transform = 'translate(-50%,-50%) scale(0)';
      pop.style.opacity = '0';
      setTimeout(() => pop.remove(), 350);
    }, 1800);
  }
}

const attendanceManager = new AttendanceManager();
