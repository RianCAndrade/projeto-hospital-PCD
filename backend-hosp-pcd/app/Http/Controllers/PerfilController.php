<?php

namespace App\Http\Controllers;

use App\Http\Service\PerfilService;
use Illuminate\Http\Request;

class PerfilController
{
    public function __construct(
        private PerfilService $perfilService
    ){}

    public function index(Request $request)
    {
        $result = $this->perfilService->index($request->user());

        if(!$result){
            return response()->json([
                'error' => true,
                'message' => 'Perfil do usuario não encontrado',
                'data' => null,
            ]);
        }
        
        return response()->json([
            'error' => false,
            'message' => 'Perfil do usuario encontrado',
            'data' => $result,
        ], 200);
    }

    public function update(Request $request)
    {
        $dadosUpdate =  $request->validate([
                            'nome' =>       'sometimes|required|string',
                            'cpf' =>   'sometimes|required|string|unique:tbusuarios,cpf,' . $request->user()->id,
                            'email' => 'sometimes|required|string|email|unique:tbusuarios,email,' . $request->user()->id,
                            'senha' =>      'sometimes|required|string',
                            'telefone' =>   'sometimes|nullable|string',
                            // 'tipo_usuario' => Rule::in(TiposUsuario::Paciente),
                            'data_nascimento' =>            'sometimes|required|date',
                            'sexo' =>                       'sometimes|required|string',
                            'possui_autismo' =>             'sometimes|required|boolean',
                            'necessita_acessibilidade' =>   'sometimes|required|boolean',
                            'usa_cadeira_rodas' =>          'sometimes|required|boolean',
                            'necessita_acompanhante' =>     'sometimes|required|boolean',
                            'observacoes' =>                'sometimes|nullable|string',
                            'observacoes_comunicacao' =>    'sometimes|nullable|string',
                        ]);

        $result = $this->perfilService->update($request->user(), $dadosUpdate);

        if(!$result){
            return response()->json([
                'error' => true,
                'message' => 'Perfil do usuario não encontrado',
                'data' => null,
            ]);
        }
        
        return response()->json([
            'error' => false,
            'message' => 'Perfil atualizado com sucesso',
            'data' => $result,
        ], 200);
    }

    public function destroy(Request $request)
    {
        // $result = $this->perfilService->destroy($request->user());

        // if(!$result){
        //     return response()->json([
        //         'error' => true,
        //         'message' => 'Perfil do usuario não encontrado',
        //         'data' => null,
        //     ]);
        // }
        
        // return response()->json([
        //     'error' => false,
        //     'message' => 'Perfil excluído com sucesso',
        //     'data' => $result,
        // ], 200);
    }
}