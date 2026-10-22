<?php
require_once "../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("
        SELECT
            l.parking_location_id AS id,
            l.name,
            l.area,
            l.icon,
            l.description,
            l.status,
            COUNT(s.slot_id) AS total_slots,
            SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_slots
        FROM parking_locations l
        LEFT JOIN parking_slots s ON s.parking_location_id = l.parking_location_id
        GROUP BY l.parking_location_id
        ORDER BY l.name
    ");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row["total_slots"] = (int)$row["total_slots"];
        $row["available_slots"] = (int)$row["available_slots"];
    }
    respond(true, "", $rows);
}

if ($method === "POST") {
    $data = jsonInput();
    foreach (["id","name","area"] as $field) {
        if (trim((string)($data[$field] ?? "")) === "") respond(false, "$field is required", null, 422);
    }
    $stmt = $pdo->prepare("
        INSERT INTO parking_locations
        (parking_location_id,name,area,icon,description,status)
        VALUES (?,?,?,?,?,?)
    ");
    $stmt->execute([
        trim($data["id"]), trim($data["name"]), trim($data["area"]),
        $data["icon"] ?? "🅿️", $data["description"] ?? null, $data["status"] ?? "active"
    ]);
    respond(true, "Parking location created", null, 201);
}

if ($method === "PUT") {
    $data = jsonInput();
    $id = trim((string)($data["id"] ?? ""));
    if ($id === "") respond(false, "Location id is required", null, 422);

    $stmt = $pdo->prepare("
        UPDATE parking_locations
        SET name=?, area=?, icon=?, description=?, status=?
        WHERE parking_location_id=?
    ");
    $stmt->execute([
        $data["name"] ?? "", $data["area"] ?? "", $data["icon"] ?? "🅿️",
        $data["description"] ?? null, $data["status"] ?? "active", $id
    ]);
    respond(true, $stmt->rowCount() ? "Parking location updated" : "No changes made");
}

if ($method === "DELETE") {
    $data = jsonInput();
    $id = trim((string)($data["id"] ?? ""));
    if ($id === "") respond(false, "Location id is required", null, 422);
    try {
        $stmt = $pdo->prepare("DELETE FROM parking_locations WHERE parking_location_id=?");
        $stmt->execute([$id]);
        respond(true, "Parking location deleted");
    } catch (PDOException $e) {
        respond(false, "Cannot delete a location that still has slots", null, 409);
    }
}

respond(false, "Method not allowed", null, 405);
