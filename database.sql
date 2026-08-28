-- CBMC Africa website schema (MySQL / MariaDB)
-- Import this once via phpMyAdmin (or `mysql -u cbmc -p cbmc_africa < database.sql`).
-- Safe to re-import later: tables are created only if missing, and the ALTER
-- statements add newer columns without touching existing data.
--
-- This file contains NO demo content. The site launches empty and every
-- devotional, article, event, resource, leader and prayer card is added through
-- the admin dashboard, so nothing unverified is ever published.
--
-- It also does NOT create an admin account. After importing, set SETUP_KEY in
-- api/includes/config.php, then visit
--   /setup/create-admin.php?key=YOUR_SETUP_KEY
-- once to create your login, then delete the /setup folder from the server.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  attempted_at DATETIME NOT NULL,
  INDEX (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devotionals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(200) NOT NULL,
  author_initials VARCHAR(8) NOT NULL,
  devotional_date DATE NOT NULL,
  excerpt TEXT,
  verse TEXT,
  blocks JSON NOT NULL,
  reflection JSON NOT NULL,
  challenge TEXT,
  passages VARCHAR(500),
  image_url VARCHAR(500),
  status ENUM('Published','Scheduled','Draft') NOT NULL DEFAULT 'Published',
  emailed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safe to re-run: adds this column if this table already existed without it.
ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS emailed_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(200) NOT NULL,
  published_date DATE NOT NULL,
  excerpt TEXT,
  blocks JSON NOT NULL,
  image_url VARCHAR(500),
  status ENUM('Published','Scheduled','Draft') NOT NULL DEFAULT 'Published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  category ENUM('AFRICA','INTERNATIONAL') NOT NULL,
  location VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  dates_label VARCHAR(100) NOT NULL,
  time_label VARCHAR(100) NOT NULL DEFAULT '',
  format VARCHAR(100) NOT NULL DEFAULT '',
  cost VARCHAR(50) NOT NULL DEFAULT '',
  host VARCHAR(150) NOT NULL DEFAULT '',
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  region VARCHAR(100) NOT NULL DEFAULT '',
  unsubscribe_token VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safe to re-run: adds this column if this table already existed without it.
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  replied TINYINT(1) NOT NULL DEFAULT 0,
  reply_body TEXT NULL,
  replied_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safe to re-run: adds these columns if this table already existed without them.
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reply_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS replied_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT '',
  file_path VARCHAR(500) NULL,
  file_original_name VARCHAR(300) NULL,
  external_url VARCHAR(500) NULL,
  published_date DATE NULL,
  status ENUM('Published','Scheduled','Draft') NOT NULL DEFAULT 'Draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor VARCHAR(200) NOT NULL DEFAULT 'System',
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_label VARCHAR(300) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prayer_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leaders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL DEFAULT '',
  region VARCHAR(100) NOT NULL DEFAULT '',
  bio TEXT,
  photo_url VARCHAR(500) NULL,
  email VARCHAR(200) NOT NULL DEFAULT '',
  phone VARCHAR(60) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('Published','Draft') NOT NULL DEFAULT 'Draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  owner VARCHAR(150) NOT NULL DEFAULT '',
  status ENUM('Published','Scheduled','Draft') NOT NULL DEFAULT 'Published',
  content TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(300) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  org_name VARCHAR(200) NOT NULL DEFAULT 'CBMC Africa',
  public_email VARCHAR(200) NOT NULL DEFAULT 'info@cbmcafrica.com',
  phone VARCHAR(60) NOT NULL DEFAULT '+260 211 284102',
  address VARCHAR(300) NOT NULL DEFAULT 'Joseph Kabwe Road, No 32, PHI, Lusaka, Zambia',
  manna_email_enabled TINYINT(1) NOT NULL DEFAULT 1,
  donate_url VARCHAR(300) NOT NULL DEFAULT 'https://cbmcafrica.org/donate/',
  hero_type ENUM('image','video') NOT NULL DEFAULT 'image',
  hero_url VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safe to re-run: adds these columns if this table already existed without them.
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS hero_type ENUM('image','video') NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS hero_url VARCHAR(500) NULL;

INSERT IGNORE INTO settings (id) VALUES (1);

-- ---------- Minimal starting records ----------
-- Page records for the admin "Content Pages" listing. These are the real pages
-- that exist on the site; no demo content is seeded anywhere else, so the site
-- launches empty and everything is added through the admin dashboard.

INSERT IGNORE INTO pages (slug, title, owner, status, updated_at) VALUES
('home', 'Home', '—', 'Published', CURRENT_TIMESTAMP),
('about', 'About Us', '—', 'Published', CURRENT_TIMESTAMP),
('statement-of-faith', 'Statement of Faith', '—', 'Published', CURRENT_TIMESTAMP),
('contact', 'Contact', '—', 'Published', CURRENT_TIMESTAMP),
('prayer', 'Prayer', '—', 'Published', CURRENT_TIMESTAMP);
