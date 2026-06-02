<?php

namespace App\Http\Controllers;

use App\Enums\TiposUsuario;
use App\Http\Service\RegisterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController
{
    public function __construct(
        private RegisterService $registerService
    ) {}

    public function register(Request $request)
    {
        try {
            // Padrão: paciente. Se vier outro tipo (admin/rh/recepcionista/medico),
            // pulamos os campos PCD obrigatórios.
            $tipo = $request->input('tipo_usuario', TiposUsuario::Paciente->value);
            $ehPaciente = $tipo === TiposUsuario::Paciente->value;

            $necessitaAcompanhante = $request->boolean('necessita_acompanhante');
            $regraResponsavelObrigatorio = $ehPaciente && $necessitaAcompanhante ? 'required' : 'nullable';

            $regras = [
                'nome' => 'required|string',
                'cpf' => ($ehPaciente ? 'required' : 'nullable').'|string|unique:tbusuarios,cpf',
                'email' => 'required|string|email|unique:tbusuarios,email',
                'senha' => 'required|string|min:6',
                'telefone' => 'nullable|string',
                'tipo_usuario' => 'nullable|in:'.implode(',', array_column(TiposUsuario::cases(), 'value')),

                // Dados de paciente (obrigatórios só para paciente)
                'data_nascimento' => ($ehPaciente ? 'required' : 'nullable').'|date',
                'sexo' => ($ehPaciente ? 'required' : 'nullable').'|string',
                'possui_autismo' => ($ehPaciente ? 'required' : 'nullable').'|boolean',
                'necessita_acessibilidade' => ($ehPaciente ? 'required' : 'nullable').'|boolean',
                'usa_cadeira_rodas' => ($ehPaciente ? 'required' : 'nullable').'|boolean',
                'necessita_acompanhante' => ($ehPaciente ? 'required' : 'nullable').'|boolean',
                'observacoes' => 'nullable|string',
                'observacoes_comunicacao' => 'nullable|string',

                // Dados do responsável (criados inline quando o paciente
                // declara que necessita de acompanhante no autocadastro)
                'responsavel_nome' => $regraResponsavelObrigatorio.'|string|max:255',
                'responsavel_cpf' => 'nullable|string|max:20|unique:tbusuarios,cpf',
                'responsavel_email' => $regraResponsavelObrigatorio.'|string|email|max:255|unique:tbusuarios,email',
                'responsavel_telefone' => 'nullable|string|max:255',
                'responsavel_senha' => $regraResponsavelObrigatorio.'|string|min:6',
                'responsavel_parentesco' => $regraResponsavelObrigatorio.'|string|max:255',
                'responsavel_principal' => 'nullable|boolean',
            ];

            $validated = $request->validate($regras);

            $validated['senha'] = Hash::make($validated['senha']);
            $validated['tipo_usuario'] = $tipo;

            $result = $this->registerService->register($validated);

            if (! $result) {
                return response()->json([
                    'error' => true,
                    'message' => 'Erro ao cadastrar usuário.',
                ], 422);
            }

            return response()->json([
                'error' => false,
                'message' => 'Cadastro realizado com sucesso.',
                'data' => $result,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
