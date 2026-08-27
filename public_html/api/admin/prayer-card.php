<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $existing = db()->prepare('SELECT title FROM prayer_cards WHERE id = ?');
    $existing->execute([$id]);
    $existingTitle = $existing->fetchColumn();

    $stmt = db()->prepare('DELETE FROM prayer_cards WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_error('Not found.', 404);
    log_admin_activity('deleted', 'Prayer card', $existingTitle ?: '');
    json_response(['ok' => true]);
}

require_method('PUT');

$body = json_body();
$title = trim($body['title'] ?? '');
$cardBody = trim($body['body'] ?? '');
$sortOrder = (int)($body['sortOrder'] ?? 0);
$status = in_array($body['status'] ?? '', ['Published', 'Draft'], true) ? $body['status'] : 'Draft';

if ($title === '' || $cardBody === '') {
    json_error('Title and body are required.');
}

$stmt = db()->prepare('UPDATE prayer_cards SET title = ?, body = ?, sort_order = ?, status = ? WHERE id = ?');
$stmt->execute([mb_substr($title, 0, 300), $cardBody, $sortOrder, $status, $id]);

$row = db()->prepare('SELECT * FROM prayer_cards WHERE id = ?');
$row->execute([$id]);
$found = $row->fetch();
if (!$found) json_error('Not found.', 404);
log_admin_activity('updated', 'Prayer card', $title);
json_response(serialize_prayer_card($found));
