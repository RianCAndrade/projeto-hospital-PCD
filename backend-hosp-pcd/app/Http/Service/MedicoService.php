<?php

namespace App\Http\Service;

use App\Http\Repository\MedicoRepository;
use App\Models\Medico;

class MedicoService
{
    public function __construct(
        private MedicoRepository $medicoRepository
    ) {}

    public function index()
    {
        return $this->medicoRepository->index();
    }

    public function show(int $id): ?Medico
    {
        return $this->medicoRepository->show($id);
    }

    public function store(array $dados): Medico
    {
        return $this->medicoRepository->store($dados);
    }

    public function update(int $id, array $dados): ?Medico
    {
        return $this->medicoRepository->update($id, $dados);
    }

    public function destroy(int $id): bool
    {
        return $this->medicoRepository->destroy($id);
    }
}
