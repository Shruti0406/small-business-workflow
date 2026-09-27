import mysql from "mysql2/promise";

const missingSettings = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"].filter(
  (key) => !process.env[key],
);

if (missingSettings.length) {
  throw new Error(
    `Missing required database settings: ${missingSettings.join(", ")}`,
  );
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});
