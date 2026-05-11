<?php

namespace App\Models;

use App\Enums\TiposUsuario;
use Illuminate\Console\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Table('tbusuarios', timestamps:true)]
#[Fillable('nome','email','telefone','senha', 'tipo_usuario')]
#[Hidden('senha')]
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $password = 'senha';

    protected $casts = [
        'tipo_usuario' => TiposUsuario::class
    ];
}
