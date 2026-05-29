<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbsenhas', timestamps: true)]
#[Fillable('codigo', 'agendamento_id', 'paciente_id', 'status', 'chamada_em', )]
class Senha extends Model
{
    //
}
