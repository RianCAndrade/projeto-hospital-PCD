<?php

namespace App\Http\Controllers;

use App\Http\Service\RhService;
use Illuminate\Http\Request;

class RhController
{
    public function __construct(
        private RhService $rhService
    )
    {}

    public function index()
    {
        $result = $this->rhService->index();

        if($result === false){
            return response()->json([
                'error' => true,
                'message' => 'Erro ao buscar os medicos',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medicos encontrados',
            'data' => $result,
        ], 200);
    }
    public function show(int $id)
    {
        $result = $this->rhService->show($id);

        if(!$result){
            return response()->json([
                'error' => false,
                'message' => 'Medico não encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico encontrado',
            'data' => $result,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'senha' => 'required|string|max:255',
            'telefone' => 'required|string|max:255',
            // 'usuario_id' => 'required|integer',
            'crm' => 'required|string|max:255',
            'descricao' => 'required|string|max:255',
        ]);

        $result = $this->rhService->store($validated);

        if(!$result){
            return response()->json([
                'error' => true,
                'message' => 'Erro ao cadastrar medico',
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Medico cadastrado com sucesso',
            'data' => $result,
        ], 201);
    }

    
    public function update($id, Request $request)
    {
        //
    }

    public function destroy($id)
    {
        
    }
}