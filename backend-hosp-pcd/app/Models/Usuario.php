<?php

namespace App\Models;

use App\Enums\TiposUsuario;
use Illuminate\Console\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('tbusuarios', timestamps:true)]
#[Fillable('nome','email','telefone','senha', 'tipo_usuario')]
#[Hidden]
class Usuario extends Model
{
    use SoftDeletes;

    protected $casts = [
        'tipo_usuario' => TiposUsuario::class
    ];
}
