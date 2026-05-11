<?php

namespace App\Http\Service;

use App\Http\Repository\RegisterRepository;

class RegisterService
{
    public function __construct(
        private RegisterRepository $registerRepository
    ){}

    public function register(array $dados)
    {
        $result = $this->registerRepository->create($dados);
        return $result;
    }
}
