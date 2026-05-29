<?php

namespace App\Http\Controllers;

use App\Http\Service\MedicoService;
use Illuminate\Http\Request;

class MedicoController
{
    public function __construct(
        private MedicoService $medicoService
    ) {}

    public function index()
    {
        $result = $this->medicoService->index();

        if (! $result) {
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

    public function show(int $id)
    {
        $result = $this->medicoService->show($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'medico nao encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'medico encontrado',
            'data' => $result,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'senha' => 'required|string|max:255',
            'telefone' => 'required|string|max:255',
            // 'usuario_id' => 'required|integer',
            'crm' => 'required|string|max:255',
            'descricao' => 'required|string|max:255',
        ]);

        $result = $this->medicoService->store($validated);

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

    public function update(int $id, Request $request)
    {
        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'cpf' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255',
            'senha' => 'sometimes|required|string|max:255',
            'telefone' => 'sometimes|required|string|max:255',
            // 'usuario_id' => 'required|integer',
            'crm' => 'sometimes|required|string|max:255',
            'descricao' => 'sometimes|required|string|max:255',
        ]);

        $result = $this->medicoService->update($id, $validated);

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

    public function destroy(int $id)
    {
        $result = $this->medicoService->destroy($id);

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
            'data' => $result,
        ], 200);
    }
}
