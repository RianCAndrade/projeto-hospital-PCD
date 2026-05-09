"use client"

import type React from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { Agendamento, Crianca, Medico, StatusConsulta, Usuario } from "./types"
import { agendamentosMock, medicosMock, usuariosMock } from "./mock-data"

interface HospitalContextValue {
  // Auth
  usuarioLogado: Usuario | null
  login: (email: string, senha: string) => Usuario | null
  logout: () => void
  cadastrar: (dados: Omit<Usuario, "id" | "perfil"> & { criancas: Crianca[] }) => Usuario

  // Dados
  usuarios: Usuario[]
  medicos: Medico[]
  agendamentos: Agendamento[]

  // Acoes de agendamento
  criarAgendamento: (dados: Omit<Agendamento, "id" | "criadoEm" | "status">) => Agendamento
  alterarStatus: (id: string, status: StatusConsulta) => void
  cancelarAgendamento: (id: string) => void
  remarcarAgendamento: (id: string, novaDataHora: string, novoMedicoId?: string) => void

  // CRUD admin
  criarMedico: (dados: Omit<Medico, "id">) => Medico
  removerMedico: (id: string) => void
  criarUsuarioFuncionario: (
    dados: Omit<Usuario, "id" | "criancas"> & { perfil: "recepcionista" | "admin" | "medico" },
  ) => Usuario
  removerUsuario: (id: string) => void
}

const HospitalContext = createContext<HospitalContextValue | null>(null)

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMock)
  const [medicos, setMedicos] = useState<Medico[]>(medicosMock)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(agendamentosMock)
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)

  const login = useCallback(
    (email: string, _senha: string) => {
      // Demo: aceita qualquer senha. Em producao, validacao real seria feita no backend.
      const u = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (u) {
        setUsuarioLogado(u)
        return u
      }
      return null
    },
    [usuarios],
  )

  const logout = useCallback(() => setUsuarioLogado(null), [])

  const cadastrar: HospitalContextValue["cadastrar"] = useCallback((dados) => {
    const novo: Usuario = {
      id: `user-${Date.now()}`,
      perfil: "paciente",
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      criancas: dados.criancas,
    }
    setUsuarios((prev) => [...prev, novo])
    setUsuarioLogado(novo)
    return novo
  }, [])

  const criarAgendamento: HospitalContextValue["criarAgendamento"] = useCallback((dados) => {
    const novo: Agendamento = {
      ...dados,
      id: `ag-${Date.now()}`,
      status: "aguardando",
      criadoEm: new Date().toISOString(),
    }
    setAgendamentos((prev) => [novo, ...prev])
    return novo
  }, [])

  const alterarStatus = useCallback((id: string, status: StatusConsulta) => {
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const cancelarAgendamento = useCallback((id: string) => {
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelado" as StatusConsulta } : a)))
  }, [])

  const remarcarAgendamento = useCallback(
    (id: string, novaDataHora: string, novoMedicoId?: string) => {
      setAgendamentos((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a
          let updated = { ...a, dataHora: novaDataHora, status: "aguardando" as StatusConsulta }
          if (novoMedicoId) {
            const med = medicos.find((m) => m.id === novoMedicoId)
            if (med) {
              updated = {
                ...updated,
                medicoId: med.id,
                medicoNome: med.nome,
                especialidade: med.especialidade,
              }
            }
          }
          return updated
        }),
      )
    },
    [medicos],
  )

  const criarMedico: HospitalContextValue["criarMedico"] = useCallback((dados) => {
    const novo: Medico = { ...dados, id: `med-${Date.now()}` }
    setMedicos((prev) => [...prev, novo])
    return novo
  }, [])

  const removerMedico = useCallback((id: string) => {
    setMedicos((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const criarUsuarioFuncionario: HospitalContextValue["criarUsuarioFuncionario"] = useCallback((dados) => {
    const novo: Usuario = {
      ...dados,
      id: `user-${Date.now()}`,
    }
    setUsuarios((prev) => [...prev, novo])
    return novo
  }, [])

  const removerUsuario = useCallback((id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const value = useMemo<HospitalContextValue>(
    () => ({
      usuarioLogado,
      login,
      logout,
      cadastrar,
      usuarios,
      medicos,
      agendamentos,
      criarAgendamento,
      alterarStatus,
      cancelarAgendamento,
      remarcarAgendamento,
      criarMedico,
      removerMedico,
      criarUsuarioFuncionario,
      removerUsuario,
    }),
    [
      usuarioLogado,
      login,
      logout,
      cadastrar,
      usuarios,
      medicos,
      agendamentos,
      criarAgendamento,
      alterarStatus,
      cancelarAgendamento,
      remarcarAgendamento,
      criarMedico,
      removerMedico,
      criarUsuarioFuncionario,
      removerUsuario,
    ],
  )

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>
}

export function useHospital() {
  const ctx = useContext(HospitalContext)
  if (!ctx) throw new Error("useHospital deve ser usado dentro de HospitalProvider")
  return ctx
}
