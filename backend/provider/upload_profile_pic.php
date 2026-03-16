<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../connection.php';

// 1. Check if user_id and file are present
if (!isset($_POST['user_id']) || !isset($_FILES['profile_image'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing user ID or image file.']);
    exit;
}

$user_id = intval($_POST['user_id']);
$file = $_FILES['profile_image'];

// 2. File Validation
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
$maxSize = 2 * 1024 * 1024; // 2MB

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG and PNG are allowed.']);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['status' => 'error', 'message' => 'File size exceeds 2MB limit.']);
    exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Error during file upload.']);
    exit;
}

// 3. Setup Upload Directory
$uploadDir = '../uploads/profiles/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 4. Generate Unique File Name
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$newFileName = 'provider_' . $user_id . '_' . time() . '.' . $extension;
$destination = $uploadDir . $newFileName;

// 5. Move the uploaded file
if (move_uploaded_file($file['tmp_name'], $destination)) {
    
    // Create the public URL path to save in the DB
    $dbImagePath = '/uploads/profiles/' . $newFileName;

    try {
        // 6. Update Database (MySQLi syntax with ?)
        $query = "UPDATE tblproviders SET profile_img = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        
        // "si" means String (image path) and Integer (user id)
        $stmt->bind_param("si", $dbImagePath, $user_id); 
        $stmt->execute();

        if ($stmt->affected_rows > 0 || $stmt->errno === 0) {
            echo json_encode([
                'status' => 'success', 
                'message' => 'Profile picture updated successfully.',
                'image_url' => $dbImagePath
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update database.']);
        }
    } catch(Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save file to server.']);
}
?>