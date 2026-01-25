-- Demo Accounts SQL Script
-- Run this script in your PostgreSQL database to restore demo credentials
-- Passwords are bcrypt hashed with 12 rounds
-- 
-- IMPORTANT: If you prefer, you can also run: npm run db:seed (which handles IDs properly)

-- Insert or Update Admin User
INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin@example.com',
  '$2a$12$gjM.Bxn/DQkPZnYUuKapreuuYPP3bWpQxgpkXayOrmoBySWNbD1hK',
  'Admin',
  'User',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Insert or Update Club User
INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'club@example.com',
  '$2a$12$G2M4dglGee1gy1CwgqQ8qudwhzwdAFo30.zicoUsUj1/iE0G./ojW',
  'Club',
  'Manager',
  'CLUB',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Insert or Update Student User
INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'student@example.com',
  '$2a$12$P5DTmbh9LdVP5G7qChJPoeHrO/Z.bAJgbHcOWn1oaAbFk42/jMEoG',
  'John',
  'Doe',
  'STUDENT',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Demo Credentials:
-- Admin: admin@example.com / admin123
-- Club: club@example.com / club123
-- Student: student@example.com / student123
