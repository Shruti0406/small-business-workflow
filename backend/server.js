import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./config/database.js";
import { asyncRoute } from "./lib/http.js";
import analyticsRouter from "./routes/analytics.js";
import dashboardRouter from "./routes/dashboard.js";
import employeesRouter from "./routes/employees.js";
import tasksRouter from "./routes/tasks.js";

const app = express();
const origins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "100kb" }));
app.get(
  "/api/health",
  asyncRoute(async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  }),
);
app.use("/api/employees", employeesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use((req, res) =>
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` }),
);
app.use((error, _req, res, _next) => {
  if (error.code === "ER_DUP_ENTRY")
    return res
      .status(409)
      .json({ error: "That email address is already in use." });
  if (error.code === "ER_NO_REFERENCED_ROW_2")
    return res.status(400).json({
      error: "That employee no longer exists. Refresh and choose another.",
    });
  if (
    error.code === "ER_BAD_NULL_ERROR" ||
    error.code === "ER_TRUNCATED_WRONG_VALUE"
  )
    return res.status(400).json({ error: "One or more values are invalid." });
  if (
    error.code === "ECONNREFUSED" ||
    error.errors?.some((cause) => cause.code === "ECONNREFUSED")
  ) {
    return res.status(503).json({
      error:
        "Database unavailable. Start MySQL and check the backend/.env connection settings.",
    });
  }
  console.error(error);
  res.status(500).json({
    error:
      "The request could not be completed. Check the API and database configuration.",
  });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () =>
  console.log(`SmallBiz Flow API listening on port ${port}`),
);
