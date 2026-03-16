<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include '../../connection.php';

$customer_id = $_GET['id'];

$sql = "SELECT * FROM tblcustomer_addresses WHERE customer_id = ? ORDER BY id DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customer_id);
$stmt->execute();
$result = $stmt->get_result();

$addresses = [];
while ($row = $result->fetch_assoc()) {
    $addresses[] = $row;
}
echo json_encode($addresses);
?>