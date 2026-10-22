<?php
require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") respond(false, "POST required", null, 405);
$data = jsonInput();

$name = trim((string)($data["name"] ?? ""));
$email = trim((string)($data["email"] ?? ""));
$password = (string)($data["password"] ?? "");
$phone = trim((string)($data["phone"] ?? ""));

if ($name === "" || strlen($name) < 3) respond(false, "Name must be at least 3 characters", null, 422);
if (!validateEmail($email)) respond(false, "Enter a valid email", null, 422);
if (strlen($password) < 6) respond(false, "Password must be at least 6 characters", null, 422);

$stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) respond(false, "Email already exists", null, 409);

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)");
$stmt->execute([$name, $email, $hash, $phone ?: null]);

respond(true, "Registration successful", [
    "user_id" => (int)$pdo->lastInsertId(),
    "name" => $name,
    "email" => $email
], 201);
