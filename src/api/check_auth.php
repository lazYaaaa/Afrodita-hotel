<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Обработка preflight-запроса OPTIONS (для CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
session_set_cookie_params([
    'lifetime' => 86400 * 30, // 30 дней
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false, // true для HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();


// Базовый ответ (совместим со старой версией)
$response = [
    'authenticated' => false,
    'user' => null
];

if (isset($_SESSION['user_id'])) {
    // Сохраняем старую структуру ответа
    $response = [
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'email' => $_SESSION['email'] ?? '',
            'is_admin' => $_SESSION['is_admin'] ?? false
        ]
    ];
    
    
    // Дополнительные поля для новых клиентов
    if (isset($_GET['extended']) && $_GET['extended'] === 'true') {
        require_once '../config/database.php';
        
        try {
            $pdo = new PDO(
                "pgsql:host=$db_host;port=$db_port;dbname=$db_name",
                $db_user,
                $db_pass
            );
            
            $stmt = $pdo->prepare("
                SELECT created_at, last_login 
                FROM users 
                WHERE id = :user_id
            ");
            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $userData = $stmt->fetch(PDO::FETCH_ASSOC);
                $response['user']['joined_at'] = $userData['created_at'];
                $response['user']['last_login'] = $userData['last_login'];
                $response['permissions'] = [
                    'view_bookings' => true,
                    'cancel_bookings' => true
                ];
            }
        } catch (PDOException $e) {
            // Не прерываем выполнение, просто не добавляем дополнительные поля
            error_log("Database error in check_auth: " . $e->getMessage());
        }
    }
}

// Если файл вызывается напрямую (не через require)
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    
    echo json_encode($response);
}
?>