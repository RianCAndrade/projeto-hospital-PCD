<?php

namespace App\Http\Repository;

use App\Enums\TiposUsuario;
use App\Models\Medico;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RhRepository
{
    public function __construct(
        private Usuario $usuario,
        private Medico $medico
    ) {}

    // ─────────────────────── Médicos ───────────────────────

    public function indexMedico()
    {
        return $this->medico->with(['usuario', 'especialidades'])->get();
    }

    public function showMedico(int $id): ?Medico
    {
        return $this->medico->with(['usuario', 'especialidades'])->find($id);
    }

    public function storeMedico(array $dados): ?Medico
    {
        return DB::transaction(function () use ($dados) {
            $usuario = $this->usuario->create([
                'nome' => $dados['nome'],
                'cpf' => $dados['cpf'],
                'email' => $dados['email'],
                'senha' => Hash::make($dados['senha']),
                'telefone' => $dados['telefone'] ?? null,
                'tipo_usuario' => TiposUsuario::Medico,
            ]);

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

    public function updateMedico(int $id, array $dados): ?Medico
    {
        return DB::transaction(function () use ($id, $dados) {
            $medico = $this->medico->find($id);
            if (! $medico) {
                return null;
            }

            $camposMedico = [];
            foreach (['crm', 'descricao'] as $c) {
                if (array_key_exists($c, $dados)) {
                    $camposMedico[$c] = $dados[$c];
                }
            }
            if (! empty($camposMedico)) {
                $medico->update($camposMedico);
            }

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

    public function destroyMedico(int $id): bool
    {
        $medico = $this->medico->find($id);
        if (! $medico) {
            return false;
        }

        return (bool) $medico->delete();
    }

    // ───────────────────── Recepcionistas ─────────────────────

    public function indexRecepcionista()
    {
        return $this->usuario
            ->where('tipo_usuario', TiposUsuario::Recepcionista)
            ->orderBy('nome')
            ->get();
    }

    public function showRecepcionista(int $id): ?Usuario
    {
        return $this->usuario
            ->where('id', $id)
            ->where('tipo_usuario', TiposUsuario::Recepcionista)
            ->first();
    }

    public function storeRecepcionista(array $dados): Usuario
    {
        return $this->usuario->create([
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
            'telefone' => $dados['telefone'] ?? null,
            'tipo_usuario' => TiposUsuario::Recepcionista,
        ]);
    }

    public function updateRecepcionista(int $id, array $dados): ?Usuario
    {
        $usuario = $this->showRecepcionista($id);
        if (! $usuario) {
            return null;
        }

        $campos = [];
        foreach (['nome', 'cpf', 'email', 'telefone'] as $c) {
            if (array_key_exists($c, $dados)) {
                $campos[$c] = $dados[$c];
            }
        }
        if (array_key_exists('senha', $dados)) {
            $campos['senha'] = Hash::make($dados['senha']);
        }

        if (! empty($campos)) {
            $usuario->update($campos);
        }

        return $usuario->fresh();
    }

    public function destroyRecepcionista(int $id): bool
    {
        $usuario = $this->showRecepcionista($id);
        if (! $usuario) {
            return false;
        }

        return (bool) $usuario->delete();
    }
}
