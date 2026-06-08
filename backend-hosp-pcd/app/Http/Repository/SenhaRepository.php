<?php

namespace App\Http\Repository;

use App\Models\Senha;

class SenhaRepository
{
    public function __construct(private Senha $senha) {}

    public function index(array $filtros = []): mixed
    {
        $query = $this->senha->with(['agendamento', 'paciente']);

        if (! empty($filtros['paciente_ids']) && is_array($filtros['paciente_ids'])) {
            if (empty($filtros['paciente_ids'])) {
                $query->whereRaw('0 = 1');
            } else {
                $query->whereIn('paciente_id', $filtros['paciente_ids']);
            }
        }
        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        return $query
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(array $dados): Senha
    {
        return $this->senha->create($dados);
    }

    public function show(int $id): ?Senha
    {
        return $this->senha
            ->with(['agendamento', 'paciente'])
            ->find($id);
    }

    public function update(int $id, array $dados): ?Senha
    {
        $senha = $this->senha->find($id);

        if (! $senha) {
            return null;
        }

        $senha->update($dados);

        return $senha;
    }

    public function destroy(int $id): bool
    {
        return (bool) $this->senha->where('id', $id)->delete();
    }
}
