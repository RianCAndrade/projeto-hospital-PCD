<?php

namespace App\Http\Repository;

use App\Models\Atendimento;

class AtendimentoRepository
{
    public function __construct(private Atendimento $atendimento) {}

    public function index(): mixed
    {
        return $this->atendimento
            ->with(['agendamento.paciente', 'medico', 'registradoPor'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(array $dados): Atendimento
    {
        return $this->atendimento->create($dados);
    }

    public function show(int $id): ?Atendimento
    {
        return $this->atendimento
            ->with(['agendamento.paciente', 'medico', 'registradoPor'])
            ->find($id);
    }

    public function update(int $id, array $dados): ?Atendimento
    {
        $atendimento = $this->atendimento->find($id);

        if (! $atendimento) {
            return null;
        }

        $atendimento->update($dados);

        return $atendimento;
    }

    public function destroy(int $id): bool
    {
        $atendimento = $this->atendimento->find($id);

        if (! $atendimento) {
            return false;
        }

        return $atendimento->delete();
    }
}
