<?php

namespace App\Http\Controllers;

use App\Http\Service\AgendamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendamentoController
{
    public function __construct(private AgendamentoService $agendamentoService) {}

    public function index(Request $request): JsonResponse
    {
        $filtros = $request->only([
            'paciente_id',
            'medico_id',
            'especialidade_id',
            'status',
            'data_de',
            'data_ate',
        ]);

        $agendamentos = $this->agendamentoService->index($filtros);

        return response()->json([
            'error' => false,
            'message' => 'Lista de agendamentos carregada.',
            'data' => $agendamentos,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'paciente_id' => 'required|exists:tbpacientes,id',
            'medico_id' => 'required|exists:tbmedicos,id',
            'especialidade_id' => 'required|exists:tbespecialidades,id',
            'recepcionista_id' => 'nullable|exists:tbusuarios,id',
            'data_agendamento' => 'required|date|after_or_equal:today',
            'horario' => 'required|date_format:H:i',
            'observacoes' => 'nullable|string|max:500',
        ]);

        $agendamento = $this->agendamentoService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Agendamento criado com sucesso.',
            'data' => $agendamento,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $agendamento = $this->agendamentoService->show($id);

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Agendamento encontrado.',
            'data' => $agendamento,
        ], 200);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $agendamento = $this->agendamentoService->show($id);

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        $dados = $request->validate([
            'paciente_id' => 'sometimes|required|exists:tbpacientes,id',
            'medico_id' => 'sometimes|required|exists:tbmedicos,id',
            'especialidade_id' => 'sometimes|required|exists:tbespecialidades,id',
            'recepcionista_id' => 'nullable|exists:tbusuarios,id',
            'data_agendamento' => 'sometimes|required|date',
            'horario' => 'sometimes|required|date_format:H:i',
            'status' => 'sometimes|required|in:agendado,confirmado,em_atendimento,cancelado,finalizado,faltou',
            'observacoes' => 'nullable|string|max:500',
        ]);

        $agendamento = $this->agendamentoService->update($id, $dados);

        return response()->json([
            'error' => false,
            'message' => 'Agendamento atualizado com sucesso.',
            'data' => $agendamento,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->agendamentoService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Agendamento removido com sucesso.',
            'data' => null,
        ], 200);
    }

    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'status' => 'required|string|in:agendado,confirmado,em_atendimento,cancelado,finalizado,faltou,remarcado',
        ]);

        $agendamento = $this->agendamentoService->updateStatus($id, $dados['status']);

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Status do agendamento atualizado.',
            'data' => $agendamento,
        ], 200);
    }

    public function cancel(int $id): JsonResponse
    {
        $agendamento = $this->agendamentoService->cancel($id);

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Agendamento cancelado com sucesso.',
            'data' => $agendamento,
        ], 200);
    }

    public function reschedule(int $id, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'data_agendamento' => 'required|date',
            'horario' => 'required|date_format:H:i',
            'medico_id' => 'sometimes|required|exists:tbmedicos,id',
            'especialidade_id' => 'sometimes|required|exists:tbespecialidades,id',
        ]);

        $agendamento = $this->agendamentoService->reschedule($id, $dados);

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Agendamento remarcado com sucesso.',
            'data' => $agendamento,
        ], 200);
    }
}
