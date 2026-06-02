<?php

namespace App\Enums;

enum StatusAgendamento: string
{
    case Agendado = 'agendado';
    case Confirmado = 'confirmado';
    case Chamado = 'chamado';
    case EmAtendimento = 'em_atendimento';
    case Cancelado = 'cancelado';
    case Remarcado = 'remarcado';
    case Finalizado = 'finalizado';
    case Faltou = 'faltou';
}
