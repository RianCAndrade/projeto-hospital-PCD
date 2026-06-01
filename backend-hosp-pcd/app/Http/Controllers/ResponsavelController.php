<?php

namespace App\Http\Controllers;

use App\Models\ResponsavelPaciente;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResponsavelController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:tbpacientes,id',
            'parentesco' => 'required|string|max:255',
            'principal' => 'sometimes|boolean',
            'usuario_id' => 'nullable|exists:tbusuarios,id',
            'nome' => 'required_without:usuario_id|string|max:255',
            'cpf' => 'nullable|string|max:20|unique:tbusuarios,cpf',
            'email' => 'required_without:usuario_id|string|email|max:255|unique:tbusuarios,email',
            'telefone' => 'nullable|string|max:255',
            'senha' => 'required_without:usuario_id|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            if (! empty($validated['usuario_id'])) {
                $usuarioId = $validated['usuario_id'];
            } else {
                $usuario = Usuario::create([
                    'nome' => $validated['nome'],
                    'cpf' => $validated['cpf'] ?? null,
                    'email' => $validated['email'],
                    'telefone' => $validated['telefone'] ?? null,
                    'senha' => Hash::make($validated['senha']),
                    'tipo_usuario' => 'responsavel',
                ]);
                $usuarioId = $usuario->id;
            }

            $vinculo = ResponsavelPaciente::create([
                'usuario_id' => $usuarioId,
                'paciente_id' => $validated['paciente_id'],
                'parentesco' => $validated['parentesco'],
                'principal' => $validated['principal'] ?? false,
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Responsável vinculado com sucesso.',
                'data' => $vinculo,
            ], 201);
        });
    }

    public function destroy(int $id): JsonResponse
    {
        $vinculo = ResponsavelPaciente::find($id);

        if (! $vinculo) {
            return response()->json([
                'error' => true,
                'message' => 'Vínculo não encontrado.',
                'data' => null,
            ], 404);
        }

        $vinculo->delete();

        return response()->json([
            'error' => false,
            'message' => 'Vínculo removido com sucesso.',
            'data' => null,
        ], 200);
    }

    public function index(): JsonResponse
    {
        $vinculos = ResponsavelPaciente::with(['usuario', 'paciente'])->get();

        return response()->json([
            'error' => false,
            'message' => 'Lista de responsáveis carregada.',
            'data' => $vinculos,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $vinculo = ResponsavelPaciente::with(['usuario', 'paciente'])->find($id);

        if (! $vinculo) {
            return response()->json([
                'error' => true,
                'message' => 'Vínculo não encontrado.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Vínculo encontrado.',
            'data' => $vinculo,
        ], 200);
    }
}
