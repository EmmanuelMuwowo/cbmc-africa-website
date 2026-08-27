<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM devotionals ORDER BY devotional_date DESC')->fetchAll();
    json_response(array_map('serialize_devotional', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $author = trim($_POST['author'] ?? '');
    $bodyText = trim($_POST['body'] ?? '');
    $status = valid_status($_POST['status'] ?? null);
    $date = trim($_POST['date'] ?? '');

    if ($title === '' || $author === '') {
        json_error('Title and author are required.');
    }

    $slug = slugify($title);
    $blocks = $bodyText !== '' ? [['t' => 'p', 'x' => mb_substr($bodyText, 0, 8000)]] : [];
    $dateValue = $date !== '' ? $date : date('Y-m-d');
    $imageUrl = handle_image_upload('image', 'devotionals');

    $stmt = db()->prepare(
        'INSERT INTO devotionals (slug, title, author, author_initials, devotional_date, excerpt, blocks, reflection, status, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, JSON_ARRAY(), ?, ?)'
    );
    $stmt->execute([
        $slug, mb_substr($title, 0, 300), mb_substr($author, 0, 200), initials($author),
        $dateValue, mb_substr($bodyText, 0, 240), json_encode($blocks), $status, $imageUrl
    ]);

    $id = (int)db()->lastInsertId();
    log_admin_activity('created', 'Monday Manna', $title);
    $row = db()->prepare('SELECT * FROM devotionals WHERE id = ?');
    $row->execute([$id]);
    json_response(serialize_devotional($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
