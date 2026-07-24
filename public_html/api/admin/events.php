<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$rows = db()->query('SELECT * FROM events ORDER BY event_date ASC')->fetchAll();
json_response(array_map('serialize_event', $rows));
