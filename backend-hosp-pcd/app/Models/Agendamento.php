<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbagendamentos', timestamps:true)]
#[Fillable('paciente_id','medico_id','especialidade_id','recepcionista_id','data_agendamento','horario','status','observacoes',)]
class Agendamento extends Model
{
    //
}
