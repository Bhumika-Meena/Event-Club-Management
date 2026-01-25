const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateSQL() {
  console.log('Generating SQL scripts for demo accounts...\n');

  // Generate bcrypt hashes
  const adminPassword = await bcrypt.hash('admin123', 12);
  const clubPassword = await bcrypt.hash('club123', 12);
  const studentPassword = await bcrypt.hash('student123', 12);

  // Generate SQL statements
  const sqlStatements = `
-- Demo Accounts SQL Script
-- Run this script in your PostgreSQL database to restore demo credentials
-- Passwords are bcrypt hashed with 12 rounds

-- Insert Admin User
INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'admin@example.com',
  '${adminPassword}',
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
  role = EXCLUDED.role;

-- Insert Club User
INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'club_' || gen_random_uuid()::text,
  'club@example.com',
  '${clubPassword}',
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
  role = EXCLUDED.role;

-- Insert Student User
INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'student_' || gen_random_uuid()::text,
  'student@example.com',
  '${studentPassword}',
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
  role = EXCLUDED.role;

-- Demo Credentials:
-- Admin: admin@example.com / admin123
-- Club: club@example.com / club123
-- Student: student@example.com / student123
`;

  console.log(sqlStatements);

  // Also save to file
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', 'demo-accounts.sql');
  fs.writeFileSync(filePath, sqlStatements);
  console.log(`\n✅ SQL script saved to: ${filePath}`);
  console.log('\nYou can now run this SQL script in pgAdmin or psql to restore demo accounts.\n');
}

generateSQL()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating SQL:', error);
    process.exit(1);
  });
