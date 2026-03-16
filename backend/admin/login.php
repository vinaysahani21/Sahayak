<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../connection.php'; // Adjust path to point to your connection.php

// Get the POST data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
    exit;
}

$email = trim($data->email);
$password = trim($data->password);

try {
    // 1. Find the admin by email
    $query = "SELECT id, name, email, password, profile_img FROM tbladmins WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();

        // 2. Verify the hashed password
        if (password_verify($password, $admin['password'])) {
            
            // Remove password from the response object for security
            unset($admin['password']);

            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'data' => $admin
            ]);
        } else {
            // Password did not match
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
        }
    } else {
        // Email not found
        echo json_encode(['status' => 'error', 'message' => 'Admin account not found.']);
    }

} catch(Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>