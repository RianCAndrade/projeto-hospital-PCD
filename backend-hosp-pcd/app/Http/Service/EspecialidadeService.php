<?php

namespace App\Http\Service;

use App\Http\Repository\EspecialidadeRepository;
use App\Models\Especialidade;

class EspecialidadeService
{
    public function __construct(private EspecialidadeRepository $especialidadeRepository) {}

    public function index(): mixed
    {
        return $this->especialidadeRepository->index();
    }

    public function store(array $dados): Especialidade
    {
        return $this->especialidadeRepository->store($dados);
    }

    public function show(int $id): ?Especialidade
    {
        return $this->especialidadeRepository->show($id);
    }

    public function destroy(int $id): bool
    {
        return $this->especialidadeRepository->destroy($id);
    }
}
