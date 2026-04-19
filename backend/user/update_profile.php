<?php
// 1. Handle CORS and Preflight
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Prevent PHP HTML warnings from breaking JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

include_once '../connection.php'; // Adjust path if necessary

// 3. Get POST data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id) || !isset($data->name) || !isset($data->phone)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

$id = intval($data->id);
$name = trim($data->name);
$phone = trim($data->phone);
$address = isset($data->address) ? trim($data->address) : '';

try {
    // 4. Update the Customer Database
    $query = "UPDATE tblcustomers SET name = ?, phone = ?, address = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssi", $name, $phone, $address, $id);
    
    if($stmt->execute()) {
        
        // 5. Fetch the freshly updated user to send back to React
        $fetch_query = "SELECT id, name, email, phone, address, locality, profile_img FROM tblcustomers WHERE id = ?";
        $fetch_stmt = $conn->prepare($fetch_query);
        $fetch_stmt->bind_param("i", $id);
        $fetch_stmt->execute();
        $updated_user = $fetch_stmt->get_result()->fetch_assoc();

        echo json_encode([
            'status' => 'success', 
            'message' => 'Profile updated successfully.',
            'user' => $updated_user
        ]);
        
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update database: ' . $stmt->error]);
    }

} catch(Exception $e) {
    // Return a clean JSON error instead of crashing
    echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
}
?>