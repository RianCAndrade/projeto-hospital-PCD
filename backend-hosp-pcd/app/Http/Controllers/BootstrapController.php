<?php

namespace App\Http\Controllers;

use App\Http\Service\BootstrapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BootstrapController
{
    public function __construct(private BootstrapService $bootstrapService) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->bootstrapService->load($request->user()->id);

        return response()->json([
            'error' => false,
            'message' => 'Bootstrap carregado com sucesso.',
            'data' => $data,
        ], 200);
    }
}
