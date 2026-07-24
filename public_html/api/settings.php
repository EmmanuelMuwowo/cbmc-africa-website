<?php
require_once __DIR__ . '/includes/bootstrap.php';

$row = db()->query('SELECT org_name, public_email, phone, address, donate_url FROM settings WHERE id = 1')->fetch();
json_response([
    'org_name' => $row['org_name'],
    'public_email' => $row['public_email'],
    'phone' => $row['phone'],
    'address' => $row['address'],
    'donate_url' => $row['donate_url']
]);
