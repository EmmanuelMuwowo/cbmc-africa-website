<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';

$rows = db()->query("SELECT * FROM resources WHERE status = 'Published' ORDER BY published_date DESC")->fetchAll();
json_response(array_map('serialize_resource', $rows));
