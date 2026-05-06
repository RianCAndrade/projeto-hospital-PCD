/**
 * Ponto unico de entrada do cliente da API.
 *
 * Como trocar entre mock e Laravel real:
 *
 *   1. Crie um arquivo .env.local na raiz do projeto com:
 *        NEXT_PUBLIC_API_MODE=real
 *        NEXT_PUBLIC_API_URL=http://localhost:8000/api
 *
 *   2. (Opcional) Para remover totalmente o modo mock do bundle:
 *        - apague /lib/api/mock.ts
 *        - apague /lib/mock-data.ts
 *        - troque o conteudo deste arquivo por:
 *            export { realApi as api } from "./real"
 *            export type { HospitalApi } from "./types"
 *        - remova o import de credenciaisDemo em /app/login/page.tsx
 *
 * Veja /lib/api/README.md para o passo a passo completo.
 */

import { mockApi } from "./mock"
import { realApi } from "./real"
import type { HospitalApi } from "./types"

const apiMode = (process.env.NEXT_PUBLIC_API_MODE ?? "mock").toLowerCase()

export const isUsingMockApi = apiMode !== "real"

export const api: HospitalApi = isUsingMockApi ? mockApi : realApi

export { ApiError } from "./client"
export type * from "./types"
