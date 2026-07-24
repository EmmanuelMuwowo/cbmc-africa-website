<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM devotionals ORDER BY devotional_date DESC')->fetchAll();
    json_response(array_map('serialize_devotional', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_body();
    $title = trim($body['title'] ?? '');
    $author = trim($body['author'] ?? '');
    $bodyText = trim($body['body'] ?? '');

    if ($title === '' || $author === '') {
        json_error('Title and author are required.');
    }

    $slug = slugify($title);
    $blocks = $bodyText !== '' ? [['t' => 'p', 'x' => mb_substr($bodyText, 0, 8000)]] : [];

    $stmt = db()->prepare(
        'INSERT INTO devotionals (slug, title, author, author_initials, devotional_date, excerpt, blocks, reflection, status)
         VALUES (?, ?, ?, ?, CURDATE(), ?, ?, JSON_ARRAY(), \'Draft\')'
    );
    $stmt->execute([
        $slug, mb_substr($title, 0, 300), mb_substr($author, 0, 200), initials($author),
        mb_substr($bodyText, 0, 240), json_encode($blocks)
    ]);

    $id = (int)db()->lastInsertId();
    $row = db()->prepare('SELECT * FROM devotionals WHERE id = ?');
    $row->execute([$id]);
    json_response(serialize_devotional($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
