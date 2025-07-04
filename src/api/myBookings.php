<?php
// Начинаем сессию для доступа к данным пользователя
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,     // Для разработки на localhost
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Обработка preflight-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка авторизации пользователя через сессию
if (!isset($_SESSION['logged_in']) || !isset($_SESSION['user_id']) || !isset($_SESSION['email']) || !isset($_SESSION['username'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Необходимо авторизоваться.']);
    exit;
}

// Получаем данные пользователя из сессии
$user_id = $_SESSION['user_id'];
$email = $_SESSION['email'];
$username = $_SESSION['username'];

// Подключение к БД
// Убедитесь, что эти переменные определены в файле database.php
require_once __DIR__ . '/../config/database.php';

$pdo = null;
$db_error = null;

try {
    $dsn = "pgsql:host=$db_host;port=$db_port;dbname=$db_name";
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $db_error = "Ошибка подключения к базе данных: " . $e->getMessage();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $db_error]);
    exit;
}


// Обработка GET-запроса (получение бронирований)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT b.*, r.title as room_title, r.cost as room_cost
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        ");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT); // Используем $user_id из сессии
        $stmt->execute();

        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'bookings' => $bookings,
                'user' => [
                    'id' => $user_id,
                    'name' => $username // Используем $username из сессии
                ]
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch bookings: ' . $e->getMessage()]);
    }
}

// Обработка DELETE-запроса (отмена бронирования)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $bookingId = $input['id'] ?? null;

    if (!$bookingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Booking ID required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            DELETE FROM bookings
            WHERE id = :id AND user_id = :user_id
            RETURNING id
        ");
        $stmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT); // Используем $user_id из сессии
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            // Если rowCount === 0, это может быть либо неверный ID, либо попытка удалить чужое бронирование
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found or access denied']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to cancel booking: ' . $e->getMessage()]);
    }
}

// Важно: Завершаем выполнение скрипта после отправки ответа
exit();

?>