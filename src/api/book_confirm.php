<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");

$response = [
    'success' => false,
    'message' => '',
    'booking' => null,
    'errors' => []
];

try {
    // Проверка авторизации
    if (!isset($_SESSION['logged_in']) || !isset($_SESSION['user_id'])) {
        $response['errors'][] = 'Требуется авторизация';
        http_response_code(401);
        echo json_encode($response);
        exit();
    }

    // Проверка параметра ID
    if (!isset($_GET['id'])) {
        $response['errors'][] = 'Не указан ID бронирования';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $booking_id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($booking_id === false || $booking_id <= 0) {
        $response['errors'][] = 'Некорректный ID бронирования';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    // Подключение к базе данных
    $db_host = 'localhost';
    $db_port = '5432';
    $db_name = 'afrodita';
    $db_user = 'postgres';
    $db_pass = 'postgres';

    $dsn = "pgsql:host=$db_host;port=$db_port;dbname=$db_name";
    $conn = new PDO($dsn, $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Запрос данных бронирования
    $stmt = $conn->prepare("
        SELECT 
            b.id, b.check_in, b.check_out, b.adults, b.children, b.phone, b.message,
            r.title as room_title, r.cost as room_cost,
            u.username as user_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = :id AND b.user_id = :user_id
    ");
    $stmt->bindParam(':id', $booking_id, PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        $response['errors'][] = 'Бронирование не найдено';
        http_response_code(404);
        echo json_encode($response);
        exit();
    }

    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    // Форматирование данных для ответа
    $response['success'] = true;
    $response['booking'] = [
        'id' => $booking['id'],
        'room_title' => htmlspecialchars($booking['room_title']),
        'check_in' => $booking['check_in'],
        'check_out' => $booking['check_out'],
        'nights' => (new DateTime($booking['check_out']))->diff(new DateTime($booking['check_in']))->days,
        'adults' => $booking['adults'],
        'children' => $booking['children'],
        'total_guests' => $booking['adults'] + $booking['children'],
        'phone' => htmlspecialchars($booking['phone']),
        'message' => htmlspecialchars($booking['message']),
        'total_cost' => (new DateTime($booking['check_out']))->diff(new DateTime($booking['check_in']))->days * $booking['room_cost'],
        'user_name' => htmlspecialchars($booking['user_name'])
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    $response['errors'][] = 'Ошибка базы данных: ' . $e->getMessage();
    http_response_code(500);
    echo json_encode($response);
    exit();
} catch (Exception $e) {
    $response['errors'][] = 'Ошибка сервера: ' . $e->getMessage();
    http_response_code(500);
    echo json_encode($response);
    exit();
}
