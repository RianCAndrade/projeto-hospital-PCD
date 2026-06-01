<?php

namespace App\Http\Service;

use App\Enums\TiposUsuario;
use App\Http\Repository\RegisterRepository;

class RegisterService
{
    public function __construct(
        private RegisterRepository $registerRepository
    ) {}

    public function register(array $dados)
    {
        $dadosUsuario = [
            'nome' => $dados['nome'],
            'cpf' => $dados['cpf'] ?? null,
            'email' => $dados['email'],
            'senha' => $dados['senha'],
            'telefone' => $dados['telefone'] ?? null,
            'tipo_usuario' => $dados['tipo_usuario'] ?? TiposUsuario::Paciente->value,
        ];

        $usuario = $this->registerRepository->createUsuario($dadosUsuario);

        if (! $usuario) {
            return false;
        }

        // Só cria registro em tbpacientes para self-registration de paciente.
        // Funcionários (admin/rh/recepcionista/medico) ficam só em tbusuarios.
        if ($usuario->tipo_usuario === TiposUsuario::Paciente) {
            $this->registerRepository->createPaciente([
                'usuario_id' => $usuario->id,
                'nome' => $dados['nome'],
                'cpf' => $usuario->cpf,
                'data_nascimento' => $dados['data_nascimento'],
                'sexo' => $dados['sexo'],
                'possui_autismo' => $dados['possui_autismo'],
                'necessita_acessibilidade' => $dados['necessita_acessibilidade'],
                'usa_cadeira_rodas' => $dados['usa_cadeira_rodas'],
                'necessita_acompanhante' => $dados['necessita_acompanhante'],
                'observacoes' => $dados['observacoes'] ?? null,
                'observacoes_comunicacao' => $dados['observacoes_comunicacao'] ?? null,
            ]);
        }

        return $usuario->fresh(['paciente', 'medico', 'responsavelDe']);
    }
}
