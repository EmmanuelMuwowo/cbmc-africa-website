<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

$rows = db()->query('SELECT * FROM subscribers ORDER BY created_at DESC')->fetchAll();
json_response(array_map(fn($s) => [
    'name' => $s['name'], 'email' => $s['email'], 'region' => $s['region'] ?: '—', 'date' => short_date_label($s['created_at'])
], $rows));
