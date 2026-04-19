<?php
// 1. ENABLE DEBUGGING (Crucial for silent crashes)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 2. HANDLE CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../connection.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection file not found."]);
    exit();
}

// 4. GET INPUT
$input = file_get_contents("php://input");
$data = json_decode($input);

// Debug: If JSON is invalid
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON Input"]);
    exit();
}

// 5. VALIDATE FIELDS
// 1. ADD 'category_id' TO VALIDATION
if (
    !isset($data->provider_id) || 
    !isset($data->service_name) || 
    !isset($data->price) ||
    !isset($data->category_id) // <--- CRITICAL CHECK
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields (category_id needed)"]);
    exit();
}

$provider_id = $data->provider_id;
$category_id = $data->category_id; // <--- GET IT
$service_name = $data->service_name;
$price = $data->price;
$desc = isset($data->desc) ? $data->desc : "";

// 2. UPDATE SQL TO INCLUDE category_id
// Note: Use 'tblprovider_services' as per your error log
$sql = "INSERT INTO tblprovider_services (provider_id, category_id, service_name, price_per_hour, description) VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL Prepare Failed: " . $conn->error]);
    exit();
}

// 3. BIND PARAMETERS (i = integer, s = string, d = double)
// order: provider_id(i), category_id(i), service_name(s), price(d), desc(s)
$stmt->bind_param("iisds", $provider_id, $category_id, $service_name, $price, $desc);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Service Added"]);
} else {
    echo json_encode(["status" => "error", "message" => "Execution Failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>