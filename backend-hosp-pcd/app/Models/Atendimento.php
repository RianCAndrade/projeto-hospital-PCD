<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbatendimentos', timestamps:true)]
#[Fillable('agendamento_id','medico_id','registrado_por_id','status','descricao','encaminhamento','receita','observacoes',)]
class Atendimento extends Model
{
    //
}
