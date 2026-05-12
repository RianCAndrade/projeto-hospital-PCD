# Camada de API — Acolher

Toda a comunicação com o backend Laravel passa por este diretório.
O frontend nunca chama `fetch` direto: usa o objeto `api` exportado
em `lib/api/index.ts`, que respeita o contrato `HospitalApi`.

## Estrutura

```
lib/api/
  index.ts     <- escolhe entre mock e real conforme NEXT_PUBLIC_API_MODE
  types.ts     <- DTOs + contrato HospitalApi (compartilhado)
  client.ts    <- fetch wrapper, token Sanctum, envelope { error, message, data }
  real.ts      <- implementação que consome o Laravel
  mock.ts      <- implementação em memória para desenvolvimento
```

## Estado atual do backend Laravel (`backend-hosp-pcd/`)

### ✅ Implementado

| Método | Rota              | Controller                       |
|--------|-------------------|----------------------------------|
| POST   | `/api/register`   | `RegisterController@register`    |

Body aceito por `/register`:
```json
{
  "nome": "Marina Oliveira",
  "email": "marina@email.com",
  "telefone": "(11) 98888-1111",
  "senha": "...",
  "tipo_usuario": "responsavel"
}
```

`tipo_usuario` ∈ `admin | recepcionista | medico | responsavel | paciente`
(ver `App\Enums\TiposUsuario`).

Resposta de sucesso (`201`):
```json
{ "error": false, "message": "Cadastro realizado com sucesso", "data": { ...usuario } }
```

Resposta de erro (`422`):
```json
{ "error": true, "message": "email ja cadastrado" }
```

### ⏳ Pendente no backend (frontend já está pronto)

Auth:
- `POST /api/login`
- `POST /api/logout` (auth:sanctum)
- `GET  /api/me` (auth:sanctum)
- `GET  /api/bootstrap`

Recursos (todos sob `auth:sanctum`):
- Pacientes — `/api/pacientes` (CRUD + `/meus`)
- Responsáveis — `/api/responsaveis`
- Médicos — `/api/medicos`
- Especialidades — `/api/especialidades`
- Tipos de deficiência — `/api/tipos-deficiencia`
- Agendamentos — `/api/agendamentos` (+ `/status`, `/cancelar`, `/remarcar`)
- Atendimentos — `/api/atendimentos`
- Senhas — `/api/senhas` (+ `/status`, `/chamar`)
- Usuários — `/api/usuarios`

Os shapes esperados estão em `lib/types.ts` (modelos) e em
`lib/api/types.ts` (DTOs e envelope `BackendResponse<T>`).

## Como ligar o backend real

1. `.env.local` na raiz do `frontend-hosp-pcd`:
   ```
   NEXT_PUBLIC_API_MODE=real
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. Garanta CORS liberado para a origem do front no Laravel
   (`config/cors.php`).

3. Reinicie o `next dev`. Pronto — o front passa a chamar o Laravel.

## Convenções de resposta

Todas as rotas devem usar o envelope que o `RegisterController` já
inaugurou. Os controllers novos podem seguir o mesmo padrão:

```php
return response()->json([
    'error'   => false,
    'message' => 'OK',
    'data'    => $payload,
], 200);
```

O `apiFetch` (em `client.ts`) desembrulha automaticamente: a
camada de páginas só recebe o `data`. Quando vier `error: true`,
ele lança `ApiError` com a `message` original.

## Autenticação

Sanctum em modo **token (Bearer)**.

- O `/login` deve responder com `{ usuario, token }`.
- O frontend salva o token em `localStorage` (`acolher_token`).
- Toda requisição autenticada envia `Authorization: Bearer {token}`.

Se preferir Sanctum em modo SPA (cookie + CSRF), ajuste
`client.ts` para usar `credentials: "include"` e remova o
`getToken/Authorization`.

## Como adicionar um endpoint novo

1. Defina o DTO em `types.ts` e adicione o método na interface
   `HospitalApi`.
2. Implemente em `real.ts` chamando `apiFetch`.
3. Implemente em `mock.ts` mexendo no estado em memória.
4. Use via `api.X.Y(...)` na página ou no `lib/store.tsx`.

## Como remover o modo mock (quando o Laravel estiver completo)

1. Apague `/lib/api/mock.ts` e `/lib/mock-data.ts`.
2. Edite `/lib/api/index.ts` deixando só:
   ```ts
   export { realApi as api } from "./real"
   export { ApiError } from "./client"
   export type * from "./types"
   export const isUsingMockApi = false
   ```
3. Remova o painel "Contas de demonstração" da página de login
   (e o import de `credenciaisDemo`).
4. Defina `NEXT_PUBLIC_API_MODE=real` no ambiente.
