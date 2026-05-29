<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('tbpacientes', timestamps: true)]
#[Fillable('usuario_id', 'nome', 'data_nascimento', 'cpf',
    'sexo', 'possui_autismo', 'necessita_acessibilidade',
    'usa_cadeira_rodas', 'necessita_acompanhante', 'observacoes',
    'observacoes_comunicacao')]
class Paciente extends Model
{
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
