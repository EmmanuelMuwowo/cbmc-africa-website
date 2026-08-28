<?php
require_once __DIR__ . '/bootstrap.php';

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 8,
        'path' => '/',
        'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true
    ]);
    session_name(APP_SESSION_NAME);
    session_start();
}

function current_admin_id(): ?int {
    start_session();
    return $_SESSION['admin_id'] ?? null;
}

function current_admin_name(): string {
    $id = current_admin_id();
    if (!$id) return 'System';
    static $name = null;
    if ($name === null) {
        $stmt = db()->prepare('SELECT name FROM admins WHERE id = ?');
        $stmt->execute([$id]);
        $name = $stmt->fetchColumn() ?: 'Admin';
    }
    return $name;
}

/** Records an admin action in the Activity Log, attributed to the signed-in admin. */
function log_admin_activity(string $action, string $entityType, string $entityLabel = ''): void {
    log_activity($action, $entityType, $entityLabel, current_admin_name());
}

function require_admin(): int {
    $id = current_admin_id();
    if (!$id) {
        json_error('Not authenticated.', 401);
    }
    return $id;
}

function login_attempts_ok(string $ip): bool {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > (NOW() - INTERVAL 15 MINUTE)');
    $stmt->execute([$ip]);
    return (int)$stmt->fetchColumn() < 10;
}

function record_login_attempt(string $ip): void {
    $pdo = db();
    $stmt = $pdo->prepare('INSERT INTO login_attempts (ip, attempted_at) VALUES (?, NOW())');
    $stmt->execute([$ip]);
    // opportunistic cleanup of old rows
    $pdo->exec('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');
}
