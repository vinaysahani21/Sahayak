<?php
// 1. Headers & Config
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include '../connection.php';

// 2. Get Input
$data = json_decode(file_get_contents("php://input"));

// 3. Validate Inputs (Must match Frontend Payload exactly)
if (
    !isset($data->customer_id) || 
    !isset($data->provider_id) || 
    !isset($data->service_id) || 
    !isset($data->booking_date) ||  
    !isset($data->time_slot) ||
    !isset($data->address)
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

// 4. Variables
$customer_id = $data->customer_id;
$provider_id = $data->provider_id;
$service_id = $data->service_id;
$booking_date = $data->booking_date; 
$time_slot = $data->time_slot;
$address = $data->address;
$visit_charge = isset($data->visit_charge) ? $data->visit_charge : 99.00; // Default if missing

// 5. Prevent Past Bookings
$bDate = strtotime($booking_date);
$today = strtotime(date("Y-m-d"));
if ($bDate < $today) {
    echo json_encode(["status" => "error", "message" => "Cannot book for a past date"]);
    exit();
}

// 6. Insert into Database
$sql = "INSERT INTO tblbookings (customer_id, provider_id, service_id, booking_date, time_slot, address, visit_charge, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // Types: i=int, s=string, d=double (decimal)
    // Order: cust(i), prov(i), serv(i), date(s), time(s), addr(s), fee(d)
    $stmt->bind_param("iiisssd", 
        $customer_id, 
        $provider_id, 
        $service_id, 
        $booking_date, 
        $time_slot,
        $address,
        $visit_charge
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "booking_id" => $stmt->insert_id]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Prepare Failed: " . $conn->error]);
}

$conn->close();
?>