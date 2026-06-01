<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class MeRepository
{
    public function __construct(private Usuario $usuario) {}

    public function show(int $id): ?Usuario
    {
        return $this->usuario
            ->with(['paciente', 'medico.especialidades', 'responsavelDe'])
            ->find($id);
    }
}
