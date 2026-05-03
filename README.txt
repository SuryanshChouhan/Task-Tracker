ETHARA Task Tracker

A full-stack team task manager with role-based access control, team and project tracking, and role-specific dashboards.

Live URL: https://task-tracker-production-d2d1.up.railway.app/

Demo Accounts
- Super Admin
  - Email: suryansh@super.com
  - Password: qwert12
- Member
  - Email: amanmember@member.com
  - Password: member12

Features
- JWT authentication with bcrypt password hashing
- Role-based access control: super_admin, admin, member
- Admin tooling for teams, projects, tasks, and member assignment
- Member task updates (status only)
- Role-specific dashboards with task status summaries and performance views
- Project and team membership management

Tech Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT + bcrypt

Project Structure
/client
  /src
    /api
    /components
    /context
    /pages
/server
  /controllers
  /middlewares
  /models
  /routes
  /migrations
.env.example
README.md
README.txt

API Overview
Base path: /api

Auth
- POST /auth/signup
- POST /auth/login

Dashboard
- GET /dashboard

Projects
- GET /projects
- POST /projects (admin, super_admin)
- PUT /projects/:id (admin, super_admin)
- DELETE /projects/:id (admin, super_admin)

Teams
- GET /teams
- POST /teams (admin, super_admin)
- PUT /teams/:id (admin, super_admin)
- DELETE /teams/:id (admin, super_admin)

Tasks
- GET /tasks
- POST /tasks (admin, super_admin)
- PUT /tasks/:id
- DELETE /tasks/:id (admin, super_admin)

Users
- GET /users (super_admin)
- PUT /users/:id/role (super_admin)
- PUT /users/:id/team (admin, super_admin)

Response format:
{
  "success": true,
  "data": { ... },
  "error": null
}

Errors:
{
  "success": false,
  "data": null,
  "error": { "field": "...", "message": "..." }
}

Database Schema
Primary tables:
- users (role: super_admin | admin | member)
- teams, team_members
- projects, project_members, project_teams
- tasks (status: pending | in_progress | completed, priority: low | medium | high)

Run the reset migration (drops and recreates tables):
psql "${DATABASE_URL}" -f server/migrations/003_reset.sql

Environment Variables
Root .env (server):
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/team_task_manager
JWT_SECRET=replace_with_secure_secret
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000
SUPER_ADMIN_EMAIL=suryansh@super.com
SUPER_ADMIN_PASSWORD=qwert12

Client .env (client/.env):
VITE_API_URL=http://localhost:4000

Notes:
- SUPER_ADMIN_* is used at startup to seed the first super admin if none exists.
- CLIENT_URL must match the frontend origin for CORS.

Local Setup
1) Install dependencies
cd server
npm install
cd ../client
npm install

2) Run backend
cd server
npm run dev

3) Run frontend
cd client
npm run dev

Scripts
Client
- npm run dev
- npm run build
- npm run preview

Server
- npm run dev
- npm start

Troubleshooting
- 401 after login usually means token missing or invalid; clear site data and log in again.
- CORS errors: verify CLIENT_URL matches the frontend URL.
