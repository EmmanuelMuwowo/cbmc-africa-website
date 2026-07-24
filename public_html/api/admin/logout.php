<?php
require_once __DIR__ . '/../includes/auth.php';
start_session();
$_SESSION = [];
session_destroy();
json_response(['ok' => true]);
