<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../connection.php';

// Added WHERE is_active = 1 to only fetch active categories
$sql = "SELECT id, name FROM tblcategories WHERE is_active = 1";
$result = $conn->query($sql);

$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}
echo json_encode($categories);
?>  