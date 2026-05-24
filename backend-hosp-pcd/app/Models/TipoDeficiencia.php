<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbtipos_deficiencia', timestamps: true)]
#[Fillable('nome')]
class TipoDeficiencia extends Model
{
    //
}
