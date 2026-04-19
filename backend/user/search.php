<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include '../connection.php'; // Adjust path if needed

$query = isset($_GET['q']) ? trim($_GET['q']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

if (empty($query) && empty($category)) {
    echo json_encode([]); 
    exit;
}

// Base query with JOINs
$sql = "SELECT 
            ps.id, 
            p.id as provider_id,
            ps.service_name, 
            ps.price_per_hour, 
            ps.description,
            p.name as provider_name, 
            p.profile_img, 
            p.profession,
            p.city, 
            p.is_verified,
            c.name as category_name
        FROM tblprovider_services ps
        JOIN tblproviders p ON ps.provider_id = p.id
        LEFT JOIN tblcategories c ON ps.category_id = c.id
        WHERE 1=1";

$params = [];
$types = "";

// 1. Handle Text Search
if (!empty($query)) {
    $sql .= " AND (ps.service_name LIKE ? OR p.name LIKE ? OR p.city LIKE ? OR p.profession LIKE ?)";
    $searchTerm = "%" . $query . "%";
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types .= "ssss";
}

// 2. Handle Category Click
if (!empty($category)) {
    $sql .= " AND c.slug = ?";
    array_push($params, $category);
    $types .= "s";
}

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$services = [];
while ($row = $result->fetch_assoc()) {
    $services[] = $row;
}

echo json_encode($services);
?>