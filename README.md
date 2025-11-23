# Health and Fitness Club Management System

A comprehensive database-driven platform for managing a modern fitness center with support for members, trainers, and administrative staff.

## 🏗️ Project Structure

```
fitness-club-system/
├── database/          # SQL scripts (DDL and DML)
├── src/               # Backend API (Node.js + TypeScript + Prisma)
│   ├── src/          # Source code
│   ├── prisma/       # Prisma schema and migrations
│   └── package.json
├── client/           # Frontend (React + TypeScript + Vite)
│   ├── src/         # React components
│   └── package.json
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
   ```bash
   # Create database
   createdb fitness_club
   
   # Run DDL script
   psql -d fitness_club -f database/DDL.sql
   
   # Load sample data
   psql -d fitness_club -f database/DML.sql
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
   # Backend
   cd src
   cp .env.example .env
   # Edit .env with your database credentials
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
   # Frontend: npm run dev:client (runs on http://localhost:3000)
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
- **17 Tables** with comprehensive relationships
- **3 Views** (Member Dashboard, Trainer Schedule, Room Utilization)
- **5 Triggers** for business logic automation
- **20+ Indexes** for performance optimization
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

(To be documented as endpoints are implemented)

## 🎯 Project Requirements

This project fulfills all requirements for COMP 3005:
- ✅ Minimum operations per role (Member: 4+, Trainer: 2+, Admin: 2+)
- ✅ ER Diagram with proper relationships
- ✅ Relational database design
- ✅ Views, Triggers, and Indexes
- ✅ ORM implementation (Prisma)
- ✅ Role-based access control
- ✅ Business logic enforcement

## 📚 Documentation

- Database schema documentation in `database/DDL.sql`
- API documentation (to be added)
- Component documentation (to be added)

## 👥 Team

Solo Project - Omer Mohhiuddin

## 📅 Timeline

- **Due Date**: December 1, 2025 (11:59 PM)
- **Status**: In Development

## 📄 License

This project is for academic purposes only.

