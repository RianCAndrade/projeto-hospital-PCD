<?php

namespace App\Http\Controllers;

use App\Http\Service\UsuarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsuarioController
{
    public function __construct(private UsuarioService $usuarioService) {}

    public function index(Request $request): JsonResponse
    {
        $filtros = $request->only(['tipo_usuario', 'q']);
        $usuarios = $this->usuarioService->index($filtros);

        return response()->json([
            'error' => false,
            'message' => 'Lista de usuários carregada.',
            'data' => $usuarios,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $usuario = $this->usuarioService->show($id);

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

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->usuarioService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Usuário nao encontrado.',
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
