<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/manna-mailer.php';
require_admin();
require_method('POST');

$result = send_weekly_manna();

if ($result['sent']) {
    $summary = implode(', ', array_map(
        fn($d) => $d['title'] . ' (' . $d['sent'] . ' sent' . ($d['failed'] ? ', ' . $d['failed'] . ' failed' : '') . ')',
        $result['devotionals']
    ));
    log_admin_activity('sent', 'Monday Manna email', $summary);
}

json_response($result);
