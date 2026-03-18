from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db import IntegrityError
from django.db.models import Count, Q
from datetime import date, datetime, timedelta
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer, AttendanceCreateSerializer


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })


# Frontend Views
def index(request):
    """Main dashboard view"""
    return render(request, 'index.html')


# API Views
@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def employee_list_create(request):
    """
    GET: List all employees with pagination
    POST: Create a new employee
    """
    if request.method == 'GET':
        employees = Employee.objects.all()
        paginator = CustomPagination()
        page = paginator.paginate_queryset(employees, request)
        if page is not None:
            serializer = EmployeeSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                if 'employee_id' in str(e):
                    return Response(
                        {'error': 'Employee ID already exists.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif 'email' in str(e):
                    return Response(
                        {'error': 'Email already exists.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {'error': 'Database integrity error.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def employee_delete(request, pk):
    """Delete an employee and all related attendance records"""
    try:
        employee = get_object_or_404(Employee, pk=pk)
        employee.delete()
        return Response(
            {'message': 'Employee and related attendance records deleted successfully.'}, 
            status=status.HTTP_204_NO_CONTENT
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete employee.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def attendance_create(request):
    """Create attendance record"""
    serializer = AttendanceCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            # Return the created attendance with employee details
            attendance = Attendance.objects.get(pk=serializer.instance.pk)
            response_serializer = AttendanceSerializer(attendance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {'error': 'Attendance record for this employee and date already exists.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def attendance_by_employee(request, employee_id):
    """Get attendance records for a specific employee with pagination and date filtering"""
    try:
        employee = get_object_or_404(Employee, employee_id=employee_id)
        attendance_records = Attendance.objects.filter(employee=employee).order_by('-date')
        
        # Apply date filters if provided
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        if date_from:
            attendance_records = attendance_records.filter(date__gte=date_from)
        if date_to:
            attendance_records = attendance_records.filter(date__lte=date_to)
        
        paginator = CustomPagination()
        page = paginator.paginate_queryset(attendance_records, request)
        if page is not None:
            serializer = AttendanceSerializer(page, many=True)
            response_data = paginator.get_paginated_response(serializer.data).data
            response_data['employee'] = EmployeeSerializer(employee).data
            return Response(response_data)
        
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response({
            'employee': EmployeeSerializer(employee).data,
            'results': serializer.data,
            'count': len(serializer.data),
            'total_pages': 1,
            'current_page': 1
        })
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Employee not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def attendance_list(request):
    """Get all attendance records with pagination and date filtering"""
    attendance_records = Attendance.objects.all().order_by('-date', 'employee__employee_id')
    
    # Apply date filters if provided
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    if date_from:
        attendance_records = attendance_records.filter(date__gte=date_from)
    if date_to:
        attendance_records = attendance_records.filter(date__lte=date_to)
    
    paginator = CustomPagination()
    page = paginator.paginate_queryset(attendance_records, request)
    if page is not None:
        serializer = AttendanceSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = AttendanceSerializer(attendance_records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    """Get dashboard summary data with optional month filtering"""
    try:
        today = date.today()
        
        # Check if month filter is provided
        month_filter = request.GET.get('month')
        if month_filter:
            try:
                # Parse month filter (format: YYYY-MM)
                year, month = map(int, month_filter.split('-'))
                # Get first and last day of the specified month
                from calendar import monthrange
                first_day = date(year, month, 1)
                last_day = date(year, month, monthrange(year, month)[1])
                filter_date = first_day
                month_name = first_day.strftime('%B %Y')
            except (ValueError, IndexError):
                return Response(
                    {'error': 'Invalid month format. Use YYYY-MM format.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Use current month
            first_day = today.replace(day=1)
            from calendar import monthrange
            last_day = date(today.year, today.month, monthrange(today.year, today.month)[1])
            filter_date = today
            month_name = today.strftime('%B %Y')
        
        # Basic counts
        total_employees = Employee.objects.count()
        
        # Today's attendance (or filtered date's attendance)
        today_attendance = Attendance.objects.filter(date=filter_date)
        present_today = today_attendance.filter(status='Present').count()
        absent_today = today_attendance.filter(status='Absent').count()
        
        # Calculate attendance rate for the filtered date
        attendance_rate = 0
        if total_employees > 0:
            marked_today = present_today + absent_today
            if marked_today > 0:
                attendance_rate = round((present_today / marked_today) * 100, 1)
        
        # Employee attendance summary for the filtered month
        employees = Employee.objects.all()
        employee_summary = []
        
        for employee in employees:
            # Get attendance records for the filtered month
            attendance_records = Attendance.objects.filter(
                employee=employee,
                date__gte=first_day,
                date__lte=last_day
            )
            
            total_days = attendance_records.count()
            present_days = attendance_records.filter(status='Present').count()
            absent_days = attendance_records.filter(status='Absent').count()
            
            employee_rate = 0
            if total_days > 0:
                employee_rate = round((present_days / total_days) * 100, 1)
            
            employee_summary.append({
                'employee_id': employee.employee_id,
                'full_name': employee.full_name,
                'department': employee.department,
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'attendance_rate': employee_rate
            })
        
        # Recent activity (last 10 attendance records within the filtered period)
        recent_activity = Attendance.objects.select_related('employee').filter(
            date__gte=first_day,
            date__lte=last_day
        ).order_by('-created_at')[:10]
        
        recent_activity_data = []
        for record in recent_activity:
            recent_activity_data.append({
                'employee_name': record.employee.full_name,
                'employee_id': record.employee.employee_id,
                'date': record.date,
                'status': record.status,
                'created_at': record.created_at
            })
        
        return Response({
            'summary': {
                'total_employees': total_employees,
                'present_today': present_today,
                'absent_today': absent_today,
                'attendance_rate': attendance_rate,
                'filtered_month': month_name if month_filter else None
            },
            'employee_summary': employee_summary,
            'recent_activity': recent_activity_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to load dashboard data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
