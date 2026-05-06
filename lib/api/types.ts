import type {
  Agendamento,
  Crianca,
  Especialidade,
  Medico,
  StatusConsulta,
  TipoDeficiencia,
  Usuario,
} from "../types"

/**
 * DTOs e contratos compartilhados entre a implementacao mock e a real.
 * Quando o backend Laravel estiver pronto, basta garantir que as rotas
 * retornem os mesmos shapes definidos aqui.
 */

export interface AuthResponse {
  usuario: Usuario
  token: string
}

export interface LoginDto {
  email: string
  senha: string
}

export interface RegisterDto {
  nome: string
  email: string
  telefone: string
  senha: string
  criancas: Omit<Crianca, "id">[]
}

export interface CreateAgendamentoDto {
  pacienteId: string
  pacienteNome: string
  criancaId: string
  criancaNome: string
  tipoDeficiencia: TipoDeficiencia
  medicoId: string
  medicoNome: string
  especialidade: Especialidade
  dataHora: string
  observacoes?: string
}

export interface CreateMedicoDto {
  nome: string
  email: string
  crm: string
  especialidade: Especialidade
  atendeDeficiencias: TipoDeficiencia[]
  disponivelHoje: boolean
}

export interface CreateFuncionarioDto {
  nome: string
  email: string
  telefone: string
  perfil: "recepcionista" | "admin" | "medico"
  cargo?: string
  especialidade?: Especialidade
  crm?: string
}

export interface AgendamentoFiltros {
  pacienteId?: string
  medicoId?: string
  status?: StatusConsulta
}

export interface MedicoFiltros {
  especialidade?: Especialidade
  deficiencia?: TipoDeficiencia
  disponivelHoje?: boolean
}

export interface BootstrapData {
  usuario: Usuario | null
  usuarios: Usuario[]
  medicos: Medico[]
  agendamentos: Agendamento[]
}

/**
 * Contrato unico de API consumido pelo frontend.
 * A implementacao mock e a real respeitam esta interface.
 */
export interface HospitalApi {
  auth: {
    login(dto: LoginDto): Promise<AuthResponse>
    register(dto: RegisterDto): Promise<AuthResponse>
    logout(): Promise<void>
    me(): Promise<Usuario | null>
  }
  /**
   * Carrega o estado inicial necessario para o app funcionar.
   * Em producao isso pode virar varias rotas separadas com paginacao.
   */
  bootstrap(): Promise<BootstrapData>
  agendamentos: {
    list(filtros?: AgendamentoFiltros): Promise<Agendamento[]>
    create(dto: CreateAgendamentoDto): Promise<Agendamento>
    updateStatus(id: string, status: StatusConsulta): Promise<Agendamento>
    cancel(id: string): Promise<Agendamento>
    reschedule(id: string, dataHora: string, medicoId?: string): Promise<Agendamento>
  }
  medicos: {
    list(filtros?: MedicoFiltros): Promise<Medico[]>
    create(dto: CreateMedicoDto): Promise<Medico>
    delete(id: string): Promise<void>
  }
  usuarios: {
    list(): Promise<Usuario[]>
    createFuncionario(dto: CreateFuncionarioDto): Promise<Usuario>
    delete(id: string): Promise<void>
  }
}
