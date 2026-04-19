<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
include '../connection.php';

$data = json_decode(file_get_contents("php://input"));

$sql = "UPDATE tblproviders SET name=?, experience_years=?, bio=? WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sisi", $data->name, $data->experience_years, $data->bio, $data->id);

if($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>