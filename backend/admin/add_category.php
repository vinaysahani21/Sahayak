<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->name) || !isset($data->slug) || !isset($data->icon)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

$name = trim($data->name);
$slug = trim($data->slug);
$icon = trim($data->icon); // e.g., 'fa-broom'

try {
    $query = "INSERT INTO tblcategories (name, slug, icon) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("sss", $name, $slug, $icon);
        if($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Category added successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save to database.']);
        }
        $stmt->close();
    }
} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conn->close();
?>