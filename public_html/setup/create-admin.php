<?php
// One-time setup page: creates the first admin account.
// Visit this once after importing database.sql, then DELETE THIS FILE (or this
// whole /setup folder) - leaving it live would let anyone create admin accounts.
require_once __DIR__ . '/../api/includes/bootstrap.php';

$pdo = db();
$existing = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();

$error = '';
$done = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($existing > 0) {
        $error = 'An admin account already exists. Delete this file - it will not create another.';
    } else {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        if ($name === '' || !is_valid_email($email) || strlen($password) < 8) {
            $error = 'Please provide a name, a valid email, and a password of at least 8 characters.';
        } else {
            $stmt = $pdo->prepare('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $done = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Create admin account — CBMC Africa setup</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>
  body { font-family: system-ui, sans-serif; background: #f2f2f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  h1 { font-size: 20px; margin: 0 0 18px; }
  label { display: block; font-size: 13px; font-weight: 600; margin: 14px 0 6px; color: #444; }
  input { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
  button { margin-top: 20px; width: 100%; padding: 12px; border: none; border-radius: 8px; background: #0071e3; color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; }
  .error { color: #b3261e; font-size: 13px; margin-top: 12px; }
  .success { color: #1a7f37; font-size: 14px; }
  .warn { background: #fff8e6; border: 1px solid #f0d98a; padding: 12px 14px; border-radius: 8px; font-size: 13px; margin-top: 16px; }
</style>
</head>
<body>
<div class="card">
  <h1>Create admin account</h1>
  <?php if ($done): ?>
    <p class="success">Admin account created. You can now sign in at <a href="../admin/login.html">/admin/login.html</a>.</p>
    <div class="warn">Now delete this <code>/setup</code> folder from your server — leaving it live is a security risk.</div>
  <?php elseif ($existing > 0): ?>
    <p class="error">An admin account already exists. This page will not create another. Delete this <code>/setup</code> folder.</p>
  <?php else: ?>
    <form method="post">
      <label>Full name</label>
      <input name="name" required>
      <label>Email</label>
      <input name="email" type="email" required>
      <label>Password (min. 8 characters)</label>
      <input name="password" type="password" required minlength="8">
      <button type="submit">Create admin account</button>
    </form>
    <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
  <?php endif; ?>
</div>
</body>
</html>
