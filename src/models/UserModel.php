<?php

namespace App\Models;

use \PDO;
use stdClass;

class UserModel extends SqlConnect {
    private $table = "users";
    public $authorized_fields_to_update = ['username', 'password', 'pfp', 'bio'];
    private string $passwordSalt = "sqidq7sà";

    public function getById(int $id): array {
        $req = $this->db->prepare("SELECT id, username, role, pfp, bio FROM $this->table WHERE id = :id");
        $req->execute(['id' => $id]);
        return $req->rowCount() > 0 ? $req->fetch(PDO::FETCH_ASSOC) : new stdClass();
    }

    public function update(int $id, array $data): array {
        $fields = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $this->authorized_fields_to_update)) {
                // Hash password if it's being updated
                if ($key === 'password') {
                    $value = $value . $this->passwordSalt;
                    $value = password_hash($value, PASSWORD_BCRYPT);
                }
                
                $fields[] = "$key = :$key";
                $params[$key] = $value;
            }
        }

        if (empty($fields)) {
            throw new \Exception("No valid fields to update.");
        }

        $query = "UPDATE $this->table SET " . implode(', ', $fields) . " WHERE id = :id";
        $req = $this->db->prepare($query);
        
        if (!$req->execute($params)) {
            throw new \Exception("Failed to update user profile.");
        }

        return $this->getById($id);
    }

    public function delete(int $id): bool {
        $req = $this->db->prepare("DELETE FROM $this->table WHERE id = :id");
        $req->execute(['id' => $id]);
        return $req->rowCount() > 0;
    }

    public function getAll(): array {
        $req = $this->db->prepare("SELECT id, username, role, pfp, bio FROM $this->table");
        $req->execute();
        return $req->fetchAll(PDO::FETCH_ASSOC);
    }

    // Méthode pour valider et traiter les images base64
    public function processBase64Image(string $base64Image): string {
        // Vérifier si c'est une image base64 valide
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64Image, $matches)) {
            throw new \Exception("Invalid base64 image format.");
        }

        $imageType = $matches[1];
        $allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
        
        if (!in_array(strtolower($imageType), $allowedTypes)) {
            throw new \Exception("Unsupported image type: $imageType");
        }

        // Extraire la taille de l'image base64
        $base64Data = substr($base64Image, strpos($base64Image, ',') + 1);
        $decodedSize = strlen(base64_decode($base64Data));
        
        // Limiter la taille à 2MB après compression
        if ($decodedSize > 2 * 1024 * 1024) {
            throw new \Exception("Image size too large. Please compress the image further.");
        }

        return $base64Image;
    }
}