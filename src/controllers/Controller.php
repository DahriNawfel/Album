<?php
namespace App\Controllers;

class Controller {
    protected array $params;
    protected string $reqMethod;
    protected array $body;
    protected string $className;
    
    public function __construct($params) {
        $this->className = $this->getCallerClassName();
        $this->params = $params;
        $this->reqMethod = strtolower($_SERVER['REQUEST_METHOD']);
        $this->body = (array) json_decode(file_get_contents('php://input'));
        $this->header();
    }
    
    protected function getCallerClassName() {
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 2);
        if (isset($backtrace[1]['object'])) {
            $fullClassName = get_class($backtrace[1]['object']);
            $className = basename(str_replace('\\', '/', $fullClassName));
            return $className;
        }
        return 'Unknown';
    }
    
    protected function json($data, int $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    protected function header() {
        // Gestion des requêtes OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Access-Control-Allow-Origin: https://album-l2pu.vercel.app');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400'); // Cache preflight pour 24h
            http_response_code(200);
            exit;
        }
        
        // Headers CORS pour toutes les autres requêtes
        header('Access-Control-Allow-Origin: https://album-l2pu.vercel.app');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: Content-Length, X-JSON');
        header('Content-type: application/json; charset=utf-8');
    }
}