<?php

namespace App\Http\Controllers;

use App\Http\Service\LogoutService;
use Illuminate\Http\Request;

class LogoutController
{
    public function __construct(private LogoutService $logoutService){}

    public function logout(Request $request)
    {
        try {
            $result = $this->logoutService->logout($request);

            if($result == false){
                    return response()->json([
                    'error' => true,
                    'message' => 'voce ja estar deslogado',
                ], 422);
            }

            return response()->json([
                'error' => false,
                'message' => 'logout realizado com sucesso',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'erro inesperado ' . $e->getMessage(),
            ], 500);
        }
    }
}