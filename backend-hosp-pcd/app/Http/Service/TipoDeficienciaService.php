<?php

namespace App\Http\Service;

use App\Http\Repository\TipoDeficienciaRepository;
use App\Models\TipoDeficiencia;

class TipoDeficienciaService
{
    public function __construct(private TipoDeficienciaRepository $tipoDeficienciaRepository) {}

    public function index(): mixed
    {
        return $this->tipoDeficienciaRepository->index();
    }

    public function store(array $dados): TipoDeficiencia
    {
        return $this->tipoDeficienciaRepository->store($dados);
    }

    public function show(int $id): ?TipoDeficiencia
    {
        return $this->tipoDeficienciaRepository->show($id);
    }

    public function destroy(int $id): bool
    {
        return $this->tipoDeficienciaRepository->destroy($id);
    }
}
