/**
 * Ponto unico de entrada do cliente da API.
 *
 * Estrutura:
 *   - mock.ts  -> implementação em memória (fallback de desenvolvimento)
 *   - real.ts  -> implementação que consome o backend Laravel
 *   - types.ts -> contrato `HospitalApi` + DTOs
 *   - client.ts-> wrapper de fetch + token Sanctum + envelope handling
 *
 * Como ligar o Laravel real:
 *
 *   1. Crie um arquivo `.env.local` na raiz do projeto Next.js com:
 *        NEXT_PUBLIC_API_MODE=real
 *        NEXT_PUBLIC_API_URL=http://localhost:8000/api
 *
 *   2. Reinicie o `next dev`. O front passa a chamar o Laravel.
 *
 * Veja /lib/api/README.md para detalhes do estado atual do backend.
 */

import { mockApi } from "./mock"
import { realApi } from "./real"
import type { HospitalApi } from "./types"

const apiMode = (process.env.NEXT_PUBLIC_API_MODE ?? "mock").toLowerCase()

export const isUsingMockApi = apiMode !== "real"

export const api: HospitalApi = isUsingMockApi ? mockApi : realApi

export { ApiError } from "./client"
export type * from "./types"
