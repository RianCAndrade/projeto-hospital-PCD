<?php

namespace App\Http\Repository;

use App\Models\Senha;

class SenhaRepository
{
    public function __construct(private Senha $senha) {}

    public function index(): mixed
    {
        return $this->senha
            ->with(['agendamento', 'paciente'])
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
