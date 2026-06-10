<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('tbagendamentos', timestamps: true)]
#[Fillable('paciente_id', 'medico_id', 'especialidade_id', 'recepcionista_id', 'data_agendamento', 'horario', 'status', 'observacoes', )]
class Agendamento extends Model
{
    use SoftDeletes;

    protected $casts = [
        'data_agendamento' => 'date:Y-m-d',
    ];

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class, 'medico_id');
    }

    public function especialidade(): BelongsTo
    {
        return $this->belongsTo(Especialidade::class, 'especialidade_id');
    }

    public function recepcionista(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'recepcionista_id');
    }

    public function senha(): HasOne
    {
        return $this->hasOne(Senha::class, 'agendamento_id');
    }
}
