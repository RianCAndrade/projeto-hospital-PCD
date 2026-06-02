"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppointmentCard } from "@/components/appointment-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  CalendarPlus,
  History,
  Calendar,
  Baby,
  AlertCircle,
  HeartHandshake,
  UserPlus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"
import type { StatusAgendamento } from "@/lib/types"

function montarDate(data: string, horario: string) {
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

const mesesCurtos = [
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

function formatarDataCurta(data: string) {
  const [, m, d] = data.split("-")
  return `${d}/${m}`
}

function formatarHoraCurta(horario: string) {
  return horario.slice(0, 5)
}

export default function PacientePage() {
  const router = useRouter()
  const {
    usuarioLogado,
    agendamentos,
    medicos,
    especialidades,
    pacientes,
    responsaveis,
    pacientesDoUsuario,
    criarAgendamento,
    cancelarAgendamento,
    vincularResponsavel,
    removerResponsavel,
    getUsuario,
    getMedicoNome,
    carregarBootstrap,
  } = useHospital()

  const [novoOpen, setNovoOpen] = useState(false)
  const [pacienteId, setPacienteId] = useState<string>("")
  const [medicoId, setMedicoId] = useState<string>("")
  const [especialidadeId, setEspecialidadeId] = useState<string>("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [obs, setObs] = useState("")

  // Vínculo de responsável (paciente adulto que precisa de cuidador)
  const [respOpen, setRespOpen] = useState(false)
  const [respNome, setRespNome] = useState("")
  const [respEmail, setRespEmail] = useState("")
  const [respTel, setRespTel] = useState("")
  const [respSenha, setRespSenha] = useState("")
  const [respParentesco, setRespParentesco] = useState("Mãe")
  const [respPrincipal, setRespPrincipal] = useState(true)

  useEffect(() => {
    if (
      !usuarioLogado ||
      (usuarioLogado.tipo_usuario !== "responsavel" &&
        usuarioLogado.tipo_usuario !== "paciente")
    ) {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const meusPacientes = useMemo(
    () => (usuarioLogado ? pacientesDoUsuario(usuarioLogado.id) : []),
    [usuarioLogado, pacientesDoUsuario],
  )

  /**
   * Quando o usuário logado é o próprio paciente (`tipo_usuario === "paciente"`),
   * achamos a linha em `tbpacientes` cuja `usuario_id` aponta para ele.
   * É a partir desse paciente que listamos / vinculamos responsáveis.
   */
  const meuPacienteSelf = useMemo(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "paciente") {
      return null
    }
    return pacientes.find((p) => p.usuario_id === usuarioLogado.id) ?? null
  }, [pacientes, usuarioLogado])

  const meusAgendamentos = useMemo(() => {
    // IDs cobertos: (1) pacientes dos quais o usuário logado é responsável
    // e (2) o próprio paciente quando o usuário logado é um paciente
    // autônomo (criado com `pacientes.usuario_id = usuarioLogado.id`).
    // Sem o item (2), um paciente que agenda para si mesmo nunca veria
    // seus próprios agendamentos.
    const ids = new Set<number>(meusPacientes.map((p) => p.id))
    if (meuPacienteSelf) ids.add(meuPacienteSelf.id)
    return agendamentos.filter((a) => ids.has(a.paciente_id))
  }, [agendamentos, meusPacientes, meuPacienteSelf])

  // Polling do bootstrap a cada 30s para detectar mudanças vindas de
  // outros dispositivos (ex.: recepção confirma um agendamento).
  useEffect(() => {
    if (!usuarioLogado) return
    const interval = setInterval(() => {
      void carregarBootstrap()
    }, 30_000)
    return () => clearInterval(interval)
  }, [usuarioLogado, carregarBootstrap])

  // Sincronia quase instantânea entre abas: quando OUTRA aba grava no
  // mock (ex.: recepção confirma um agendamento), o `mock.ts` dispara
  // `acolher:mock-updated` após re-hidratar. Re-baixamos o bootstrap
  // imediatamente para o detector de status disparar o toast.
  useEffect(() => {
    if (!usuarioLogado || typeof window === "undefined") return
    const handler = () => {
      void carregarBootstrap()
    }
    window.addEventListener("acolher:mock-updated", handler)
    return () => window.removeEventListener("acolher:mock-updated", handler)
  }, [usuarioLogado, carregarBootstrap])

  // Refresh imediato ao voltar para a aba (cobre o caso de o evento
  // `storage` não ter disparado por algum motivo, ex.: mesma aba).
  useEffect(() => {
    if (!usuarioLogado || typeof window === "undefined") return
    const onFocus = () => {
      void carregarBootstrap()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [usuarioLogado, carregarBootstrap])

  // Detector de transições de status: emite um toast sempre que um
  // agendamento do usuário sai de "agendado" e vira "confirmado".
  const statusAnteriorRef = useRef<Map<number, StatusAgendamento>>(new Map())
  const inicializadoRef = useRef(false)

  useEffect(() => {
    if (!usuarioLogado) return
    if (!inicializadoRef.current) {
      // Primeira renderização: popula o ref sem disparar toasts
      statusAnteriorRef.current = new Map(
        meusAgendamentos.map((a) => [a.id, a.status]),
      )
      inicializadoRef.current = true
      return
    }
    const confirmadosAgora: typeof meusAgendamentos = []
    const novoMapa = new Map<number, StatusAgendamento>()
    for (const a of meusAgendamentos) {
      novoMapa.set(a.id, a.status)
      const anterior = statusAnteriorRef.current.get(a.id)
      if (anterior === "agendado" && a.status === "confirmado") {
        confirmadosAgora.push(a)
      }
    }
    statusAnteriorRef.current = novoMapa

    for (const a of confirmadosAgora) {
      toast.success("Sua consulta foi confirmada!", {
        description: `${formatarDataCurta(a.data_agendamento)} às ${formatarHoraCurta(a.horario)} • ${getMedicoNome(a.medico_id) || "médico"}`,
      })
    }
  }, [meusAgendamentos, usuarioLogado, getMedicoNome])

  const proximas = useMemo(
    () =>
      meusAgendamentos
        .filter((a) => a.status === "agendado" || a.status === "confirmado")
        .sort(
          (a, b) =>
            montarDate(a.data_agendamento, a.horario).getTime() -
            montarDate(b.data_agendamento, b.horario).getTime(),
        ),
    [meusAgendamentos],
  )

  const historico = useMemo(
    () =>
      meusAgendamentos
        .filter(
          (a) =>
            a.status === "finalizado" ||
            a.status === "cancelado" ||
            a.status === "faltou",
        )
        .sort(
          (a, b) =>
            montarDate(b.data_agendamento, b.horario).getTime() -
            montarDate(a.data_agendamento, a.horario).getTime(),
        ),
    [meusAgendamentos],
  )

  const meusResponsaveis = useMemo(() => {
    if (!meuPacienteSelf) return []
    return responsaveis.filter((r) => r.paciente_id === meuPacienteSelf.id)
  }, [responsaveis, meuPacienteSelf])

  /**
   * Médicos filtrados pela especialidade selecionada no modal de
   * agendamento. Quando nenhuma especialidade está marcada, retorna
   * a lista completa para que o select exiba todos os especialistas
   * disponíveis como fallback.
   */
  const medicosFiltrados = useMemo(() => {
    if (!especialidadeId) return medicos
    return medicos.filter((m) =>
      m.especialidades?.some((e) => String(e.id) === especialidadeId),
    )
  }, [medicos, especialidadeId])

  /**
   * Sempre que o modal de agendamento abre, definimos um `pacienteId`
   * implícito: se o usuário é um paciente autônomo (não é responsável
   * por ninguém), usamos o próprio registro de paciente dele. Quando ele
   * é responsável de um ou mais pacientes, a select fica visível e a
   * escolha começa vazia para forçar a seleção.
   */
  useEffect(() => {
    if (!novoOpen) {
      setPacienteId("")
      return
    }
    if (meusPacientes.length === 0 && meuPacienteSelf) {
      setPacienteId(String(meuPacienteSelf.id))
    }
  }, [novoOpen, meusPacientes, meuPacienteSelf])

  if (!usuarioLogado) return null

  const pacienteSelecionado = meusPacientes.find(
    (p) => String(p.id) === pacienteId,
  )

  async function handleAgendar(e: React.FormEvent) {
    e.preventDefault()

    // Resolve o pacienteId efetivo. Prioridade:
    //   1. A select visível (quando há pacientes vinculados).
    //   2. O `pacienteId` no state (auto-preenchido pelo useEffect para
    //      pacientes autônomos a partir de `meuPacienteSelf`).
    //   3. Fallback final em `meuPacienteSelf` se o state estiver vazio.
    let pacienteIdEfetivo: number | null = null
    if (pacienteSelecionado) {
      pacienteIdEfetivo = pacienteSelecionado.id
    } else if (pacienteId) {
      const parsed = Number(pacienteId)
      if (Number.isFinite(parsed) && parsed > 0) {
        pacienteIdEfetivo = parsed
      }
    } else if (meusPacientes.length === 0 && meuPacienteSelf) {
      pacienteIdEfetivo = meuPacienteSelf.id
    }
    if (!pacienteIdEfetivo) {
      toast.error("Selecione um paciente.")
      return
    }
    if (!medicoId || !especialidadeId) {
      toast.error("Selecione médico e especialidade.")
      return
    }
    if (!data || !hora) {
      toast.error("Informe data e horário.")
      return
    }

    try {
      await criarAgendamento({
        paciente_id: pacienteIdEfetivo,
        medico_id: Number(medicoId),
        especialidade_id: Number(especialidadeId),
        recepcionista_id: null,
        data_agendamento: data,
        horario: hora,
        observacoes: obs || null,
      })
      toast.success("Solicitação enviada", {
        description: "A recepção confirmará seu horário em breve.",
      })
      setNovoOpen(false)
      setPacienteId("")
      setMedicoId("")
      setEspecialidadeId("")
      setData("")
      setHora("")
      setObs("")
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível solicitar o agendamento."
      toast.error(msg)
    }
  }

  async function handleVincularResponsavel(e: React.FormEvent) {
    e.preventDefault()
    if (!meuPacienteSelf) {
      toast.error("Seu cadastro de paciente ainda não foi criado.")
      return
    }
    if (!respNome || !respEmail || !respSenha || !respParentesco) {
      toast.error("Preencha nome, email, senha e parentesco.")
      return
    }
    if (respSenha.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.")
      return
    }
    try {
      await vincularResponsavel({
        paciente_id: meuPacienteSelf.id,
        parentesco: respParentesco,
        principal: respPrincipal,
        // Modo inline: backend cria Usuario (tipo=responsavel) + vínculo
        nome: respNome,
        email: respEmail,
        telefone: respTel || null,
        senha: respSenha,
      })
      toast.success("Responsável vinculado com sucesso.")
      setRespNome("")
      setRespEmail("")
      setRespTel("")
      setRespSenha("")
      setRespParentesco("Mãe")
      setRespPrincipal(true)
      setRespOpen(false)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível vincular o responsável."
      toast.error(msg)
    }
  }

  const proxima = proximas[0]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel={
          usuarioLogado.tipo_usuario === "responsavel"
            ? "Responsável"
            : "Paciente"
        }
        titulo={`Olá, ${usuarioLogado.nome.split(" ")[0]}`}
        descricao="Aqui você acompanha as próximas consultas, vê o histórico e agenda novas avaliações com nossos especialistas."
      />

      <main
        id="conteudo-principal"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Próxima consulta destaque */}
        {proxima ? (
          <section aria-labelledby="proxima-consulta">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
              <h2
                id="proxima-consulta"
                className="font-display text-2xl font-bold"
              >
                Sua próxima consulta
              </h2>
              <Button
                onClick={() => setNovoOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <CalendarPlus size={18} aria-hidden="true" />
                Agendar nova consulta
              </Button>
            </div>
            <AppointmentCard agendamento={proxima} destaque />
          </section>
        ) : (
          <section className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent mx-auto">
              <CalendarPlus size={26} aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-bold mt-4">
              Nenhuma consulta agendada
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Você ainda não tem consultas marcadas. Que tal agendar a primeira?
            </p>
            <Button
              onClick={() => setNovoOpen(true)}
              className="mt-5 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <CalendarPlus size={18} aria-hidden="true" />
              Agendar consulta
            </Button>
          </section>
        )}

        {/* Responsável vinculado (só faz sentido pro próprio paciente) */}
        {usuarioLogado.tipo_usuario === "paciente" && (
          <section
            aria-labelledby="meu-responsavel"
            className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5"
          >
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <HeartHandshake size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="meu-responsavel"
                    className="font-display text-xl font-bold"
                  >
                    Meu responsável
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Se você é adulto e se consulta sozinho, pode deixar
                    esta seção vazia. Caso seja criança, adolescente, ou
                    adulto que precise de um cuidador (mãe, pai,
                    cuidador(a)), vincule aqui — ele(a) poderá agendar e
                    acompanhar suas consultas.
                  </p>
                </div>
              </div>
              {meuPacienteSelf && (
                <Button
                  onClick={() => setRespOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Vincular responsável
                </Button>
              )}
            </div>

            {!meuPacienteSelf && (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border bg-card p-4">
                Seu perfil de paciente ainda não foi criado. Conclua seu
                cadastro de paciente para poder vincular um responsável.
              </p>
            )}

            {meuPacienteSelf && meusResponsaveis.length === 0 && (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border bg-card p-4">
                Nenhum responsável vinculado. Você está usando o sistema
                de forma autônoma — tudo certo!
              </p>
            )}

            {meusResponsaveis.length > 0 && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {meusResponsaveis.map((r) => {
                  const u = getUsuario(r.usuario_id)
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl border-2 border-border bg-card p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold truncate">
                            {u?.nome ?? `Responsável #${r.id}`}
                          </p>
                          {r.principal && (
                            <span className="text-[10px] uppercase tracking-wider font-bold rounded-full bg-primary/10 text-primary px-2 py-0.5">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.parentesco}
                        </p>
                        {u?.email && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {u.email}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await removerResponsavel(r.id)
                            toast.success("Responsável removido(a).")
                          } catch {
                            toast.error("Erro ao remover responsável.")
                          }
                        }}
                        aria-label={`Remover responsável ${u?.nome ?? ""}`}
                        className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive shrink-0"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de pacientes */}
          <section
            aria-labelledby="meus-pacientes"
            className="lg:col-span-1"
          >
            <h2
              id="meus-pacientes"
              className="font-display text-xl font-bold mb-4"
            >
              {usuarioLogado.tipo_usuario === "responsavel"
                ? "Minhas crianças"
                : "Meu cadastro"}
            </h2>
            <div className="space-y-3">
              {meusPacientes.length === 0 && (
                <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-4">
                  Nenhum paciente vinculado à sua conta ainda.
                </p>
              )}
              {meusPacientes.map((p) => {
                const idade = Math.floor(
                  (Date.now() - new Date(p.data_nascimento).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000),
                )
                const tipoDef =
                  p.deficiencias?.[0]?.tipo_deficiencia?.nome ??
                  (p.possui_autismo ? "TEA (Autismo)" : "—")
                return (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent shrink-0">
                        <Baby size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-lg leading-tight">
                          {p.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {idade} anos · {tipoDef}
                        </p>
                        {p.observacoes && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {p.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Tabs de consultas */}
          <section aria-labelledby="consultas" className="lg:col-span-2">
            <h2 id="consultas" className="sr-only">
              Consultas
            </h2>
            <Tabs defaultValue="proximas">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="proximas" className="gap-2">
                  <Calendar size={16} aria-hidden="true" />
                  Próximas ({proximas.length})
                </TabsTrigger>
                <TabsTrigger value="historico" className="gap-2">
                  <History size={16} aria-hidden="true" />
                  Histórico ({historico.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="proximas" className="space-y-4 mt-4">
                {proximas.length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border bg-card p-6 text-center">
                    Nenhuma consulta marcada no momento.
                  </p>
                ) : (
                  proximas.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      agendamento={a}
                      acoes={
                        a.status === "agendado" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await cancelarAgendamento(a.id)
                                toast.success("Consulta cancelada.")
                              } catch {
                                toast.error("Erro ao cancelar.")
                              }
                            }}
                            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                          >
                            <AlertCircle size={14} aria-hidden="true" />
                            Cancelar consulta
                          </Button>
                        ) : null
                      }
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="historico" className="space-y-4 mt-4">
                {historico.length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border bg-card p-6 text-center">
                    Nenhuma consulta no histórico ainda.
                  </p>
                ) : (
                  historico.map((a) => (
                    <AppointmentCard key={a.id} agendamento={a} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Status legenda */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-3">
            Entenda os status das suas consultas:
          </p>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="agendado" />
            <StatusBadge status="confirmado" />
            <StatusBadge status="finalizado" />
            <StatusBadge status="cancelado" />
            <StatusBadge status="faltou" />
          </div>
        </section>
      </main>

      {/* Modal de novo agendamento */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Agendar nova consulta
            </DialogTitle>
            <DialogDescription>
              Escolha o paciente, a especialidade e o profissional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAgendar} className="space-y-4 mt-2">
            {meusPacientes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="paciente" className="text-sm font-semibold">
                  Paciente
                </Label>
                <Select
                  value={pacienteId}
                  onValueChange={(v) => {
                    setPacienteId(v)
                    setMedicoId("")
                  }}
                >
                  <SelectTrigger id="paciente" className="h-11">
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {meusPacientes.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="esp" className="text-sm font-semibold">
                Especialidade
              </Label>
              <Select
                value={especialidadeId}
                onValueChange={(v) => {
                  setEspecialidadeId(v)
                  setMedicoId("")
                }}
              >
                <SelectTrigger id="esp" className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="medico" className="text-sm font-semibold">
                Médico
              </Label>
              <Select
                value={medicoId}
                onValueChange={setMedicoId}
                disabled={!especialidadeId}
              >
                <SelectTrigger id="medico" className="h-11">
                  <SelectValue
                    placeholder={
                      !especialidadeId
                        ? "Selecione a especialidade primeiro"
                        : medicosFiltrados.length > 0
                          ? "Selecione um especialista"
                          : medicos.length === 0
                            ? "Nenhum médico cadastrado"
                            : "Nenhum especialista para esta especialidade"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {medicos.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum médico cadastrado no momento.
                    </div>
                  ) : medicosFiltrados.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum especialista cadastrado para essa especialidade.
                    </div>
                  ) : (
                    medicosFiltrados.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.usuario?.nome ?? getMedicoNome(m.id) ?? `Médico #${m.id}`}{" "}
                        · CRM {m.crm}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-semibold">
                  Data
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora" className="text-sm font-semibold">
                  Horário
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs-novo" className="text-sm font-semibold">
                Observações{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="obs-novo"
                placeholder="Algo que o médico deve saber..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNovoOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Solicitar agendamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: vincular responsável */}
      <Dialog open={respOpen} onOpenChange={setRespOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Vincular responsável
            </DialogTitle>
            <DialogDescription>
              Criamos uma conta para o responsável (mãe, pai ou cuidador(a))
              e a vinculamos ao seu cadastro como paciente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVincularResponsavel} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="r-nome" className="text-sm font-semibold">
                Nome do responsável
              </Label>
              <Input
                id="r-nome"
                value={respNome}
                onChange={(e) => setRespNome(e.target.value)}
                placeholder="Ex.: Marina Oliveira"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="r-email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="r-email"
                  type="email"
                  value={respEmail}
                  onChange={(e) => setRespEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-tel" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="r-tel"
                  value={respTel}
                  onChange={(e) => setRespTel(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="r-senha" className="text-sm font-semibold">
                  Senha provisória
                </Label>
                <Input
                  id="r-senha"
                  type="password"
                  value={respSenha}
                  onChange={(e) => setRespSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-parentesco" className="text-sm font-semibold">
                  Parentesco
                </Label>
                <Select
                  value={respParentesco}
                  onValueChange={setRespParentesco}
                >
                  <SelectTrigger id="r-parentesco" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mãe">Mãe</SelectItem>
                    <SelectItem value="Pai">Pai</SelectItem>
                    <SelectItem value="Avó/Avô">Avó/Avô</SelectItem>
                    <SelectItem value="Tio/Tia">Tio/Tia</SelectItem>
                    <SelectItem value="Irmão/Irmã">Irmão/Irmã</SelectItem>
                    <SelectItem value="Cuidador(a)">Cuidador(a)</SelectItem>
                    <SelectItem value="Tutor(a) legal">
                      Tutor(a) legal
                    </SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label
              htmlFor="r-principal"
              className="flex items-start gap-3 cursor-pointer rounded-xl border-2 border-border bg-card p-3 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-colors"
            >
              <input
                id="r-principal"
                type="checkbox"
                checked={respPrincipal}
                onChange={(e) => setRespPrincipal(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-2 border-border accent-primary"
              />
              <span className="text-sm leading-relaxed">
                <span className="font-display font-bold block">
                  Responsável principal
                </span>
                <span className="text-muted-foreground">
                  É a pessoa de contato preferencial do hospital.
                </span>
              </span>
            </label>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRespOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Vincular responsável
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
