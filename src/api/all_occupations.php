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

// Проверка авторизации и админских прав
if (!isset($_SESSION['logged_in']) || !isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'message' => 'Доступ запрещен. Требуются права администратора.']);
    exit;
}

// Подключение к БД
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

// Обработка GET-запроса (получение всех бронирований)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                b.id,
                b.user_id,
                u.username as user_name,
                u.email as user_email,
                b.room_id,
                r.title as room_title,
                r.cost as room_cost,
                b.check_in,
                b.check_out,
                b.adults,
                b.children,
                b.phone,
                b.message,
                b.status,
                b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();

        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'bookings' => $bookings
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка при получении списка бронирований: ' . $e->getMessage()]);
    }
    exit;
}

// Обработка POST-запроса (изменение статуса бронирования)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $bookingId = $input['id'] ?? null;
    $status = $input['status'] ?? null;

    if (!$bookingId || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Не указаны обязательные параметры (id и status)']);
        exit;
    }

    // Проверяем, что статус имеет допустимое значение
    $allowedStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!in_array($status, $allowedStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Недопустимый статус бронирования']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE bookings 
            SET status = :status 
            WHERE id = :id
            RETURNING id, status
        ");
        $stmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'updatedStatus' => $result['status']]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Бронирование не найдено']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении статуса бронирования: ' . $e->getMessage()]);
    }
    exit;
}

// Обработка DELETE-запроса (удаление бронирования администратором)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $bookingId = $input['id'] ?? null;

    if (!$bookingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Не указан ID бронирования']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            DELETE FROM bookings
            WHERE id = :id
            RETURNING id
        ");
        $stmt->bindParam(':id', $bookingId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Бронирование не найдено']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка при удалении бронирования: ' . $e->getMessage()]);
    }
    exit;
}

// Если метод не поддерживается
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
exit;
?>