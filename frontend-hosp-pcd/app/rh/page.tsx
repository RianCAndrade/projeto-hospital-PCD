"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { DashboardHeader } from "@/components/dashboard-header"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Stethoscope,
  ConciergeBell,
  Plus,
  Trash2,
  UserPlus,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"

/**
 * Painel do RH.
 *
 * Regra:
 *   RH cadastra apenas funcionários OPERACIONAIS:
 *     - Médico       (cria Usuario + Medico + vincula especialidade)
 *     - Recepcionista (cria Usuario com tipo_usuario = "recepcionista")
 *
 *   RH NÃO cadastra pacientes nem outros RHs nem o Admin Geral.
 *
 * Endpoints consumidos:
 *   POST /api/medicos            -> via store.criarMedico
 *   POST /api/register           -> via store.cadastrar (recepcionista)
 *   DELETE /api/medicos/{id}     -> via store.removerMedico
 *   DELETE /api/usuarios/{id}    -> via store.removerUsuario
 */
export default function RHPage() {
  const router = useRouter()
  const {
    usuarioLogado,
    usuarios,
    medicos,
    especialidades,
    criarMedico,
    cadastrar,
    removerMedico,
    removerUsuario,
  } = useHospital()

  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== "rh") {
      router.push("/login")
    }
  }, [usuarioLogado, router])

  // ── Estados dos formulários ──────────────────────────────────────────
  const [novoMedicoOpen, setNovoMedicoOpen] = useState(false)
  const [medNome, setMedNome] = useState("")
  const [medEmail, setMedEmail] = useState("")
  const [medTel, setMedTel] = useState("")
  const [medSenha, setMedSenha] = useState("")
  const [medCrm, setMedCrm] = useState("")
  const [medDescricao, setMedDescricao] = useState("")
  const [medEspId, setMedEspId] = useState<string>("")

  const [novoRecepOpen, setNovoRecepOpen] = useState(false)
  const [recepNome, setRecepNome] = useState("")
  const [recepEmail, setRecepEmail] = useState("")
  const [recepTel, setRecepTel] = useState("")
  const [recepSenha, setRecepSenha] = useState("")

  // ── Handlers ─────────────────────────────────────────────────────────
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

  async function handleCriarRecepcionista(e: React.FormEvent) {
    e.preventDefault()
    if (!recepNome || !recepEmail || !recepSenha) {
      toast.error("Preencha nome, email e senha.")
      return
    }
    try {
      await cadastrar({
        nome: recepNome,
        email: recepEmail,
        telefone: recepTel,
        senha: recepSenha,
        tipo_usuario: "recepcionista",
      })
      toast.success("Recepcionista cadastrado(a).")
      setRecepNome("")
      setRecepEmail("")
      setRecepTel("")
      setRecepSenha("")
      setNovoRecepOpen(false)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Erro ao cadastrar recepcionista."
      toast.error(msg)
    }
  }

  if (!usuarioLogado) return null

  const recepcionistas = usuarios.filter(
    (u) => u.tipo_usuario === "recepcionista",
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        perfilLabel="Recursos Humanos"
        titulo="Painel do RH"
        descricao="Cadastre e gerencie médicos e recepcionistas do Portal CIIR."
      />

      <main
        id="conteudo-principal"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Stats */}
        <section
          aria-label="Resumo do quadro de funcionários"
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Médicos ativos",
              valor: medicos.length,
              sub: `${especialidades.length} especialidades`,
              Icon: Stethoscope,
              cor: "primary",
            },
            {
              label: "Recepcionistas",
              valor: recepcionistas.length,
              sub: "Equipe de atendimento",
              Icon: ConciergeBell,
              cor: "accent",
            },
            {
              label: "Total operacional",
              valor: medicos.length + recepcionistas.length,
              sub: "Profissionais cadastrados",
              Icon: Briefcase,
              cor: "primary",
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

        {/* Atalho rápido */}
        <section className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setNovoMedicoOpen(true)}
            className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-left hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Stethoscope size={20} aria-hidden="true" />
              </span>
              <p className="font-display text-lg font-bold">
                Cadastrar médico
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              CRM, especialidade e dados de acesso.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setNovoRecepOpen(true)}
            className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 text-left hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <ConciergeBell size={20} aria-hidden="true" />
              </span>
              <p className="font-display text-lg font-bold">
                Cadastrar recepcionista
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Cria conta de acesso para a equipe de recepção.
            </p>
          </button>
        </section>

        {/* Listagens */}
        <section aria-labelledby="quadro">
          <h2 id="quadro" className="sr-only">
            Quadro de funcionários
          </h2>
          <Tabs defaultValue="medicos">
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="medicos" className="gap-2">
                <Stethoscope size={16} aria-hidden="true" />
                Médicos
              </TabsTrigger>
              <TabsTrigger value="recepcionistas" className="gap-2">
                <ConciergeBell size={16} aria-hidden="true" />
                Recepcionistas
              </TabsTrigger>
            </TabsList>

            {/* Médicos */}
            <TabsContent value="medicos" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                  <h3 className="font-display font-bold">
                    Médicos ({medicos.length})
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
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicos.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            Nenhum médico cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                      {medicos.map((m) => {
                        const usuario = usuarios.find(
                          (u) => u.id === m.usuario_id,
                        )
                        const espNomes =
                          m.especialidades?.map((e) => e.nome).join(", ") ??
                          "—"
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-semibold">
                              {usuario?.nome ?? `Médico #${m.id}`}
                            </TableCell>
                            <TableCell className="text-sm">{m.crm}</TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2 py-1">
                                {espNomes}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {usuario?.email ?? "—"}
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

            {/* Recepcionistas */}
            <TabsContent value="recepcionistas" className="mt-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                  <h3 className="font-display font-bold">
                    Recepcionistas ({recepcionistas.length})
                  </h3>
                  <Button
                    onClick={() => setNovoRecepOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Novo(a) recepcionista
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recepcionistas.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-10 text-muted-foreground"
                          >
                            Nenhum(a) recepcionista cadastrado(a).
                          </TableCell>
                        </TableRow>
                      )}
                      {recepcionistas.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-semibold">
                            {u.nome}
                          </TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm">
                            {u.telefone ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await removerUsuario(u.id)
                                  toast.success("Recepcionista removido(a).")
                                } catch {
                                  toast.error("Erro ao remover.")
                                }
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
          </Tabs>
        </section>
      </main>

      {/* Modal: novo médico */}
      <Dialog open={novoMedicoOpen} onOpenChange={setNovoMedicoOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Cadastrar médico
            </DialogTitle>
            <DialogDescription>
              Cria a conta do profissional + vínculo com especialidade.
            </DialogDescription>
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

      {/* Modal: novo recepcionista */}
      <Dialog open={novoRecepOpen} onOpenChange={setNovoRecepOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Cadastrar recepcionista
            </DialogTitle>
            <DialogDescription>
              Cria o usuário com <code>tipo_usuario = recepcionista</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCriarRecepcionista} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-nome" className="text-sm font-semibold">
                Nome completo
              </Label>
              <Input
                id="r-nome"
                value={recepNome}
                onChange={(e) => setRecepNome(e.target.value)}
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
                  value={recepEmail}
                  onChange={(e) => setRecepEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-tel" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="r-tel"
                  value={recepTel}
                  onChange={(e) => setRecepTel(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-senha" className="text-sm font-semibold">
                Senha
              </Label>
              <Input
                id="r-senha"
                type="password"
                value={recepSenha}
                onChange={(e) => setRecepSenha(e.target.value)}
                className="h-11"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNovoRecepOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Cadastrar recepcionista
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
