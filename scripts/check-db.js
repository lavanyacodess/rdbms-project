import "./load-env.js";
import mysql from "mysql2/promise";

const dbName = process.env.DB_NAME || "campus_connect";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: dbName,
});

try {
  const [versionRows] = await connection.query("SELECT VERSION() AS version");
  const [counts] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM clubs) AS clubs,
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM announcements) AS announcements
  `);

  console.log(`Connected to MySQL ${versionRows[0].version} (${dbName}).`);
  console.log(
    `Rows: ${counts[0].users} users, ${counts[0].clubs} clubs, ${counts[0].events} events, ${counts[0].announcements} announcements.`,
  );
} catch (error) {
  console.error("Database check failed.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
