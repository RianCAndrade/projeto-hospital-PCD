<?php

namespace App\Http\Service;

use App\Http\Repository\BootstrapRepository;

class BootstrapService
{
    public function __construct(private BootstrapRepository $bootstrapRepository) {}

    public function load(int $usuarioId): array
    {
        return $this->bootstrapRepository->load($usuarioId);
    }
}
