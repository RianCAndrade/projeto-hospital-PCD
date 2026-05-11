<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class RegisterRepository
{
    public function __construct(
        private Usuario $usuario
    ){}

    public function create(array $dados)
    {
        if($this->usuario->where('email', $dados['email'])->exists()){
            return false;
        }

        $result = $this->usuario->create($dados);

        return $result;
    }

    
}