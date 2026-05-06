"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { credenciaisDemo } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const { login } = useHospital()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)

    // pequena espera simulada para feedback visual
    await new Promise((r) => setTimeout(r, 400))

    const usuario = login(email, senha)
    if (!usuario) {
      toast.error("Email ou senha inválidos", {
        description: "Verifique seus dados ou use uma conta de demonstração abaixo.",
      })
      setCarregando(false)
      return
    }

    toast.success(`Bem-vinda, ${usuario.nome.split(" ")[0]}!`)
    setCarregando(false)
    const rotas: Record<string, string> = {
      paciente: "/paciente",
      recepcionista: "/recepcionista",
      medico: "/medico",
      admin: "/admin",
    }
    router.push(rotas[usuario.perfil] ?? "/")
  }

  function entrarComoDemo(emailDemo: string) {
    setEmail(emailDemo)
    setSenha("123456")
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado visual */}
      <aside className="hidden lg:flex relative bg-primary text-primary-foreground p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-destructive/15 blur-3xl" aria-hidden="true" />
        </div>

        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-foreground text-primary">
            <Heart size={20} aria-hidden="true" fill="currentColor" />
          </span>
          Acolher
        </Link>

        <div>
          <p className="text-sm uppercase tracking-widest text-primary-foreground/70 font-bold">Bem-vinda de volta</p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold mt-2 leading-tight text-pretty">
            O cuidado da sua criança <span className="text-accent">continua aqui</span>.
          </h2>
          <p className="mt-4 text-primary-foreground/85 leading-relaxed text-lg max-w-md">
            Entre com seu email para ver suas próximas consultas, histórico e mensagens da equipe médica.
          </p>
        </div>

        <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur p-6 border border-primary-foreground/15">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/60 font-bold">Contas de demonstração</p>
          <p className="text-sm text-primary-foreground/80 mt-1 mb-4">
            Toque em uma das contas para preencher e testar cada perfil.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {credenciaisDemo.map((c) => (
              <button
                key={c.email}
                onClick={() => entrarComoDemo(c.email)}
                className="text-left rounded-xl bg-primary-foreground/5 hover:bg-primary-foreground/15 transition-colors p-3 border border-primary-foreground/10"
              >
                <p className="text-xs uppercase tracking-wider text-accent font-bold">{c.perfil}</p>
                <p className="text-sm font-semibold mt-0.5">{c.nome}</p>
                <p className="text-xs text-primary-foreground/70 truncate">{c.email}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para a página inicial
          </Link>

          <div className="mt-10">
            <p className="text-sm uppercase tracking-widest text-accent font-bold">Entrar</p>
            <h1 className="font-display text-4xl font-bold mt-2 text-pretty">Acesse sua conta</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Use seu email e senha cadastrados. Não tem conta?{" "}
              <Link href="/cadastro" className="text-primary font-semibold hover:underline">
                Cadastre-se aqui
              </Link>
              .
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-sm font-semibold">
                  Senha
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary font-semibold hover:underline"
                  onClick={() => toast.info("Recuperação de senha disponível em breve.")}
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={carregando}
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 gap-2"
            >
              <LogIn size={18} aria-hidden="true" />
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            <div className="lg:hidden rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-xs uppercase tracking-widest text-accent font-bold">Contas de demonstração</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {credenciaisDemo.map((c) => (
                  <button
                    type="button"
                    key={c.email}
                    onClick={() => entrarComoDemo(c.email)}
                    className="text-left rounded-lg bg-card hover:bg-card/70 p-2 border border-border"
                  >
                    <p className="text-xs uppercase tracking-wider text-accent font-bold">{c.perfil}</p>
                    <p className="text-sm font-semibold mt-0.5 truncate">{c.nome}</p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
