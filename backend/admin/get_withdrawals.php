<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; 

try {
    $query = "SELECT w.id, w.provider_id, w.amount, w.status, w.created_at, p.name as provider_name, p.phone 
              FROM tblwithdrawals w
              JOIN tblproviders p ON w.provider_id = p.id
              ORDER BY w.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $withdrawals = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $withdrawals
    ]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>