<?php

namespace App\Http\Repository;

use App\Models\Medico;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class MedicoRepository
{
    public function __construct(
        private Usuario $usuario,
        private Medico $medico
    ) {}

    public function index()
    {
        return $this->medico->get();
    }

    public function show(int $id)
    {
        return $this->medico->where('id', $id)->first();
    }

    public function store(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            $usuario = $this->usuario->create([
                'nome' => $dados['nome'],
                'cpf' => $dados['cpf'],
                'email' => $dados['email'],
                'senha' => $dados['senha'],
                'telefone' => $dados['telefone'],
                // 'tipo_usuario' => TiposUsuario::Medico,
            ]);

            $medico = $this->medico->create([
                'usuario_id' => $usuario->id,
                'crm' => $dados['crm'],
                'descricao' => $dados['descricao'],
            ]);

            return $medico;
        });
    }

    public function update(int $id, array $dados)
    {
        return DB::transaction(function () use ($id, $dados) {
            $usuarioMedico = $this->usuario->where('id', $id)->update([
                'nome' => $dados['nome'],
                'cpf' => $dados['cpf'],
                'email' => $dados['email'],
                'senha' => $dados['senha'],
                'telefone' => $dados['telefone'],
                // 'tipo_usuario' => TiposUsuario::Medico
            ]);

            $medico = $this->medico->where('usuario_id', $usuarioMedico)->update([
                // 'usuario_id' => $usuarioMedico,
                'crm' => $dados['crm'],
                'descricao' => $dados['descricao'],
            ]);

            return $medico;
        });
    }

    public function destroy(int $id)
    {
        return DB::transaction(function () use ($id) {
            $usuarioMedico = $this->usuario->where('id', $id)->delete();
            $deleted = $this->medico->where('usuario_id', $usuarioMedico)->delete();

            return true;
        });
    }
}
