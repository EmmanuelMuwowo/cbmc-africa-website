<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

$rows = db()->query('SELECT name, email, region, created_at FROM subscribers ORDER BY created_at DESC')->fetchAll();

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="subscribers.csv"');

$out = fopen('php://output', 'w');
fputcsv($out, ['Name', 'Email', 'Region', 'Joined']);
foreach ($rows as $r) {
    fputcsv($out, [$r['name'], $r['email'], $r['region'] ?: '', short_date_label($r['created_at'])]);
}
fclose($out);
exit;
