<?php

namespace App\Http\Controllers;

use App\Enums\TiposUsuario;
use App\Http\Service\AdminService;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'cpf' => 'required|string|max:255|unique:tbusuarios,cpf',
                'email' => 'required|string|email|max:255|unique:tbusuarios,email',
                'senha' => 'required|string|min:6',
                'telefone' => 'nullable|string|max:255',
                'tipo_usuario' => 'required|in:'.implode(',', [
                    TiposUsuario::RH->value,
                    TiposUsuario::Admin->value,
                    TiposUsuario::Recepcionista->value,
                ]),
            ]);

            $validated['senha'] = Hash::make($validated['senha']);

            $usuario = Usuario::create($validated);

            return response()->json([
                'error' => false,
                'message' => 'Usuário cadastrado com sucesso.',
                'data' => $usuario,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
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
