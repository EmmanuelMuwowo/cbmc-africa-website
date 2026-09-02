<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
require_method('POST');

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('Missing id.');

$body = json_body();
$replyBody = trim($body['body'] ?? '');
if ($replyBody === '') json_error('Write a reply message first.');

$stmt = db()->prepare('SELECT * FROM messages WHERE id = ?');
$stmt->execute([$id]);
$msg = $stmt->fetch();
if (!$msg) json_error('Not found.', 404);

$settings = db()->query('SELECT org_name, public_email FROM settings WHERE id = 1')->fetch();
$orgName = $settings['org_name'] ?? 'CBMC Africa';
$fromEmail = $settings['public_email'] ?? 'no-reply@localhost';

$subject = 'Re: your message to ' . $orgName;
$emailBody = $replyBody . "\n\n---\nYour original message:\n" . $msg['message'];

$sent = send_app_mail($msg['email'], $msg['name'], $subject, $emailBody, $fromEmail, $orgName);

if (!$sent) {
    $hint = defined('SMTP_HOST') && SMTP_HOST !== ''
        ? "Could not send the email via SMTP - check SMTP_HOST/SMTP_USER/SMTP_PASS in config.php, and your server's error log for details."
        : "Could not send the email. This usually means the server's mail (PHP mail() / sendmail) isn't configured yet - check with your hosting provider, or set SMTP_HOST in config.php to send through a real mailbox instead.";
    json_error($hint, 500);
}

$upd = db()->prepare('UPDATE messages SET replied = 1, reply_body = ?, replied_at = NOW() WHERE id = ?');
$upd->execute([mb_substr($replyBody, 0, 4000), $id]);

log_admin_activity('replied to', 'Contact message', $msg['name'] . ' <' . $msg['email'] . '>');
json_response(['ok' => true]);
