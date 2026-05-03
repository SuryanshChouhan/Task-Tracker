# Task Management System

Full-stack task management system with role-based access control (Super Admin, Admin, Member).

## Tech Stack
- Backend: Node.js, Express, PostgreSQL
- Frontend: React, TailwindCSS
- Auth: JWT + bcrypt

## Project Structure
```
/client
/server
  /routes
  /controllers
  /models
  /middlewares
  /config
  /migrations
.env.example
README.md
```

## Setup

### 1) Configure environment variables
Copy `.env.example` into `.env` in the project root and update values. Then create `client/.env` with:
```
VITE_API_URL=http://localhost:4000
```

### 2) Database schema
Run the reset migration using psql (this recreates tables):
```
psql "${DATABASE_URL}" -f server/migrations/003_reset.sql
```

### 3) Backend
```
cd server
npm install
npm run dev
```

### 4) Frontend
```
cd client
npm install
npm run dev
```

## API Notes
- All responses follow `{ success, data, error }`.
- Errors use `{ field, message }` format.
- Protected routes require `Authorization: Bearer <token>`.

## Role Rules
- Super Admin can view all users and assign roles.
- Admins can create tasks, assign tasks, and manage teams.
- Members can update status of their own tasks.
- Dashboard returns role-specific summaries.

## Common Troubleshooting
- Ensure PostgreSQL is running and `DATABASE_URL` is valid.
- If CORS errors appear, verify `CLIENT_URL` matches the frontend origin.
