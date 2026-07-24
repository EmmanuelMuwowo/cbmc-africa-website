<?php
require_once __DIR__ . '/../includes/auth.php';
$id = require_admin();
$stmt = db()->prepare('SELECT id, name, email FROM admins WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) json_error('Not authenticated.', 401);
json_response(['id' => (int)$row['id'], 'name' => $row['name'], 'email' => $row['email']]);
