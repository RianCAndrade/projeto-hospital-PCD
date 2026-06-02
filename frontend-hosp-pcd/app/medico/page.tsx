"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatusBadge } from "@/components/status-badge"
import { AppointmentCard } from "@/components/appointment-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Stethoscope,
  PlayCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Users,
  FileText,
  CalendarDays,
  AlertCircle,
  X,
  BellRing,
} from "lucide-react"
import { toast } from "sonner"
import type { Agendamento } from "@/lib/types"
import { ApiError } from "@/lib/api"

function montarDate(data: string, horario: string) {
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

function formatarHora(data: string, horario: string) {
  const d = montarDate(data, horario)
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`
}

/**
 * Formata quanto tempo atrás o paciente foi chamado, baseado no
 * `updated_at` do agendamento. Usado para mostrar "há 2 min" no card
 * em destaque e na lista da fila.
 */
function tempoChamado(updatedAt: string | undefined, now = Date.now()) {
  if (!updatedAt) return ""
  const t = new Date(updatedAt).getTime()
  if (Number.isNaN(t)) return ""
  const diffMs = now - t
  if (diffMs < 30_000) return "agora"
  const min = Math.floor(diffMs / 60_000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  return `há ${h}h`
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
]

/** Cabeçalho amigável para um YYYY-MM-DD: "Hoje", "Amanhã" ou "Sex, 05/12". */
function rotuloData(data: string) {
  const ag = montarDate(data, "00:00:00")
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diffDias = Math.round(
    (ag.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDias === 0) return "Hoje"
  if (diffDias === 1) return "Amanhã"
  return `${DIAS_SEMANA[ag.getDay()]}, ${ag.getDate().toString().padStart(2, "0")}/${MESES[ag.getMonth()]}`
}

function toDateKey(data: string) {
  return data.slice(0, 10)
}

export default function MedicoPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    agendamentos,
    medicos,
    especialidades,
    getPaciente,
    alterarStatusAgendamento,
    cancelarAgendamento,
    chamarAgendamento,
    iniciarAtendimentoAgendamento,
    carregarBootstrap,
  } = useHospital()
  const [encerrarOpen, setEncerrarOpen] = useState(false)
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null)
  const [observacoesEncerrar, setObservacoesEncerrar] = useState("")
  /**
   * Tick que avança a cada 60s. Usado para re-renderizar o texto
   * "há X min" dos cards em estado `chamado`. Mantemos no nível da
   * página inteira para evitar N `setInterval` por card.
   */
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "medico") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  // Polling + listeners de storage/foco, idênticos ao painel do paciente,
  // para detectar novos agendamentos confirmados pela recepção.
  useEffect(() => {
    if (!usuarioLogado) return
    const interval = setInterval(() => {
      void carregarBootstrap()
    }, 30_000)
    return () => clearInterval(interval)
  }, [usuarioLogado, carregarBootstrap])

  useEffect(() => {
    if (!usuarioLogado || typeof window === "undefined") return
    const handler = () => {
      void carregarBootstrap()
    }
    window.addEventListener("acolher:mock-updated", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("acolher:mock-updated", handler)
      window.removeEventListener("focus", handler)
    }
  }, [usuarioLogado, carregarBootstrap])

  // Encontra o registro Medico (tbmedicos) pelo usuario_id do logado
  const meuMedico = useMemo(
    () => medicos.find((m) => m.usuario_id === usuarioLogado?.id),
    [medicos, usuarioLogado],
  )

  const minhaEspecialidade = useMemo(() => {
    const id = meuMedico?.especialidades?.[0]?.id
    return especialidades.find((e) => e.id === id)?.nome ?? "Médico(a)"
  }, [meuMedico, especialidades])

  const meusAgendamentos = useMemo(
    () => agendamentos.filter((a) => a.medico_id === meuMedico?.id),
    [agendamentos, meuMedico],
  )

  /**
   * "Em atendimento" — status distinto de "confirmado". Só entra aqui
   * quando o médico clica em "Iniciar atendimento". `confirmado` significa
   * apenas que a recepção confirmou que o paciente comparecerá naquele dia.
   */
  const emAtendimento = useMemo(
    () =>
      meusAgendamentos
        .filter((a) => a.status === "em_atendimento")
        .sort(
          (a, b) =>
            montarDate(a.data_agendamento, a.horario).getTime() -
            montarDate(b.data_agendamento, b.horario).getTime(),
        ),
    [meusAgendamentos],
  )

  /**
   * Data de hoje (zerada em horas) para separar "hoje" de "próximos dias".
   * Recriada a cada renderização — barato e suficiente para a lógica.
   */
  const hojeKey = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${dd}`
  }, [])

  const limiteProximosKey = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${dd}`
  }, [])

  const isHoje = (data: string) => toDateKey(data) === hojeKey

  const isProximo = (data: string) => {
    const k = toDateKey(data)
    return k > hojeKey && k <= limiteProximosKey
  }

  const filaHoje = useMemo(
    () =>
      meusAgendamentos
        .filter(
          (a) =>
            (a.status === "agendado" ||
              a.status === "confirmado" ||
              a.status === "chamado") &&
            isHoje(a.data_agendamento),
        )
        .sort((a, b) => {
          // Ordem de prioridade na fila:
          //   1) chamado (esperando o paciente chegar)
          //   2) confirmado (pronto para chamar)
          //   3) agendado (ainda depende da recepção confirmar)
          const rank = (s: typeof a.status) =>
            s === "chamado" ? 0 : s === "confirmado" ? 1 : 2
          const ra = rank(a.status)
          const rb = rank(b.status)
          if (ra !== rb) return ra - rb
          return (
            montarDate(a.data_agendamento, a.horario).getTime() -
            montarDate(b.data_agendamento, b.horario).getTime()
          )
        }),
    [meusAgendamentos, hojeKey],
  )

  /**
   * Próximos dias (amanhã até +7 dias), agrupados por data para renderizar
   * um cabeçalho por dia ("Amanhã", "Sex, 05/12", etc.).
   */
  const filaProximos = useMemo(() => {
    const grupos: { data: string; itens: Agendamento[] }[] = []
    for (const a of meusAgendamentos
      .filter(
        (a) =>
          (a.status === "agendado" || a.status === "confirmado") &&
          isProximo(a.data_agendamento),
      )
      .sort(
        (a, b) =>
          montarDate(a.data_agendamento, a.horario).getTime() -
          montarDate(b.data_agendamento, b.horario).getTime(),
      )) {
      const k = toDateKey(a.data_agendamento)
        const grupo = grupos.find((g) => g.data === k)
        if (grupo) {
          grupo.itens.push(a)
        } else {
          grupos.push({ data: k, itens: [a] })
        }
    }
    return grupos
  }, [meusAgendamentos, hojeKey, limiteProximosKey])

  const totalAguardando = useMemo(
    () =>
      meusAgendamentos.filter(
        (a) =>
          (a.status === "agendado" ||
            a.status === "confirmado" ||
            a.status === "chamado") &&
          (isHoje(a.data_agendamento) || isProximo(a.data_agendamento)),
      ).length,
    [meusAgendamentos, hojeKey, limiteProximosKey],
  )

  const finalizados = useMemo(
    () =>
      meusAgendamentos
        .filter((a) => a.status === "finalizado")
        .sort(
          (a, b) =>
            montarDate(b.data_agendamento, b.horario).getTime() -
            montarDate(a.data_agendamento, a.horario).getTime(),
        ),
    [meusAgendamentos],
  )

  async function chamar(a: Agendamento) {
    try {
      await chamarAgendamento(a.id)
      const pacienteNome = getPaciente(a.paciente_id)?.nome ?? "paciente"
      toast.success("Paciente chamado", {
        description: `${pacienteNome} foi chamado(a). Aguarde a chegada para iniciar.`,
      })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível chamar o paciente."
      toast.error(msg)
    }
  }

  async function iniciarAtendimento(a: Agendamento) {
    try {
      await iniciarAtendimentoAgendamento(a.id)
      const pacienteNome = getPaciente(a.paciente_id)?.nome ?? "paciente"
      toast.success("Atendimento iniciado", {
        description: `Paciente ${pacienteNome} marcado como em atendimento.`,
      })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível iniciar o atendimento."
      toast.error(msg)
    }
  }

  async function marcarFaltou(a: Agendamento) {
    try {
      await alterarStatusAgendamento(a.id, "faltou")
      const pacienteNome = getPaciente(a.paciente_id)?.nome ?? "paciente"
      toast.success("Falta registrada", {
        description: `${pacienteNome} marcado(a) como não compareceu.`,
      })
    } catch {
      toast.error("Não foi possível registrar a falta.")
    }
  }

  async function cancelar(a: Agendamento) {
    try {
      await cancelarAgendamento(a.id)
      const pacienteNome = getPaciente(a.paciente_id)?.nome ?? "paciente"
      toast.success("Consulta cancelada", {
        description: `${pacienteNome} foi removido(a) da agenda.`,
      })
    } catch {
      toast.error("Não foi possível cancelar a consulta.")
    }
  }

  function abrirEncerrar(a: Agendamento) {
    setAgSelecionado(a)
    setObservacoesEncerrar("")
    setEncerrarOpen(true)
  }

  async function confirmarEncerrar() {
    if (!agSelecionado) return
    try {
      await alterarStatusAgendamento(agSelecionado.id, "finalizado")
      const pacienteNome =
        getPaciente(agSelecionado.paciente_id)?.nome ?? "paciente"
      toast.success("Atendimento encerrado", {
        description: `Consulta de ${pacienteNome} finalizada.`,
      })
      setEncerrarOpen(false)
    } catch (err) {
      toast.error("Não foi possível encerrar o atendimento.")
    }
  }

  if (!usuarioLogado) return null

  // O primeiro (e idealmente único) atendimento em andamento vira destaque.
  const atendendoAgora = emAtendimento[0] ?? null
  // "Próximo" só faz sentido quando não há ninguém em atendimento,
  // e nunca aponta para um `agendado` (ainda depende da recepção
  // confirmar — não há ação possível até lá).
  const proximo = atendendoAgora
    ? null
    : (filaHoje.find(
        (a) => a.status === "chamado" || a.status === "confirmado",
      ) ?? null)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel={minhaEspecialidade}
        titulo={`${usuarioLogado.nome}`}
        descricao="Acompanhe e atenda os pacientes agendados com você. Atualize o status conforme avança a consulta."
      />

      <main
        id="conteudo-principal"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Métricas */}
        <section aria-label="Resumo do médico" className="grid grid-cols-3 gap-4">
          <article className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-accent font-bold">
                Aguardando
              </p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Clock size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="font-display text-4xl font-bold mt-3 text-accent">
              {totalAguardando}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              hoje + próximos 30 dias
            </p>
          </article>
          <article className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-primary font-bold">
                Em atendimento
              </p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Stethoscope size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="font-display text-4xl font-bold mt-3 text-primary">
              {emAtendimento.length}
            </p>
          </article>
          <article className="rounded-2xl border-2 border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Finalizados
              </p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <CheckCircle2 size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="font-display text-4xl font-bold mt-3">
              {finalizados.length}
            </p>
          </article>
        </section>

        {/* Próximo paciente em destaque */}
        {(atendendoAgora || proximo) && (
          <section aria-labelledby="proximo-paciente">
            <h2
              id="proximo-paciente"
              className="font-display text-2xl font-bold mb-4"
            >
              {atendendoAgora ? "Atendendo agora" : "Próximo paciente"}
            </h2>
            {(() => {
              const ag = atendendoAgora ?? proximo!
              const paciente = getPaciente(ag.paciente_id)
              const ehEmAtendimento = ag.status === "em_atendimento"
              const ehChamado = ag.status === "chamado"
              return (
                <article
                  className={`rounded-2xl border-2 p-6 sm:p-8 ${
                    ehEmAtendimento
                      ? "border-primary bg-primary text-primary-foreground"
                      : ehChamado
                        ? "border-amber-500 bg-amber-50 text-amber-950"
                        : "border-accent bg-accent/5"
                  }`}
                >
                  <div className="grid lg:grid-cols-[auto,1fr,auto] gap-6 items-start">
                    <div
                      className={`rounded-xl px-5 py-4 text-center w-24 ${
                        ehEmAtendimento
                          ? "bg-primary-foreground/15"
                          : ehChamado
                            ? "bg-amber-500 text-white"
                            : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-widest font-bold opacity-90">
                        {ehChamado ? "Chamado" : "Hoje"}
                      </p>
                      <p className="font-display text-3xl font-bold mt-1">
                        {formatarHora(ag.data_agendamento, ag.horario)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div>
                          <p
                            className={`text-xs uppercase tracking-widest font-bold ${
                              ehEmAtendimento
                                ? "text-primary-foreground/70"
                                : ehChamado
                                  ? "text-amber-700"
                                  : "text-muted-foreground"
                            }`}
                          >
                            Paciente
                          </p>
                          <h3 className="font-display text-2xl font-bold mt-1 leading-tight">
                            {paciente?.nome ?? "—"}
                          </h3>
                          {paciente && (
                            <p
                              className={`text-sm mt-1 ${
                                ehEmAtendimento
                                  ? "text-primary-foreground/85"
                                  : ehChamado
                                    ? "text-amber-900/80"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {paciente.possui_autismo && "TEA · "}
                              {paciente.usa_cadeira_rodas && "Cadeirante · "}
                              {paciente.necessita_acompanhante && "Com acompanhante"}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {ehChamado && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-800 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                              <BellRing size={14} aria-hidden="true" />
                              {tempoChamado(ag.updated_at)}
                            </span>
                          )}
                          <StatusBadge status={ag.status} size="lg" />
                        </div>
                      </div>

                      {ag.observacoes && (
                        <div
                          className={`mt-5 rounded-xl p-4 ${
                            ehEmAtendimento
                              ? "bg-primary-foreground/10"
                              : ehChamado
                                ? "bg-amber-100/60 border border-amber-200"
                                : "bg-card border border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText size={14} aria-hidden="true" />
                            <p className="text-xs uppercase tracking-widest font-bold opacity-80">
                              Observações
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {ag.observacoes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      {ag.status === "confirmado" && (
                        <>
                          <Button
                            size="lg"
                            onClick={() => chamar(ag)}
                            className="bg-amber-500 hover:bg-amber-600 text-white gap-2 h-12 text-base"
                          >
                            <BellRing size={20} aria-hidden="true" />
                            Chamar paciente
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarFaltou(ag)}
                              className="border-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 gap-1.5"
                            >
                              <AlertCircle
                                size={14}
                                aria-hidden="true"
                              />
                              Não compareceu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelar(ag)}
                              className="border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                            >
                              <X size={14} aria-hidden="true" />
                              Cancelar
                            </Button>
                          </div>
                        </>
                      )}
                      {ehChamado && (
                        <>
                          <Button
                            size="lg"
                            onClick={() => iniciarAtendimento(ag)}
                            className="bg-primary hover:bg-primary/90 gap-2 h-12 text-base"
                          >
                            <PlayCircle size={20} aria-hidden="true" />
                            Iniciar atendimento
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarFaltou(ag)}
                              className="border-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 gap-1.5"
                            >
                              <AlertCircle
                                size={14}
                                aria-hidden="true"
                              />
                              Não compareceu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelar(ag)}
                              className="border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                            >
                              <X size={14} aria-hidden="true" />
                              Cancelar
                            </Button>
                          </div>
                        </>
                      )}
                      {ehEmAtendimento && (
                        <Button
                          size="lg"
                          onClick={() => abrirEncerrar(ag)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-12 text-base"
                        >
                          <CheckCircle2 size={20} aria-hidden="true" />
                          Encerrar atendimento
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })()}
          </section>
        )}

        {/* Tabs */}
        <section aria-labelledby="agenda">
          <h2 id="agenda" className="sr-only">
            Agenda
          </h2>
          <Tabs defaultValue="hoje">
            <TabsList className="grid grid-cols-3 w-full max-w-3xl">
              <TabsTrigger value="hoje" className="gap-2">
                <Clock size={16} aria-hidden="true" />
                Hoje ({filaHoje.length})
              </TabsTrigger>
              <TabsTrigger value="proximos" className="gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                Próximos dias ({filaProximos.reduce(
                  (acc, g) => acc + g.itens.length,
                  0,
                )})
              </TabsTrigger>
              <TabsTrigger value="finalizados" className="gap-2">
                <CheckCircle2 size={16} aria-hidden="true" />
                Finalizados ({finalizados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hoje" className="mt-4 space-y-4">
              {filaHoje.length === 0 ? (
                <EmptyState
                  Icon={ClipboardList}
                  mensagem="Nenhum paciente na fila de hoje."
                />
              ) : (
                filaHoje.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    agendamento={a}
                    destaque={a.status === "em_atendimento"}
                    acoes={
                      a.status === "em_atendimento" ? (
                        <Button
                          onClick={() => abrirEncerrar(a)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          Encerrar atendimento
                        </Button>
                      ) : a.status === "chamado" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => iniciarAtendimento(a)}
                            className="bg-primary hover:bg-primary/90 gap-2"
                          >
                            <PlayCircle size={16} aria-hidden="true" />
                            Iniciar atendimento
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarFaltou(a)}
                            className="border-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 gap-1.5"
                          >
                            <AlertCircle size={14} aria-hidden="true" />
                            Não compareceu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelar(a)}
                            className="border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                          >
                            <X size={14} aria-hidden="true" />
                            Cancelar
                          </Button>
                        </div>
                      ) : a.status === "confirmado" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => chamar(a)}
                            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                          >
                            <BellRing size={16} aria-hidden="true" />
                            Chamar paciente
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarFaltou(a)}
                            className="border-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 gap-1.5"
                          >
                            <AlertCircle size={14} aria-hidden="true" />
                            Não compareceu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelar(a)}
                            className="border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                          >
                            <X size={14} aria-hidden="true" />
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                          <Clock size={14} aria-hidden="true" />
                          Aguardando confirmação da recepção
                        </p>
                      )
                    }
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="proximos" className="mt-4 space-y-6">
              {filaProximos.length === 0 ? (
                <EmptyState
                  Icon={CalendarDays}
                  mensagem="Nenhum agendamento nos próximos 30 dias."
                />
              ) : (
                filaProximos.map((grupo) => (
                  <div key={grupo.data} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <CalendarDays
                        size={14}
                        className="text-accent"
                        aria-hidden="true"
                      />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {rotuloData(grupo.data)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        · {grupo.itens.length}{" "}
                        {grupo.itens.length === 1
                          ? "consulta"
                          : "consultas"}
                      </span>
                    </div>
                    {grupo.itens.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        agendamento={a}
                        acoes={
                          isHoje(a.data_agendamento) ? null : (
                            <span className="text-xs text-muted-foreground italic">
                              Recepção confirma no dia
                            </span>
                          )
                        }
                      />
                    ))}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="finalizados" className="mt-4 space-y-4">
              {finalizados.length === 0 ? (
                <EmptyState
                  Icon={Users}
                  mensagem="Nenhum atendimento finalizado ainda."
                />
              ) : (
                finalizados.map((a) => (
                  <AppointmentCard key={a.id} agendamento={a} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Modal encerrar */}
      <Dialog open={encerrarOpen} onOpenChange={setEncerrarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Encerrar atendimento
            </DialogTitle>
            <DialogDescription>
              {agSelecionado &&
                `Confirme o encerramento da consulta de ${
                  getPaciente(agSelecionado.paciente_id)?.nome ?? "paciente"
                }. O status do agendamento mudará para "finalizado".`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="enc-obs" className="text-sm font-semibold">
              Observações finais{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="enc-obs"
              placeholder="Anotações da consulta, próximos passos, retorno..."
              value={observacoesEncerrar}
              onChange={(e) => setObservacoesEncerrar(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEncerrarOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarEncerrar}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Confirmar encerramento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({
  Icon,
  mensagem,
}: {
  Icon: typeof ClipboardList
  mensagem: string
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-foreground mx-auto">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="text-muted-foreground mt-3">{mensagem}</p>
    </div>
  )
}
