<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/serializers.php';
require_admin();

const ALLOWED_DOC_TYPES = [
    'application/pdf' => 'pdf',
    'application/msword' => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
    'application/vnd.ms-excel' => 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx'
];
const MAX_DOC_SIZE = 20 * 1024 * 1024;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT * FROM resources ORDER BY created_at DESC')->fetchAll();
    json_response(array_map('serialize_resource', $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_GET['id'] ?? 0);
    $isUpdate = $id > 0;

    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $publishedDate = trim($_POST['publishedDate'] ?? '');
    $status = in_array($_POST['status'] ?? '', ['Published', 'Draft'], true) ? $_POST['status'] : 'Draft';
    $sourceType = $_POST['sourceType'] ?? 'file';

    if ($title === '') json_error('Title is required.');

    $filePath = null;
    $fileOriginalName = null;
    $externalUrl = null;

    if ($sourceType === 'link') {
        $externalUrl = trim($_POST['externalUrl'] ?? '');
        if ($externalUrl === '' || !filter_var($externalUrl, FILTER_VALIDATE_URL)) {
            json_error('A valid external URL is required.');
        }
    } elseif (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        if ($file['size'] > MAX_DOC_SIZE) json_error('File is too large (max 20MB).');

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset(ALLOWED_DOC_TYPES[$mime])) {
            json_error('Only PDF, Word (.doc/.docx), or Excel (.xls/.xlsx) files are allowed.');
        }

        $ext = ALLOWED_DOC_TYPES[$mime];
        $filename = bin2hex(random_bytes(16)) . '.' . $ext;
        $dest = __DIR__ . '/../../uploads/resources/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            json_error('Could not save the uploaded file.', 500);
        }
        $filePath = '/uploads/resources/' . $filename;
        $fileOriginalName = $file['name'];
    } elseif (!$isUpdate) {
        json_error('Upload a file or provide an external link.');
    }

    $publishedDateValue = $publishedDate !== '' ? $publishedDate : null;

    if ($isUpdate) {
        if ($filePath || $externalUrl) {
            // A new file or link replaces whichever source the resource had before.
            $stmt = db()->prepare(
                'UPDATE resources SET title=?, description=?, category=?, published_date=?, status=?,
                 file_path=?, file_original_name=?, external_url=? WHERE id=?'
            );
            $stmt->execute([$title, $description, $category, $publishedDateValue, $status, $filePath, $fileOriginalName, $externalUrl, $id]);
        } else {
            $stmt = db()->prepare(
                'UPDATE resources SET title=?, description=?, category=?, published_date=?, status=? WHERE id=?'
            );
            $stmt->execute([$title, $description, $category, $publishedDateValue, $status, $id]);
        }
        $row = db()->prepare('SELECT * FROM resources WHERE id = ?');
        $row->execute([$id]);
        $found = $row->fetch();
        if (!$found) json_error('Not found.', 404);
        json_response(serialize_resource($found));
    }

    $stmt = db()->prepare(
        'INSERT INTO resources (title, description, category, file_path, file_original_name, external_url, published_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$title, $description, $category, $filePath, $fileOriginalName, $externalUrl, $publishedDateValue, $status]);
    $newId = (int)db()->lastInsertId();
    $row = db()->prepare('SELECT * FROM resources WHERE id = ?');
    $row->execute([$newId]);
    json_response(serialize_resource($row->fetch()), 201);
}

json_error('Method not allowed.', 405);
