# Restore Demo Accounts

After updating the database schema, you can restore demo accounts using one of these methods:

## Method 1: Run SQL Script (Quick)

1. Open **pgAdmin 4** or your PostgreSQL client
2. Connect to your `event_club_db` database
3. Open the query tool
4. Copy and paste the contents of `backend/demo-accounts.sql`
5. Execute the script (F5 or Run button)

The script will insert or update the demo accounts with their passwords.

## Method 2: Use Seed Script (Recommended)

This method also creates a sample club and events:

```bash
cd backend
npm run db:seed
```

This runs `backend/src/seed.js` which uses Prisma to properly handle CUID generation.

## Demo Credentials

After running either method, you can login with:

- **Admin:** `admin@example.com` / `admin123`
- **Club:** `club@example.com` / `club123`
- **Student:** `student@example.com` / `student123`

## Note

The SQL script uses `ON CONFLICT` to update existing accounts if they already exist, so it's safe to run multiple times.
