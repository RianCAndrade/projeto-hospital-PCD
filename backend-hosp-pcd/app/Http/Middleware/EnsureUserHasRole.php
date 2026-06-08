<?php

namespace App\Http\Middleware;

use App\Enums\TiposUsuario;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe uma rota a um conjunto de papéis (tipo_usuario).
 *
 * Uso em routes/api.php:
 *   Route::middleware('role:admin')->group(...)
 *   Route::middleware('role:admin,rh')->group(...)
 *
 * Quando o usuário autenticado não está na lista, responde 403 com o
 * envelope padrão do projeto: { error, message, data: null }.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => true,
                'message' => 'Não autenticado.',
                'data' => null,
            ], 401);
        }

        $userRole = $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;

        if (! in_array($userRole, $roles, true)) {
            return response()->json([
                'error' => true,
                'message' => 'Acesso restrito a: '.implode(', ', $roles).'.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
