<?php
// Archivo: edit_point.php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}
$json_file_path = 'points.json';
$updated_data = json_decode(file_get_contents('php://input'), true);

if (!isset($updated_data['id']) || !isset($updated_data['title'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Falta ID o datos para actualizar.']);
    exit;
}

$points = [];
if (file_exists($json_file_path)) {
    $points = json_decode(file_get_contents($json_file_path), true);
    if (!is_array($points)) $points = [];
}

$point_found = false;
foreach ($points as $index => &$point) { // Usar '&' para modificar el array original
    if (isset($point['id']) && $point['id'] === $updated_data['id']) {
        $point['title'] = $updated_data['title'];
        $point['type'] = $updated_data['type'];
        $point['description'] = $updated_data['description'];
        $point['lat'] = $updated_data['lat'];
        $point['lng'] = $updated_data['lng'];
        if ($point['type'] === 'semaforo') {
            $point['status'] = $updated_data['status'];
        }
        $point_found = true;
        break;
    }
}

if ($point_found) {
    if (file_put_contents($json_file_path, json_encode($points, JSON_PRETTY_PRINT), LOCK_EX)) {
        echo json_encode(['status' => 'success', 'message' => 'Punto actualizado.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo escribir en el archivo.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Punto no encontrado.']);
}
?>