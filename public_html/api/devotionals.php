<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';

$rows = db()->query("SELECT * FROM devotionals WHERE status = 'Published' ORDER BY devotional_date DESC")->fetchAll();
json_response(array_map('serialize_devotional', $rows));
