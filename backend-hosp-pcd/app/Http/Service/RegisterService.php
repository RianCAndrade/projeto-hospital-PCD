<?php

namespace App\Http\Service;

use App\Enums\TiposUsuario;
use App\Http\Repository\RegisterRepository;
use Illuminate\Validation\Rule;

class RegisterService
{
    public function __construct(
        private RegisterRepository $registerRepository
    ){}

    public function register(array $dados)
    {
        $dadosUsuario = [
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'],
            'email' => $dados['email'],
            'senha' => $dados['senha'],
            'telefone' => $dados['telefone'],
            'tipo_usuario' => TiposUsuario::Paciente,
        ];

        $usuario = $this->registerRepository->createUsuario($dadosUsuario);

        if (!$usuario){
            return false;
        }
            
            $dadosPaciente = [
                'usuario_id' => $usuario->id,
                'nome' => $dados['nome'],
                'cpf' => $usuario->cpf,
                'data_nascimento' => $dados['data_nascimento'],
                'sexo' => $dados['sexo'],
                'possui_autismo' => $dados['possui_autismo'],
                'necessita_acessibilidade' => $dados['necessita_acessibilidade'],
                'usa_cadeira_rodas' => $dados['usa_cadeira_rodas'],
                'necessita_acompanhante' => $dados['necessita_acompanhante'],
                'observacoes' => $dados['observacoes'],
                'observacoes_comunicacao' => $dados['observacoes_comunicacao'],
            ];
            $result = $this->registerRepository->createPaciente($dadosPaciente);
            return $result;
    }
}
