<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
include '../../connection.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->customer_id) || !isset($data->address)) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tblcustomer_addresses (customer_id, label, address) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $data->customer_id, $data->label, $data->address);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>