<?php

namespace App\Http\Service;

use App\Http\Repository\RecepcionistaRepository;

class RecepcionistaService
{
    public function __construct(
        private RecepcionistaRepository $recepcionistaRepository
    ) {}

    public function index()
    {
        // return $this->recepcionistaRepository->all();
    }

    public function show(int $id)
    {
        // return $this->recepcionistaRepository->find($id);
    }

    public function store(array $dados)
    {
        return $this->recepcionistaRepository->store($dados);
    }

    public function update(int $id, array $dados)
    {
        // return $this->recepcionistaRepository->update($id, $dados);
    }

    public function destroy(int $id)
    {
        // return $this->recepcionistaRepository->delete($id);
    }
}
