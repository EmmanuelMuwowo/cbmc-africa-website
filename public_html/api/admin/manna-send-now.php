<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/manna-mailer.php';
require_admin();
require_method('POST');

$result = send_weekly_manna();
json_response($result);
