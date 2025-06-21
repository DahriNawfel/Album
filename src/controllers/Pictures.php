<?php

namespace App\Controllers;

use App\Controllers\Controller;
use App\middlewares\AuthMiddleware;
use App\Models\PictureModel;
use App\Utils\{Route, HttpException, JWT};

class Pictures extends Controller {
  protected object $picture;
  protected object $authMiddleware;
  protected array $header;
  private ?array $currentUser;

  public function __construct($param) {
    $this->picture = new PictureModel();
    $this->currentUser = $this->getCurrentUser();
    $this->authMiddleware = new AuthMiddleware();
    $this->header = getallheaders();

    parent::__construct($param);
  }

  #[Route("POST", "/picture", [AuthMiddleware::class])]
  public function picture() {
      $data = $this->body;

      if (!isset($data['picture'])) {
        $data['picture'] = null;
      }
      $userId = $this->currentUser['user_id'];
      $data['user_id'] = $userId;
      return $this->picture->create($data);
  }

  #[Route("DELETE", "/picture/:id", [AuthMiddleware::class])]
  public function deletePicture() {
      $user_id = $this->currentUser['user_id'];
      $picture = $this->picture->getById(intval($this->params['id']));
      if (gettype($picture)!=='array') {
        throw new HttpException("Post not found.", 404);
      }
      if ($picture["user_id"] !== $user_id && $this->currentUser['role'] !== 'admin') {
        throw new HttpException("You are not authorized to delete this post.", 403);
      }
      return $this->picture->delete(intval($this->params['id']));
  }

  #[Route("GET", "/picture/:id", [AuthMiddleware::class])]
  public function getPicture() {
      $id = $this->params['id'];
      return $this->picture->getById($id);
  }

  #[Route("GET", "/pictures")]
  public function getPictures() {
      $limit = isset($this->params['limit']) ? intval($this->params['limit']) : null;
      return $this->picture->getAll($limit);
  }

  #[Route("GET", "/byalbum/:id", [AuthMiddleware::class])]
  public function getPicturesByAlbum() {
      $albumId = intval($this->params['id']);
      $pictures = $this->picture->getByAlbumId($albumId);
      if (empty($pictures)) {
        throw new HttpException("No pictures found for this album.", 404);
      }
      return $pictures;
  }

  #[Route("PUT", "/picture/:id", [AuthMiddleware::class])]
  public function updatePost() {
      $user_id = $this->currentUser['user_id'];
      $picture = $this->picture->getById(intval($this->params['id']));
      if (gettype($picture)!='array') {
        throw new HttpException("Post not found.", 404);
      }
      if ($picture["user_id"] !== $user_id && $this->currentUser['role'] !== 'admin') {
        throw new HttpException("You are not authorized to update this post.", 403);
      }
      try {
        $id = intval($this->params['id']);
        $data = $this->body;
        if (empty($data)) {
          throw new HttpException("Missing parameters for the update.", 400);
        }
        $updateData = array_intersect_key($data, array_flip($this->picture->authorized_fields_to_update));
        if (empty($updateData)) {
          throw new HttpException("No valid fields to update.", 400);
        }
        $this->picture->update($updateData, $id);
        return $this->picture->getById($id);
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