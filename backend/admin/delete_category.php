<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->category_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing category ID.']);
    exit;
}

$category_id = intval($data->category_id);

try {
    // Optional: You could fetch the image path first and delete the physical file using unlink()
    // For MVP, we will just delete the database record.

    $query = "DELETE FROM tblcategories WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $category_id);
    
    if($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Category deleted.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete from database.']);
    }
} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>