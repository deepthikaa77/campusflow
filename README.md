# CampusFlow - Campus Management System

## Setup Instructions

### 1. Database Setup
```bash
# Import the database schema
mysql -u root -p < campusflow/databaseMysql_fixed.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
# Update .env file with your database credentials
npm run dev
```

### 3. Test API
```bash
# Register a user
POST http://localhost:5000/api/auth/register
{
  "email": "admin@campus.com",
  "password": "password123",
  "name": "Admin User",
  "phone_number": "1234567890",
  "role": "STAFF"
}

# Login
POST http://localhost:5000/api/auth/login
{
  "email": "admin@campus.com",
  "password": "password123"
}
```

## Next Steps

