<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM media ORDER BY uploaded_at DESC')->fetchAll();
    json_response(array_map(fn($m) => ['id' => (int)$m['id'], 'name' => $m['filename'], 'src' => $m['url']], $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_error('Missing id.');

    $row = db()->prepare('SELECT filename, url FROM media WHERE id = ?');
    $row->execute([$id]);
    $found = $row->fetch();
    if (!$found) json_error('Not found.', 404);

    $stmt = db()->prepare('DELETE FROM media WHERE id = ?');
    $stmt->execute([$id]);

    if (str_starts_with($found['url'], '/uploads/')) {
        $diskPath = __DIR__ . '/../../' . ltrim($found['url'], '/');
        if (is_file($diskPath)) @unlink($diskPath);
    }

    log_admin_activity('deleted', 'Media file', $found['filename']);
    json_response(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        json_error('No file uploaded.');
    }

    $file = $_FILES['file'];
    $maxSize = 8 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        json_error('File is too large (max 8MB).');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed = [
        'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'
    ];
    if (!isset($allowed[$mime])) {
        json_error('Only PNG, JPEG, WEBP, or GIF images are allowed.');
    }

    $ext = $allowed[$mime];
    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    $destDir = __DIR__ . '/../../uploads';
    $dest = $destDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        json_error('Could not save the uploaded file.', 500);
    }

    $url = '/uploads/' . $filename;
    $stmt = db()->prepare('INSERT INTO media (filename, url) VALUES (?, ?)');
    $stmt->execute([$file['name'], $url]);
    $newId = (int)db()->lastInsertId();
    log_admin_activity('uploaded', 'Media file', $file['name']);

    json_response(['id' => $newId, 'name' => $file['name'], 'src' => $url], 201);
}

json_error('Method not allowed.', 405);
