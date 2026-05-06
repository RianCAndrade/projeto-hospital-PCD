# Camada de API - Acolher

Este diretorio centraliza toda a comunicacao com o backend.
O frontend nunca chama `fetch` diretamente: ele consome o objeto `api`
exportado por `lib/api/index.ts`, que respeita a interface `HospitalApi`.

## Estrutura

```
lib/api/
  index.ts     <- escolhe entre mock e real conforme NEXT_PUBLIC_API_MODE
  types.ts     <- DTOs e contrato HospitalApi (compartilhado entre mock e real)
  client.ts    <- wrapper de fetch + gerencia token (Bearer / Sanctum)
  real.ts      <- implementacao que chama o Laravel
  mock.ts      <- implementacao em memoria usada para desenvolvimento
```

## Como ligar o Laravel (modo real)

1. Crie um arquivo `.env.local` na raiz do projeto Next.js:

   ```
   NEXT_PUBLIC_API_MODE=real
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. Garanta que o Laravel esteja com CORS liberado para a origem do front
   (em `config/cors.php` ou `bootstrap/app.php`).

3. Implemente as rotas listadas em `real.ts`. Sugestao de mapeamento:

   ```php
   // routes/api.php
   Route::post('/auth/login',    [AuthController::class, 'login']);
   Route::post('/auth/register', [AuthController::class, 'register']);

   Route::middleware('auth:sanctum')->group(function () {
       Route::post('/auth/logout', [AuthController::class, 'logout']);
       Route::get ('/auth/me',     [AuthController::class, 'me']);

       Route::get ('/bootstrap',   [BootstrapController::class, 'index']);

       Route::get   ('/agendamentos',                   [AgendamentoController::class, 'index']);
       Route::post  ('/agendamentos',                   [AgendamentoController::class, 'store']);
       Route::patch ('/agendamentos/{id}/status',       [AgendamentoController::class, 'updateStatus']);
       Route::patch ('/agendamentos/{id}/cancelar',     [AgendamentoController::class, 'cancel']);
       Route::patch ('/agendamentos/{id}/remarcar',     [AgendamentoController::class, 'reschedule']);

       Route::apiResource('medicos',  MedicoController::class)->only(['index','store','destroy']);
       Route::get   ('/usuarios',                       [UsuarioController::class, 'index']);
       Route::post  ('/usuarios/funcionarios',          [UsuarioController::class, 'storeFuncionario']);
       Route::delete('/usuarios/{id}',                  [UsuarioController::class, 'destroy']);
   });
   ```

4. Os shapes que o Laravel deve retornar estao em `lib/api/types.ts`
   e em `lib/types.ts`. Se voce quiser, podemos gerar os Resource
   classes do Laravel a partir desses tipos depois.

## Autenticacao

A implementacao real usa **Laravel Sanctum em modo token (Bearer)**.

- O Laravel deve responder ao login com `{ usuario, token }`.
- O frontend salva o token em `localStorage` (`acolher_token`).
- Todas as requisicoes seguintes enviam `Authorization: Bearer {token}`.

Se voce preferir Sanctum em modo SPA (cookies + CSRF), ajuste `client.ts`:

```ts
// remova o getToken/Authorization e habilite cookies:
fetch(url, { credentials: "include", ... })
// e adicione uma chamada inicial a /sanctum/csrf-cookie
```

## Como remover o modo mock (apos ter o Laravel pronto)

1. Apague `/lib/api/mock.ts`
2. Apague `/lib/mock-data.ts`
3. Edite `/lib/api/index.ts` deixando apenas:

   ```ts
   export { realApi as api } from "./real"
   export { ApiError } from "./client"
   export type * from "./types"
   export const isUsingMockApi = false
   ```

4. Em `/app/login/page.tsx`, remova o import de `credenciaisDemo`
   e o painel de "Contas de demonstracao" (ele so aparece em mock).

5. Defina `NEXT_PUBLIC_API_MODE=real` no ambiente.

## Como adicionar novos endpoints

1. Defina o DTO em `types.ts` e adicione o metodo na interface `HospitalApi`.
2. Implemente em `real.ts` chamando `apiFetch`.
3. Implemente em `mock.ts` mexendo no estado em memoria.
4. Use via `api.X.Y(...)` no `lib/store.tsx` ou diretamente em uma pagina.
