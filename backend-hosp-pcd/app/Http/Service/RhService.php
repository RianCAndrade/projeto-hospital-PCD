<?php

namespace App\Http\Service;

use App\Http\Repository\RhRepository;

class RhService
{
    public function __construct(
        private RhRepository $rhRepository
    ){}

    public function index()
    {
        return $this->rhRepository->index();
    }

    public function show(int $id)
    {
        return $this->rhRepository->show($id);
    }

     public function store(array $dados)
    {
        return $this->rhRepository->store($dados);
    }

    
}