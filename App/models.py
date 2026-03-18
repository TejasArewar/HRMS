from django.db import models
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError


class Employee(models.Model):
    employee_id = models.CharField(max_length=20, unique=True, help_text="Unique employee identifier")
    full_name = models.CharField(max_length=100, help_text="Employee's full name")
    email = models.EmailField(unique=True, validators=[EmailValidator()], help_text="Employee's email address")
    department = models.CharField(max_length=50, help_text="Employee's department")
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"




class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(help_text="Attendance date")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, help_text="Attendance status")
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.employee.employee_id} - {self.date} - {self.status}"

    def clean(self):
        if Attendance.objects.filter(employee=self.employee, date=self.date).exclude(pk=self.pk).exists():
            raise ValidationError('Attendance record for this employee and date already exists.')
