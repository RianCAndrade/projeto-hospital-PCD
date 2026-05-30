<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbpaciente_deficiencia', timestamps: false)]
#[Fillable('paciente_id', 'tipo_deficiencia_id', 'observacoes', )]
class PacienteDeficiencia extends Model
{
    //
}
