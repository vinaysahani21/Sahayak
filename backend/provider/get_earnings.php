<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../connection.php';

$provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : 0;

if ($provider_id === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Missing provider ID']);
    exit;
}

try {
    // Total Earned
    $q1 = "SELECT SUM(final_amount) as total_earned FROM tblbookings WHERE provider_id = ? AND status = 'completed'";
    $stmt1 = $conn->prepare($q1);
    $stmt1->bind_param("i", $provider_id);
    $stmt1->execute();
    $totalEarned = $stmt1->get_result()->fetch_assoc()['total_earned'] ?? 0;

    // Pending Clearance
    $q2 = "SELECT SUM(visit_charge) as pending_clearance FROM tblbookings WHERE provider_id = ? AND status = 'confirmed'";
    $stmt2 = $conn->prepare($q2);
    $stmt2->bind_param("i", $provider_id);
    $stmt2->execute();
    $pendingClearance = $stmt2->get_result()->fetch_assoc()['pending_clearance'] ?? 0;

    // Total Withdrawn
    $q3 = "SELECT SUM(amount) as total_withdrawn FROM tblwithdrawals WHERE provider_id = ? AND status = 'completed'";
    $stmt3 = $conn->prepare($q3);
    $stmt3->bind_param("i", $provider_id);
    $stmt3->execute();
    $totalWithdrawn = $stmt3->get_result()->fetch_assoc()['total_withdrawn'] ?? 0;

    // Locked Funds
    $q4 = "SELECT SUM(amount) as locked_funds FROM tblwithdrawals WHERE provider_id = ? AND status = 'pending'";
    $stmt4 = $conn->prepare($q4);
    $stmt4->bind_param("i", $provider_id);
    $stmt4->execute();
    $lockedFunds = $stmt4->get_result()->fetch_assoc()['locked_funds'] ?? 0;

    $availableBalance = $totalEarned - ($totalWithdrawn + $lockedFunds);

    // Ledger (Credits)
    $q5 = "SELECT id, final_amount as amount, 'credit' as type, CONCAT('Job ID: #', id) as description, completed_at as date, 'completed' as status 
           FROM tblbookings WHERE provider_id = ? AND status = 'completed'";
    $stmt5 = $conn->prepare($q5);
    $stmt5->bind_param("i", $provider_id);
    $stmt5->execute();
    $credits = $stmt5->get_result()->fetch_all(MYSQLI_ASSOC);

    // Ledger (Debits)
    $q6 = "SELECT id, amount, 'withdrawal' as type, 'Bank Transfer Request' as description, created_at as date, status 
           FROM tblwithdrawals WHERE provider_id = ?";
    $stmt6 = $conn->prepare($q6);
    $stmt6->bind_param("i", $provider_id);
    $stmt6->execute();
    $debits = $stmt6->get_result()->fetch_all(MYSQLI_ASSOC);

    $transactions = array_merge($credits, $debits);
    usort($transactions, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    echo json_encode([
        'status' => 'success',
        'data' => [
            'stats' => [
                'available_balance' => max(0, $availableBalance),
                'total_earned' => $totalEarned,
                'pending_clearance' => $pendingClearance,
                'total_withdrawn' => $totalWithdrawn
            ],
            'transactions' => $transactions
        ]
    ]);

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>