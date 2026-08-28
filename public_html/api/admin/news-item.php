<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $existing = db()->prepare('SELECT title FROM news WHERE id = ?');
    $existing->execute([$id]);
    $existingTitle = $existing->fetchColumn();

    $stmt = db()->prepare('DELETE FROM news WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_error('Not found.', 404);
    log_admin_activity('deleted', 'News article', $existingTitle ?: '');
    json_response(['ok' => true]);
}

require_method('PUT');

$body = json_body();
$title = trim($body['title'] ?? '');
$author = trim($body['author'] ?? '');
$bodyText = trim($body['body'] ?? '');
$status = valid_status($body['status'] ?? null);
$date = trim($body['date'] ?? '');

if ($title === '' || $author === '') {
    json_error('Title and author are required.');
}

$blocks = $bodyText !== '' ? [mb_substr($bodyText, 0, 8000)] : [];

$sql = 'UPDATE news SET title = ?, author = ?, excerpt = ?, blocks = ?, status = ?';
$params = [mb_substr($title, 0, 300), mb_substr($author, 0, 200), mb_substr($bodyText, 0, 240), json_encode($blocks), $status];
if ($date !== '') {
    $sql .= ', published_date = ?';
    $params[] = $date;
}
$sql .= ' WHERE id = ?';
$params[] = $id;

$stmt = db()->prepare($sql);
$stmt->execute($params);

$row = db()->prepare('SELECT * FROM news WHERE id = ?');
$row->execute([$id]);
$found = $row->fetch();
if (!$found) json_error('Not found.', 404);
log_admin_activity('updated', 'News article', $title);
json_response(serialize_news($found));
