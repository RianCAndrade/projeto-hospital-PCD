"use client"

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { api } from "./api"
import type {
  Agendamento,
  Especialidade,
  Medico,
  Paciente,
  ResponsavelPaciente,
  StatusAgendamento,
  TipoDeficiencia,
  TipoUsuario,
  Usuario,
} from "./types"
import {
  agendamentosMock,
  especialidadesMock,
  medicosMock,
  pacientesMock,
  responsaveisMock,
  tiposDeficienciaMock,
  usuariosMock,
} from "./mock-data"
import type {
  CreateAgendamentoDto,
  CreateMedicoDto,
  CreatePacienteDto,
  RegisterDto,
  RescheduleAgendamentoDto,
} from "./api/types"

interface HospitalContextValue {
  // Auth
  usuarioLogado: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<Usuario | null>
  logout: () => Promise<void>
  cadastrar: (dto: RegisterDto) => Promise<Usuario>

  // Dados (todos seguem o shape do backend)
  usuarios: Usuario[]
  pacientes: Paciente[]
  responsaveis: ResponsavelPaciente[]
  medicos: Medico[]
  especialidades: Especialidade[]
  tiposDeficiencia: TipoDeficiencia[]
  agendamentos: Agendamento[]

  // Helpers para a UI (resolvem nomes a partir dos IDs)
  getUsuario: (id: number | null | undefined) => Usuario | undefined
  getPaciente: (id: number | null | undefined) => Paciente | undefined
  getMedico: (id: number | null | undefined) => Medico | undefined
  getMedicoNome: (id: number | null | undefined) => string
  getEspecialidade: (
    id: number | null | undefined,
  ) => Especialidade | undefined
  getEspecialidadeNome: (id: number | null | undefined) => string
  pacientesDoUsuario: (usuarioId: number) => Paciente[]

  // Ações
  criarAgendamento: (dto: CreateAgendamentoDto) => Promise<Agendamento>
  alterarStatusAgendamento: (
    id: number,
    status: StatusAgendamento,
  ) => Promise<void>
  cancelarAgendamento: (id: number) => Promise<void>
  remarcarAgendamento: (
    id: number,
    dto: RescheduleAgendamentoDto,
  ) => Promise<void>

  criarPaciente: (dto: CreatePacienteDto) => Promise<Paciente>

  criarMedico: (dto: CreateMedicoDto) => Promise<Medico>
  removerMedico: (id: number) => Promise<void>

  removerUsuario: (id: number) => Promise<void>
}

const HospitalContext = createContext<HospitalContextValue | null>(null)

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMock)
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesMock)
  const [responsaveis, setResponsaveis] =
    useState<ResponsavelPaciente[]>(responsaveisMock)
  const [medicos, setMedicos] = useState<Medico[]>(medicosMock)
  const [especialidades, setEspecialidades] =
    useState<Especialidade[]>(especialidadesMock)
  const [tiposDeficiencia, setTiposDeficiencia] = useState<TipoDeficiencia[]>(
    tiposDeficienciaMock,
  )
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    agendamentosMock,
  )
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Carga inicial: tenta o bootstrap do backend; se falhar, mantém mock.
  useEffect(() => {
    let ativo = true
    ;(async () => {
      try {
        const data = await api.bootstrap()
        if (!ativo) return
        setUsuarioLogado(data.usuario)
        setUsuarios(data.usuarios)
        setPacientes(data.pacientes)
        setResponsaveis(data.responsaveis)
        setMedicos(data.medicos)
        setAgendamentos(data.agendamentos)
        setEspecialidades(data.especialidades)
        setTiposDeficiencia(data.tipos_deficiencia)
      } catch {
        // bootstrap pode não existir ainda no backend — silencioso
      } finally {
        if (ativo) setCarregando(false)
      }
    })()
    return () => {
      ativo = false
    }
  }, [])

  // ── Auth ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.auth.login({ email, senha })
    setUsuarioLogado(res.usuario)
    return res.usuario
  }, [])

  const logout = useCallback(async () => {
    await api.auth.logout()
    setUsuarioLogado(null)
  }, [])

  const cadastrar = useCallback(async (dto: RegisterDto) => {
    const res = await api.auth.register(dto)
    setUsuarios((prev) => [...prev, res.usuario])
    // O backend real (RegisterController) NÃO devolve token,
    // então não logamos automaticamente. A página deve redirecionar
    // para /login. O mock segue o mesmo contrato.
    return res.usuario
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────
  const getUsuario = useCallback(
    (id: number | null | undefined) =>
      id == null ? undefined : usuarios.find((u) => u.id === id),
    [usuarios],
  )

  const getPaciente = useCallback(
    (id: number | null | undefined) =>
      id == null ? undefined : pacientes.find((p) => p.id === id),
    [pacientes],
  )

  const getMedico = useCallback(
    (id: number | null | undefined) =>
      id == null ? undefined : medicos.find((m) => m.id === id),
    [medicos],
  )

  const getMedicoNome = useCallback(
    (id: number | null | undefined) => {
      const m = getMedico(id)
      if (!m) return ""
      const u = usuarios.find((x) => x.id === m.usuario_id)
      return u?.nome ?? ""
    },
    [getMedico, usuarios],
  )

  const getEspecialidade = useCallback(
    (id: number | null | undefined) =>
      id == null ? undefined : especialidades.find((e) => e.id === id),
    [especialidades],
  )

  const getEspecialidadeNome = useCallback(
    (id: number | null | undefined) => getEspecialidade(id)?.nome ?? "",
    [getEspecialidade],
  )

  const pacientesDoUsuario = useCallback(
    (usuarioId: number) => {
      const ids = responsaveis
        .filter((r) => r.usuario_id === usuarioId)
        .map((r) => r.paciente_id)
      return pacientes.filter((p) => ids.includes(p.id))
    },
    [responsaveis, pacientes],
  )

  // ── Ações ─────────────────────────────────────────────────────────────
  const criarAgendamento = useCallback(async (dto: CreateAgendamentoDto) => {
    const novo = await api.agendamentos.create(dto)
    setAgendamentos((prev) => [novo, ...prev])
    return novo
  }, [])

  const alterarStatusAgendamento = useCallback(
    async (id: number, status: StatusAgendamento) => {
      const atualizado = await api.agendamentos.updateStatus(id, status)
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? atualizado : a)),
      )
    },
    [],
  )

  const cancelarAgendamento = useCallback(async (id: number) => {
    const atualizado = await api.agendamentos.cancel(id)
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? atualizado : a)))
  }, [])

  const remarcarAgendamento = useCallback(
    async (id: number, dto: RescheduleAgendamentoDto) => {
      const atualizado = await api.agendamentos.reschedule(id, dto)
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? atualizado : a)),
      )
    },
    [],
  )

  const criarPaciente = useCallback(async (dto: CreatePacienteDto) => {
    const novo = await api.pacientes.create(dto)
    setPacientes((prev) => [...prev, novo])
    return novo
  }, [])

  const criarMedico = useCallback(async (dto: CreateMedicoDto) => {
    const novo = await api.medicos.create(dto)
    setMedicos((prev) => [...prev, novo])
    return novo
  }, [])

  const removerMedico = useCallback(async (id: number) => {
    await api.medicos.delete(id)
    setMedicos((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const removerUsuario = useCallback(async (id: number) => {
    await api.usuarios.delete(id)
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const value = useMemo<HospitalContextValue>(
    () => ({
      usuarioLogado,
      carregando,
      login,
      logout,
      cadastrar,
      usuarios,
      pacientes,
      responsaveis,
      medicos,
      especialidades,
      tiposDeficiencia,
      agendamentos,
      getUsuario,
      getPaciente,
      getMedico,
      getMedicoNome,
      getEspecialidade,
      getEspecialidadeNome,
      pacientesDoUsuario,
      criarAgendamento,
      alterarStatusAgendamento,
      cancelarAgendamento,
      remarcarAgendamento,
      criarPaciente,
      criarMedico,
      removerMedico,
      removerUsuario,
    }),
    [
      usuarioLogado,
      carregando,
      login,
      logout,
      cadastrar,
      usuarios,
      pacientes,
      responsaveis,
      medicos,
      especialidades,
      tiposDeficiencia,
      agendamentos,
      getUsuario,
      getPaciente,
      getMedico,
      getMedicoNome,
      getEspecialidade,
      getEspecialidadeNome,
      pacientesDoUsuario,
      criarAgendamento,
      alterarStatusAgendamento,
      cancelarAgendamento,
      remarcarAgendamento,
      criarPaciente,
      criarMedico,
      removerMedico,
      removerUsuario,
    ],
  )

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  )
}

export function useHospital() {
  const ctx = useContext(HospitalContext)
  if (!ctx)
    throw new Error("useHospital deve ser usado dentro de HospitalProvider")
  return ctx
}

// Re-exporta para conveniência das páginas
export type { TipoUsuario }
