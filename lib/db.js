import mysql from "mysql2/promise";

const globalForDb = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "campus_connect",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
    charset: "utf8mb4",
  });
}

export const pool = globalForDb.__campusConnectPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__campusConnectPool = pool;
}

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getConnection() {
  return pool.getConnection();
}
