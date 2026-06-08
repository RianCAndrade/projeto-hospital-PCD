<?php

use App\Http\Middleware\EnsureSelfOrRole;
use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'self.or.role' => EnsureSelfOrRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Padroniza erros de autorização no envelope do projeto
        // (error/message/data) para requisições de API.
        $exceptions->render(function (AuthorizationException $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'error' => true,
                    'message' => $e->getMessage() ?: 'Acesso negado.',
                    'data' => null,
                ], 403);
            }
        });
    })->create();
