import "./load-env.js";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const dbName = process.env.DB_NAME || "campus_connect";

function mysqlDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(":");
}

function daysFromNow(days, hour = 18) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return mysqlDate(date);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: dbName,
});

try {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const studentPassword = await bcrypt.hash("Student@123", 12);

  await connection.beginTransaction();
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of [
    "event_registrations",
    "announcements",
    "events",
    "club_members",
    "clubs",
    "users",
  ]) {
    await connection.query(`TRUNCATE TABLE \`${table}\``);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  const users = [
    ["Aarav Mehta", "admin@campusconnect.test", adminPassword, "Computer Science", 3],
    ["Priya Sharma", "student@campusconnect.test", studentPassword, "Information Technology", 2],
    ["Rohan Verma", "rohan@campusconnect.test", studentPassword, "Electronics", 3],
    ["Ananya Iyer", "ananya@campusconnect.test", studentPassword, "Design", 2],
    ["Kabir Singh", "kabir@campusconnect.test", studentPassword, "Mechanical", 4],
    ["Meera Nair", "meera@campusconnect.test", studentPassword, "Computer Science", 1],
  ];

  const [userResult] = await connection.query(
    "INSERT INTO users (name, email, password, department, year) VALUES ?",
    [users],
  );

  const clubs = [
    [
      "IEEE Student Branch",
      "A technical society for curious minds. We host workshops, hackathons, and industry talks across electronics, computing, and emerging technology.",
      "Technical",
    ],
    [
      "Google Developer Group",
      "A student developer community built around hands-on learning, open source, and modern product engineering.",
      "Technical",
    ],
    [
      "E-Cell",
      "The entrepreneurship cell connects student founders with mentors, pitch events, and the startup ecosystem.",
      "Entrepreneurship",
    ],
    [
      "Dance Club",
      "A cultural society for dancers of every style. Join weekly jams, choreography sessions, and campus performances.",
      "Cultural",
    ],
  ];

  const [clubResult] = await connection.query(
    "INSERT INTO clubs (club_name, description, category) VALUES ?",
    [clubs],
  );

  // User ids start at 1 because this is a fresh seeded database.
  const clubMembers = [
    [1, 1, "ADMIN", "APPROVED"],
    [1, 2, "ADMIN", "APPROVED"],
    [2, 1, "MEMBER", "APPROVED"],
    [2, 4, "MEMBER", "PENDING"],
    [3, 3, "ADMIN", "APPROVED"],
    [4, 4, "ADMIN", "APPROVED"],
    [5, 2, "MEMBER", "APPROVED"],
    [5, 3, "MEMBER", "APPROVED"],
    [6, 4, "MEMBER", "APPROVED"],
    [6, 1, "MEMBER", "PENDING"],
    [3, 1, "MEMBER", "APPROVED"],
    [4, 2, "MEMBER", "APPROVED"],
  ];

  await connection.query(
    "INSERT INTO club_members (user_id, club_id, role, status) VALUES ?",
    [clubMembers],
  );

  const events = [
    [
      1,
      1,
      "Hack the Campus",
      "A 12-hour build sprint for student teams. Bring an idea, form a team, and ship a working prototype with mentors on hand.",
      daysFromNow(5, 9),
      "Innovation Lab, Block C",
      80,
    ],
    [
      2,
      1,
      "Build with AI",
      "An interactive workshop on building useful AI features with modern APIs. Laptops recommended; beginners welcome.",
      daysFromNow(8, 16),
      "Seminar Hall 2",
      60,
    ],
    [
      3,
      3,
      "Startup Pitch Night",
      "Watch student founders pitch to a panel of alumni investors and operators. Stay for the networking hour.",
      daysFromNow(12, 17),
      "Auditorium",
      150,
    ],
    [
      4,
      4,
      "Rhythm Night",
      "An evening of student choreography, freestyle rounds, and live music. Come support your campus dancers.",
      daysFromNow(16, 18),
      "Open Air Theatre",
      200,
    ],
    [
      1,
      1,
      "Tech Talk: Systems at Scale",
      "A conversation with alumni engineers about the realities of building and operating large systems.",
      daysFromNow(-6, 15),
      "Seminar Hall 1",
      100,
    ],
  ];

  await connection.query(
    `INSERT INTO events
      (club_id, created_by, event_name, description, event_date, venue, capacity)
     VALUES ?`,
    [events],
  );

  const registrations = [
    [1, 2, "REGISTERED"],
    [1, 5, "REGISTERED"],
    [1, 6, "REGISTERED"],
    [2, 2, "REGISTERED"],
    [2, 5, "REGISTERED"],
    [3, 5, "REGISTERED"],
    [3, 6, "REGISTERED"],
    [4, 6, "REGISTERED"],
    [4, 2, "REGISTERED"],
  ];

  await connection.query(
    "INSERT INTO event_registrations (event_id, user_id, status) VALUES ?",
    [registrations],
  );

  const announcements = [
    [
      1,
      1,
      "Hack the Campus registrations are open",
      "Team registrations for Hack the Campus are now open. Teams can have up to four members. The problem statements will be shared 24 hours before the event.",
    ],
    [
      1,
      1,
      "Volunteers needed for Tech Week",
      "We are looking for volunteers to help with check-in, photography, and stage coordination during Tech Week. Reply to this announcement if you are interested.",
    ],
    [
      2,
      1,
      "Build with AI: bring your laptop",
      "Our next workshop is hands-on. Please bring a laptop and create a free API account before the session so you can follow along.",
    ],
    [
      3,
      3,
      "Pitch Night applications close Friday",
      "Student founders have until Friday to submit a two-minute pitch video. Shortlisted teams will get a mentor session before the main event.",
    ],
    [
      4,
      4,
      "Audition dates for Rhythm Night",
      "Auditions for solo and group performances will be held next Tuesday and Wednesday in the dance studio. All experience levels are welcome.",
    ],
  ];

  await connection.query(
    `INSERT INTO announcements
      (club_id, created_by, title, content)
     VALUES ?`,
    [announcements],
  );

  await connection.commit();

  console.log("Demo data seeded successfully.");
  console.log("");
  console.log("Admin login   admin@campusconnect.test / Admin@123");
  console.log("Student login student@campusconnect.test / Student@123");
  console.log(`Created ${userResult.affectedRows} users and ${clubResult.affectedRows} clubs.`);
} catch (error) {
  await connection.rollback();
  console.error("Could not seed the database.");
  console.error(error.message);
  console.error("Run npm run db:init first and check your MySQL connection.");
  process.exitCode = 1;
} finally {
  await connection.end();
}
