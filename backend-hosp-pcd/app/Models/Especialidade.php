<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('tbespecialidades', timestamps:true)]
#[Fillable('nome')]
class Especialidade extends Model
{
    //
}
