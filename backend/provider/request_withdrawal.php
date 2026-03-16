<?php
// Handle CORS and Preflight
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Prevent HTML errors from breaking JSON response
ini_set('display_errors', 0);
error_reporting(E_ALL);

include '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->provider_id) || !isset($data->amount)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

$provider_id = intval($data->provider_id);
$amount = floatval($data->amount);

if ($amount < 500) {
    echo json_encode(['status' => 'error', 'message' => 'Minimum withdrawal is ₹500']);
    exit;
}

try {
    // SECURITY CHECK: Verify they actually have enough balance using MySQLi
    
    // 1. Total Earned (Assuming 'final_amount' in 'tblbookings', or adjust if you use 'tbltransactions')
    $stmt1 = $conn->prepare("SELECT SUM(final_amount) as total FROM tblbookings WHERE provider_id = ? AND status = 'completed'");
    $stmt1->bind_param("i", $provider_id);
    $stmt1->execute();
    $earned_result = $stmt1->get_result()->fetch_assoc();
    $earned = $earned_result['total'] ?? 0;

    // 2. Total Withdrawn/Pending (Funds already spoken for)
    $stmt2 = $conn->prepare("SELECT SUM(amount) as used FROM tblwithdrawals WHERE provider_id = ? AND status IN ('completed', 'pending')");
    $stmt2->bind_param("i", $provider_id);
    $stmt2->execute();
    $used_result = $stmt2->get_result()->fetch_assoc();
    $used = $used_result['used'] ?? 0;

    $actual_balance = $earned - $used;

    if ($amount > $actual_balance) {
         echo json_encode(['status' => 'error', 'message' => 'Insufficient actual balance.']);
         exit;
    }

    // Insert the request
    $query = "INSERT INTO tblwithdrawals (provider_id, amount, status) VALUES (?, ?, 'pending')";
    $stmt3 = $conn->prepare($query);
    $stmt3->bind_param("id", $provider_id, $amount);
    
    if($stmt3->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Withdrawal requested successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to insert request.']);
    }

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
}
?>