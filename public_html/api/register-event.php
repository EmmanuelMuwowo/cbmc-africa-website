<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_method('POST');

$body = json_body();
$id = (int)($body['id'] ?? 0);
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');

if (!$id || $name === '' || !is_valid_email($email)) {
    json_error('A valid name and email are required.');
}

$stmt = db()->prepare('SELECT id FROM events WHERE id = ?');
$stmt->execute([$id]);
if (!$stmt->fetch()) json_error('Event not found.', 404);

$stmt = db()->prepare('INSERT INTO event_registrations (event_id, name, email) VALUES (?, ?, ?)');
$stmt->execute([$id, mb_substr($name, 0, 200), mb_substr($email, 0, 200)]);

json_response(['ok' => true], 201);
