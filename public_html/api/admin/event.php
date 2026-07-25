<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = db()->prepare('DELETE FROM events WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_error('Not found.', 404);
    json_response(['ok' => true]);
}

require_method('PUT');

$body = json_body();
$title = trim($body['title'] ?? '');
$category = in_array($body['category'] ?? '', ['AFRICA', 'INTERNATIONAL'], true) ? $body['category'] : 'AFRICA';
$location = trim($body['location'] ?? '');
$date = trim($body['date'] ?? '');
$datesLabel = trim($body['datesLabel'] ?? '');
$time = trim($body['time'] ?? '');
$format = trim($body['format'] ?? '');
$cost = trim($body['cost'] ?? '');
$host = trim($body['host'] ?? '');
$description = trim($body['description'] ?? '');

if ($title === '' || $location === '' || $date === '') {
    json_error('Title, location and date are required.');
}
if ($datesLabel === '') $datesLabel = $date;

$stmt = db()->prepare(
    'UPDATE events SET title=?, category=?, location=?, event_date=?, dates_label=?, time_label=?, format=?, cost=?, host=?, description=? WHERE id=?'
);
$stmt->execute([
    mb_substr($title, 0, 300), $category, mb_substr($location, 0, 200), $date,
    mb_substr($datesLabel, 0, 100), mb_substr($time, 0, 100), mb_substr($format, 0, 100),
    mb_substr($cost, 0, 50), mb_substr($host, 0, 150), $description, $id
]);

$row = db()->prepare('SELECT * FROM events WHERE id = ?');
$row->execute([$id]);
$found = $row->fetch();
if (!$found) json_error('Not found.', 404);
json_response(serialize_event($found));
