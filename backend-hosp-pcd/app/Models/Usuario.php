<?php

namespace App\Models;

use App\Enums\TiposUsuario;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Table('tbusuarios', timestamps: true)]
#[Fillable('nome', 'cpf', 'email', 'senha', 'telefone', 'tipo_usuario')]
#[Hidden('senha', 'remember_token')]
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Diz ao guard de autenticação que a coluna da senha se chama
     * `senha` (e não o `password` padrão do Laravel).
     */
    public function getAuthPasswordName(): string
    {
        return 'senha';
    }

    protected $casts = [
        'tipo_usuario' => TiposUsuario::class,
    ];

    public function paciente(): HasOne
    {
        return $this->hasOne(Paciente::class, 'usuario_id');
    }

    public function medico(): HasOne
    {
        return $this->hasOne(Medico::class, 'usuario_id');
    }

    /**
     * Pacientes dos quais este usuário é responsável (pivot
     * tbresponsavel_paciente). Carregado como `responsavel_de`
     * no JSON para casar com o tipo `Usuario` do frontend.
     */
    public function responsavelDe(): BelongsToMany
    {
        return $this->belongsToMany(Paciente::class, 'tbresponsavel_paciente', 'usuario_id', 'paciente_id')
            ->withPivot('parentesco', 'principal');
    }
}
