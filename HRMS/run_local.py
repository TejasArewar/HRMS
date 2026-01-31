#!/usr/bin/env python
"""
Local development helper script
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 HRMS Local Development Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Error: manage.py not found. Please run this script from the HRMS directory.")
        return
    
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Virtual environment not detected.")
        print("   Please activate your virtual environment first:")
        print("   myenv\\Scripts\\activate")
        print()
    
    # Try to import Django to check if it's installed
    try:
        import django
        print(f"✅ Django {django.get_version()} is available")
    except ImportError:
        print("❌ Django not found. Installing minimal requirements...")
        if not run_command("pip install Django djangorestframework psycopg2-binary", "Installing Django and dependencies"):
            print("❌ Failed to install dependencies. Please install manually:")
            print("   pip install Django djangorestframework psycopg2-binary")
            return
    
    # Check if migrations are needed
    print("\n📊 Checking database status...")
    try:
        result = subprocess.run("python manage.py showmigrations --plan", shell=True, capture_output=True, text=True)
        if "[ ]" in result.stdout:
            print("🔄 Running migrations...")
            if not run_command("python manage.py migrate", "Running database migrations"):
                print("❌ Migration failed. Please check your database configuration.")
                return
        else:
            print("✅ Database is up to date")
    except Exception as e:
        print(f"⚠️  Could not check migration status: {e}")
        print("🔄 Attempting to run migrations anyway...")
        run_command("python manage.py migrate", "Running database migrations")
    
    # Start the development server
    print("\n🌐 Starting development server...")
    print("   Server will be available at: http://127.0.0.1:8000")
    print("   Press Ctrl+C to stop the server")
    print("=" * 40)
    
    try:
        subprocess.run("python manage.py runserver", shell=True, check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Server failed to start: {e}")
        print("\n🔍 Troubleshooting tips:")
        print("1. Make sure your virtual environment is activated")
        print("2. Check if PostgreSQL is running (or switch to SQLite in settings.py)")
        print("3. Verify all dependencies are installed")

if __name__ == '__main__':
    main()