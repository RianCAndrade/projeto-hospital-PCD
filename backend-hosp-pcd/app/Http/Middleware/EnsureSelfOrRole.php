<?php

namespace App\Http\Middleware;

use App\Enums\TiposUsuario;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Permite acesso quando o {id} da rota bate com o usuário autenticado,
 * OU quando o usuário tem um dos papéis privilegiados.
 *
 * Uso em routes/api.php:
 *   Route::put('/perfil/{id}', ...)->middleware('self.or.role:admin');
 *   Route::get('/usuarios/{id}', ...)->middleware('self.or.role:admin,rh');
 *
 * O parâmetro de rota procurado é "id" (default). Se a rota usar nome
 * diferente (ex.: usuario), é só sobrescrever via $routeParam.
 */
class EnsureSelfOrRole
{
    public function handle(
        Request $request,
        Closure $next,
        string $roles = '',
        string $routeParam = 'id',
    ): Response {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => true,
                'message' => 'Não autenticado.',
                'data' => null,
            ], 401);
        }

        $targetId = (int) $request->route($routeParam);
        $allowedRoles = array_filter(array_map('trim', explode(',', $roles)));

        $userRole = $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;

        $isSelf = $user->id === $targetId;
        $hasPrivilegedRole = in_array($userRole, $allowedRoles, true);

        if (! $isSelf && ! $hasPrivilegedRole) {
            return response()->json([
                'error' => true,
                'message' => 'Você só pode acessar seu próprio recurso.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
