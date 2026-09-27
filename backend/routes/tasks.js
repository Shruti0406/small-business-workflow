import { Router } from "express";
import { pool } from "../config/database.js";
import { asyncRoute, notFound, validateTask } from "../lib/http.js";

const router = Router();
const selectTasks = `
  SELECT t.id, t.title, t.description, t.employee_id AS employeeId,
    t.priority, t.status, t.deadline, t.created_at AS createdAt,
    e.name AS employeeName,
    (t.deadline < CURDATE() AND t.status <> 'Completed') AS overdue
  FROM tasks t LEFT JOIN employees e ON e.id = t.employee_id`;
async function getTask(id) {
  const [rows] = await pool.execute(`${selectTasks} WHERE t.id = ?`, [id]);
  return rows[0];
}

router.get(
  "/",
  asyncRoute(async (req, res) => {
    const clauses = [];
    const values = [];
    const { search, status, priority, employeeId, overdue } = req.query;
    if (typeof search === "string" && search.trim()) {
      clauses.push("t.title LIKE ?");
      values.push(`%${search.trim().slice(0, 160)}%`);
    }
    if (["Pending", "In Progress", "Completed"].includes(status)) {
      clauses.push("t.status = ?");
      values.push(status);
    }
    if (["Low", "Medium", "High"].includes(priority)) {
      clauses.push("t.priority = ?");
      values.push(priority);
    }
    if (employeeId && /^\d+$/.test(employeeId)) {
      clauses.push("t.employee_id = ?");
      values.push(Number(employeeId));
    }
    if (overdue === "true")
      clauses.push("t.deadline < CURDATE() AND t.status <> 'Completed'");
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute(
      `${selectTasks} ${where} ORDER BY overdue DESC, t.deadline ASC, t.created_at DESC`,
      values,
    );
    res.json(rows);
  }),
);

router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const task = await getTask(req.params.id);
    if (!task) return notFound(res, "Task not found.");
    res.json(task);
  }),
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const task = validateTask(req.body);
    if (typeof task === "string") return res.status(400).json({ error: task });
    const [result] = await pool.execute(
      "INSERT INTO tasks (title, description, employee_id, priority, status, deadline) VALUES (?, ?, ?, ?, ?, ?)",
      [
        task.title,
        task.description,
        task.employeeId,
        task.priority,
        task.status,
        task.deadline,
      ],
    );
    res.status(201).json(await getTask(result.insertId));
  }),
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const task = validateTask(req.body);
    if (typeof task === "string") return res.status(400).json({ error: task });
    await pool.execute(
      "UPDATE tasks SET title = ?, description = ?, employee_id = ?, priority = ?, status = ?, deadline = ? WHERE id = ?",
      [
        task.title,
        task.description,
        task.employeeId,
        task.priority,
        task.status,
        task.deadline,
        req.params.id,
      ],
    );
    const updated = await getTask(req.params.id);
    if (!updated) return notFound(res, "Task not found.");
    res.json(updated);
  }),
);

router.patch(
  "/:id/status",
  asyncRoute(async (req, res) => {
    if (!["Pending", "In Progress", "Completed"].includes(req.body.status))
      return res.status(400).json({ error: "Choose a valid status." });
    await pool.execute("UPDATE tasks SET status = ? WHERE id = ?", [
      req.body.status,
      req.params.id,
    ]);
    const updated = await getTask(req.params.id);
    if (!updated) return notFound(res, "Task not found.");
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) return notFound(res, "Task not found.");
    res.status(204).end();
  }),
);

export default router;
