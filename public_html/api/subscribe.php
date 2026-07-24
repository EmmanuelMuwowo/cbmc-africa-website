<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_method('POST');

$body = json_body();
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');

if ($name === '' || !is_valid_email($email)) {
    json_error('A valid name and email are required.');
}

$stmt = db()->prepare(
    'INSERT INTO subscribers (name, email, region) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)'
);
$stmt->execute([mb_substr($name, 0, 200), mb_substr($email, 0, 200), '']);

json_response(['ok' => true], 201);
