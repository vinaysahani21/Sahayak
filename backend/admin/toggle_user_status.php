<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../connection.php';
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->id) || !isset($data->role) || !isset($data->is_active)) {
    echo json_encode(["status" => "error", "message" => "Missing required data"]); exit;
}

$id = intval($data->id);
$role = $data->role;
$new_status = intval($data->is_active);

// Route to the correct table based on role
$table = ($role === 'provider') ? 'tblproviders' : 'tblcustomers';

$sql = "UPDATE $table SET is_active = ? WHERE id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("ii", $new_status, $id);
    if($stmt->execute()){
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database execution failed"]);
    }
    $stmt->close();
}
$conn->close();
?>