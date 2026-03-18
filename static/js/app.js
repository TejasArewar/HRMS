// Main Application JavaScript
class HRMSApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.employeePagination = {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0
        };
        this.attendancePagination = {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0
        };
        this.currentFilters = {
            employee: '',
            dateFrom: '',
            dateTo: '',
            employeeSearch: ''
        };
        this.dashboardData = null;
        this.init();
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.loadDashboard();
        this.updateStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modal events
        document.getElementById('confirm-no').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.hideModal();
        });

        // Message close buttons
        document.querySelectorAll('.message-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.message').classList.add('hidden');
            });
        });

        // Employee pagination
        document.getElementById('employees-prev-btn').addEventListener('click', () => {
            if (this.employeePagination.currentPage > 1) {
                this.loadEmployees(this.employeePagination.currentPage - 1);
            }
        });

        document.getElementById('employees-next-btn').addEventListener('click', () => {
            if (this.employeePagination.currentPage < this.employeePagination.totalPages) {
                this.loadEmployees(this.employeePagination.currentPage + 1);
            }
        });

        // Attendance pagination
        document.getElementById('attendance-prev-btn').addEventListener('click', () => {
            if (this.attendancePagination.currentPage > 1) {
                this.loadAttendance(this.attendancePagination.currentPage - 1, this.currentFilters);
            }
        });

        document.getElementById('attendance-next-btn').addEventListener('click', () => {
            if (this.attendancePagination.currentPage < this.attendancePagination.totalPages) {
                this.loadAttendance(this.attendancePagination.currentPage + 1, this.currentFilters);
            }
        });

        // Search functionality
        document.getElementById('employee-search').addEventListener('input', (e) => {
            this.currentFilters.employeeSearch = e.target.value;
            this.searchEmployees(e.target.value);
        });

        // Date filter functionality
        document.getElementById('apply-date-filter').addEventListener('click', () => {
            this.applyDateFilter();
        });

        document.getElementById('clear-date-filter').addEventListener('click', () => {
            this.clearDateFilter();
        });

        // Date input change handlers
        document.getElementById('filter-date-from').addEventListener('change', (e) => {
            this.currentFilters.dateFrom = e.target.value;
        });

        document.getElementById('filter-date-to').addEventListener('change', (e) => {
            this.currentFilters.dateTo = e.target.value;
        });

        // Dashboard refresh
        document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.loadDashboard();
        });

        // Dashboard month filter
        document.getElementById('dashboard-month-filter').addEventListener('change', (e) => {
            this.filterDashboardByMonth(e.target.value);
        });
    }

    switchTab(tabName) {
        // Update active tab button with animation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active');

        // Update active tab content with animation
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(`${tabName}-tab`).classList.add('active');
        }, 150);

        this.currentTab = tabName;

        // Load data for the active tab
        if (tabName === 'dashboard') {
            this.loadDashboard();
        } else if (tabName === 'employees') {
            this.loadEmployees();
        } else if (tabName === 'attendance') {
            this.loadAttendance();
            this.populateEmployeeDropdowns();
        }
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendance-date').value = today;
    }

    async loadEmployees(page = 1) {
        try {
            this.showLoading();
            let url = `/api/employees/?page=${page}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.employeePagination = {
                    currentPage: data.current_page || page,
                    totalPages: data.total_pages || 1,
                    totalCount: data.count || 0
                };
                
                this.renderEmployees(data.results || data);
                this.updateEmployeePagination();
                this.populateEmployeeDropdowns();
                this.updateStats();
                
                // Apply search filter if active
                if (this.currentFilters.employeeSearch) {
                    this.searchEmployees(this.currentFilters.employeeSearch);
                }
            } else {
                this.showError('Failed to load employees');
            }
        } catch (error) {
            this.showError('Network error while loading employees');
        } finally {
            this.hideLoading();
        }
    }

    async loadAttendance(page = 1, filters = null) {
        try {
            this.showLoading();
            let url = `/api/attendance/list/?page=${page}`;
            
            // Apply filters if provided
            const activeFilters = filters || this.currentFilters;
            if (activeFilters.employee) {
                url = `/api/attendance/${activeFilters.employee}/?page=${page}`;
            }
            
            // Add date filters as query parameters
            const urlParams = new URLSearchParams();
            if (activeFilters.dateFrom) {
                urlParams.append('date_from', activeFilters.dateFrom);
            }
            if (activeFilters.dateTo) {
                urlParams.append('date_to', activeFilters.dateTo);
            }
            
            if (urlParams.toString()) {
                url += (url.includes('?') ? '&' : '?') + urlParams.toString();
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.attendancePagination = {
                    currentPage: data.current_page || page,
                    totalPages: data.total_pages || 1,
                    totalCount: data.count || 0
                };
                
                this.renderAttendance(data.results || data.attendance_records || data);
                this.updateAttendancePagination();
                this.updateStats();
            } else {
                this.showError('Failed to load attendance records');
            }
        } catch (error) {
            this.showError('Network error while loading attendance');
        } finally {
            this.hideLoading();
        }
    }

    renderEmployees(employees) {
        const tbody = document.getElementById('employees-tbody');
        const emptyState = document.getElementById('employees-empty');
        
        if (!employees || employees.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = employees.map((employee, index) => `
            <tr style="animation-delay: ${index * 0.1}s" class="fade-in">
                <td><strong>${this.escapeHtml(employee.employee_id)}</strong></td>
                <td>${this.escapeHtml(employee.full_name)}</td>
                <td>${this.escapeHtml(employee.email)}</td>
                <td><span class="department-badge">${this.escapeHtml(employee.department)}</span></td>
                <td>${this.formatDateTime(employee.created_at)}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="app.confirmDeleteEmployee(${employee.id}, '${this.escapeHtml(employee.full_name)}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderAttendance(attendanceRecords) {
        const tbody = document.getElementById('attendance-tbody');
        const emptyState = document.getElementById('attendance-empty');
        
        if (!attendanceRecords || attendanceRecords.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = attendanceRecords.map((record, index) => `
            <tr style="animation-delay: ${index * 0.1}s" class="fade-in">
                <td><strong>${this.escapeHtml(record.employee_id_display)}</strong></td>
                <td>${this.escapeHtml(record.employee_name)}</td>
                <td>${this.formatDate(record.date)}</td>
                <td>
                    <span class="status-${record.status.toLowerCase()}">
                        <i class="fas fa-${record.status === 'Present' ? 'check' : 'times'}"></i>
                        ${record.status}
                    </span>
                </td>
                <td>${this.formatDateTime(record.created_at)}</td>
            </tr>
        `).join('');
    }

    updateEmployeePagination() {
        const container = document.getElementById('employees-pagination');
        const info = document.getElementById('employees-pagination-info');
        const prevBtn = document.getElementById('employees-prev-btn');
        const nextBtn = document.getElementById('employees-next-btn');
        const pageNumbers = document.getElementById('employees-page-numbers');

        if (this.employeePagination.totalPages <= 1) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        
        // Update info
        const start = (this.employeePagination.currentPage - 1) * 10 + 1;
        const end = Math.min(this.employeePagination.currentPage * 10, this.employeePagination.totalCount);
        info.textContent = `Showing ${start}-${end} of ${this.employeePagination.totalCount} employees`;

        // Update buttons
        prevBtn.disabled = this.employeePagination.currentPage === 1;
        nextBtn.disabled = this.employeePagination.currentPage === this.employeePagination.totalPages;

        // Update page numbers
        pageNumbers.innerHTML = this.generatePageNumbers(this.employeePagination, 'employees');
    }

    updateAttendancePagination() {
        const container = document.getElementById('attendance-pagination');
        const info = document.getElementById('attendance-pagination-info');
        const prevBtn = document.getElementById('attendance-prev-btn');
        const nextBtn = document.getElementById('attendance-next-btn');
        const pageNumbers = document.getElementById('attendance-page-numbers');

        if (this.attendancePagination.totalPages <= 1) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        
        // Update info
        const start = (this.attendancePagination.currentPage - 1) * 10 + 1;
        const end = Math.min(this.attendancePagination.currentPage * 10, this.attendancePagination.totalCount);
        info.textContent = `Showing ${start}-${end} of ${this.attendancePagination.totalCount} records`;

        // Update buttons
        prevBtn.disabled = this.attendancePagination.currentPage === 1;
        nextBtn.disabled = this.attendancePagination.currentPage === this.attendancePagination.totalPages;

        // Update page numbers
        pageNumbers.innerHTML = this.generatePageNumbers(this.attendancePagination, 'attendance');
    }

    generatePageNumbers(pagination, type) {
        const { currentPage, totalPages } = pagination;
        let pages = [];
        
        // Always show first page
        if (totalPages > 0) pages.push(1);
        
        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) pages.push(i);
        }
        
        // Always show last page
        if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
        
        // Add ellipsis if needed
        let result = [];
        for (let i = 0; i < pages.length; i++) {
            if (i > 0 && pages[i] - pages[i-1] > 1) {
                result.push('...');
            }
            result.push(pages[i]);
        }
        
        return result.map(page => {
            if (page === '...') {
                return '<span class="page-ellipsis">...</span>';
            }
            
            const isActive = page === currentPage;
            const clickHandler = type === 'employees' 
                ? `app.loadEmployees(${page})` 
                : `app.loadAttendance(${page}, app.currentFilters)`;
            
            return `
                <button class="page-number ${isActive ? 'active' : ''}" 
                        onclick="${clickHandler}">
                    ${page}
                </button>
            `;
        }).join('');
    }

    populateEmployeeDropdowns(employees = null) {
        if (!employees) {
            // If employees not provided, fetch them
            fetch('/api/employees/')
                .then(response => response.json())
                .then(data => {
                    const employees = data.results || data;
                    this.updateDropdowns(employees);
                })
                .catch(error => {
                    console.error('Error fetching employees for dropdowns:', error);
                });
        } else {
            this.updateDropdowns(employees);
        }
    }

    updateDropdowns(employees) {
        const attendanceSelect = document.getElementById('attendance-employee');
        const filterSelect = document.getElementById('filter-employee');
        
        // Clear existing options (except first)
        attendanceSelect.innerHTML = '<option value="">Select Employee</option>';
        filterSelect.innerHTML = '<option value="">All Employees</option>';
        
        employees.forEach(employee => {
            const option1 = new Option(`${employee.employee_id} - ${employee.full_name}`, employee.employee_id);
            const option2 = new Option(`${employee.employee_id} - ${employee.full_name}`, employee.employee_id);
            
            attendanceSelect.appendChild(option1);
            filterSelect.appendChild(option2);
        });

        // Setup filter functionality
        filterSelect.addEventListener('change', (e) => {
            this.currentFilters.employee = e.target.value;
            this.filterAttendanceByEmployee(e.target.value);
        });
    }

    async filterAttendanceByEmployee(employeeId) {
        this.currentFilters.employee = employeeId;
        
        if (!employeeId) {
            this.loadAttendance(1);
            return;
        }

        try {
            this.showLoading();
            let url = `/api/attendance/${employeeId}/?page=1`;
            
            // Add date filters if active
            const urlParams = new URLSearchParams();
            if (this.currentFilters.dateFrom) {
                urlParams.append('date_from', this.currentFilters.dateFrom);
            }
            if (this.currentFilters.dateTo) {
                urlParams.append('date_to', this.currentFilters.dateTo);
            }
            
            if (urlParams.toString()) {
                url += '&' + urlParams.toString();
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.attendancePagination = {
                    currentPage: data.current_page || 1,
                    totalPages: data.total_pages || 1,
                    totalCount: data.count || (data.results ? data.results.length : 0)
                };
                
                this.renderAttendance(data.results || data.attendance_records);
                this.updateAttendancePagination();
            } else {
                this.showError('Failed to load employee attendance');
            }
        } catch (error) {
            this.showError('Network error while filtering attendance');
        } finally {
            this.hideLoading();
        }
    }

    applyDateFilter() {
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;
        
        // Validate date range
        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            this.showError('From date cannot be later than To date');
            return;
        }
        
        this.currentFilters.dateFrom = dateFrom;
        this.currentFilters.dateTo = dateTo;
        
        // Reset to first page when applying filters
        this.attendancePagination.currentPage = 1;
        
        // Load attendance with current filters
        this.loadAttendance(1, this.currentFilters);
        
        // Show filter applied message
        let filterMessage = 'Date filter applied';
        if (dateFrom && dateTo) {
            filterMessage = `Showing records from ${this.formatDate(dateFrom)} to ${this.formatDate(dateTo)}`;
        } else if (dateFrom) {
            filterMessage = `Showing records from ${this.formatDate(dateFrom)}`;
        } else if (dateTo) {
            filterMessage = `Showing records up to ${this.formatDate(dateTo)}`;
        }
        
        if (dateFrom || dateTo) {
            this.showSuccess(filterMessage);
        }
    }

    clearDateFilter() {
        // Clear date inputs
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        
        // Clear filters
        this.currentFilters.dateFrom = '';
        this.currentFilters.dateTo = '';
        
        // Reset to first page
        this.attendancePagination.currentPage = 1;
        
        // Reload attendance with current employee filter only
        if (this.currentFilters.employee) {
            this.filterAttendanceByEmployee(this.currentFilters.employee);
        } else {
            this.loadAttendance(1);
        }
        
        this.showSuccess('Date filter cleared');
    }

    async loadDashboard() {
        try {
            this.showLoading();
            const response = await fetch('/api/dashboard/');
            const data = await response.json();
            
            if (response.ok) {
                this.dashboardData = data;
                this.renderDashboard(data);
                this.populateMonthFilter();
            } else {
                this.showError('Failed to load dashboard data');
            }
        } catch (error) {
            this.showError('Network error while loading dashboard');
        } finally {
            this.hideLoading();
        }
    }

    renderDashboard(data) {
        // Update summary cards
        this.animateCounter('dashboard-total-employees', data.summary.total_employees);
        this.animateCounter('dashboard-present-today', data.summary.present_today);
        this.animateCounter('dashboard-absent-today', data.summary.absent_today);
        
        const attendanceRateElement = document.getElementById('dashboard-attendance-rate');
        attendanceRateElement.textContent = `${data.summary.attendance_rate}%`;

        // Update section headers if month filter is active
        if (data.summary.filtered_month) {
            document.querySelector('#dashboard-tab .section-header h2').innerHTML = 
                `<i class="fas fa-chart-bar"></i> Employee Attendance Summary - ${data.summary.filtered_month}`;
        } else {
            document.querySelector('#dashboard-tab .section-header h2').innerHTML = 
                `<i class="fas fa-chart-bar"></i> Employee Attendance Summary`;
        }

        // Show welcome message if no employees exist
        if (data.summary.total_employees === 0) {
            this.showWelcomeMessage();
        } else {
            this.hideWelcomeMessage();
        }

        // Render employee summary table
        this.renderEmployeeSummary(data.employee_summary);
        
        // Render recent activity
        this.renderRecentActivity(data.recent_activity);
    }

    showWelcomeMessage() {
        // Create or show welcome message for empty dashboard
        let welcomeMsg = document.getElementById('dashboard-welcome');
        if (!welcomeMsg) {
            welcomeMsg = document.createElement('div');
            welcomeMsg.id = 'dashboard-welcome';
            welcomeMsg.className = 'welcome-message';
            welcomeMsg.innerHTML = `
                <div class="welcome-content">
                    <i class="fas fa-rocket"></i>
                    <h2>Welcome to HRMS Lite!</h2>
                    <p>Get started by adding your first employee and marking attendance.</p>
                    <div class="welcome-actions">
                        <button class="btn btn-primary" onclick="app.switchTab('employees')">
                            <i class="fas fa-user-plus"></i>
                            Add First Employee
                        </button>
                    </div>
                </div>
            `;
            document.querySelector('#dashboard-tab .dashboard-grid').prepend(welcomeMsg);
        }
        welcomeMsg.classList.remove('hidden');
    }

    hideWelcomeMessage() {
        const welcomeMsg = document.getElementById('dashboard-welcome');
        if (welcomeMsg) {
            welcomeMsg.classList.add('hidden');
        }
    }

    renderEmployeeSummary(employeeSummary) {
        const tbody = document.getElementById('dashboard-summary-tbody');
        const emptyState = document.getElementById('dashboard-summary-empty');
        
        if (!employeeSummary || employeeSummary.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = employeeSummary.map((employee, index) => `
            <tr style="animation-delay: ${index * 0.1}s" class="fade-in">
                <td><strong>${this.escapeHtml(employee.employee_id)}</strong></td>
                <td>${this.escapeHtml(employee.full_name)}</td>
                <td><span class="department-badge">${this.escapeHtml(employee.department)}</span></td>
                <td>${employee.total_days}</td>
                <td><span class="present-count">${employee.present_days}</span></td>
                <td><span class="absent-count">${employee.absent_days}</span></td>
                <td>
                    <div class="attendance-rate-bar">
                        <div class="rate-bar">
                            <div class="rate-fill" style="width: ${employee.attendance_rate}%"></div>
                        </div>
                        <span class="rate-text">${employee.attendance_rate}%</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderRecentActivity(recentActivity) {
        const container = document.getElementById('recent-activity-list');
        const emptyState = document.getElementById('recent-activity-empty');
        
        if (!recentActivity || recentActivity.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = recentActivity.map((activity, index) => `
            <div class="activity-item" style="animation-delay: ${index * 0.1}s">
                <div class="activity-icon ${activity.status.toLowerCase()}">
                    <i class="fas fa-${activity.status === 'Present' ? 'check' : 'times'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${this.escapeHtml(activity.employee_name)} (${this.escapeHtml(activity.employee_id)})</h4>
                    <p>Marked ${activity.status} for ${this.formatDate(activity.date)}</p>
                </div>
                <div class="activity-time">
                    ${this.formatRelativeTime(activity.created_at)}
                </div>
            </div>
        `).join('');
    }


    populateMonthFilter() {
        const select = document.getElementById('dashboard-month-filter');
        const currentDate = new Date();
        
        // Clear existing options except first
        select.innerHTML = '<option value="">Current Month</option>';
        
        // Add last 6 months
        for (let i = 1; i <= 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const option = new Option(monthYear, value);
            select.appendChild(option);
        }
    }

    async filterDashboardByMonth(monthValue) {
        if (!monthValue) {
            // Reset to current month
            this.loadDashboard();
            return;
        }
        
        try {
            this.showLoading();
            const response = await fetch(`/api/dashboard/?month=${monthValue}`);
            const data = await response.json();
            
            if (response.ok) {
                this.dashboardData = data;
                this.renderDashboard(data);
                this.showSuccess(`Dashboard filtered for ${monthValue}`);
            } else {
                this.showError('Failed to filter dashboard data');
            }
        } catch (error) {
            this.showError('Network error while filtering dashboard');
        } finally {
            this.hideLoading();
        }
    }

    formatRelativeTime(dateTimeString) {
        const now = new Date();
        const date = new Date(dateTimeString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    searchEmployees(query) {
        const rows = document.querySelectorAll('#employees-tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            row.style.display = matches ? '' : 'none';
            
            if (matches) {
                visibleCount++;
                row.style.animation = 'fadeIn 0.3s ease-out';
            }
        });
        
        // Update empty state based on search results
        const emptyState = document.getElementById('employees-empty');
        const tableContainer = document.querySelector('#employees-table').parentElement;
        
        if (visibleCount === 0 && query.trim()) {
            // Show custom search empty state
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No employees found</h3>
                <p>No employees match your search for "${query}"</p>
            `;
            emptyState.classList.remove('hidden');
            tableContainer.style.display = 'none';
        } else if (visibleCount === 0 && !query.trim()) {
            // Show default empty state
            emptyState.innerHTML = `
                <i class="fas fa-users"></i>
                <h3>No employees found</h3>
                <p>Add your first employee using the form above</p>
            `;
            emptyState.classList.remove('hidden');
            tableContainer.style.display = 'none';
        } else {
            // Hide empty state and show table
            emptyState.classList.add('hidden');
            tableContainer.style.display = 'block';
        }
        
        // Update pagination info for search results
        if (query.trim()) {
            const paginationInfo = document.getElementById('employees-pagination-info');
            if (paginationInfo) {
                paginationInfo.textContent = `Showing ${visibleCount} employees matching "${query}"`;
            }
            // Hide pagination controls during search
            document.getElementById('employees-pagination').classList.add('hidden');
        } else {
            // Restore normal pagination
            this.updateEmployeePagination();
        }
    }

    async updateStats() {
        try {
            // Get total employees count
            const employeesResponse = await fetch('/api/employees/');
            const employeesData = await employeesResponse.json();
            const totalEmployees = employeesData.count || (employeesData.length || 0);
            
            // Get total attendance count
            const attendanceResponse = await fetch('/api/attendance/list/');
            const attendanceData = await attendanceResponse.json();
            const totalAttendance = attendanceData.count || (attendanceData.length || 0);
            
            // Update stats with animation
            this.animateCounter('total-employees', totalEmployees);
            this.animateCounter('total-attendance', totalAttendance);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    confirmDeleteEmployee(employeeId, employeeName) {
        document.getElementById('confirm-message').textContent = 
            `Are you sure you want to delete employee "${employeeName}"? This will also delete all their attendance records.`;
        
        document.getElementById('confirm-yes').onclick = () => {
            this.deleteEmployee(employeeId);
            this.hideModal();
        };
        
        this.showModal();
    }

    async deleteEmployee(employeeId) {
        try {
            this.showLoading();
            const response = await fetch(`/api/employees/${employeeId}/`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                this.showSuccess('Employee deleted successfully');
                this.loadEmployees(this.employeePagination.currentPage);
                if (this.currentTab === 'attendance') {
                    this.loadAttendance(this.attendancePagination.currentPage);
                }
                this.updateStats();
            } else {
                const data = await response.json();
                this.showError(data.error || 'Failed to delete employee');
            }
        } catch (error) {
            this.showError('Network error while deleting employee');
        } finally {
            this.hideLoading();
        }
    }

    // Utility methods
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const messageText = errorDiv.querySelector('.message-text');
        messageText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        const messageText = successDiv.querySelector('.message-text');
        messageText.textContent = message;
        successDiv.classList.remove('hidden');
        
        setTimeout(() => {
            successDiv.classList.add('hidden');
        }, 3000);
    }

    showModal() {
        document.getElementById('confirm-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        document.getElementById('confirm-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateTimeString) {
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the application
const app = new HRMSApp();