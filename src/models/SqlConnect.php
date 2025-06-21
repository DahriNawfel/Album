<?php

namespace App\Models;

use \PDO;

class SqlConnect {
  public object $db;

  public function __construct() {
    $databaseUrl = getenv('DATABASE_URL');

    $this->db = new PDO($databaseUrl);

    $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $this->db->setAttribute(PDO::ATTR_PERSISTENT, false);
  }

  public function transformDataInDot($data) {
    $dataFormated = [];

    foreach ($data as $key => $value) {
      $dataFormated[':' . $key] = $value;
    }

    return $dataFormated;
  }
}