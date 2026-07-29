<?php

function serialize_devotional(array $row): array {
    return [
        'id' => (int)$row['id'],
        'slug' => $row['slug'],
        'title' => $row['title'],
        'author' => $row['author'],
        'authorInitials' => $row['author_initials'],
        'date' => $row['devotional_date'],
        'dateLabel' => date_label($row['devotional_date']),
        'excerpt' => $row['excerpt'],
        'verse' => $row['verse'],
        'blocks' => json_decode($row['blocks'], true) ?: [],
        'reflection' => json_decode($row['reflection'], true) ?: [],
        'challenge' => $row['challenge'],
        'passages' => $row['passages'],
        'image' => $row['image_url'],
        'status' => $row['status']
    ];
}

function serialize_news(array $row): array {
    return [
        'id' => (int)$row['id'],
        'slug' => $row['slug'],
        'title' => $row['title'],
        'author' => $row['author'],
        'date' => $row['published_date'],
        'dateLabel' => date_label($row['published_date']),
        'excerpt' => $row['excerpt'],
        'blocks' => json_decode($row['blocks'], true) ?: [],
        'image' => $row['image_url'],
        'status' => $row['status']
    ];
}

function serialize_resource(array $row): array {
    $hasFile = !empty($row['file_path']);
    return [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'category' => $row['category'],
        'date' => $row['published_date'],
        'dateLabel' => $row['published_date'] ? short_date_label($row['published_date']) : '—',
        'sourceType' => $hasFile ? 'file' : ($row['external_url'] ? 'link' : 'none'),
        'fileUrl' => $hasFile ? $row['file_path'] : null,
        'fileName' => $row['file_original_name'],
        'externalUrl' => $row['external_url'],
        'status' => $row['status']
    ];
}

function serialize_leader(array $row): array {
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'title' => $row['title'],
        'region' => $row['region'],
        'bio' => $row['bio'],
        'photo' => $row['photo_url'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'sortOrder' => (int)$row['sort_order'],
        'status' => $row['status']
    ];
}

function serialize_event(array $row): array {
    $ts = strtotime($row['event_date']);
    return [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'category' => $row['category'],
        'location' => $row['location'],
        'date' => $row['event_date'],
        'mon' => strtoupper(date('M', $ts)),
        'day' => date('d', $ts),
        'year' => (int)date('Y', $ts),
        'datesLabel' => $row['dates_label'],
        'time' => $row['time_label'],
        'format' => $row['format'],
        'cost' => $row['cost'],
        'host' => $row['host'],
        'description' => $row['description']
    ];
}
