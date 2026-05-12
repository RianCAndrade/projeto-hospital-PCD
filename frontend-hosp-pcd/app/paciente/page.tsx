"use client"

import { useEffect, useMemo, useState } from "react"
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
} from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"

function montarDate(data: string, horario: string) {
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

export default function PacientePage() {
  const router = useRouter()
  const {
    usuarioLogado,
    agendamentos,
    medicos,
    especialidades,
    pacientesDoUsuario,
    criarAgendamento,
    cancelarAgendamento,
  } = useHospital()

  const [novoOpen, setNovoOpen] = useState(false)
  const [pacienteId, setPacienteId] = useState<string>("")
  const [medicoId, setMedicoId] = useState<string>("")
  const [especialidadeId, setEspecialidadeId] = useState<string>("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [obs, setObs] = useState("")

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

  const meusAgendamentos = useMemo(() => {
    const ids = meusPacientes.map((p) => p.id)
    return agendamentos.filter((a) => ids.includes(a.paciente_id))
  }, [agendamentos, meusPacientes])

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

  if (!usuarioLogado) return null

  const pacienteSelecionado = meusPacientes.find(
    (p) => String(p.id) === pacienteId,
  )

  async function handleAgendar(e: React.FormEvent) {
    e.preventDefault()
    if (!pacienteSelecionado) {
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
        paciente_id: pacienteSelecionado.id,
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
                      especialidadeId
                        ? "Selecione um especialista"
                        : "Selecione a especialidade primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {medicos
                    .filter((m) =>
                      m.especialidades?.some(
                        (e) => String(e.id) === especialidadeId,
                      ),
                    )
                    .map((m) => {
                      const usuario =
                        m.usuario ??
                        // fallback: resolvido pelo getMedicoNome via store
                        undefined
                      return (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {usuario?.nome ?? `Médico #${m.id}`} · CRM {m.crm}
                        </SelectItem>
                      )
                    })}
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
    </div>
  )
}
