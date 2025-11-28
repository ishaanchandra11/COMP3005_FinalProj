# Health and Fitness Club Management System

A comprehensive database-driven platform for managing a modern fitness center with support for members, trainers, and administrative staff.

## 🏗️ Project Structure

```
fitness-club-system/
├── database/          # SQL scripts (DDL and DML)
│   ├── DDL.sql       # Database schema
│   └── DML.sql       # Sample data
├── src/               # Backend API (Node.js + TypeScript + Prisma)
│   ├── src/          # Source code
│   ├── prisma/       # Prisma schema
│   ├── .env          # Environment variables
│   └── package.json
├── client/           # Frontend (React + TypeScript + Vite)
│   ├── src/         # React components
│   └── package.json
├── setup-database.sh # Database setup script
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-club-system
   ```

2. **Set up PostgreSQL Database**
   
   **Option A: Use the setup script (Recommended)**
   ```bash
   chmod +x setup-database.sh
   ./setup-database.sh
   ```
   
   **Option B: Manual setup**
   ```bash
   # Create database (adjust port/password as needed)
   createdb -h localhost -p 5433 -U postgres 3005FinalProject
   
   # Run DDL script
   psql -h localhost -p 5433 -U postgres -d 3005FinalProject -f database/DDL.sql
   
   # Load sample data
   psql -h localhost -p 5433 -U postgres -d 3005FinalProject -f database/DML.sql
   ```

3. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd src && npm install
   
   # Install frontend dependencies
   cd ../client && npm install
   ```

4. **Configure Environment Variables**
   ```bash
   # Backend - create .env file in src/ directory
   cd src
   # Create .env file with the following variables:
   # DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/3005FinalProject?schema=public"
   # JWT_SECRET="your-secret-key-here"
   # PORT=3001
   # NODE_ENV=development
   ```

5. **Set up Prisma**
   ```bash
   cd src
   npm run db:generate
   npm run db:push
   ```

6. **Run the Application**
   ```bash
   # From root directory - runs both backend and frontend
   npm run dev
   
   # Or run separately:
   # Backend: npm run dev:server (runs on http://localhost:3001)
   # Frontend: npm run dev:client (runs on http://localhost:5173)
   ```

## 🧪 Testing

### Test Credentials

All test accounts use the password: **`password123`**

#### Member Accounts
- `john.doe@email.com` / `password123`
- `jane.smith@email.com` / `password123`
- `mike.johnson@email.com` / `password123`
- `sarah.williams@email.com` / `password123`
- `david.brown@email.com` / `password123`
- `emily.davis@email.com` / `password123`
- `chris.miller@email.com` / `password123`
- `lisa.wilson@email.com` / `password123`
- `robert.moore@email.com` / `password123`
- `amanda.taylor@email.com` / `password123`
- `james.anderson@email.com` / `password123`
- `jennifer.thomas@email.com` / `password123`
- `william.jackson@email.com` / `password123`
- `michelle.white@email.com` / `password123`
- `daniel.harris@email.com` / `password123`
- `stephanie.martin@email.com` / `password123`
- `matthew.thompson@email.com` / `password123`
- `nicole.garcia@email.com` / `password123`
- `kevin.martinez@email.com` / `password123`
- `rachel.robinson@email.com` / `password123`

#### Trainer Accounts
- `trainer.alex@fitness.com` / `password123` (Alex Martinez - Strength/HIIT)
- `trainer.maria@fitness.com` / `password123` (Maria Rodriguez - Yoga/Pilates)
- `trainer.james@fitness.com` / `password123` (James Wilson - Cardio)
- `trainer.sophia@fitness.com` / `password123` (Sophia Chen - HIIT)
- `trainer.michael@fitness.com` / `password123` (Michael Thompson - Strength)
- `trainer.emily@fitness.com` / `password123` (Emily Johnson - Dance/Zumba)

#### Admin Accounts
- `admin.sarah@fitness.com` / `password123` (Sarah Anderson - Operations)
- `admin.mark@fitness.com` / `password123` (Mark Davis - Maintenance)
- `admin.lisa@fitness.com` / `password123` (Lisa Brown - Billing)
- `admin.david@fitness.com` / `password123` (David Miller - Operations)

### Testing Process

1. **Start the Application**
   - Ensure both backend and frontend servers are running
   - Backend should be accessible at `http://localhost:3001`
   - Frontend should be accessible at `http://localhost:5173`

2. **Test Authentication**
   - Navigate to the login page
   - Test login with different user roles (member, trainer, admin)
   - Verify that users are redirected to the appropriate dashboard based on their role
   - Test invalid credentials to ensure error handling works

3. **Test Member Features**
   - Log in as a member (e.g., `john.doe@email.com`)
   - Test dashboard view and data display
   - Test profile management (view and update)
   - Test health metrics (add new entries, view history)
   - Test fitness goals (create, view, update goals)
   - Test personal training session booking
   - Test group class registration
   - Test billing and payment processing

4. **Test Trainer Features**
   - Log in as a trainer (e.g., `trainer.alex@fitness.com`)
   - Test availability management (set, view, delete availability)
   - Test schedule view (should show PT sessions and group classes)
   - Test member lookup and search functionality
   - Verify read-only access to member information

5. **Test Admin Features**
   - Log in as an admin (e.g., `admin.sarah@fitness.com`)
   - Test admin dashboard and statistics
   - Test room management (create, view, update rooms)
   - Test equipment management and maintenance logs
   - Test class schedule management (create, update, cancel schedules)
   - Test billing management (create bills, process payments)
   - Test viewing all members and trainers

6. **Test Database Features**
   - Verify views are working:
     - `member_dashboard_view` - aggregates member data
     - `trainer_schedule_view` - combines trainer schedules
     - `room_utilization_view` - shows room usage statistics
   - Test triggers:
     - Class capacity updates automatically on registration
     - Room conflict prevention
     - Bill status updates (overdue detection)
     - Tax and total calculations
   - Test data integrity:
     - Foreign key constraints
     - Check constraints
     - Historical data preservation

### Comprehensive Testing Guide

For detailed step-by-step testing instructions, see `TESTING_SCRIPT.md` in the project root. This document includes:
- Detailed test cases for all features
- Expected results for each test
- Database verification queries
- Bug reporting guidelines

## 📋 Features

### Member Functions
- ✅ User Registration
- ✅ Profile Management
- ✅ Health Metrics Tracking (Historical)
- ✅ Fitness Goals Management
- ✅ Dashboard View
- ✅ Personal Training Session Scheduling
- ✅ Group Class Registration

### Trainer Functions
- ✅ Availability Management
- ✅ Schedule View
- ✅ Member Lookup (Read-only)

### Admin Functions
- ✅ Room Booking Management
- ✅ Equipment Maintenance Tracking
- ✅ Class Schedule Management
- ✅ Billing & Payment Processing

## 🗄️ Database Schema

The database includes:
- **17 Tables** with comprehensive relationships (8 minimum required for team of 2)
- **23 Relationships** via foreign keys (8 minimum required for team of 2)
- **3 Views** (Member Dashboard, Trainer Schedule, Room Utilization)
- **8 Triggers** for business logic automation
- **34 Indexes** for performance optimization
- **ENUM Types** for data consistency
- **CHECK Constraints** for data integrity

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM (10% bonus!)
- PostgreSQL
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Zustand (State Management)

## 📝 API Endpoints

The API is available at `http://localhost:3001/api` with the following main routes:

- **Authentication**: `/api/auth/*` (register, login, me)
- **Members**: `/api/members/*` (dashboard, profile, health metrics, goals, etc.)
- **Trainers**: `/api/trainers/*` (schedule, availability, member search)
- **Admins**: `/api/admin/*` (dashboard, rooms, equipment, classes, billing)

## 🎯 Project Requirements

This project fulfills all requirements for COMP 3005 (Team of 2):
- ✅ **Entities:** 17 entities (8 minimum required) ✅
- ✅ **Relationships:** 23 relationships (8 minimum required) ✅
- ✅ **Operations:** 13 total operations (10 minimum required) ✅
  - Member: 6 operations (4 minimum required) ✅
  - Trainer: 3 operations (2 minimum required) ✅
  - Admin: 4 operations (2 minimum required) ✅
- ✅ **Views:** 3 views (1 minimum required) ✅
- ✅ **Triggers:** 8 triggers (1 minimum required) ✅
- ✅ **Indexes:** 34 indexes (1 minimum required) ✅
- ✅ ER Diagram with proper relationships
- ✅ Relational database design (normalized to 3NF)
- ✅ ORM implementation (Prisma) - **10% bonus eligible** ✅
- ✅ Role-based access control
- ✅ Business logic enforcement

## 📚 Documentation

- Database schema documentation in `database/DDL.sql`
- Sample data and migrations in `database/DML.sql`
- Database setup script: `setup-database.sh`

## 👥 Team

Team of 2 - Omer Mohhiuddin and Ishaan Chandra 

## 📅 Timeline

- **Due Date**: December 1, 2025 (11:59 PM)
- **Status**: Completed ✅

## 📄 License

This project is for academic purposes only.

