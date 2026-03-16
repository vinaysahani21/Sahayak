<?php
// api/login.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'connection.php'; 

// 1. Read JSON Input
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit();
}

$email = $data->email;
$password = $data->password;

// Helper function to check tables
function checkUser($conn, $table, $role, $email, $password) {
    $sql = "SELECT id, name, email, password, profile_img FROM $table WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // Verify Hash
        if (password_verify($password, $row['password'])) {
            return [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "profile_img" => isset($row['profile_img']) ? $row['profile_img'] : null,
                "role" => $role
            ];
        }
    }
    return false;
}

// Check Admin
$user = checkUser($conn, "tbladmins", "admin", $email, $password);
if ($user) {
    echo json_encode(["status" => "success", "user" => $user]);
    exit();
}

// Check Provider
$user = checkUser($conn, "tblproviders", "provider", $email, $password);
if ($user) {
    echo json_encode(["status" => "success", "user" => $user]);
    exit();
}

// Check Customer
$user = checkUser($conn, "tblcustomers", "customer", $email, $password);
if ($user) {
    echo json_encode(["status" => "success", "user" => $user]);
    exit();
}

// If no match found
echo json_encode(["status" => "error", "message" => "Invalid Email or Password"]);
?>