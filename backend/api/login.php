<?php
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") respond(false, "POST required", null, 405);
$data = jsonInput();

$email = trim((string)($data["email"] ?? ""));
$password = (string)($data["password"] ?? "");

if (!validateEmail($email) || $password === "") respond(false, "Email and password are required", null, 422);

$stmt = $pdo->prepare("SELECT user_id,name,email,password,phone,role FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password"])) {
    respond(false, "Invalid email or password", null, 401);
}

session_regenerate_id(true);
$_SESSION["user_id"] = (int)$user["user_id"];

unset($user["password"]);
$user["user_id"] = (int)$user["user_id"];
respond(true, "Login successful", $user);
