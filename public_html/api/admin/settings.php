<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $row = db()->query('SELECT * FROM settings WHERE id = 1')->fetch();
    json_response([
        'orgName' => $row['org_name'], 'publicEmail' => $row['public_email'],
        'phone' => $row['phone'], 'address' => $row['address'],
        'mannaEmailEnabled' => (bool)$row['manna_email_enabled'], 'donateUrl' => $row['donate_url']
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $body = json_body();
    $orgName = trim($body['orgName'] ?? '');
    $publicEmail = trim($body['publicEmail'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $address = trim($body['address'] ?? '');

    if ($orgName === '' || !is_valid_email($publicEmail)) {
        json_error('Organization name and a valid email are required.');
    }

    $stmt = db()->prepare('UPDATE settings SET org_name = ?, public_email = ?, phone = ?, address = ? WHERE id = 1');
    $stmt->execute([mb_substr($orgName, 0, 200), mb_substr($publicEmail, 0, 200), mb_substr($phone, 0, 60), mb_substr($address, 0, 300)]);

    json_response(['ok' => true]);
}

json_error('Method not allowed.', 405);
