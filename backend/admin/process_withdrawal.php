<?php
// CORS PREFLIGHT
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

if (!isset($data->withdrawal_id) || !isset($data->status)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required data.']);
    exit;
}

$withdrawal_id = intval($data->withdrawal_id);
$new_status = trim($data->status);

try {
    $query = "UPDATE tblwithdrawals SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $new_status, $withdrawal_id);
    
    if($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Withdrawal processed.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update database.']);
    }

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>