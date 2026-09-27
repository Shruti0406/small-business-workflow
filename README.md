# Daymark

Daymark is a small-business workflow MVP for organizing tasks, deadlines, and team ownership. It uses React, Vite, Tailwind CSS, React Router, an Express REST API, and MySQL.

## Requirements

- Node.js 20.19+ or 22.12+
- MySQL 8.0+ or XAMPP MariaDB

## Run locally

1. Start MySQL in the XAMPP Control Panel. The default XAMPP connection is `127.0.0.1:3306`, user `root`, with a blank password. If your XAMPP root account has a password or uses another port, update `backend/.env`.

2. Create the database and load the demo records:

   ```powershell
   mysql -u root -p < database.sql
   ```

3. Copy `.env.example` to `backend/.env` if it does not already exist. It contains the default XAMPP values; keep real credentials in `backend/.env` only.

4. Install dependencies:

   ```powershell
   npm install --prefix backend
   npm install --prefix frontend
   ```

5. Start the API and frontend in separate terminals from the project root:

   ```powershell
   npm run dev:backend
   npm run dev:frontend
   ```

6. Open the Vite URL printed in the frontend terminal (normally `http://localhost:5173`). The API listens on `http://localhost:4000`; check `http://localhost:4000/api/health` to confirm MySQL connectivity.

## Demo data

`database.sql` creates `employees` and `tasks`, links tasks to employees, and seeds Rahul (Sales), Priya (Marketing), Amit (Operations), and eight realistic tasks. The sample includes completed work, upcoming deadlines, and overdue tasks. Deadline dates are relative to the day the script runs, so the demo stays useful over time.

## API routes

- `GET /api/health`
- `GET|POST /api/employees`
- `PUT|DELETE /api/employees/:id`
- `GET /api/tasks` (supports `search`, `status`, `priority`, `employeeId`, and `overdue=true`)
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `GET /api/dashboard`
- `GET /api/analytics`

The API uses parameterized SQL and a MySQL connection pool. Overdue means the deadline is before the current database date and the task is not completed. Deleting an employee leaves their tasks in place as unassigned.

## Checks

```powershell
npm run lint
npm run build
```

The frontend reads `VITE_API_URL` when set; otherwise it requests `http://localhost:4000/api`.
