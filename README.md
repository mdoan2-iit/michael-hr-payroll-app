# Tropical ERP: HR & Payroll Module (Module 6)

Monorepo for the Human Resources module.

- `/backend`: NestJS (TypeScript) REST API using TypeORM
- `/frontend`: Next.js 14 (App Router, TypeScript) + Tailwind CSS

**Features:** central employee database and branches, daily objectives and performance reviews, leave approvals (Pending / Approved / Rejected), recruitment with job postings, candidate pipeline and auto-scored online tests (CBT), training programmes, offboarding checklists, and complaint logs.

## Prerequisites
Node.js 18+ and npm. PostgreSQL is optional: with no database configured the API uses a local SQLite file (`hr.sqlite`), so there is nothing else to install.

## Setup

### 1. Backend (`/backend`)
```bash
cd backend
cp .env.example .env
npm install
npm run seed        # optional: loads sample branches, employees, a job and test questions
npm run start:dev   # http://localhost:4000
```

### 2. Frontend (`/frontend`)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev         # http://localhost:3000
```

## Environment variables

| File | Variable | Default | Purpose |
|---|---|---|---|
| backend/.env | `PORT` | `4000` | API port |
| backend/.env | `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |
| backend/.env | `DATABASE_URL` | empty | PostgreSQL URL, e.g. `postgres://user:pass@localhost:5432/hr_payroll`. Empty = local SQLite |
| frontend/.env.local | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL of the API |

Tables are created automatically on start (`synchronize: true`). For production, switch to TypeORM migrations.

## API documentation

All bodies are JSON. Invalid input returns `400` with a list of messages; unknown ids return `404`.
Every resource below supports the same five routes (`:id` is a number):

`GET /<resource>` list (optional filters) · `GET /<resource>/:id` · `POST /<resource>` · `PATCH /<resource>/:id` · `DELETE /<resource>/:id`

| Resource | Required fields on create | Optional list filters |
|---|---|---|
| `/branches` | name, city | |
| `/employees` | firstName, lastName, email, jobTitle, department | branchId, status, department |
| `/objectives` | employeeId, date, goal | employeeId, date, status |
| `/reviews` | employeeId, reviewer, period, rating (1-5) | employeeId |
| `/leave-requests` | employeeId, type, startDate, endDate | employeeId, status |
| `/job-postings` | title, department | status |
| `/candidates` | fullName, email, jobPostingId | jobPostingId, stage |
| `/test-questions` | jobPostingId, question, options[], correctIndex | jobPostingId |
| `/trainings` | title, startDate | |
| `/complaints` | subject, details | status |

### Additional endpoints
| Method & path | Description |
|---|---|
| `PATCH /leave-requests/:id/decision` | Body `{ "status": "Approved" \| "Rejected", "decisionNote"?: string }` |
| `GET /job-postings/:id/test` | Test questions for a job, with the answer key removed |
| `POST /candidates/:id/submit-test` | Body `{ "answers": [{ "questionId": 1, "choice": 0 }] }`. Returns `{ score, correct, total }` and saves the score |
| `POST /candidates/:id/hire` | Creates an employee from the candidate and sets stage to Hired |
| `GET /exit-records` | List offboarding records |
| `POST /exit-records` | Body `{ employeeId, lastWorkingDay, reason, checklist? }`. A default checklist is added when omitted |
| `PATCH /exit-records/:id/checklist/:index` | Body `{ "done": true }`. When every item is done the employee becomes `Exited` |
| `DELETE /exit-records/:id` | Remove a record |
| `GET /dashboard` | Counts shown on the overview page |

Enums: leave status `Pending/Approved/Rejected`; leave type `Annual/Sick/Maternity/Paternity/Unpaid/Other`; employee status `Active/On leave/Exited`; candidate stage `Applied/Screening/Testing/Interview/Offered/Hired/Rejected`.

## Project structure
```
backend/src   entities/ (database models) · common/dtos.ts (validation) · common/crud.ts (REST factory) · extras.controller.ts (workflows)
frontend/app  one folder per screen · components/ (ResourcePage, forms, sidebar) · lib/api.ts (fetch helper)
```
