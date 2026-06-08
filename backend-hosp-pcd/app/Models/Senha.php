<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('tbsenhas', timestamps: true)]
#[Fillable('codigo', 'agendamento_id', 'paciente_id', 'status', 'chamada_em', )]
class Senha extends Model
{
    public function agendamento(): BelongsTo
    {
        return $this->belongsTo(Agendamento::class, 'agendamento_id');
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }
}
