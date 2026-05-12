import type {
  Agendamento,
  Atendimento,
  Especialidade,
  Medico,
  Paciente,
  ResponsavelPaciente,
  Senha,
  TipoDeficiencia,
  Usuario,
} from "../types"
import { apiFetch, setToken } from "./client"
import type {
  AuthResponse,
  BootstrapData,
  HospitalApi,
} from "./types"

/**
 * Implementacao real, que consome o backend Laravel deste projeto
 * (`backend-hosp-pcd/`).
 *
 * Mapeamento de rotas (espelha `routes/api.php` + plano de expansão):
 *
 *   ✓ POST /api/register                           (RegisterController)
 *   - POST /api/login                              (a implementar)
 *   - POST /api/logout                             (auth:sanctum)
 *   - GET  /api/me                                 (auth:sanctum)
 *
 *   - GET  /api/bootstrap                          (a implementar)
 *
 *   - GET    /api/pacientes                        (auth:sanctum)
 *   - GET    /api/pacientes/{id}
 *   - POST   /api/pacientes
 *   - PUT    /api/pacientes/{id}
 *   - DELETE /api/pacientes/{id}
 *   - GET    /api/pacientes/meus                   (filhos do logado)
 *
 *   - POST   /api/responsaveis
 *   - DELETE /api/responsaveis/{id}
 *
 *   - GET    /api/medicos
 *   - GET    /api/medicos/{id}
 *   - POST   /api/medicos
 *   - PUT    /api/medicos/{id}
 *   - DELETE /api/medicos/{id}
 *
 *   - GET    /api/especialidades
 *   - POST   /api/especialidades
 *   - DELETE /api/especialidades/{id}
 *
 *   - GET    /api/tipos-deficiencia
 *   - POST   /api/tipos-deficiencia
 *   - DELETE /api/tipos-deficiencia/{id}
 *
 *   - GET    /api/agendamentos
 *   - GET    /api/agendamentos/{id}
 *   - POST   /api/agendamentos
 *   - PATCH  /api/agendamentos/{id}/status
 *   - PATCH  /api/agendamentos/{id}/cancelar
 *   - PATCH  /api/agendamentos/{id}/remarcar
 *
 *   - GET    /api/atendimentos
 *   - GET    /api/atendimentos/{id}
 *   - POST   /api/atendimentos
 *   - PUT    /api/atendimentos/{id}
 *
 *   - GET    /api/senhas
 *   - POST   /api/senhas
 *   - PATCH  /api/senhas/{id}/status
 *   - PATCH  /api/senhas/{id}/chamar
 *
 *   - GET    /api/usuarios
 *   - GET    /api/usuarios/{id}
 *   - DELETE /api/usuarios/{id}
 *
 * Convenções compartilhadas:
 *   - Toda resposta usa o envelope `{ error, message, data }` (apiFetch
 *     desembrulha automaticamente — ver `client.ts`).
 *   - Autenticação: Sanctum em modo token (Bearer). O token é salvo em
 *     localStorage assim que o backend passar a devolvê-lo no login.
 *   - Datas: `data_agendamento` em `YYYY-MM-DD`, `horario` em `HH:mm`,
 *     timestamps em ISO-8601 conforme o Laravel emite por padrão.
 */
export const realApi: HospitalApi = {
  auth: {
    /**
     * POST /api/register
     *
     * Implementado em `App\Http\Controllers\RegisterController`.
     * Hoje devolve `{ error, message, data: Usuario }` SEM token.
     * O frontend redireciona para /login depois do cadastro.
     */
    async register(dto) {
      const usuario = await apiFetch<Usuario>("/register", {
        method: "POST",
        body: dto,
      })
      return { usuario } satisfies AuthResponse
    },

    /**
     * POST /api/login   (pendente no backend)
     *
     * Quando implementado, deve devolver:
     *   { error: false, message: "...", data: { usuario, token } }
     * O token é Sanctum (Bearer) e fica salvo em localStorage.
     */
    async login(dto) {
      const res = await apiFetch<AuthResponse>("/login", {
        method: "POST",
        body: dto,
      })
      if (res.token) setToken(res.token)
      return res
    },

    async logout() {
      try {
        await apiFetch<void>("/logout", { method: "POST" })
      } finally {
        setToken(null)
      }
    },

    async me() {
      try {
        return await apiFetch<Usuario>("/me")
      } catch {
        return null
      }
    },
  },

  async bootstrap() {
    return apiFetch<BootstrapData>("/bootstrap")
  },

  pacientes: {
    list() {
      return apiFetch<Paciente[]>("/pacientes")
    },
    get(id) {
      return apiFetch<Paciente>(`/pacientes/${id}`)
    },
    create(dto) {
      return apiFetch<Paciente>("/pacientes", { method: "POST", body: dto })
    },
    update(id, dto) {
      return apiFetch<Paciente>(`/pacientes/${id}`, {
        method: "PUT",
        body: dto,
      })
    },
    async delete(id) {
      await apiFetch<void>(`/pacientes/${id}`, { method: "DELETE" })
    },
    meusPacientes() {
      return apiFetch<Paciente[]>("/pacientes/meus")
    },
  },

  responsaveis: {
    create(dto) {
      return apiFetch<ResponsavelPaciente>("/responsaveis", {
        method: "POST",
        body: dto,
      })
    },
    async delete(id) {
      await apiFetch<void>(`/responsaveis/${id}`, { method: "DELETE" })
    },
  },

  medicos: {
    list(filtros) {
      return apiFetch<Medico[]>("/medicos", { query: { ...filtros } })
    },
    get(id) {
      return apiFetch<Medico>(`/medicos/${id}`)
    },
    create(dto) {
      return apiFetch<Medico>("/medicos", { method: "POST", body: dto })
    },
    update(id, dto) {
      return apiFetch<Medico>(`/medicos/${id}`, { method: "PUT", body: dto })
    },
    async delete(id) {
      await apiFetch<void>(`/medicos/${id}`, { method: "DELETE" })
    },
  },

  especialidades: {
    list() {
      return apiFetch<Especialidade[]>("/especialidades")
    },
    create(dto) {
      return apiFetch<Especialidade>("/especialidades", {
        method: "POST",
        body: dto,
      })
    },
    async delete(id) {
      await apiFetch<void>(`/especialidades/${id}`, { method: "DELETE" })
    },
  },

  tipos_deficiencia: {
    list() {
      return apiFetch<TipoDeficiencia[]>("/tipos-deficiencia")
    },
    create(dto) {
      return apiFetch<TipoDeficiencia>("/tipos-deficiencia", {
        method: "POST",
        body: dto,
      })
    },
    async delete(id) {
      await apiFetch<void>(`/tipos-deficiencia/${id}`, { method: "DELETE" })
    },
  },

  agendamentos: {
    list(filtros) {
      return apiFetch<Agendamento[]>("/agendamentos", { query: { ...filtros } })
    },
    get(id) {
      return apiFetch<Agendamento>(`/agendamentos/${id}`)
    },
    create(dto) {
      return apiFetch<Agendamento>("/agendamentos", {
        method: "POST",
        body: dto,
      })
    },
    updateStatus(id, status) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/status`, {
        method: "PATCH",
        body: { status },
      })
    },
    cancel(id) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/cancelar`, {
        method: "PATCH",
      })
    },
    reschedule(id, dto) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/remarcar`, {
        method: "PATCH",
        body: dto,
      })
    },
  },

  atendimentos: {
    list() {
      return apiFetch<Atendimento[]>("/atendimentos")
    },
    get(id) {
      return apiFetch<Atendimento>(`/atendimentos/${id}`)
    },
    create(dto) {
      return apiFetch<Atendimento>("/atendimentos", {
        method: "POST",
        body: dto,
      })
    },
    update(id, dto) {
      return apiFetch<Atendimento>(`/atendimentos/${id}`, {
        method: "PUT",
        body: dto,
      })
    },
  },

  senhas: {
    list() {
      return apiFetch<Senha[]>("/senhas")
    },
    create(dto) {
      return apiFetch<Senha>("/senhas", { method: "POST", body: dto })
    },
    updateStatus(id, dto) {
      return apiFetch<Senha>(`/senhas/${id}/status`, {
        method: "PATCH",
        body: dto,
      })
    },
    chamar(id) {
      return apiFetch<Senha>(`/senhas/${id}/chamar`, { method: "PATCH" })
    },
  },

  usuarios: {
    list(filtros) {
      return apiFetch<Usuario[]>("/usuarios", { query: { ...filtros } })
    },
    get(id) {
      return apiFetch<Usuario>(`/usuarios/${id}`)
    },
    async delete(id) {
      await apiFetch<void>(`/usuarios/${id}`, { method: "DELETE" })
    },
  },
}
