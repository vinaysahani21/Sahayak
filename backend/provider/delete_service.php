<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
include '../connection.php';

$data = json_decode(file_get_contents("php://input"));
$conn->query("DELETE FROM tblprovider_services WHERE id = " . $data->service_id);
echo json_encode(["status" => "success"]);
?>