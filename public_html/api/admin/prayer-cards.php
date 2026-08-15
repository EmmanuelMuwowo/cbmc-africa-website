<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM prayer_cards ORDER BY sort_order ASC, id ASC')->fetchAll();
    json_response(array_map('serialize_prayer_card', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_body();
    $title = trim($body['title'] ?? '');
    $cardBody = trim($body['body'] ?? '');
    $sortOrder = (int)($body['sortOrder'] ?? 0);
    $status = in_array($body['status'] ?? '', ['Published', 'Draft'], true) ? $body['status'] : 'Draft';

    if ($title === '' || $cardBody === '') {
        json_error('Title and body are required.');
    }

    $stmt = db()->prepare('INSERT INTO prayer_cards (title, body, sort_order, status) VALUES (?, ?, ?, ?)');
    $stmt->execute([mb_substr($title, 0, 300), $cardBody, $sortOrder, $status]);

    $id = (int)db()->lastInsertId();
    $row = db()->prepare('SELECT * FROM prayer_cards WHERE id = ?');
    $row->execute([$id]);
    json_response(serialize_prayer_card($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
