<?php

namespace App\Http\Controllers;

use App\Http\Service\AgendamentoService;
use Illuminate\Auth\Access\AuthorizationException;
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

        $agendamentos = $this->agendamentoService->index($filtros, $request->user());

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

    public function show(int $id, Request $request): JsonResponse
    {
        $agendamento = $this->agendamentoService->show($id, $request->user());

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
            'status' => 'required|string|in:agendado,confirmado,chamado,em_atendimento,cancelado,finalizado,faltou,remarcado',
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

    public function cancel(int $id, Request $request): JsonResponse
    {
        try {
            $agendamento = $this->agendamentoService->cancel($id, $request->user());
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 403);
        }

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

        try {
            $agendamento = $this->agendamentoService->reschedule($id, $dados, $request->user());
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 403);
        }

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

    /**
     * PATCH /api/agendamentos/{id}/chamar
     *
     * Move o agendamento de `confirmado` para `chamado` (estado
     * intermediário que avisa que o médico chamou o paciente).
     * Reverte outros `chamado` do mesmo médico para `confirmado`.
     */
    public function chamar(int $id, Request $request): JsonResponse
    {
        try {
            $agendamento = $this->agendamentoService->chamar($id, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 422);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 403);
        }

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Paciente chamado com sucesso.',
            'data' => $agendamento,
        ], 200);
    }

    /**
     * PATCH /api/agendamentos/{id}/iniciar
     *
     * Move o agendamento de `chamado` para `em_atendimento`. Falha com
     * 422 se o médico pular a etapa de "chamar" o paciente.
     */
    public function iniciarAtendimento(int $id, Request $request): JsonResponse
    {
        try {
            $agendamento = $this->agendamentoService->iniciarAtendimento($id, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 422);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null,
            ], 403);
        }

        if (! $agendamento) {
            return response()->json([
                'error' => true,
                'message' => 'Agendamento nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Atendimento iniciado com sucesso.',
            'data' => $agendamento,
        ], 200);
    }
}
