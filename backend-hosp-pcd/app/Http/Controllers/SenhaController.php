<?php

namespace App\Http\Controllers;

use App\Http\Service\SenhaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SenhaController
{
    public function __construct(private SenhaService $senhaService) {}

    public function index(Request $request): JsonResponse
    {
        $senhas = $this->senhaService->index($request->user());

        return response()->json([
            'error' => false,
            'message' => 'Lista de senhas carregada.',
            'data' => $senhas,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'agendamento_id' => 'required|exists:tbagendamentos,id|unique:tbsenhas,agendamento_id',
            'paciente_id' => 'required|exists:tbpacientes,id',
            'codigo' => 'nullable|string|max:10',
        ]);

        $senha = $this->senhaService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Senha gerada com sucesso.',
            'data' => $senha,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $senha = $this->senhaService->show($id);

        if (! $senha) {
            return response()->json([
                'error' => true,
                'message' => 'Senha nao encontrada.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Senha encontrada.',
            'data' => $senha,
        ], 200);
    }

    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'status' => 'required|string|in:ativa,chamada,finalizada,cancelada',
        ]);

        $senha = $this->senhaService->updateStatus($id, $dados['status']);

        if (! $senha) {
            return response()->json([
                'error' => true,
                'message' => 'Senha nao encontrada.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Status da senha atualizado.',
            'data' => $senha,
        ], 200);
    }

    public function chamar(int $id): JsonResponse
    {
        $senha = $this->senhaService->chamar($id);

        if (! $senha) {
            return response()->json([
                'error' => true,
                'message' => 'Senha nao encontrada.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Senha chamada com sucesso.',
            'data' => $senha,
        ], 200);
    }
}
