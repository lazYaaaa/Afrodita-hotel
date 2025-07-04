<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,     // Для разработки на localhost
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();
// Установите заголовки CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Разрешаем только POST и OPTIONS
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Разрешаем Content-Type и Authorization

// --- Настройки ---

// Настройки PostgreSQL
$db_host = 'localhost';
$db_port = '5432';
$db_name = 'afrodita'; // Убедитесь, что это правильное имя БД
$db_user = 'postgres';     // Убедитесь, что это правильный пользователь
$db_pass = 'postgres';   // Убедитесь, что это правильный пароль

// Настройки SMTP для отправки email (для реального использования нужно будет настроить PHPMailer или аналогичную библиотеку)
$smtp_host = '-'; // smtp.example.com
$smtp_username = '-'; // hotel@example.com
$smtp_password = '-'; // email_password
$owner_email = '-'; // owner@example.com

// --- Инициализация подключения к БД ---

$conn = null;
$db_error = null; // <-- Инициализация переменной $db_error

try {
    $dsn = "pgsql:host=$db_host;port=$db_port;dbname=$db_name";
    $conn = new PDO($dsn, $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $db_error = "Ошибка подключения к базе данных: " . $e->getMessage();
}


// --- Вспомогательные функции ---

// Валидация данных бронирования
function validateBookingDates(string $check_in): array {
    $errors = [];
    // Валидация только даты заезда, так как дата выезда валидируется относительно нее
    $today = new DateTime('today'); // Получаем начало текущего дня
    try {
        $check_in_date = new DateTime($check_in);
        if ($check_in_date < $today) {
            $errors[] = "Дата заезда не может быть в прошлом.";
        }
    } catch (Exception $e) {
        $errors[] = "Некорректный формат даты заезда.";
    }
    return $errors;
}

// Валидация даты выезда относительно даты заезда
function validateCheckOutDate(string $check_in, string $check_out): array {
     $errors = [];
     if (empty($check_in) || empty($check_out)) {
          // Эти ошибки уже должны быть пойманы validateBookingDates или при проверке на пустоту
          return $errors;
     }
     try {
          $check_in_date = new DateTime($check_in);
          $check_out_date = new DateTime($check_out);
          if ($check_out_date <= $check_in_date) {
              $errors[] = "Дата выезда должна быть позже даты заезда.";
          }
     } catch (Exception $e) {
          $errors[] = "Некорректный формат даты выезда.";
     }
     return $errors;
}


function validateGuests(int $adults, int $children): array {
    $errors = [];

    if ($adults < 1) {
        $errors[] = "Должен быть хотя бы один взрослый.";
    } elseif ($adults > 10) { // Пример максимального количества взрослых
        $errors[] = "Максимальное количество взрослых - 10.";
    }

    if ($children < 0) {
        $errors[] = "Количество детей не может быть отрицательным.";
    } elseif ($children > 10) { // Пример максимального количества детей
        $errors[] = "Максимальное количество детей - 10.";
    }

    // Пример проверки общего количества гостей
    if (($adults + $children) > 12) { // Пример общего максимума
         $errors[] = "Общее количество гостей не может превышать 12.";
    }

    return $errors;
}

function validatePhone(?string $phone): array { // Сделаем телефон опциональным для валидации, но обязательным для заполнения
    $errors = [];

    if (empty($phone)) {
        $errors[] = "Номер телефона обязателен для заполнения.";
    } elseif (!preg_match("/^\+?[0-9\s\-\(\)]{10,20}$/", $phone)) { // Простая проверка формата
        $errors[] = "Некорректный формат номера телефона.";
    }

    return $errors;
}
function isRoomAvailable(PDO $conn, int $room_id, string $check_in, string $check_out): bool {
    try {
        $stmt = $conn->prepare("
            SELECT COUNT(*) 
            FROM bookings 
            WHERE room_id = :room_id 
              AND status IN ('pending', 'confirmed')
              AND (
                check_in < :check_out AND check_out > :check_in
              )
        ");

        $stmt->bindParam(':room_id', $room_id, PDO::PARAM_INT);
        $stmt->bindParam(':check_in', $check_in);
        $stmt->bindParam(':check_out', $check_out);
        $stmt->execute();

        $count = $stmt->fetchColumn();

        // Если пересечений нет (count == 0), то номер свободен
        return $count == 0;
    } catch (PDOException $e) {
        error_log("Ошибка проверки доступности номера: " . $e->getMessage());
        return false;
    }
}

// --- Обработка запроса ---



// Обработка preflight-запроса OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400"); // Cache preflight response for 1 day
    http_response_code(204); // No Content
    exit();
}

// Установите Content-Type для ответов JSON
header("Content-Type: application/json");

// Проверяем, что запрос является POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['errors' => ['Метод запроса не разрешен. Используйте POST.']]);
    exit();
}

// Получаем данные из тела запроса (JSON)
$data = json_decode(file_get_contents('php://input'), true);

// Проверяем, что данные успешно декодированы и не пустые
if ($data === null || !is_array($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(['errors' => ["Некорректный или пустой JSON в теле запроса."]]);
    exit();
}

// Проверяем наличие обязательного параметра 'book_room' и его значение
if (!isset($data["book_room"]) || $data["book_room"] !== true) {
     http_response_code(400); // Bad Request
     echo json_encode(['errors' => ['Отсутствует или некорректный параметр "book_room" в запросе.']]);
     exit();
}


// Проверка подключения к базе данных
// Теперь $db_error всегда определена благодаря инициализации
if ($db_error) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['errors' => [$db_error]]);
    exit();
}

// Проверка авторизации пользователя
if (!isset($_SESSION['logged_in']) || !isset($_SESSION['user_id']) || !isset($_SESSION['email']) || !isset($_SESSION['username'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['errors' => ["Необходимо авторизоваться для бронирования."]]);
    exit();
}

// Получаем данные из декодированного JSON
$check_in = trim($data["check_in"] ?? '');
$check_out = trim($data["check_out"] ?? '');
$adults = intval($data["adults"] ?? 0); // Установим 0 по умолчанию, чтобы валидация сработала
$children = intval($data["children"] ?? 0);
$phone = trim($data["phone"] ?? '');
$message = trim($data["message"] ?? '');
$room_id = intval($data["room_id"] ?? 0); // Получаем room_id из запроса

$email = $_SESSION['email'];
$user_id = $_SESSION['user_id'];
$username = $_SESSION['username'];

// Валидация полученных данных
$errors = [];

// Проверка на пустоту обязательных полей
if (empty($check_in)) $errors[] = "Дата заезда обязательна.";
if (empty($check_out)) $errors[] = "Дата выезда обязательна.";
if ($room_id < 0) $errors[] = "Некорректный ID комнаты.";


// Выполняем валидацию с помощью функций
    // Проверка доступности номера
$errors = array_merge($errors, validateBookingDates($check_in)); // Валидация даты заезда
$errors = array_merge($errors, validateCheckOutDate($check_in, $check_out)); // Валидация даты выезда относительно заезда
$errors = array_merge($errors, validateGuests($adults, $children));
$errors = array_merge($errors, validatePhone($phone));

if (!isRoomAvailable($conn, $room_id, $check_in, $check_out)) {
    $errors[] = "Выбранный номер уже забронирован на указанные даты. Пожалуйста, выберите другие даты или другой номер.";
}
// Если есть ошибки валидации, возвращаем их
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['errors' => $errors]);
    exit();
}

// --- Логика сохранения в базу данных ---

try {
    // Проверяем существование комнаты с таким ID (опционально, но рекомендуется)
    $stmt_room = $conn->prepare("SELECT id FROM rooms WHERE id = :room_id");
    $stmt_room->bindParam(':room_id', $room_id);
    $stmt_room->execute();
    if ($stmt_room->rowCount() === 0) {
         http_response_code(404); // Not Found
         echo json_encode(['errors' => ["Комната с ID $room_id не найдена."]]);
         exit();
    }


    // Сохраняем бронирование в базу данных
    $stmt = $conn->prepare("INSERT INTO bookings 
    (user_id, email, check_in, check_out, adults, children, phone, message, created_at, room_id) 
    VALUES (:user_id, :email, :check_in, :check_out, :adults, :children, :phone, :message, NOW(), :room_id)");

$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':check_in', $check_in);
$stmt->bindParam(':check_out', $check_out);
$stmt->bindParam(':adults', $adults);
$stmt->bindParam(':children', $children);
$stmt->bindParam(':phone', $phone);
$stmt->bindParam(':message', $message);
$stmt->bindParam(':room_id', $room_id);  // Добавляем привязку room_id

    if ($stmt->execute()) {
        $booking_id = $conn->lastInsertId();

        // --- Отправка email владельцу (с использованием mail() - для PHPMailer нужна отдельная реализация) ---
        // В реальном приложении рекомендуется использовать библиотеку, такую как PHPMailer
        if ($smtp_host !== '-') { // Проверяем, настроены ли параметры SMTP
             $subject = "Новое бронирование #$booking_id";
             $email_message = "
             <h2>Новое бронирование</h2>
             <p><strong>Номер брони:</strong> #$booking_id</p>
             <p><strong>Гость:</strong> {$username}</p>
             <p><strong>Email:</strong> $email</p>
             <p><strong>Телефон:</strong> $phone</p>
             <p><strong>Комната ID:</strong> $room_id</p>
             <p><strong>Даты:</strong> с $check_in по $check_out</p>
             <p><strong>Гости:</strong> $adults взрослых, $children детей</p>
             <p><strong>Сообщение:</strong><br>".nl2br(htmlspecialchars($message))."</p>
             ";

             $headers = "MIME-Version: 1.0\r\n";
             $headers .= "Content-type: text/html; charset=utf-8\r\n";
             // В реальном приложении From: должен быть корректно настроен
             $headers .= "From: $smtp_username\r\n";
             $headers .= "Reply-To: $email\r\n";

             // mail() может не работать без настройки SMTP в php.ini или использования библиотеки
             // Для PHPMailer вам нужно будет включить библиотеку и использовать ее методы
             @mail($owner_email, $subject, $email_message, $headers); // Используем @ для подавления ошибок mail() если она не настроена
        }
        // --- Конец отправки email ---


        // Успешное бронирование
        http_response_code(201); // Created
        echo json_encode([
            'success' => true,
            'message' => "Бронирование успешно создано!",
            'booking_id' => $booking_id,
            // 'redirect_url' => "/booking_confirmation/$booking_id" // Можно вернуть URL для перенаправления на фронтенде
            // Убрал redirect_url, так как фронтенд сам должен решить, куда перенаправлять
        ]);

    } else {
         // Ошибка выполнения запроса INSERT
         http_response_code(500); // Internal Server Error
         echo json_encode(['errors' => ["Не удалось сохранить бронирование в базу данных."]]);
    }

} catch (PDOException $e) {
    // Ошибка базы данных
    http_response_code(500); // Internal Server Error
    echo json_encode(['errors' => ["Ошибка базы данных при бронировании: " . $e->getMessage()]]);
} catch (Exception $e) {
     // Другие возможные исключения (например, от new DateTime)
     http_response_code(500); // Internal Server Error
     echo json_encode(['errors' => ["Произошла внутренняя ошибка сервера: " . $e->getMessage()]]);
}

// Важно: Завершаем выполнение скрипта после отправки ответа
exit();

?>
