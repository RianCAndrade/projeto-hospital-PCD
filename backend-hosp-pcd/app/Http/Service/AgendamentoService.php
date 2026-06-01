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
}
