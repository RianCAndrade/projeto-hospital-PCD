<?php

namespace App\Http\Service;

use App\Enums\StatusAgendamento;
use App\Http\Repository\AgendamentoRepository;
use App\Models\Agendamento;

class AgendamentoService
{
    public function __construct(private AgendamentoRepository $agendamentoRepository) {}

    public function index(array $filtros = []): mixed
    {
        return $this->agendamentoRepository->index($filtros);
    }

    public function store(array $dados): Agendamento
    {
        $dados['status'] ??= StatusAgendamento::Agendado->value;

        return $this->agendamentoRepository->store($dados);
    }

    public function show(int $id): ?Agendamento
    {
        return $this->agendamentoRepository->show($id);
    }

    public function update(int $id, array $dados): ?Agendamento
    {
        return $this->agendamentoRepository->update($id, $dados);
    }

    public function destroy(int $id): bool
    {
        return $this->agendamentoRepository->destroy($id);
    }

    public function updateStatus(int $id, string $status): ?Agendamento
    {
        return $this->agendamentoRepository->update($id, ['status' => $status]);
    }

    public function cancel(int $id): ?Agendamento
    {
        return $this->agendamentoRepository->update($id, ['status' => StatusAgendamento::Cancelado->value]);
    }

    public function reschedule(int $id, array $dados): ?Agendamento
    {
        $dados['status'] ??= StatusAgendamento::Remarcado->value;

        return $this->agendamentoRepository->update($id, $dados);
    }

    /**
     * Marca um agendamento como "chamado" (status intermediário entre
     * `confirmado` e `em_atendimento`). Reverte automaticamente qualquer
     * outro agendamento `chamado` do mesmo médico de volta para
     * `confirmado`, evitando dois pacientes chamados ao mesmo tempo.
     *
     * @throws \InvalidArgumentException se o agendamento não estiver
     *                                   com status `confirmado`.
     */
    public function chamar(int $id): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($agendamento->status !== StatusAgendamento::Confirmado->value) {
            throw new \InvalidArgumentException(
                'Somente agendamentos confirmados podem ser chamados.',
            );
        }

        $this->agendamentoRepository->reverterChamadoDoMedico(
            $agendamento->medico_id,
            $agendamento->id,
        );

        return $this->agendamentoRepository->update($id, [
            'status' => StatusAgendamento::Chamado->value,
        ]);
    }

    /**
     * Move o agendamento de `chamado` para `em_atendimento`. Falha se o
     * status atual for diferente — garante que o médico não pule a etapa
     * de "chamar" e a recepção/paciente sejam avisados de que ele chegou.
     *
     * @throws \InvalidArgumentException se o status atual não for `chamado`.
     */
    public function iniciarAtendimento(int $id): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($agendamento->status !== StatusAgendamento::Chamado->value) {
            throw new \InvalidArgumentException(
                'Somente agendamentos chamados podem ser iniciados.',
            );
        }

        return $this->agendamentoRepository->update($id, [
            'status' => StatusAgendamento::EmAtendimento->value,
        ]);
    }
}
