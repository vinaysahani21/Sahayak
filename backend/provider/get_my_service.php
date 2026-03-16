<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
include '../connection.php';

$provider_id = $_GET['id'];
$res = $conn->query("SELECT * FROM tblprovider_services WHERE provider_id = $provider_id");

$services = [];
while($row = $res->fetch_assoc()) $services[] = $row;
echo json_encode($services);
?>