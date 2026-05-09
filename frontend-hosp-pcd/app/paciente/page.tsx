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
import { CalendarPlus, History, Calendar, Baby, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function PacientePage() {
  const router = useRouter()
  const { usuarioLogado, agendamentos, medicos, criarAgendamento, cancelarAgendamento } = useHospital()
  const [novoOpen, setNovoOpen] = useState(false)
  const [criancaId, setCriancaId] = useState("")
  const [medicoId, setMedicoId] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [obs, setObs] = useState("")

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.perfil !== "paciente") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const meusAgendamentos = useMemo(
    () => agendamentos.filter((a) => a.pacienteId === usuarioLogado?.id),
    [agendamentos, usuarioLogado],
  )

  const proximas = useMemo(
    () =>
      meusAgendamentos
        .filter((a) => a.status === "aguardando" || a.status === "em_atendimento")
        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()),
    [meusAgendamentos],
  )
  const historico = useMemo(
    () =>
      meusAgendamentos
        .filter((a) => a.status === "encerrado" || a.status === "cancelado")
        .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [meusAgendamentos],
  )

  if (!usuarioLogado) return null

  const criancas = usuarioLogado.criancas ?? []
  const criancaSelecionada = criancas.find((c) => c.id === criancaId)
  const medicosCompativeis = criancaSelecionada
    ? medicos.filter((m) => m.atendeDeficiencias.includes(criancaSelecionada.tipoDeficiencia))
    : medicos

  function handleAgendar(e: React.FormEvent) {
    e.preventDefault()
    if (!criancaSelecionada) {
      toast.error("Selecione uma criança.")
      return
    }
    const med = medicos.find((m) => m.id === medicoId)
    if (!med) {
      toast.error("Selecione um médico.")
      return
    }
    if (!data || !hora) {
      toast.error("Informe data e horário.")
      return
    }
    const dataHora = new Date(`${data}T${hora}`).toISOString()
    criarAgendamento({
      pacienteId: usuarioLogado!.id,
      pacienteNome: usuarioLogado!.nome,
      criancaId: criancaSelecionada.id,
      criancaNome: criancaSelecionada.nome,
      tipoDeficiencia: criancaSelecionada.tipoDeficiencia,
      medicoId: med.id,
      medicoNome: med.nome,
      especialidade: med.especialidade,
      dataHora,
      observacoes: obs || undefined,
    })
    toast.success("Solicitação enviada", {
      description: "A recepção confirmará seu horário em breve.",
    })
    setNovoOpen(false)
    setCriancaId("")
    setMedicoId("")
    setData("")
    setHora("")
    setObs("")
  }

  const proxima = proximas[0]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel="Paciente"
        titulo={`Olá, ${usuarioLogado.nome.split(" ")[0]}`}
        descricao="Aqui você acompanha as próximas consultas das suas crianças, vê o histórico e agenda novas avaliações com nossos especialistas."
      />

      <main id="conteudo-principal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Próxima consulta destaque */}
        {proxima ? (
          <section aria-labelledby="proxima-consulta">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
              <h2 id="proxima-consulta" className="font-display text-2xl font-bold">
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
            <h2 className="font-display text-2xl font-bold mt-4">Nenhuma consulta agendada</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Você ainda não tem consultas marcadas. Que tal agendar a primeira para uma das suas crianças?
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
          {/* Lista de filhos */}
          <section aria-labelledby="minhas-criancas" className="lg:col-span-1">
            <h2 id="minhas-criancas" className="font-display text-xl font-bold mb-4">
              Minhas crianças
            </h2>
            <div className="space-y-3">
              {criancas.length === 0 && (
                <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-4">
                  Nenhuma criança cadastrada.
                </p>
              )}
              {criancas.map((c) => {
                const idade = Math.floor(
                  (Date.now() - new Date(c.dataNascimento).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000),
                )
                return (
                  <article
                    key={c.id}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent shrink-0">
                        <Baby size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-lg leading-tight">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {idade} anos · {c.tipoDeficiencia}
                        </p>
                        {c.observacoes && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {c.observacoes}
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
            <h2 id="consultas" className="sr-only">Consultas</h2>
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
                        a.status === "aguardando" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              cancelarAgendamento(a.id)
                              toast.success("Consulta cancelada.")
                            }}
                            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                          >
                            <AlertCircle size={14} aria-hidden="true" />
                            Cancelar consulta
                          </Button>
                        )
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
                  historico.map((a) => <AppointmentCard key={a.id} agendamento={a} />)
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Status legenda */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-3">Entenda os status das suas consultas:</p>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="aguardando" />
            <StatusBadge status="em_atendimento" />
            <StatusBadge status="encerrado" />
            <StatusBadge status="cancelado" />
          </div>
        </section>
      </main>

      {/* Modal de novo agendamento */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Agendar nova consulta</DialogTitle>
            <DialogDescription>
              Escolha a criança e o especialista. Mostramos apenas médicos compatíveis com a deficiência.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAgendar} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="crianca" className="text-sm font-semibold">Criança</Label>
              <Select value={criancaId} onValueChange={(v) => { setCriancaId(v); setMedicoId("") }}>
                <SelectTrigger id="crianca" className="h-11">
                  <SelectValue placeholder="Selecione uma criança" />
                </SelectTrigger>
                <SelectContent>
                  {criancas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} · {c.tipoDeficiencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico" className="text-sm font-semibold">
                Médico {criancaSelecionada && `(${medicosCompativeis.length} compatíveis)`}
              </Label>
              <Select value={medicoId} onValueChange={setMedicoId} disabled={!criancaSelecionada}>
                <SelectTrigger id="medico" className="h-11">
                  <SelectValue placeholder={criancaSelecionada ? "Selecione um especialista" : "Selecione a criança primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {medicosCompativeis.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome} · {m.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-semibold">Data</Label>
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
                <Label htmlFor="hora" className="text-sm font-semibold">Horário</Label>
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
                Observações <span className="font-normal text-muted-foreground">(opcional)</span>
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
              <Button type="button" variant="outline" onClick={() => setNovoOpen(false)}>
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
