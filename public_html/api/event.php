<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';

$id = (int)($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM events WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) json_error('Not found.', 404);
json_response(serialize_event($row));
