<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbresponsavel_paciente', timestamps: true)]
#[Fillable('usuario_id', 'paciente_id', 'parentesco', 'principal', )]
class ResponsavelPaciente extends Model
{
    //
}
