<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();
require_method('PUT');

$id = (int)($_GET['id'] ?? 0);
$body = json_body();
$title = trim($body['title'] ?? '');
$author = trim($body['author'] ?? '');
$bodyText = trim($body['body'] ?? '');

if (!$id || $title === '' || $author === '') {
    json_error('Title and author are required.');
}

$blocks = $bodyText !== '' ? [['t' => 'p', 'x' => mb_substr($bodyText, 0, 8000)]] : [];

$stmt = db()->prepare(
    'UPDATE devotionals SET title = ?, author = ?, author_initials = ?, excerpt = ?, blocks = ? WHERE id = ?'
);
$stmt->execute([
    mb_substr($title, 0, 300), mb_substr($author, 0, 200), initials($author),
    mb_substr($bodyText, 0, 240), json_encode($blocks), $id
]);

$row = db()->prepare('SELECT * FROM devotionals WHERE id = ?');
$row->execute([$id]);
$found = $row->fetch();
if (!$found) json_error('Not found.', 404);
json_response(serialize_devotional($found));
