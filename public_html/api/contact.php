<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_method('POST');

$body = json_body();
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$message = trim($body['message'] ?? '');

if ($name === '' || !is_valid_email($email) || $message === '') {
    json_error('Name, valid email, and message are required.');
}

$stmt = db()->prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)');
$stmt->execute([mb_substr($name, 0, 200), mb_substr($email, 0, 200), mb_substr($message, 0, 4000)]);

log_activity('sent', 'Contact message', $name . ' <' . $email . '>');

json_response(['ok' => true], 201);
