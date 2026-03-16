<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; // Adjust path

try {
    // Fetch all providers, plus a subquery to count their completed jobs
    $query = "SELECT p.id, p.name, p.email, p.phone, p.profession, p.experience_years, p.profile_img, p.is_verified, p.created_at,
                     (SELECT COUNT(*) FROM tblbookings b WHERE b.provider_id = p.id AND b.status = 'completed') as total_jobs
              FROM tblproviders p 
              ORDER BY p.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $providers = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $providers
    ]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>