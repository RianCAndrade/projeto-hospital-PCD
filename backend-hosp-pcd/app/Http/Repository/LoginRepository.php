<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class LoginRepository
{
    public function __construct(
        private Usuario $usuario
    ){}

    public function findByEmail(string $email)
    {
        return $this->usuario->where('email', $email)->first();
    }

    // public function autenticate()
    // {

    // }
}