<?php

namespace App\Controllers;

use App\Controllers\Controller;
use App\middlewares\AuthMiddleware;
use App\Models\AlbumModel;
use App\Utils\{Route, HttpException, JWT};

class Albums extends Controller {
  protected object $album;
  protected object $authMiddleware;
  protected array $header;
  private ?array $currentUser;

  public function __construct($param) {
    $this->album = new AlbumModel();
    $this->authMiddleware = new AuthMiddleware();
    $this->currentUser = $this->getCurrentUser();
    $this->header = getallheaders();

    parent::__construct($param);
  }

  #[Route("POST", "/album", [AuthMiddleware::class])]
  public function album() {

      $data = $this->body;
      if (empty($data['title']) && empty($data['privacy'])) {
        throw new HttpException("Missing title or privacy.", 400);
      }
      $data['user_id'] = $this->currentUser['user_id'];
      $data['username'] = $this->currentUser['username'];
      return $this->album->create($data);
    }

  #[Route("DELETE", "/album/:id", [AuthMiddleware::class])]
  public function deleteAlbum() {

      $user_id = $this->currentUser['user_id'];
      $album = $this->album->getById(intval($this->params['id']));
      if (gettype($album)!=='array') {
        throw new HttpException("Album not found.", 404);
      }
      if ($album["user_id"] != $user_id && $this->currentUser['role'] != 'admin') {
        throw new HttpException("You are not authorized to delete this post.", 403);
      }
      return $this->album->delete(intval($this->params['id']));
  }



  #[Route("GET", "/album/:id", [AuthMiddleware::class])]
  public function getAlbumById() {
      $user_id = $this->currentUser['user_id'];
      $role = $this->currentUser['role'] ?? null;
      $data = ['user_id' => $user_id, 'role' => $role];
      $album = $this->album->getById(intval($this->params['id']), $data);
      if (gettype($album)!='array') {
        throw new HttpException("Album not found.", 404);
      }
      return $album;
  }

  #[Route("GET", "/myalbums", [AuthMiddleware::class])]
  public function getMyAlbums() {
      $user_id = $this->currentUser['user_id'];
      $role = $this->currentUser['role'];
      $data = ['user_id' => $user_id, 'role' => $role];
      return $this->album->getMyalbum($data);
  }

  #[Route("GET", "/albums", [AuthMiddleware::class])]
  public function getAlbums() {
      $user_id = $this->currentUser['user_id'];
      $role = $this->currentUser['role'];
      $data = ['user_id' => $user_id, 'role' => $role];
      $limit = isset($this->params['limit']) ? intval($this->params['limit']) : null;
      return $this->album->getAll($limit, $data);
  }

  #[Route("PUT", "/album/:id", [AuthMiddleware::class])]
  public function updateAlbum() {
      $user_id = $this->currentUser['user_id'];
      $role = $this->currentUser['role'];
      $data = ['user_id' => $user_id, 'role' => $role];
      $album = $this->album->getById(intval($this->params['id']), $data);
      if (gettype($album)!='array') {
        throw new HttpException("Post not found.", 404);
      }
      if ($album["user_id"] != $user_id && $this->currentUser['role'] != 'admin') {
        throw new HttpException($user_id . ' ' . $album['user_id'], 403);
      }
      try {
        $id = intval($this->params['id']);
        $data = $this->body;
        if (empty($data)) {
          throw new HttpException("Missing parameters for the update.", 400);
        }
        $updateData = array_intersect_key($data, array_flip($this->album->authorized_fields_to_update));
        if (empty($updateData)) {
          throw new HttpException("No valid fields to update.", 400);
        }
        $this->album->update($updateData, $id);
        return $this->album->getById($id, $data);
      } catch (HttpException $e) {
        throw $e;
      }
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