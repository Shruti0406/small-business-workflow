import mysql from "mysql2/promise";

const missingSettings = ["DB_USER", "DB_NAME"].filter(
  (key) => !process.env[key],
);
if (missingSettings.length) {
  throw new Error(
    `Missing required database settings: ${missingSettings.join(", ")}`,
  );
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});
