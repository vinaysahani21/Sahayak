<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; // Adjust path if needed

try {
    // Join Bookings, Customers, Providers, and Services to get a readable master list
    $query = "SELECT 
                b.id, b.booking_date, b.time_slot, b.status, b.visit_charge, b.final_amount, b.address, b.created_at,
                c.name as customer_name, 
                p.name as provider_name, 
                s.service_name
              FROM tblbookings b
              JOIN tblcustomers c ON b.customer_id = c.id
              JOIN tblproviders p ON b.provider_id = p.id
              JOIN tblprovider_services s ON b.service_id = s.id
              ORDER BY b.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $bookings
    ]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>