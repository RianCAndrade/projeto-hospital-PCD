/**
 * HTTP client base usado pela implementacao real (Laravel).
 *
 * Configuracao via variaveis de ambiente:
 *   NEXT_PUBLIC_API_URL  -> URL base do Laravel, ex: http://localhost:8000/api
 *   NEXT_PUBLIC_API_MODE -> "mock" (padrao) ou "real"
 *
 * Autenticacao: utiliza Laravel Sanctum em modo token (Bearer).
 * Para Sanctum em modo cookie/SPA, troque os fetchs para enviar
 * `credentials: "include"` e remova o getToken/setToken.
 */

import type { BackendResponse } from "./types"

const TOKEN_KEY = "acolher_token"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  query?: Record<string, unknown>
}

/**
 * Faz a requisição crua e devolve o JSON sem desembrulhar envelope.
 *
 * Use esta função quando precisar do shape completo
 * `{ error, message, data? }` (por exemplo para mostrar `message`).
 *
 * Para o caso comum (só preciso do `data`), prefira `apiFetch`.
 */
export async function apiFetchRaw<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, query, headers, ...rest } = options

  let url = `${getApiBaseUrl()}${path}`
  if (query) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.set(k, String(v))
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const token = getToken()

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(0, "Falha de rede ao contatar a API", err)
  }

  if (response.status === 204) return undefined as T

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  if (!response.ok) {
    const message =
      (payload as { message?: string } | undefined)?.message ??
      `Erro ${response.status} - ${response.statusText}`
    throw new ApiError(response.status, message, payload)
  }

  return payload as T
}

/**
 * Faz a requisição e desembrulha o envelope padrão do backend
 * (`{ error, message, data }`), devolvendo apenas `data`.
 *
 * Lança `ApiError` quando `error: true`, mesmo que o HTTP venha 2xx
 * (o backend usa 422 nos casos de erro de domínio, mas é defensivo).
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const payload = await apiFetchRaw<BackendResponse<T> | T | undefined>(
    path,
    options,
  )

  if (payload === undefined) {
    return undefined as T
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    "message" in payload
  ) {
    const env = payload as BackendResponse<T>
    if (env.error) {
      throw new ApiError(422, env.message, env)
    }
    return (env.data as T) ?? (undefined as T)
  }

  // Resposta sem envelope: devolve como veio (compatibilidade).
  return payload as T
}
