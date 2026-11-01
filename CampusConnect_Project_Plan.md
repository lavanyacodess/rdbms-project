# CampusConnect -- College Club Management System

## 1. Project Overview

**Project name:** CampusConnect -- College Club Management System

**Objective:** Build a web application that centralizes the management
of college clubs, their members, events, and announcements. Students can
explore clubs, request to join, register for events, and read
announcements. Club admins can manage club activities.

### User roles

  -----------------------------------------------------------------------
  Role                                Responsibilities
  ----------------------------------- -----------------------------------
  Student                             View clubs, request membership,
                                      register for events, view
                                      announcements

  Club Admin                          Manage club details, approve or
                                      reject membership requests, create
                                      events, manage announcements
  -----------------------------------------------------------------------

For the first version, keep these two roles. A separate super-admin can
be added later if needed.

## 2. Features

### Module 1: Authentication

-   Student registration and login.
-   Admin login.
-   Role-based access control.
-   Logout functionality.

### Module 2: Club Management

-   Display all college clubs.
-   View individual club details.
-   Request to join a club.
-   View club members.
-   Admin can approve or reject membership requests.

### Module 3: Event Management

-   Admin can create and manage events.
-   Students can view upcoming events.
-   Students can register for events.
-   Admin can view registered participants.

### Module 4: Announcements

-   Club admins can publish announcements.
-   Students can view announcements.
-   Announcements are displayed club-wise.

**Version 1 scope:** Build these four modules first. Avoid adding
payment gateways, chat systems, or attendance tracking until the core
application works.

## 3. Technology Stack

  Technology               Purpose
  ------------------------ ----------------------------------
  Next.js                  Frontend and backend application
  React                    UI components
  Tailwind CSS             Styling
  MySQL                    Relational database
  Node.js                  Backend runtime
  `mysql2`                 Connecting Next.js to MySQL
  Next.js Route Handlers   Backend API endpoints
  Git and GitHub           Version control

### Why MySQL with `mysql2`?

Using MySQL provides practical experience with: - Primary and foreign
keys. - Joins. - Constraints. - Normalization. - SQL queries. -
Relational database relationships.

For the initial version, use `mysql2` and write SQL queries directly
instead of introducing an ORM. This makes it easier to understand how
the application communicates with the database.

## 4. ER Diagram

The proposed database contains six entities:

1.  `USER`
2.  `CLUB`
3.  `CLUB_MEMBER`
4.  `EVENT`
5.  `EVENT_REGISTRATION`
6.  `ANNOUNCEMENT`

### Mermaid ER diagram

Paste this into a Markdown viewer that supports Mermaid to render the
diagram.

``` mermaid
erDiagram
    USER ||--o{ CLUB_MEMBER : joins
    CLUB ||--o{ CLUB_MEMBER : has

    CLUB ||--o{ EVENT : organizes
    USER ||--o{ EVENT : creates

    USER ||--o{ EVENT_REGISTRATION : registers
    EVENT ||--o{ EVENT_REGISTRATION : receives

    CLUB ||--o{ ANNOUNCEMENT : publishes
    USER ||--o{ ANNOUNCEMENT : creates

    USER {
        int user_id PK
        varchar name
        varchar email
        varchar password
        varchar department
        int year
    }

    CLUB {
        int club_id PK
        varchar club_name
        text description
        varchar category
    }

    CLUB_MEMBER {
        int user_id PK,FK
        int club_id PK,FK
        varchar role
        varchar status
        datetime joined_at
    }

    EVENT {
        int event_id PK
        int club_id FK
        int created_by FK
        varchar event_name
        text description
        datetime event_date
        varchar venue
        int capacity
    }

    EVENT_REGISTRATION {
        int registration_id PK
        int event_id FK
        int user_id FK
        datetime registration_date
        varchar status
    }

    ANNOUNCEMENT {
        int announcement_id PK
        int club_id FK
        int created_by FK
        varchar title
        text content
        datetime created_at
    }
```

### Understanding the relationships

  -----------------------------------------------------------------------
  Relationship            Cardinality             Explanation
  ----------------------- ----------------------- -----------------------
  USER -- CLUB_MEMBER     1:M                     One user can request or
                                                  join multiple clubs.

  CLUB -- CLUB_MEMBER     1:M                     One club can have
                                                  multiple members.

  CLUB -- EVENT           1:M                     One club can organize
                                                  multiple events.

  EVENT --                1:M                     One event can have
  EVENT_REGISTRATION                              multiple registrations.

  USER --                 1:M                     One user can register
  EVENT_REGISTRATION                              for multiple events.

  CLUB -- ANNOUNCEMENT    1:M                     One club can publish
                                                  multiple announcements.

  USER -- EVENT           1:M                     One user can create
                                                  multiple events.

  USER -- ANNOUNCEMENT    1:M                     One user can create
                                                  multiple announcements.
  -----------------------------------------------------------------------

**Associative entities:** - `CLUB_MEMBER` resolves the many-to-many
relationship between `USER` and `CLUB`. - `EVENT_REGISTRATION` resolves
the many-to-many relationship between `USER` and `EVENT`.

## 5. MySQL Database Schema

The following schema is intended for MySQL 8.x.

### Step 1: Create the database

``` sql
CREATE DATABASE campus_connect;
USE campus_connect;
```

### Step 2: USER table

Stores information about students and club administrators.

``` sql
CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: CLUB table

Stores college club information.

``` sql
CREATE TABLE CLUB (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50)
);
```

### Step 4: CLUB_MEMBER table

Connects users with clubs and stores membership status and role.

``` sql
CREATE TABLE CLUB_MEMBER (
    user_id INT,
    club_id INT,
    role ENUM('MEMBER', 'ADMIN') DEFAULT 'MEMBER',
    status ENUM('PENDING', 'APPROVED', 'REJECTED')
           DEFAULT 'PENDING',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, club_id),

    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (club_id) REFERENCES CLUB(club_id)
);
```

### Step 5: EVENT table

Stores information about club events.

``` sql
CREATE TABLE EVENT (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    created_by INT NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue VARCHAR(100),
    capacity INT,

    FOREIGN KEY (club_id) REFERENCES CLUB(club_id),
    FOREIGN KEY (created_by) REFERENCES USER(user_id)
);
```

### Step 6: EVENT_REGISTRATION table

Stores student registrations for events.

``` sql
CREATE TABLE EVENT_REGISTRATION (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('REGISTERED', 'CANCELLED')
           DEFAULT 'REGISTERED',

    UNIQUE(event_id, user_id),

    FOREIGN KEY (event_id) REFERENCES EVENT(event_id),
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);
```

### Step 7: ANNOUNCEMENT table

Stores announcements made by club admins.

``` sql
CREATE TABLE ANNOUNCEMENT (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    created_by INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (club_id) REFERENCES CLUB(club_id),
    FOREIGN KEY (created_by) REFERENCES USER(user_id)
);
```

### Database design notes

-   Passwords must be stored as secure password hashes, never as plain
    text. Use a password-hashing library such as `bcrypt`.
-   The `UNIQUE(event_id, user_id)` constraint prevents the same user
    from creating duplicate registrations for one event.
-   The composite primary key in `CLUB_MEMBER` prevents duplicate
    membership rows for the same user and club.
-   In the application, validate event capacity and registration status
    before accepting a registration.
-   Enforce admin permissions on the server for every protected
    operation. Hiding buttons in the frontend is not sufficient.
-   Consider renaming `USER` to `users` if you prefer to avoid using a
    potentially confusing SQL identifier.

## 6. Next.js Project Structure

Use the Next.js App Router.

``` text
campus-connect/
│
├── app/
│   ├── page.js
│   ├── login/
│   │   └── page.js
│   ├── register/
│   │   └── page.js
│   ├── dashboard/
│   │   └── page.js
│   ├── clubs/
│   │   ├── page.js
│   │   └── [id]/
│   │       └── page.js
│   ├── events/
│   │   └── page.js
│   ├── announcements/
│   │   └── page.js
│   └── api/
│       ├── auth/
│       ├── clubs/
│       ├── events/
│       └── announcements/
│
├── components/
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── ClubCard.js
│   └── EventCard.js
│
├── lib/
│   └── db.js
│
├── public/
└── package.json
```

The API folders can contain route handlers for the relevant endpoints.
Keep database connection code in `lib/db.js` and reuse it rather than
opening a new connection for every query.

## 7. Suggested Website Pages

### Student dashboard

-   Welcome message.
-   Clubs the student has joined.
-   Upcoming events.
-   Recent announcements.
-   Explore Clubs button.

### Clubs page

Display club cards with basic information and a link to view details.

  Example club   Description           Action
  -------------- --------------------- -----------
  IEEE           Technical society     View Club
  GDG            Developer community   View Club
  E-Cell         Entrepreneurship      View Club
  Dance Club     Cultural society      View Club

### Club admin dashboard

-   Total members.
-   Pending membership requests.
-   Upcoming events.
-   Create a new event.
-   Publish an announcement.
-   Manage members.

## 8. Development Roadmap

Build the application one phase at a time.

  Phase   Work                                   Estimated time
  ------- -------------------------------------- ----------------
  1       Database design and MySQL setup        1 day
  2       Next.js setup and frontend structure   1--2 days
  3       MySQL connection and API routes        1--2 days
  4       Registration and login                 2 days
  5       Club management                        2 days
  6       Event management                       2 days
  7       Announcements                          1 day
  8       Testing and deployment                 1--2 days

**Estimated completion:** Approximately 10--14 days, depending on
experience and available time.

## 9. Important Development Recommendations

1.  Start with direct SQL queries using `mysql2`; add an ORM later only
    if needed.
2.  Hash passwords with `bcrypt` or another established password-hashing
    library.
3.  Implement authentication and role-based authorization on the server.
4.  Use Git and GitHub from the beginning.
5.  Keep the database normalized and use foreign-key constraints.
6.  Validate all incoming data on the server.
7.  Keep database credentials in environment variables; never commit
    `.env` files.
8.  Use parameterized SQL queries to protect against SQL injection.
9.  Test the main workflows before deployment.
10. Deploy the Next.js application and MySQL database separately when
    ready.

## 10. Project Learning Outcomes

By completing this project, you will gain practical experience with:

-   React and Next.js.
-   REST APIs and server-side logic.
-   MySQL and relational database design.
-   Authentication and authorization.
-   CRUD operations.
-   SQL joins, constraints, and relationships.
-   Full-stack application development.
-   Git and GitHub workflows.

## 11. Recommended Starting Point

Start with **Phase 1**:

1.  Install or verify Node.js and MySQL.
2.  Create the Next.js project.
3.  Install the required dependencies, including `mysql2`.
4.  Create the `campus_connect` database in MySQL Workbench.
5.  Create the tables using the SQL schema in this document.
6.  Configure the database connection in `lib/db.js`.
7.  Test the connection before building the application features.

Build and understand each module one by one instead of copying the
entire application at once.
