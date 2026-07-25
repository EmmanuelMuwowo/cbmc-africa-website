<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM events ORDER BY event_date ASC')->fetchAll();
    json_response(array_map('serialize_event', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        'INSERT INTO events (title, category, location, event_date, dates_label, time_label, format, cost, host, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        mb_substr($title, 0, 300), $category, mb_substr($location, 0, 200), $date,
        mb_substr($datesLabel, 0, 100), mb_substr($time, 0, 100), mb_substr($format, 0, 100),
        mb_substr($cost, 0, 50), mb_substr($host, 0, 150), $description
    ]);

    $id = (int)db()->lastInsertId();
    $row = db()->prepare('SELECT * FROM events WHERE id = ?');
    $row->execute([$id]);
    json_response(serialize_event($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
