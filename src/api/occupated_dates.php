<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$db_host = 'localhost';
$db_port = '5432';
$db_name = 'afrodita';
$db_user = 'postgres';
$db_pass = 'postgres';

$room_id = isset($_GET['room_id']) ? intval($_GET['room_id']) : 0;

if ($room_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid room ID']);
    exit;
}

try {
    // Подключение к базе данных
    $dsn = "pgsql:host=$db_host;port=$db_port;dbname=$db_name";
    $conn = new PDO($dsn, $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Запрос для получения всех занятых периодов для выбранного номера
    $stmt = $conn->prepare("
    SELECT check_in, check_out, status
    FROM bookings 
    WHERE room_id = :room_id 
    AND check_out >= CURRENT_DATE
    ORDER BY check_in
");
$stmt->bindParam(':room_id', $room_id, PDO::PARAM_INT);
$stmt->execute();

$bookedPeriods = $stmt->fetchAll(PDO::FETCH_ASSOC);

$formattedPeriods = array_map(function($period) {
    return [
        'start' => $period['check_in'],
        'end' => $period['check_out'],
        'status' => $period['status'] // добавляем статус
    ];
}, $bookedPeriods);

echo json_encode(['booked_periods' => $formattedPeriods]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
