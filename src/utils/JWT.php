<?php

namespace App\Utils;

class JWT {
  private static $secret = "skibidi";

  public static function generate($payload) {
    $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = self::base64UrlEncode(json_encode($payload));
    $concat_signature = "$header.$payload";
    $signature = hash_hmac("sha256", $concat_signature, self::$secret, true);
    $signature = self::base64UrlEncode($signature);
    return "$header.$payload.$signature";
  }

  public static function verify($jwt) {
    $segments = explode('.', $jwt);
    if (count($segments) !== 3) {
      return false;
    }
    list($header, $payload, $signature) = $segments;
    $expectedSignature = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
    return hash_equals($expectedSignature, $signature);
  }

  public static function decode($jwt) {
    try {
      $segments = explode('.', $jwt);
      if (count($segments) !== 3) {
        throw new \Exception();
      }
      list($header, $payload, $signature) = $segments;
      $expectedSignature = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
      if (!hash_equals($expectedSignature, $signature)) {
        throw new \Exception();
      }
      $decodedPayload = json_decode(self::base64UrlDecode($payload), true);
      if (!$decodedPayload) {
        throw new \Exception();
      }
      if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        throw new \Exception();
      }
      return $decodedPayload;
    } catch (\Exception $e) {
      throw new \Exception();
    }
  }

  public static function getPayloadWithoutVerification(string $token): ?array {
    try {
      $parts = explode('.', $token);
      if (count($parts) !== 3) {
        return null;
      }
      $payloadEncoded = $parts[1];
      $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
      return $payload ?: null;
    } catch (\Exception $e) {
      return null;
    }
  }

  public static function isExpired(string $token): bool {
    try {
      $payload = self::getPayloadWithoutVerification($token);
      if (!$payload || !isset($payload['exp'])) {
        return false;
      }
      return $payload['exp'] < time();
    } catch (\Exception $e) {
      return true;
    }
  }

  public static function getTimeToExpiration(string $token): ?int {
    try {
      $payload = self::getPayloadWithoutVerification($token);
      if (!$payload || !isset($payload['exp'])) {
        return null;
      }
      $timeLeft = $payload['exp'] - time();
      return $timeLeft > 0 ? $timeLeft : 0;
    } catch (\Exception $e) {
      return null;
    }
  }

  public static function refresh(string $token, int $newExpirationTime = 3600): ?string {
    try {
      $payload = self::decode($token);
      if (!$payload) {
        return null;
      }
      $payload['exp'] = time() + $newExpirationTime;
      return self::generate($payload);
    } catch (\Exception $e) {
      return null;
    }
  }

  private static function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  private static function base64UrlDecode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
  }
}