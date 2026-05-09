export type StatusConsulta = "aguardando" | "em_atendimento" | "encerrado" | "cancelado"

export type Especialidade =
  | "Neuropediatria"
  | "Fonoaudiologia"
  | "Fisioterapia"
  | "Terapia Ocupacional"
  | "Psicologia Infantil"
  | "Pediatria Geral"
  | "Ortopedia Pediátrica"
  | "Oftalmologia Pediátrica"

export type TipoDeficiencia =
  | "Física"
  | "Intelectual"
  | "Auditiva"
  | "Visual"
  | "Múltipla"
  | "TEA (Autismo)"
  | "Síndrome de Down"
  | "Outra"

export type PerfilUsuario = "paciente" | "recepcionista" | "medico" | "admin"

export interface Crianca {
  id: string
  nome: string
  dataNascimento: string
  tipoDeficiencia: TipoDeficiencia
  observacoes?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  perfil: PerfilUsuario
  criancas?: Crianca[]
  // Apenas medicos
  especialidade?: Especialidade
  crm?: string
  // Apenas funcionarios
  cargo?: string
}

export interface Medico {
  id: string
  nome: string
  email: string
  crm: string
  especialidade: Especialidade
  atendeDeficiencias: TipoDeficiencia[]
  disponivelHoje: boolean
}

export interface Agendamento {
  id: string
  pacienteId: string
  pacienteNome: string
  criancaId: string
  criancaNome: string
  tipoDeficiencia: TipoDeficiencia
  medicoId: string
  medicoNome: string
  especialidade: Especialidade
  dataHora: string // ISO string
  status: StatusConsulta
  observacoes?: string
  criadoEm: string
}
