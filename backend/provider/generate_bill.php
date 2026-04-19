<?php
// 1. CORS & Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Database Connection
include '../connection.php'; 

// 3. Get JSON Input
$data = json_decode(file_get_contents("php://input"));

// 4. Validate Input
if (
    !isset($data->booking_id) || 
    !isset($data->amount) || 
    !isset($data->description)
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields (booking_id, amount, description)"]);
    exit();
}

$booking_id = intval($data->booking_id);
$final_amount = floatval($data->amount);
$description = trim($data->description);

// 5. Update Database
// We set status to 'payment_pending' so the Customer sees the "Pay" button
$sql = "UPDATE tblbookings SET 
        final_amount = ?, 
        bill_description = ?, 
        status = 'payment_pending' 
        WHERE id = ?";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // "dsi" means: Double (amount), String (desc), Integer (id)
    $stmt->bind_param("dsi", $final_amount, $description, $booking_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Bill generated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Execution failed: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "SQL Prepare failed: " . $conn->error]);
}

$conn->close();
?>