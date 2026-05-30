<?php

namespace App\Http\Repository;

use App\Models\Paciente;
use App\Models\ResponsavelPaciente;

class PacienteRepository
{
    public function __construct(private Paciente $paciente) {}

    public function index(): mixed
    {
        return $this->paciente
            ->with('usuario')
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
            ->with('usuario')
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
        return (bool) $this->paciente->where('id', $id)->delete();
    }

    public function meusPacientes(int $usuarioId): mixed
    {
        $pacienteIds = ResponsavelPaciente::where('usuario_id', $usuarioId)->pluck('paciente_id');

        return $this->paciente
            ->whereIn('id', $pacienteIds)
            ->with('usuario')
            ->orderBy('nome')
            ->get();
    }
}
