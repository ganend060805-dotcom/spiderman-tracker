-- Spidey Tracker // MySQL 8 presence schema
-- Jalankan melalui phpMyAdmin atau mysql CLI.
-- Browser tidak boleh mengakses database secara langsung.

CREATE DATABASE IF NOT EXISTS spidey_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE spidey_tracker;

CREATE TABLE IF NOT EXISTS presence_sessions (
  session_id CHAR(36) NOT NULL,
  username VARCHAR(24) NOT NULL,
  username_normalized VARCHAR(24) NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  location_shared TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('online', 'offline') NOT NULL DEFAULT 'online',
  last_seen DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (session_id),
  UNIQUE KEY uq_presence_username_status (username_normalized, status),
  KEY idx_presence_online_last_seen (status, last_seen),
  CONSTRAINT chk_presence_username
    CHECK (username REGEXP '^[A-Za-z0-9_ -]{3,24}$'),
  CONSTRAINT chk_presence_coordinates_pair
    CHECK (
      (latitude IS NULL AND longitude IS NULL)
      OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    ),
  CONSTRAINT chk_presence_latitude
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_presence_longitude
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appearance_events (
  event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id CHAR(36) NULL,
  username_snapshot VARCHAR(24) NOT NULL,
  event_type ENUM('joined', 'went_offline', 'location_updated') NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  happened_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (event_id),
  KEY idx_appearance_happened_at (happened_at),
  KEY idx_appearance_session_id (session_id),
  CONSTRAINT fk_appearance_session
    FOREIGN KEY (session_id)
    REFERENCES presence_sessions(session_id)
    ON DELETE SET NULL,
  CONSTRAINT chk_appearance_latitude
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_appearance_longitude
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW online_presence AS
SELECT
  session_id,
  username,
  latitude,
  longitude,
  location_shared,
  last_seen,
  created_at
FROM presence_sessions
WHERE status = 'online'
  AND last_seen >= UTC_TIMESTAMP(6) - INTERVAL 90 SECOND;

-- Backend menjalankan cleanup ini setiap 15 detik.
-- Query manual:
-- UPDATE presence_sessions
-- SET status = 'offline', last_seen = UTC_TIMESTAMP(6)
-- WHERE status = 'online'
--   AND last_seen < UTC_TIMESTAMP(6) - INTERVAL 90 SECOND;
