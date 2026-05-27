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
    ){}

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
}