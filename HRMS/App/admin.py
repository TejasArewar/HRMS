from django.contrib import admin
from .models import Employee, Attendance


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'email', 'department', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['employee_id', 'full_name', 'email', 'department']
    ordering = ['employee_id']
    readonly_fields = ['created_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'created_at']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['employee__employee_id', 'employee__full_name']
    ordering = ['-date', 'employee__employee_id']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('employee')
