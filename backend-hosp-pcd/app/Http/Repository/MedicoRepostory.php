<?php

namespace App\Http\Repository;

use App\Enums\TiposUsuario;
use App\Models\Medico;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MedicoRepository
{
    public function __construct(
        private Usuario $usuario,
        private Medico $medico
    ) {}

    public function index()
    {
        return $this->medico
            ->with(['usuario', 'especialidades'])
            ->get();
    }

    public function show(int $id): ?Medico
    {
        return $this->medico
            ->with(['usuario', 'especialidades'])
            ->find($id);
    }

    /**
     * Cria um médico. Aceita dois modos:
     *
     *   1. Vincular Usuário existente:  ['usuario_id' => N, 'crm' => ...]
     *   2. Criar Usuário inline:        ['nome','email','senha',...,'crm'=>...]
     *
     * Em ambos, se vier `especialidade_ids`, sincroniza o pivot.
     */
    public function store(array $dados): Medico
    {
        return DB::transaction(function () use ($dados) {
            if (! empty($dados['usuario_id'])) {
                $usuario = $this->usuario->findOrFail($dados['usuario_id']);
                // Promove o usuário a médico, se ainda não é.
                if ($usuario->tipo_usuario !== TiposUsuario::Medico) {
                    $usuario->update(['tipo_usuario' => TiposUsuario::Medico]);
                }
            } else {
                $usuario = $this->usuario->create([
                    'nome' => $dados['nome'],
                    'cpf' => $dados['cpf'] ?? null,
                    'email' => $dados['email'],
                    'senha' => Hash::make($dados['senha']),
                    'telefone' => $dados['telefone'] ?? null,
                    'tipo_usuario' => TiposUsuario::Medico,
                ]);
            }

            $medico = $this->medico->create([
                'usuario_id' => $usuario->id,
                'crm' => $dados['crm'],
                'descricao' => $dados['descricao'] ?? null,
            ]);

            if (! empty($dados['especialidade_ids'])) {
                $medico->especialidades()->sync($dados['especialidade_ids']);
            }

            return $medico->load(['usuario', 'especialidades']);
        });
    }

    public function update(int $id, array $dados): ?Medico
    {
        return DB::transaction(function () use ($id, $dados) {
            $medico = $this->medico->find($id);

            if (! $medico) {
                return null;
            }

            // Campos do médico
            $medico->update(array_filter([
                'crm' => $dados['crm'] ?? null,
                'descricao' => $dados['descricao'] ?? null,
            ], fn ($v) => $v !== null));

            // Campos do usuário associado (se vierem)
            $camposUsuario = [];
            foreach (['nome', 'cpf', 'email', 'telefone'] as $c) {
                if (array_key_exists($c, $dados)) {
                    $camposUsuario[$c] = $dados[$c];
                }
            }
            if (array_key_exists('senha', $dados)) {
                $camposUsuario['senha'] = Hash::make($dados['senha']);
            }
            if (! empty($camposUsuario)) {
                $this->usuario->where('id', $medico->usuario_id)->update($camposUsuario);
            }

            if (array_key_exists('especialidade_ids', $dados)) {
                $medico->especialidades()->sync($dados['especialidade_ids'] ?? []);
            }

            return $medico->fresh(['usuario', 'especialidades']);
        });
    }

    public function destroy(int $id): bool
    {
        $medico = $this->medico->find($id);

        if (! $medico) {
            return false;
        }

        // SoftDelete só do médico; mantém o Usuario (que pode virar
        // recepcionista/responsável de novo no futuro).
        return (bool) $medico->delete();
    }
}
