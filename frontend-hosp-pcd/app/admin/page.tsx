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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ApiError } from "@/lib/api"
import type { TipoUsuario } from "@/lib/types"

function montarDate(data: string, horario: string) {
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

export default function AdminPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    usuarios,
    pacientes,
    medicos,
    especialidades,
    agendamentos,
    cadastrar,
    criarMedico,
    removerMedico,
    removerUsuario,
    getMedicoNome,
    getEspecialidadeNome,
  } = useHospital()

  const [novoMedicoOpen, setNovoMedicoOpen] = useState(false)
  const [novoFuncOpen, setNovoFuncOpen] = useState(false)

  const [medNome, setMedNome] = useState("")
  const [medEmail, setMedEmail] = useState("")
  const [medTel, setMedTel] = useState("")
  const [medSenha, setMedSenha] = useState("")
  const [medCrm, setMedCrm] = useState("")
  const [medDescricao, setMedDescricao] = useState("")
  const [medEspId, setMedEspId] = useState<string>("")

  const [funcNome, setFuncNome] = useState("")
  const [funcEmail, setFuncEmail] = useState("")
  const [funcTel, setFuncTel] = useState("")
  const [funcSenha, setFuncSenha] = useState("")
  const [funcTipo, setFuncTipo] = useState<TipoUsuario>("recepcionista")

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "admin") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  const stats = useMemo(() => {
    const responsaveis = usuarios.filter(
      (u) => u.tipo_usuario === "responsavel" || u.tipo_usuario === "paciente",
    ).length
    const totalPacientes = pacientes.length
    const consultasHoje = agendamentos.filter(
      (a) =>
        montarDate(a.data_agendamento, a.horario).toDateString() ===
        new Date().toDateString(),
    ).length
    const taxaFinalizacao = agendamentos.length
      ? Math.round(
          (agendamentos.filter((a) => a.status === "finalizado").length /
            agendamentos.length) *
            100,
        )
      : 0
    return { responsaveis, totalPacientes, consultasHoje, taxaFinalizacao }
  }, [usuarios, pacientes, agendamentos])

  const consultasPorDia = useMemo(() => {
    const dias: { dia: string; total: number; finalizados: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toDateString()
      const total = agendamentos.filter(
        (a) =>
          montarDate(a.data_agendamento, a.horario).toDateString() === ds,
      ).length
      const finalizados = agendamentos.filter(
        (a) =>
          montarDate(a.data_agendamento, a.horario).toDateString() === ds &&
          a.status === "finalizado",
      ).length
      dias.push({
        dia: d
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        total,
        finalizados,
      })
    }
    return dias
  }, [agendamentos])

  const porEspecialidade = useMemo(() => {
    const map = new Map<string, number>()
    agendamentos.forEach((a) => {
      const nome = getEspecialidadeNome(a.especialidade_id) || "Outras"
      map.set(nome, (map.get(nome) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([nome, valor]) => ({ nome, valor }))
  }, [agendamentos, getEspecialidadeNome])

  const porStatus = useMemo(() => {
    const counts: Record<string, number> = {
      agendado: 0,
      confirmado: 0,
      finalizado: 0,
      cancelado: 0,
      faltou: 0,
    }
    agendamentos.forEach(
      (a) => (counts[a.status] = (counts[a.status] ?? 0) + 1),
    )
    return [
      {
        nome: "Agendado",
        valor: counts.agendado,
        fill: "var(--color-status-aguardando)",
      },
      {
        nome: "Confirmado",
        valor: counts.confirmado,
        fill: "var(--color-status-em-atendimento)",
      },
      {
        nome: "Finalizado",
        valor: counts.finalizado,
        fill: "var(--color-status-encerrado)",
      },
      {
        nome: "Cancelado",
        valor: counts.cancelado,
        fill: "var(--color-status-cancelado)",
      },
      {
        nome: "Faltou",
        valor: counts.faltou,
        fill: "var(--color-status-cancelado)",
      },
    ]
  }, [agendamentos])

  async function handleCriarMedico(e: React.FormEvent) {
    e.preventDefault()
    if (!medNome || !medEmail || !medCrm || !medSenha || !medEspId) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }
    try {
      await criarMedico({
        nome: medNome,
        email: medEmail,
        telefone: medTel || null,
        senha: medSenha,
        crm: medCrm,
        descricao: medDescricao || null,
        especialidade_ids: [Number(medEspId)],
      })
      toast.success("Médico cadastrado com sucesso.")
      setMedNome("")
      setMedEmail("")
      setMedTel("")
      setMedSenha("")
      setMedCrm("")
      setMedDescricao("")
      setMedEspId("")
      setNovoMedicoOpen(false)
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Erro ao cadastrar médico."
      toast.error(msg)
    }
  }

  async function handleCriarFunc(e: React.FormEvent) {
    e.preventDefault()
    if (!funcNome || !funcEmail || !funcSenha) {
      toast.error("Preencha nome, email e senha.")
      return
    }
    try {
      await cadastrar({
        nome: funcNome,
        email: funcEmail,
        telefone: funcTel,
        senha: funcSenha,
        tipo_usuario: funcTipo,
      })
      toast.success(
        funcTipo === "admin"
          ? "Administrador cadastrado."
          : "Recepcionista cadastrado.",
      )
      setFuncNome("")
      setFuncEmail("")
      setFuncTel("")
      setFuncSenha("")
      setNovoFuncOpen(false)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Erro ao cadastrar funcionário."
      toast.error(msg)
    }
  }

  if (!usuarioLogado) return null

  const responsaveis = usuarios.filter(
    (u) => u.tipo_usuario === "responsavel" || u.tipo_usuario === "paciente",
  )
  const recepcionistas = usuarios.filter(
    (u) => u.tipo_usuario === "recepcionista",
  )
  const admins = usuarios.filter((u) => u.tipo_usuario === "admin")

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

      <main
        id="conteudo-principal"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Stats */}
        <section
          aria-label="Métricas gerais"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Responsáveis / Pacientes",
              valor: stats.responsaveis,
              sub: `${stats.totalPacientes} pacientes`,
              Icon: Users,
              cor: "primary",
            },
            {
              label: "Médicos",
              valor: medicos.length,
              sub: `${especialidades.length} especialidades`,
              Icon: Stethoscope,
              cor: "accent",
            },
            {
              label: "Consultas hoje",
              valor: stats.consultasHoje,
              sub: `${agendamentos.length} no total`,
              Icon: CalendarCheck,
              cor: "primary",
            },
            {
              label: "Taxa de finalização",
              valor: `${stats.taxaFinalizacao}%`,
              sub: "consultas concluídas",
              Icon: TrendingUp,
              cor: "accent",
            },
          ].map(({ label, valor, sub, Icon, cor }) => (
            <article
              key={label}
              className="rounded-2xl border-2 border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {label}
                </p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    cor === "primary"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/15 text-accent"
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
                <h2 className="font-display text-lg font-bold">
                  Consultas dos últimos 7 dias
                </h2>
                <p className="text-xs text-muted-foreground">
                  Total e finalizadas por dia
                </p>
              </div>
              <Activity size={18} className="text-accent" aria-hidden="true" />
            </div>
            <ChartContainer
              config={{
                total: { label: "Total", color: "var(--color-chart-1)" },
                finalizados: {
                  label: "Finalizados",
                  color: "var(--color-chart-2)",
                },
              }}
              className="h-[260px] w-full"
            >
              <BarChart data={consultasPorDia} accessibilityLayer>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border"
                />
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="var(--color-chart-1)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="finalizados"
                  fill="var(--color-chart-2)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </article>

          <article className="rounded-2xl border-2 border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold mb-4">Status atual</h2>
            <ChartContainer
              config={{}}
              className="h-[200px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={porStatus}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {porStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-3 space-y-1.5 text-xs">
              {porStatus.map((s) => (
                <li
                  key={s.nome}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.fill }}
                      aria-hidden="true"
                    />
                    {s.nome}
                  </span>
                  <span className="font-semibold">{s.valor}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {porEspecialidade.length > 0 && (
          <section className="rounded-2xl border-2 border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold mb-4">
              Consultas por especialidade
            </h2>
            <ChartContainer
              config={{ valor: { label: "Consultas" } }}
              className="h-[280px] w-full"
            >
              <BarChart
                data={porEspecialidade}
                layout="vertical"
                accessibilityLayer
                margin={{ left: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-border"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis
                  dataKey="nome"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  width={140}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                  {porEspecialidade.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </section>
        )}

        {/* CRUD */}
        <section aria-labelledby="gerenciar">
          <h2 id="gerenciar" className="sr-only">
            Gerenciar
          </h2>
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
                  <h3 className="font-display font-bold">
                    Lista de médicos ({medicos.length})
                  </h3>
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
                        <TableHead>Especialidades</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicos.map((m) => {
                        const usuario = usuarios.find(
                          (u) => u.id === m.usuario_id,
                        )
                        const espNomes =
                          m.especialidades?.map((e) => e.nome).join(", ") ??
                          "—"
                        return (
                          <TableRow key={m.id}>
                            <TableCell>
                              <p className="font-semibold">
                                {usuario?.nome ?? `Médico #${m.id}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {usuario?.email ?? ""}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm">{m.crm}</TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2 py-1">
                                {espNomes}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs max-w-[300px] truncate">
                              {m.descricao ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await removerMedico(m.id)
                                    toast.success("Médico removido.")
                                  } catch {
                                    toast.error("Erro ao remover médico.")
                                  }
                                }}
                                className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                                Remover
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Pacientes / responsáveis */}
            <TabsContent value="usuarios" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-display font-bold">
                    Responsáveis e pacientes ({responsaveis.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Nome</TableHead>
                        <TableHead>tipo_usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Consultas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responsaveis.map((u) => {
                        const consultas = agendamentos.filter((a) => {
                          const p = pacientes.find(
                            (x) => x.id === a.paciente_id,
                          )
                          return p?.usuario_id === u.id
                        })
                        const ativas = consultas.filter(
                          (a) =>
                            a.status === "agendado" ||
                            a.status === "confirmado",
                        ).length
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-semibold">
                              {u.nome}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-bold rounded-full px-2 py-1 bg-accent/15 text-accent">
                                {u.tipo_usuario}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {u.email}
                            </TableCell>
                            <TableCell className="text-sm">
                              {u.telefone ?? "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs">
                                  {consultas.length} no total
                                </span>
                                {ativas > 0 && (
                                  <StatusBadge status="agendado" size="sm" />
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
                        <TableHead>tipo_usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...recepcionistas, ...admins].map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-semibold">
                            {u.nome}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-bold rounded-full px-2 py-1 ${
                                u.tipo_usuario === "admin"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {u.tipo_usuario}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm">
                            {u.telefone ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {u.id !== usuarioLogado.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await removerUsuario(u.id)
                                    toast.success("Funcionário removido.")
                                  } catch {
                                    toast.error("Erro ao remover.")
                                  }
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
            <DialogTitle className="font-display text-2xl">
              Cadastrar médico
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarMedico} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-nome" className="text-sm font-semibold">
                Nome completo
              </Label>
              <Input
                id="m-nome"
                value={medNome}
                onChange={(e) => setMedNome(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="m-email"
                  type="email"
                  value={medEmail}
                  onChange={(e) => setMedEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-tel" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="m-tel"
                  value={medTel}
                  onChange={(e) => setMedTel(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-senha" className="text-sm font-semibold">
                  Senha
                </Label>
                <Input
                  id="m-senha"
                  type="password"
                  value={medSenha}
                  onChange={(e) => setMedSenha(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-crm" className="text-sm font-semibold">
                  CRM
                </Label>
                <Input
                  id="m-crm"
                  placeholder="CRM/SP 000000"
                  value={medCrm}
                  onChange={(e) => setMedCrm(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-esp" className="text-sm font-semibold">
                Especialidade
              </Label>
              <Select value={medEspId} onValueChange={setMedEspId}>
                <SelectTrigger id="m-esp" className="h-11">
                  <SelectValue placeholder="Selecione uma especialidade" />
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
              <Label htmlFor="m-desc" className="text-sm font-semibold">
                Descrição{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="m-desc"
                value={medDescricao}
                onChange={(e) => setMedDescricao(e.target.value)}
                className="h-11"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNovoMedicoOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                Cadastrar médico
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal novo funcionario */}
      <Dialog open={novoFuncOpen} onOpenChange={setNovoFuncOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Cadastrar funcionário
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarFunc} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="f-nome" className="text-sm font-semibold">
                Nome completo
              </Label>
              <Input
                id="f-nome"
                value={funcNome}
                onChange={(e) => setFuncNome(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="f-email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="f-email"
                  type="email"
                  value={funcEmail}
                  onChange={(e) => setFuncEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-tel" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="f-tel"
                  value={funcTel}
                  onChange={(e) => setFuncTel(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="f-senha" className="text-sm font-semibold">
                  Senha
                </Label>
                <Input
                  id="f-senha"
                  type="password"
                  value={funcSenha}
                  onChange={(e) => setFuncSenha(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-tipo" className="text-sm font-semibold">
                  tipo_usuario
                </Label>
                <Select
                  value={funcTipo}
                  onValueChange={(v) => setFuncTipo(v as TipoUsuario)}
                >
                  <SelectTrigger id="f-tipo" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recepcionista">recepcionista</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNovoFuncOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Cadastrar funcionário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
