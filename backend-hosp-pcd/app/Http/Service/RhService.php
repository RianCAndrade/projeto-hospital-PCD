<?php

namespace App\Http\Service;

use App\Http\Repository\RhRepository;

class RhService
{
    public function __construct(
        private RhRepository $rhRepository
    ){}

    public function indexMedico()
    {
        return $this->rhRepository->indexMedico();
    }

    public function showMedico(int $id)
    {
        return $this->rhRepository->showMedico($id);
    }

    public function storeMedico(array $dados)
    {
        return $this->rhRepository->storeMedico($dados);
    }

    public function updateMedico(int $id, array $dados)
    {
        return $this->rhRepository->updateMedico($id, $dados);
    }

    public function destroyMedico(int $id)
    {
        $result = $this->rhRepository->destroyMedico($id);

        return $result;
    }

    public function indexRecepcionista()
    {
        return $this->rhRepository->indexRecepcionista();
    }

    public function showRecepcionista(int $id)
    {
        return $this->rhRepository->showRecepcionista($id);
    }

    public function storeRecepcionista(array $dados)
    {
        return $this->rhRepository->storeRecepcionista($dados);
    }

    public function updateRecepcionista(int $id, array $dados)
    {
        return $this->rhRepository->updateRecepcionista($id, $dados);
    }

    public function destroyRecepcionista(int $id)
    {
        return $this->rhRepository->destroyRecepcionista($id);
    }
}