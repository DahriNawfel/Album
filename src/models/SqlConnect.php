<?php

namespace App\Models;

use \PDO;
use \Exception;

class SqlConnect {
  public object $db;

  public function __construct() {
    $databaseUrl = getenv('DATABASE_URL');
    
    if (!$databaseUrl) {
      throw new Exception('La variable d\'environnement DATABASE_URL n\'est pas définie.');
    }

    try {
      // Essayer de créer la connexion PDO directement
      $this->db = new PDO($databaseUrl);
      $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $this->db->setAttribute(PDO::ATTR_PERSISTENT, false);
      
      // Test de connexion
      $this->db->query('SELECT 1');
      
    } catch (Exception $e) {
      // Si PDO ne fonctionne pas, afficher plus d'informations
      $availableDrivers = PDO::getAvailableDrivers();
      $extensions = [
        'pdo' => extension_loaded('pdo'),
        'pdo_pgsql' => extension_loaded('pdo_pgsql'),
        'pgsql' => extension_loaded('pgsql')
      ];
      
      $errorMsg = 'Erreur de connexion à la base de données: ' . $e->getMessage();
      $errorMsg .= ' | Drivers PDO disponibles: ' . implode(', ', $availableDrivers);
      $errorMsg .= ' | Extensions: ' . json_encode($extensions);
      
      throw new Exception($errorMsg);
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