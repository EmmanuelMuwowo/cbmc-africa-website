<?php
require_once __DIR__ . '/../includes/auth.php';
require_method('POST');

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!login_attempts_ok($ip)) {
    json_error('Too many login attempts. Please try again in a few minutes.', 429);
}

$body = json_body();
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if ($email === '' || $password === '') {
    json_error('Email and password are required.');
}

record_login_attempt($ip);

$stmt = db()->prepare('SELECT * FROM admins WHERE email = ?');
$stmt->execute([mb_strtolower($email)]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    log_activity('failed sign-in attempt', 'Account', $email, 'Unknown');
    json_error('Invalid email or password.', 401);
}

start_session();
session_regenerate_id(true);
$_SESSION['admin_id'] = (int)$admin['id'];
$_SESSION['admin_name'] = $admin['name'];

log_activity('signed in', 'Account', '', $admin['name']);

json_response(['id' => (int)$admin['id'], 'name' => $admin['name'], 'email' => $admin['email']]);
