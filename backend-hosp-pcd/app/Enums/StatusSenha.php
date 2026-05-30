<?php

namespace App\Enums;

enum StatusSenha: string
{
    case Ativa = 'ativa';
    case Chamada = 'chamada';
    case Finalizada = 'finalizada';
    case Cancelada = 'cancelada';
}
