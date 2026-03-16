<?php
// 1. ALLOW CORS & PREFLIGHT REQUESTS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"); // Allow JSON Content-Type

// 2. CATCH THE PREFLIGHT OPTIONS REQUEST AND EXIT EARLY
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../connection.php'; // Adjust path

// 3. GET POST DATA
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->provider_id) || !isset($data->status)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required data.']);
    exit;
}

$provider_id = intval($data->provider_id);
$new_status = intval($data->status); // 1 for verify, 0 for revoke

try {
    // 4. UPDATE DATABASE
    $query = "UPDATE tblproviders SET is_verified = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $new_status, $provider_id);
    
    if($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Provider status updated.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update database.']);
    }

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>