# HRMS Quick Start Guide

## 🚨 Server Not Starting? Try These Solutions:

### Option 1: Use SQLite (Easiest)

1. **Activate your virtual environment**:
   ```bash
   myenv/scripts/activate
   ```

2. **Switch to SQLite settings**:
   ```bash
   cd HRMS
   copy HRMS\settings_sqlite.py HRMS\settings.py
   ```

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Start server**:
   ```bash
   python manage.py runserver
   ```

### Option 2: Install Missing Dependencies

1. **Activate virtual environment**:
   ```bash
   myenv/scripts/activate
   ```

2. **Install minimal requirements**:
   ```bash
   cd HRMS
   pip install Django djangorestframework psycopg2-binary
   ```

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Start server**:
   ```bash
   python manage.py runserver
   ```

### Option 3: Use the Helper Script

1. **Activate virtual environment**:
   ```bash
   myenv/scripts/activate
   ```

2. **Run the helper script**:
   ```bash
   cd HRMS
   python run_local.py
   ```

## 🔧 Common Issues & Solutions:

### Issue: "No module named 'django'"
**Solution**: Virtual environment not activated or Django not installed
```bash
myenv/scripts/activate
pip install Django djangorestframework
```

### Issue: "No module named 'dj_database_url'"
**Solution**: Use SQLite settings (Option 1 above) or install the dependency
```bash
pip install dj-database-url
```

### Issue: Database connection error
**Solution**: Switch to SQLite for local development
```bash
copy HRMS\settings_sqlite.py HRMS\settings.py
python manage.py migrate
```

### Issue: "No module named 'whitenoise'"
**Solution**: The updated settings.py handles this automatically, but you can install it:
```bash
pip install whitenoise
```

## ✅ Quick Test Commands:

After the server starts, test these URLs:
- Main App: http://127.0.0.1:8000
- Admin: http://127.0.0.1:8000/admin
- API: http://127.0.0.1:8000/api/employees/

## 📝 What Changed:

I updated the project for Render deployment, which added some production dependencies. The new settings.py file:
- ✅ Works with or without the new dependencies
- ✅ Automatically detects if you're in production or development
- ✅ Falls back to your original PostgreSQL settings for local development
- ✅ Includes SQLite option for easier local development

## 🚀 For Production Deployment:

The project is ready for Render deployment with:
- `requirements.txt` - All production dependencies
- `build.sh` - Build script
- `Procfile` - Process configuration
- Production-ready settings with environment variables

Choose the option that works best for you!