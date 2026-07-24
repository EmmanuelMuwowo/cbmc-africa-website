<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

date_default_timezone_set('UTC');

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function json_error(string $message, int $status = 400): void {
    json_response(['error' => $message], $status);
}

function json_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_method(string $method): void {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_error('Method not allowed.', 405);
    }
}

function is_valid_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function initials(string $name): string {
    $parts = preg_split('/\s+/', trim($name));
    $out = '';
    foreach (array_slice($parts, 0, 2) as $p) {
        if ($p !== '') $out .= mb_strtoupper(mb_substr($p, 0, 1));
    }
    return $out;
}

function date_label(?string $date): string {
    if (!$date) return '—';
    $ts = strtotime($date);
    return strtoupper(date('F j, Y', $ts));
}

function short_date_label(?string $date): string {
    if (!$date) return '—';
    $ts = strtotime($date);
    return date('M j, Y', $ts);
}

function slugify(string $title): string {
    $base = strtolower(trim($title));
    $base = preg_replace('/[^a-z0-9]+/', '-', $base);
    $base = trim($base, '-');
    $base = substr($base ?: 'entry', 0, 80);
    return $base . '-' . bin2hex(random_bytes(3));
}
