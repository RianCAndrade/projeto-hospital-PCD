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
  TipoUsuario,
  Usuario,
} from "../types"

/**
 * DTOs e contratos compartilhados entre a implementacao mock e a real.
 *
 * Status atual do backend Laravel (pasta `backend-hosp-pcd/`):
 *   ✓ POST /api/register   -> implementado em RegisterController
 *   - POST /api/login      -> arquivos existem, lógica pendente
 *   - POST /api/logout     -> pendente
 *   - GET  /api/me         -> pendente
 *   - Demais endpoints     -> migrações + models prontos, falta CRUD
 *
 * Quando o backend implementar cada rota, este arquivo já tem o shape
 * esperado, basta o Controller devolver no formato descrito.
 */

// ──────────────────────────────────────────────────────────────────────────
// Envelope padrão de resposta do backend
// ──────────────────────────────────────────────────────────────────────────

/**
 * Formato padrão de resposta usado por todos os endpoints do backend
 * (ver `RegisterController@register` como referência):
 *
 *   { error: false, message: "...", data: <payload> }   // sucesso
 *   { error: true,  message: "..." }                    // erro de domínio
 */
export interface BackendResponse<T> {
  error: boolean
  message: string
  data?: T
}

// ──────────────────────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────────────────────

/**
 * POST /api/register
 *
 * O backend valida exatamente esses campos
 * (ver `App\Http\Controllers\RegisterController::register`).
 * O campo `senha` é hasheado no controller antes de gravar.
 */
export interface RegisterDto {
  nome: string
  email: string
  telefone: string
  senha: string
  tipo_usuario: TipoUsuario
}

/**
 * POST /api/login   (a ser implementado pelo backend)
 *
 * Sugestão de payload — ajuste se o backend escolher outro formato.
 */
export interface LoginDto {
  email: string
  senha: string
}

/**
 * Resposta esperada de /login e (futuramente) /register quando o backend
 * passar a emitir token Sanctum.
 *
 * Hoje o /register devolve apenas `data: Usuario` sem token. O frontend
 * trata `token` como opcional e, na ausência dele, redireciona para login.
 */
export interface AuthResponse {
  usuario: Usuario
  token?: string
}

// ──────────────────────────────────────────────────────────────────────────
// Pacientes / Responsáveis  (endpoints a implementar)
// ──────────────────────────────────────────────────────────────────────────

/**
 * POST /api/pacientes
 *
 * Cadastra um paciente (criança PCD ou adulto).
 * Para crianças sem conta própria, o `usuario_id` deve ser `null` e o
 * vínculo é feito via `/api/responsaveis`.
 */
export interface CreatePacienteDto {
  usuario_id?: number | null
  nome: string
  data_nascimento: string // YYYY-MM-DD
  cpf?: string | null
  sexo: string
  possui_autismo?: boolean
  necessita_acessibilidade?: boolean
  usa_cadeira_rodas?: boolean
  necessita_acompanhante?: boolean
  observacoes?: string | null
  observacoes_comunicacao?: string | null
  /**
   * IDs de tipos_deficiencia a vincular no pivot tbpaciente_deficiencia.
   * Backend pode aceitar tanto inline quanto via endpoint separado.
   */
  tipo_deficiencia_ids?: number[]
}

export interface UpdatePacienteDto extends Partial<CreatePacienteDto> {}

/**
 * POST /api/responsaveis
 * Vincula um usuário (tipo_usuario = "responsavel") a um paciente.
 */
export interface CreateResponsavelDto {
  usuario_id: number
  paciente_id: number
  parentesco: string
  principal?: boolean
}

// ──────────────────────────────────────────────────────────────────────────
// Médicos  (endpoints a implementar)
// ──────────────────────────────────────────────────────────────────────────

/**
 * POST /api/medicos
 *
 * Cria/promove um usuário existente a médico, ou cria usuário+médico
 * em uma única transação (a critério do backend).
 */
export interface CreateMedicoDto {
  usuario_id?: number
  // Se `usuario_id` não vier, o backend pode criar o Usuario com:
  nome?: string
  email?: string
  telefone?: string | null
  senha?: string

  crm: string
  descricao?: string | null
  especialidade_ids: number[]
}

export interface UpdateMedicoDto {
  crm?: string
  descricao?: string | null
  especialidade_ids?: number[]
}

// ──────────────────────────────────────────────────────────────────────────
// Especialidades / Tipos de Deficiência (catálogos)
// ──────────────────────────────────────────────────────────────────────────

export interface CreateEspecialidadeDto {
  nome: string
}

export interface CreateTipoDeficienciaDto {
  nome: string
}

// ──────────────────────────────────────────────────────────────────────────
// Agendamentos
// ──────────────────────────────────────────────────────────────────────────

export interface CreateAgendamentoDto {
  paciente_id: number
  medico_id: number
  especialidade_id: number
  recepcionista_id?: number | null
  data_agendamento: string // YYYY-MM-DD
  horario: string // HH:mm
  observacoes?: string | null
}

export interface RescheduleAgendamentoDto {
  data_agendamento: string
  horario: string
  medico_id?: number
  especialidade_id?: number
}

export interface AgendamentoFiltros {
  paciente_id?: number
  medico_id?: number
  especialidade_id?: number
  status?: StatusAgendamento
  data_de?: string
  data_ate?: string
}

// ──────────────────────────────────────────────────────────────────────────
// Atendimentos
// ──────────────────────────────────────────────────────────────────────────

export interface CreateAtendimentoDto {
  agendamento_id: number
  medico_id: number
  status?: StatusAtendimento
  descricao?: string | null
  encaminhamento?: string | null
  receita?: string | null
  observacoes?: string | null
}

export interface UpdateAtendimentoDto {
  status?: StatusAtendimento
  descricao?: string | null
  encaminhamento?: string | null
  receita?: string | null
  observacoes?: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Senhas (fila de chamada)
// ──────────────────────────────────────────────────────────────────────────

export interface CreateSenhaDto {
  agendamento_id: number
  paciente_id: number
  /**
   * Se omitido, o backend gera o código (ex: A001, A002...).
   */
  codigo?: string
}

export interface UpdateSenhaStatusDto {
  status: StatusSenha
}

// ──────────────────────────────────────────────────────────────────────────
// Filtros simples para listagens
// ──────────────────────────────────────────────────────────────────────────

export interface MedicoFiltros {
  especialidade_id?: number
  tipo_deficiencia_id?: number
  disponivel_hoje?: boolean
}

export interface UsuarioFiltros {
  tipo_usuario?: TipoUsuario
  q?: string
}

// ──────────────────────────────────────────────────────────────────────────
// Bootstrap (carga inicial do app)
// ──────────────────────────────────────────────────────────────────────────

/**
 * GET /api/bootstrap   (a ser implementado)
 *
 * Carga conveniente do estado inicial. Em produção pode ser substituída
 * por requisições paralelas (`Promise.all`) ou rotas paginadas.
 */
export interface BootstrapData {
  usuario: Usuario | null
  usuarios: Usuario[]
  pacientes: Paciente[]
  responsaveis: ResponsavelPaciente[]
  medicos: Medico[]
  agendamentos: Agendamento[]
  especialidades: Especialidade[]
  tipos_deficiencia: TipoDeficiencia[]
}

// ──────────────────────────────────────────────────────────────────────────
// Contrato único de API consumido pelo frontend
// A implementação `mockApi` e `realApi` respeitam esta interface.
// ──────────────────────────────────────────────────────────────────────────
export interface HospitalApi {
  auth: {
    /** POST /api/register — implementado no backend */
    register(dto: RegisterDto): Promise<AuthResponse>
    /** POST /api/login — pendente no backend */
    login(dto: LoginDto): Promise<AuthResponse>
    /** POST /api/logout — pendente no backend */
    logout(): Promise<void>
    /** GET /api/me — pendente no backend */
    me(): Promise<Usuario | null>
  }

  bootstrap(): Promise<BootstrapData>

  pacientes: {
    list(): Promise<Paciente[]>
    get(id: number): Promise<Paciente>
    create(dto: CreatePacienteDto): Promise<Paciente>
    update(id: number, dto: UpdatePacienteDto): Promise<Paciente>
    delete(id: number): Promise<void>
    /** Pacientes vinculados ao usuário logado (filhos do responsável). */
    meusPacientes(): Promise<Paciente[]>
  }

  responsaveis: {
    create(dto: CreateResponsavelDto): Promise<ResponsavelPaciente>
    delete(id: number): Promise<void>
  }

  medicos: {
    list(filtros?: MedicoFiltros): Promise<Medico[]>
    get(id: number): Promise<Medico>
    create(dto: CreateMedicoDto): Promise<Medico>
    update(id: number, dto: UpdateMedicoDto): Promise<Medico>
    delete(id: number): Promise<void>
  }

  especialidades: {
    list(): Promise<Especialidade[]>
    create(dto: CreateEspecialidadeDto): Promise<Especialidade>
    delete(id: number): Promise<void>
  }

  tipos_deficiencia: {
    list(): Promise<TipoDeficiencia[]>
    create(dto: CreateTipoDeficienciaDto): Promise<TipoDeficiencia>
    delete(id: number): Promise<void>
  }

  agendamentos: {
    list(filtros?: AgendamentoFiltros): Promise<Agendamento[]>
    get(id: number): Promise<Agendamento>
    create(dto: CreateAgendamentoDto): Promise<Agendamento>
    updateStatus(id: number, status: StatusAgendamento): Promise<Agendamento>
    cancel(id: number): Promise<Agendamento>
    reschedule(id: number, dto: RescheduleAgendamentoDto): Promise<Agendamento>
  }

  atendimentos: {
    list(): Promise<Atendimento[]>
    get(id: number): Promise<Atendimento>
    create(dto: CreateAtendimentoDto): Promise<Atendimento>
    update(id: number, dto: UpdateAtendimentoDto): Promise<Atendimento>
  }

  senhas: {
    list(): Promise<Senha[]>
    create(dto: CreateSenhaDto): Promise<Senha>
    updateStatus(id: number, dto: UpdateSenhaStatusDto): Promise<Senha>
    /** Marca a senha como "chamada agora" (chamada_em = now). */
    chamar(id: number): Promise<Senha>
  }

  usuarios: {
    list(filtros?: UsuarioFiltros): Promise<Usuario[]>
    get(id: number): Promise<Usuario>
    delete(id: number): Promise<void>
  }
}
