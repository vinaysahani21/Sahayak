<?php
header("Access-Control-Allow-Origin: *");
include '../connection.php';
$id = $_GET['id'];
$res = $conn->query("SELECT * FROM tblproviders WHERE id = $id");
echo json_encode($res->fetch_assoc());
?>