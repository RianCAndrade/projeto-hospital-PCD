<?php

namespace App\Http\Controllers;

use App\Http\Service\RhService;
use Illuminate\Http\Request;

class RhController
{
    public function __construct(
        private RhService $rhService
    ) {}

    public function indexMedico()
    {
        $result = $this->rhService->indexMedico();

        if ($result === false) {
            return response()->json([
                'error' => true,
                'message' => 'Erro ao buscar os medicos',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medicos encontrados',
            'data' => $result,
        ], 200);
    }

    public function showMedico(int $id)
    {
        $result = $this->rhService->showMedico($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Medico não encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico encontrado',
            'data' => $result,
        ], 200);
    }

    public function storeMedico(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:255|unique:tbusuarios,cpf',
            'email' => 'required|string|email|max:255|unique:tbusuarios,email',
            'senha' => 'required|string|max:255',
            'telefone' => 'nullable|string|max:255',
            'crm' => 'required|string|max:255|unique:tbmedicos,crm',
            'descricao' => 'nullable|string|max:1000',
            'especialidade_ids' => 'nullable|array',
            'especialidade_ids.*' => 'integer|exists:tbespecialidades,id',
        ]);

        $result = $this->rhService->storeMedico($validated);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Erro ao cadastrar medico',
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico cadastrado com sucesso',
            'data' => $result,
        ], 201);
    }

    public function updateMedico(int $id, Request $request)
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

        $result = $this->rhService->updateMedico($id, $validated);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Medico não encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico atualizado com sucesso',
            'data' => $result,
        ], 200);
    }

    public function destroyMedico(int $id)
    {
        $result = $this->rhService->destroyMedico($id);

        if ($result === false) {
            return response()->json([
                'error' => true,
                'message' => 'Erro ao excluir o medico',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico excluído com sucesso',
            'data' => null,
        ], 200);
    }

    public function indexRecepcionista()
    {
        $result = $this->rhService->indexRecepcionista();

        return response()->json([
            'error' => false,
            'message' => 'Recepcionistas encontrados.',
            'data' => $result,
        ], 200);
    }

    public function showRecepcionista(int $id)
    {
        $result = $this->rhService->showRecepcionista($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Recepcionista nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista encontrado.',
            'data' => $result,
        ], 200);
    }

    public function storeRecepcionista(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:255|unique:tbusuarios,cpf',
            'email' => 'required|string|email|max:255|unique:tbusuarios,email',
            'senha' => 'required|string|max:255',
            'telefone' => 'nullable|string|max:255',
        ]);

        $result = $this->rhService->storeRecepcionista($validated);

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista cadastrado com sucesso.',
            'data' => $result,
        ], 201);
    }

    public function updateRecepcionista(int $id, Request $request)
    {
        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'cpf' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255',
            'senha' => 'sometimes|string|max:255',
            'telefone' => 'sometimes|nullable|string|max:255',
        ]);

        $result = $this->rhService->updateRecepcionista($id, $validated);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Recepcionista nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista atualizado com sucesso.',
            'data' => $result,
        ], 200);
    }

    public function destroyRecepcionista(int $id)
    {
        $result = $this->rhService->destroyRecepcionista($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Recepcionista nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista excluido com sucesso.',
            'data' => null,
        ], 200);
    }
}
