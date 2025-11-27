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

