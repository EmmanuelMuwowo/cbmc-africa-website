<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $row = db()->prepare('SELECT title, image_url FROM devotionals WHERE id = ?');
    $row->execute([$id]);
    $found = $row->fetch();
    if (!$found) json_error('Not found.', 404);

    $stmt = db()->prepare('DELETE FROM devotionals WHERE id = ?');
    $stmt->execute([$id]);
    delete_uploaded_file($found['image_url']);
    log_admin_activity('deleted', 'Monday Manna', $found['title'] ?? '');
    json_response(['ok' => true]);
}

require_method('POST');

$title = trim($_POST['title'] ?? '');
$author = trim($_POST['author'] ?? '');
$bodyText = trim($_POST['body'] ?? '');
$status = valid_status($_POST['status'] ?? null);
$date = trim($_POST['date'] ?? '');

if ($title === '' || $author === '') {
    json_error('Title and author are required.');
}

$existing = db()->prepare('SELECT image_url FROM devotionals WHERE id = ?');
$existing->execute([$id]);
$existingRow = $existing->fetch();
if (!$existingRow) json_error('Not found.', 404);

$newImageUrl = handle_image_upload('image', 'devotionals');

$blocks = $bodyText !== '' ? [['t' => 'p', 'x' => mb_substr($bodyText, 0, 8000)]] : [];

$sql = 'UPDATE devotionals SET title = ?, author = ?, author_initials = ?, excerpt = ?, blocks = ?, status = ?';
$params = [mb_substr($title, 0, 300), mb_substr($author, 0, 200), initials($author), mb_substr($bodyText, 0, 240), json_encode($blocks), $status];
if ($date !== '') {
    $sql .= ', devotional_date = ?';
    $params[] = $date;
}
if ($newImageUrl) {
    $sql .= ', image_url = ?';
    $params[] = $newImageUrl;
}
$sql .= ' WHERE id = ?';
$params[] = $id;

$stmt = db()->prepare($sql);
$stmt->execute($params);

if ($newImageUrl) {
    delete_uploaded_file($existingRow['image_url']);
}

log_admin_activity('updated', 'Monday Manna', $title);

$row = db()->prepare('SELECT * FROM devotionals WHERE id = ?');
$row->execute([$id]);
json_response(serialize_devotional($row->fetch()));
