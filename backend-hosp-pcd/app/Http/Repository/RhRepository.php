<?php

namespace App\Http\Repository;

use App\Enums\TiposUsuario;
use App\Models\Medico;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class RhRepository
{
    public function __construct(
        private Usuario $usuario,
        private Medico $medico
    ) {}

    public function indexMedico()
    {
        return $this->medico->get();
    }

    public function showMedico(int $id)
    {
        return $this->medico->where('id', $id)->first();
    }

    public function storeMedico(array $dados)
    {
        // $camposUsuario = [$dados['nome'], $dados['cpf'], $dados['email'], $dados['senha'], $dados['telefone']];
        // $camposMedico = [$dados['crm'], $dados['descricao']];
        return DB::transaction(function () use ($dados) {

            $usuario = $this->usuario->create([
                'nome' => $dados['nome'],
                'cpf' => $dados['cpf'],
                'email' => $dados['email'],
                'senha' => $dados['senha'],
                'telefone' => $dados['telefone'],
                'tipo_usuario' => TiposUsuario::Medico,
            ]);

            $medico = $this->medico->create([
                'usuario_id' => $usuario->id,
                'crm' => $dados['crm'],
                'descricao' => $dados['descricao'],
            ]);

            return $medico;
        });
    }

    public function updateMedico(int $id, array $dados)
    {
        return DB::transaction(function () use ($id, $dados) {
            $usuarioMedico = $this->usuario->where('id', $id)->update([
                'nome' => $dados['nome'],
                'cpf' => $dados['cpf'],
                'email' => $dados['email'],
                'senha' => $dados['senha'],
                'telefone' => $dados['telefone'],
                // 'tipo_usuario' => TiposUsuario::Medico,
            ]);

            $medico = $this->medico->where('usuario_id', $usuarioMedico)->update([
                // 'usuario_id' => $usuarioMedico,
                'crm' => $dados['crm'],
                'descricao' => $dados['descricao'],
            ]);

            return $medico;
        });
    }

    public function destroyMedico(int $id)
    {
        return $this->medico->where('id', $id)->delete();
    }

    public function indexRecepcionista()
    {
        return $this->medico->get();
    }

    public function showRecepcionista(int $id)
    {
        return $this->medico->where('id', $id)->first();
    }

    public function storeRecepcionista(array $dados)
    {
        return $this->usuario->create([
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'],
            'email' => $dados['email'],
            'senha' => $dados['senha'],
            'telefone' => $dados['telefone'],
            'tipo_usuario' => TiposUsuario::Recepcionista,
        ]);
    }

    public function updateRecepcionista(int $id, array $dados)
    {
        return $this->usuario->where('id', $id)->update([
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'],
            'email' => $dados['email'],
            'senha' => $dados['senha'],
            'telefone' => $dados['telefone'],
        ]);
    }

    public function destroyRecepcionista(int $id)
    {
        return $this->usuario->where('id', $id)->delete();
    }
}
