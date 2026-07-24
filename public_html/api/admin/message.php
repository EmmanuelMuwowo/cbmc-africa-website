<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
require_method('PATCH');

$id = (int)($_GET['id'] ?? 0);
$stmt = db()->prepare('UPDATE messages SET replied = 1 WHERE id = ?');
$stmt->execute([$id]);
if ($stmt->rowCount() === 0) json_error('Not found.', 404);
json_response(['ok' => true]);
