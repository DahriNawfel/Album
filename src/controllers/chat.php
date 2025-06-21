<?php

namespace App\Controllers;
use App\Controllers\Controller;
use App\middlewares\AuthMiddleware;
use App\Models\ChatModel;
use App\Utils\{Route, HttpException};
use Exception;

class chat extends Controller {
    protected object $authMiddleware;
    protected array $header;
    protected object $chatModel;

    public function __construct($param) {
        $this->authMiddleware = new AuthMiddleware();
        $this->header = getallheaders();
        $this->chatModel = new ChatModel();

        parent::__construct($param);
    }


    #[Route("POST", "/chat/image", [AuthMiddleware::class])]
    public function chatWithImage() {
        try {
            $data = $this->body;
            
            if (empty($data['message']) || empty($data['image'])) {
                throw new HttpException("Missing message or image.", 400);
            }

            $response = $this->chatModel->sendImageMessage($data['message'], $data['image']);
            
            return [
                'status' => 'success',
                'data' => $response
            ];
            
        } catch (Exception $e) {
            throw new HttpException("Image chat error: " . $e->getMessage(), 500);
        }
    }
}
?>