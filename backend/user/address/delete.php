<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
include '../../connection.php';

$data = json_decode(file_get_contents("php://input"));
$conn->query("DELETE FROM tblcustomer_addresses WHERE id = " . intval($data->address_id));
echo json_encode(["status" => "success"]);
?>