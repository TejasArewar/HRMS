from django.urls import path
from . import views

app_name = 'app'

urlpatterns = [
    # Frontend routes
    path('', views.index, name='index'),
    
    # API routes
    path('api/employees/', views.employee_list_create, name='employee-list-create'),
    path('api/employees/<int:pk>/', views.employee_delete, name='employee-delete'),
    path('api/attendance/', views.attendance_create, name='attendance-create'),
    path('api/attendance/list/', views.attendance_list, name='attendance-list'),
    path('api/attendance/<str:employee_id>/', views.attendance_by_employee, name='attendance-by-employee'),
    path('api/dashboard/', views.dashboard_summary, name='dashboard-summary'),
]