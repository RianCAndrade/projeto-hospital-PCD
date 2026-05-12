"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
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
import { Heart, ArrowLeft, UserPlus, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"
import type { TipoUsuario } from "@/lib/types"

/**
 * Cadastro de usuário.
 *
 * Hoje envia para o backend exatamente os campos validados pelo
 * `RegisterController@register`:
 *
 *   { nome, email, telefone, senha, tipo_usuario }
 *
 * O cadastro de pacientes (filhos) e o vínculo de responsável serão
 * feitos em telas próprias depois — eles dependem de `POST /pacientes`
 * e `POST /responsaveis`, ainda não implementados no backend.
 */

const tiposUsuarioPublicos: { value: TipoUsuario; label: string; desc: string }[] =
  [
    {
      value: "responsavel",
      label: "Responsável (mãe, pai ou cuidador)",
      desc: "Cadastra crianças PCD e marca consultas para elas.",
    },
    {
      value: "paciente",
      label: "Paciente adulto",
      desc: "Maior de idade que se consulta sozinho.",
    },
  ]

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useHospital()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [tipoUsuario, setTipoUsuario] =
    useState<TipoUsuario>("responsavel")
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [carregando, setCarregando] = useState(false)

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

    setCarregando(true)
    try {
      await cadastrar({
        nome,
        email,
        telefone,
        senha,
        tipo_usuario: tipoUsuario,
      })

      toast.success("Cadastro realizado com sucesso!", {
        description: "Use seu email e senha para entrar.",
      })
      router.push("/login")
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir o cadastro. Tente novamente."
      toast.error(msg)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-lg"
          >
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
          <p className="text-sm uppercase tracking-widest text-accent font-bold">
            Cadastro
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight text-pretty">
            Bem-vinda ao <span className="text-primary">Acolher</span>.
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed text-lg max-w-2xl">
            Crie sua conta. Depois você poderá cadastrar suas crianças e
            agendar consultas com nossos especialistas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {/* Tipo de conta */}
          <section
            aria-labelledby="tipo-conta"
            className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="tipo-conta" className="font-display text-xl font-bold">
                  Tipo de conta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha como você vai usar o Acolher.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {tiposUsuarioPublicos.map((t) => {
                const ativo = tipoUsuario === t.value
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTipoUsuario(t.value)}
                    className={`text-left rounded-xl border-2 p-4 transition-colors ${
                      ativo
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                    aria-pressed={ativo}
                  >
                    <p className="font-display font-bold">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Dados pessoais */}
          <section
            aria-labelledby="dados-pessoais"
            className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <UserPlus size={20} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="dados-pessoais"
                  className="font-display text-xl font-bold"
                >
                  Seus dados
                </h2>
                <p className="text-sm text-muted-foreground">
                  Esses são os campos que o backend valida em <code>/api/register</code>.
                </p>
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
                <Label htmlFor="tipo-usuario" className="text-sm font-semibold">
                  tipo_usuario
                </Label>
                <Select
                  value={tipoUsuario}
                  onValueChange={(v) => setTipoUsuario(v as TipoUsuario)}
                >
                  <SelectTrigger id="tipo-usuario" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposUsuarioPublicos.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label
                  htmlFor="confirmar-senha"
                  className="text-sm font-semibold"
                >
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

          {/* Termos */}
          <div className="rounded-xl border border-border bg-secondary/40 p-5 flex items-start gap-3">
            <input
              type="checkbox"
              id="termos"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-2 border-border accent-primary"
            />
            <Label
              htmlFor="termos"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Eu concordo com os{" "}
              <span className="text-primary font-semibold">Termos de Uso</span>{" "}
              e a{" "}
              <span className="text-primary font-semibold">
                Política de Privacidade
              </span>
              , e autorizo o tratamento dos dados conforme a LGPD.
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              disabled={carregando}
              className="w-full sm:w-auto h-12 text-base px-8 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <ShieldCheck size={18} aria-hidden="true" />
              {carregando ? "Criando conta..." : "Criar conta"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
