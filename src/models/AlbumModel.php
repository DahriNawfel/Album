<?php

namespace App\Models;

use \PDO;
use stdClass;

class AlbumModel extends SqlConnect {
    private $table = "album";
    public $authorized_fields_to_update = ['title', 'privacy'];

    public function create(array $data) {
      $query = "
        INSERT INTO $this->table (user_id, username, title, privacy)
        VALUES (:user_id, :username, :title, :privacy)
      ";

      $req = $this->db->prepare($query);
      $req->execute($data);
      return $this->getLast();
    }

    public function delete(int $id) {
      $photoReq = $this->db->prepare("DELETE FROM pictures WHERE album_id = :album_id");
      $photoReq->execute(["album_id" => $id]);

      // Then delete the album itself
      $req = $this->db->prepare("DELETE FROM $this->table WHERE id = :id");
      $req->execute(["id" => $id]);
      return new stdClass();
    }

    public function get(array $data) {

        if (!isset($data["role"]) || $data["role"] !== "admin") {
            $req = $this->db->prepare("SELECT * FROM $this->table WHERE title LIKE :title");
            $req->execute(["title" => "%{$data['search']}%"]);
        } else {
            $req = $this->db->prepare("SELECT * FROM $this->table WHERE title LIKE :title AND (privacy != :privacy or user_id = :user_id)");
            $req->execute(["title" => "%{$data['search']}%", "privacy" => 1, "user_id" => $data['user_id']]);
        }
        
        return $req->rowCount() > 0 ? $req->fetchAll(PDO::FETCH_ASSOC) : new stdClass();
    }

    public function getMyalbum(array $data) {
        if (!isset($data['user_id'])) {
            $user_id = 0;
        } else {
            $user_id = $data['user_id'];
        }
        $req = $this->db->prepare("SELECT * FROM $this->table WHERE user_id = :user_id");
        $req->execute(["user_id" => $user_id]);
        return $req->rowCount() > 0 ? $req->fetchAll(PDO::FETCH_ASSOC) : new stdClass();
    }



    public function getById(int $id, ?array $data = null) {
        if (!isset($data['user_id'])) {
          $user_id = 0;
        } else {
          $user_id = $data['user_id'];
        }
        if (!empty($data['role']) && $data['role'] === 'admin') {
            $req = $this->db->prepare("SELECT * FROM $this->table WHERE id = :id");
            $req->execute(["id" => $id]);
        } else {
            $req = $this->db->prepare("SELECT * FROM $this->table WHERE id = :id AND (privacy != :privacy or user_id = :user_id)");
            $req->execute(["id" => $id, "privacy" => 1, "user_id" => $user_id]);

        }
            
      return $req->rowCount() > 0 ? $req->fetch(PDO::FETCH_ASSOC) : new stdClass();
    }

    public function getAll(?int $limit = null, ?array $data = null) {
        if (!isset($data['user_id'])) {
            $user_id = 0;
        } else {
            $user_id = $data['user_id'];
        }
        if (!empty($data['role']) && $data['role'] === 'admin') {
          $query = "SELECT * FROM {$this->table}";
          if ($limit !== null) {
            $query .= " LIMIT :limit";
            $params = [':limit' => (int)$limit];
            } else {
                $params = [];
            }
            $req = $this->db->prepare($query);
            foreach ($params as $key => $value) {
                $req->bindValue($key, $value, PDO::PARAM_INT);
            }
            $req->execute();
        } else {
          $query = "SELECT * FROM {$this->table} WHERE (privacy != :privacy AND user_id != :user_id)";
          if ($limit !== null) {
            $query .= " LIMIT :limit";
            $params = [':limit' => (int)$limit];
            } else {
                $params = [];
            }
          $req = $this->db->prepare($query);
          foreach ($params as $key => $value) {
            $req->bindValue($key, $value, PDO::PARAM_INT);
          }
          $req->execute(['privacy' => 1, 'user_id' => $user_id]);
        }
      
      return $req->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLast() {
      $req = $this->db->prepare("SELECT * FROM $this->table ORDER BY id DESC LIMIT 1");
      $req->execute();

      return $req->rowCount() > 0 ? $req->fetch(PDO::FETCH_ASSOC) : new stdClass();
    }

    public function update(array $data, int $id) {
      $request = "UPDATE $this->table SET ";
      $params = [];
      $fields = [];
      
      foreach ($data as $key => $value) {
          if (in_array($key, $this->authorized_fields_to_update)) {
          $fields[] = "$key = :$key";
          $params[":$key"] = $value;
          }
      }
      
      if (empty($fields)) {
          throw new \Exception("No valid fields to update");
      }
      
      $params[':id'] = $id;
      $query = $request . implode(", ", $fields) . " WHERE id = :id";
      
      $req = $this->db->prepare($query);
      $req->execute($params);
      
      return $this->getById($id);
  }
}