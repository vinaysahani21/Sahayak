<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../connection.php'; // Adjust path if needed

$response = [
    'status' => 'success',
    'data' => [
        'stats' => ['customers' => 0, 'providers' => 0, 'jobs' => 0, 'earnings' => 0],
        'action_required' => ['pending_providers' => 0, 'pending_withdrawals' => 0],
        'chartData' => [0, 0, 0, 0, 0, 0, 0],
        'recent_bookings' => []
    ]
];

try {
    // ---------------------------------------------------------
    // 1. TOP STATS
    // ---------------------------------------------------------
    $res = $conn->query("SELECT COUNT(*) as count FROM tblcustomers");
    $response['data']['stats']['customers'] = $res->fetch_assoc()['count'];

    $res = $conn->query("SELECT COUNT(*) as count FROM tblproviders");
    $response['data']['stats']['providers'] = $res->fetch_assoc()['count'];

    $res = $conn->query("SELECT COUNT(*) as count FROM tblbookings WHERE status = 'completed'");
    $response['data']['stats']['jobs'] = $res->fetch_assoc()['count'];

    // Admin Earnings (Sum of admin_commission from transactions)
    $res = $conn->query("SELECT SUM(admin_commission) as earnings FROM tbltransactions");
    $response['data']['stats']['earnings'] = $res->fetch_assoc()['earnings'] ?? 0;

    // ---------------------------------------------------------
    // 2. ACTION REQUIRED
    // ---------------------------------------------------------
    $res = $conn->query("SELECT COUNT(*) as count FROM tblproviders WHERE is_verified = 0");
    $response['data']['action_required']['pending_providers'] = $res->fetch_assoc()['count'];

    // This will return 0 if tblwithdrawals doesn't exist or is empty, handled gracefully
    $res = $conn->query("SELECT COUNT(*) as count FROM tblwithdrawals WHERE status = 'pending'");
    if($res) {
        $response['data']['action_required']['pending_withdrawals'] = $res->fetch_assoc()['count'];
    }

    // ---------------------------------------------------------
    // 3. CHART DATA (Last 7 Days Admin Commission)
    // ---------------------------------------------------------
    $qChart = "SELECT DATE(transaction_date) as date, SUM(admin_commission) as daily_total 
               FROM tbltransactions 
               WHERE transaction_date >= DATE(NOW()) - INTERVAL 7 DAY 
               GROUP BY DATE(transaction_date)";
    $res = $conn->query($qChart);
    
    $chartDataArray = array_fill(0, 7, 0); 
    if($res) {
        while($row = $res->fetch_assoc()) {
            if($row['date']) {
                $dayIndex = date('N', strtotime($row['date'])) - 1; // 0 for Mon, 6 for Sun
                $chartDataArray[$dayIndex] = (float)$row['daily_total'];
            }
        }
    }
    $response['data']['chartData'] = $chartDataArray;

    // ---------------------------------------------------------
    // 4. RECENT BOOKINGS (Live Feed)
    // ---------------------------------------------------------
    $qRecent = "SELECT b.id, b.status, b.final_amount, b.created_at, 
                       c.name as customer_name, p.name as provider_name, s.service_name
                FROM tblbookings b
                JOIN tblcustomers c ON b.customer_id = c.id
                JOIN tblproviders p ON b.provider_id = p.id
                JOIN tblprovider_services s ON b.service_id = s.id
                ORDER BY b.created_at DESC LIMIT 6";
    $res = $conn->query($qRecent);
    
    if($res) {
        $response['data']['recent_bookings'] = $res->fetch_all(MYSQLI_ASSOC);
    }

    // Send final response
    echo json_encode($response);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>