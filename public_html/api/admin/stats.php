<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

$pdo = db();

$pubCount = (int)$pdo->query("SELECT (SELECT COUNT(*) FROM devotionals WHERE status='Published') + (SELECT COUNT(*) FROM news WHERE status='Published')")->fetchColumn();
$mannaCount = (int)$pdo->query('SELECT COUNT(*) FROM devotionals')->fetchColumn();
$subCount = (int)$pdo->query('SELECT COUNT(*) FROM subscribers')->fetchColumn();
$msgCount = (int)$pdo->query('SELECT COUNT(*) FROM messages WHERE replied = 0')->fetchColumn();
$evCount = (int)$pdo->query('SELECT COUNT(*) FROM events WHERE event_date >= CURDATE()')->fetchColumn();
$nextEvent = $pdo->query("SELECT dates_label FROM events WHERE event_date >= CURDATE() ORDER BY event_date ASC LIMIT 1")->fetch();
$recentManna = $pdo->query('SELECT title, author, devotional_date, status FROM devotionals ORDER BY devotional_date DESC LIMIT 5')->fetchAll();
$recentMsgs = $pdo->query('SELECT name, email, message, created_at FROM messages ORDER BY created_at DESC LIMIT 3')->fetchAll();

json_response([
    'stats' => [
        ['label' => 'Published Articles', 'value' => (string)$pubCount, 'delta' => 'Live on the site', 'deltaColor' => '#1a7f37'],
        ['label' => 'Monday Manna', 'value' => (string)$mannaCount, 'delta' => 'Total entries', 'deltaColor' => '#1a7f37'],
        ['label' => 'Subscribers', 'value' => (string)$subCount, 'delta' => 'Newsletter list', 'deltaColor' => '#1a7f37'],
        ['label' => 'Pending Messages', 'value' => (string)$msgCount, 'delta' => $msgCount > 0 ? 'Needs response' : 'All caught up', 'deltaColor' => $msgCount > 0 ? '#b3261e' : '#6e6e73'],
        ['label' => 'Upcoming Events', 'value' => (string)$evCount, 'delta' => $nextEvent ? ('Next: ' . $nextEvent['dates_label']) : 'None scheduled', 'deltaColor' => '#6e6e73']
    ],
    'dashPosts' => array_map(fn($r) => [
        'title' => $r['title'], 'author' => $r['author'], 'date' => short_date_label($r['devotional_date']), 'status' => $r['status']
    ], $recentManna),
    'dashMessages' => array_map(fn($m) => [
        'initials' => initials($m['name']), 'name' => $m['name'], 'preview' => $m['message'], 'time' => short_date_label($m['created_at'])
    ], $recentMsgs)
]);
