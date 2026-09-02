<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * Sends any published, not-yet-emailed Monday Manna devotional(s) to every subscriber.
 * Safe to call repeatedly - each devotional is only ever emailed once (emailed_at gating).
 * Returns a summary array; never throws for expected conditions (disabled, nothing to send).
 */
function send_weekly_manna(): array {
    $settings = db()->query('SELECT * FROM settings WHERE id = 1')->fetch();
    if (!$settings || !$settings['manna_email_enabled']) {
        return ['sent' => false, 'reason' => 'disabled', 'devotionals' => []];
    }

    $due = db()->query(
        "SELECT * FROM devotionals
         WHERE status = 'Published' AND emailed_at IS NULL AND devotional_date <= CURDATE()
         ORDER BY devotional_date ASC"
    )->fetchAll();

    if (!$due) {
        return ['sent' => false, 'reason' => 'nothing_due', 'devotionals' => []];
    }

    $subscribers = db()->query('SELECT * FROM subscribers')->fetchAll();
    if (!$subscribers) {
        // Still mark these as emailed - there was simply no one to send to.
        foreach ($due as $d) {
            $stmt = db()->prepare('UPDATE devotionals SET emailed_at = NOW() WHERE id = ?');
            $stmt->execute([$d['id']]);
        }
        return ['sent' => false, 'reason' => 'no_subscribers', 'devotionals' => array_column($due, 'title')];
    }

    $orgName = $settings['org_name'] ?: 'CBMC Africa';
    $fromEmail = $settings['public_email'] ?: 'no-reply@localhost';
    $results = [];

    foreach ($due as $devo) {
        $excerpt = trim((string)$devo['excerpt']);
        $link = rtrim(SITE_URL, '/') . '/article.html?type=devo&slug=' . urlencode($devo['slug']);
        $sentCount = 0;
        $failCount = 0;

        foreach ($subscribers as $sub) {
            $token = $sub['unsubscribe_token'];
            if ($token === '') {
                $token = bin2hex(random_bytes(24));
                $upd = db()->prepare('UPDATE subscribers SET unsubscribe_token = ? WHERE id = ?');
                $upd->execute([$token, $sub['id']]);
            }
            $unsubscribeLink = rtrim(SITE_URL, '/') . '/api/unsubscribe.php?email=' . urlencode($sub['email']) . '&token=' . $token;

            $subject = 'Monday Manna: ' . $devo['title'];
            $body = "Hi {$sub['name']},\n\n"
                . $devo['title'] . "\n"
                . ($excerpt !== '' ? $excerpt . "\n\n" : "\n")
                . "Read the full devotional:\n{$link}\n\n"
                . "---\n"
                . "You're receiving this because you subscribed to Monday Manna from {$orgName}.\n"
                . "Unsubscribe: {$unsubscribeLink}";

            if (send_app_mail($sub['email'], $sub['name'], $subject, $body, $fromEmail, $orgName)) {
                $sentCount++;
            } else {
                $failCount++;
            }
        }

        // Only mark it as emailed if at least one message actually went out - a total
        // failure usually means mail isn't configured yet, so leave it eligible to retry.
        if ($sentCount > 0) {
            $stmt = db()->prepare('UPDATE devotionals SET emailed_at = NOW() WHERE id = ?');
            $stmt->execute([$devo['id']]);
        }

        $results[] = ['title' => $devo['title'], 'sent' => $sentCount, 'failed' => $failCount];
    }

    return ['sent' => true, 'reason' => null, 'devotionals' => $results];
}
