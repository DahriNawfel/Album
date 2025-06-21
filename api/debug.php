<?php
header('Content-Type: application/json');

$debug = [
    'php_version' => phpversion(),
    'loaded_extensions' => get_loaded_extensions(),
    'pdo_available' => extension_loaded('pdo'),
    'pdo_pgsql_available' => extension_loaded('pdo_pgsql'),
    'pgsql_available' => extension_loaded('pgsql'),
    'pdo_drivers' => class_exists('PDO') ? PDO::getAvailableDrivers() : [],
    'environment_vars' => [
        'DATABASE_URL' => getenv('DATABASE_URL') ? 'SET' : 'NOT SET',
        'VERCEL_PHP_EXTENSIONS' => getenv('VERCEL_PHP_EXTENSIONS')
    ]
];

echo json_encode($debug, JSON_PRETTY_PRINT);
?>