<?php

namespace App\Http\Controllers;

use App\Enums\TiposUsuario;
use App\Http\Service\RegisterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RegisterController
{
    public function __construct(
        private RegisterService $registerService
    ){}

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'nome' =>       'required|string',
                'cpf' =>        'required|string|unique:tbusuarios',
                'email' =>      'required|string|email|unique:tbusuarios',
                'senha' =>      'required|string',
                'telefone' =>   'nullable|string',
                'data_nascimento' =>            'required|date',
                'sexo' =>                       'required|string',
                'possui_autismo' =>             'required|boolean',
                'necessita_acessibilidade' =>   'required|boolean',
                'usa_cadeira_rodas' =>          'required|boolean',
                'necessita_acompanhante' =>     'required|boolean',
                'observacoes' =>                'nullable|string',
                'observacoes_comunicacao' =>    'nullable|string',
            ]);

            
            $validated['senha'] = Hash::make($validated['senha']);

            $result = $this->registerService->register($validated);

            if (!$result) {
                return response()->json([
                    'error' => true,
                    'message' => 'Erro ao cadastrar usuário'
                ], 422);
            }

        
            return response()->json([
                'error' => false,
                'message' => 'Cadastro realizado com sucesso',
                'data' => $result
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Erro inesperado ao cadastrar usuario ' . $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}