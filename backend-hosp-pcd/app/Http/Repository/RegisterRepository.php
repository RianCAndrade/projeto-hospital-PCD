<?php

namespace App\Http\Repository;

use App\Models\Paciente;
use App\Models\ResponsavelPaciente;
use App\Models\Usuario;

class RegisterRepository
{
    public function __construct(
        private Usuario $usuario,
        private Paciente $paciente,
        private ResponsavelPaciente $responsavelPaciente
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

    public function createResponsavelPaciente(array $dadosResponsavelPaciente)
    {
        return $this->responsavelPaciente->create($dadosResponsavelPaciente);
    }
}
