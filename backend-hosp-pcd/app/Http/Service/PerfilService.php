<?php

namespace App\Http\Service;

use App\Http\Repository\PerfilRespository;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class PerfilService
{
    public function __construct(
        private PerfilRespository $perfilRepository
    ) {}

    public function index(Usuario $user)
    {
        return $user->load('paciente');
    }

    public function update(int $id, array $user)
    {
        $campoPaciente = [];
        $campoUsuario = [];

        // Campos que existem nas duas tabelas
        foreach (['nome', 'cpf'] as $campo) {
            if (array_key_exists($campo, $user)) {
                $campoUsuario[$campo] = $user[$campo];
                $campoPaciente[$campo] = $user[$campo];
            }
        }

        // Campos que existem apenas na tabela do usuario
        foreach (['email', 'telefone'] as $campo) {
            if (array_key_exists($campo, $user)) {
                $campoUsuario[$campo] = $user[$campo];
            }

        }

        // Senha (com hash)
        if (array_key_exists('senha', $user)) {
            $campoUsuario['senha'] = Hash::make($user['senha']);
        }

        // $pacienteFields = [];
        // campos que existem apenas na tabela do paciente
        $pacienteFields = [
            'data_nascimento', 'sexo', 'possui_autismo',
            'necessita_acessibilidade', 'usa_cadeira_rodas',
            'necessita_acompanhante', 'observacoes', 'observacoes_comunicacao',
        ];

        foreach ($pacienteFields as $campo) {
            if (array_key_exists($campo, $user)) {
                $campoPaciente[$campo] = $user[$campo];
            }
        }

        // atualiza se tiver campos
        $updateUsuario = null;
        $updatePaciente = null;

        if (! empty($campoUsuario)) {
            $updateUsuario = $this->perfilRepository->updateUsuario($id, $campoUsuario);
        }

        if (! empty($campoPaciente)) {
            $updatePaciente = $this->perfilRepository->updatePaciente($id, $campoPaciente);
        }

        if (! $updateUsuario && ! $updatePaciente) {
            return null;
        }

        return Usuario::with('paciente')->find($id);
    }

    public function destroy(int $id)
    {
        $result = $this->perfilRepository->destroy($id);

        return $result;
    }
}
