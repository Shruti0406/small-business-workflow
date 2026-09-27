import { Router } from "express";
import { pool } from "../config/database.js";
import { asyncRoute } from "../lib/http.js";

const router = Router();
router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const [[stats]] = await pool.query(`SELECT COUNT(*) AS totalTasks,
    SUM(status = 'Completed') AS completedTasks, SUM(status = 'Pending') AS pendingTasks,
    SUM(status = 'In Progress') AS inProgressTasks,
    SUM(deadline < CURDATE() AND status <> 'Completed') AS overdueTasks FROM tasks`);
    const [employees] =
      await pool.query(`SELECT e.id, e.name, e.role, COUNT(t.id) AS taskCount,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
    SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS pendingCount,
    SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount
    FROM employees e LEFT JOIN tasks t ON t.employee_id = e.id GROUP BY e.id ORDER BY taskCount DESC, e.name`);
    const total = Number(stats.totalTasks || 0);
    res.json({
      stats: Object.fromEntries(
        Object.entries(stats).map(([key, value]) => [key, Number(value || 0)]),
      ),
      completionRate: total
        ? Math.round((Number(stats.completedTasks || 0) / total) * 100)
        : 0,
      employees,
    });
  }),
);
export default router;
