# QuickKub Payment Gateway Makefile
# Usage: make <target>

.PHONY: help install dev build start stop restart logs test lint format migrate backup monitor security clean setup

# Default target
help:
	@echo "QuickKub Payment Gateway - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development environment"
	@echo "  dev-backend - Start backend only"
	@echo "  dev-frontend- Start frontend only"
	@echo "  dev-admin   - Start admin panel only"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  build       - Build all services"
	@echo "  start       - Start production environment"
	@echo "  stop        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo ""
	@echo "Monitoring:"
	@echo "  logs        - Show all logs"
	@echo "  logs-backend- Show backend logs"
	@echo "  logs-frontend- Show frontend logs"
	@echo "  logs-admin  - Show admin logs"
	@echo "  monitor     - Run all monitoring checks"
	@echo "  status      - Show service status"
	@echo ""
	@echo "Testing:"
	@echo "  test        - Run all tests"
	@echo "  test-unit   - Run unit tests"
	@echo "  test-integration - Run integration tests"
	@echo "  test-performance - Run performance tests"
	@echo "  test-smoke  - Run smoke tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo ""
	@echo "Database:"
	@echo "  migrate     - Run database migrations"
	@echo "  migrate-reset - Reset database"
	@echo "  migrate-seed - Seed database"
	@echo ""
	@echo "Backup & Security:"
	@echo "  backup      - Create backup"
	@echo "  security    - Run security scan"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Clean all build artifacts"
	@echo "  setup       - Complete setup (install + migrate + dev)"

# Development
install:
	@echo "Installing dependencies..."
	npm run install

dev:
	@echo "Starting development environment..."
	npm run dev

dev-backend:
	@echo "Starting backend..."
	npm run dev:backend

dev-frontend:
	@echo "Starting frontend..."
	npm run dev:frontend

dev-admin:
	@echo "Starting admin panel..."
	npm run dev:admin

# Build & Deploy
build:
	@echo "Building all services..."
	npm run build

start:
	@echo "Starting production environment..."
	npm run start

stop:
	@echo "Stopping all services..."
	npm run stop

restart:
	@echo "Restarting all services..."
	npm run restart

# Monitoring
logs:
	@echo "Showing all logs..."
	npm run logs

logs-backend:
	@echo "Showing backend logs..."
	npm run logs:backend

logs-frontend:
	@echo "Showing frontend logs..."
	npm run logs:frontend

logs-admin:
	@echo "Showing admin logs..."
	npm run logs:admin

monitor:
	@echo "Running monitoring checks..."
	npm run monitor

status:
	@echo "Showing service status..."
	npm run monitor:status

# Testing
test:
	@echo "Running all tests..."
	npm run test

test-unit:
	@echo "Running unit tests..."
	npm run test:unit

test-integration:
	@echo "Running integration tests..."
	npm run test:integration

test-performance:
	@echo "Running performance tests..."
	npm run test:performance

test-smoke:
	@echo "Running smoke tests..."
	npm run test:smoke

# Code Quality
lint:
	@echo "Running linting..."
	npm run lint

format:
	@echo "Formatting code..."
	npm run format

# Database
migrate:
	@echo "Running database migrations..."
	npm run migrate

migrate-reset:
	@echo "Resetting database..."
	npm run migrate:reset

migrate-seed:
	@echo "Seeding database..."
	npm run migrate:seed

# Backup & Security
backup:
	@echo "Creating backup..."
	npm run backup

security:
	@echo "Running security scan..."
	npm run security

# Maintenance
clean:
	@echo "Cleaning build artifacts..."
	npm run clean

setup:
	@echo "Setting up complete environment..."
	npm run setup

# Quick commands
up: dev
down: stop
ps: status
log: logs
t: test
l: lint
f: format
m: migrate
b: backup
s: security
c: clean
