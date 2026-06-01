<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Aqui é configurado o CORS para permitir que o frontend Next.js
    | (rodando em http://localhost:3000) consuma a API Laravel
    | (rodando em http://localhost:8000/api).
    |
    | Como autenticamos via Bearer token (Sanctum em modo token), NÃO
    | precisamos de `supports_credentials => true`. Para evoluir para
    | Sanctum em modo cookie/SPA, troque também o frontend para enviar
    | `credentials: "include"`.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
