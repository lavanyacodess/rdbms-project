import "./load-env.js";
import mysql from "mysql2/promise";

const [email, clubIdArg] = process.argv.slice(2);
const clubId = Number(clubIdArg);

if (!email || !clubIdArg || !Number.isInteger(clubId) || clubId <= 0) {
  console.error("Usage: npm run admin:grant -- student@example.com <club_id>");
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "campus_connect",
});

try {
  const [users] = await connection.execute(
    "SELECT user_id, name, email FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  const user = users[0];

  if (!user) {
    console.error(`No user found for ${email}. Register the account first.`);
    process.exitCode = 1;
  } else {
    const [clubs] = await connection.execute(
      "SELECT club_id, club_name FROM clubs WHERE club_id = ? LIMIT 1",
      [clubId],
    );
    const club = clubs[0];

    if (!club) {
      console.error(`No club found with id ${clubId}.`);
      process.exitCode = 1;
    } else {
      await connection.execute(
        `INSERT INTO club_members (user_id, club_id, role, status)
         VALUES (?, ?, 'ADMIN', 'APPROVED')
         ON DUPLICATE KEY UPDATE role = 'ADMIN', status = 'APPROVED'`,
        [user.user_id, club.club_id],
      );
      console.log(`${user.name} is now an approved admin of ${club.club_name}.`);
    }
  }
} catch (error) {
  console.error("Could not grant club admin access.");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
