<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
require_method('DELETE');

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

$existing = db()->prepare('SELECT email FROM subscribers WHERE id = ?');
$existing->execute([$id]);
$existingEmail = $existing->fetchColumn();

$stmt = db()->prepare('DELETE FROM subscribers WHERE id = ?');
$stmt->execute([$id]);
if ($stmt->rowCount() === 0) json_error('Not found.', 404);
log_admin_activity('removed', 'Subscriber', $existingEmail ?: '');
json_response(['ok' => true]);
