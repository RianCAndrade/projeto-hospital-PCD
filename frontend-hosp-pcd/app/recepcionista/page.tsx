"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Calendar,
  Users,
  Filter,
  CalendarClock,
  X,
  UserPlus,
  CheckCircle2,
  CalendarPlus,
} from "lucide-react"
import { toast } from "sonner"
import type { Agendamento } from "@/lib/types"
import { ApiError } from "@/lib/api"

function montarDate(data: string, horario: string) {
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

function formatarData(data: string) {
  const [y, m, d] = data.split("-")
  return `${d}/${m}/${y}`
}

function formatarHora(horario: string) {
  return horario.slice(0, 5)
}

export default function RecepcionistaPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    agendamentos,
    medicos,
    especialidades,
    pacientes,
    getMedicoNome,
    getEspecialidadeNome,
    getPaciente,
    remarcarAgendamento,
    cancelarAgendamento,
    cadastrar,
    criarAgendamento,
    alterarStatusAgendamento,
  } = useHospital()
  const [busca, setBusca] = useState("")
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("todas")
  const [filtroStatus, setFiltroStatus] = useState<string>("ativos")

  const [remarcarOpen, setRemarcarOpen] = useState(false)
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null)
  const [novaData, setNovaData] = useState("")
  const [novaHora, setNovaHora] = useState("")
  const [novoMedico, setNovoMedico] = useState<string>("")

  // Cadastro de paciente presencial
  const [novoPacOpen, setNovoPacOpen] = useState(false)
  const [pacNome, setPacNome] = useState("")
  const [pacEmail, setPacEmail] = useState("")
  const [pacTel, setPacTel] = useState("")
  const [pacSenha, setPacSenha] = useState("")
  const [pacPrecisaResp, setPacPrecisaResp] = useState(false)
  // Campos PCD do paciente presencial
  const [pacDataNascimento, setPacDataNascimento] = useState("")
  const [pacSexo, setPacSexo] = useState("")
  const [pacPossuiAutismo, setPacPossuiAutismo] = useState(false)
  const [pacNecessitaAcessibilidade, setPacNecessitaAcessibilidade] =
    useState(false)
  const [pacUsaCadeiraRodas, setPacUsaCadeiraRodas] = useState(false)
  const [pacObservacoes, setPacObservacoes] = useState("")
  const [pacObservacoesComunicacao, setPacObservacoesComunicacao] = useState("")

  // Modal de solicitar agendamento (pós-cadastro ou para paciente já cadastrado)
  const [novoAgOpen, setNovoAgOpen] = useState(false)
  const [agPacienteId, setAgPacienteId] = useState<string>("")
  const [agMedicoId, setAgMedicoId] = useState<string>("")
  const [agEspecialidadeId, setAgEspecialidadeId] = useState<string>("")
  const [agData, setAgData] = useState("")
  const [agHora, setAgHora] = useState("")
  const [agObs, setAgObs] = useState("")
  // Estado pós-criação: mostra resumo + botão "Confirmar agora"
  const [agEmSucesso, setAgEmSucesso] = useState(false)
  const [agCriado, setAgCriado] = useState<Agendamento | null>(null)
  const [agEnviando, setAgEnviando] = useState(false)

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "recepcionista") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const filtrados = useMemo(() => {
    return agendamentos
      .filter((a) => {
        if (filtroStatus === "ativos")
          return a.status === "agendado" || a.status === "confirmado"
        if (filtroStatus === "finalizados") return a.status === "finalizado"
        if (filtroStatus === "cancelados") return a.status === "cancelado"
        if (filtroStatus === "faltou") return a.status === "faltou"
        return true
      })
      .filter(
        (a) =>
          filtroEspecialidade === "todas" ||
          String(a.especialidade_id) === filtroEspecialidade,
      )
      .filter((a) => {
        const q = busca.toLowerCase().trim()
        if (!q) return true
        const paciente = getPaciente(a.paciente_id)
        const medicoNome = getMedicoNome(a.medico_id)
        return (
          (paciente?.nome ?? "").toLowerCase().includes(q) ||
          medicoNome.toLowerCase().includes(q)
        )
      })
      .sort(
        (a, b) =>
          montarDate(a.data_agendamento, a.horario).getTime() -
          montarDate(b.data_agendamento, b.horario).getTime(),
      )
  }, [
    agendamentos,
    filtroEspecialidade,
    filtroStatus,
    busca,
    getPaciente,
    getMedicoNome,
  ])

  const stats = useMemo(() => {
    const hoje = new Date().toDateString()
    return {
      hoje: agendamentos.filter(
        (a) =>
          montarDate(a.data_agendamento, a.horario).toDateString() === hoje,
      ).length,
      agendados: agendamentos.filter((a) => a.status === "agendado").length,
      confirmados: agendamentos.filter((a) => a.status === "confirmado").length,
      cancelados: agendamentos.filter((a) => a.status === "cancelado").length,
    }
  }, [agendamentos])

  function abrirRemarcar(a: Agendamento) {
    setAgSelecionado(a)
    setNovaData("")
    setNovaHora("")
    setNovoMedico(String(a.medico_id))
    setRemarcarOpen(true)
  }

  function resetCadastroPresencial() {
    setPacNome("")
    setPacEmail("")
    setPacTel("")
    setPacSenha("")
    setPacPrecisaResp(false)
    setPacDataNascimento("")
    setPacSexo("")
    setPacPossuiAutismo(false)
    setPacNecessitaAcessibilidade(false)
    setPacUsaCadeiraRodas(false)
    setPacObservacoes("")
    setPacObservacoesComunicacao("")
  }

  async function handleCadastrarPacientePresencial(e: React.FormEvent) {
    e.preventDefault()
    if (!pacNome || !pacEmail || !pacSenha) {
      toast.error("Preencha nome, email e senha.")
      return
    }
    if (pacSenha.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.")
      return
    }
    if (!pacDataNascimento) {
      toast.error("Informe a data de nascimento do paciente.")
      return
    }
    if (!pacSexo) {
      toast.error("Informe o sexo do paciente.")
      return
    }
    try {
      await cadastrar({
        nome: pacNome,
        email: pacEmail,
        telefone: pacTel,
        senha: pacSenha,
        tipo_usuario: "paciente",
        data_nascimento: pacDataNascimento,
        sexo: pacSexo,
        possui_autismo: pacPossuiAutismo,
        necessita_acessibilidade: pacNecessitaAcessibilidade,
        usa_cadeira_rodas: pacUsaCadeiraRodas,
        necessita_acompanhante: pacPrecisaResp,
        observacoes: pacObservacoes || undefined,
        observacoes_comunicacao: pacObservacoesComunicacao || undefined,
      })
      toast.success("Paciente cadastrado(a) com sucesso.", {
        description: pacPrecisaResp
          ? "Lembre de vincular o responsável depois."
          : "A conta já pode ser usada para agendamentos.",
      })
      resetCadastroPresencial()
      setNovoPacOpen(false)
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Erro ao cadastrar paciente."
      toast.error(msg)
    }
  }

  function resetNovoAg() {
    setAgPacienteId("")
    setAgMedicoId("")
    setAgEspecialidadeId("")
    setAgData("")
    setAgHora("")
    setAgObs("")
    setAgEmSucesso(false)
    setAgCriado(null)
    setAgEnviando(false)
  }

  function abrirSolicitarAgendamento() {
    resetNovoAg()
    setNovoAgOpen(true)
  }

  function fecharSolicitarAgendamento() {
    setNovoAgOpen(false)
    resetNovoAg()
  }

  async function handleSolicitarAgendamento(e: React.FormEvent) {
    e.preventDefault()
    if (!agPacienteId) {
      toast.error("Selecione o paciente.")
      return
    }
    if (!agMedicoId || !agEspecialidadeId) {
      toast.error("Selecione médico e especialidade.")
      return
    }
    if (!agData || !agHora) {
      toast.error("Informe data e horário.")
      return
    }
    setAgEnviando(true)
    try {
      const novo = await criarAgendamento({
        paciente_id: Number(agPacienteId),
        medico_id: Number(agMedicoId),
        especialidade_id: Number(agEspecialidadeId),
        recepcionista_id: usuarioLogado?.id ?? null,
        data_agendamento: agData,
        horario: agHora,
        observacoes: agObs || null,
      })
      setAgCriado(novo)
      setAgEmSucesso(true)
      toast.success("Agendamento criado", {
        description: "Você pode confirmar agora ou fechar para confirmar depois.",
      })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível criar o agendamento."
      toast.error(msg)
    } finally {
      setAgEnviando(false)
    }
  }

  async function handleConfirmarAgendamentoCriado() {
    if (!agCriado) return
    try {
      await alterarStatusAgendamento(agCriado.id, "confirmado")
      toast.success("Consulta confirmada", {
        description: `${getPaciente(agCriado.paciente_id)?.nome ?? "Paciente"} • ${formatarData(agCriado.data_agendamento)} às ${formatarHora(agCriado.horario)}`,
      })
      fecharSolicitarAgendamento()
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível confirmar a consulta."
      toast.error(msg)
    }
  }

  async function confirmarRemarcacao(e: React.FormEvent) {
    e.preventDefault()
    if (!agSelecionado || !novaData || !novaHora) {
      toast.error("Informe a nova data e horário.")
      return
    }
    try {
      await remarcarAgendamento(agSelecionado.id, {
        data_agendamento: novaData,
        horario: novaHora,
        medico_id:
          Number(novoMedico) !== agSelecionado.medico_id
            ? Number(novoMedico)
            : undefined,
      })
      const pacienteNome =
        getPaciente(agSelecionado.paciente_id)?.nome ?? "paciente"
      toast.success("Consulta remarcada", {
        description: `${pacienteNome} agora está agendado(a) para ${formatarData(
          novaData,
        )} às ${novaHora}.`,
      })
      setRemarcarOpen(false)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Erro ao remarcar."
      toast.error(msg)
    }
  }

  if (!usuarioLogado) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel="Recepção"
        titulo="Painel da recepção"
        descricao="Gerencie consultas. Verifique disponibilidade dos médicos, remarque ou cancele atendimentos quando necessário."
      />

      <main
        id="conteudo-principal"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Métricas rápidas */}
        <section
          aria-label="Resumo do dia"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Consultas hoje",
              valor: stats.hoje,
              Icon: Calendar,
              cor: "primary",
            },
            {
              label: "Agendados",
              valor: stats.agendados,
              Icon: CalendarClock,
              cor: "accent",
            },
            {
              label: "Confirmados",
              valor: stats.confirmados,
              Icon: CheckCircle2,
              cor: "primary",
            },
            {
              label: "Cancelados",
              valor: stats.cancelados,
              Icon: X,
              cor: "destructive",
            },
          ].map(({ label, valor, Icon, cor }) => (
            <article
              key={label}
              className="rounded-2xl border-2 border-border bg-card p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {label}
                </p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    cor === "primary"
                      ? "bg-primary/10 text-primary"
                      : cor === "accent"
                        ? "bg-accent/15 text-accent"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="font-display text-4xl font-bold mt-3">{valor}</p>
            </article>
          ))}
        </section>

        {/* Ações rápidas */}
        <section
          aria-label="Ações da recepção"
          className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-bold">
              Atendimento presencial
            </p>
            <h2 className="font-display text-lg font-bold mt-1">
              Paciente chegou sem cadastro?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crie a conta agora ou agende diretamente para um paciente já cadastrado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Button
              onClick={() => setNovoPacOpen(true)}
              variant="outline"
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <UserPlus size={16} aria-hidden="true" />
              Cadastrar paciente
            </Button>
            <Button
              onClick={abrirSolicitarAgendamento}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <CalendarPlus size={16} aria-hidden="true" />
              Solicitar agendamento
            </Button>
          </div>
        </section>

        {/* Filtros */}
        <section className="rounded-2xl border-2 border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-accent" aria-hidden="true" />
            <h2 className="font-display font-bold">Filtrar consultas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="busca"
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Buscar
              </Label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="busca"
                  placeholder="Nome do paciente ou médico..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="esp"
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Especialidade
              </Label>
              <Select
                value={filtroEspecialidade}
                onValueChange={setFiltroEspecialidade}
              >
                <SelectTrigger id="esp" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">
                    Todas as especialidades
                  </SelectItem>
                  {especialidades.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Status
              </Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativos">
                    Ativos (agendado/confirmado)
                  </SelectItem>
                  <SelectItem value="finalizados">Finalizados</SelectItem>
                  <SelectItem value="cancelados">Cancelados</SelectItem>
                  <SelectItem value="faltou">Faltaram</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section
          aria-labelledby="tabela-consultas"
          className="rounded-2xl border-2 border-border bg-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <h2
              id="tabela-consultas"
              className="font-display text-lg font-bold"
            >
              Agendamentos ({filtrados.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold">Paciente</TableHead>
                  <TableHead className="font-semibold">Médico</TableHead>
                  <TableHead className="font-semibold">Especialidade</TableHead>
                  <TableHead className="font-semibold">Data e hora</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Nenhuma consulta encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
                {filtrados.map((a) => {
                  const paciente = getPaciente(a.paciente_id)
                  const medicoNome = getMedicoNome(a.medico_id)
                  const especialidadeNome = getEspecialidadeNome(
                    a.especialidade_id,
                  )
                  const tipoDef =
                    paciente?.deficiencias?.[0]?.tipo_deficiencia?.nome ??
                    (paciente?.possui_autismo ? "TEA (Autismo)" : "")
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <p className="font-semibold">{paciente?.nome ?? "—"}</p>
                        {tipoDef && (
                          <p className="text-xs text-accent font-semibold mt-0.5">
                            {tipoDef}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{medicoNome || "—"}</TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold rounded-full bg-secondary px-2 py-1">
                          {especialidadeNome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">
                          {formatarData(a.data_agendamento)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatarHora(a.horario)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {a.status === "agendado" && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await alterarStatusAgendamento(
                                    a.id,
                                    "confirmado",
                                  )
                                  toast.success("Consulta confirmada", {
                                    description: `${paciente?.nome ?? "Paciente"} • ${formatarData(a.data_agendamento)} às ${formatarHora(a.horario)}`,
                                  })
                                } catch (err) {
                                  toast.error(
                                    err instanceof ApiError
                                      ? err.message
                                      : "Erro ao confirmar.",
                                  )
                                }
                              }}
                              className="gap-1.5 border-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <CheckCircle2
                                size={14}
                                aria-hidden="true"
                              />
                              Confirmar
                            </Button>
                          )}
                          {(a.status === "agendado" ||
                            a.status === "confirmado") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirRemarcar(a)}
                              className="gap-1.5 border-2"
                            >
                              <CalendarClock size={14} aria-hidden="true" />
                              Remarcar
                            </Button>
                          )}
                          {a.status === "agendado" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await cancelarAgendamento(a.id)
                                  toast.success("Consulta cancelada.")
                                } catch {
                                  toast.error("Erro ao cancelar.")
                                }
                              }}
                              className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X size={14} aria-hidden="true" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Médicos rapidamente */}
        <section
          aria-labelledby="medicos-hoje"
          className="rounded-2xl border-2 border-border bg-card p-5"
        >
          <h2
            id="medicos-hoje"
            className="font-display text-lg font-bold mb-4"
          >
            Médicos cadastrados
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicos.map((m) => {
              const nome = getMedicoNome(m.id)
              const especs =
                m.especialidades?.map((e) => e.nome).join(", ") ?? "—"
              return (
                <article
                  key={m.id}
                  className="rounded-xl border-2 border-border bg-card p-4"
                >
                  <p className="font-display font-bold leading-tight truncate">
                    {nome || `Médico #${m.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    CRM {m.crm}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {especs}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      {/* Modal remarcar */}
      <Dialog open={remarcarOpen} onOpenChange={setRemarcarOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Remarcar consulta
            </DialogTitle>
            <DialogDescription>
              {agSelecionado &&
                `Reagendando a consulta de ${
                  getPaciente(agSelecionado.paciente_id)?.nome ?? "paciente"
                }.`}
            </DialogDescription>
          </DialogHeader>

          {agSelecionado && (
            <form onSubmit={confirmarRemarcacao} className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-3 text-sm">
                <p className="font-semibold">Atual:</p>
                <p className="text-muted-foreground">
                  {getMedicoNome(agSelecionado.medico_id)} ·{" "}
                  {formatarData(agSelecionado.data_agendamento)} às{" "}
                  {formatarHora(agSelecionado.horario)}
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="remarcar-medico"
                  className="text-sm font-semibold"
                >
                  Médico
                </Label>
                <Select value={novoMedico} onValueChange={setNovoMedico}>
                  <SelectTrigger id="remarcar-medico" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map((m) => {
                      const nome = getMedicoNome(m.id)
                      const esp =
                        m.especialidades?.map((e) => e.nome).join(", ") ?? ""
                      return (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {nome || `Médico #${m.id}`} · {esp}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="r-data" className="text-sm font-semibold">
                    Nova data
                  </Label>
                  <Input
                    id="r-data"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-hora" className="text-sm font-semibold">
                    Novo horário
                  </Label>
                  <Input
                    id="r-hora"
                    type="time"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemarcarOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  Confirmar remarcação
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: cadastro de paciente presencial */}
      <Dialog open={novoPacOpen} onOpenChange={setNovoPacOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Cadastrar paciente presencial
            </DialogTitle>
            <DialogDescription>
              Cria conta com <code>tipo_usuario = paciente</code> e já vincula
              os dados PCD necessários. Marque "precisa de responsável" se for
              criança/adolescente PCD.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCadastrarPacientePresencial}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="p-nome" className="text-sm font-semibold">
                Nome completo do paciente
              </Label>
              <Input
                id="p-nome"
                value={pacNome}
                onChange={(e) => setPacNome(e.target.value)}
                placeholder="Ex.: Maria Silva"
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="p-email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="p-email"
                  type="email"
                  value={pacEmail}
                  onChange={(e) => setPacEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-tel" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="p-tel"
                  value={pacTel}
                  onChange={(e) => setPacTel(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-senha" className="text-sm font-semibold">
                Senha provisória
              </Label>
              <Input
                id="p-senha"
                type="password"
                value={pacSenha}
                onChange={(e) => setPacSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Oriente o paciente a trocar a senha no primeiro login.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="p-nascimento"
                  className="text-sm font-semibold"
                >
                  Data de nascimento
                </Label>
                <Input
                  id="p-nascimento"
                  type="date"
                  value={pacDataNascimento}
                  onChange={(e) => setPacDataNascimento(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sexo" className="text-sm font-semibold">
                  Sexo
                </Label>
                <Select value={pacSexo} onValueChange={setPacSexo}>
                  <SelectTrigger id="p-sexo" className="h-11">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border-2 border-border bg-secondary/30 p-3 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Marcadores PCD
              </p>
              <label
                htmlFor="p-autismo"
                className="flex items-start gap-3 cursor-pointer rounded-lg hover:bg-card/60 p-2 transition-colors"
              >
                <input
                  id="p-autismo"
                  type="checkbox"
                  checked={pacPossuiAutismo}
                  onChange={(e) => setPacPossuiAutismo(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-2 border-border accent-primary"
                />
                <span className="text-sm font-medium">Possui autismo (TEA)</span>
              </label>
              <label
                htmlFor="p-acess"
                className="flex items-start gap-3 cursor-pointer rounded-lg hover:bg-card/60 p-2 transition-colors"
              >
                <input
                  id="p-acess"
                  type="checkbox"
                  checked={pacNecessitaAcessibilidade}
                  onChange={(e) =>
                    setPacNecessitaAcessibilidade(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-2 border-border accent-primary"
                />
                <span className="text-sm font-medium">
                  Necessita acessibilidade
                </span>
              </label>
              <label
                htmlFor="p-cadeira"
                className="flex items-start gap-3 cursor-pointer rounded-lg hover:bg-card/60 p-2 transition-colors"
              >
                <input
                  id="p-cadeira"
                  type="checkbox"
                  checked={pacUsaCadeiraRodas}
                  onChange={(e) => setPacUsaCadeiraRodas(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-2 border-border accent-primary"
                />
                <span className="text-sm font-medium">Usa cadeira de rodas</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-obs" className="text-sm font-semibold">
                Observações gerais
              </Label>
              <Textarea
                id="p-obs"
                value={pacObservacoes}
                onChange={(e) => setPacObservacoes(e.target.value)}
                placeholder="Anotações clínicas ou contextuais relevantes"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-obs-com" className="text-sm font-semibold">
                Observações de comunicação
              </Label>
              <Textarea
                id="p-obs-com"
                value={pacObservacoesComunicacao}
                onChange={(e) => setPacObservacoesComunicacao(e.target.value)}
                placeholder="Como o paciente se comunica, sensibilidades, etc."
                rows={2}
              />
            </div>

            <label
              htmlFor="p-precisa-resp"
              className="flex items-start gap-3 cursor-pointer rounded-xl border-2 border-border bg-card p-3 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-colors"
            >
              <input
                id="p-precisa-resp"
                type="checkbox"
                checked={pacPrecisaResp}
                onChange={(e) => setPacPrecisaResp(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-2 border-border accent-primary"
              />
              <span className="text-sm leading-relaxed">
                <span className="font-display font-bold block">
                  Precisa de responsável vinculado
                </span>
                <span className="text-muted-foreground">
                  Marque para crianças/adolescentes PCD. O vínculo pode ser
                  feito em seguida pelo próprio paciente.
                </span>
              </span>
            </label>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNovoPacOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Cadastrar paciente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: solicitar agendamento (recepção cria agendamento para o paciente) */}
      <Dialog
        open={novoAgOpen}
        onOpenChange={(open) => {
          if (!open) fecharSolicitarAgendamento()
          else setNovoAgOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {!agEmSucesso ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Solicitar agendamento
                </DialogTitle>
                <DialogDescription>
                  Crie um agendamento para um paciente já cadastrado. Após
                  criar, você pode confirmar a consulta na hora.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSolicitarAgendamento}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="ag-paciente"
                    className="text-sm font-semibold"
                  >
                    Paciente
                  </Label>
                  <Select
                    value={agPacienteId}
                    onValueChange={setAgPacienteId}
                  >
                    <SelectTrigger id="ag-paciente" className="h-11">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.length === 0 && (
                        <SelectItem value="__vazio" disabled>
                          Nenhum paciente cadastrado
                        </SelectItem>
                      )}
                      {pacientes.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nome}
                          {p.possui_autismo ? " • TEA" : ""}
                          {p.usa_cadeira_rodas ? " • Cadeira de rodas" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ag-medico"
                      className="text-sm font-semibold"
                    >
                      Médico
                    </Label>
                    <Select value={agMedicoId} onValueChange={setAgMedicoId}>
                      <SelectTrigger id="ag-medico" className="h-11">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicos.map((m) => {
                          const nome = getMedicoNome(m.id) || `Médico #${m.id}`
                          return (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {nome} · {m.crm}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="ag-esp"
                      className="text-sm font-semibold"
                    >
                      Especialidade
                    </Label>
                    <Select
                      value={agEspecialidadeId}
                      onValueChange={setAgEspecialidadeId}
                    >
                      <SelectTrigger id="ag-esp" className="h-11">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {especialidades.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ag-data"
                      className="text-sm font-semibold"
                    >
                      Data
                    </Label>
                    <Input
                      id="ag-data"
                      type="date"
                      value={agData}
                      onChange={(e) => setAgData(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="ag-hora"
                      className="text-sm font-semibold"
                    >
                      Horário
                    </Label>
                    <Input
                      id="ag-hora"
                      type="time"
                      value={agHora}
                      onChange={(e) => setAgHora(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ag-obs" className="text-sm font-semibold">
                    Observações
                  </Label>
                  <Textarea
                    id="ag-obs"
                    value={agObs}
                    onChange={(e) => setAgObs(e.target.value)}
                    placeholder="Anotações relevantes (opcional)"
                    rows={2}
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fecharSolicitarAgendamento}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={agEnviando}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {agEnviando ? "Criando..." : "Solicitar agendamento"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl flex items-center gap-2">
                  <CheckCircle2
                    size={22}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  Agendamento criado
                </DialogTitle>
                <DialogDescription>
                  A consulta foi registrada como "agendada". Você pode
                  confirmar agora para o paciente.
                </DialogDescription>
              </DialogHeader>

              {agCriado && (
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-primary font-bold">
                    Resumo
                  </p>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Paciente</dt>
                      <dd className="font-semibold">
                        {getPaciente(agCriado.paciente_id)?.nome ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Médico</dt>
                      <dd className="font-semibold">
                        {getMedicoNome(agCriado.medico_id) || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Data</dt>
                      <dd className="font-semibold">
                        {formatarData(agCriado.data_agendamento)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Horário</dt>
                      <dd className="font-semibold">
                        {formatarHora(agCriado.horario)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Especialidade</dt>
                      <dd className="font-semibold">
                        {getEspecialidadeNome(agCriado.especialidade_id)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fecharSolicitarAgendamento}
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarAgendamentoCriado}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Confirmar agora
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
