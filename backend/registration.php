<?php
// api/register_customer.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'connection.php';


$data = json_decode(file_get_contents("php://input"));

// Validate Input presence
if (
    !isset($data->name) || 
    !isset($data->email) || 
    !isset($data->password) || 
    !isset($data->phone)
) {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
    exit();
}

$name = $data->name;
$email = $data->email;
$password = password_hash($data->password, PASSWORD_DEFAULT);
$phone = $data->phone;
$address = isset($data->address) ? $data->address : "";
$locality = isset($data->locality) ? $data->locality : "";

// Check if email exists
$check = $conn->prepare("SELECT id FROM tblcustomers WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered"]);
    exit();
}

// Insert
$stmt = $conn->prepare("INSERT INTO tblcustomers (name, email, password, phone, address, locality) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $name, $email, $password, $phone, $address, $locality);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registration successful"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>