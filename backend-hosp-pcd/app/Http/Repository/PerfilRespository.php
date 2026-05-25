<?php

namespace App\Http\Repository;

use App\Models\Paciente;
use App\Models\Usuario;

class PerfilRespository
{
    public function __construct(
        private Usuario $usuario,
        private Paciente $paciente
    ){}

    public function updateUsuario(int $usuarioId, array $user)
    {
        return $this->usuario->where('id', $usuarioId)->update($user);
    }

    public function updatePaciente(int $usuarioId, array $paciente)
    {
        return $this->paciente->where('usuario_id', $usuarioId)->update($paciente);
    }

    public function delete()
    {
        
    }

}