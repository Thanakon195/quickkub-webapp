-- QuickKub Payment Gateway Database Initialization
-- This file is executed when PostgreSQL container starts for the first time
-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Set timezone
SET timezone = 'UTC';
-- Create additional databases if needed
-- CREATE DATABASE quickkub_test;
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE quickkub_db TO quickkub_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO quickkub_user;
-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO quickkub_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO quickkub_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO quickkub_user;
