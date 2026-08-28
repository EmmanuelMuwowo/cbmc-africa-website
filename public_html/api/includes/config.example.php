<?php
// Copy this file to config.php and fill in your real hosting details.
// config.php is gitignored - never commit real credentials.

define('DB_HOST', 'localhost');
define('DB_NAME', 'cbmc_africa');
define('DB_USER', 'cbmc');
define('DB_PASS', 'cbmc');

// Any long random string - used to sign the PHP session cookie name.
define('APP_SESSION_NAME', 'cbmc_admin_session');

// CBMC Africa's real donate page - the "Give" buttons link here.
define('DONATE_URL', 'https://cbmcafrica.org/donate/');

// Your site's real public URL (no trailing slash) - used to build links inside emails.
define('SITE_URL', 'https://cbmcafrica.org');

// Any long random string - protects the weekly-email cron endpoint from being
// triggered by strangers when called over HTTP instead of the command line.
define('MANNA_CRON_KEY', 'change-this-to-a-long-random-string');

// Any long random string - required to use /setup/create-admin.php.
// Without a matching ?key= the setup page refuses to run, so the page cannot be
// used to create an admin account even if the folder is left on the server.
// Delete the /setup folder after creating your login anyway.
define('SETUP_KEY', 'change-this-to-a-different-long-random-string');
