#!/bin/bash

# QuickKub Payment Gateway Database Migration Script
# Usage: ./scripts/migrate.sh [action]

set -e

ACTION=${1:-run}

echo "🗄️ QuickKub Database Migration Script"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

cd backend

# Function to run migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    npm run migration:run
    echo "✅ Migrations completed successfully!"
}

# Function to generate migration
generate_migration() {
    local name=$1
    if [ -z "$name" ]; then
        echo "❌ Migration name is required"
        echo "Usage: ./scripts/migrate.sh generate <migration_name>"
        exit 1
    fi

    echo "📝 Generating migration: $name"
    npm run migration:generate -- src/database/migrations/$name
    echo "✅ Migration generated successfully!"
}

# Function to revert migration
revert_migration() {
    echo "⏪ Reverting last migration..."
    npm run migration:revert
    echo "✅ Migration reverted successfully!"
}

# Function to reset database
reset_database() {
    echo "🔄 Resetting database..."
    npm run db:reset
    echo "✅ Database reset completed!"
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database..."
    npm run seed
    echo "✅ Database seeding completed!"
}

# Main execution
case $ACTION in
    "run")
        run_migrations
        ;;
    "generate")
        generate_migration $2
        ;;
    "revert")
        revert_migration
        ;;
    "reset")
        reset_database
        ;;
    "seed")
        seed_database
        ;;
    "reset-seed")
        reset_database
        seed_database
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./scripts/migrate.sh [action]"
        echo "Available actions:"
        echo "  run           - Run pending migrations"
        echo "  generate <name> - Generate new migration"
        echo "  revert        - Revert last migration"
        echo "  reset         - Reset database (revert + run)"
        echo "  seed          - Seed database with initial data"
        echo "  reset-seed    - Reset and seed database"
        exit 1
        ;;
esac
