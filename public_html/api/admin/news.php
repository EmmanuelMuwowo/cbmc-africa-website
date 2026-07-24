<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

$rows = db()->query('SELECT * FROM news ORDER BY published_date DESC')->fetchAll();
json_response(array_map('serialize_news', $rows));
