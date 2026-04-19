<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../connection.php';

$id = $_GET['id'];

$sql = "
    SELECT 
        b.*, 
        ps.service_name, 
        ps.price_per_hour,
        p.name as provider_name,
        p.phone as provider_phone,
        p.profile_img
    FROM tblbookings b
    JOIN tblprovider_services ps ON b.service_id = ps.id
    JOIN tblproviders p ON b.provider_id = p.id
    WHERE b.id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
echo json_encode($result->fetch_assoc());
?>