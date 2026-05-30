<?php

namespace App\Http\Repository;

use App\Enums\TiposUsuario;
use App\Models\Usuario;

class RecepcionistaRepository
{
    public function __construct(
        private Usuario $usuario
    ) {}

    public function store(array $dados)
    {
        $usuarioPaciente = $this->usuario->create([
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'],
            'email' => $dados['email'],
            'senha' => $dados['senha'],
            'telefone' => $dados['telefone'],
            'tipo_usuario' => TiposUsuario::Recepcionista,
        ]);

        return $usuarioPaciente;
    }

    public function update(int $id, array $dados)
    {
        $usuario = $this->usuario->find($id);

        if (! $usuario) {
            return false;
        }

        $usuario->nome = $dados['nome'] ?? $usuario->nome;
        $usuario->cpf = $dados['cpf'] ?? $usuario->cpf;
        $usuario->email = $dados['email'] ?? $usuario->email;
        $usuario->senha = $dados['senha'] ?? $usuario->senha;
        $usuario->telefone = $dados['telefone'] ?? $usuario->telefone;

        $usuario->save();

        return $usuario;
    }

    public function delete(int $id)
    {
        $usuario = $this->usuario->find($id);

        if (! $usuario) {
            return false;
        }

        $usuario->delete();

        return $usuario;
    }
}
