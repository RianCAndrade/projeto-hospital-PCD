import type {
  Agendamento,
  Especialidade,
  Medico,
  Paciente,
  ResponsavelPaciente,
  TipoDeficiencia,
  Usuario,
} from "./types"

/**
 * Dados de demonstração — usados apenas pela mockApi (NEXT_PUBLIC_API_MODE !== "real").
 * Os shapes refletem fielmente as tabelas do backend Laravel:
 *   tbusuarios, tbpacientes, tbresponsavel_paciente,
 *   tbmedicos, tbespecialidades, tbmedico_especialidade,
 *   tbagendamentos, tbtipos_deficiencia, tbpaciente_deficiencia.
 */

const hoje = new Date()
const amanha = new Date(hoje)
amanha.setDate(hoje.getDate() + 1)
const depois = new Date(hoje)
depois.setDate(hoje.getDate() + 3)
const ontem = new Date(hoje)
ontem.setDate(hoje.getDate() - 5)

function dataISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function horaISO(h: number, m: number) {
  const hh = String(h).padStart(2, "0")
  const mm = String(m).padStart(2, "0")
  return `${hh}:${mm}:00`
}

function timestampISO(d: Date, h: number, m: number) {
  const nova = new Date(d)
  nova.setHours(h, m, 0, 0)
  return nova.toISOString()
}

// ──────────────────────────────────────────────────────────────────────────
// Catálogos
// ──────────────────────────────────────────────────────────────────────────

export const especialidadesMock: Especialidade[] = [
  { id: 1, nome: "Neuropediatria" },
  { id: 2, nome: "Fonoaudiologia" },
  { id: 3, nome: "Fisioterapia" },
  { id: 4, nome: "Terapia Ocupacional" },
  { id: 5, nome: "Psicologia Infantil" },
  { id: 6, nome: "Pediatria Geral" },
  { id: 7, nome: "Ortopedia Pediátrica" },
  { id: 8, nome: "Oftalmologia Pediátrica" },
]

export const tiposDeficienciaMock: TipoDeficiencia[] = [
  { id: 1, nome: "Física" },
  { id: 2, nome: "Intelectual" },
  { id: 3, nome: "Auditiva" },
  { id: 4, nome: "Visual" },
  { id: 5, nome: "Múltipla" },
  { id: 6, nome: "TEA (Autismo)" },
  { id: 7, nome: "Síndrome de Down" },
  { id: 8, nome: "Outra" },
]

// ──────────────────────────────────────────────────────────────────────────
// Usuários (tbusuarios)
// ──────────────────────────────────────────────────────────────────────────

export const usuariosMock: Usuario[] = [
  // Responsável (mãe) com 2 filhos PCD
  {
    id: 1,
    nome: "Marina Oliveira",
    email: "marina@email.com",
    telefone: "(11) 98888-1111",
    tipo_usuario: "responsavel",
  },
  {
    id: 2,
    nome: "Ana Paula Ferreira",
    email: "ana@email.com",
    telefone: "(11) 97777-2222",
    tipo_usuario: "responsavel",
  },
  {
    id: 3,
    nome: "Patrícia Mendes",
    email: "patricia@email.com",
    telefone: "(11) 96666-3333",
    tipo_usuario: "responsavel",
  },
  // Recepcionista
  {
    id: 4,
    nome: "Carla Recepção",
    email: "recepcao@acolher.com",
    telefone: "(11) 95555-4444",
    tipo_usuario: "recepcionista",
  },
  // Admin
  {
    id: 5,
    nome: "Roberto Diretor",
    email: "admin@acolher.com",
    telefone: "(11) 94444-5555",
    tipo_usuario: "admin",
  },
  // Médicos como usuários (linha em tbusuarios + tbmedicos)
  {
    id: 6,
    nome: "Dra. Beatriz Almeida",
    email: "beatriz.almeida@acolher.com",
    telefone: "(11) 93333-6666",
    tipo_usuario: "medico",
  },
  {
    id: 7,
    nome: "Dr. Rafael Souza",
    email: "rafael.souza@acolher.com",
    telefone: "(11) 93333-7777",
    tipo_usuario: "medico",
  },
  {
    id: 8,
    nome: "Dra. Camila Reis",
    email: "camila.reis@acolher.com",
    telefone: "(11) 93333-8888",
    tipo_usuario: "medico",
  },
  {
    id: 9,
    nome: "Dr. Luiz Henrique",
    email: "luiz.henrique@acolher.com",
    telefone: "(11) 93333-9999",
    tipo_usuario: "medico",
  },
  {
    id: 10,
    nome: "Dra. Juliana Pires",
    email: "juliana.pires@acolher.com",
    telefone: "(11) 93334-0000",
    tipo_usuario: "medico",
  },
  {
    id: 11,
    nome: "Dr. Marcos Vinícius",
    email: "marcos.vinicius@acolher.com",
    telefone: "(11) 93334-1111",
    tipo_usuario: "medico",
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Pacientes (tbpacientes)
// ──────────────────────────────────────────────────────────────────────────

export const pacientesMock: Paciente[] = [
  {
    id: 1,
    usuario_id: null,
    nome: "Lucas Oliveira",
    data_nascimento: "2018-03-12",
    cpf: null,
    sexo: "masculino",
    possui_autismo: true,
    necessita_acessibilidade: false,
    usa_cadeira_rodas: false,
    necessita_acompanhante: true,
    observacoes: "Sensibilidade a sons altos. Prefere ambientes calmos.",
    observacoes_comunicacao: "Comunicação verbal limitada.",
    deficiencias: [
      {
        paciente_id: 1,
        tipo_deficiencia_id: 6,
        observacoes: null,
        tipo_deficiencia: tiposDeficienciaMock[5],
      },
    ],
  },
  {
    id: 2,
    usuario_id: null,
    nome: "Sofia Oliveira",
    data_nascimento: "2020-08-05",
    cpf: null,
    sexo: "feminino",
    possui_autismo: false,
    necessita_acessibilidade: false,
    usa_cadeira_rodas: false,
    necessita_acompanhante: true,
    observacoes: "Faz acompanhamento cardiológico anual.",
    observacoes_comunicacao: null,
    deficiencias: [
      {
        paciente_id: 2,
        tipo_deficiencia_id: 7,
        observacoes: null,
        tipo_deficiencia: tiposDeficienciaMock[6],
      },
    ],
  },
  {
    id: 3,
    usuario_id: null,
    nome: "Miguel Ferreira",
    data_nascimento: "2017-11-22",
    cpf: null,
    sexo: "masculino",
    possui_autismo: false,
    necessita_acessibilidade: true,
    usa_cadeira_rodas: true,
    necessita_acompanhante: true,
    observacoes: "Cadeirante. Necessita rampa de acesso.",
    observacoes_comunicacao: null,
    deficiencias: [
      {
        paciente_id: 3,
        tipo_deficiencia_id: 1,
        observacoes: null,
        tipo_deficiencia: tiposDeficienciaMock[0],
      },
    ],
  },
  {
    id: 4,
    usuario_id: null,
    nome: "Helena Mendes",
    data_nascimento: "2019-05-18",
    cpf: null,
    sexo: "feminino",
    possui_autismo: false,
    necessita_acessibilidade: false,
    usa_cadeira_rodas: false,
    necessita_acompanhante: true,
    observacoes: null,
    observacoes_comunicacao: "Usa Libras.",
    deficiencias: [
      {
        paciente_id: 4,
        tipo_deficiencia_id: 3,
        observacoes: null,
        tipo_deficiencia: tiposDeficienciaMock[2],
      },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Vínculos responsável-paciente (tbresponsavel_paciente)
// ──────────────────────────────────────────────────────────────────────────

export const responsaveisMock: ResponsavelPaciente[] = [
  { id: 1, usuario_id: 1, paciente_id: 1, parentesco: "Mãe", principal: true },
  { id: 2, usuario_id: 1, paciente_id: 2, parentesco: "Mãe", principal: true },
  { id: 3, usuario_id: 2, paciente_id: 3, parentesco: "Mãe", principal: true },
  { id: 4, usuario_id: 3, paciente_id: 4, parentesco: "Mãe", principal: true },
]

// ──────────────────────────────────────────────────────────────────────────
// Médicos (tbmedicos + tbmedico_especialidade)
// ──────────────────────────────────────────────────────────────────────────

export const medicosMock: Medico[] = [
  {
    id: 1,
    usuario_id: 6,
    crm: "CRM/SP 123456",
    descricao: "Especialista em desenvolvimento neuro-infantil.",
    especialidades: [especialidadesMock[0]],
  },
  {
    id: 2,
    usuario_id: 7,
    crm: "CRM/SP 234567",
    descricao: "Foco em fala e linguagem.",
    especialidades: [especialidadesMock[1]],
  },
  {
    id: 3,
    usuario_id: 8,
    crm: "CRM/SP 345678",
    descricao: "Reabilitação motora pediátrica.",
    especialidades: [especialidadesMock[2]],
  },
  {
    id: 4,
    usuario_id: 9,
    crm: "CRM/SP 456789",
    descricao: "Terapia ocupacional infantil.",
    especialidades: [especialidadesMock[3]],
  },
  {
    id: 5,
    usuario_id: 10,
    crm: "CRM/SP 567890",
    descricao: "Psicologia infantil com foco em TEA.",
    especialidades: [especialidadesMock[4]],
  },
  {
    id: 6,
    usuario_id: 11,
    crm: "CRM/SP 678901",
    descricao: "Oftalmologia pediátrica.",
    especialidades: [especialidadesMock[7]],
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Agendamentos (tbagendamentos)
// ──────────────────────────────────────────────────────────────────────────

export const agendamentosMock: Agendamento[] = [
  {
    id: 1,
    paciente_id: 1,
    medico_id: 1,
    especialidade_id: 1,
    recepcionista_id: 4,
    data_agendamento: dataISO(hoje),
    horario: horaISO(14, 30),
    status: "agendado",
    observacoes: "Primeira consulta de avaliação.",
    created_at: timestampISO(ontem, 9, 0),
  },
  {
    id: 2,
    paciente_id: 2,
    medico_id: 3,
    especialidade_id: 3,
    recepcionista_id: 4,
    data_agendamento: dataISO(amanha),
    horario: horaISO(10, 0),
    status: "agendado",
    observacoes: null,
    created_at: timestampISO(ontem, 9, 30),
  },
  {
    id: 3,
    paciente_id: 3,
    medico_id: 3,
    especialidade_id: 3,
    recepcionista_id: 4,
    data_agendamento: dataISO(hoje),
    horario: horaISO(15, 0),
    status: "agendado",
    observacoes: "Acompanhamento mensal.",
    created_at: timestampISO(ontem, 11, 0),
  },
  {
    id: 4,
    paciente_id: 4,
    medico_id: 2,
    especialidade_id: 2,
    recepcionista_id: 4,
    data_agendamento: dataISO(hoje),
    horario: horaISO(16, 30),
    status: "agendado",
    observacoes: null,
    created_at: timestampISO(ontem, 14, 0),
  },
  {
    id: 5,
    paciente_id: 1,
    medico_id: 5,
    especialidade_id: 5,
    recepcionista_id: 4,
    data_agendamento: dataISO(ontem),
    horario: horaISO(10, 0),
    status: "finalizado",
    observacoes: "Consulta concluída. Próximo retorno em 30 dias.",
    created_at: timestampISO(ontem, 8, 0),
  },
  {
    id: 6,
    paciente_id: 3,
    medico_id: 1,
    especialidade_id: 1,
    recepcionista_id: 4,
    data_agendamento: dataISO(depois),
    horario: horaISO(9, 0),
    status: "agendado",
    observacoes: null,
    created_at: timestampISO(hoje, 8, 0),
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Credenciais de demonstração para o painel "entrar como"
// ──────────────────────────────────────────────────────────────────────────

export const credenciaisDemo = [
  {
    tipo_usuario: "responsavel",
    email: "marina@email.com",
    senha: "123456",
    nome: "Marina (Mãe)",
  },
  {
    tipo_usuario: "recepcionista",
    email: "recepcao@acolher.com",
    senha: "123456",
    nome: "Carla (Recepção)",
  },
  {
    tipo_usuario: "medico",
    email: "beatriz.almeida@acolher.com",
    senha: "123456",
    nome: "Dra. Beatriz",
  },
  {
    tipo_usuario: "admin",
    email: "admin@acolher.com",
    senha: "123456",
    nome: "Roberto (Admin)",
  },
] as const
