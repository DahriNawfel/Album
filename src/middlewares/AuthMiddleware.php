<?php 

namespace App\Middlewares;

use App\Utils\JWT;

class AuthMiddleware {
    public function handle($request) {
        // Check if the 'token' cookie is set
        if (!isset($_COOKIE['token'])) {
            return $this->unauthorizedResponse();
        }

        $jwt = $_COOKIE['token'];

        // Verify the JWT and return the result
        if (!JWT::verify($jwt)) {
            return $this->unauthorizedResponse();
        }

        // Proceed with the request if JWT is valid
        return true;
    }

    // Helper method to return an unauthorized response
    private function unauthorizedResponse() {
        // Here, you could return a response with a 401 status code and an error message
        echo json_encode(['error' => "Unauthorized"]);
        http_response_code(401);
        return false;
    }
}