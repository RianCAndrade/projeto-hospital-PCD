<?php

namespace App\Http\Controllers;

use App\Http\Service\RecepcionistaService;
use Illuminate\Http\Request;

class RecepcionistaController
{
    public function __construct(
        private RecepcionistaService $recepcionistaService
    ) {}

    public function index()
    {
        $result = $this->recepcionistaService->index();

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Recepcionista não encontrado',
                'data' => null,
            ], 200);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista encontrado',
            'data' => $result,
        ], 200);
    }

    public function show(int $id)
    {
        $result = $this->recepcionistaService->show($id);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Recepcionista não encontrado',
                'data' => null,
            ], 200);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista encontrado',
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
        ]);

        $result = $this->recepcionistaService->store($validated);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Erro ao cadastrar o recepcionista',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista cadastrado com sucesso',
            'data' => $result,
        ], 201);
    }

    public function update(int $id, Request $request)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'cpf' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255',
            'senha' => 'sometimes|string|max:255',
            'telefone' => 'sometimes|nullable|string|max:255',
        ]);

        $result = $this->recepcionistaService->update($id, $dados);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Erro ao atualizar o recepcionista',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista atualizado com sucesso',
            'data' => $result,
        ], 200);
    }

    public function destroy(int $id)
    {
        $result = $this->recepcionistaService->destroy($id);

        if ($result === false) {
            return response()->json([
                'error' => true,
                'message' => 'erro ao deletar o recepcionista',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Recepcionista excluído com sucesso',
            'data' => $result,
        ], 200);
    }
}
