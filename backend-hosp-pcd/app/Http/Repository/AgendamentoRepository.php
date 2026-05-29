<?php

namespace App\Http\Repository;

use App\Models\Agendamento;

class AgendamentoRepository
{
    public function __construct(private Agendamento $agendamento) {}

    public function index(): mixed
    {
        return $this->agendamento
            ->with(['paciente', 'medico', 'especialidade', 'recepcionista'])
            ->orderBy('data_agendamento')
            ->orderBy('horario')
            ->get();
    }

    public function store(array $dados): Agendamento
    {
        return $this->agendamento->create($dados);
    }

    public function show(int $id): ?Agendamento
    {
        return $this->agendamento
            ->with(['paciente', 'medico', 'especialidade', 'recepcionista'])
            ->find($id);
    }

    public function update(int $id, array $dados): ?Agendamento
    {
        $agendamento = $this->agendamento->find($id);

        if (! $agendamento) {
            return null;
        }

        $agendamento->update($dados);

        return $agendamento;
    }

    public function destroy(int $id): bool
    {
        $agendamento = $this->agendamento->find($id);

        if (! $agendamento) {
            return false;
        }

        return $agendamento->delete();
    }
}
