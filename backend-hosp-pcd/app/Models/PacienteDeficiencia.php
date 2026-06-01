<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('tbpaciente_deficiencia', timestamps: false)]
#[Fillable('paciente_id', 'tipo_deficiencia_id', 'observacoes')]
class PacienteDeficiencia extends Model
{
    public $timestamps = false;

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function tipoDeficiencia(): BelongsTo
    {
        return $this->belongsTo(TipoDeficiencia::class, 'tipo_deficiencia_id');
    }
}
