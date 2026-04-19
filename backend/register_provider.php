<?php
// api/register_provider.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include './connection.php';

// 1. Receive JSON Data
$data = json_decode(file_get_contents("php://input"));

// 2. Validate Required Fields (Server-side check)
if (
    !isset($data->name) || 
    !isset($data->email) || 
    !isset($data->phone) || 
    !isset($data->password) ||
    !isset($data->city) ||
    !isset($data->profession)
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$name = trim($data->name);
$email = trim($data->email);
$phone = trim($data->phone);
$password = password_hash($data->password, PASSWORD_DEFAULT); // Hash it!
$address = isset($data->address) ? trim($data->address) : "";
$city = trim($data->city);
$profession = trim($data->profession);
$experience = isset($data->experience_years) ? intval($data->experience_years) : 0;
$bio = isset($data->bio) ? trim($data->bio) : "";

// 3. Check if Email already exists in 'providers' table
$checkEmail = $conn->prepare("SELECT id FROM tblproviders WHERE email = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();
$checkEmail->store_result();

if ($checkEmail->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered as a Provider"]);
    exit();
}

// 4. Insert into Database
// Note: is_verified defaults to 0 (Pending) in DB schema
$sql = "INSERT INTO tblproviders 
        (name, email, password, phone, address, city, profession, experience_years, bio, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("sssssssis", 
        $name, 
        $email, 
        $password, 
        $phone, 
        $address, 
        $city, 
        $profession, 
        $experience, 
        $bio
    );

    if ($stmt->execute()) {
        // Success
        echo json_encode(["status" => "success", "message" => "Provider registered successfully. Please Login."]);
    } else {
        // SQL Error
        echo json_encode(["status" => "error", "message" => "Database insert failed: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "SQL Preparation failed: " . $conn->error]);
}

$conn->close();
?>