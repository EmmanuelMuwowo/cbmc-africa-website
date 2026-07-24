<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM media ORDER BY uploaded_at DESC')->fetchAll();
    json_response(array_map(fn($m) => ['name' => $m['filename'], 'src' => $m['url']], $rows));
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

    json_response(['name' => $file['name'], 'src' => $url], 201);
}

json_error('Method not allowed.', 405);
