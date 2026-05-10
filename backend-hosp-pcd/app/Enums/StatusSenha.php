<?php

namespace App\Enums;

enum StatusSenha: string
{
    case Ativa = 'ativa';
    case Utilizada = 'utilizada';
    case Expirada = 'expirada';
    case Cancelada = 'cancelada';
}