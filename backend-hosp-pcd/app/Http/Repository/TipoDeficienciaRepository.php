<?php

namespace App\Http\Repository;

use App\Models\TipoDeficiencia;

class TipoDeficienciaRepository
{
    public function __construct(private TipoDeficiencia $tipoDeficiencia) {}

    public function index(): mixed
    {
        return $this->tipoDeficiencia->orderBy('nome')->get();
    }

    public function store(array $dados): TipoDeficiencia
    {
        return $this->tipoDeficiencia->create($dados);
    }

    public function show(int $id): ?TipoDeficiencia
    {
        return $this->tipoDeficiencia->find($id);
    }

    public function destroy(int $id): bool
    {
        return (bool) $this->tipoDeficiencia->where('id', $id)->delete();
    }
}
