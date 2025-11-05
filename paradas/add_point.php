<?php
// Archivo: add_point.php
// Descripción: Recibe un nuevo punto y lo añade al archivo JSON.

header('Content-Type: application/json');

// Validar que el método sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

$json_file_path = 'points.json';

// Obtener el cuerpo de la petición (que es un JSON)
$new_point_data = json_decode(file_get_contents('php://input'), true);

// Validación básica de los datos recibidos
// La descripción es opcional, por lo que no se valida su existencia.
if (
    !isset($new_point_data['title']) ||
    !isset($new_point_data['type']) ||
    !isset($new_point_data['lat']) ||
    !isset($new_point_data['lng']) ||
    !is_numeric($new_point_data['lat']) ||
    !is_numeric($new_point_data['lng'])
) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos o con formato incorrecto.']);
    exit;
}

// Cargar los puntos existentes
$points = [];
if (file_exists($json_file_path)) {
    $json_data = file_get_contents($json_file_path);
    $points = json_decode($json_data, true);
    // Si el JSON está mal formado o vacío, inicializar como array vacío
    if (!is_array($points)) {
        $points = [];
    }
}

// Añadir el nuevo punto al array
$points[] = $new_point_data;

// Guardar el array actualizado en el archivo JSON
// JSON_PRETTY_PRINT hace que el archivo sea legible para humanos
// LOCK_EX previene que otro proceso escriba en el archivo al mismo tiempo
if (file_put_contents($json_file_path, json_encode($points, JSON_PRETTY_PRINT), LOCK_EX)) {
    echo json_encode(['status' => 'success', 'message' => 'Punto añadido correctamente.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'No se pudo escribir en el archivo de datos.']);
}

?>