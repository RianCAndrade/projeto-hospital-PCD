import type { Agendamento, Medico, Usuario } from "../types"
import { apiFetch, setToken } from "./client"
import type {
  AuthResponse,
  BootstrapData,
  HospitalApi,
} from "./types"

/**
 * Implementacao real, pronta para consumir o backend Laravel.
 *
 * Endpoints esperados (sugestao):
 *
 *   POST   /auth/login                         -> AuthResponse
 *   POST   /auth/register                      -> AuthResponse
 *   POST   /auth/logout                        -> 204
 *   GET    /auth/me                            -> Usuario
 *
 *   GET    /bootstrap                          -> BootstrapData
 *
 *   GET    /agendamentos?filtros               -> Agendamento[]
 *   POST   /agendamentos                       -> Agendamento
 *   PATCH  /agendamentos/{id}/status           -> Agendamento
 *   PATCH  /agendamentos/{id}/cancelar         -> Agendamento
 *   PATCH  /agendamentos/{id}/remarcar         -> Agendamento
 *
 *   GET    /medicos?filtros                    -> Medico[]
 *   POST   /medicos                            -> Medico
 *   DELETE /medicos/{id}                       -> 204
 *
 *   GET    /usuarios                           -> Usuario[]
 *   POST   /usuarios/funcionarios              -> Usuario
 *   DELETE /usuarios/{id}                      -> 204
 */
export const realApi: HospitalApi = {
  auth: {
    async login(dto) {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: dto,
      })
      setToken(res.token)
      return res
    },
    async register(dto) {
      const res = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: dto,
      })
      setToken(res.token)
      return res
    },
    async logout() {
      try {
        await apiFetch<void>("/auth/logout", { method: "POST" })
      } finally {
        setToken(null)
      }
    },
    async me() {
      try {
        return await apiFetch<Usuario>("/auth/me")
      } catch {
        return null
      }
    },
  },

  async bootstrap() {
    return apiFetch<BootstrapData>("/bootstrap")
  },

  agendamentos: {
    async list(filtros) {
      return apiFetch<Agendamento[]>("/agendamentos", { query: filtros })
    },
    async create(dto) {
      return apiFetch<Agendamento>("/agendamentos", {
        method: "POST",
        body: dto,
      })
    },
    async updateStatus(id, status) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/status`, {
        method: "PATCH",
        body: { status },
      })
    },
    async cancel(id) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/cancelar`, {
        method: "PATCH",
      })
    },
    async reschedule(id, dataHora, medicoId) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/remarcar`, {
        method: "PATCH",
        body: { dataHora, medicoId },
      })
    },
  },

  medicos: {
    async list(filtros) {
      return apiFetch<Medico[]>("/medicos", { query: filtros })
    },
    async create(dto) {
      return apiFetch<Medico>("/medicos", { method: "POST", body: dto })
    },
    async delete(id) {
      await apiFetch<void>(`/medicos/${id}`, { method: "DELETE" })
    },
  },

  usuarios: {
    async list() {
      return apiFetch<Usuario[]>("/usuarios")
    },
    async createFuncionario(dto) {
      return apiFetch<Usuario>("/usuarios/funcionarios", {
        method: "POST",
        body: dto,
      })
    },
    async delete(id) {
      await apiFetch<void>(`/usuarios/${id}`, { method: "DELETE" })
    },
  },
}
