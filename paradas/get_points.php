<?php
// Archivo: get_points.php
// Descripción: Lee el archivo JSON y lo devuelve para que el frontend lo pueda usar.

header('Content-Type: application/json');

$json_file_path = 'points.json';

if (file_exists($json_file_path)) {
    $json_data = file_get_contents($json_file_path);
    // Validar si el JSON es válido antes de enviarlo
    json_decode($json_data);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo $json_data;
    } else {
        echo json_encode(['error' => 'El archivo de datos está corrupto.']);
    }
} else {
    // Si el archivo no existe, devuelve un array vacío.
    echo json_encode([]);
}

?>