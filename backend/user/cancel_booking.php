<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->booking_id)) {
    echo json_encode(["status" => "error", "message" => "ID missing"]);
    exit;
}

// Change the SQL line to:
$sql = "UPDATE tblbookings SET status='cancelled', cancelled_at=NOW() WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $data->booking_id);

if($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>