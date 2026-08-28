<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM news ORDER BY published_date DESC')->fetchAll();
    json_response(array_map('serialize_news', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_body();
    $title = trim($body['title'] ?? '');
    $author = trim($body['author'] ?? '');
    $bodyText = trim($body['body'] ?? '');
    $status = valid_status($body['status'] ?? null);
    $date = trim($body['date'] ?? '');

    if ($title === '' || $author === '') {
        json_error('Title and author are required.');
    }

    $slug = slugify($title);
    $blocks = $bodyText !== '' ? [mb_substr($bodyText, 0, 8000)] : [];
    $dateValue = $date !== '' ? $date : date('Y-m-d');

    $stmt = db()->prepare(
        'INSERT INTO news (slug, title, author, published_date, excerpt, blocks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $slug, mb_substr($title, 0, 300), mb_substr($author, 0, 200),
        $dateValue, mb_substr($bodyText, 0, 240), json_encode($blocks), $status
    ]);

    $id = (int)db()->lastInsertId();
    log_admin_activity('created', 'News article', $title);
    $row = db()->prepare('SELECT * FROM news WHERE id = ?');
    $row->execute([$id]);
    json_response(serialize_news($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
