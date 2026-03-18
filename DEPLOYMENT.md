# HRMS Lite - Render Deployment Guide

## Prerequisites
- GitHub repository with your HRMS code
- Render account (https://render.com)
- PostgreSQL database on Render (already created)

## Deployment Steps

### 1. Push Code to GitHub
Make sure all your code is pushed to your GitHub repository.

### 2. Create Web Service on Render

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your HRMS repository
   - Click "Connect"

3. **Configure Web Service**
   - **Name**: `hrms-lite` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn HRMS.wsgi:application`
   - **Instance Type**: `Free` (or upgrade as needed)

4. **Set Environment Variables**
   Add these environment variables in Render dashboard:
   
   ```
   DATABASE_URL = postgresql://hrms_ym49_user:qlNd1IbNZhHIcDaAxSZzkD7kLQoz13NU@dpg-d5uttsiqcgvc7395il6g-a.oregon-postgres.render.com/hrms_ym49
   SECRET_KEY = [Generate a new secret key]
   DEBUG = false
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### 3. Database Setup

Your PostgreSQL database is already configured. The deployment will automatically:
- Install dependencies
- Collect static files
- Run database migrations

### 4. Access Your Application

Once deployed, your HRMS application will be available at:
`https://your-service-name.onrender.com`

## Features Available After Deployment

✅ **Employee Management**
- Add, view, and delete employees
- Search employees by name, ID, email, or department
- Pagination (10 employees per page)

✅ **Attendance Tracking**
- Mark daily attendance (Present/Absent)
- View attendance records with pagination
- Filter by employee and date range
- Date validation (no future dates, max 30 days back)

✅ **Dashboard Analytics**
- Summary cards (total employees, present/absent today, attendance rate)
- Employee attendance summary table with individual rates
- Recent activity feed
- Month-based filtering

✅ **Professional UI**
- Responsive design for all devices
- Smooth animations and transitions
- Professional styling with Font Awesome icons
- Real-time form validation

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `build.sh` has execute permissions
   - Verify all dependencies in `requirements.txt`

2. **Database Connection Issues**
   - Verify DATABASE_URL environment variable
   - Check database credentials

3. **Static Files Not Loading**
   - Ensure WhiteNoise is properly configured
   - Check STATIC_ROOT and STATIC_URL settings

4. **500 Internal Server Error**
   - Check Render logs for detailed error messages
   - Verify all environment variables are set

### Checking Logs:
- Go to Render Dashboard → Your Service → Logs
- Monitor deployment and runtime logs

## Post-Deployment

1. **Create Admin User** (optional):
   ```bash
   # In Render shell or locally with production database
   python manage.py createsuperuser
   ```

2. **Access Admin Panel**:
   Visit `https://your-app.onrender.com/admin/`

3. **Test All Features**:
   - Add employees
   - Mark attendance
   - View dashboard
   - Test search and filtering

## Security Notes

- DEBUG is set to False in production
- HTTPS is enforced
- CSRF protection is configured for API endpoints
- Database credentials are secured via environment variables

## Support

If you encounter any issues:
1. Check Render logs first
2. Verify environment variables
3. Test database connectivity
4. Review Django settings for production

Your HRMS Lite application is now ready for production use on Render!