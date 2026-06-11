<?php

namespace App\Http\Controllers;

use App\Http\Service\MedicoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicoController
{
    public function __construct(
        private MedicoService $medicoService
    ) {}

    public function index(): JsonResponse
    {
        $result = $this->medicoService->index();

        return response()->json([
            'error' => false,
            'message' => 'Medicos encontrados.',
            'data' => $result,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->medicoService->show($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Medico nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico encontrado.',
            'data' => $result,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Modo 1: vincular usuário existente.
            'usuario_id' => 'nullable|exists:tbusuarios,id',

            // Modo 2: criar usuário inline.
            'nome' => 'required_without:usuario_id|string|max:255',
            'cpf' => 'required_without:usuario_id|string|max:255|unique:tbusuarios,cpf',
            'email' => 'required_without:usuario_id|string|email|max:255|unique:tbusuarios,email',
            'senha' => 'required_without:usuario_id|string|max:255',
            'telefone' => 'nullable|string|max:255',

            // Dados do médico
            'crm' => 'required|string|max:255|unique:tbmedicos,crm',
            'descricao' => 'nullable|string|max:1000',
            'especialidade_ids' => 'nullable|array',
            'especialidade_ids.*' => 'integer|exists:tbespecialidades,id',
        ]);

        $result = $this->medicoService->store($validated);

        if(! $result){
            return response()->json([
                'error' => true,
                'message' => 'Erro ao cadastrar médico.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico cadastrado com sucesso.',
            'data' => $result,
        ], 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'cpf' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255',
            'senha' => 'sometimes|string|max:255',
            'telefone' => 'sometimes|nullable|string|max:255',
            'crm' => 'sometimes|string|max:255',
            'descricao' => 'sometimes|nullable|string|max:1000',
            'especialidade_ids' => 'sometimes|array',
            'especialidade_ids.*' => 'integer|exists:tbespecialidades,id',
        ]);

        $result = $this->medicoService->update($id, $validated);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Medico nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico atualizado com sucesso.',
            'data' => $result,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->medicoService->destroy($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Medico nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico excluido com sucesso.',
            'data' => null,
        ], 200);
    }
}
