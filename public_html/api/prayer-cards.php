<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';
require_method('GET');

$rows = db()->query("SELECT * FROM prayer_cards WHERE status = 'Published' ORDER BY sort_order ASC, id ASC")->fetchAll();
json_response(array_map('serialize_prayer_card', $rows));
