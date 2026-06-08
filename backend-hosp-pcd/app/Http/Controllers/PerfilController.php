<?php

namespace App\Http\Controllers;

use App\Enums\TiposUsuario;
use App\Http\Service\PerfilService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

class PerfilController
{
    public function __construct(
        private PerfilService $perfilService
    ) {}

    public function index(Request $request)
    {
        $result = $this->perfilService->index($request->user());

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Perfil do usuario não encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Perfil do usuario encontrado',
            'data' => $result,
        ], 200);
    }

    public function update(int $id, Request $request)
    {
        // Defesa em profundidade: o middleware `self.or.role:admin` já
        // bloqueia, mas mantemos a checagem aqui também caso o middleware
        // seja removido por engano.
        $this->garantirOwnership($request, $id);

        $dadosUpdate = $request->validate([
            'nome' => 'sometimes|required|string',
            'cpf' => 'sometimes|required|string|unique:tbusuarios,cpf,'.$id,
            'email' => 'sometimes|required|string|email|unique:tbusuarios,email,'.$id,
            'senha' => 'sometimes|required|string',
            'telefone' => 'sometimes|nullable|string',
            'data_nascimento' => 'sometimes|required|date',
            'sexo' => 'sometimes|required|string',
            'possui_autismo' => 'sometimes|required|boolean',
            'necessita_acessibilidade' => 'sometimes|required|boolean',
            'usa_cadeira_rodas' => 'sometimes|required|boolean',
            'necessita_acompanhante' => 'sometimes|required|boolean',
            'observacoes' => 'sometimes|nullable|string',
            'observacoes_comunicacao' => 'sometimes|nullable|string',
        ]);

        $result = $this->perfilService->update($id, $dadosUpdate);

        if (! $result) {
            return response()->json([
                'error' => true,
                'message' => 'Perfil do usuario não encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'message' => 'Perfil atualizado com sucesso',
            'data' => $result,
        ], 200);
    }

    public function destroy(int $id, Request $request)
    {
        $this->garantirOwnership($request, $id);

        $result = $this->perfilService->destroy($id);

        if ($result === false) {
            return response()->json([
                'error' => true,
                'message' => 'erro ao deletar o perfil',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'error' => false,
            'message' => 'Perfil excluído com sucesso',
            'data' => $result,
        ], 200);
    }

    private function garantirOwnership(Request $request, int $id): void
    {
        $user = $request->user();
        $userRole = $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;

        if ($user->id === $id) {
            return;
        }

        if ($userRole === TiposUsuario::Admin->value) {
            return;
        }

        throw new AuthorizationException(
            'Você só pode editar/excluir o seu próprio perfil.',
        );
    }
}
