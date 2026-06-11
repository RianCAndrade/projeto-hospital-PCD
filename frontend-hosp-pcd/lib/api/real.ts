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
  CreateAdminUsuarioDto,
  CreateRhRecepcionistaDto,
} from "./types"

/**
 * Implementacao real, que consome o backend Laravel deste projeto
 * (`backend-hosp-pcd/`).
 *
 * Mapeamento de rotas (espelha `routes/api.php`):
 *
 *   ✓ POST /api/register                           (RegisterController)
 *   ✓ POST /api/login                              (LoginController)
 *   ✓ POST /api/logout                             (LogoutController)
 *   ✓ GET  /api/me                                 (MeController)
 *   ✓ GET  /api/bootstrap                          (BootstrapController)
 *
 *   ✓ GET    /api/pacientes                        (PacienteController)
 *   ✓ GET    /api/pacientes/{id}
 *   ✓ POST   /api/pacientes
 *   ✓ PUT    /api/pacientes/{id}
 *   ✓ DELETE /api/pacientes/{id}
 *   ✓ GET    /api/pacientes/meus
 *
 *   ✓ POST   /api/responsaveis                     (ResponsavelController)
 *   ✓ DELETE /api/responsaveis/{id}
 *   ✓ GET    /api/responsaveis
 *
 *   ✓ GET    /api/medicos                          (MedicoController)
 *   ✓ GET    /api/medicos/{id}
 *   ✓ POST   /api/medicos
 *   ✓ PUT    /api/medicos/{id}
 *   ✓ DELETE /api/medicos/{id}
 *
 *   ✓ GET    /api/especialidades                   (EspecialidadeController)
 *   ✓ POST   /api/especialidades
 *   ✓ DELETE /api/especialidades/{id}
 *
 *   ✓ GET    /api/tipos-deficiencia                (TipoDeficienciaController)
 *   ✓ POST   /api/tipos-deficiencia
 *   ✓ DELETE /api/tipos-deficiencia/{id}
 *
 *   ✓ GET    /api/agendamentos                     (AgendamentoController)
 *   ✓ GET    /api/agendamentos/{id}
 *   ✓ POST   /api/agendamentos
 *   ✓ PATCH  /api/agendamentos/{id}/status
 *   ✓ PATCH  /api/agendamentos/{id}/cancelar
 *   ✓ PATCH  /api/agendamentos/{id}/remarcar
 *   ✓ PATCH  /api/agendamentos/{id}/chamar
 *   ✓ PATCH  /api/agendamentos/{id}/iniciar
 *
 *   ✓ GET    /api/atendimentos                     (AtendimentoController)
 *   ✓ GET    /api/atendimentos/{id}
 *   ✓ POST   /api/atendimentos
 *   ✓ PUT    /api/atendimentos/{id}
 *
 *   ✓ GET    /api/senhas                           (SenhaController)
 *   ✓ POST   /api/senhas
 *   ✓ PATCH  /api/senhas/{id}/status
 *   ✓ PATCH  /api/senhas/{id}/chamar
 *
 *   ✓ GET    /api/usuarios                         (UsuarioController)
 *   ✓ GET    /api/usuarios/{id}
 *   ✓ DELETE /api/usuarios/{id}
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
     * POST /api/login
     *
     * Devolve:
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
    /**
     * PATCH /api/agendamentos/{id}/chamar
     *
     * Implementado em `AgendamentoController::chamar`. Reverte outros
     * `chamado` do mesmo médico para `confirmado` automaticamente.
     */
    chamar(id) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/chamar`, {
        method: "PATCH",
      })
    },
    /**
     * PATCH /api/agendamentos/{id}/iniciar
     *
     * Implementado em `AgendamentoController::iniciarAtendimento`.
     * Exige status `chamado` no servidor.
     */
    iniciar(id) {
      return apiFetch<Agendamento>(`/agendamentos/${id}/iniciar`, {
        method: "PATCH",
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

  admin: {
    storeUsuario(dto: CreateAdminUsuarioDto) {
      return apiFetch<Usuario>("/admin/usuarios", { method: "POST", body: dto })
    },
  },

  rh: {
    storeRecepcionista(dto: CreateRhRecepcionistaDto) {
      return apiFetch<Usuario>("/rh/recepcionistas", { method: "POST", body: dto })
    },
  },
}
