<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; 

$customer_id = isset($_GET['customer_id']) ? intval($_GET['customer_id']) : 0;

if ($customer_id === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Missing customer ID']);
    exit;
}

$response = [
    'status' => 'success',
    'data' => [
        'stats' => ['active' => 0, 'completed' => 0, 'total_spent' => 0],
        'categories' => [],
        'recentActivity' => [],
        'topPros' => []
    ]
];

try {
    // 1. STATS
    $qStats = "SELECT 
                  SUM(CASE WHEN status NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END) as active,
                  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                  SUM(CASE WHEN status = 'completed' THEN final_amount ELSE 0 END) as total_spent
               FROM tblbookings 
               WHERE customer_id = ?";
    $stmt1 = $conn->prepare($qStats);
    $stmt1->bind_param("i", $customer_id);
    $stmt1->execute();
    $statsResult = $stmt1->get_result()->fetch_assoc();
    
    $response['data']['stats']['active'] = $statsResult['active'] ?? 0;
    $response['data']['stats']['completed'] = $statsResult['completed'] ?? 0;
    $response['data']['stats']['total_spent'] = $statsResult['total_spent'] ?? 0;

    // 2. CATEGORIES (Limit to top 5)
    $qCats = "SELECT id, name, slug, image FROM tblcategories ORDER BY id ASC LIMIT 5";
    $stmt2 = $conn->prepare($qCats);
    $stmt2->execute();
    $response['data']['categories'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

    // 3. RECENT ACTIVITY
    $qActivity = "SELECT b.id, s.service_name as title, b.created_at as date, 
                         IF(b.final_amount > 0, b.final_amount, b.visit_charge) as price, b.status 
                  FROM tblbookings b 
                  JOIN tblprovider_services s ON b.service_id = s.id 
                  WHERE b.customer_id = ? 
                  ORDER BY b.created_at DESC LIMIT 3";
    $stmt3 = $conn->prepare($qActivity);
    $stmt3->bind_param("i", $customer_id);
    $stmt3->execute();
    $response['data']['recentActivity'] = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

    // 4. TOP PROS (Verified providers ordered by average rating)
    $qPros = "SELECT p.id, p.name, p.profession, p.profile_img, 
                     COALESCE(AVG(r.rating), 5.0) as rating 
              FROM tblproviders p 
              LEFT JOIN tblreviews r ON p.id = r.provider_id 
              WHERE p.is_verified = 1 
              GROUP BY p.id 
              ORDER BY rating DESC, p.id ASC LIMIT 3";
    $stmt4 = $conn->prepare($qPros);
    $stmt4->execute();
    $response['data']['topPros'] = $stmt4->get_result()->fetch_all(MYSQLI_ASSOC);

    // Output final combined JSON
    echo json_encode($response);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>