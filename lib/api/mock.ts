import type { Agendamento, Medico, StatusConsulta, Usuario } from "../types"
import { agendamentosMock, medicosMock, usuariosMock } from "../mock-data"
import { ApiError, setToken } from "./client"
import type {
  AuthResponse,
  CreateAgendamentoDto,
  CreateFuncionarioDto,
  CreateMedicoDto,
  HospitalApi,
  LoginDto,
  RegisterDto,
} from "./types"

/**
 * Implementacao mock - simula o backend usando dados em memoria.
 *
 * Para usar a API real do Laravel:
 *   1. Configure NEXT_PUBLIC_API_MODE=real e NEXT_PUBLIC_API_URL no .env
 *   2. Voce pode deletar este arquivo e o ../mock-data.ts se nao quiser
 *      mais o modo mock - basta ajustar lib/api/index.ts conforme o
 *      README.md desta pasta.
 */

// Estado mutavel em memoria (so existe enquanto a aba estiver aberta)
let usuariosState: Usuario[] = [...usuariosMock]
let medicosState: Medico[] = [...medicosMock]
let agendamentosState: Agendamento[] = [...agendamentosMock]

const SESSAO_KEY = "acolher_mock_session"

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function persistirSessao(usuarioId: string | null) {
  if (typeof window === "undefined") return
  if (usuarioId) {
    window.localStorage.setItem(SESSAO_KEY, usuarioId)
  } else {
    window.localStorage.removeItem(SESSAO_KEY)
  }
}

function lerSessao(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(SESSAO_KEY)
}

function gerarId(prefixo: string) {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export const mockApi: HospitalApi = {
  auth: {
    async login(dto: LoginDto) {
      await delay(400)
      const usuario = usuariosState.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
      )
      if (!usuario) {
        throw new ApiError(401, "Email ou senha invalidos")
      }
      // No mock, qualquer senha e aceita.
      const token = `mock-token-${usuario.id}`
      setToken(token)
      persistirSessao(usuario.id)
      return { usuario, token } satisfies AuthResponse
    },

    async register(dto: RegisterDto) {
      await delay(500)
      if (usuariosState.some((u) => u.email.toLowerCase() === dto.email.toLowerCase())) {
        throw new ApiError(409, "Este email ja esta cadastrado")
      }
      const novo: Usuario = {
        id: gerarId("user"),
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        perfil: "paciente",
        criancas: dto.criancas.map((c, i) => ({
          ...c,
          id: gerarId(`c-${i}`),
        })),
      }
      usuariosState = [...usuariosState, novo]
      const token = `mock-token-${novo.id}`
      setToken(token)
      persistirSessao(novo.id)
      return { usuario: novo, token } satisfies AuthResponse
    },

    async logout() {
      await delay(150)
      setToken(null)
      persistirSessao(null)
    },

    async me() {
      await delay(100)
      const id = lerSessao()
      if (!id) return null
      return usuariosState.find((u) => u.id === id) ?? null
    },
  },

  async bootstrap() {
    await delay(200)
    const id = lerSessao()
    const usuario = id ? usuariosState.find((u) => u.id === id) ?? null : null
    return {
      usuario,
      usuarios: [...usuariosState],
      medicos: [...medicosState],
      agendamentos: [...agendamentosState],
    }
  },

  agendamentos: {
    async list(filtros) {
      await delay(150)
      let lista = [...agendamentosState]
      if (filtros?.pacienteId) lista = lista.filter((a) => a.pacienteId === filtros.pacienteId)
      if (filtros?.medicoId) lista = lista.filter((a) => a.medicoId === filtros.medicoId)
      if (filtros?.status) lista = lista.filter((a) => a.status === filtros.status)
      return lista
    },

    async create(dto: CreateAgendamentoDto) {
      await delay(300)
      const novo: Agendamento = {
        ...dto,
        id: gerarId("ag"),
        status: "aguardando",
        criadoEm: new Date().toISOString(),
      }
      agendamentosState = [novo, ...agendamentosState]
      return novo
    },

    async updateStatus(id: string, status: StatusConsulta) {
      await delay(200)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento nao encontrado")
      const atualizado = { ...ag, status }
      agendamentosState = agendamentosState.map((a) => (a.id === id ? atualizado : a))
      return atualizado
    },

    async cancel(id: string) {
      await delay(200)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento nao encontrado")
      const atualizado: Agendamento = { ...ag, status: "cancelado" }
      agendamentosState = agendamentosState.map((a) => (a.id === id ? atualizado : a))
      return atualizado
    },

    async reschedule(id: string, dataHora: string, medicoId?: string) {
      await delay(300)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento nao encontrado")
      let atualizado: Agendamento = { ...ag, dataHora, status: "aguardando" }
      if (medicoId) {
        const med = medicosState.find((m) => m.id === medicoId)
        if (med) {
          atualizado = {
            ...atualizado,
            medicoId: med.id,
            medicoNome: med.nome,
            especialidade: med.especialidade,
          }
        }
      }
      agendamentosState = agendamentosState.map((a) => (a.id === id ? atualizado : a))
      return atualizado
    },
  },

  medicos: {
    async list(filtros) {
      await delay(150)
      let lista = [...medicosState]
      if (filtros?.especialidade) lista = lista.filter((m) => m.especialidade === filtros.especialidade)
      if (filtros?.deficiencia) {
        lista = lista.filter((m) => m.atendeDeficiencias.includes(filtros.deficiencia!))
      }
      if (filtros?.disponivelHoje !== undefined) {
        lista = lista.filter((m) => m.disponivelHoje === filtros.disponivelHoje)
      }
      return lista
    },

    async create(dto: CreateMedicoDto) {
      await delay(300)
      const novo: Medico = { ...dto, id: gerarId("med") }
      medicosState = [...medicosState, novo]
      return novo
    },

    async delete(id: string) {
      await delay(200)
      medicosState = medicosState.filter((m) => m.id !== id)
    },
  },

  usuarios: {
    async list() {
      await delay(150)
      return [...usuariosState]
    },

    async createFuncionario(dto: CreateFuncionarioDto) {
      await delay(300)
      const novo: Usuario = { ...dto, id: gerarId("user") }
      usuariosState = [...usuariosState, novo]
      return novo
    },

    async delete(id: string) {
      await delay(200)
      usuariosState = usuariosState.filter((u) => u.id !== id)
    },
  },
}
