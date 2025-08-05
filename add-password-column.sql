-- Migration to add password column to users table
-- This adds the password field needed for simple authentication

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR;
