<?php

namespace App\Models;

use Exception;


class ChatModel {
    private string $apiKey;
    private string $endpoint;

    public function __construct() {
        $this->apiKey = getenv('OPENAI_API_KEY');
        $this->endpoint = 'https://api.openai.com/v1/chat/completions';
        
        if (empty($this->apiKey)) {
            throw new Exception("OpenAI API key not configured");
        }
    }

    public function sendImageMessage(string $message, string $imageBase64): array {
        if (!$this->isValidBase64Image($imageBase64)) {
            throw new Exception("Invalid image format");
        }

        $payload = [
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Tu es un assistant qui analyse les images et répond aux questions à leur sujet de manière détaillée.'
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $message
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => $imageBase64,
                                'detail' => 'high'
                            ]
                        ]
                    ]
                ]
            ],
            'max_tokens' => 1000,
            'temperature' => 0.7
        ];

        return $this->makeOpenAIRequest($payload);
    }

    private function makeOpenAIRequest(array $payload): array {
        $ch = curl_init($this->endpoint);
        
        // Configuration de cURL
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_FOLLOWLOCATION => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("cURL Error: " . $error);
        }

        if ($response === false) {
            throw new Exception("Failed to get response from OpenAI API");
        }

        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response from OpenAI API");
        }

        if ($httpCode !== 200) {
            $errorMessage = "OpenAI API Error (HTTP $httpCode)";
            
            if (isset($decodedResponse['error']['message'])) {
                $errorMessage .= ": " . $decodedResponse['error']['message'];
            }
            
            switch ($httpCode) {
                case 401:
                    $errorMessage = "Invalid API key";
                    break;
                case 429:
                    $errorMessage = "Rate limit exceeded or quota exceeded";
                    break;
                case 400:
                    $errorMessage = "Bad request: " . ($decodedResponse['error']['message'] ?? 'Invalid request format');
                    break;
            }
            
            throw new Exception($errorMessage);
        }

        if (!isset($decodedResponse['choices'][0]['message']['content'])) {
            throw new Exception("Invalid response structure from OpenAI API");
        }

        return [
            'message' => $decodedResponse['choices'][0]['message']['content'],
            'model' => $decodedResponse['model'] ?? 'unknown',
            'usage' => $decodedResponse['usage'] ?? null
        ];
    }

    private function isValidBase64Image(string $base64): bool {
        if (!preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,/', $base64)) {
            return false;
        }

        $base64Data = preg_replace('/^data:image\/[^;]+;base64,/', '', $base64);
        
        if (!base64_decode($base64Data, true)) {
            return false;
        }

        return true;
    }
}
?>