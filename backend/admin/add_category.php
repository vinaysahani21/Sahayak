<?php
// CORS PREFLIGHT HEADERS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../connection.php';

// Check if data exists
if (!isset($_POST['name']) || !isset($_POST['slug']) || !isset($_FILES['image'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields or image.']);
    exit;
}

$name = trim($_POST['name']);
$slug = trim($_POST['slug']);
$file = $_FILES['image'];

// File Validation
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG and PNG allowed.']);
    exit;
}

// Ensure directory exists: 'api/uploads/categories/'
$uploadDir = '../uploads/categories/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate Unique File Name
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$newFileName = $slug . '_' . time() . '.' . $extension;
$destination = $uploadDir . $newFileName;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Save the relative path format that the frontend expects
    $dbImagePath = '/uploads/categories/' . $newFileName;

    try {
        $query = "INSERT INTO tblcategories (name, slug, image) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sss", $name, $slug, $dbImagePath);
        
        if($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Category added successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save to database.']);
        }
    } catch(Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to upload image to server.']);
}
?>