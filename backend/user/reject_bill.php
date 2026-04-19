<?php
// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Database Connection
include '../connection.php';

// 3. Get JSON Input
$data = json_decode(file_get_contents("php://input"));

// 4. Validate Input
if (!isset($data->booking_id) || !isset($data->reason)) {
    echo json_encode(["status" => "error", "message" => "Missing booking_id or reason"]);
    exit;
}

$booking_id = intval($data->booking_id);
$reason = trim($data->reason);

// 5. LOGIC: Get the original Visit Charge
// Even if they reject the work, they must pay the visit fee.
$sql = "SELECT visit_charge FROM tblbookings WHERE id = ?";
$stmt = $conn->prepare($sql);

if(!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
    exit;
}

$stmt->bind_param("i", $booking_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Booking not found"]);
    exit;
}

$row = $result->fetch_assoc();
$visit_charge = $row['visit_charge']; // This is usually 99.00

// 6. UPDATE BOOKING
// - Reset 'final_amount' to only the 'visit_charge'
// - Set status to 'completed' (The service interaction is over)
// - Save the rejection reason
// - Append "[REJECTED]" to the description so it's clear in history
$updateSql = "UPDATE tblbookings SET 
              status = 'completed', 
              final_amount = ?, 
              rejection_reason = ?,
              completed_at = NOW(),  
              bill_description = CONCAT(IFNULL(bill_description, ''), ' [Customer Rejected]')
              WHERE id = ?";

$stmt2 = $conn->prepare($updateSql);
$stmt2->bind_param("dsi", $visit_charge, $reason, $booking_id);

if ($stmt2->execute()) {
    echo json_encode([
        "status" => "success", 
        "message" => "Bill rejected. You have been charged the Visit Fee: ₹" . $visit_charge
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt2->error]);
}

$stmt->close();
$stmt2->close();
$conn->close();
?>