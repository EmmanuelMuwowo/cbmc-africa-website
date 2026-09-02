<?php
/**
 * Sends outgoing mail. If SMTP_HOST is set in config.php, sends via that SMTP
 * server (needed on hosts - like most modern container-based platforms - that
 * don't run a local sendmail/MTA, so PHP's built-in mail() silently fails).
 * Falls back to mail() when no SMTP_* constants are configured, so hosts where
 * mail() already works keep working with zero changes.
 */
function send_app_mail(string $toEmail, string $toName, string $subject, string $body, string $replyToEmail = '', string $replyToName = ''): bool {
    if (defined('SMTP_HOST') && SMTP_HOST !== '') {
        return smtp_send_mail($toEmail, $toName, $subject, $body, $replyToEmail, $replyToName);
    }

    $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : ($replyToName ?: 'Website');
    $fromEmail = $replyToEmail ?: 'no-reply@localhost';
    $headers = "From: {$fromName} <{$fromEmail}>\r\n"
        . ($replyToEmail !== '' ? "Reply-To: {$fromName} <{$replyToEmail}>\r\n" : '')
        . "Content-Type: text/plain; charset=UTF-8";
    return @mail($toEmail, $subject, $body, $headers);
}

function smtp_send_mail(string $toEmail, string $toName, string $subject, string $body, string $replyToEmail, string $replyToName): bool {
    $host = SMTP_HOST;
    $port = defined('SMTP_PORT') ? (int)SMTP_PORT : 587;
    $user = defined('SMTP_USER') ? SMTP_USER : '';
    $pass = defined('SMTP_PASS') ? SMTP_PASS : '';
    $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : ($replyToName ?: 'Website');
    $fromEmail = $user;

    $sock = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 12);
    if (!$sock) {
        error_log("SMTP connect failed: {$errstr} ({$errno})");
        return false;
    }
    stream_set_timeout($sock, 12);

    $ehloDomain = defined('SITE_URL') ? (parse_url(SITE_URL, PHP_URL_HOST) ?: 'localhost') : 'localhost';

    try {
        if (!smtp_expect($sock, 220)) return false;
        if (!smtp_cmd($sock, "EHLO {$ehloDomain}", 250)) return false;
        if (!smtp_cmd($sock, 'STARTTLS', 220)) return false;

        if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            error_log('SMTP STARTTLS upgrade failed.');
            fclose($sock);
            return false;
        }

        if (!smtp_cmd($sock, "EHLO {$ehloDomain}", 250)) return false;

        if ($user !== '') {
            if (!smtp_cmd($sock, 'AUTH LOGIN', 334)) return false;
            if (!smtp_cmd($sock, base64_encode($user), 334)) return false;
            if (!smtp_cmd($sock, base64_encode($pass), 235)) return false;
        }

        if (!smtp_cmd($sock, "MAIL FROM:<{$fromEmail}>", 250)) return false;
        if (!smtp_cmd($sock, "RCPT TO:<{$toEmail}>", [250, 251])) return false;
        if (!smtp_cmd($sock, 'DATA', 354)) return false;

        $date = date('r');
        $messageId = '<' . bin2hex(random_bytes(16)) . '@' . $ehloDomain . '>';
        $headerLines = [
            'Date: ' . $date,
            'Message-ID: ' . $messageId,
            'From: ' . smtp_encode_header($fromName) . " <{$fromEmail}>",
            'To: ' . smtp_encode_header($toName) . " <{$toEmail}>",
            'Subject: ' . smtp_encode_header($subject),
        ];
        if ($replyToEmail !== '') {
            $headerLines[] = 'Reply-To: ' . smtp_encode_header($replyToName ?: $fromName) . " <{$replyToEmail}>";
        }
        $headerLines[] = 'MIME-Version: 1.0';
        $headerLines[] = 'Content-Type: text/plain; charset=UTF-8';
        $headerLines[] = 'Content-Transfer-Encoding: 8bit';

        $data = implode("\r\n", $headerLines) . "\r\n\r\n" . smtp_dot_stuff($body) . "\r\n.";
        fwrite($sock, $data . "\r\n");
        if (!smtp_read_response($sock, 250)) return false;

        smtp_cmd($sock, 'QUIT', [221, 250]);
        fclose($sock);
        return true;
    } catch (Throwable $e) {
        error_log('SMTP send error: ' . $e->getMessage());
        if (is_resource($sock)) fclose($sock);
        return false;
    }
}

function smtp_cmd($sock, string $line, $expectCode) {
    fwrite($sock, $line . "\r\n");
    return smtp_read_response($sock, $expectCode);
}

function smtp_expect($sock, $expectCode) {
    return smtp_read_response($sock, $expectCode);
}

function smtp_read_response($sock, $expectCode): bool {
    $expected = is_array($expectCode) ? $expectCode : [$expectCode];
    $lastLine = '';
    while (($line = fgets($sock, 1024)) !== false) {
        $lastLine = $line;
        // Multi-line responses use "250-" for all but the final "250 " line.
        if (strlen($line) < 4 || $line[3] !== '-') break;
    }
    if ($lastLine === '') {
        error_log('SMTP: no response from server (timeout or connection closed).');
        return false;
    }
    $code = (int)substr($lastLine, 0, 3);
    if (!in_array($code, $expected, true)) {
        error_log("SMTP: expected " . implode('/', $expected) . ", got: " . trim($lastLine));
        return false;
    }
    return true;
}

function smtp_dot_stuff(string $body): string {
    $lines = explode("\n", str_replace("\r\n", "\n", $body));
    foreach ($lines as &$line) {
        $line = rtrim($line, "\r");
        if (isset($line[0]) && $line[0] === '.') $line = '.' . $line;
    }
    return implode("\r\n", $lines);
}

function smtp_encode_header(string $text): string {
    if ($text === '' || preg_match('/^[\x20-\x7E]*$/', $text)) return $text;
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}
