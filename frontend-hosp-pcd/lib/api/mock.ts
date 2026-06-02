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

/**
 * Estado do mock persistido em localStorage para que múltiplas abas
 * (ex.: recepção confirma em uma aba, paciente em outra) enxerguem
 * a mudança sem precisar de backend real. Cada slice é salvo em uma
 * chave separada para minimizar o custo de serialização.
 */
const STORAGE_PREFIX = "acolher_mock_"
const STORAGE_KEYS = {
  usuarios: STORAGE_PREFIX + "usuarios",
  pacientes: STORAGE_PREFIX + "pacientes",
  responsaveis: STORAGE_PREFIX + "responsaveis",
  medicos: STORAGE_PREFIX + "medicos",
  especialidades: STORAGE_PREFIX + "especialidades",
  tipos_deficiencia: STORAGE_PREFIX + "tipos_deficiencia",
  agendamentos: STORAGE_PREFIX + "agendamentos",
  atendimentos: STORAGE_PREFIX + "atendimentos",
  senhas: STORAGE_PREFIX + "senhas",
  nextId: STORAGE_PREFIX + "nextId",
} as const

/**
 * Contador de IDs. Precisa ser declarado ANTES de `hidratarEstado` /
 * `persistirEstado` porque eles o leem/escrevem, e o módulo já tenta
 * hidratar no carregamento (linha mais abaixo) — caso contrário o
 * `let` ainda estaria no Temporal Dead Zone.
 */
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

function lerStorage<T>(chave: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(chave)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function escreverStorage<T>(chave: string, valor: T) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // localStorage pode estar cheio/bloqueado — silencioso
  }
}

/** Hidrata o estado em memória a partir do localStorage (se houver). */
function hidratarEstado() {
  usuariosState = lerStorage(STORAGE_KEYS.usuarios, usuariosState)
  pacientesState = lerStorage(STORAGE_KEYS.pacientes, pacientesState)
  responsaveisState = lerStorage(
    STORAGE_KEYS.responsaveis,
    responsaveisState,
  )
  medicosState = lerStorage(STORAGE_KEYS.medicos, medicosState)
  especialidadesState = lerStorage(
    STORAGE_KEYS.especialidades,
    especialidadesState,
  )
  tiposDeficienciaState = lerStorage(
    STORAGE_KEYS.tipos_deficiencia,
    tiposDeficienciaState,
  )
  agendamentosState = lerStorage(STORAGE_KEYS.agendamentos, agendamentosState)
  atendimentosState = lerStorage(STORAGE_KEYS.atendimentos, atendimentosState)
  senhasState = lerStorage(STORAGE_KEYS.senhas, senhasState)
  nextId = lerStorage(STORAGE_KEYS.nextId, nextId)
}

/** Salva todos os slices no localStorage. */
function persistirEstado() {
  escreverStorage(STORAGE_KEYS.usuarios, usuariosState)
  escreverStorage(STORAGE_KEYS.pacientes, pacientesState)
  escreverStorage(STORAGE_KEYS.responsaveis, responsaveisState)
  escreverStorage(STORAGE_KEYS.medicos, medicosState)
  escreverStorage(STORAGE_KEYS.especialidades, especialidadesState)
  escreverStorage(STORAGE_KEYS.tipos_deficiencia, tiposDeficienciaState)
  escreverStorage(STORAGE_KEYS.agendamentos, agendamentosState)
  escreverStorage(STORAGE_KEYS.atendimentos, atendimentosState)
  escreverStorage(STORAGE_KEYS.senhas, senhasState)
  escreverStorage(STORAGE_KEYS.nextId, nextId)
}

// Tenta hidratar já no carregamento do módulo (lado cliente)
if (typeof window !== "undefined") {
  hidratarEstado()

  // Sincronia entre abas: quando OUTRA aba grava no localStorage
  // (ex.: recepção confirma um agendamento), o evento `storage` dispara
  // automaticamente nesta aba. Re-hidratamos o estado em memória e
  // emitimos um evento customizado para a UI re-buscar o bootstrap.
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(STORAGE_PREFIX)) return
    hidratarEstado()
    window.dispatchEvent(new CustomEvent("acolher:mock-updated"))
  })
}

const SESSAO_KEY = "acolher_mock_session"

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

      const tipo = dto.tipo_usuario ?? "paciente"
      const ehPaciente = tipo === "paciente"
      const precisaResponsavel = !!dto.necessita_acompanhante

      // Validações espelhando o RegisterController:
      // CPF + dados PCD são obrigatórios SÓ para paciente.
      if (ehPaciente) {
        if (!dto.cpf) throw new ApiError(422, "O campo cpf é obrigatório.")
        if (!dto.data_nascimento)
          throw new ApiError(422, "O campo data_nascimento é obrigatório.")
        if (!dto.sexo) throw new ApiError(422, "O campo sexo é obrigatório.")
      }

      if (ehPaciente && precisaResponsavel) {
        if (!dto.responsavel_nome)
          throw new ApiError(422, "O campo responsavel_nome é obrigatório.")
        if (!dto.responsavel_email)
          throw new ApiError(422, "O campo responsavel_email é obrigatório.")
        if (!dto.responsavel_senha)
          throw new ApiError(422, "O campo responsavel_senha é obrigatório.")
        if (!dto.responsavel_parentesco)
          throw new ApiError(
            422,
            "O campo responsavel_parentesco é obrigatório.",
          )
      }

      if (
        usuariosState.some(
          (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
        )
      ) {
        throw new ApiError(422, "email ja cadastrado")
      }
      if (dto.cpf && usuariosState.some((u) => u.cpf === dto.cpf)) {
        throw new ApiError(422, "cpf ja cadastrado")
      }
      if (
        ehPaciente &&
        precisaResponsavel &&
        usuariosState.some(
          (u) =>
            u.email.toLowerCase() === dto.responsavel_email!.toLowerCase(),
        )
      ) {
        throw new ApiError(422, "responsavel email ja cadastrado")
      }

      const novo: Usuario = {
        id: gerarId("usuario"),
        nome: dto.nome,
        cpf: dto.cpf ?? null,
        email: dto.email,
        telefone: dto.telefone ?? null,
        tipo_usuario: tipo,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      usuariosState = [...usuariosState, novo]

      if (ehPaciente) {
        const novoPaciente: Paciente = {
          id: gerarId("paciente"),
          usuario_id: novo.id,
          nome: dto.nome,
          data_nascimento: dto.data_nascimento!,
          cpf: dto.cpf ?? null,
          sexo: dto.sexo!,
          possui_autismo: dto.possui_autismo ?? false,
          necessita_acessibilidade: dto.necessita_acessibilidade ?? false,
          usa_cadeira_rodas: dto.usa_cadeira_rodas ?? false,
          necessita_acompanhante: dto.necessita_acompanhante ?? false,
          observacoes: dto.observacoes ?? null,
          observacoes_comunicacao: dto.observacoes_comunicacao ?? null,
          created_at: nowISO(),
          updated_at: nowISO(),
          deficiencias: [],
        }
        pacientesState = [...pacientesState, novoPaciente]

        if (precisaResponsavel) {
          const novoResponsavelUsuario: Usuario = {
            id: gerarId("usuario"),
            nome: dto.responsavel_nome!,
            cpf: dto.responsavel_cpf ?? null,
            email: dto.responsavel_email!,
            telefone: dto.responsavel_telefone ?? null,
            tipo_usuario: "responsavel",
            created_at: nowISO(),
            updated_at: nowISO(),
          }
          usuariosState = [...usuariosState, novoResponsavelUsuario]

          const vinculo: ResponsavelPaciente = {
            id: gerarId("responsavel"),
            usuario_id: novoResponsavelUsuario.id,
            paciente_id: novoPaciente.id,
            parentesco: dto.responsavel_parentesco!,
            principal: dto.responsavel_principal ?? true,
            created_at: nowISO(),
            updated_at: nowISO(),
          }
          responsaveisState = [...responsaveisState, vinculo]
        }
      }

      persistirEstado()
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
    // Re-hidrata o estado a partir do localStorage a cada chamada,
    // garantindo que mudanças feitas em outras abas (recepção confirma
    // um agendamento, paciente cadastra, etc.) sejam enxergadas pelo
    // polling que o painel do paciente faz a cada 30s.
    hidratarEstado()
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
      persistirEstado()
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
      persistirEstado()
      return atualizado
    },
    async delete(id) {
      await delay(200)
      pacientesState = pacientesState.filter((p) => p.id !== id)
      persistirEstado()
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

      let usuarioId = dto.usuario_id

      // Modo 2: cria o usuário responsável inline
      if (!usuarioId) {
        if (!dto.nome || !dto.email || !dto.senha) {
          throw new ApiError(
            422,
            "Informe usuario_id ou os dados (nome, email, senha) do responsável.",
          )
        }
        if (
          usuariosState.some(
            (u) => u.email.toLowerCase() === dto.email!.toLowerCase(),
          )
        ) {
          throw new ApiError(422, "email ja cadastrado")
        }
        const novoUsuario: Usuario = {
          id: gerarId("usuario"),
          nome: dto.nome,
          cpf: dto.cpf ?? null,
          email: dto.email,
          telefone: dto.telefone ?? null,
          tipo_usuario: "responsavel",
          created_at: nowISO(),
          updated_at: nowISO(),
        }
        usuariosState = [...usuariosState, novoUsuario]
        usuarioId = novoUsuario.id
      }

      const novo: ResponsavelPaciente = {
        id: gerarId("responsavel"),
        usuario_id: usuarioId,
        paciente_id: dto.paciente_id,
        parentesco: dto.parentesco,
        principal: dto.principal ?? false,
        created_at: nowISO(),
        updated_at: nowISO(),
      }
      responsaveisState = [...responsaveisState, novo]
      persistirEstado()
      return novo
    },
    async delete(id) {
      await delay(150)
      responsaveisState = responsaveisState.filter((r) => r.id !== id)
      persistirEstado()
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
          cpf: dto.cpf ?? null,
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
          (dto.especialidade_ids ?? []).includes(e.id),
        ),
      }
      medicosState = [...medicosState, novo]
      persistirEstado()
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
      persistirEstado()
      return atualizado
    },
    async delete(id) {
      await delay(200)
      medicosState = medicosState.filter((m) => m.id !== id)
      persistirEstado()
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
      persistirEstado()
      return nova
    },
    async delete(id) {
      await delay(150)
      especialidadesState = especialidadesState.filter((e) => e.id !== id)
      persistirEstado()
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
      persistirEstado()
      return novo
    },
    async delete(id) {
      await delay(150)
      tiposDeficienciaState = tiposDeficienciaState.filter((t) => t.id !== id)
      persistirEstado()
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
      persistirEstado()
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
      persistirEstado()
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
      persistirEstado()
      return atualizado
    },
    /**
     * Espelha `AgendamentoService::chamar` do backend: exige
     * status `confirmado` e reverte outros `chamado` do mesmo
     * médico para `confirmado`.
     */
    async chamar(id) {
      await delay(200)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento não encontrado")
      if (ag.status !== "confirmado") {
        throw new ApiError(
          422,
          "Somente agendamentos confirmados podem ser chamados.",
        )
      }
      agendamentosState = agendamentosState.map((a) => {
        if (a.id === id) {
          return { ...a, status: "chamado", updated_at: nowISO() }
        }
        if (a.medico_id === ag.medico_id && a.status === "chamado") {
          return { ...a, status: "confirmado", updated_at: nowISO() }
        }
        return a
      })
      persistirEstado()
      const atualizado = agendamentosState.find((a) => a.id === id)
      if (!atualizado) throw new ApiError(404, "Agendamento não encontrado")
      return atualizado
    },
    /**
     * Espelha `AgendamentoService::iniciarAtendimento` do backend:
     * só permite a transição se o status atual for `chamado`.
     */
    async iniciar(id) {
      await delay(200)
      const ag = agendamentosState.find((a) => a.id === id)
      if (!ag) throw new ApiError(404, "Agendamento não encontrado")
      if (ag.status !== "chamado") {
        throw new ApiError(
          422,
          "Somente agendamentos chamados podem ser iniciados.",
        )
      }
      return mockApi.agendamentos.updateStatus(id, "em_atendimento")
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
      persistirEstado()
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
      persistirEstado()
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
      persistirEstado()
      return nova
    },
    async updateStatus(id: number, dto: UpdateSenhaStatusDto) {
      await delay(200)
      const s = senhasState.find((x) => x.id === id)
      if (!s) throw new ApiError(404, "Senha não encontrada")
      const atualizada: Senha = { ...s, status: dto.status, updated_at: nowISO() }
      senhasState = senhasState.map((x) => (x.id === id ? atualizada : x))
      persistirEstado()
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
      persistirEstado()
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
      persistirEstado()
    },
  },
}

// Tipos auxiliares para evitar imports não utilizados nos consumidores
export type { StatusAgendamento, StatusAtendimento, StatusSenha }
