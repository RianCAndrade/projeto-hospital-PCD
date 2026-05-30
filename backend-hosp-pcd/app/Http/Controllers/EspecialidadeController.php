<?php

namespace App\Http\Controllers;

use App\Http\Service\EspecialidadeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EspecialidadeController
{
    public function __construct(private EspecialidadeService $especialidadeService) {}

    public function index(): JsonResponse
    {
        $result = $this->especialidadeService->index();

        return response()->json([
            'error' => false,
            'message' => 'Lista de especialidades carregada.',
            'data' => $result,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:255|unique:tbespecialidades',
        ]);

        $especialidade = $this->especialidadeService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Especialidade criada com sucesso.',
            'data' => $especialidade,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $especialidade = $this->especialidadeService->show($id);

        if (! $especialidade) {
            return response()->json([
                'error' => true,
                'message' => 'Especialidade nao encontrada.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Especialidade encontrada.',
            'data' => $especialidade,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->especialidadeService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Especialidade nao encontrada.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Especialidade removida com sucesso.',
            'data' => null,
        ], 200);
    }
}
