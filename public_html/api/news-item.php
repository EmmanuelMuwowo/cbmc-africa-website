<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/serializers.php';

$slug = $_GET['slug'] ?? '';
$stmt = db()->prepare("SELECT * FROM news WHERE slug = ? AND status = 'Published'");
$stmt->execute([$slug]);
$row = $stmt->fetch();
if (!$row) json_error('Not found.', 404);
json_response(serialize_news($row));
