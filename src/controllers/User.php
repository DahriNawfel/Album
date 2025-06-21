<?php

namespace App\Controllers;


use App\Controllers\Controller;
use App\middlewares\AuthMiddleware;
use App\Models\UserModel;
use App\Utils\{Route, HttpException, JWT};


class User extends Controller {
    protected object $user;
    protected object $authMiddleware;
    protected array $header;
    private ?array $currentUser;

    public function __construct($param) {
        $this->user = new UserModel();
        $this->authMiddleware = new AuthMiddleware();
        $this->currentUser = $this->getCurrentUser();
        $this->header = getallheaders();

        parent::__construct($param);
    }


    #[Route("GET", "/user/:id", [AuthMiddleware::class])]
    public function getUserById() {
        $userId = intval($this->params['id']);
        $user = $this->user->getById($userId);

        if (gettype($user) !== 'array') {
            throw new HttpException("User not found.", 404);
        }

        return $user;
    }

    #[Route("GET", "/user-info", [AuthMiddleware::class])]
    public function getUserInfo() {
        if (!$this->currentUser) {
            throw new HttpException("Unauthorized access.", 401);
        }

        $userId = $this->currentUser['user_id'];
        $user = $this->user->getById($userId);

        if (gettype($user) !== 'array') {
            throw new HttpException("User not found.", 404);
        }

        return $user;
    }


    #[Route("PUT", "/user/:id", [AuthMiddleware::class])]
    public function updateUser() {
        $userId = intval($this->params['id']);
        $data = $this->body;

        if (empty($data)) {
            throw new HttpException("No data provided for update.", 400);
        }

        if ($userId !== (int)($this->currentUser['user_id']) && $this->currentUser['role'] !== 'admin') {
            throw new HttpException("You are not authorized to update this user.", 403);
        }

        return $this->user->update($userId, $data);
    }


    #[Route("DELETE", "/user/:id", [AuthMiddleware::class])]
    public function deleteUser() {
        $userId = intval($this->params['id']);

        if ($userId !== $this->currentUser['user_id'] && $this->currentUser['role'] !== 'admin') {
            throw new HttpException("You are not authorized to delete this user.", 403);
        }

        return $this->user->delete($userId);
    }

    #[Route("GET", "/users", [AuthMiddleware::class])]
    public function getAllUsers() {
        $role = $this->currentUser['role'] ?? null;

        if ($role !== 'admin') {
            throw new HttpException("You are not authorized to view all users.", 403);
        }

        return $this->user->getAll();
    }


    #[Route("GET", "/me", [AuthMiddleware::class])]
    public function getCurrentUserProfile() {
        if (!$this->currentUser) {
            throw new HttpException("Unauthorized access.", 401);
        }

        $userId = $this->currentUser['user_id'];
        $user = $this->user->getById($userId);

        if (gettype($user) !== 'array') {
            throw new HttpException("User not found.", 404);
        }

        return $user;
    }



      
    private function getCurrentUser(): ?array {
        if (!isset($_COOKIE['token'])) {
            return null;
        }

        $jwt = $_COOKIE['token'];
        
        try {
            return JWT::decode($jwt);
        } catch (\Exception $e) {
            return null;
        }
    }


}

