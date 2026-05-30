<?php

namespace App\Http\Controllers;

use App\Http\Service\AdminService;
use Illuminate\Http\JsonResponse;

class AdminController
{
    public function __construct(
        private AdminService $adminService
    ) {}

    public function index(): JsonResponse
    {
        $usuarios = $this->adminService->index();

        return response()->json([
            'error' => false,
            'message' => 'Lista de usuários carregada.',
            'data' => $usuarios,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $usuario = $this->adminService->show($id);

        if (! $usuario) {
            return response()->json([
                'error' => true,
                'message' => 'Usuário não encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Usuário encontrado.',
            'data' => $usuario,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->adminService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Usuário não encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Usuário removido com sucesso.',
            'data' => null,
        ], 200);
    }
}
