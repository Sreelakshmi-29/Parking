<?php
require_once "../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $locationId = trim((string)($_GET["parking_location_id"] ?? $_GET["locationId"] ?? ""));
    if ($locationId !== "") {
        $stmt = $pdo->prepare("
            SELECT
                slot_id AS id,
                parking_location_id AS locationId,
                zone,
                slot_type AS type,
                hourly_rate AS hourlyRate,
                status,
                IF(status='occupied', TRUE, FALSE) AS occupied
            FROM parking_slots
            WHERE parking_location_id=?
            ORDER BY slot_id
        ");
        $stmt->execute([$locationId]);
    } else {
        $stmt = $pdo->query("
            SELECT
                slot_id AS id,
                parking_location_id AS locationId,
                zone,
                slot_type AS type,
                hourly_rate AS hourlyRate,
                status,
                IF(status='occupied', TRUE, FALSE) AS occupied
            FROM parking_slots
            ORDER BY slot_id
        ");
    }
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row["id"] = (int)$row["id"];
        $row["hourlyRate"] = (float)$row["hourlyRate"];
        $row["occupied"] = (bool)$row["occupied"];
    }
    respond(true, "", $rows);
}

if ($method === "PUT") {
    $data = jsonInput();
    $id = (int)($data["id"] ?? 0);
    $status = $data["status"] ?? null;
    if ($id <= 0 || !in_array($status, ["available","occupied","inactive"], true)) {
        respond(false, "Valid slot id and status are required", null, 422);
    }
    $stmt = $pdo->prepare("UPDATE parking_slots SET status=? WHERE slot_id=?");
    $stmt->execute([$status, $id]);
    respond(true, "Slot updated");
}

respond(false, "Method not allowed", null, 405);
