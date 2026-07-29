<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $row = db()->query('SELECT hero_type, hero_url FROM settings WHERE id = 1')->fetch();
    json_response(['heroType' => $row['hero_type'], 'heroUrl' => $row['hero_url']]);
}

require_method('POST');

$type = in_array($_POST['heroType'] ?? '', ['image', 'video'], true) ? $_POST['heroType'] : 'image';
$externalUrl = trim($_POST['heroUrl'] ?? '');

$allowed = $type === 'video'
    ? ['video/mp4' => 'mp4', 'video/webm' => 'webm']
    : ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$maxBytes = $type === 'video' ? 40 * 1024 * 1024 : 8 * 1024 * 1024;

$uploaded = handle_upload('heroFile', 'hero', $allowed, $maxBytes);

if ($uploaded) {
    $url = $uploaded['url'];
} elseif ($externalUrl !== '') {
    if (!filter_var($externalUrl, FILTER_VALIDATE_URL)) json_error('Enter a valid URL.');
    $url = $externalUrl;
} else {
    json_error('Upload a file or provide an external URL.');
}

$old = db()->query('SELECT hero_url FROM settings WHERE id = 1')->fetch();

$stmt = db()->prepare('UPDATE settings SET hero_type = ?, hero_url = ? WHERE id = 1');
$stmt->execute([$type, $url]);

if ($old && $old['hero_url'] !== $url) {
    delete_uploaded_file($old['hero_url']);
}

json_response(['heroType' => $type, 'heroUrl' => $url]);
