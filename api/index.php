<?php

require 'vendor/autoload.php';

require_once 'cors.php';

use App\Router;
use App\Controllers\{ Albums, Auth, Pictures, User, chat };

// Variables d'environnement Vercel (au lieu de Dotenv)
$_ENV['DB_HOST'] = getenv('DB_HOST');
$_ENV['DB_NAME'] = getenv('DB_NAME');
$_ENV['DB_USER'] = getenv('DB_USER');
$_ENV['DB_PASSWORD'] = getenv('DB_PASSWORD');
$_ENV['DB_PORT'] = getenv('DB_PORT');

// Nettoyer l'URI pour votre routeur
$uri = $_SERVER['REQUEST_URI'];
$uri = preg_replace('#^/api#', '', $uri);
$_SERVER['REQUEST_URI'] = $uri ?: '/';

// Votre code exactement comme avant
$controllers = [
    Albums::class,
    Auth::class,
    Pictures::class,
    User::class,
    chat::class
];

$router = new Router();
$router->registerControllers($controllers);
$router->run();