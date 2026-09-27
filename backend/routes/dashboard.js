import { Router } from "express";
import { pool } from "../config/database.js";
import { asyncRoute } from "../lib/http.js";

const router = Router();
const taskRows = `SELECT t.id, t.title, t.priority, t.status, t.deadline, e.name AS employeeName,
  (t.deadline < CURDATE() AND t.status <> 'Completed') AS overdue
  FROM tasks t LEFT JOIN employees e ON e.id = t.employee_id`;

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const [[stats]] = await pool.query(`SELECT COUNT(*) AS totalTasks,
    SUM(status = 'Pending') AS pendingTasks, SUM(status = 'In Progress') AS inProgressTasks,
    SUM(status = 'Completed') AS completedTasks,
    SUM(deadline < CURDATE() AND status <> 'Completed') AS overdueTasks,
    (SELECT COUNT(*) FROM employees) AS totalEmployees FROM tasks`);
    const [recentTasks] = await pool.query(
      `${taskRows} ORDER BY t.created_at DESC LIMIT 6`,
    );
    const [upcomingDeadlines] = await pool.query(
      `${taskRows} WHERE t.deadline >= CURDATE() AND t.status <> 'Completed' ORDER BY t.deadline LIMIT 5`,
    );
    const [overdueTasks] = await pool.query(
      `${taskRows} WHERE t.deadline < CURDATE() AND t.status <> 'Completed' ORDER BY t.deadline LIMIT 5`,
    );
    const [employees] =
      await pool.query(`SELECT e.id, e.name, e.role, COUNT(t.id) AS taskCount,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completedCount
    FROM employees e LEFT JOIN tasks t ON t.employee_id = e.id GROUP BY e.id ORDER BY taskCount DESC, e.name LIMIT 5`);
    const total = Number(stats.totalTasks || 0);
    res.json({
      stats: Object.fromEntries(
        Object.entries(stats).map(([key, value]) => [key, Number(value || 0)]),
      ),
      completionRate: total
        ? Math.round((Number(stats.completedTasks || 0) / total) * 100)
        : 0,
      recentTasks,
      upcomingDeadlines,
      overdueTasks,
      employees,
    });
  }),
);

export default router;
