"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { Button } from "@/components/ui/button"
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
import { Heart, ArrowLeft, Plus, Trash2, UserPlus, Baby, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import type { Crianca, TipoDeficiencia } from "@/lib/types"

const tiposDeficiencia: TipoDeficiencia[] = [
  "Física",
  "Intelectual",
  "Auditiva",
  "Visual",
  "Múltipla",
  "TEA (Autismo)",
  "Síndrome de Down",
  "Outra",
]

interface CriancaForm extends Omit<Crianca, "id"> {
  tempId: string
}

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useHospital()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [criancas, setCriancas] = useState<CriancaForm[]>([
    {
      tempId: `tmp-${Date.now()}`,
      nome: "",
      dataNascimento: "",
      tipoDeficiencia: "TEA (Autismo)",
      observacoes: "",
    },
  ])
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function adicionarCrianca() {
    setCriancas((prev) => [
      ...prev,
      {
        tempId: `tmp-${Date.now()}-${Math.random()}`,
        nome: "",
        dataNascimento: "",
        tipoDeficiencia: "TEA (Autismo)",
        observacoes: "",
      },
    ])
  }

  function removerCrianca(tempId: string) {
    setCriancas((prev) => (prev.length > 1 ? prev.filter((c) => c.tempId !== tempId) : prev))
  }

  function atualizarCrianca(tempId: string, campo: keyof CriancaForm, valor: string) {
    setCriancas((prev) =>
      prev.map((c) => (c.tempId === tempId ? { ...c, [campo]: valor } : c)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem.")
      return
    }
    if (senha.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.")
      return
    }
    if (!aceiteTermos) {
      toast.error("Você precisa aceitar os termos para continuar.")
      return
    }
    if (criancas.some((c) => !c.nome || !c.dataNascimento)) {
      toast.error("Preencha o nome e a data de nascimento de todas as crianças.")
      return
    }

    setCarregando(true)
    await new Promise((r) => setTimeout(r, 500))

    cadastrar({
      nome,
      email,
      telefone,
      criancas: criancas.map((c, i) => ({
        id: `c-novo-${Date.now()}-${i}`,
        nome: c.nome,
        dataNascimento: c.dataNascimento,
        tipoDeficiencia: c.tipoDeficiencia,
        observacoes: c.observacoes,
      })),
    })

    toast.success("Cadastro realizado com sucesso!", {
      description: "Bem-vinda à família Acolher.",
    })
    setCarregando(false)
    router.push("/paciente")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Heart size={18} aria-hidden="true" fill="currentColor" />
            </span>
            Acolher
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para a página inicial
        </Link>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-accent font-bold">Cadastro</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight text-pretty">
            Bem-vinda ao <span className="text-primary">Acolher</span>.
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed text-lg max-w-2xl">
            Preencha seus dados e cadastre suas crianças. Você poderá agendar consultas para cada uma logo em seguida.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {/* Dados pessoais */}
          <section aria-labelledby="dados-pessoais" className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <UserPlus size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="dados-pessoais" className="font-display text-xl font-bold">
                  Seus dados
                </h2>
                <p className="text-sm text-muted-foreground">Quem cuida da criança</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="nome" className="text-sm font-semibold">
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  required
                  autoComplete="name"
                  placeholder="Maria Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-semibold">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-semibold">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar-senha" className="text-sm font-semibold">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </section>

          {/* Crianças */}
          <section aria-labelledby="criancas" className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Baby size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="criancas" className="font-display text-xl font-bold">
                    Suas crianças
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Você pode cadastrar mais de uma criança e agendar para cada uma separadamente.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={adicionarCrianca}
                className="border-2 gap-2"
              >
                <Plus size={16} aria-hidden="true" /> Adicionar criança
              </Button>
            </div>

            <div className="space-y-5">
              {criancas.map((c, idx) => (
                <fieldset
                  key={c.tempId}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <legend className="px-2 text-sm font-bold text-accent">
                    Criança {idx + 1}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`nome-${c.tempId}`} className="text-sm font-semibold">
                        Nome da criança
                      </Label>
                      <Input
                        id={`nome-${c.tempId}`}
                        required
                        placeholder="Nome completo"
                        value={c.nome}
                        onChange={(e) => atualizarCrianca(c.tempId, "nome", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`data-${c.tempId}`} className="text-sm font-semibold">
                        Data de nascimento
                      </Label>
                      <Input
                        id={`data-${c.tempId}`}
                        type="date"
                        required
                        value={c.dataNascimento}
                        onChange={(e) => atualizarCrianca(c.tempId, "dataNascimento", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`tipo-${c.tempId}`} className="text-sm font-semibold">
                        Tipo de deficiência
                      </Label>
                      <Select
                        value={c.tipoDeficiencia}
                        onValueChange={(v) => atualizarCrianca(c.tempId, "tipoDeficiencia", v)}
                      >
                        <SelectTrigger id={`tipo-${c.tempId}`} className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDeficiencia.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`obs-${c.tempId}`} className="text-sm font-semibold">
                        Observações <span className="font-normal text-muted-foreground">(opcional)</span>
                      </Label>
                      <Textarea
                        id={`obs-${c.tempId}`}
                        placeholder="Alergias, sensibilidades, comunicação preferida..."
                        value={c.observacoes ?? ""}
                        onChange={(e) => atualizarCrianca(c.tempId, "observacoes", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {criancas.length > 1 && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerCrianca(c.tempId)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Remover criança
                      </Button>
                    </div>
                  )}
                </fieldset>
              ))}
            </div>
          </section>

          {/* Termos */}
          <div className="rounded-xl border border-border bg-secondary/40 p-5 flex items-start gap-3">
            <input
              type="checkbox"
              id="termos"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-2 border-border accent-primary"
            />
            <Label htmlFor="termos" className="text-sm leading-relaxed cursor-pointer">
              Eu concordo com os <span className="text-primary font-semibold">Termos de Uso</span> e a{" "}
              <span className="text-primary font-semibold">Política de Privacidade</span>, e autorizo o tratamento dos dados das minhas crianças exclusivamente para fins de atendimento médico, conforme a LGPD.
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              disabled={carregando}
              className="w-full sm:w-auto h-12 text-base px-8 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <ShieldCheck size={18} aria-hidden="true" />
              {carregando ? "Criando conta..." : "Criar conta gratuita"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
