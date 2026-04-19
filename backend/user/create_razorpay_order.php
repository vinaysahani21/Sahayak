<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->booking_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing booking ID']);
    exit;
}

$booking_id = intval($data->booking_id);

// *** SECURELY LOAD CREDENTIALS ***
$envFilePath = __DIR__ . '/../.env'; 

if (!file_exists($envFilePath)) {
    echo json_encode(['status' => 'error', 'message' => 'Server Configuration Error: .env file missing.']);
    exit;
}

$env = parse_ini_file($envFilePath);
$key_id = $env['RAZORPAY_KEY_ID']; 
$key_secret = $env['RAZORPAY_KEY_SECRET'];

try {
    // Fetch the final amount from database securely
    $stmt = $conn->prepare("SELECT final_amount FROM tblbookings WHERE id = ? AND status = 'payment_pending'");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Booking not found or not ready for payment.']);
        exit;
    }

    $booking = $result->fetch_assoc();
    $amount_in_paise = intval($booking['final_amount'] * 100); // Razorpay requires paise (₹1 = 100 paise)

    // Call Razorpay API via cURL to create order
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.razorpay.com/v1/orders');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "amount" => $amount_in_paise,
        "currency" => "INR",
        "receipt" => "RCPT_" . $booking_id
    ]));
    curl_setopt($ch, CURLOPT_USERPWD, $key_id . ':' . $key_secret);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $razorpay_data = json_decode($response, true);

    if ($http_status === 200 && isset($razorpay_data['id'])) {
        echo json_encode([
            'status' => 'success',
            'data' => [
                'order_id' => $razorpay_data['id'],
                'amount' => $amount_in_paise
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to generate Razorpay order.']);
    }

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>