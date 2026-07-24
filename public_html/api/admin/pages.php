<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

$rows = db()->query('SELECT * FROM pages ORDER BY updated_at DESC')->fetchAll();
json_response(array_map(fn($p) => [
    'title' => $p['title'], 'owner' => $p['owner'], 'date' => short_date_label($p['updated_at']), 'status' => $p['status']
], $rows));
