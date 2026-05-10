<?php

namespace App\Enums;

enum TiposUsuario: string
{
    case Admin = 'admin';
    case Recepcionista = 'recepcionista';
    case Medico = 'medico';
    case Responsavel = 'responsavel';
    case Paciente = 'paciente';
}