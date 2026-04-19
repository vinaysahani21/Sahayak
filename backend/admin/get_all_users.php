<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../connection.php'; 

try {
    // Unified query fetching both customers and providers
    $query = "
        SELECT id, name, email, phone, locality AS location, profile_img, created_at, 'customer' AS role,
               (SELECT COUNT(*) FROM tblbookings b WHERE b.customer_id = c.id) AS total_jobs,
               is_active
        FROM tblcustomers c 
        UNION ALL
        SELECT id, name, email, phone, city AS location, profile_img, created_at, 'provider' AS role,
               (SELECT COUNT(*) FROM tblbookings b WHERE b.provider_id = p.id) AS total_jobs,
               is_active
        FROM tblproviders p
        ORDER BY created_at DESC
    ";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $users]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>