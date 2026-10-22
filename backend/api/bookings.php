<?php
require_once "../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

function timeToMinutes(string $time): int {
    [$h, $m] = array_map("intval", explode(":", substr($time, 0, 5)));
    return $h * 60 + $m;
}

if ($method === "GET") {
    $userId = $_SESSION["user_id"] ?? null;
    if ($userId) {
        $stmt = $pdo->prepare("
            SELECT
                b.booking_id AS id,
                b.slot_id AS slotId,
                s.parking_location_id AS locationId,
                b.customer_name AS name,
                v.vehicle_number AS vehicleNumber,
                b.booking_date AS date,
                TIME_FORMAT(b.start_time,'%H:%i') AS startTime,
                TIME_FORMAT(b.end_time,'%H:%i') AS endTime,
                b.hours,
                b.amount AS total,
                b.status,
                b.created_at AS createdAt,
                l.name AS locationName,
                s.zone,
                s.slot_type AS slotType
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id=v.vehicle_id
            JOIN parking_slots s ON b.slot_id=s.slot_id
            JOIN parking_locations l ON s.parking_location_id=l.parking_location_id
            WHERE (b.user_id=? OR b.user_id IS NULL) AND b.status='confirmed'
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->query("
            SELECT
                b.booking_id AS id,
                b.slot_id AS slotId,
                s.parking_location_id AS locationId,
                b.customer_name AS name,
                v.vehicle_number AS vehicleNumber,
                b.booking_date AS date,
                TIME_FORMAT(b.start_time,'%H:%i') AS startTime,
                TIME_FORMAT(b.end_time,'%H:%i') AS endTime,
                b.hours,
                b.amount AS total,
                b.status,
                b.created_at AS createdAt,
                l.name AS locationName,
                s.zone,
                s.slot_type AS slotType
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id=v.vehicle_id
            JOIN parking_slots s ON b.slot_id=s.slot_id
            JOIN parking_locations l ON s.parking_location_id=l.parking_location_id
            WHERE b.status='confirmed'
            ORDER BY b.created_at DESC
        ");
    }
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row["id"] = (int)$row["id"];
        $row["slotId"] = (int)$row["slotId"];
        $row["hours"] = (float)$row["hours"];
        $row["total"] = (float)$row["total"];
    }
    respond(true, "", $rows);
}

if ($method === "POST") {
    $data = jsonInput();

    $slotId = (int)($data["slotId"] ?? 0);
    $name = trim((string)($data["name"] ?? ""));
    $vehicleNumber = strtoupper(trim((string)($data["vehicleNumber"] ?? "")));
    $date = trim((string)($data["date"] ?? ""));
    $start = trim((string)($data["startTime"] ?? ""));
    $end = trim((string)($data["endTime"] ?? ""));

    if ($slotId <= 0 || strlen($name) < 3 || $vehicleNumber === "" || $date === "" || $start === "" || $end === "") {
        respond(false, "All booking fields are required", null, 422);
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) respond(false, "Invalid booking date", null, 422);
    if ($date < date("Y-m-d")) respond(false, "Booking date cannot be in the past", null, 422);

    $startMin = timeToMinutes($start);
    $endMin = timeToMinutes($end);
    if ($endMin <= $startMin) respond(false, "End time must be after start time", null, 422);
    if (($endMin - $startMin) > 24 * 60) respond(false, "Maximum booking is 24 hours", null, 422);

    $stmt = $pdo->prepare("
        SELECT slot_id,parking_location_id,slot_type,hourly_rate,status
        FROM parking_slots WHERE slot_id=?
    ");
    $stmt->execute([$slotId]);
    $slot = $stmt->fetch();
    if (!$slot) respond(false, "Parking slot not found", null, 404);
    if ($slot["status"] === "inactive") respond(false, "Parking slot is inactive", null, 409);

    // Current UI uses status for its initial occupied slots.
    if ($slot["status"] === "occupied") {
        respond(false, "Parking slot is currently unavailable", null, 409);
    }

    // Prevent overlapping confirmed bookings for the same slot and date.
    $stmt = $pdo->prepare("
        SELECT booking_id,start_time,end_time
        FROM bookings
        WHERE slot_id=? AND booking_date=? AND status='confirmed'
          AND start_time < ? AND end_time > ?
        LIMIT 1
    ");
    $stmt->execute([$slotId, $date, $end . ":00", $start . ":00"]);
    if ($stmt->fetch()) respond(false, "Parking slot is already booked for this time", null, 409);

    $pdo->beginTransaction();
    try {
        $userId = $_SESSION["user_id"] ?? null;

        if ($userId) {
            $stmt = $pdo->prepare("SELECT vehicle_id FROM vehicles WHERE user_id=? AND vehicle_number=?");
            $stmt->execute([$userId, $vehicleNumber]);
        } else {
            $stmt = $pdo->prepare("SELECT vehicle_id FROM vehicles WHERE user_id IS NULL AND vehicle_number=?");
            $stmt->execute([$vehicleNumber]);
        }
        $vehicleId = $stmt->fetchColumn();

        if (!$vehicleId) {
            $stmt = $pdo->prepare("INSERT INTO vehicles (user_id,vehicle_number,vehicle_type) VALUES (?,?,?)");
            $stmt->execute([$userId, $vehicleNumber, $slot["slot_type"]]);
            $vehicleId = $pdo->lastInsertId();
        }

        $hours = ceil(($endMin - $startMin) / 60);
        $amount = (float)$slot["hourly_rate"] * $hours;

        $stmt = $pdo->prepare("
            INSERT INTO bookings
            (user_id,slot_id,vehicle_id,customer_name,booking_date,start_time,end_time,hours,amount,status)
            VALUES (?,?,?,?,?,?,?,?,?,'confirmed')
        ");
        $stmt->execute([
            $userId, $slotId, $vehicleId, $name, $date,
            $start . ":00", $end . ":00", $hours, $amount
        ]);

        $bookingId = (int)$pdo->lastInsertId();
        $pdo->commit();

        respond(true, "Booking created successfully", [
            "id" => $bookingId,
            "slotId" => $slotId,
            "locationId" => $slot["parking_location_id"],
            "name" => $name,
            "vehicleNumber" => $vehicleNumber,
            "date" => $date,
            "startTime" => $start,
            "endTime" => $end,
            "hours" => $hours,
            "total" => $amount
        ], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        respond(false, "Could not create booking", null, 500);
    }
}

if ($method === "PUT" || $method === "DELETE") {
    $data = jsonInput();
    $bookingId = (int)($data["bookingId"] ?? $data["id"] ?? 0);
    if ($bookingId <= 0) respond(false, "Booking id is required", null, 422);

    $stmt = $pdo->prepare("SELECT booking_id,slot_id,status FROM bookings WHERE booking_id=?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();
    if (!$booking) respond(false, "Booking not found", null, 404);

    if ($method === "PUT") {
        $newStatus = $data["status"] ?? "";
        if (!in_array($newStatus, ["confirmed","cancelled","completed"], true)) {
            respond(false, "Invalid booking status", null, 422);
        }
    } else {
        $newStatus = "cancelled";
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE bookings SET status=? WHERE booking_id=?");
        $stmt->execute([$newStatus, $bookingId]);

        $pdo->commit();
        respond(true, $method === "DELETE" ? "Booking cancelled successfully" : "Booking status updated");
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        respond(false, "Could not update booking", null, 500);
    }
}

respond(false, "Method not allowed", null, 405);
