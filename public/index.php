<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// En producción el repo se clona en laravel/ y public_html/ tiene el contenido de public/.
// En local el proyecto vive en una sola carpeta y public/ está dentro del proyecto.
$laravelPath = file_exists(__DIR__.'/../laravel/bootstrap/app.php')
    ? __DIR__.'/../laravel'
    : __DIR__.'/..';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = "$laravelPath/storage/framework/maintenance.php")) {
    require $maintenance;
}

// Register the Composer autoloader...
require "$laravelPath/vendor/autoload.php";

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once "$laravelPath/bootstrap/app.php";

// En producción public_html/ es el web root, no laravel/public/.
// Esto hace que public_path() apunte al directorio correcto para guardar imágenes, etc.
if ($laravelPath !== __DIR__.'/..') {
    $app->usePublicPath(__DIR__);
}

$app->handleRequest(Request::capture());
