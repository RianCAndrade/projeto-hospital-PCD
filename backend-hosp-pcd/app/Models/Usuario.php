<?php

namespace App\Models;

use App\Enums\TiposUsuario;
use Illuminate\Console\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Table('tbusuarios', timestamps:true)]
#[Fillable('nome','cpf','email','senha','telefone','tipo_usuario')]
#[Hidden('senha')]
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $password = 'senha';

    protected $casts = [
        'tipo_usuario' => TiposUsuario::class
    ];

    public function paciente(): HasOne
    {
        return $this->hasOne(Paciente::class, 'usuario_id');
    }
}
