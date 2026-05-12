"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    getMedicoNome,
    getEspecialidadeNome,
    getPaciente,
    remarcarAgendamento,
    cancelarAgendamento,
  } = useHospital()
  const [busca, setBusca] = useState("")
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("todas")
  const [filtroStatus, setFiltroStatus] = useState<string>("ativos")

  const [remarcarOpen, setRemarcarOpen] = useState(false)
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null)
  const [novaData, setNovaData] = useState("")
  const [novaHora, setNovaHora] = useState("")
  const [novoMedico, setNovoMedico] = useState<string>("")

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
              Icon: Users,
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
    </div>
  )
}
