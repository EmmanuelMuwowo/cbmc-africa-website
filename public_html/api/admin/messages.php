<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

$rows = db()->query('SELECT * FROM messages ORDER BY created_at DESC')->fetchAll();
json_response(array_map(fn($m) => [
    'id' => (int)$m['id'], 'initials' => initials($m['name']), 'name' => $m['name'], 'email' => $m['email'],
    'preview' => $m['message'], 'time' => short_date_label($m['created_at']), 'replied' => (bool)$m['replied']
], $rows));
