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
import { Search, Calendar, Users, Filter, CalendarClock, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"
import type { Especialidade, TipoDeficiencia, Agendamento } from "@/lib/types"

const especialidades: (Especialidade | "todas")[] = [
  "todas",
  "Neuropediatria",
  "Fonoaudiologia",
  "Fisioterapia",
  "Terapia Ocupacional",
  "Psicologia Infantil",
  "Pediatria Geral",
  "Ortopedia Pediátrica",
  "Oftalmologia Pediátrica",
]

const tiposDeficiencia: (TipoDeficiencia | "todas")[] = [
  "todas",
  "Física",
  "Intelectual",
  "Auditiva",
  "Visual",
  "Múltipla",
  "TEA (Autismo)",
  "Síndrome de Down",
  "Outra",
]

function formatarDataHoraCurta(iso: string) {
  const d = new Date(iso)
  return {
    data: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`,
    hora: `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
  }
}

export default function RecepcionistaPage() {
  const router = useRouter()
  const { usuarioLogado, agendamentos, medicos, remarcarAgendamento, cancelarAgendamento } = useHospital()
  const [busca, setBusca] = useState("")
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("todas")
  const [filtroDeficiencia, setFiltroDeficiencia] = useState<string>("todas")
  const [filtroStatus, setFiltroStatus] = useState<string>("ativos")

  const [remarcarOpen, setRemarcarOpen] = useState(false)
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null)
  const [novaData, setNovaData] = useState("")
  const [novaHora, setNovaHora] = useState("")
  const [novoMedico, setNovoMedico] = useState("")

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.perfil !== "recepcionista") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const filtrados = useMemo(() => {
    return agendamentos
      .filter((a) => {
        if (filtroStatus === "ativos") return a.status === "aguardando" || a.status === "em_atendimento"
        if (filtroStatus === "encerrados") return a.status === "encerrado"
        if (filtroStatus === "cancelados") return a.status === "cancelado"
        return true
      })
      .filter((a) => filtroEspecialidade === "todas" || a.especialidade === filtroEspecialidade)
      .filter((a) => filtroDeficiencia === "todas" || a.tipoDeficiencia === filtroDeficiencia)
      .filter((a) => {
        const q = busca.toLowerCase().trim()
        if (!q) return true
        return (
          a.pacienteNome.toLowerCase().includes(q) ||
          a.criancaNome.toLowerCase().includes(q) ||
          a.medicoNome.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
  }, [agendamentos, filtroEspecialidade, filtroDeficiencia, filtroStatus, busca])

  const stats = useMemo(() => {
    const hoje = new Date().toDateString()
    return {
      hoje: agendamentos.filter((a) => new Date(a.dataHora).toDateString() === hoje).length,
      aguardando: agendamentos.filter((a) => a.status === "aguardando").length,
      ematendimento: agendamentos.filter((a) => a.status === "em_atendimento").length,
      semMedicoDisp: agendamentos.filter((a) => {
        if (a.status !== "aguardando") return false
        const med = medicos.find((m) => m.id === a.medicoId)
        return med && !med.disponivelHoje
      }).length,
    }
  }, [agendamentos, medicos])

  function abrirRemarcar(a: Agendamento) {
    setAgSelecionado(a)
    setNovaData("")
    setNovaHora("")
    setNovoMedico(a.medicoId)
    setRemarcarOpen(true)
  }

  function confirmarRemarcacao(e: React.FormEvent) {
    e.preventDefault()
    if (!agSelecionado || !novaData || !novaHora) {
      toast.error("Informe a nova data e horário.")
      return
    }
    const dataISO = new Date(`${novaData}T${novaHora}`).toISOString()
    remarcarAgendamento(agSelecionado.id, dataISO, novoMedico !== agSelecionado.medicoId ? novoMedico : undefined)
    toast.success("Consulta remarcada", {
      description: `${agSelecionado.criancaNome} agora está agendada para ${novaData} às ${novaHora}.`,
    })
    setRemarcarOpen(false)
  }

  if (!usuarioLogado) return null

  const medicosCompativeisRemarcacao = agSelecionado
    ? medicos.filter((m) => m.atendeDeficiencias.includes(agSelecionado.tipoDeficiencia))
    : []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel="Recepção"
        titulo="Painel da recepção"
        descricao="Gerencie consultas das mães. Verifique disponibilidade dos médicos, remarque ou cancele atendimentos quando necessário."
      />

      <main id="conteudo-principal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Métricas rápidas */}
        <section aria-label="Resumo do dia" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Consultas hoje", valor: stats.hoje, Icon: Calendar, cor: "primary" },
            { label: "Aguardando", valor: stats.aguardando, Icon: CalendarClock, cor: "accent" },
            { label: "Em atendimento", valor: stats.ematendimento, Icon: Users, cor: "primary" },
            { label: "Sem médico disponível", valor: stats.semMedicoDisp, Icon: AlertTriangle, cor: "destructive" },
          ].map(({ label, valor, Icon, cor }) => (
            <article
              key={label}
              className="rounded-2xl border-2 border-border bg-card p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="busca" className="text-xs font-semibold uppercase tracking-wider">Buscar</Label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="busca"
                  placeholder="Nome do paciente, criança ou médico..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="esp" className="text-xs font-semibold uppercase tracking-wider">Especialidade</Label>
              <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
                <SelectTrigger id="esp" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e === "todas" ? "Todas as especialidades" : e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="def" className="text-xs font-semibold uppercase tracking-wider">Deficiência</Label>
              <Select value={filtroDeficiencia} onValueChange={setFiltroDeficiencia}>
                <SelectTrigger id="def" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDeficiencia.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "todas" ? "Todas as deficiências" : t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="encerrados">Encerrados</SelectItem>
                  <SelectItem value="cancelados">Cancelados</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section aria-labelledby="tabela-consultas" className="rounded-2xl border-2 border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <h2 id="tabela-consultas" className="font-display text-lg font-bold">
              Agendamentos ({filtrados.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Em destaque: pacientes cujo médico não está disponível hoje.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold">Paciente / Criança</TableHead>
                  <TableHead className="font-semibold">Médico</TableHead>
                  <TableHead className="font-semibold">Especialidade</TableHead>
                  <TableHead className="font-semibold">Data e hora</TableHead>
                  <TableHead className="font-semibold">Disp.</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma consulta encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
                {filtrados.map((a) => {
                  const medico = medicos.find((m) => m.id === a.medicoId)
                  const dataF = formatarDataHoraCurta(a.dataHora)
                  const semMedico = !medico?.disponivelHoje && a.status === "aguardando"
                  return (
                    <TableRow key={a.id} className={semMedico ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">
                        <p className="font-semibold">{a.criancaNome}</p>
                        <p className="text-xs text-muted-foreground">Mãe: {a.pacienteNome}</p>
                        <p className="text-xs text-accent font-semibold mt-0.5">{a.tipoDeficiencia}</p>
                      </TableCell>
                      <TableCell>{a.medicoNome}</TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold rounded-full bg-secondary px-2 py-1">
                          {a.especialidade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{dataF.data}</p>
                        <p className="text-xs text-muted-foreground">{dataF.hora}</p>
                      </TableCell>
                      <TableCell>
                        {medico?.disponivelHoje ? (
                          <span className="text-xs font-semibold text-primary">Disponível</span>
                        ) : (
                          <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                            <AlertTriangle size={12} aria-hidden="true" /> Indisponível
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {(a.status === "aguardando" || a.status === "em_atendimento") && (
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
                          {a.status === "aguardando" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                cancelarAgendamento(a.id)
                                toast.success("Consulta cancelada.")
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

        {/* Médicos disponibilidade rápida */}
        <section aria-labelledby="medicos-hoje" className="rounded-2xl border-2 border-border bg-card p-5">
          <h2 id="medicos-hoje" className="font-display text-lg font-bold mb-4">
            Médicos hoje
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicos.map((m) => (
              <article
                key={m.id}
                className={`rounded-xl border-2 p-4 ${
                  m.disponivelHoje
                    ? "border-primary/30 bg-primary/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold leading-tight truncate">{m.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.especialidade}</p>
                  </div>
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-1 whitespace-nowrap ${
                      m.disponivelHoje
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {m.disponivelHoje ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Atende: {m.atendeDeficiencias.slice(0, 2).join(", ")}
                  {m.atendeDeficiencias.length > 2 && ` +${m.atendeDeficiencias.length - 2}`}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Modal remarcar */}
      <Dialog open={remarcarOpen} onOpenChange={setRemarcarOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Remarcar consulta</DialogTitle>
            <DialogDescription>
              {agSelecionado &&
                `Reagendando a consulta de ${agSelecionado.criancaNome} (mãe: ${agSelecionado.pacienteNome}).`}
            </DialogDescription>
          </DialogHeader>

          {agSelecionado && (
            <form onSubmit={confirmarRemarcacao} className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-3 text-sm">
                <p className="font-semibold">Atual:</p>
                <p className="text-muted-foreground">
                  {agSelecionado.medicoNome} · {formatarDataHoraCurta(agSelecionado.dataHora).data} às{" "}
                  {formatarDataHoraCurta(agSelecionado.dataHora).hora}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarcar-medico" className="text-sm font-semibold">
                  Médico ({medicosCompativeisRemarcacao.length} compatíveis)
                </Label>
                <Select value={novoMedico} onValueChange={setNovoMedico}>
                  <SelectTrigger id="remarcar-medico" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicosCompativeisRemarcacao.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome} · {m.especialidade} {m.disponivelHoje ? "" : "(indisp. hoje)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="r-data" className="text-sm font-semibold">Nova data</Label>
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
                  <Label htmlFor="r-hora" className="text-sm font-semibold">Novo horário</Label>
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
                <Button type="button" variant="outline" onClick={() => setRemarcarOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
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
