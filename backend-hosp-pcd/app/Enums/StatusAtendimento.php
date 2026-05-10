<?php

namespace App\Enums;

enum StatusAtendimento: string
{
    case NaoAtendido = 'nao_atendido';
    case EmAtendimento = 'em_atendimento';
    case Atendido = 'atendido';
    case NaoCompareceu = 'nao_compareceu';
    case Cancelado = 'cancelado';
}