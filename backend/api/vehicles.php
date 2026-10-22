<?php
require_once "../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $userId = $_SESSION["user_id"] ?? null;
    if ($userId) {
        $stmt = $pdo->prepare("SELECT vehicle_id,vehicle_number,vehicle_type,created_at FROM vehicles WHERE user_id=? ORDER BY vehicle_id DESC");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->query("SELECT vehicle_id,vehicle_number,vehicle_type,created_at FROM vehicles ORDER BY vehicle_id DESC");
    }
    respond(true, "", $stmt->fetchAll());
}

if ($method === "POST") {
    $data = jsonInput();
    $number = strtoupper(trim((string)($data["vehicleNumber"] ?? $data["vehicle_number"] ?? "")));
    $type = $data["vehicleType"] ?? $data["vehicle_type"] ?? "Car";

    if ($number === "") respond(false, "Vehicle number is required", null, 422);
    if (!in_array($type, ["Car","Bike","EV"], true)) respond(false, "Invalid vehicle type", null, 422);

    $userId = $_SESSION["user_id"] ?? null;
    if ($userId) {
        $stmt = $pdo->prepare("SELECT vehicle_id FROM vehicles WHERE user_id=? AND vehicle_number=?");
        $stmt->execute([$userId, $number]);
    } else {
        $stmt = $pdo->prepare("SELECT vehicle_id FROM vehicles WHERE user_id IS NULL AND vehicle_number=?");
        $stmt->execute([$number]);
    }
    $existing = $stmt->fetchColumn();

    if ($existing) {
        respond(true, "Vehicle already exists", ["vehicle_id" => (int)$existing]);
    }

    $stmt = $pdo->prepare("INSERT INTO vehicles (user_id,vehicle_number,vehicle_type) VALUES (?,?,?)");
    $stmt->execute([$userId, $number, $type]);
    respond(true, "Vehicle added", ["vehicle_id" => (int)$pdo->lastInsertId()], 201);
}

if ($method === "PUT") {
    $data = jsonInput();
    $id = (int)($data["vehicleId"] ?? $data["vehicle_id"] ?? 0);
    $number = strtoupper(trim((string)($data["vehicleNumber"] ?? $data["vehicle_number"] ?? "")));
    $type = $data["vehicleType"] ?? $data["vehicle_type"] ?? "Car";
    if ($id <= 0 || $number === "" || !in_array($type, ["Car","Bike","EV"], true)) {
        respond(false, "Valid vehicle details are required", null, 422);
    }
    $stmt = $pdo->prepare("UPDATE vehicles SET vehicle_number=?,vehicle_type=? WHERE vehicle_id=?");
    $stmt->execute([$number, $type, $id]);
    respond(true, "Vehicle updated");
}

if ($method === "DELETE") {
    $data = jsonInput();
    $id = (int)($data["vehicleId"] ?? $data["vehicle_id"] ?? 0);
    if ($id <= 0) respond(false, "Vehicle id is required", null, 422);
    $stmt = $pdo->prepare("DELETE FROM vehicles WHERE vehicle_id=?");
    $stmt->execute([$id]);
    respond(true, "Vehicle deleted");
}

respond(false, "Method not allowed", null, 405);
