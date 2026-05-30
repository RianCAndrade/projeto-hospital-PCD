<?php

namespace App\Http\Controllers;

use App\Http\Service\TipoDeficienciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TipoDeficienciaController
{
    public function __construct(private TipoDeficienciaService $tipoDeficienciaService) {}

    public function index(): JsonResponse
    {
        $result = $this->tipoDeficienciaService->index();

        return response()->json([
            'error' => false,
            'message' => 'Lista de tipos de deficiencia carregada.',
            'data' => $result,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:255|unique:tbtipos_deficiencia',
        ]);

        $tipo = $this->tipoDeficienciaService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Tipo de deficiencia criado com sucesso.',
            'data' => $tipo,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tipo = $this->tipoDeficienciaService->show($id);

        if (! $tipo) {
            return response()->json([
                'error' => true,
                'message' => 'Tipo de deficiencia nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Tipo de deficiencia encontrado.',
            'data' => $tipo,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->tipoDeficienciaService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Tipo de deficiencia nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Tipo de deficiencia removido com sucesso.',
            'data' => null,
        ], 200);
    }
}
