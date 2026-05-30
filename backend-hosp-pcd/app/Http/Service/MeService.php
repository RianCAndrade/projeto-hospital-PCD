<?php

namespace App\Http\Service;

use App\Http\Repository\MeRepository;
use App\Models\Usuario;

class MeService
{
    public function __construct(private MeRepository $meRepository) {}

    public function show(int $id): ?Usuario
    {
        return $this->meRepository->show($id);
    }
}
