<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../connection.php';

$provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : 0;
$tab = isset($_GET['tab']) ? $_GET['tab'] : 'upcoming';
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

if ($provider_id === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Missing provider ID']);
    exit;
}

try {
    $query = "SELECT b.id, b.booking_date, b.time_slot, b.address, b.status, 
                     c.name as customer_name, c.phone, 
                     s.service_name 
              FROM tblbookings b 
              JOIN tblprovider_services s ON b.service_id = s.id 
              JOIN tblcustomers c ON b.customer_id = c.id 
              WHERE b.provider_id = ?";

    if ($tab === 'upcoming') {
        $query .= " AND b.status = 'confirmed' AND DATE(b.booking_date) = ? ORDER BY b.time_slot ASC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("is", $provider_id, $date);
    } else {
        $query .= " AND b.status IN ('completed', 'cancelled') ORDER BY b.created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $provider_id);
    }

    $stmt->execute();
    $jobs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $jobs]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>