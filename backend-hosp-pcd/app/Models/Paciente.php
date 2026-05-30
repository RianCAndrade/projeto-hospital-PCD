<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('tbpacientes', timestamps: true)]
#[Fillable('usuario_id', 'nome', 'data_nascimento', 'cpf',
    'sexo', 'possui_autismo', 'necessita_acessibilidade',
    'usa_cadeira_rodas', 'necessita_acompanhante', 'observacoes',
    'observacoes_comunicacao')]
class Paciente extends Model
{
    use SoftDeletes;

    protected $casts = [
        'data_nascimento' => 'date:Y-m-d',
        'possui_autismo' => 'boolean',
        'necessita_acessibilidade' => 'boolean',
        'usa_cadeira_rodas' => 'boolean',
        'necessita_acompanhante' => 'boolean',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Vínculos com responsáveis (relação direta com o pivot,
     * para o frontend listar `responsaveis` com `usuario_id`,
     * `parentesco`, `principal`).
     */
    public function responsaveis(): HasMany
    {
        return $this->hasMany(ResponsavelPaciente::class, 'paciente_id');
    }

    /**
     * Tipos de deficiência vinculados (pivot tbpaciente_deficiencia).
     */
    public function tiposDeficiencia(): BelongsToMany
    {
        return $this->belongsToMany(
            TipoDeficiencia::class,
            'tbpaciente_deficiencia',
            'paciente_id',
            'tipo_deficiencia_id'
        )->withPivot('observacoes');
    }

    /**
     * Carregado como `deficiencias` no JSON para casar com o
     * tipo `PacienteDeficiencia[]` esperado pelo frontend.
     */
    public function deficiencias(): HasMany
    {
        return $this->hasMany(PacienteDeficiencia::class, 'paciente_id');
    }
}
