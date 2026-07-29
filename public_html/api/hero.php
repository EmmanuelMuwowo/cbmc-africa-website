<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_method('GET');

$row = db()->query('SELECT hero_type, hero_url FROM settings WHERE id = 1')->fetch();
json_response(['heroType' => $row['hero_type'], 'heroUrl' => $row['hero_url']]);
