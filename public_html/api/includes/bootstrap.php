<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mailer.php';

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

function valid_status(?string $status): string {
    return in_array($status, ['Published', 'Scheduled', 'Draft'], true) ? $status : 'Draft';
}

/**
 * Records something that happened on the site, for the admin Activity Log.
 * Logging must never break the action it is recording, so failures are swallowed.
 */
function log_activity(string $action, string $entityType, string $entityLabel = '', string $actor = 'Visitor'): void {
    try {
        $stmt = db()->prepare(
            'INSERT INTO activity_log (actor, action, entity_type, entity_label) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            mb_substr($actor, 0, 200),
            mb_substr($action, 0, 50),
            mb_substr($entityType, 0, 60),
            mb_substr($entityLabel, 0, 300)
        ]);
    } catch (Throwable $e) {
        // Intentionally ignored - a logging failure should never surface to the user.
    }
}

function handle_upload(string $field, string $subdir, array $allowedMimes, int $maxBytes = 8 * 1024 * 1024): ?array {
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) return null;
    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) json_error('Upload failed.');

    $file = $_FILES[$field];
    if ($file['size'] > $maxBytes) {
        json_error('File is too large (max ' . round($maxBytes / (1024 * 1024)) . 'MB).');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!isset($allowedMimes[$mime])) {
        json_error('Unsupported file type.');
    }

    $ext = $allowedMimes[$mime];
    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    $destDir = __DIR__ . '/../../uploads/' . $subdir;
    if (!is_dir($destDir)) @mkdir($destDir, 0775, true);
    $dest = $destDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        json_error('Could not save the uploaded file.', 500);
    }

    return ['url' => '/uploads/' . $subdir . '/' . $filename, 'mime' => $mime];
}

function handle_image_upload(string $field, string $subdir): ?string {
    $allowed = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $result = handle_upload($field, $subdir, $allowed);
    return $result ? $result['url'] : null;
}

function delete_uploaded_file(?string $url): void {
    if (!$url || !str_starts_with($url, '/uploads/')) return;
    $diskPath = __DIR__ . '/../../' . ltrim($url, '/');
    if (is_file($diskPath)) @unlink($diskPath);
}

function slugify(string $title): string {
    $base = strtolower(trim($title));
    $base = preg_replace('/[^a-z0-9]+/', '-', $base);
    $base = trim($base, '-');
    $base = substr($base ?: 'entry', 0, 80);
    return $base . '-' . bin2hex(random_bytes(3));
}
