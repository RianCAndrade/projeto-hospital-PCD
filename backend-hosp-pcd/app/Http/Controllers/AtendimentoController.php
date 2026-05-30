<?php

namespace App\Http\Controllers;

use App\Http\Service\AtendimentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AtendimentoController
{
    public function __construct(private AtendimentoService $atendimentoService) {}

    public function index(): JsonResponse
    {
        $atendimentos = $this->atendimentoService->index();

        return response()->json([
            'error' => false,
            'message' => 'Lista de atendimentos carregada.',
            'data' => $atendimentos,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'agendamento_id' => 'required|exists:tbagendamentos,id|unique:tbatendimentos,agendamento_id',
            'medico_id' => 'required|exists:tbmedicos,id',
            'registrado_por_id' => 'nullable|exists:tbusuarios,id',
            'descricao' => 'nullable|string|max:2000',
            'encaminhamento' => 'nullable|string|max:1000',
            'receita' => 'nullable|string|max:1000',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $atendimento = $this->atendimentoService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Atendimento registrado com sucesso.',
            'data' => $atendimento,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $atendimento = $this->atendimentoService->show($id);

        if (! $atendimento) {
            return response()->json([
                'error' => true,
                'message' => 'Atendimento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Atendimento encontrado.',
            'data' => $atendimento,
        ], 200);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $atendimento = $this->atendimentoService->show($id);

        if (! $atendimento) {
            return response()->json([
                'error' => true,
                'message' => 'Atendimento nao encontrado.',
                'data' => null,
            ], 404);
        }

        $dados = $request->validate([
            'medico_id' => 'sometimes|required|exists:tbmedicos,id',
            'registrado_por_id' => 'nullable|exists:tbusuarios,id',
            'status' => 'sometimes|required|in:nao_atendido,em_atendimento,atendido,nao_compareceu,cancelado',
            'descricao' => 'nullable|string|max:2000',
            'encaminhamento' => 'nullable|string|max:1000',
            'receita' => 'nullable|string|max:1000',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $atendimento = $this->atendimentoService->update($id, $dados);

        return response()->json([
            'error' => false,
            'message' => 'Atendimento atualizado com sucesso.',
            'data' => $atendimento,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->atendimentoService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Atendimento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Atendimento removido com sucesso.',
            'data' => null,
        ], 200);
    }
}
