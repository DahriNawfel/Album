<?php 

namespace App\Controllers;

use App\Controllers\Controller;
use App\Models\AuthModel;
use App\Utils\{Route, HttpException};

class Auth extends Controller {
  protected object $auth;

  public function __construct($params) {
    $this->auth = new AuthModel();
    parent::__construct($params);
  }


  #[Route("POST", "/auth/register")]
  public function register() {
      try {
          $data = $this->body;
          if (empty($data['email']) || empty($data['password']) || empty($data['secret'])) {
              throw new HttpException("Missing email or password or secret.", 400);
          }

          if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpException("Invalid email format.", 400);
          }
          $user = $this->auth->register($data);
          return $user;
      } catch (\Exception $e) {
          throw new HttpException($e->getMessage(), 400);
      }
  }

  #[Route("POST", "/auth/login")]
  public function login() {
    try {
        $data = $this->body;
        if (empty($data['email']) || empty($data['password'])) {
            throw new HttpException("Missing email or password.", 400);
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpException("Invalid email format.", 400);
        }
        
        $token = $this->auth->login($data['email'], $data['password']);
        
        // Définir le cookie
        setcookie("token", $token['token'], [
            'expires' => time() + 86400,
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'lax'
        ]);
        
        // Retourner une réponse JSON appropriée
        return $this->json([
            'success' => true,
            'message' => 'Login successful'
        ], 200);
        
    } catch (\Exception $e) {
        throw new HttpException($e->getMessage(), 401);
    }
}


    #[Route("POST", "/auth/logout")]
    public function logout() {
        try {
            if (!isset($_COOKIE['token'])) {
                throw new HttpException("Not logged in.", 401);
            }
            setcookie("token", "", [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => 'localhost',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'lax'
            ]);
            return ['message' => 'Logged out successfully.'];
        } catch (\Exception $e) {
            throw new HttpException($e->getMessage(), 500);
        }
    }

    #[Route("GET", "/auth/checkAuth")]
    public function checkAuth() {
        try {
            if (!isset($_COOKIE['token'])) {
                $isAuthenticated = false;
            } else {
                $isAuthenticated = $this->auth->isTokenValid($_COOKIE['token']);
            }
        
            return $this->json([
                'authenticated' => $isAuthenticated
            ], 200);
        
        } catch (\Exception $e) {
            return $this->json([
                'authenticated' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }



    #[Route("POST", "/auth/resetPassword")]
    public function resetPassword() {
        try {
            $data = $this->body;
            if (empty($data['email'])) {
                throw new HttpException("Missing email.", 400);
            }

            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new HttpException("Invalid email format.", 400);
            }
            if (empty($data['secret'])) {
                throw new HttpException("Missing secret.", 400);
            }
            $resetInfo = $this->auth->resetPassword($data['email'], $data['secret']);
            return [
                'message' => 'token sent',
                'reset_token' => $resetInfo['reset_token'],
                'expires' => $resetInfo['expires']
            ];
        } catch (\Exception $e) {
            throw new HttpException($e->getMessage(), 400);
        }
    }


    #[Route("POST", "/auth/renitialisePassword")]
    public function renitialisePassword() {
        try {
            $data = $this->body;
            if (empty($data['token']) || empty($data['new_password'])) {
                throw new HttpException("Missing token or new password.", 400);
            }
            $this->auth->renitialisePassword($data['token'], $data['new_password']);
            return ['message' => 'Password has been reset successfully.'];
        } catch (\Exception $e) {
            throw new HttpException($e->getMessage(), 400);
        }
    }

}