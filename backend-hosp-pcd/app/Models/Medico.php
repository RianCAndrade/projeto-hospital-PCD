<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('tbmedicos', timestamps: true)]
#[Fillable('usuario_id', 'crm', 'descricao')]
class Medico extends Model
{
    use SoftDeletes;

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function especialidades(): BelongsToMany
    {
        return $this->belongsToMany(
            Especialidade::class,
            'tbmedico_especialidade',
            'medico_id',
            'especialidade_id'
        );
    }
}
