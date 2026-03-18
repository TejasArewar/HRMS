from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_employee_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("Employee ID cannot be empty.")
        return value.strip()

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip()

    def validate_department(self, value):
        if not value.strip():
            raise serializers.ValidationError("Department cannot be empty.")
        return value.strip()




class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_display', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'employee_name', 'employee_id_display']

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        
        if employee and date:
            # Check for existing attendance record
            existing = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError(
                    "Attendance record for this employee and date already exists."
                )
        
        return data




class AttendanceCreateSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(write_only=True)

    class Meta:
        model = Attendance
        fields = ['employee_id', 'date', 'status']

    def validate_employee_id(self, value):
        try:
            employee = Employee.objects.get(employee_id=value)
            return employee
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Employee with this ID does not exist.")

    def create(self, validated_data):
        employee = validated_data.pop('employee_id')
        validated_data['employee'] = employee
        return super().create(validated_data)