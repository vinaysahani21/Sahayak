<?php
// api/upload_profile_pic.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include '../connection.php';

if (!isset($_POST['id']) || !isset($_FILES['image'])) {
    echo json_encode(["status" => "error", "message" => "No file or ID provided"]);
    exit;
}

$id = $_POST['id'];
$target_dir = "../uploads/"; 

// Ensure folder exists
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$file_ext = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
$new_filename = "user_" . $id . "_" . time() . "." . $file_ext;
$target_file = $target_dir . $new_filename;

$check = getimagesize($_FILES["image"]["tmp_name"]);
if($check === false) {
    echo json_encode(["status" => "error", "message" => "File is not an image."]);
    exit;
}

if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    
    $db_path = "uploads/" . $new_filename; 
    
    $sql = "UPDATE tblcustomers SET profile_img=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $db_path, $id);
    
    if($stmt->execute()){
        echo json_encode(["status" => "success", "image_url" => $db_path]);
    } else {
        echo json_encode(["status" => "error", "message" => "DB Error"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Upload Error"]);
}
?>