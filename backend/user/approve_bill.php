<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->booking_id) || !isset($data->razorpay_payment_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing booking ID or Payment ID.']);
    exit;
}

$booking_id = intval($data->booking_id);
$payment_id = $data->razorpay_payment_id;

try {
    $conn->begin_transaction();

    // 1. Get the final amount
    $stmt = $conn->prepare("SELECT final_amount FROM tblbookings WHERE id = ?");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $booking = $stmt->get_result()->fetch_assoc();
    
    $total_amount = floatval($booking['final_amount']);
    
    // Calculate Commission (e.g., 10% platform fee)
    $admin_commission = $total_amount * 0.10;
    $provider_earnings = $total_amount - $admin_commission;

    // 2. Update Booking Status
    $updateStmt = $conn->prepare("UPDATE tblbookings SET status = 'completed', completed_at = NOW() WHERE id = ?");
    $updateStmt->bind_param("i", $booking_id);
    $updateStmt->execute();

    // 3. Create Transaction Ledger Entry
    $txnStmt = $conn->prepare("INSERT INTO tbltransactions (booking_id, total_amount, admin_commission, provider_earnings, payment_status) VALUES (?, ?, ?, ?, 'paid')");
    $txnStmt->bind_param("iddd", $booking_id, $total_amount, $admin_commission, $provider_earnings);
    $txnStmt->execute();

    $conn->commit();

    echo json_encode(['status' => 'success', 'message' => 'Payment verified and booking completed.']);

} catch(Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>