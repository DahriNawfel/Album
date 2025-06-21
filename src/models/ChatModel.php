<?php
namespace App\Models;

use Exception;

class ChatModel {
    private $apiKey;
    private $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct() {
        $this->apiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
        
        if (empty($this->apiKey)) {
            throw new Exception("OpenAI API key not found in environment variables");
        }
    }

    public function sendImageMessage(string $message, string $base64Image): array {
        if (!$this->isValidBase64Image($base64Image)) {
            throw new Exception("Invalid base64 image format");
        }

        $payload = [
            'model' => 'gpt-4o',
            'messages' => [
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
                                'url' => $base64Image
                            ]
                        ]
                    ]
                ]
            ],
            'max_tokens' => 1000
        ];

        return $this->makeOpenAIRequest($payload);
    }

    private function makeOpenAIRequest(array $payload): array {
        $postData = json_encode($payload);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Authorization: Bearer ' . $this->apiKey,
                    'Content-Type: application/json',
                    'Content-Length: ' . strlen($postData)
                ],
                'content' => $postData,
                'timeout' => 30,
                'ignore_errors' => true // Don't fail on HTTP error codes
            ]
        ]);

        $response = file_get_contents($this->apiUrl, false, $context);
        
        if ($response === false) {
            throw new Exception("Failed to get response from OpenAI API");
        }

        // Get HTTP response code
        $httpCode = 200; // Default
        if (isset($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('/^HTTP\/\d\.\d (\d{3})/', $header, $matches)) {
                    $httpCode = (int)$matches[1];
                    break;
                }
            }
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