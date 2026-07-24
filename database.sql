-- CBMC Africa website schema + content seed (MySQL / MariaDB)
-- Import this once via phpMyAdmin (or `mysql -u cbmc -p cbmc_africa < database.sql`).
-- This does NOT create an admin account - visit /setup/create-admin.php once after
-- importing this to create your admin login, then delete that setup file.

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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  replied TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(200) NOT NULL DEFAULT '',
  file_url VARCHAR(500) NOT NULL DEFAULT '',
  published_date DATE NULL,
  status ENUM('Published','Scheduled','Draft') NOT NULL DEFAULT 'Published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  donate_url VARCHAR(300) NOT NULL DEFAULT 'https://cbmcafrica.org/donate/'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (id) VALUES (1);

-- ---------- Content seed ----------

INSERT IGNORE INTO devotionals (slug, title, author, author_initials, devotional_date, excerpt, verse, blocks, reflection, challenge, passages, image_url, status) VALUES
('unparalleled-power-of-perseverance', 'The Unparalleled Power of Perseverance', 'Robert J. Tamasy', 'RT', '2026-07-20',
 'We could cite many ingredients that contribute to success, but one common contributing factor is perseverance.',
 '"...suffering produces perseverance; perseverance, character; and character, hope." — Romans 5:3–4',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','Perseverance. We could cite many ingredients that contribute to success — for individuals as well as businesses and organizations — but one common contributing factor is perseverance. Whether acquiring skills for a job, building a career, developing a product, or earning recognition, perseverance is invaluable.'),
   JSON_OBJECT('t','p','x','We might cite traits like patience and endurance, but perseverance is different. Patience is the willingness to bide our time until the desired outcome arrives. Endurance is hanging on until the very end. Perseverance, however, is a far more active response to our circumstances.'),
   JSON_OBJECT('t','q','x','"A saint’s life is in the hands of God like a bow and arrow in the hands of an archer… He goes on stretching until His purpose is in sight, and then He lets the arrow fly." — Oswald Chambers'),
   JSON_OBJECT('t','p','x','Have you ever been stretched to what seemed the breaking point, uncertain you could survive? Times like that are when perseverance is most critical — especially for those of us who desire to integrate our faith into what we do in the marketplace.'),
   JSON_OBJECT('t','h','x','Recognize the products of perseverance'),
   JSON_OBJECT('t','p','x','During adversity, all we can see are the present problems. But God uses our circumstances to mold and shape us into the people He wants us to become: "…we also rejoice in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope" (Romans 5:3-4).'),
   JSON_OBJECT('t','h','x','Understand that perseverance develops us'),
   JSON_OBJECT('t','p','x','Many of life’s best lessons are learned as we persevere through trials: "Consider it pure joy… whenever you face trials of many kinds, because you know that the testing of your faith develops perseverance" (James 1:2-4).'),
   JSON_OBJECT('t','h','x','Maintain focus on the goal'),
   JSON_OBJECT('t','p','x','The path to accomplishment is rarely a straight line. "Therefore, my dear brothers, stand firm. Let nothing move you… because you know that your labor in the Lord is not in vain" (1 Corinthians 15:58).')
 ),
 JSON_ARRAY(
   'How would you distinguish between patience, endurance, and perseverance? How are they similar — and how are they different?',
   'Think of a time when you were required to persevere, when problems were not quickly resolved. How did you respond?',
   'In what ways can trust in God help you persevere through hardship, believing the outcome will be greater than you hoped?',
   'Why does suffering often cause us to question God’s goodness? What would the world be like with no difficulty to work through?'
 ),
 'Is there something in your life or work that is demanding perseverance right now? Share what you are going through with trusted friends, a mentor, or your CBMC group — and ask them to support you in prayer.',
 'Deuteronomy 31:8 · Proverbs 3:5-6 · Isaiah 40:31, 41:10 · Jeremiah 33:3 · Ephesians 3:20',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-062926-1hoGDN.webp', 'Published'),

('conviction-that-outlasts-the-crisis', 'The Conviction That Outlasts the Crisis', 'C.C. Simpson', 'CS', '2026-07-13',
 'It is Monday. The quarterly numbers are bad. A key client just walked. What do you actually believe when everything is shaking?',
 '"We are afflicted in every way, but not crushed; perplexed, but not driven to despair." — 2 Corinthians 4:8',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','It is Monday. The quarterly numbers are bad. A key client just walked. The team is running on fumes. And somewhere underneath the pressure to perform, a quieter question surfaces: what do I actually believe when everything is shaking?'),
   JSON_OBJECT('t','p','x','Convictions formed in the calm are tested in the crisis. The marketplace has a way of exposing whether our faith is a decoration or a foundation. The follower of Christ is not promised the absence of storms — but a presence within them.'),
   JSON_OBJECT('t','p','x','This week, name the conviction you return to when results disappoint. Write it down. Share it with your C3 team. Let it steady you before the next hard Monday arrives.')
 ), JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-060826-VZEVE2.webp', 'Published'),

('beauty-of-joy-filled-work', 'The Beauty of Joy-Filled Work', 'Rick Boxx', 'RB', '2026-07-06',
 'My great-grandfather was primarily a roofer and a part-time farmer. He loved to work hard and enjoy life.',
 '"Whatever you do, work at it with all your heart, as working for the Lord." — Colossians 3:23',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','My great-grandfather lived into his mid-90s. Wade was primarily a roofer and a part-time farmer. He loved to work hard and to enjoy life — and he rarely separated the two.'),
   JSON_OBJECT('t','p','x','Scripture treats work not as a curse to escape but as a calling to steward. When we bring gratitude and excellence to ordinary tasks, our workplaces become places where the goodness of God is quietly on display.'),
   JSON_OBJECT('t','p','x','Where has work become joyless for you? Ask God to renew your sense of purpose in the very tasks you are tempted to resent.')
 ), JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-061526-BkjsF1.webp', 'Published'),

('anger-is-not-your-friend', 'Anger Is Not Your Friend', 'Robert J. Tamasy', 'RT', '2026-06-29',
 'Have you noticed how angry people seem to be these days? Anger, it seems, has become a default posture.',
 '"In your anger do not sin: Do not let the sun go down while you are still angry." — Ephesians 4:26',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','Have you noticed how angry people seem to be these days? Protesters shouting on the streets, commentators trading insults, colleagues bristling in the next cubicle. Anger, it seems, has become a default posture.'),
   JSON_OBJECT('t','p','x','Anger is not inherently sinful — even Jesus was angered by injustice. But unmanaged anger is a poor advisor and an expensive companion in the workplace. "In your anger do not sin" (Ephesians 4:26).'),
   JSON_OBJECT('t','p','x','This week, notice what triggers your anger at work. Pause before you respond. Ask whether your reaction reflects the character of Christ you hope others will see in you.')
 ), JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-062926-1hoGDN.webp', 'Published'),

('sticks-and-stones-can-hurt', 'Sticks and Stones Can Hurt — But So Can Words', 'Robert J. Tamasy', 'RT', '2026-06-08',
 'Most of us learned that childhood rhyme — and most of us discovered it was not true.',
 '"The tongue has the power of life and death." — Proverbs 18:21',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','"Sticks and stones may break my bones, but words will never hurt me." Most of us learned that rhyme as children — and most of us discovered it was not true.'),
   JSON_OBJECT('t','p','x','Words carry enormous power in the marketplace. A careless comment can wound a colleague for years; an encouraging one can change the trajectory of a career. "The tongue has the power of life and death" (Proverbs 18:21).'),
   JSON_OBJECT('t','p','x','Choose one person this week and speak life to them — specific, sincere, and unhurried. Notice what your words build.')
 ), JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/03/peace-is-precious-fNPOYG.png', 'Published'),

('your-output-is-not-his-mission', 'Your Output Is Not His Mission', 'Robert J. Tamasy', 'RT', '2026-06-15',
 'The pressure to produce can quietly convince us that our output is our identity.',
 '"You did not choose me, but I chose you and appointed you so that you might go and bear fruit." — John 15:16',
 JSON_ARRAY(
   JSON_OBJECT('t','p','x','The report is due. The pipeline is thin. The pressure to produce can quietly convince us that our output is our identity — and that God’s mission for us is measured in deliverables.'),
   JSON_OBJECT('t','p','x','But you are more than what you produce. Your assignment in the marketplace is not merely to generate results; it is to represent Christ among the people only you can reach.'),
   JSON_OBJECT('t','p','x','This week, consider your unique sphere of influence. Regardless of your title, you have access to people no one else has. Ask God how He might use you there.')
 ), JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/05/article-blk-and-white-6mKy0b.png', 'Published'),

('when-excellence-becomes-worship', 'When Excellence Becomes Worship', 'Robert J. Tamasy', 'RT', '2026-07-27',
 'What does it look like to offer God our best work, not for applause, but as worship?',
 '"Whatever you do, work at it with all your heart, as working for the Lord." — Colossians 3:23',
 JSON_ARRAY(JSON_OBJECT('t','p','x','Excellence in the marketplace can easily become about reputation. But Scripture invites us to a different motive: doing our work as an offering to God rather than a performance for people.')),
 JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-062926-1hoGDN.webp', 'Scheduled'),

('colleague-you-keep-avoiding', 'The Colleague You Keep Avoiding', 'C.C. Simpson', 'CS', '2026-08-03',
 'There is usually one person at work we quietly avoid. What might God be inviting us to there?',
 '',
 JSON_ARRAY(JSON_OBJECT('t','p','x','Draft in progress.')),
 JSON_ARRAY(), '', '',
 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-060826-VZEVE2.webp', 'Draft');

INSERT IGNORE INTO news (slug, title, author, published_date, excerpt, blocks, image_url, status) VALUES
('q2-2026-video-newsletter', 'Q2 2026 Video Newsletter is LIVE!', 'CBMC International', '2026-07-10',
 'Six regions. One mission. Our latest video takes you around the CBMC movement in about five minutes.',
 JSON_ARRAY(
   'Six regions. One mission. The Q2 2026 CBMC International Video Newsletter takes you around the movement in about five minutes — from leadership trainings in Central Africa to new Connect3 teams forming in Asia-Pacific.',
   'You will hear directly from national leaders about what God is doing in their marketplaces, and how prayer, evangelism and discipleship continue to anchor everything we do.',
   'Share the video with your team and use it to spark a conversation about how the Gospel is moving through the marketplace where you work.'
 ), 'https://cbmcafrica.org/wp-content/uploads/2026/06/img_1644-fzMJOl.webp', 'Published'),

('ten-years-of-cbmc-cameroon', 'Ten Years of CBMC Cameroon', 'CBMC International', '2026-06-08',
 'From a single leadership training in Lagos to a disciple-making movement reaching across Central Africa.',
 JSON_ARRAY(
   'A decade ago, CBMC Cameroon began with a single leadership training. Today it is a disciple-making movement reaching business and professional men and women across Central Africa.',
   'The anniversary gathering celebrated the leaders raised up, the Connect3 teams multiplied, and the many colleagues who have come to faith in the marketplace over ten years.',
   'What began as a seed has become a network — a reminder that faithful, consistent ministry compounds over time.'
 ), 'https://cbmcafrica.org/wp-content/uploads/2026/06/img_1644-fzMJOl.webp', 'Published'),

('returning-to-the-center', 'Returning to the Center: Why Evangelism Still Defines Our Mission', 'C.C. Simpson', '2026-05-06',
 'Across the globe, God is on the move in the marketplace — and the momentum is building.',
 JSON_ARRAY(
   'Across the globe, God is on the move in the marketplace — and the momentum is building. Yet momentum can quietly drift from its center if we are not intentional.',
   'For CBMC, evangelism is not one program among many; it is the center of gravity. Our teams, our prayer, and our discipleship all exist to help business people introduce their colleagues to Jesus Christ.',
   'This article is a call to return to that center — to let the love of God once again compel us toward the people we work with every day.'
 ), 'https://cbmcafrica.org/wp-content/uploads/2026/05/article-blk-and-white-6mKy0b.png', 'Published'),

('q1-2026-video-newsletter', 'The Q1 2026 CBMC International Video Newsletter is LIVE!', 'CBMC International', '2026-04-08',
 'From the USA and Asia-Pacific to Latin America, Europe, and Africa, lives are being changed.',
 JSON_ARRAY(
   'From the USA and Asia-Pacific to Latin America, Europe, and Africa, lives are being changed through marketplace ministry. The Q1 2026 video newsletter gathers those stories in one place.',
   'Watch to see how national teams are equipping ambassadors for Christ, and how the global CBMC family continues to grow across cultures and continents.'
 ), 'https://cbmcafrica.org/wp-content/uploads/2026/04/image-4-6-26-at-12.45-pm-scaled-O2h7yO.png', 'Published');

INSERT IGNORE INTO events (title, category, location, event_date, dates_label, time_label, format, cost, host, description) VALUES
('CBMC Africa Regional Leadership Summit', 'AFRICA', 'Lusaka, Zambia', '2026-09-18', 'Sep 18–20, 2026', '8:30 AM – 5:00 PM', 'In person', '$120', 'CBMC Africa',
 'Three days of vision-casting, training and fellowship for national and regional CBMC leaders across the continent. Sessions cover team multiplication, Operation Timothy discipleship, and Connect3 group leadership, with dedicated time for prayer and regional planning.'),
('Connect3 (C3) Marketplace Forum', 'AFRICA', 'Nairobi, Kenya', '2026-10-09', 'Oct 9, 2026', '6:30 AM – 9:00 AM', 'Breakfast forum', 'Free', 'CBMC Kenya',
 'A morning forum for business and professional people exploring what it means to connect to God and one another in the marketplace. Includes a keynote, table discussion, and an introduction to joining or starting a Connect3 team in your city.'),
('West Africa Prayer Breakfast', 'AFRICA', 'Accra, Ghana', '2026-10-24', 'Oct 24, 2026', '7:00 AM – 9:30 AM', 'Breakfast', 'Free', 'CBMC Ghana',
 'Business leaders gather to pray for the nation, the marketplace, and one another. A simple, powerful morning built around intercession and encouragement for those carrying their faith into work.'),
('Operation Timothy Facilitator Training', 'AFRICA', 'Lagos, Nigeria', '2026-11-07', 'Nov 7, 2026', '9:00 AM – 4:00 PM', 'Workshop', '$45', 'CBMC Nigeria',
 'A hands-on training equipping facilitators to disciple new believers and growing Christians using the Operation Timothy curriculum. Ideal for anyone ready to walk alongside a colleague one-to-one.'),
('Q4 2026 CBMC International Gathering', 'INTERNATIONAL', 'Online · Global', '2026-11-20', 'Nov 20, 2026', '3:00 PM GMT', 'Online', 'Free', 'CBMC International',
 'A global video gathering of the CBMC family, celebrating stories from every region and looking ahead to the year to come. Join from anywhere in the world.'),
('Marketplace Ambassadors Conference', 'AFRICA', 'Cape Town, South Africa', '2026-12-05', 'Dec 5–6, 2026', '8:00 AM – 6:00 PM', 'Conference', '$150', 'CBMC South Africa',
 'A two-day conference for those who want to be intentional ambassadors for Christ at work. Speakers, workshops and networking focused on integrating faith and profession with integrity and impact.');

INSERT IGNORE INTO subscribers (name, email, region, created_at) VALUES
('Joseph Mwansa', 'jmwansa@ndolatech.zm', 'Zambia', '2026-07-18'),
('Amara Adeyemi', 'amara.a@lagosfin.ng', 'Nigeria', '2026-07-15'),
('David Tembo', 'd.tembo@coppermine.zm', 'Zambia', '2026-07-11'),
('Grace Okafor', 'grace@okaforlaw.ng', 'Nigeria', '2026-07-09'),
('Samuel Kimani', 'skimani@nairobicap.ke', 'Kenya', '2026-07-02'),
('Thandiwe Dube', 't.dube@capetownco.za', 'South Africa', '2026-06-28');

INSERT IGNORE INTO messages (name, email, message, replied) VALUES
('Joseph Mwansa', 'jmwansa@ndolatech.zm', 'How can our company start a C3 team in Ndola? We have about a dozen believers keen to meet weekly.', 0),
('Amara Adeyemi', 'amara.a@lagosfin.ng', 'Requesting Monday Manna translation permission for Yoruba — we would love to share it locally.', 0),
('David Tembo', 'd.tembo@coppermine.zm', 'Interested in the Leadership Summit sponsorship packages. Could you send details?', 0),
('Grace Okafor', 'grace@okaforlaw.ng', 'Loved this week’s devotional on perseverance — sharing it with my whole office.', 1);

INSERT IGNORE INTO resources (title, author, file_url, published_date, status) VALUES
('Operation Timothy — Book 1 (PDF)', 'CBMC', '', '2026-06-01', 'Published'),
('Connect3 Starter Guide', 'CBMC Africa', '', '2026-05-20', 'Published'),
('Monday Manna Archive 2025', 'CBMC', '', '2026-01-12', 'Published'),
('Leadership Summit Brochure 2026', 'CBMC Africa', '', NULL, 'Draft');

INSERT IGNORE INTO pages (slug, title, owner, status, updated_at) VALUES
('home', 'Home', '—', 'Published', '2026-06-02'),
('about', 'About Us', '—', 'Published', '2026-05-18'),
('statement-of-faith', 'Statement of Faith', '—', 'Published', '2026-05-18'),
('contact', 'Contact', '—', 'Published', '2026-04-30'),
('privacy-policy', 'Privacy Policy', '—', 'Draft', '2026-01-01');

INSERT IGNORE INTO media (filename, url) VALUES
('mm-perseverance.webp', 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-062926-1hoGDN.webp'),
('mm-conviction.webp', 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-060826-VZEVE2.webp'),
('mm-joy-work.webp', 'https://cbmcafrica.org/wp-content/uploads/2026/06/mm-061526-BkjsF1.webp'),
('peace-is-precious.png', 'https://cbmcafrica.org/wp-content/uploads/2026/03/peace-is-precious-fNPOYG.png'),
('article-blk-white.png', 'https://cbmcafrica.org/wp-content/uploads/2026/05/article-blk-and-white-6mKy0b.png'),
('video-newsletter.webp', 'https://cbmcafrica.org/wp-content/uploads/2026/06/img_1644-fzMJOl.webp'),
('q1-newsletter.png', 'https://cbmcafrica.org/wp-content/uploads/2026/04/image-4-6-26-at-12.45-pm-scaled-O2h7yO.png'),
('home-hero.jpeg', 'https://cbmcafrica.org/wp-content/uploads/layerslider/Home/dJJxbATA.jpeg');
