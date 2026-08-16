<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_method('GET');

$email = trim($_GET['email'] ?? '');
$token = trim($_GET['token'] ?? '');
$ok = false;

if ($email !== '' && $token !== '') {
    $stmt = db()->prepare('SELECT id, unsubscribe_token FROM subscribers WHERE email = ?');
    $stmt->execute([$email]);
    $sub = $stmt->fetch();
    if ($sub && $sub['unsubscribe_token'] !== '' && hash_equals($sub['unsubscribe_token'], $token)) {
        $del = db()->prepare('DELETE FROM subscribers WHERE id = ?');
        $del->execute([$sub['id']]);
        $ok = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Unsubscribe — CBMC Africa</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #fff; border-radius: 22px; padding: 36px 32px; width: 100%; max-width: 420px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px rgba(0,0,0,.06); text-align: center; }
  h1 { font-size: 20px; margin: 0 0 12px; color: #1d1d1f; }
  p { color: #6e6e73; font-size: 14.5px; line-height: 1.6; }
  a.btn { display: inline-block; margin-top: 18px; background: #1d1d1f; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 26px; border-radius: 980px; }
</style>
</head>
<body>
<div class="card">
  <?php if ($ok): ?>
    <h1>You're unsubscribed</h1>
    <p>You won't receive any more Monday Manna emails from CBMC Africa. Sorry to see you go — you're welcome to sign up again anytime.</p>
  <?php else: ?>
    <h1>Link not recognized</h1>
    <p>This unsubscribe link is invalid or has already been used. If you're still receiving emails you don't want, please contact us and we'll remove you directly.</p>
  <?php endif; ?>
  <a class="btn" href="../index.html">Back to the site</a>
</div>
</body>
</html>
