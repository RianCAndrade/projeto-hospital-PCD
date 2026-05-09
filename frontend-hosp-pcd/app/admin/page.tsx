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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Users,
  Stethoscope,
  CalendarCheck,
  TrendingUp,
  Plus,
  Trash2,
  UserPlus,
  Activity,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import type { Especialidade, TipoDeficiencia } from "@/lib/types"

const especialidadesList: Especialidade[] = [
  "Neuropediatria",
  "Fonoaudiologia",
  "Fisioterapia",
  "Terapia Ocupacional",
  "Psicologia Infantil",
  "Pediatria Geral",
  "Ortopedia Pediátrica",
  "Oftalmologia Pediátrica",
]

const tiposList: TipoDeficiencia[] = [
  "Física",
  "Intelectual",
  "Auditiva",
  "Visual",
  "Múltipla",
  "TEA (Autismo)",
  "Síndrome de Down",
  "Outra",
]

export default function AdminPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    usuarios,
    medicos,
    agendamentos,
    criarMedico,
    removerMedico,
    criarUsuarioFuncionario,
    removerUsuario,
  } = useHospital()

  const [novoMedicoOpen, setNovoMedicoOpen] = useState(false)
  const [novoFuncOpen, setNovoFuncOpen] = useState(false)

  const [medNome, setMedNome] = useState("")
  const [medEmail, setMedEmail] = useState("")
  const [medCrm, setMedCrm] = useState("")
  const [medEsp, setMedEsp] = useState<Especialidade>("Neuropediatria")
  const [medDef, setMedDef] = useState<TipoDeficiencia[]>(["Intelectual"])

  const [funcNome, setFuncNome] = useState("")
  const [funcEmail, setFuncEmail] = useState("")
  const [funcTel, setFuncTel] = useState("")
  const [funcPerfil, setFuncPerfil] = useState<"recepcionista" | "admin">("recepcionista")
  const [funcCargo, setFuncCargo] = useState("")

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.perfil !== "admin") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const stats = useMemo(() => {
    const pacientes = usuarios.filter((u) => u.perfil === "paciente").length
    const totalCriancas = usuarios.reduce((s, u) => s + (u.criancas?.length ?? 0), 0)
    const consultasHoje = agendamentos.filter(
      (a) => new Date(a.dataHora).toDateString() === new Date().toDateString(),
    ).length
    const taxaEncerramento = agendamentos.length
      ? Math.round((agendamentos.filter((a) => a.status === "encerrado").length / agendamentos.length) * 100)
      : 0
    return { pacientes, totalCriancas, consultasHoje, taxaEncerramento }
  }, [usuarios, agendamentos])

  // Consultas por dia (ultimos 7 dias)
  const consultasPorDia = useMemo(() => {
    const dias: { dia: string; total: number; encerrados: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toDateString()
      const total = agendamentos.filter((a) => new Date(a.dataHora).toDateString() === ds).length
      const encerrados = agendamentos.filter(
        (a) => new Date(a.dataHora).toDateString() === ds && a.status === "encerrado",
      ).length
      dias.push({
        dia: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        total,
        encerrados,
      })
    }
    return dias
  }, [agendamentos])

  // Distribuição por especialidade
  const porEspecialidade = useMemo(() => {
    const map = new Map<string, number>()
    agendamentos.forEach((a) => map.set(a.especialidade, (map.get(a.especialidade) ?? 0) + 1))
    return Array.from(map.entries()).map(([nome, valor]) => ({ nome, valor }))
  }, [agendamentos])

  // Distribuição por status
  const porStatus = useMemo(() => {
    const counts: Record<string, number> = {
      aguardando: 0,
      em_atendimento: 0,
      encerrado: 0,
      cancelado: 0,
    }
    agendamentos.forEach((a) => (counts[a.status] = (counts[a.status] ?? 0) + 1))
    return [
      { nome: "Aguardando", valor: counts.aguardando, fill: "var(--color-status-aguardando)" },
      { nome: "Em atendimento", valor: counts.em_atendimento, fill: "var(--color-status-em-atendimento)" },
      { nome: "Encerrado", valor: counts.encerrado, fill: "var(--color-status-encerrado)" },
      { nome: "Cancelado", valor: counts.cancelado, fill: "var(--color-status-cancelado)" },
    ]
  }, [agendamentos])

  function handleCriarMedico(e: React.FormEvent) {
    e.preventDefault()
    if (!medNome || !medEmail || !medCrm) {
      toast.error("Preencha todos os campos.")
      return
    }
    criarMedico({
      nome: medNome,
      email: medEmail,
      crm: medCrm,
      especialidade: medEsp,
      atendeDeficiencias: medDef,
      disponivelHoje: true,
    })
    toast.success("Médico cadastrado com sucesso.")
    setMedNome("")
    setMedEmail("")
    setMedCrm("")
    setMedEsp("Neuropediatria")
    setMedDef(["Intelectual"])
    setNovoMedicoOpen(false)
  }

  function handleCriarFunc(e: React.FormEvent) {
    e.preventDefault()
    if (!funcNome || !funcEmail) {
      toast.error("Preencha nome e email.")
      return
    }
    criarUsuarioFuncionario({
      nome: funcNome,
      email: funcEmail,
      telefone: funcTel,
      perfil: funcPerfil,
      cargo: funcCargo,
    })
    toast.success(`${funcPerfil === "admin" ? "Administrador" : "Recepcionista"} cadastrado.`)
    setFuncNome("")
    setFuncEmail("")
    setFuncTel("")
    setFuncCargo("")
    setNovoFuncOpen(false)
  }

  function toggleDef(d: TipoDeficiencia) {
    setMedDef((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  if (!usuarioLogado) return null

  const pacientes = usuarios.filter((u) => u.perfil === "paciente")
  const recepcionistas = usuarios.filter((u) => u.perfil === "recepcionista")
  const admins = usuarios.filter((u) => u.perfil === "admin")

  const pieColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel="Administração"
        titulo="Painel administrativo"
        descricao="Visão completa do hospital. Acompanhe métricas, gerencie médicos, recepcionistas e administradores."
      />

      <main id="conteudo-principal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <section aria-label="Métricas gerais" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pacientes", valor: stats.pacientes, sub: `${stats.totalCriancas} crianças`, Icon: Users, cor: "primary" },
            { label: "Médicos", valor: medicos.length, sub: `${medicos.filter((m) => m.disponivelHoje).length} hoje`, Icon: Stethoscope, cor: "accent" },
            { label: "Consultas hoje", valor: stats.consultasHoje, sub: `${agendamentos.length} no total`, Icon: CalendarCheck, cor: "primary" },
            { label: "Taxa de encerramento", valor: `${stats.taxaEncerramento}%`, sub: "consultas concluídas", Icon: TrendingUp, cor: "accent" },
          ].map(({ label, valor, sub, Icon, cor }) => (
            <article
              key={label}
              className="rounded-2xl border-2 border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    cor === "primary" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="font-display text-4xl font-bold mt-3">{valor}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </article>
          ))}
        </section>

        {/* Charts */}
        <section className="grid lg:grid-cols-3 gap-5">
          <article className="lg:col-span-2 rounded-2xl border-2 border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold">Consultas dos últimos 7 dias</h2>
                <p className="text-xs text-muted-foreground">Total e encerradas por dia</p>
              </div>
              <Activity size={18} className="text-accent" aria-hidden="true" />
            </div>
            <ChartContainer
              config={{
                total: { label: "Total", color: "var(--color-chart-1)" },
                encerrados: { label: "Encerrados", color: "var(--color-chart-2)" },
              }}
              className="h-[260px] w-full"
            >
              <BarChart data={consultasPorDia} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="encerrados" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </article>

          <article className="rounded-2xl border-2 border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold mb-4">Status atual</h2>
            <ChartContainer
              config={{
                Aguardando: { label: "Aguardando" },
                "Em atendimento": { label: "Em atendimento" },
                Encerrado: { label: "Encerrado" },
                Cancelado: { label: "Cancelado" },
              }}
              className="h-[200px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={porStatus} dataKey="valor" nameKey="nome" innerRadius={50} outerRadius={80} strokeWidth={2}>
                  {porStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-3 space-y-1.5 text-xs">
              {porStatus.map((s) => (
                <li key={s.nome} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} aria-hidden="true" />
                    {s.nome}
                  </span>
                  <span className="font-semibold">{s.valor}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border-2 border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold mb-4">Consultas por especialidade</h2>
          <ChartContainer
            config={{ valor: { label: "Consultas" } }}
            className="h-[280px] w-full"
          >
            <BarChart data={porEspecialidade} layout="vertical" accessibilityLayer margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
              <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis dataKey="nome" type="category" tickLine={false} axisLine={false} className="text-xs" width={140} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                {porEspecialidade.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </section>

        {/* CRUD */}
        <section aria-labelledby="gerenciar">
          <h2 id="gerenciar" className="sr-only">Gerenciar</h2>
          <Tabs defaultValue="medicos">
            <TabsList className="grid grid-cols-3 max-w-2xl">
              <TabsTrigger value="medicos" className="gap-2">
                <Stethoscope size={16} aria-hidden="true" />
                Médicos
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="gap-2">
                <Users size={16} aria-hidden="true" />
                Pacientes
              </TabsTrigger>
              <TabsTrigger value="funcionarios" className="gap-2">
                <ShieldCheck size={16} aria-hidden="true" />
                Funcionários
              </TabsTrigger>
            </TabsList>

            {/* Medicos */}
            <TabsContent value="medicos" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                  <h3 className="font-display font-bold">Lista de médicos ({medicos.length})</h3>
                  <Button
                    onClick={() => setNovoMedicoOpen(true)}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Novo médico
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Nome</TableHead>
                        <TableHead>CRM</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Atende</TableHead>
                        <TableHead>Disponível</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicos.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <p className="font-semibold">{m.nome}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </TableCell>
                          <TableCell className="text-sm">{m.crm}</TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2 py-1">
                              {m.especialidade}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {m.atendeDeficiencias.slice(0, 2).join(", ")}
                            {m.atendeDeficiencias.length > 2 && ` +${m.atendeDeficiencias.length - 2}`}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-bold rounded-full px-2 py-1 ${
                                m.disponivelHoje
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {m.disponivelHoje ? "Sim" : "Não"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                removerMedico(m.id)
                                toast.success("Médico removido.")
                              }}
                              className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Pacientes */}
            <TabsContent value="usuarios" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-display font-bold">Pacientes cadastrados ({pacientes.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Mãe / Responsável</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Crianças</TableHead>
                        <TableHead>Consultas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pacientes.map((u) => {
                        const consultas = agendamentos.filter((a) => a.pacienteId === u.id)
                        const ativas = consultas.filter((a) => a.status === "aguardando" || a.status === "em_atendimento").length
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-semibold">{u.nome}</TableCell>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell className="text-sm">{u.telefone}</TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold rounded-full bg-accent/15 text-accent px-2 py-1">
                                {u.criancas?.length ?? 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs">{consultas.length} no total</span>
                                {ativas > 0 && (
                                  <StatusBadge status="aguardando" size="sm" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Funcionarios */}
            <TabsContent value="funcionarios" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                  <h3 className="font-display font-bold">
                    Funcionários ({recepcionistas.length + admins.length})
                  </h3>
                  <Button
                    onClick={() => setNovoFuncOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Novo funcionário
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Nome</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...recepcionistas, ...admins].map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-semibold">{u.nome}</TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-bold rounded-full px-2 py-1 ${
                                u.perfil === "admin"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {u.perfil === "admin" ? "Administrador" : "Recepcionista"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{u.cargo ?? "—"}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-right">
                            {u.id !== usuarioLogado.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  removerUsuario(u.id)
                                  toast.success("Funcionário removido.")
                                }}
                                className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                                Remover
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Modal novo medico */}
      <Dialog open={novoMedicoOpen} onOpenChange={setNovoMedicoOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Cadastrar médico</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarMedico} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-nome" className="text-sm font-semibold">Nome completo</Label>
              <Input id="m-nome" value={medNome} onChange={(e) => setMedNome(e.target.value)} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-email" className="text-sm font-semibold">Email</Label>
                <Input id="m-email" type="email" value={medEmail} onChange={(e) => setMedEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-crm" className="text-sm font-semibold">CRM</Label>
                <Input id="m-crm" placeholder="CRM/SP 000000" value={medCrm} onChange={(e) => setMedCrm(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-esp" className="text-sm font-semibold">Especialidade</Label>
              <Select value={medEsp} onValueChange={(v) => setMedEsp(v as Especialidade)}>
                <SelectTrigger id="m-esp" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {especialidadesList.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tipos de deficiência atendidas</Label>
              <div className="grid grid-cols-2 gap-2">
                {tiposList.map((t) => {
                  const ativo = medDef.includes(t)
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleDef(t)}
                      className={`text-xs font-semibold rounded-lg px-3 py-2 border-2 text-left transition-colors ${
                        ativo
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setNovoMedicoOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Cadastrar médico</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal novo funcionario */}
      <Dialog open={novoFuncOpen} onOpenChange={setNovoFuncOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Cadastrar funcionário</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarFunc} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="f-nome" className="text-sm font-semibold">Nome completo</Label>
              <Input id="f-nome" value={funcNome} onChange={(e) => setFuncNome(e.target.value)} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="f-email" className="text-sm font-semibold">Email</Label>
                <Input id="f-email" type="email" value={funcEmail} onChange={(e) => setFuncEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-tel" className="text-sm font-semibold">Telefone</Label>
                <Input id="f-tel" value={funcTel} onChange={(e) => setFuncTel(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="f-perfil" className="text-sm font-semibold">Perfil</Label>
                <Select value={funcPerfil} onValueChange={(v) => setFuncPerfil(v as "recepcionista" | "admin")}>
                  <SelectTrigger id="f-perfil" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-cargo" className="text-sm font-semibold">Cargo</Label>
                <Input id="f-cargo" placeholder="Ex: Recepcionista Sênior" value={funcCargo} onChange={(e) => setFuncCargo(e.target.value)} className="h-11" />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setNovoFuncOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Cadastrar funcionário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
