import "./load-env.js";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const dbName = process.env.DB_NAME || "campus_connect";

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  console.error("DB_NAME may only contain letters, numbers, and underscores.");
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true,
});

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.query(`USE \`${dbName}\``);

  const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  await connection.query(schema);

  console.log(`Database "${dbName}" initialized successfully.`);
  console.log("Next step: npm run db:seed");
} catch (error) {
  console.error("Could not initialize the database.");
  console.error(error.message);
  console.error("Check that MySQL is running and the credentials in .env.local are correct.");
  process.exitCode = 1;
} finally {
  await connection.end();
}
