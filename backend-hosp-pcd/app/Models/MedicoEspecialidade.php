<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbmedico_especialidade', timestamps: false)]
#[Fillable('medico_id', 'especialidade_id')]
class MedicoEspecialidade extends Model
{
    //
}
