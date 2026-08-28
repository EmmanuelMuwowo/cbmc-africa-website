<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

const ALLOWED_PHOTO_TYPES = [
    'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'
];
const MAX_PHOTO_SIZE = 8 * 1024 * 1024;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM leaders ORDER BY sort_order ASC, name ASC')->fetchAll();
    json_response(array_map('serialize_leader', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_GET['id'] ?? 0);
    $isUpdate = $id > 0;

    $name = trim($_POST['name'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $region = trim($_POST['region'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $sortOrder = (int)($_POST['sortOrder'] ?? 0);
    $status = in_array($_POST['status'] ?? '', ['Published', 'Draft'], true) ? $_POST['status'] : 'Draft';

    if ($name === '') json_error('Name is required.');
    if ($email !== '' && !is_valid_email($email)) json_error('Enter a valid email address.');

    $photoUrl = null;
    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo'];
        if ($file['size'] > MAX_PHOTO_SIZE) json_error('Photo is too large (max 8MB).');

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset(ALLOWED_PHOTO_TYPES[$mime])) {
            json_error('Only PNG, JPEG, WEBP, or GIF images are allowed.');
        }

        $ext = ALLOWED_PHOTO_TYPES[$mime];
        $filename = bin2hex(random_bytes(16)) . '.' . $ext;
        $dest = __DIR__ . '/../../uploads/leaders/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            json_error('Could not save the uploaded photo.', 500);
        }
        $photoUrl = '/uploads/leaders/' . $filename;
    }

    if ($isUpdate) {
        if ($photoUrl) {
            $stmt = db()->prepare(
                'UPDATE leaders SET name=?, title=?, region=?, bio=?, email=?, phone=?, sort_order=?, status=?, photo_url=? WHERE id=?'
            );
            $stmt->execute([$name, $title, $region, $bio, $email, $phone, $sortOrder, $status, $photoUrl, $id]);
        } else {
            $stmt = db()->prepare(
                'UPDATE leaders SET name=?, title=?, region=?, bio=?, email=?, phone=?, sort_order=?, status=? WHERE id=?'
            );
            $stmt->execute([$name, $title, $region, $bio, $email, $phone, $sortOrder, $status, $id]);
        }
        $row = db()->prepare('SELECT * FROM leaders WHERE id = ?');
        $row->execute([$id]);
        $found = $row->fetch();
        if (!$found) json_error('Not found.', 404);
        log_admin_activity('updated', 'Leader', $name);
        json_response(serialize_leader($found));
    }

    $stmt = db()->prepare(
        'INSERT INTO leaders (name, title, region, bio, email, phone, sort_order, status, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$name, $title, $region, $bio, $email, $phone, $sortOrder, $status, $photoUrl]);
    $newId = (int)db()->lastInsertId();
    log_admin_activity('created', 'Leader', $name);
    $row = db()->prepare('SELECT * FROM leaders WHERE id = ?');
    $row->execute([$newId]);
    json_response(serialize_leader($row->fetch()), 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_error('Missing id.');

    $row = db()->prepare('SELECT name, photo_url FROM leaders WHERE id = ?');
    $row->execute([$id]);
    $found = $row->fetch();
    if (!$found) json_error('Not found.', 404);

    $stmt = db()->prepare('DELETE FROM leaders WHERE id = ?');
    $stmt->execute([$id]);

    if (!empty($found['photo_url'])) {
        $diskPath = __DIR__ . '/../../' . ltrim($found['photo_url'], '/');
        if (is_file($diskPath)) @unlink($diskPath);
    }

    log_admin_activity('deleted', 'Leader', $found['name']);
    json_response(['ok' => true]);
}

json_error('Method not allowed.', 405);
