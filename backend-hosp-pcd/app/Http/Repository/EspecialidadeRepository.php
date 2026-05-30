<?php

namespace App\Http\Repository;

use App\Models\Especialidade;

class EspecialidadeRepository
{
    public function __construct(private Especialidade $especialidade) {}

    public function index(): mixed
    {
        return $this->especialidade->orderBy('nome')->get();
    }

    public function store(array $dados): Especialidade
    {
        return $this->especialidade->create($dados);
    }

    public function show(int $id): ?Especialidade
    {
        return $this->especialidade->find($id);
    }

    public function destroy(int $id): bool
    {
        return (bool) $this->especialidade->where('id', $id)->delete();
    }
}
