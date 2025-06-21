<?php

namespace App\Models;

use App\Models\SqlConnect;
use App\Utils\{HttpException, JWT};
use \PDO;

class AuthModel extends SqlConnect {
  private string $table  = "users";
  private int $tokenValidity = 86400;
  private string $passwordSalt = "sqidq7sà";
  
  public function register(array $data) {
    $query = "SELECT email FROM $this->table WHERE email = :email";
    $req = $this->db->prepare($query);
    $req->execute(["email" => $data["email"]]);
    
    if ($req->rowCount() > 0) {
      throw new HttpException("User already exists!", 400);
    }

    // Combine password with salt and hash it
    $saltedPassword = $data["password"] . $this->passwordSalt;
    $hashedPassword = password_hash($saltedPassword, PASSWORD_BCRYPT);

    $hashedsecret = password_hash($data["secret"] . $this->passwordSalt, PASSWORD_BCRYPT);

    // Create the user
    $query_add = "INSERT INTO $this->table (email, password, secret) VALUES (:email, :password, :secret)";
    $req2 = $this->db->prepare($query_add);
    $req2->execute([
      "email" => $data["email"],
      "password" => $hashedPassword,
      "secret" => $hashedsecret
    ]);

    $userId = $this->db->lastInsertId();


    // Generate the JWT token
    $token = $this->generateJWT($userId);

    return ['token' => $token];
  }

  public function login($email, $password) {
    $query = "SELECT * FROM $this->table WHERE email = :email";
    $req = $this->db->prepare($query);
    $req->execute(['email' => $email]);

    $user = $req->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Combine input password with salt and verify
        $saltedPassword = $password . $this->passwordSalt;
        
        if (password_verify($saltedPassword, $user['password'])) {
            $token = $this->generateJWT($user['id'], $user['role'], $user['username']);
            return ['token' => $token];
        }
    }

    throw new \Exception("Invalid credentials.");
  }

  public function isTokenValid(string $token): bool {
    try {
      return jwt::verify($token);
    } catch (\Exception $e) {
      return false;
    }
  }

  public function resetPassword(string $email, string $secret){
    $query = "SELECT * FROM $this->table WHERE email = :email";
    $req = $this->db->prepare($query);
    $req->execute(['email' => $email]);
    $user = $req->fetch(PDO::FETCH_ASSOC);
    

    if($user) {
      $saltedsecret = $secret . $this->passwordSalt;
        $debugInfo = [
            'secret_sent' => $saltedsecret,
            'secret_length' => strlen($secret),
            'secret_in_db' => ($user['secret']),
            'verify_result' => password_verify($secret, $user['secret'])
        ];
        
        if (!password_verify($saltedsecret, $user['secret'])) {
            throw new HttpException("Invalid secret." . json_encode($debugInfo), 400);
        }
        $resetToken = bin2hex(random_bytes(16));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $query = "UPDATE users SET reset_token = :token, reset_token_expires = :reset_token_expires WHERE email = :email";
        $req = $this->db->prepare($query);
        $req->execute([
            'token' => $resetToken,
            'reset_token_expires' => $expires,
            'email' => $email
        ]);
        if ($req->rowCount() === 0) {
            throw new HttpException("Failed to set reset token.", 500);
        }
        return [
            'message' => 'token sent',
            'reset_token' => $resetToken,
            'expires' => $expires
        ];
    }


    throw new HttpException("User not found.", 404);
    

}

  public function renitialisePassword(string $token, string $newPassword) {

    $saltedPassword = $newPassword . $this->passwordSalt;
    $hashedPassword = password_hash($saltedPassword, PASSWORD_BCRYPT);

    $query = "UPDATE $this->table SET password = :password WHERE reset_token = :token AND reset_token_expires > NOW()";
    $req = $this->db->prepare($query);
    $req->execute([
      'token' => $token,
      'password' => $hashedPassword,
    ]);
    if ($req->rowCount() === 0) {
      throw new HttpException("Invalid or expired token.", 400);
    }

    $query = "UPDATE $this->table SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token = :token";
    $req = $this->db->prepare($query);
    $req->execute(['token' => $token]);
    if ($req->rowCount() === 0) {
      throw new HttpException("Failed to clear reset token.", 500);
    }

    return ['message' => 'Password has been reset successfully.'];
  }

  private function generateJWT(string $userId, string $role = 'user', string $username = ''): string {
    $payload = [
      'user_id' => $userId,
      'role' => $role,
      'username' => $username,
      'exp' => time() + $this->tokenValidity
    ];
    return JWT::generate($payload);
  }
}