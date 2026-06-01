<?php

namespace App\Http\Repository;

use App\Models\Paciente;
use App\Models\ResponsavelPaciente;

class PacienteRepository
{
    public function __construct(private Paciente $paciente) {}

    /** Relações eager-loaded em todas as leituras (para casar com o tipo do frontend). */
    private array $with = [
        'usuario',
        'responsaveis.usuario',
        'deficiencias.tipoDeficiencia',
    ];

    public function index(): mixed
    {
        return $this->paciente
            ->with($this->with)
            ->orderBy('nome')
            ->get();
    }

    public function store(array $dados): Paciente
    {
        return $this->paciente->create($dados);
    }

    public function show(int $id): ?Paciente
    {
        return $this->paciente
            ->with($this->with)
            ->find($id);
    }

    public function update(int $id, array $dados): ?Paciente
    {
        $paciente = $this->paciente->find($id);

        if (! $paciente) {
            return null;
        }

        $paciente->update($dados);

        return $paciente;
    }

    public function destroy(int $id): bool
    {
        $paciente = $this->paciente->find($id);

        if (! $paciente) {
            return false;
        }

        return (bool) $paciente->delete();
    }

    public function meusPacientes(int $usuarioId): mixed
    {
        $pacienteIds = ResponsavelPaciente::where('usuario_id', $usuarioId)->pluck('paciente_id');

        return $this->paciente
            ->whereIn('id', $pacienteIds)
            ->with($this->with)
            ->orderBy('nome')
            ->get();
    }
}
