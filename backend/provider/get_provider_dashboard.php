<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../connection.php';

$provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : 0;

if ($provider_id === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Missing provider ID']);
    exit;
}

$response = [
    'status' => 'success',
    'data' => [
        'stats' => ['total_earnings' => 0, 'total_jobs' => 0, 'rating' => 0],
        'requests' => [],
        'upcoming' => [],
        'chartData' => [0, 0, 0, 0, 0, 0, 0],
        'reviews' => []
    ]
];

try {
    // 1. STATS
    $q1 = "SELECT SUM(final_amount) as total_earnings, COUNT(id) as total_jobs FROM tblbookings WHERE provider_id = ? AND status = 'completed'";
    $stmt1 = $conn->prepare($q1);
    $stmt1->bind_param("i", $provider_id);
    $stmt1->execute();
    $stats = $stmt1->get_result()->fetch_assoc();
    
    $q2 = "SELECT AVG(rating) as avg_rating FROM tblreviews WHERE provider_id = ?";
    $stmt2 = $conn->prepare($q2);
    $stmt2->bind_param("i", $provider_id);
    $stmt2->execute();
    $ratingInfo = $stmt2->get_result()->fetch_assoc();

    $response['data']['stats']['total_earnings'] = $stats['total_earnings'] ?? 0;
    $response['data']['stats']['total_jobs'] = $stats['total_jobs'] ?? 0;
    $response['data']['stats']['rating'] = round($ratingInfo['avg_rating'] ?? 0, 1);

    // 2. NEW REQUESTS (Pending)
    $q3 = "SELECT b.id, b.address, s.price_per_hour as price, s.service_name, c.name as customer_name 
           FROM tblbookings b 
           JOIN tblprovider_services s ON b.service_id = s.id 
           JOIN tblcustomers c ON b.customer_id = c.id 
           WHERE b.provider_id = ? AND b.status = 'pending'
           ORDER BY b.created_at DESC LIMIT 5";
    $stmt3 = $conn->prepare($q3);
    $stmt3->bind_param("i", $provider_id);
    $stmt3->execute();
    $response['data']['requests'] = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

    // 3. UPCOMING JOBS (Confirmed)
    $q4 = "SELECT b.id, b.booking_date, b.time_slot, s.service_name, c.name as customer_name 
           FROM tblbookings b 
           JOIN tblprovider_services s ON b.service_id = s.id 
           JOIN tblcustomers c ON b.customer_id = c.id 
           WHERE b.provider_id = ? AND b.status = 'confirmed'
           ORDER BY b.booking_date ASC LIMIT 5";
    $stmt4 = $conn->prepare($q4);
    $stmt4->bind_param("i", $provider_id);
    $stmt4->execute();
    $response['data']['upcoming'] = $stmt4->get_result()->fetch_all(MYSQLI_ASSOC);

    // 4. CHART DATA (Last 7 Days)
    $q5 = "SELECT DATE(completed_at) as date, SUM(final_amount) as daily_total 
           FROM tblbookings 
           WHERE provider_id = ? AND status = 'completed' AND completed_at >= DATE(NOW()) - INTERVAL 7 DAY
           GROUP BY DATE(completed_at)";
    $stmt5 = $conn->prepare($q5);
    $stmt5->bind_param("i", $provider_id);
    $stmt5->execute();
    $dailyEarnings = $stmt5->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $chartDataArray = array_fill(0, 7, 0); 
    foreach($dailyEarnings as $row) {
        if($row['date']) {
            $dayIndex = date('N', strtotime($row['date'])) - 1; 
            $chartDataArray[$dayIndex] = (float)$row['daily_total'];
        }
    }
    $response['data']['chartData'] = $chartDataArray;

    // 5. REVIEWS
    $q6 = "SELECT r.id, r.rating, r.comment, r.created_at, c.name as customer_name 
           FROM tblreviews r
           JOIN tblcustomers c ON r.customer_id = c.id
           WHERE r.provider_id = ?
           ORDER BY r.created_at DESC LIMIT 3";
    $stmt6 = $conn->prepare($q6);
    $stmt6->bind_param("i", $provider_id);
    $stmt6->execute();
    $response['data']['reviews'] = $stmt6->get_result()->fetch_all(MYSQLI_ASSOC);

    echo json_encode($response);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>