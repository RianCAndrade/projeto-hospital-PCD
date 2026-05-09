import type { Agendamento, Medico, Usuario } from "./types"

const hoje = new Date()
const amanha = new Date(hoje)
amanha.setDate(hoje.getDate() + 1)
const depois = new Date(hoje)
depois.setDate(hoje.getDate() + 3)
const ontem = new Date(hoje)
ontem.setDate(hoje.getDate() - 5)

function setHora(d: Date, h: number, m: number) {
  const nova = new Date(d)
  nova.setHours(h, m, 0, 0)
  return nova.toISOString()
}

export const medicosMock: Medico[] = [
  {
    id: "med-1",
    nome: "Dra. Beatriz Almeida",
    email: "beatriz.almeida@acolher.com",
    crm: "CRM/SP 123456",
    especialidade: "Neuropediatria",
    atendeDeficiencias: ["Intelectual", "TEA (Autismo)", "Múltipla", "Síndrome de Down"],
    disponivelHoje: true,
  },
  {
    id: "med-2",
    nome: "Dr. Rafael Souza",
    email: "rafael.souza@acolher.com",
    crm: "CRM/SP 234567",
    especialidade: "Fonoaudiologia",
    atendeDeficiencias: ["Auditiva", "TEA (Autismo)", "Síndrome de Down"],
    disponivelHoje: true,
  },
  {
    id: "med-3",
    nome: "Dra. Camila Reis",
    email: "camila.reis@acolher.com",
    crm: "CRM/SP 345678",
    especialidade: "Fisioterapia",
    atendeDeficiencias: ["Física", "Múltipla", "Síndrome de Down"],
    disponivelHoje: false,
  },
  {
    id: "med-4",
    nome: "Dr. Luiz Henrique",
    email: "luiz.henrique@acolher.com",
    crm: "CRM/SP 456789",
    especialidade: "Terapia Ocupacional",
    atendeDeficiencias: ["TEA (Autismo)", "Intelectual", "Múltipla"],
    disponivelHoje: true,
  },
  {
    id: "med-5",
    nome: "Dra. Juliana Pires",
    email: "juliana.pires@acolher.com",
    crm: "CRM/SP 567890",
    especialidade: "Psicologia Infantil",
    atendeDeficiencias: ["Intelectual", "TEA (Autismo)", "Outra"],
    disponivelHoje: true,
  },
  {
    id: "med-6",
    nome: "Dr. Marcos Vinícius",
    email: "marcos.vinicius@acolher.com",
    crm: "CRM/SP 678901",
    especialidade: "Oftalmologia Pediátrica",
    atendeDeficiencias: ["Visual", "Múltipla"],
    disponivelHoje: true,
  },
]

export const usuariosMock: Usuario[] = [
  // Paciente principal de demonstracao
  {
    id: "user-1",
    nome: "Marina Oliveira",
    email: "marina@email.com",
    telefone: "(11) 98888-1111",
    perfil: "paciente",
    criancas: [
      {
        id: "c-1",
        nome: "Lucas Oliveira",
        dataNascimento: "2018-03-12",
        tipoDeficiencia: "TEA (Autismo)",
        observacoes: "Sensibilidade a sons altos. Prefere ambientes calmos.",
      },
      {
        id: "c-2",
        nome: "Sofia Oliveira",
        dataNascimento: "2020-08-05",
        tipoDeficiencia: "Síndrome de Down",
        observacoes: "Faz acompanhamento cardiológico anual.",
      },
    ],
  },
  {
    id: "user-2",
    nome: "Ana Paula Ferreira",
    email: "ana@email.com",
    telefone: "(11) 97777-2222",
    perfil: "paciente",
    criancas: [
      {
        id: "c-3",
        nome: "Miguel Ferreira",
        dataNascimento: "2017-11-22",
        tipoDeficiencia: "Física",
        observacoes: "Cadeirante. Necessita rampa de acesso.",
      },
    ],
  },
  {
    id: "user-3",
    nome: "Patrícia Mendes",
    email: "patricia@email.com",
    telefone: "(11) 96666-3333",
    perfil: "paciente",
    criancas: [
      {
        id: "c-4",
        nome: "Helena Mendes",
        dataNascimento: "2019-05-18",
        tipoDeficiencia: "Auditiva",
      },
    ],
  },
  // Recepcionista
  {
    id: "user-4",
    nome: "Carla Recepção",
    email: "recepcao@acolher.com",
    telefone: "(11) 95555-4444",
    perfil: "recepcionista",
    cargo: "Recepcionista Sênior",
  },
  // Admin
  {
    id: "user-5",
    nome: "Roberto Diretor",
    email: "admin@acolher.com",
    telefone: "(11) 94444-5555",
    perfil: "admin",
    cargo: "Diretor Geral",
  },
  // Medicos como usuarios (para login)
  {
    id: "user-6",
    nome: "Dra. Beatriz Almeida",
    email: "beatriz.almeida@acolher.com",
    telefone: "(11) 93333-6666",
    perfil: "medico",
    crm: "CRM/SP 123456",
    especialidade: "Neuropediatria",
  },
]

export const agendamentosMock: Agendamento[] = [
  {
    id: "ag-1",
    pacienteId: "user-1",
    pacienteNome: "Marina Oliveira",
    criancaId: "c-1",
    criancaNome: "Lucas Oliveira",
    tipoDeficiencia: "TEA (Autismo)",
    medicoId: "med-1",
    medicoNome: "Dra. Beatriz Almeida",
    especialidade: "Neuropediatria",
    dataHora: setHora(hoje, 14, 30),
    status: "aguardando",
    observacoes: "Primeira consulta de avaliação.",
    criadoEm: setHora(ontem, 9, 0),
  },
  {
    id: "ag-2",
    pacienteId: "user-1",
    pacienteNome: "Marina Oliveira",
    criancaId: "c-2",
    criancaNome: "Sofia Oliveira",
    tipoDeficiencia: "Síndrome de Down",
    medicoId: "med-3",
    medicoNome: "Dra. Camila Reis",
    especialidade: "Fisioterapia",
    dataHora: setHora(amanha, 10, 0),
    status: "aguardando",
    criadoEm: setHora(ontem, 9, 30),
  },
  {
    id: "ag-3",
    pacienteId: "user-2",
    pacienteNome: "Ana Paula Ferreira",
    criancaId: "c-3",
    criancaNome: "Miguel Ferreira",
    tipoDeficiencia: "Física",
    medicoId: "med-3",
    medicoNome: "Dra. Camila Reis",
    especialidade: "Fisioterapia",
    dataHora: setHora(hoje, 15, 0),
    status: "aguardando",
    observacoes: "Acompanhamento mensal.",
    criadoEm: setHora(ontem, 11, 0),
  },
  {
    id: "ag-4",
    pacienteId: "user-3",
    pacienteNome: "Patrícia Mendes",
    criancaId: "c-4",
    criancaNome: "Helena Mendes",
    tipoDeficiencia: "Auditiva",
    medicoId: "med-2",
    medicoNome: "Dr. Rafael Souza",
    especialidade: "Fonoaudiologia",
    dataHora: setHora(hoje, 16, 30),
    status: "aguardando",
    criadoEm: setHora(ontem, 14, 0),
  },
  {
    id: "ag-5",
    pacienteId: "user-1",
    pacienteNome: "Marina Oliveira",
    criancaId: "c-1",
    criancaNome: "Lucas Oliveira",
    tipoDeficiencia: "TEA (Autismo)",
    medicoId: "med-5",
    medicoNome: "Dra. Juliana Pires",
    especialidade: "Psicologia Infantil",
    dataHora: setHora(ontem, 10, 0),
    status: "encerrado",
    observacoes: "Consulta concluída. Próximo retorno em 30 dias.",
    criadoEm: setHora(ontem, 8, 0),
  },
  {
    id: "ag-6",
    pacienteId: "user-2",
    pacienteNome: "Ana Paula Ferreira",
    criancaId: "c-3",
    criancaNome: "Miguel Ferreira",
    tipoDeficiencia: "Física",
    medicoId: "med-1",
    medicoNome: "Dra. Beatriz Almeida",
    especialidade: "Neuropediatria",
    dataHora: setHora(depois, 9, 0),
    status: "aguardando",
    criadoEm: setHora(hoje, 8, 0),
  },
]

export const credenciaisDemo = [
  { perfil: "paciente", email: "marina@email.com", senha: "123456", nome: "Marina (Mãe)" },
  { perfil: "recepcionista", email: "recepcao@acolher.com", senha: "123456", nome: "Carla (Recepção)" },
  { perfil: "medico", email: "beatriz.almeida@acolher.com", senha: "123456", nome: "Dra. Beatriz" },
  { perfil: "admin", email: "admin@acolher.com", senha: "123456", nome: "Roberto (Admin)" },
] as const
