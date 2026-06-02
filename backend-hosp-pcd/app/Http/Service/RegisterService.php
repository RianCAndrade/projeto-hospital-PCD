<?php

namespace App\Http\Service;

use App\Enums\TiposUsuario;
use App\Http\Repository\RegisterRepository;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

        return DB::transaction(function () use ($dados, $dadosUsuario) {
            $usuario = $this->registerRepository->createUsuario($dadosUsuario);

            if (! $usuario) {
                return false;
            }

            // Só cria registro em tbpacientes para self-registration de paciente.
            // Funcionários (admin/rh/recepcionista/medico) ficam só em tbusuarios.
            if ($usuario->tipo_usuario !== TiposUsuario::Paciente) {
                return $usuario->fresh(['paciente', 'medico', 'responsavelDe']);
            }

            $paciente = $this->registerRepository->createPaciente([
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

            // Quando o paciente declarou que necessita de acompanhante, o
            // cadastro público já cria o usuário responsável e o vínculo em
            // tbresponsavel_paciente na mesma transação.
            if (! empty($dados['necessita_acompanhante']) && $dados['necessita_acompanhante'] === true) {
                $responsavel = Usuario::create([
                    'nome' => $dados['responsavel_nome'],
                    'cpf' => $dados['responsavel_cpf'] ?? null,
                    'email' => $dados['responsavel_email'],
                    'telefone' => $dados['responsavel_telefone'] ?? null,
                    'senha' => Hash::make($dados['responsavel_senha']),
                    'tipo_usuario' => TiposUsuario::Responsavel->value,
                ]);

                $this->registerRepository->createResponsavelPaciente([
                    'usuario_id' => $responsavel->id,
                    'paciente_id' => $paciente->id,
                    'parentesco' => $dados['responsavel_parentesco'],
                    'principal' => $dados['responsavel_principal'] ?? true,
                ]);
            }

            return $usuario->fresh(['paciente.responsaveis', 'medico', 'responsavelDe']);
        });
    }
}
