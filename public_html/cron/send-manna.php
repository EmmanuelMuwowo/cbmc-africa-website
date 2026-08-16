<?php
// Run this weekly (e.g. every Monday at 6:00 AM) via your host's cron scheduler:
//   php /full/path/to/public_html/cron/send-manna.php
//
// If your host only supports URL-based cron jobs instead of running PHP directly,
// you can instead schedule a request to:
//   https://yourdomain.com/cron/send-manna.php?key=YOUR_MANNA_CRON_KEY
// (the key must match MANNA_CRON_KEY in api/includes/config.php - anyone without
// it gets refused, since this endpoint sends real email to your subscriber list.)

require_once __DIR__ . '/../api/includes/manna-mailer.php';

$isCli = (php_sapi_name() === 'cli');

if (!$isCli) {
    $key = $_GET['key'] ?? '';
    if (!hash_equals(MANNA_CRON_KEY, $key)) {
        http_response_code(403);
        header('Content-Type: text/plain');
        echo "Forbidden.\n";
        exit;
    }
}

$result = send_weekly_manna();

header('Content-Type: text/plain');
if (!$result['sent']) {
    echo 'Nothing sent (' . $result['reason'] . ").\n";
    exit;
}

foreach ($result['devotionals'] as $d) {
    echo "Sent \"{$d['title']}\" to {$d['sent']} subscriber(s)";
    if ($d['failed'] > 0) echo ", {$d['failed']} failed";
    echo ".\n";
}
