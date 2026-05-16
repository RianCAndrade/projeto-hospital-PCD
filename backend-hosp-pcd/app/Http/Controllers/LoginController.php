<?php

namespace App\Http\Controllers;

use App\Http\Service\LoginService;
use Illuminate\Http\Request;

class LoginController
{
    public function __construct(
        private LoginService $loginService
    ){}

    public function login(Request $request)
    {
        try {
            $validated =  $request->validate([
                'email' => 'required|string|email|max:255',
                'senha' => 'required|string',
            ]);

            $result = $this->loginService->login($validated);

            if (!$result || $result == false){
                return response()->json([
                    'error' => true,
                    'message' => 'senha ou email incorretos'
                ], 422);
            }

            return response()->json([
                'error' => false,
                'message' => 'Login efetuado com sucesso',
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'erro inesperado ' . $e->getMessage()
            ], 500);
        }
    }
}