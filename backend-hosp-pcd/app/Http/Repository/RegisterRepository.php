<?php

namespace App\Http\Repository;

use App\Models\Paciente;
use App\Models\Usuario;

class RegisterRepository
{
    public function __construct(
        private Usuario $usuario,
        private Paciente $paciente
    ) {}

    public function createUsuario(array $dadosUsuario)
    {

        if ($this->usuario->where('email', $dadosUsuario['email'])->exists()) {
            return false;
        }

        $result = $this->usuario->create($dadosUsuario);

        return $result;
    }

    public function createPaciente(array $dadosPaciente)
    {
        $result = $this->paciente->create($dadosPaciente);

        return $result;
    }
}
