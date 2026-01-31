#!/usr/bin/env python
"""
Quick script to switch to SQLite for local development
"""
import os
import shutil

def switch_to_sqlite():
    """Switch database configuration to SQLite"""
    settings_file = 'HRMS/settings.py'
    
    if not os.path.exists(settings_file):
        print("❌ Settings file not found!")
        return False
    
    # Backup original settings
    backup_file = 'HRMS/settings_backup.py'
    if not os.path.exists(backup_file):
        shutil.copy(settings_file, backup_file)
        print("✅ Created backup of original settings")
    
    # Read current settings
    with open(settings_file, 'r') as f:
        content = f.read()
    
    # Replace database configuration
    sqlite_config = '''# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

# SQLite configuration for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}'''
    
    # Find and replace the database section
    import re
    
    # Pattern to match the entire database configuration section
    db_pattern = r'# Database.*?^DATABASES = \{.*?\n\}.*?(?=\n\n|\n#|\nAUTH_PASSWORD_VALIDATORS|\Z)'
    
    new_content = re.sub(db_pattern, sqlite_config, content, flags=re.MULTILINE | re.DOTALL)
    
    # Write updated settings
    with open(settings_file, 'w') as f:
        f.write(new_content)
    
    print("✅ Switched to SQLite database configuration")
    print("📝 Original settings backed up to settings_backup.py")
    print("🚀 You can now run: python manage.py runserver")
    return True

if __name__ == '__main__':
    print("🔄 Switching to SQLite for local development...")
    switch_to_sqlite()