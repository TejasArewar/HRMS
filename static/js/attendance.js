// Attendance Management JavaScript
class AttendanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        const attendanceForm = document.getElementById('attendance-form');
        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAttendanceSubmit(e);
        });

        // Real-time validation
        const inputs = attendanceForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('change', () => this.clearFieldError(input));
        });
    }

    setupFormValidation() {
        const form = document.getElementById('attendance-form');
        form.classList.add('needs-validation');
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        this.clearFieldError(field);

        switch (fieldName) {
            case 'employee_id':
                if (!value) {
                    errorMessage = 'Please select an employee';
                    isValid = false;
                }
                break;

            case 'date':
                if (!value) {
                    errorMessage = 'Date is required';
                    isValid = false;
                } else {
                    // Use a more robust date comparison
                    const selectedDateStr = value; // YYYY-MM-DD format
                    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
                    
                    if (selectedDateStr > todayStr) {
                        errorMessage = 'Cannot mark attendance for future dates';
                        isValid = false;
                    } else {
                        // Check if date is too old (30 days ago)
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
                        
                        if (selectedDateStr < thirtyDaysAgoStr) {
                            errorMessage = 'Cannot mark attendance for dates older than 30 days';
                            isValid = false;
                        }
                    }
                }
                break;

            case 'status':
                if (!value) {
                    errorMessage = 'Please select attendance status';
                    isValid = false;
                } else if (!['Present', 'Absent'].includes(value)) {
                    errorMessage = 'Invalid attendance status';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        field.parentNode.appendChild(errorDiv);

        // Add shake animation
        field.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleAttendanceSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        
        const attendanceData = {
            employee_id: formData.get('employee_id'),
            date: formData.get('date'),
            status: formData.get('status')
        };

        // Client-side validation
        if (!this.validateForm(form)) {
            return;
        }

        // Add loading state to submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marking Attendance...';
        submitBtn.disabled = true;

        try {
            app.showLoading();
            
            console.log('Sending attendance data:', attendanceData);
            
            const response = await fetch('/api/attendance/', {
                method: 'POST',
                headers: app.getHeaders(),
                body: JSON.stringify(attendanceData)
            });

            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                app.showSuccess(`Attendance marked as ${attendanceData.status} successfully`);
                form.reset();
                this.clearAllFieldErrors(form);
                app.setCurrentDate(); // Reset date to today
                app.loadAttendance(app.attendancePagination.currentPage);
                app.updateStats();
                
                // Add success animation to form
                form.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    form.style.animation = '';
                }, 500);

                // Show visual feedback for the status
                this.showStatusFeedback(attendanceData.status);
            } else {
                // Handle validation errors
                if (data.error) {
                    app.showError(data.error);
                } else if (data.non_field_errors) {
                    app.showError(data.non_field_errors[0]);
                } else {
                    this.handleServerErrors(data, form);
                }
            }
        } catch (error) {
            console.error('Attendance creation error:', error);
            app.showError('Network error while marking attendance. Please check your connection.');
        } finally {
            app.hideLoading();
            // Restore submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    clearAllFieldErrors(form) {
        const fields = form.querySelectorAll('input, select');
        fields.forEach(field => {
            this.clearFieldError(field);
        });
    }

    handleServerErrors(errors, form) {
        // Handle field-specific errors
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && errors[fieldName]) {
                const errorMessage = Array.isArray(errors[fieldName]) 
                    ? errors[fieldName][0] 
                    : errors[fieldName];
                this.showFieldError(field, errorMessage);
            }
        });

        // Show general error if no specific field errors
        const hasFieldErrors = Object.keys(errors).some(key => 
            form.querySelector(`[name="${key}"]`)
        );
        
        if (!hasFieldErrors) {
            app.showError('Failed to mark attendance. Please check your input.');
        }
    }

    showStatusFeedback(status) {
        // Create a temporary visual feedback element
        const feedback = document.createElement('div');
        feedback.className = `status-feedback status-${status.toLowerCase()}`;
        feedback.innerHTML = `
            <i class="fas fa-${status === 'Present' ? 'check' : 'times'}"></i>
            <span>${status}</span>
        `;
        
        document.body.appendChild(feedback);
        
        // Animate and remove
        setTimeout(() => {
            feedback.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            feedback.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }

    // Method to get attendance records for a specific employee
    async getEmployeeAttendance(employeeId, page = 1) {
        try {
            const response = await fetch(`/api/attendance/${employeeId}/?page=${page}`);
            if (response.ok) {
                const data = await response.json();
                return data.results || data.attendance_records || [];
            } else {
                throw new Error('Failed to fetch employee attendance');
            }
        } catch (error) {
            console.error('Error fetching employee attendance:', error);
            return [];
        }
    }

    // Method to get all attendance records
    async getAllAttendance(page = 1) {
        try {
            const response = await fetch(`/api/attendance/list/?page=${page}`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch attendance records');
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            return { results: [], count: 0, total_pages: 1 };
        }
    }

    // Method to calculate attendance statistics for an employee
    calculateAttendanceStats(attendanceRecords) {
        const stats = {
            totalDays: attendanceRecords.length,
            presentDays: 0,
            absentDays: 0,
            attendanceRate: 0
        };

        attendanceRecords.forEach(record => {
            if (record.status === 'Present') {
                stats.presentDays++;
            } else {
                stats.absentDays++;
            }
        });

        if (stats.totalDays > 0) {
            stats.attendanceRate = ((stats.presentDays / stats.totalDays) * 100).toFixed(1);
        }

        return stats;
    }

    // Method to filter attendance by date range
    filterAttendanceByDateRange(attendanceRecords, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return attendanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
    }

    // Method to get attendance summary by month
    getMonthlyAttendanceSummary(attendanceRecords) {
        const summary = {};
        
        attendanceRecords.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!summary[monthKey]) {
                summary[monthKey] = {
                    month: monthKey,
                    totalDays: 0,
                    presentDays: 0,
                    absentDays: 0
                };
            }
            
            summary[monthKey].totalDays++;
            if (record.status === 'Present') {
                summary[monthKey].presentDays++;
            } else {
                summary[monthKey].absentDays++;
            }
        });
        
        // Calculate attendance rates
        Object.values(summary).forEach(month => {
            month.attendanceRate = month.totalDays > 0 
                ? ((month.presentDays / month.totalDays) * 100).toFixed(1)
                : 0;
        });
        
        return Object.values(summary).sort((a, b) => b.month.localeCompare(a.month));
    }

    // Method to export attendance data
    exportAttendance(attendanceRecords, format = 'csv') {
        if (format === 'csv') {
            const headers = ['Employee ID', 'Employee Name', 'Date', 'Status', 'Recorded At'];
            const csvContent = [
                headers.join(','),
                ...attendanceRecords.map(record => [
                    record.employee_id_display,
                    `"${record.employee_name}"`,
                    record.date,
                    record.status,
                    new Date(record.created_at).toLocaleString()
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }

    // Method to get attendance trends
    getAttendanceTrends(attendanceRecords, days = 7) {
        const trends = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayRecords = attendanceRecords.filter(record => record.date === dateString);
            const presentCount = dayRecords.filter(record => record.status === 'Present').length;
            const totalCount = dayRecords.length;
            
            trends.push({
                date: dateString,
                presentCount,
                totalCount,
                attendanceRate: totalCount > 0 ? (presentCount / totalCount * 100).toFixed(1) : 0
            });
        }
        
        return trends;
    }
}

// Add CSS for attendance-specific styling
const attendanceStyle = document.createElement('style');
attendanceStyle.textContent = `
    .status-feedback {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: white;
        padding: 2rem;
        border-radius: 50%;
        box-shadow: var(--shadow-xl);
        z-index: 2000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0;
    }

    .status-feedback.show {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }

    .status-feedback.hide {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }

    .status-feedback.status-present {
        color: var(--success-color);
        border: 3px solid var(--success-color);
    }

    .status-feedback.status-absent {
        color: var(--error-color);
        border: 3px solid var(--error-color);
    }

    .status-feedback i {
        font-size: 3rem;
    }

    .status-feedback span {
        font-weight: 600;
        font-size: 1.2rem;
    }

    .attendance-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
    }

    .stat-card {
        background: var(--white);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        text-align: center;
        border-left: 4px solid var(--primary-color);
    }

    .stat-card h4 {
        color: var(--gray-600);
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stat-card .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
    }

    .stat-card.success {
        border-left-color: var(--success-color);
    }

    .stat-card.success .stat-value {
        color: var(--success-color);
    }

    .stat-card.error {
        border-left-color: var(--error-color);
    }

    .stat-card.error .stat-value {
        color: var(--error-color);
    }
`;
document.head.appendChild(attendanceStyle);

// Initialize attendance manager
const attendanceManager = new AttendanceManager();