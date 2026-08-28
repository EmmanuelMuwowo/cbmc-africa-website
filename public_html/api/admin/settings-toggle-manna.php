<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
require_method('POST');

db()->exec('UPDATE settings SET manna_email_enabled = NOT manna_email_enabled WHERE id = 1');
$row = db()->query('SELECT manna_email_enabled FROM settings WHERE id = 1')->fetch();
log_admin_activity($row['manna_email_enabled'] ? 'enabled' : 'disabled', 'Weekly Monday Manna email');
json_response(['mannaEmailEnabled' => (bool)$row['manna_email_enabled']]);
