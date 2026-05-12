/**
 * Tipos de domínio do frontend.
 *
 * Esses tipos espelham os modelos do backend Laravel
 * (`backend-hosp-pcd/app/Models/*`) e os Enums em `app/Enums/*`.
 * Mantêm os mesmos nomes de campos (snake_case) que o backend
 * devolve nos JSONs, para evitar mapeamento dois-a-dois.
 *
 * Tabelas do backend (referência rápida):
 *   tbusuarios, tbpacientes, tbresponsavel_paciente, tbmedicos,
 *   tbespecialidades, tbmedico_especialidade, tbagendamentos,
 *   tbatendimentos, tbsenhas, tbtipos_deficiencia, tbpaciente_deficiencia.
 */

// ──────────────────────────────────────────────────────────────────────────
// Enums (espelham app/Enums/*.php)
// ──────────────────────────────────────────────────────────────────────────

/** App\Enums\TiposUsuario */
export type TipoUsuario =
  | "admin"
  | "recepcionista"
  | "medico"
  | "responsavel"
  | "paciente"

/** App\Enums\StatusAgendamento */
export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "cancelado"
  | "finalizado"
  | "faltou"

/** App\Enums\StatusAtendimento */
export type StatusAtendimento =
  | "nao_atendido"
  | "em_atendimento"
  | "atendido"
  | "nao_compareceu"
  | "cancelado"

/** App\Enums\StatusSenha */
export type StatusSenha = "ativa" | "utilizada" | "expirada" | "cancelada"

// ──────────────────────────────────────────────────────────────────────────
// Catálogos abertos (cadastrados em tabelas próprias no backend)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Nome da especialidade. No backend é uma linha em `tbespecialidades`,
 * usamos `string` aqui para refletir que é um catálogo dinâmico.
 */
export type NomeEspecialidade = string

/**
 * Nome do tipo de deficiência. No backend é uma linha em
 * `tbtipos_deficiencia`. Mantido como `string` por ser dinâmico.
 */
export type NomeTipoDeficiencia = string

// ──────────────────────────────────────────────────────────────────────────
// Modelos
// ──────────────────────────────────────────────────────────────────────────

/** App\Models\Usuario  (tabela tbusuarios) */
export interface Usuario {
  id: number
  nome: string
  email: string
  telefone: string | null
  tipo_usuario: TipoUsuario
  created_at?: string
  updated_at?: string

  // Relações eager-loaded opcionais (quando o backend usar `with`)
  paciente?: Paciente
  medico?: Medico
  responsavel_de?: Paciente[]
}

/** App\Models\Paciente  (tabela tbpacientes) */
export interface Paciente {
  id: number
  usuario_id: number | null
  nome: string
  data_nascimento: string // YYYY-MM-DD
  cpf: string | null
  sexo: string
  possui_autismo: boolean
  necessita_acessibilidade: boolean
  usa_cadeira_rodas: boolean
  necessita_acompanhante: boolean
  observacoes: string | null
  observacoes_comunicacao: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  // Relações
  usuario?: Usuario | null
  responsaveis?: ResponsavelPaciente[]
  deficiencias?: PacienteDeficiencia[]
}

/** App\Models\ResponsavelPaciente  (tabela tbresponsavel_paciente) */
export interface ResponsavelPaciente {
  id: number
  usuario_id: number
  paciente_id: number
  parentesco: string
  principal: boolean
  created_at?: string
  updated_at?: string

  usuario?: Usuario
  paciente?: Paciente
}

/** App\Models\Especialidade  (tabela tbespecialidades) */
export interface Especialidade {
  id: number
  nome: NomeEspecialidade
  created_at?: string
  updated_at?: string
}

/** App\Models\Medico  (tabela tbmedicos) */
export interface Medico {
  id: number
  usuario_id: number
  crm: string
  descricao: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  usuario?: Usuario
  especialidades?: Especialidade[]
}

/** App\Models\Agendamento  (tabela tbagendamentos) */
export interface Agendamento {
  id: number
  paciente_id: number
  medico_id: number
  especialidade_id: number
  recepcionista_id: number | null
  data_agendamento: string // YYYY-MM-DD
  horario: string // HH:mm:ss
  status: StatusAgendamento
  observacoes: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  // Relações
  paciente?: Paciente
  medico?: Medico
  especialidade?: Especialidade
  recepcionista?: Usuario | null
  atendimento?: Atendimento | null
  senha?: Senha | null
}

/** App\Models\Atendimento  (tabela tbatendimentos) */
export interface Atendimento {
  id: number
  agendamento_id: number
  medico_id: number
  registrado_por_id: number | null
  status: StatusAtendimento
  descricao: string | null
  encaminhamento: string | null
  receita: string | null
  observacoes: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  agendamento?: Agendamento
  medico?: Medico
  registrado_por?: Usuario | null
}

/** App\Models\Senha  (tabela tbsenhas) */
export interface Senha {
  id: number
  codigo: string
  agendamento_id: number
  paciente_id: number
  status: StatusSenha
  chamada_em: string | null
  created_at?: string
  updated_at?: string

  agendamento?: Agendamento
  paciente?: Paciente
}

/** App\Models\TipoDeficiencia  (tabela tbtipos_deficiencia) */
export interface TipoDeficiencia {
  id: number
  nome: NomeTipoDeficiencia
  created_at?: string
  updated_at?: string
}

/** App\Models\PacienteDeficiencia  (pivot tbpaciente_deficiencia) */
export interface PacienteDeficiencia {
  paciente_id: number
  tipo_deficiencia_id: number
  observacoes: string | null

  tipo_deficiencia?: TipoDeficiencia
  paciente?: Paciente
}
