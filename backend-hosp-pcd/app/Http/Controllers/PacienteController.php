<?php

namespace App\Http\Controllers;

use App\Http\Service\PacienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PacienteController
{
    public function __construct(private PacienteService $pacienteService) {}

    public function index(): JsonResponse
    {
        $pacientes = $this->pacienteService->index();

        return response()->json([
            'error' => false,
            'message' => 'Lista de pacientes carregada.',
            'data' => $pacientes,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'usuario_id' => 'nullable|exists:tbusuarios,id',
            'nome' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'cpf' => 'nullable|string|max:20|unique:tbpacientes,cpf',
            'sexo' => 'required|string|max:20',
            'possui_autismo' => 'sometimes|boolean',
            'necessita_acessibilidade' => 'sometimes|boolean',
            'usa_cadeira_rodas' => 'sometimes|boolean',
            'necessita_acompanhante' => 'sometimes|boolean',
            'observacoes' => 'nullable|string',
            'observacoes_comunicacao' => 'nullable|string',
            'tipo_deficiencia_ids' => 'nullable|array',
            'tipo_deficiencia_ids.*' => 'integer|exists:tbtipos_deficiencia,id',
        ]);

        $paciente = $this->pacienteService->store($dados);

        return response()->json([
            'error' => false,
            'message' => 'Paciente cadastrado com sucesso.',
            'data' => $paciente,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $paciente = $this->pacienteService->show($id);

        if (! $paciente) {
            return response()->json([
                'error' => true,
                'message' => 'Paciente nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Paciente encontrado.',
            'data' => $paciente,
        ], 200);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $paciente = $this->pacienteService->show($id);

        if (! $paciente) {
            return response()->json([
                'error' => true,
                'message' => 'Paciente nao encontrado.',
                'data' => null,
            ], 404);
        }

        $dados = $request->validate([
            'usuario_id' => 'nullable|exists:tbusuarios,id',
            'nome' => 'sometimes|required|string|max:255',
            'data_nascimento' => 'sometimes|required|date',
            'cpf' => 'sometimes|nullable|string|max:20|unique:tbpacientes,cpf,'.$id,
            'sexo' => 'sometimes|required|string|max:20',
            'possui_autismo' => 'sometimes|boolean',
            'necessita_acessibilidade' => 'sometimes|boolean',
            'usa_cadeira_rodas' => 'sometimes|boolean',
            'necessita_acompanhante' => 'sometimes|boolean',
            'observacoes' => 'nullable|string',
            'observacoes_comunicacao' => 'nullable|string',
            'tipo_deficiencia_ids' => 'sometimes|array',
            'tipo_deficiencia_ids.*' => 'integer|exists:tbtipos_deficiencia,id',
        ]);

        $paciente = $this->pacienteService->update($id, $dados);

        return response()->json([
            'error' => false,
            'message' => 'Paciente atualizado com sucesso.',
            'data' => $paciente,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletado = $this->pacienteService->destroy($id);

        if (! $deletado) {
            return response()->json([
                'error' => true,
                'message' => 'Paciente nao encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Paciente removido com sucesso.',
            'data' => null,
        ], 200);
    }

    public function meusPacientes(Request $request): JsonResponse
    {
        $pacientes = $this->pacienteService->meusPacientes($request->user()->id);

        return response()->json([
            'error' => false,
            'message' => 'Lista de pacientes carregada.',
            'data' => $pacientes,
        ], 200);
    }
}
