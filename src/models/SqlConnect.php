<?php

namespace App\Models;

use \PDO;
use \Exception;

class SqlConnect {
  public object $db;

  public function __construct() {
    // Vérifier si l'extension PDO PostgreSQL est disponible
    if (!extension_loaded('pdo_pgsql')) {
      throw new Exception('L\'extension PDO PostgreSQL n\'est pas disponible. Vérifiez votre configuration Vercel.');
    }

    $databaseUrl = getenv('DATABASE_URL');
    
    if (!$databaseUrl) {
      throw new Exception('La variable d\'environnement DATABASE_URL n\'est pas définie.');
    }

    try {
      $this->db = new PDO($databaseUrl);
      $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $this->db->setAttribute(PDO::ATTR_PERSISTENT, false);
      
      // Test de connexion
      $this->db->query('SELECT 1');
      
    } catch (Exception $e) {
      throw new Exception('Erreur de connexion à la base de données: ' . $e->getMessage());
    }
  }

  public function transformDataInDot($data) {
    $dataFormated = [];

    foreach ($data as $key => $value) {
      $dataFormated[':' . $key] = $value;
    }

    return $dataFormated;
  }
  
  // Méthode pour vérifier les extensions disponibles (utile pour le debug)
  public static function checkExtensions() {
    $extensions = [
      'pdo' => extension_loaded('pdo'),
      'pdo_pgsql' => extension_loaded('pdo_pgsql'),
      'pgsql' => extension_loaded('pgsql')
    ];
    
    return $extensions;
  }
}