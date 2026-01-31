// Employee Management JavaScript
class EmployeeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        const employeeForm = document.getElementById('employee-form');
        employeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmployeeSubmit(e);
        });

        // Real-time validation
        const inputs = employeeForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupFormValidation() {
        // Add visual feedback for form validation
        const form = document.getElementById('employee-form');
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
                    errorMessage = 'Employee ID is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Employee ID must be at least 2 characters';
                    isValid = false;
                } else if (!/^[A-Za-z0-9]+$/.test(value)) {
                    errorMessage = 'Employee ID can only contain letters and numbers';
                    isValid = false;
                }
                break;

            case 'full_name':
                if (!value) {
                    errorMessage = 'Full name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Full name must be at least 2 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    errorMessage = 'Full name can only contain letters and spaces';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'department':
                if (!value) {
                    errorMessage = 'Department is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Department must be at least 2 characters';
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

    async handleEmployeeSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        
        const employeeData = {
            employee_id: formData.get('employee_id').trim(),
            full_name: formData.get('full_name').trim(),
            email: formData.get('email').trim(),
            department: formData.get('department').trim()
        };

        // Client-side validation
        if (!this.validateForm(form)) {
            return;
        }

        // Add loading state to submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Employee...';
        submitBtn.disabled = true;

        try {
            app.showLoading();
            
            console.log('Sending employee data:', employeeData);
            
            const response = await fetch('/api/employees/', {
                method: 'POST',
                headers: app.getHeaders(),
                body: JSON.stringify(employeeData)
            });

            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                app.showSuccess('Employee added successfully');
                form.reset();
                this.clearAllFieldErrors(form);
                app.loadEmployees(app.employeePagination.currentPage);
                app.updateStats();
                
                // Add success animation to form
                form.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    form.style.animation = '';
                }, 500);
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
            console.error('Employee creation error:', error);
            app.showError('Network error while adding employee. Please check your connection.');
        } finally {
            app.hideLoading();
            // Restore submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    clearAllFieldErrors(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            this.clearFieldError(input);
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
            app.showError('Failed to add employee. Please check your input.');
        }
    }

    // Method to get all employees (used by other modules)
    async getEmployees(page = 1) {
        try {
            const response = await fetch(`/api/employees/?page=${page}`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            return { results: [], count: 0, total_pages: 1 };
        }
    }

    // Method to get employee by ID
    async getEmployeeById(employeeId) {
        try {
            const data = await this.getEmployees();
            const employees = data.results || data;
            return employees.find(emp => emp.employee_id === employeeId);
        } catch (error) {
            console.error('Error finding employee:', error);
            return null;
        }
    }

    // Method to search employees
    searchEmployees(query, employees) {
        if (!query.trim()) return employees;
        
        const searchTerm = query.toLowerCase();
        return employees.filter(employee => 
            employee.employee_id.toLowerCase().includes(searchTerm) ||
            employee.full_name.toLowerCase().includes(searchTerm) ||
            employee.email.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm)
        );
    }

    // Method to export employees data
    exportEmployees(employees, format = 'csv') {
        if (format === 'csv') {
            const headers = ['Employee ID', 'Full Name', 'Email', 'Department', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...employees.map(emp => [
                    emp.employee_id,
                    `"${emp.full_name}"`,
                    emp.email,
                    `"${emp.department}"`,
                    new Date(emp.created_at).toLocaleDateString()
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
}

// Add CSS for field validation
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error {
        border-color: var(--error-color);
        box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }

    .field-error {
        color: var(--error-color);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        animation: slideInDown 0.3s ease-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    .department-badge {
        background: linear-gradient(135deg, var(--info-color), #3182ce);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .page-ellipsis {
        padding: 0.5rem 0.75rem;
        color: var(--gray-500);
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Initialize employee manager
const employeeManager = new EmployeeManager();