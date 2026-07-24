<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';

$category = $_GET['category'] ?? '';
if ($category && $category !== 'ALL') {
    $stmt = db()->prepare('SELECT * FROM events WHERE category = ? ORDER BY event_date ASC');
    $stmt->execute([$category]);
    $rows = $stmt->fetchAll();
} else {
    $rows = db()->query('SELECT * FROM events ORDER BY event_date ASC')->fetchAll();
}
json_response(array_map('serialize_event', $rows));
