<?php
// backend/config/database.php
header("Content-Type: application/json; charset=UTF-8");

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$host = "localhost";
$db   = "parkease";
$user = "root";
$pass = "";
$charset = "utf8mb4";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=$charset",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function jsonInput(): array {
    $raw = file_get_contents("php://input");
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond(bool $success, string $message = "", $data = null, int $status = 200): never {
    http_response_code($status);
    $response = ["success" => $success];
    if ($message !== "") $response["message"] = $message;
    if ($data !== null) $response["data"] = $data;
    echo json_encode($response);
    exit;
}

function requireLogin(): int {
    if (empty($_SESSION["user_id"])) {
        respond(false, "Please login first", null, 401);
    }
    return (int) $_SESSION["user_id"];
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
