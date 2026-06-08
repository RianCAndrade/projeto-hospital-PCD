<?php

namespace App\Http\Repository;

use App\Models\Agendamento;

class AgendamentoRepository
{
    public function __construct(private Agendamento $agendamento) {}

    public function index(array $filtros = []): mixed
    {
        $query = $this->agendamento
            ->with(['paciente', 'medico.usuario', 'especialidade', 'recepcionista']);

        if (! empty($filtros['paciente_id'])) {
            $query->where('paciente_id', $filtros['paciente_id']);
        }
        if (! empty($filtros['paciente_ids']) && is_array($filtros['paciente_ids'])) {
            if (empty($filtros['paciente_ids'])) {
                // Sem pacientes vinculados: força resultado vazio.
                $query->whereRaw('0 = 1');
            } else {
                $query->whereIn('paciente_id', $filtros['paciente_ids']);
            }
        }
        if (! empty($filtros['medico_id'])) {
            $query->where('medico_id', $filtros['medico_id']);
        }
        if (! empty($filtros['especialidade_id'])) {
            $query->where('especialidade_id', $filtros['especialidade_id']);
        }
        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }
        if (! empty($filtros['data_de'])) {
            $query->whereDate('data_agendamento', '>=', $filtros['data_de']);
        }
        if (! empty($filtros['data_ate'])) {
            $query->whereDate('data_agendamento', '<=', $filtros['data_ate']);
        }

        return $query
            ->orderBy('data_agendamento')
            ->orderBy('horario')
            ->get();
    }

    public function store(array $dados): Agendamento
    {
        return $this->agendamento
            ->create($dados)
            ->load(['paciente', 'medico.usuario', 'especialidade', 'recepcionista']);
    }

    public function show(int $id): ?Agendamento
    {
        return $this->agendamento
            ->with(['paciente', 'medico.usuario', 'especialidade', 'recepcionista'])
            ->find($id);
    }

    public function update(int $id, array $dados): ?Agendamento
    {
        $agendamento = $this->agendamento->find($id);

        if (! $agendamento) {
            return null;
        }

        $agendamento->update($dados);

        return $agendamento->fresh(['paciente', 'medico.usuario', 'especialidade', 'recepcionista']);
    }

    public function destroy(int $id): bool
    {
        $agendamento = $this->agendamento->find($id);

        if (! $agendamento) {
            return false;
        }

        return $agendamento->delete();
    }

    /**
     * Reverte para `confirmado` todos os agendamentos do médico que
     * estiverem com status `chamado`, exceto o que está sendo chamado
     * agora. Chamado pelo `AgendamentoService::chamar` para garantir que
     * o médico sempre tenha no máximo um paciente em estado "chamado".
     */
    public function reverterChamadoDoMedico(int $medicoId, int $excetoId): int
    {
        return $this->agendamento
            ->where('medico_id', $medicoId)
            ->where('status', 'chamado')
            ->where('id', '!=', $excetoId)
            ->update(['status' => 'confirmado']);
    }
}
