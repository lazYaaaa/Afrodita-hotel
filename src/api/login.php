<?php
// Настройки CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Обработка preflight-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Начинаем сессию как можно раньше
session_start();

// Настройки базы данных
$db_host = 'localhost';
$db_port = '5432';
$db_name = 'afrodita';
$db_user = 'postgres';
$db_pass = 'postgres';

// Инициализация ответа
$response = [
    'success' => false,
    'message' => '',
    'errors' => [],
    'user_id' => null,
    'username' => null,
    'email' => null,
    'is_admin' => false // добавляем по умолчанию
];

try {
    // Подключение к базе данных
    $dsn = "pgsql:host=$db_host;port=$db_port;dbname=$db_name";
    $conn = new PDO($dsn, $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Получаем JSON данные
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Проверка наличия обязательных полей
    if (!isset($data['email']) || !isset($data['password'])) {
        $response['errors'][] = "Неполные данные для входа";
        echo json_encode($response);
        exit();
    }

    $email = trim($data['email']);
    $password = trim($data['password']);

    // Валидация данных
    if (empty($email)) {
        $response['errors'][] = "Email обязателен для заполнения";
    }
    if (empty($password)) {
        $response['errors'][] = "Пароль обязателен для заполнения";
    }

    // Если есть ошибки валидации - возвращаем их
    if (!empty($response['errors'])) {
        echo json_encode($response);
        exit();
    }

    // Поиск пользователя в базе данных (добавляем is_admin)
    $stmt = $conn->prepare("SELECT id, username, email, password, is_admin FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Проверка пароля
        if (password_verify($password, $user['password'])) {
            // Проверяем, является ли пользователь админом
            $isAdmin = isset($user['is_admin']) && $user['is_admin'] ? true : false;

            // Сохраняем данные пользователя в сессии
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['logged_in'] = true;
            $_SESSION['is_admin'] = $isAdmin;

            // Формируем ответ
            $response['success'] = true;
            $response['message'] = "Вход выполнен успешно";
            $response['user_id'] = $user['id'];
            $response['username'] = $user['username'];
            $response['email'] = $user['email'];
            $response['is_admin'] = $isAdmin;
        } else {
            $response['errors'][] = "Неверный email или пароль";
        }
    } else {
        $response['errors'][] = "Неверный email или пароль";
    }
} catch (PDOException $e) {
    // В продакшене лучше не раскрывать детали ошибки базы данных клиенту
    $response['errors'][] = "Ошибка базы данных.";
    error_log("Database error in login: " . $e->getMessage());
} catch (Exception $e) {
    // В продакшене лучше не раскрывать детали ошибки сервера клиенту
    $response['errors'][] = "Ошибка сервера.";
    error_log("Server error in login: " . $e->getMessage());
}

// Отправляем ответ
echo json_encode($response);
?>
