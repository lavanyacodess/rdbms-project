-- CampusConnect schema for MySQL 8.x
-- The plan uses USER as an entity name. We use `users` here because USER is a
-- MySQL keyword and plural table names make the relational model clearer.

SET NAMES utf8mb4;

DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS club_members;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_year CHECK (year IS NULL OR (year BETWEEN 1 AND 5))
) ENGINE=InnoDB;

CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE club_members (
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    role ENUM('MEMBER', 'ADMIN') NOT NULL DEFAULT 'MEMBER',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, club_id),
    CONSTRAINT fk_club_members_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_club_members_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    INDEX idx_club_members_status (club_id, status),
    INDEX idx_club_members_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    created_by INT NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue VARCHAR(100),
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    CONSTRAINT fk_events_creator
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_events_capacity CHECK (capacity IS NULL OR capacity > 0),
    INDEX idx_events_date (event_date),
    INDEX idx_events_club_date (club_id, event_date)
) ENGINE=InnoDB;

CREATE TABLE event_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('REGISTERED', 'CANCELLED') NOT NULL DEFAULT 'REGISTERED',

    UNIQUE KEY uq_event_registration (event_id, user_id),
    CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_registrations_user (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    created_by INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcements_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    CONSTRAINT fk_announcements_creator
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_announcements_club_created (club_id, created_at)
) ENGINE=InnoDB;
