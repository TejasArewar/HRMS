# HRMS Lite - Employee Management & Attendance Tracking System

A production-quality web application for managing employees and tracking daily attendance with a clean, professional interface, smooth animations, and pagination support.

## ✨ New Features

### 🎨 Enhanced UI/UX
- **Professional Design**: Modern, clean interface with smooth animations and transitions
- **Responsive Layout**: Optimized for all screen sizes with mobile-first approach
- **Font Awesome Icons**: Beautiful icons throughout the interface
- **Smooth Animations**: Fade-in effects, hover animations, and loading transitions
- **Visual Feedback**: Real-time form validation with error highlighting
- **Status Indicators**: Animated status badges for attendance records

### 📄 Pagination System
- **Employee List Pagination**: Shows 10 employees per page with navigation controls
- **Attendance Records Pagination**: Shows 10 attendance records per page
- **Smart Page Numbers**: Displays current page, total pages, and record counts
- **Navigation Controls**: Previous/Next buttons with disabled states
- **Page Jump**: Click on page numbers to jump to specific pages

### 🔍 Enhanced Functionality
- **Real-time Search**: Search employees by ID, name, email, or department
- **Form Validation**: Client-side validation with visual feedback
- **Loading States**: Professional loading indicators during API calls
- **Error Handling**: Comprehensive error messages with auto-dismiss
- **Statistics Dashboard**: Live counters for total employees and attendance records
- **Animated Counters**: Smooth number animations for statistics

## Features

### Backend (Django + Django REST Framework)
- **Employee Management**: Create, list, and delete employees with validation
- **Attendance Tracking**: Mark daily attendance with Present/Absent status
- **Pagination Support**: Server-side pagination for large datasets
- **Data Validation**: Comprehensive validation for all inputs
- **REST APIs**: Clean, well-documented API endpoints with pagination
- **Database**: PostgreSQL with proper relationships and constraints

### Frontend (Vanilla JavaScript)
- **Responsive Design**: Professional UI that works on all devices
- **Real-time Updates**: Dynamic UI updates without page reloads
- **Pagination Controls**: User-friendly pagination with page numbers
- **Search Functionality**: Real-time search across employee data
- **Error Handling**: User-friendly error messages and loading states
- **Smooth Animations**: CSS3 animations and transitions throughout
- **Form Validation**: Real-time validation with visual feedback

## Tech Stack

- **Backend**: Django 6.0.1, Django REST Framework
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Font Awesome
- **Database**: PostgreSQL (configured) / SQLite (fallback)
- **Styling**: Custom CSS with CSS Variables and modern design principles

## Installation & Setup

### Prerequisites
- Python 3.8+
- PostgreSQL (optional, SQLite works as fallback)
- Virtual environment (recommended)

### 1. Clone and Setup Virtual Environment
```bash
# Navigate to project directory
cd HRMS

# Activate virtual environment (if exists)
# Windows:
myenv\Scripts\activate
# Linux/Mac:
source myenv/bin/activate

# Install dependencies (if needed)
pip install django djangorestframework psycopg2-binary
```

### 2. Database Configuration

The project is configured for PostgreSQL by default. To use SQLite instead:

1. Edit `HRMS/settings.py`
2. Replace the DATABASES configuration with:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 5. Run the Development Server
```bash
python manage.py runserver
```

The application will be available at: `http://127.0.0.1:8000/`

## API Endpoints

### Employee Management
- `GET /api/employees/?page=1` - List employees with pagination
- `POST /api/employees/` - Create new employee
- `DELETE /api/employees/<id>/` - Delete employee

### Attendance Management
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/list/?page=1` - List all attendance records with pagination
- `GET /api/attendance/<employee_id>/?page=1` - Get attendance for specific employee with pagination

## API Usage Examples

### Get Paginated Employees
```bash
curl "http://127.0.0.1:8000/api/employees/?page=1"
```

Response:
```json
{
  "count": 25,
  "next": "http://127.0.0.1:8000/api/employees/?page=2",
  "previous": null,
  "total_pages": 3,
  "current_page": 1,
  "results": [...]
}
```

### Create Employee
```bash
curl -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP00001",
    "full_name": "Tejas Arewar",
    "email": "tejasaarewar@gmail.com",
    "department": "IT"
  }'
```

### Mark Attendance
```bash
curl -X POST http://127.0.0.1:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP00001",
    "date": "2026-01-30",
    "status": "Present"
  }'
```

## UI Features Overview

### 🎨 Visual Enhancements
- **Modern Header**: Gradient background with animated icons and live statistics
- **Professional Cards**: Clean card-based layout with hover effects
- **Smooth Transitions**: CSS3 animations for all interactions
- **Loading States**: Professional spinners and loading indicators
- **Visual Feedback**: Success/error messages with auto-dismiss
- **Responsive Design**: Mobile-first approach with breakpoints

### 📊 Dashboard Features
- **Live Statistics**: Real-time counters for employees and attendance
- **Animated Numbers**: Smooth counting animations for statistics
- **Search Functionality**: Real-time search with highlighting
- **Filter Options**: Filter attendance by employee
- **Status Badges**: Color-coded status indicators

### 📄 Pagination Features
- **Smart Navigation**: Previous/Next buttons with proper states
- **Page Numbers**: Clickable page numbers with ellipsis for large datasets
- **Record Information**: Shows "Showing X-Y of Z records"
- **Responsive Controls**: Mobile-friendly pagination controls
- **Smooth Loading**: Animated transitions between pages

### ✅ Form Validation
- **Real-time Validation**: Instant feedback as users type
- **Visual Indicators**: Red borders and error icons for invalid fields
- **Helpful Messages**: Clear, actionable error messages
- **Success Feedback**: Animated confirmations for successful actions
- **Field-specific Errors**: Targeted validation for each input type

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- **Efficient Pagination**: Server-side pagination reduces load times
- **Optimized Queries**: Database queries with select_related for performance
- **CSS Animations**: Hardware-accelerated CSS3 animations
- **Lazy Loading**: Content loads as needed
- **Minimal JavaScript**: Vanilla JS for optimal performance

## Production Considerations

For production deployment:

1. Set `DEBUG = False` in settings.py
2. Configure proper `ALLOWED_HOSTS`
3. Use environment variables for sensitive settings
4. Set up proper static file serving with CDN
5. Configure PostgreSQL with proper credentials
6. Add SSL/HTTPS configuration
7. Set up proper logging and monitoring
8. Configure backup strategies
9. Implement caching for better performance
10. Add rate limiting for API endpoints

## License

This project is built for educational and demonstration purposes.