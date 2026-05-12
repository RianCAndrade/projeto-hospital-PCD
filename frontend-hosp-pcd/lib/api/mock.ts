import type {
  Agendamento,
  Atendimento,
  Especialidade,
  Medico,
  Paciente,
  ResponsavelPaciente,
  Senha,
  StatusAgendamento,
  StatusAtendimento,
  StatusSenha,
  TipoDeficiencia,
  Usuario,
} from "../types"
import {
  agendamentosMock,
  especialidadesMock,
  medicosMock,
  pacientesMock,
  responsaveisMock,
  tiposDeficienciaMock,
  usuariosMock,
} from "../mock-data"
import { ApiError, setToken } from "./client"
import type {
  AuthResponse,
  CreateAgendamentoDto,
  CreateAtendimentoDto,
  CreateEspecialidadeDto,
  CreateMedicoDto,
  CreatePacienteDto,
  CreateResponsavelDto,
  CreateSenhaDto,
  CreateTipoDeficienciaDto,
  HospitalApi,
  LoginDto,
  RegisterDto,
  UpdateAtendimentoDto,
  UpdateMedicoDto,
  UpdatePacienteDto,
  UpdateSenhaStatusDto,
} from "./types"

/**
 * Implementacao mock - simula o backend Laravel usando dados em memória.
 *
 * Importante: respeita exatamente os mesmos shapes e nomes de campos
 * do backend (snake_case, IDs numéricos, etc), de modo que trocar para
 * `realApi` não exija mudança em página alguma.
 *
 * Para usar o backend real:
 *   NEXT_PUBLIC_API_MODE=real
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

let usuariosState: Usuario[] = [...usuariosMock]
let pacientesState: Paciente[] = [...pacientesMock]
let responsaveisState: ResponsavelPaciente[] = [...responsaveisMock]
let medicosState: Medico[] = [...medicosMock]
let especialidadesState: Especialidade[] = [...especialidadesMock]
let tiposDeficienciaState: TipoDeficiencia[] = [...tiposDeficienciaMock]
let agendamentosState: Agendamento[] = [...agendamentosMock]
let atendimentosState: Atendimento[] = []
let senhasState: Senha[] = []

const SESSAO_KEY = "acolher_mock_session"

let nextId: Record<string, number> = {
  usuario: 100,
  paciente: 100,
  responsavel: 100,
  medico: 100,
  especialidade: 100,
  tipo_deficiencia: 100,
  agendamento: 100,
  atendimento: 100,
  senha: 100,
}

function gerarId(entidade: keyof typeof nextId): number {
  nextId[entidade] += 1
  return nextId[entidade]
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function persistirSessao(usuarioId: number | null) {
  if (typeof window === "undefined") return
  if (usuarioId) {
    window.localStorage.setItem(SESSAO_KEY, String(usuarioId))
  } else {
    window.localStorage.removeItem(SESSAO_KEY)
  }
}

function lerSessao(): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(SESSAO_KEY)
  return raw ? Number(raw) : null
}

function nowISO(): string {
  return new Date().toISOString()
}

export const mockApi: HospitalApi = {
  auth: {
    /**
     * Espelha o comportamento real do `RegisterController`:
     * cria usuário e devolve apenas os dados — SEM token.
     * O frontend redireciona para /login após sucesso.
     */
    async register(dto: RegisterDto) {
      await delay(400)
      if (
        usuariosState.some(
          (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
        )
      ) {
        throw new ApiError(422, "email ja cadastrado")
      }
      const novo: Usuario = {
        id: gerarId("usuario"),
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        tipo_usuario: dto.tipo_usuario,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      usuariosState = [...usuariosState, novo]
      return { usuario: novo } satisfies AuthResponse
    },

    /**
     * Endpoint pendente no backend — mock aceita qualquer senha
     * e devolve um token fake para manter a UI funcional.
     */
    async login(dto: LoginDto) {
      await delay(400)
      const usuario = usuariosState.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
      )
      if (!usuario) {
        throw new ApiError(401, "Email ou senha invalidos")
      }
      const token = `mock-token-${usuario.id}`
      setToken(token)
      persistirSessao(usuario.id)
      return { usuario, token } satisfies AuthResponse
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
      pacientes: [...pacientesState],
      responsaveis: [...responsaveisState],
      medicos: [...medicosState],
      agendamentos: [...agendamentosState],
      especialidades: [...especialidadesState],
      tipos_deficiencia: [...tiposDeficienciaState],
    }
  },

  pacientes: {
    async list() {
      await delay(150)
      return [...pacientesState]
    },
    async get(id) {
      await delay(120)
      const p = pacientesState.find((x) => x.id === id)
      if (!p) throw new ApiError(404, "Paciente não encontrado")
      return p
    },
    async create(dto: CreatePacienteDto) {
      await delay(300)
      const novo: Paciente = {
        id: gerarId("paciente"),
        usuario_id: dto.usuario_id ?? null,
        nome: dto.nome,
        data_nascimento: dto.data_nascimento,
        cpf: dto.cpf ?? null,
        sexo: dto.sexo,
        possui_autismo: dto.possui_autismo ?? false,
        necessita_acessibilidade: dto.necessita_acessibilidade ?? false,
        usa_cadeira_rodas: dto.usa_cadeira_rodas ?? false,
        necessita_acompanhante: dto.necessita_acompanhante ?? false,
        observacoes: dto.observacoes ?? null,
        observacoes_comunicacao: dto.observacoes_comunicacao ?? null,
        created_at: nowISO(),
        updated_at: nowISO(),
        deficiencias: (dto.tipo_deficiencia_ids ?? []).map((tid) => ({
          paciente_id: 0, // será preenchido após
          tipo_deficiencia_id: tid,
          observacoes: null,
        })),
      }
      novo.deficiencias = novo.deficiencias?.map((d) => ({
        ...d,
        paciente_id: novo.id,
      }))
      pacientesState = [...pacientesState, novo]
      return novo
    },
    async update(id, dto: UpdatePacienteDto) {
      await delay(200)
      const idx = pacientesState.findIndex((p) => p.id === id)
      if (idx === -1) throw new ApiError(404, "Paciente não encontrado")
      const atualizado: Paciente = {
        ...pacientesState[idx],
        ...dto,
        updated_at: nowISO(),
      }
      pacientesState = pacientesState.map((p) => (p.id === id ? atualizado : p))
      return atualizado
    },
    async delete(id) {
      await delay(200)
      pacientesState = pacientesState.filter((p) => p.id !== id)
    },
    async meusPacientes() {
      await delay(150)
      const idLogado = lerSessao()
      if (!idLogado) return []
      const ids = responsaveisState
        .filter((r) => r.usuario_id === idLogado)
        .map((r) => r.paciente_id)
      return pacientesState.filter((p) => ids.includes(p.id))
    },
  },

  responsaveis: {
    async create(dto: CreateResponsavelDto) {
      await delay(250)
      const novo: ResponsavelPaciente = {
        id: gerarId("responsavel"),
        usuario_id: dto.usuario_id,
        paciente_id: dto.paciente_id,
        parentesco: dto.parentesco,
        principal: dto.principal ?? false,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      responsaveisState = [...responsaveisState, novo]
      return novo
    },
    async delete(id) {
      await delay(150)
      responsaveisState = responsaveisState.filter((r) => r.id !== id)
    },
  },

  medicos: {
    async list(filtros) {
      await delay(150)
      let lista = [...medicosState]
      if (filtros?.especialidade_id) {
        lista = lista.filter((m) =>
          m.especialidades?.some((e) => e.id === filtros.especialidade_id),
        )
      }
      return lista
    },
    async get(id) {
      await delay(120)
      const m = medicosState.find((x) => x.id === id)
      if (!m) throw new ApiError(404, "Médico não encontrado")
      return m
    },
    async create(dto: CreateMedicoDto) {
      await delay(300)
      let usuarioId = dto.usuario_id
      if (!usuarioId) {
        if (!dto.nome || !dto.email) {
          throw new ApiError(
            422,
            "Para criar médico sem usuario_id é preciso nome e email.",
          )
        }
        const novoUsuario: Usuario = {
          id: gerarId("usuario"),
          nome: dto.nome,
          email: dto.email,
          telefone: dto.telefone ?? null,
          tipo_usuario: "medico",
          created_at: nowISO(),
          updated_at: nowISO(),
        }
        usuariosState = [...usuariosState, novoUsuario]
        usuarioId = novoUsuario.id
      }
      const novo: Medico = {
        id: gerarId("medico"),
        usuario_id: usuarioId,
        crm: dto.crm,
        descricao: dto.descricao ?? null,
        created_at: nowISO(),
        updated_at: nowISO(),
        especialidades: especialidadesState.filter((e) =>
          dto.especialidade_ids.includes(e.id),
        ),
      }
      medicosState = [...medicosState, novo]
      return novo
    },
    async update(id, dto: UpdateMedicoDto) {
      await delay(200)
      const idx = medicosState.findIndex((m) => m.id === id)
      if (idx === -1) throw new ApiError(404, "Médico não encontrado")
      const atualizado: Medico = {
        ...medicosState[idx],
        crm: dto.crm ?? medicosState[idx].crm,
        descricao: dto.descricao ?? medicosState[idx].descricao,
        especialidades: dto.especialidade_ids
          ? especialidadesState.filter((e) =>
              dto.especialidade_ids!.includes(e.id),
            )
          : medicosState[idx].especialidades,
        updated_at: nowISO(),
      }
      medicosState = medicosState.map((m) => (m.id === id ? atualizado : m))
      return atualizado
    },
    async delete(id) {
      await delay(200)
      medicosState = medicosState.filter((m) => m.id !== id)
    },
  },

  especialidades: {
    async list() {
      await delay(120)
      return [...especialidadesState]
    },
    async create(dto: CreateEspecialidadeDto) {
      await delay(200)
      const nova: Especialidade = {
        id: gerarId("especialidade"),
        nome: dto.nome,
      }
      especialidadesState = [...especialidadesState, nova]
      return nova
    },
    async delete(id) {
      await delay(150)
      especialidadesState = especialidadesState.filter((e) => e.id !== id)
    },
  },

  tipos_deficiencia: {
    async list() {
      await delay(120)
      return [...tiposDeficienciaState]
    },
    async create(dto: CreateTipoDeficienciaDto) {
      await delay(200)
      const novo: TipoDeficiencia = {
        id: gerarId("tipo_deficiencia"),
        nome: dto.nome,
      }
      tiposDeficienciaState = [...tiposDeficienciaState, novo]
      return novo
    },
    async delete(id) {
      await delay(150)
      tiposDeficienciaState = tiposDeficienciaState.filter((t) => t.id !== id)
    },
  },

  agendamentos: {
    async list(filtros) {
      await delay(150)
      let lista = [...agendamentosState]
      if (filtros?.paciente_id)
        lista = lista.filter((a) => a.paciente_id === filtros.paciente_id)
      if (filtros?.medico_id)
        lista = lista.filter((a) => a.medico_id === filtros.medico_id)
      if (filtros?.especialidade_id)
        lista = lista.filter(
          (a) => a.especialidade_id === filtros.especialidade_id,
        )
      if (filtros?.status)
        lista = lista.filter((a) => a.status === filtros.status)
      return lista
    },
    async get(id) {
      await delay(120)
      const a = agendamentosState.find((x) => x.id === id)
      if (!a) throw new ApiError(404, "Agendamento não encontrado")
      return a
    },
    async create(dto: CreateAgendamentoDto) {
      await delay(300)
      const novo: Agendamento = {
        id: gerarId("agendamento"),
        paciente_id: dto.paciente_id,
        medico_id: dto.medico_id,
        especialidade_id: dto.especialidade_id,
        recepcionista_id: dto.recepcionista_id ?? null,
        data_agendamento: dto.data_agendamento,
        horario: dto.horario.length === 5 ? `${dto.horario}:00` : dto.horario,
        status: "agendado",
        observacoes: dto.observacoes ?? null,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      agendamentosState = [novo, ...agendamentosState]
      return novo
    },
    async updateStatus(id: number, status: StatusAgendamento) {
      await delay(200)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento não encontrado")
      const atualizado = { ...ag, status, updated_at: nowISO() }
      agendamentosState = agendamentosState.map((a) =>
        a.id === id ? atualizado : a,
      )
      return atualizado
    },
    async cancel(id) {
      await delay(200)
      return mockApi.agendamentos.updateStatus(id, "cancelado")
    },
    async reschedule(id, dto) {
      await delay(300)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento não encontrado")
      const atualizado: Agendamento = {
        ...ag,
        data_agendamento: dto.data_agendamento,
        horario: dto.horario.length === 5 ? `${dto.horario}:00` : dto.horario,
        medico_id: dto.medico_id ?? ag.medico_id,
        especialidade_id: dto.especialidade_id ?? ag.especialidade_id,
        status: "agendado",
        updated_at: nowISO(),
      }
      agendamentosState = agendamentosState.map((a) =>
        a.id === id ? atualizado : a,
      )
      return atualizado
    },
  },

  atendimentos: {
    async list() {
      await delay(150)
      return [...atendimentosState]
    },
    async get(id) {
      await delay(120)
      const a = atendimentosState.find((x) => x.id === id)
      if (!a) throw new ApiError(404, "Atendimento não encontrado")
      return a
    },
    async create(dto: CreateAtendimentoDto) {
      await delay(300)
      const novo: Atendimento = {
        id: gerarId("atendimento"),
        agendamento_id: dto.agendamento_id,
        medico_id: dto.medico_id,
        registrado_por_id: lerSessao(),
        status: dto.status ?? "nao_atendido",
        descricao: dto.descricao ?? null,
        encaminhamento: dto.encaminhamento ?? null,
        receita: dto.receita ?? null,
        observacoes: dto.observacoes ?? null,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      atendimentosState = [novo, ...atendimentosState]
      return novo
    },
    async update(id, dto: UpdateAtendimentoDto) {
      await delay(200)
      const idx = atendimentosState.findIndex((a) => a.id === id)
      if (idx === -1) throw new ApiError(404, "Atendimento não encontrado")
      const atualizado: Atendimento = {
        ...atendimentosState[idx],
        ...dto,
        updated_at: nowISO(),
      }
      atendimentosState = atendimentosState.map((a) =>
        a.id === id ? atualizado : a,
      )
      return atualizado
    },
  },

  senhas: {
    async list() {
      await delay(150)
      return [...senhasState]
    },
    async create(dto: CreateSenhaDto) {
      await delay(250)
      const codigo =
        dto.codigo ??
        `A${String(senhasState.length + 1).padStart(3, "0")}`
      const nova: Senha = {
        id: gerarId("senha"),
        codigo,
        agendamento_id: dto.agendamento_id,
        paciente_id: dto.paciente_id,
        status: "ativa",
        chamada_em: null,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      senhasState = [...senhasState, nova]
      return nova
    },
    async updateStatus(id: number, dto: UpdateSenhaStatusDto) {
      await delay(200)
      const s = senhasState.find((x) => x.id === id)
      if (!s) throw new ApiError(404, "Senha não encontrada")
      const atualizada: Senha = { ...s, status: dto.status, updated_at: nowISO() }
      senhasState = senhasState.map((x) => (x.id === id ? atualizada : x))
      return atualizada
    },
    async chamar(id) {
      await delay(200)
      const s = senhasState.find((x) => x.id === id)
      if (!s) throw new ApiError(404, "Senha não encontrada")
      const atualizada: Senha = {
        ...s,
        chamada_em: nowISO(),
        updated_at: nowISO(),
      }
      senhasState = senhasState.map((x) => (x.id === id ? atualizada : x))
      return atualizada
    },
  },

  usuarios: {
    async list(filtros) {
      await delay(150)
      let lista = [...usuariosState]
      if (filtros?.tipo_usuario) {
        lista = lista.filter((u) => u.tipo_usuario === filtros.tipo_usuario)
      }
      if (filtros?.q) {
        const q = filtros.q.toLowerCase()
        lista = lista.filter(
          (u) =>
            u.nome.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q),
        )
      }
      return lista
    },
    async get(id) {
      await delay(120)
      const u = usuariosState.find((x) => x.id === id)
      if (!u) throw new ApiError(404, "Usuário não encontrado")
      return u
    },
    async delete(id) {
      await delay(200)
      usuariosState = usuariosState.filter((u) => u.id !== id)
    },
  },
}

// Tipos auxiliares para evitar imports não utilizados nos consumidores
export type { StatusAgendamento, StatusAtendimento, StatusSenha }
