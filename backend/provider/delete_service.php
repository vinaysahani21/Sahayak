<?php
// 1. TURN ON ERROR REPORTING
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 2. STRICT CORS HEADERS
header("Access-Control-Allow-Origin: *"); 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. USE ABSOLUTE PATHING
require_once __DIR__ . '/../connection.php';

// 4. SAFELY GET & PARSE PAYLOAD
$raw_data = file_get_contents("php://input");
$data = json_decode($raw_data);

if (!$data || !isset($data->service_id)) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload or missing service_id."]);
    exit;
}

$service_id = intval($data->service_id);

// 5. SECURE SOFT DELETE QUERY (Updates is_active to 0 instead of erasing the row)
$sql = "UPDATE tblprovider_services SET is_active = 0 WHERE id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $service_id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Service successfully removed from catalog."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
}

$conn->close();
?>