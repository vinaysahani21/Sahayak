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

if (!isset($data->category_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing category ID.']);
    exit;
}

$category_id = intval($data->category_id);

try {
    $query = "DELETE FROM tblcategories WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if($stmt) {
        $stmt->bind_param("i", $category_id);
        if($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Category deleted.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete from database.']);
        }
        $stmt->close();
    }
} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conn->close();
?>