<?php

namespace App\Http\Controllers;

use App\Http\Service\MeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController
{
    public function __construct(private MeService $meService) {}

    public function show(Request $request): JsonResponse
    {
        $usuario = $this->meService->show($request->user()->id);

        if (! $usuario) {
            return response()->json([
                'error' => true,
                'message' => 'Usuário nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Usuário encontrado.',
            'data' => $usuario,
        ], 200);
    }
}
