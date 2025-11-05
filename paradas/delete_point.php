<?php
// Archivo: delete_point.php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}
$json_file_path = 'points.json';
$data_to_delete = json_decode(file_get_contents('php://input'), true);

if (!isset($data_to_delete['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Falta el ID del punto a eliminar.']);
    exit;
}

$points = [];
if (file_exists($json_file_path)) {
    $points = json_decode(file_get_contents($json_file_path), true);
    if (!is_array($points)) $points = [];
}

$id_to_delete = $data_to_delete['id'];
$initial_count = count($points);

// Filtrar el array, manteniendo los puntos cuyo ID no coincida
$points = array_values(array_filter($points, function($p) use ($id_to_delete) {
    return !isset($p['id']) || $p['id'] !== $id_to_delete;
}));

if (count($points) < $initial_count) {
    if (file_put_contents($json_file_path, json_encode($points, JSON_PRETTY_PRINT), LOCK_EX)) {
        echo json_encode(['status' => 'success', 'message' => 'Punto eliminado.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo escribir en el archivo.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Punto no encontrado.']);
}
?>