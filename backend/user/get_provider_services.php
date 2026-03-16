<?php
header("Access-Control-Allow-Origin: *");
include '../connection.php';
$pid = $_GET['provider_id'];
$res = $conn->query("SELECT * FROM tblprovider_services WHERE provider_id = $pid");
$services = [];
while($row = $res->fetch_assoc()) $services[] = $row;
echo json_encode($services);
?>