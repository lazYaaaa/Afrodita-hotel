<?php
ini_set('display_errors', 1); // Включает отображение ошибок в выводе скрипта
ini_set('display_startup_errors', 1); // Включает отображение ошибок при запуске PHP
error_reporting(E_ALL); // Устанавливает уровень отчетности об ошибках на все возможные ошибки


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// Обработка OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Подключение к PostgreSQL
$db_host = 'localhost';
$db_port = '5432';
$db_name = 'afrodita';
$db_user = 'postgres';
$db_pass = 'postgres';

try {
    $conn = new PDO(
        "pgsql:host=$db_host;port=$db_port;dbname=$db_name",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die(json_encode(['errors' => ["Ошибка подключения к базе данных: " . $e->getMessage()]]));
}

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $data === null) {
    echo json_encode(['errors' => ["Некорректный запрос"]]);
    exit();
}

// Проверяем, что это запрос на регистрацию
if (!isset($data['register'])) {
    echo json_encode(['errors' => ["Неверный тип запроса"]]);
    exit();
}

// Извлекаем данные
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$confirm_password = trim($data['confirm_password'] ?? '');

// Валидация
$errors = [];

// Валидация имени пользователя
if (empty($username)) {
    $errors[] = "Имя пользователя обязательно для заполнения.";
} elseif (strlen($username) < 3) {
    $errors[] = "Имя пользователя должно содержать минимум 3 символа.";
} elseif (strlen($username) > 50) {
    $errors[] = "Имя пользователя должно быть не длиннее 50 символов.";
} elseif (!preg_match("/^[a-zA-Zа-яА-Я0-9_]+$/u", $username)) {
    $errors[] = "Имя пользователя может содержать только буквы, цифры и символ подчеркивания.";
}

// Валидация email
if (empty($email)) {
    $errors[] = "Email обязателен для заполнения.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Некорректный формат email.";
} elseif (strlen($email) > 100) {
    $errors[] = "Email должен быть не длиннее 100 символов.";
}

// Валидация пароля
if (empty($password)) {
    $errors[] = "Пароль обязателен для заполнения.";
} elseif (strlen($password) < 8) {
    $errors[] = "Пароль должен содержать минимум 8 символов.";
} elseif (!preg_match("#[0-9]+#", $password)) {
    $errors[] = "Пароль должен содержать хотя бы одну цифру.";
} elseif (!preg_match("#[A-Z]+#", $password)) {
    $errors[] = "Пароль должен содержать хотя бы одну заглавную букву.";
} elseif (!preg_match("#[a-z]+#", $password)) {
    $errors[] = "Пароль должен содержать хотя бы одну строчную букву.";
} 

// Проверка совпадения паролей
if ($password !== $confirm_password) {
    $errors[] = "Пароли не совпадают.";
}

// Если есть ошибки - возвращаем их
if (!empty($errors)) {
    echo json_encode(['errors' => $errors]);
    exit();
}

// Регистрация пользователя
try {
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Используем RETURNING для получения данных новой записи
    $stmt = $conn->prepare("
    INSERT INTO users (username, email, password, is_admin)
    VALUES (:username, :email, :password, FALSE)
    RETURNING id, username, email, is_admin
");
    
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);
    
    $stmt->execute();
    $newUser = $stmt->fetch();
    
    if ($newUser) {
        echo json_encode([
            'success' => true,
            'message' => 'Регистрация прошла успешно!',
            'user' => $newUser
        ]);
    } else {
        echo json_encode(['errors' => ["Не удалось зарегистрировать пользователя"]]);
    }
    
} catch (PDOException $e) {
    // Проверяем, является ли ошибка нарушением уникальности
    if ($e->getCode() == '23505') {
        $errorInfo = $e->errorInfo;
        if (strpos($errorInfo[2], 'username') !== false) {
            echo json_encode(['errors' => ["Имя пользователя уже занято"]]);
        } elseif (strpos($errorInfo[2], 'email') !== false) {
            echo json_encode(['errors' => ["Email уже занят"]]);
        } else {
            echo json_encode(['errors' => ["Ошибка при регистрации: " . $e->getMessage()]]);
        }
    } else {
        echo json_encode(['errors' => ["Ошибка при регистрации: " . $e->getMessage()]]);
    }
}
?>
