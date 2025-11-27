#!/bin/bash
# Database Setup Script
# Run this script to set up your database

export PATH="/Applications/Postgres.app/Contents/Versions/17/bin:$PATH"

DB_HOST="localhost"
DB_PORT="5433"
DB_USER="postgres"
DB_NAME="3005FinalProject"
DB_PASSWORD="root"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

echo "Setting up database: $DB_NAME"
echo ""

# Create database if it doesn't exist
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null && echo "✓ Database created" || echo "Database may already exist"

# Run DDL script
echo ""
echo "Running DDL script (creating tables, views, triggers)..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/DDL.sql
echo "✓ DDL script completed"

# Run DML script
echo ""
echo "Loading sample data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/DML.sql
echo "✓ Sample data loaded"

echo ""
echo "=========================================="
echo "Database setup complete!"
echo "=========================================="
echo ""
echo "Next: cd src && npm run dev"

