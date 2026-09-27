import { Router } from "express";
import { pool } from "../config/database.js";
import { asyncRoute, notFound, validateEmployee } from "../lib/http.js";

const router = Router();
const selectEmployees = `
  SELECT e.id, e.name, e.email, e.role, e.created_at AS createdAt,
    COUNT(t.id) AS taskCount,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
    SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS pendingCount
  FROM employees e LEFT JOIN tasks t ON t.employee_id = e.id`;

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const [rows] = await pool.query(
      `${selectEmployees} GROUP BY e.id ORDER BY e.name`,
    );
    res.json(rows);
  }),
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const employee = validateEmployee(req.body);
    if (typeof employee === "string")
      return res.status(400).json({ error: employee });
    const [result] = await pool.execute(
      "INSERT INTO employees (name, email, role) VALUES (?, ?, ?)",
      [employee.name, employee.email, employee.role],
    );
    const [rows] = await pool.execute(
      `${selectEmployees} WHERE e.id = ? GROUP BY e.id`,
      [result.insertId],
    );
    res.status(201).json(rows[0]);
  }),
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const employee = validateEmployee(req.body);
    if (typeof employee === "string")
      return res.status(400).json({ error: employee });
    await pool.execute(
      "UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?",
      [employee.name, employee.email, employee.role, req.params.id],
    );
    const [rows] = await pool.execute(
      `${selectEmployees} WHERE e.id = ? GROUP BY e.id`,
      [req.params.id],
    );
    if (!rows[0]) return notFound(res, "Employee not found.");
    res.json(rows[0]);
  }),
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const [result] = await pool.execute("DELETE FROM employees WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) return notFound(res, "Employee not found.");
    res.status(204).end();
  }),
);

export default router;
