<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; // Adjust path

try {
    // Fetch all customers, plus a subquery to count their total bookings
    $query = "SELECT c.id, c.name, c.email, c.phone, c.locality, c.address, c.profile_img, c.created_at,
                     (SELECT COUNT(*) FROM tblbookings b WHERE b.customer_id = c.id) as total_bookings
              FROM tblcustomers c 
              ORDER BY c.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $customers = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $customers
    ]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>