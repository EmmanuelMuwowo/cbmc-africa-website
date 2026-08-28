<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
require_method('GET');

$limit = (int)($_GET['limit'] ?? 200);
if ($limit < 1 || $limit > 500) $limit = 200;

$rows = db()->query("SELECT * FROM activity_log ORDER BY created_at DESC, id DESC LIMIT {$limit}")->fetchAll();

json_response(array_map(fn($r) => [
    'id' => (int)$r['id'],
    'actor' => $r['actor'],
    'initials' => initials($r['actor']),
    'action' => $r['action'],
    'entityType' => $r['entity_type'],
    'entityLabel' => $r['entity_label'],
    'time' => date('M j, Y · g:i A', strtotime($r['created_at']))
], $rows));
