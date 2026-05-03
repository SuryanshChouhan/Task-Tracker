# 🤖 Agent Prompt — Team Task Manager (Full-Stack)

## Your Task
Build a **full-stack Team Task Manager web app** with role-based access control. Deliver working, production-ready code with clear folder structure.

---

## 🏗️ Tech Stack (choose one set)
| Layer | Option A | Option B |
|-------|----------|----------|
| Backend | Node.js + Express | Python + FastAPI |
| Database | PostgreSQL (SQL) | MongoDB (NoSQL) |
| Auth | JWT + bcrypt | JWT + bcrypt |
| Frontend | React + TailwindCSS | React + TailwindCSS |

---

## 📁 Required Folder Structure

```
/client         → React frontend
/server
  /routes       → API route files
  /controllers  → Business logic
  /models       → DB schemas/models
  /middlewares  → Auth, role guards
  /config       → DB connection, env
.env.example
README.md
```

---

## 🔐 Auth Module
- `POST /api/auth/signup` — Register with name, email, password, role (`admin` | `member`)
- `POST /api/auth/login` — Return signed JWT
- Middleware: `verifyToken`, `requireAdmin`
- Hash passwords with **bcrypt**; never store plaintext

---

## 📦 Data Models

### User
```
id, name, email, passwordHash, role (admin|member), createdAt
```

### Project
```
id, name, description, ownerId (Admin), memberIds[], createdAt
```

### Task
```
id, title, description, projectId, assigneeId, status (todo|in-progress|done),
dueDate, priority (low|medium|high), createdAt, updatedAt
```

---

## 🌐 REST API Endpoints

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | All authenticated |
| POST | `/api/projects` | Admin only |
| PUT | `/api/projects/:id` | Admin only |
| DELETE | `/api/projects/:id` | Admin only |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks?projectId=` | All authenticated |
| POST | `/api/tasks` | Admin only |
| PUT | `/api/tasks/:id` | Admin or Assignee |
| DELETE | `/api/tasks/:id` | Admin only |

### Dashboard
| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/dashboard` | My tasks, overdue count, status summary |

---

## 🎨 Frontend Pages

| Page | Features |
|------|----------|
| `/signup` & `/login` | Form, JWT stored in localStorage |
| `/dashboard` | Stats cards: total tasks, by status, overdue |
| `/projects` | List all projects; Admin can create/delete |
| `/projects/:id` | Task board (Kanban or list); filter by status/assignee |
| `/tasks/new` | Form: title, desc, assignee, due date, priority |

---

## ✅ Validations
- All fields required where marked; email format enforced
- `dueDate` must be a future date on creation
- `status` and `priority` must be from allowed enum values
- Return structured errors: `{ field, message }`

---

## 🔒 Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete projects | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| View all projects & tasks | ✅ | ✅ |
| View dashboard | ✅ | ✅ (filtered to self) |

---

## 📋 Deliverables Checklist
- [ ] Working backend with all API endpoints
- [ ] Database schema / migrations or seed script
- [ ] JWT auth with role middleware
- [ ] React frontend with all pages wired to API
- [ ] `.env.example` with required variables
- [ ] `README.md` with setup & run instructions
- [ ] Input validation on all endpoints
- [ ] Error handling middleware (global)

---

## ⚡ Implementation Order (follow this sequence)
1. DB schema + models
2. Auth routes (signup/login + middleware)
3. Project CRUD routes + role guards
4. Task CRUD routes + role guards
5. Dashboard aggregation endpoint
6. React app: auth pages → dashboard → projects → tasks
7. Connect frontend to API; add loading/error states
8. Test all role scenarios; write README

---

## 🚫 Constraints
- No placeholder `// TODO` left in final code
- No hardcoded secrets — use `.env`
- All API responses in JSON: `{ success, data, error }`
- Frontend must handle unauthenticated state (redirect to `/login`)
