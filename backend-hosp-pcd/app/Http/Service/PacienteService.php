<?php

namespace App\Http\Service;

use App\Http\Repository\PacienteRepository;
use App\Models\Paciente;
use Illuminate\Support\Arr;

class PacienteService
{
    public function __construct(private PacienteRepository $pacienteRepository) {}

    public function index(): mixed
    {
        return $this->pacienteRepository->index();
    }

    public function store(array $dados): Paciente
    {
        $tipoDeficienciaIds = Arr::pull($dados, 'tipo_deficiencia_ids');

        $paciente = $this->pacienteRepository->store($dados);

        if (! empty($tipoDeficienciaIds)) {
            $paciente->tiposDeficiencia()->sync($tipoDeficienciaIds);
        }

        return $paciente->load(['usuario', 'deficiencias.tipoDeficiencia']);
    }

    public function show(int $id): ?Paciente
    {
        return $this->pacienteRepository->show($id);
    }

    public function update(int $id, array $dados): ?Paciente
    {
        $tipoDeficienciaIds = Arr::pull($dados, 'tipo_deficiencia_ids');

        $paciente = $this->pacienteRepository->update($id, $dados);

        if ($paciente && $tipoDeficienciaIds !== null) {
            $paciente->tiposDeficiencia()->sync($tipoDeficienciaIds);
        }

        return $paciente?->fresh(['usuario', 'deficiencias.tipoDeficiencia']);
    }

    public function destroy(int $id): bool
    {
        return $this->pacienteRepository->destroy($id);
    }

    public function meusPacientes(int $usuarioId): mixed
    {
        return $this->pacienteRepository->meusPacientes($usuarioId);
    }
}
