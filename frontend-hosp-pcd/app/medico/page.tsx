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
} from "lucide-react"
import { toast } from "sonner"
import type { Agendamento } from "@/lib/types"

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

export default function MedicoPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    agendamentos,
    medicos,
    especialidades,
    getPaciente,
    alterarStatusAgendamento,
  } = useHospital()
  const [encerrarOpen, setEncerrarOpen] = useState(false)
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null)
  const [observacoesEncerrar, setObservacoesEncerrar] = useState("")

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "medico") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

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

  const aguardando = useMemo(
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

  async function iniciarAtendimento(a: Agendamento) {
    try {
      await alterarStatusAgendamento(a.id, "confirmado")
      const pacienteNome = getPaciente(a.paciente_id)?.nome ?? "paciente"
      toast.success("Atendimento iniciado", {
        description: `Paciente ${pacienteNome} marcado como em atendimento.`,
      })
    } catch (err) {
      toast.error("Não foi possível iniciar o atendimento.")
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

  // Considera o primeiro "agendado/confirmado" como destaque ("atendendo agora")
  const atendendoAgora = aguardando.find((a) => a.status === "confirmado")
  const proximo = aguardando.find((a) => a.status === "agendado")

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
              {aguardando.filter((a) => a.status === "agendado").length}
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
              {aguardando.filter((a) => a.status === "confirmado").length}
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
              return (
                <article
                  className={`rounded-2xl border-2 p-6 sm:p-8 ${
                    atendendoAgora
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-accent bg-accent/5"
                  }`}
                >
                  <div className="grid lg:grid-cols-[auto,1fr,auto] gap-6 items-start">
                    <div
                      className={`rounded-xl px-5 py-4 text-center w-24 ${
                        atendendoAgora
                          ? "bg-primary-foreground/15"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-widest font-bold opacity-90">
                        Hoje
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
                              atendendoAgora
                                ? "text-primary-foreground/70"
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
                                atendendoAgora
                                  ? "text-primary-foreground/85"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {paciente.possui_autismo && "TEA · "}
                              {paciente.usa_cadeira_rodas && "Cadeirante · "}
                              {paciente.necessita_acompanhante && "Com acompanhante"}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <StatusBadge status={ag.status} size="lg" />
                        </div>
                      </div>

                      {ag.observacoes && (
                        <div
                          className={`mt-5 rounded-xl p-4 ${
                            atendendoAgora
                              ? "bg-primary-foreground/10"
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
                      {ag.status === "agendado" && (
                        <Button
                          size="lg"
                          onClick={() => iniciarAtendimento(ag)}
                          className="bg-primary hover:bg-primary/90 gap-2 h-12 text-base"
                        >
                          <PlayCircle size={20} aria-hidden="true" />
                          Iniciar atendimento
                        </Button>
                      )}
                      {ag.status === "confirmado" && (
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
          <Tabs defaultValue="aguardando">
            <TabsList className="grid grid-cols-2 w-full max-w-2xl">
              <TabsTrigger value="aguardando" className="gap-2">
                <Clock size={16} aria-hidden="true" />
                Agenda ({aguardando.length})
              </TabsTrigger>
              <TabsTrigger value="finalizados" className="gap-2">
                <CheckCircle2 size={16} aria-hidden="true" />
                Finalizados ({finalizados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aguardando" className="mt-4 space-y-4">
              {aguardando.length === 0 ? (
                <EmptyState
                  Icon={ClipboardList}
                  mensagem="Nenhum paciente aguardando."
                />
              ) : (
                aguardando.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    agendamento={a}
                    destaque={a.status === "confirmado"}
                    acoes={
                      a.status === "agendado" ? (
                        <Button
                          onClick={() => iniciarAtendimento(a)}
                          className="bg-primary hover:bg-primary/90 gap-2"
                        >
                          <PlayCircle size={16} aria-hidden="true" />
                          Iniciar atendimento
                        </Button>
                      ) : (
                        <Button
                          onClick={() => abrirEncerrar(a)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          Encerrar atendimento
                        </Button>
                      )
                    }
                  />
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
