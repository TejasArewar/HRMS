# HRMS Quick Start Guide - Live Database Only

## 🚀 Running with Live Render Database

Your HRMS project is now configured to use **only the live Render PostgreSQL database** for both development and production.

### ✅ Simple Setup Steps:

1. **Activate your virtual environment**:
   ```bash
   myenv/scripts/activate
   ```

2. **Navigate to HRMS directory**:
   ```bash
   cd HRMS
   ```

3. **Install required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations** (if needed):
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Access your application**:
   - Main App: http://127.0.0.1:8000
   - Admin Panel: http://127.0.0.1:8000/admin

## 📊 Database Configuration

- **Database**: Live Render PostgreSQL
- **Host**: dpg-d5uttsiqcgvc7395il6g-a.oregon-postgres.render.com
- **Database Name**: hrms_ym49
- **User**: hrms_ym49_user
- **SSL**: Required (automatically configured)

## 🔧 Dependencies Required:

The minimal requirements.txt includes:
- `Django==5.1.5` - Web framework
- `djangorestframework==3.15.2` - API framework
- `psycopg2-binary==2.9.10` - PostgreSQL adapter

## 🚨 Troubleshooting:

### Issue: "No module named 'psycopg2'"
**Solution**: Install PostgreSQL adapter
```bash
pip install psycopg2-binary
```

### Issue: Database connection timeout
**Solution**: Check your internet connection - you need internet access to connect to the live database

### Issue: "relation does not exist"
**Solution**: Run migrations
```bash
python manage.py migrate
```

### Issue: Permission denied on database
**Solution**: The database credentials are configured correctly. If you get permission errors, the database might be busy or there might be connection limits.

## 🎯 What's Different:

- ✅ **Single Database**: Only uses live Render PostgreSQL
- ✅ **No Local Setup**: No need for local PostgreSQL installation
- ✅ **Simplified**: Removed complex environment variable handling
- ✅ **Production Ready**: Same database for development and production
- ✅ **SSL Secure**: Automatic SSL connection to database

## 📝 Features Available:

All HRMS features work with the live database:
- ✅ Employee Management (Add, View, Delete, Search)
- ✅ Attendance Tracking (Mark, View, Filter)
- ✅ Dashboard Analytics (Summary, Charts, Recent Activity)
- ✅ Pagination (10 records per page)
- ✅ Professional UI with animations
- ✅ Mobile responsive design

## 🚀 For Production Deployment on Render:

When deploying to Render, use the production requirements:
```bash
# Use this for Render deployment
pip install -r requirements-production.txt
```

The production requirements include additional packages for deployment:
- `dj-database-url` - Database URL parsing
- `whitenoise` - Static file serving
- `gunicorn` - WSGI server

## 💡 Benefits of Live Database:

1. **Consistent Data**: Same data in development and production
2. **No Setup**: No local database installation needed
3. **Real Testing**: Test with actual production-like environment
4. **Team Collaboration**: Shared database for team development
5. **Backup**: Render handles database backups automatically

Your HRMS is now ready to run with the live database!