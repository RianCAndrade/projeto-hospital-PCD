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
import { Textarea } from "@/components/ui/textarea"
import { Heart, ArrowLeft, UserPlus, ShieldCheck, HeartHandshake } from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useHospital()

  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [sexo, setSexo] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [possuiAutismo, setPossuiAutismo] = useState(false)
  const [necessitaAcessibilidade, setNecessitaAcessibilidade] = useState(false)
  const [usaCadeiraRodas, setUsaCadeiraRodas] = useState(false)
  const [necessitaAcompanhante, setNecessitaAcompanhante] = useState(false)
  const [observacoes, setObservacoes] = useState("")
  const [observacoesComunicacao, setObservacoesComunicacao] = useState("")
  const [precisaResponsavel, setPrecisaResponsavel] = useState(false)
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
        cpf,
        email,
        telefone: telefone || undefined,
        senha,
        data_nascimento: dataNascimento,
        sexo,
        possui_autismo: possuiAutismo,
        necessita_acessibilidade: necessitaAcessibilidade,
        usa_cadeira_rodas: usaCadeiraRodas,
        necessita_acompanhante: necessitaAcompanhante,
        observacoes: observacoes || undefined,
        observacoes_comunicacao: observacoesComunicacao || undefined,
        tipo_usuario: "paciente",
        precisa_responsavel: precisaResponsavel,
      })

      toast.success("Cadastro realizado com sucesso!", {
        description: precisaResponsavel
          ? "Após o login, vincule o responsável no seu painel."
          : "Use seu email e senha para entrar.",
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
            Cadastro de paciente
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 leading-tight text-pretty">
            Bem-vinda ao <span className="text-primary">Acolher</span>.
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed text-lg max-w-2xl">
            Crie sua conta de paciente. Se precisar de um responsável
            vinculado (mãe, pai, cuidador), basta marcar a opção abaixo —
            você poderá vinculá-lo após o login.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            É funcionário (médico, recepcionista ou RH)? Sua conta é criada
            pelo RH ou pela Administração — não use este formulário.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          {/* Responsável */}
          <section
            aria-labelledby="precisa-responsavel"
            className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <HeartHandshake size={20} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="precisa-responsavel"
                  className="font-display text-xl font-bold"
                >
                  Preciso de um responsável?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Marque se você é criança/adolescente ou se precisa que
                  outra pessoa acompanhe e marque consultas por você.
                </p>
              </div>
            </div>

            <label
              htmlFor="precisa-resp"
              className="flex items-start gap-3 cursor-pointer rounded-xl border-2 border-border bg-card p-4 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-colors"
            >
              <input
                id="precisa-resp"
                type="checkbox"
                checked={precisaResponsavel}
                onChange={(e) => setPrecisaResponsavel(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-2 border-border accent-primary"
              />
              <span className="text-sm leading-relaxed">
                <span className="font-display font-bold block">
                  Sim, preciso vincular um responsável
                </span>
                <span className="text-muted-foreground">
                  Após criar a conta, você poderá cadastrar o responsável
                  (nome, CPF, parentesco) no seu painel.
                </span>
              </span>
            </label>
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
                <Label htmlFor="cpf" className="text-sm font-semibold">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  required
                  autoComplete="off"
                  placeholder="123.456.789-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-nascimento" className="text-sm font-semibold">
                  Data de nascimento
                </Label>
                <Input
                  id="data-nascimento"
                  type="date"
                  required
                  autoComplete="bday"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo" className="text-sm font-semibold">
                  Sexo
                </Label>
                <Select value={sexo} onValueChange={setSexo} required>
                  <SelectTrigger id="sexo" className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="nao_informado">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* Informações de acessibilidade */}
          <section
            aria-labelledby="acessibilidade"
            className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <HeartHandshake size={20} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="acessibilidade"
                  className="font-display text-xl font-bold"
                >
                  Informações de acessibilidade
                </h2>
                <p className="text-sm text-muted-foreground">
                  Opcionais — ajudam a equipe a preparar o melhor atendimento
                  para você.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "autismo",
                  label: "Possuo Transtorno do Espectro Autista (TEA)",
                  checked: possuiAutismo,
                  set: setPossuiAutismo,
                },
                {
                  id: "acessibilidade",
                  label: "Necessito de acessibilidade no ambiente",
                  checked: necessitaAcessibilidade,
                  set: setNecessitaAcessibilidade,
                },
                {
                  id: "cadeira-rodas",
                  label: "Uso cadeira de rodas",
                  checked: usaCadeiraRodas,
                  set: setUsaCadeiraRodas,
                },
                {
                  id: "acompanhante",
                  label: "Preciso de acompanhante durante o atendimento",
                  checked: necessitaAcompanhante,
                  set: setNecessitaAcompanhante,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  htmlFor={item.id}
                  className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card/50 p-4 has-[input:checked]:border-accent has-[input:checked]:bg-accent/5 transition-colors"
                >
                  <input
                    id={item.id}
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-2 border-border accent-accent"
                  />
                  <span className="text-sm leading-relaxed font-medium">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mt-6">
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-semibold">
                  Observações gerais
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Alguma informação relevante?"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs-comunicacao" className="text-sm font-semibold">
                  Observações de comunicação
                </Label>
                <Textarea
                  id="obs-comunicacao"
                  placeholder="Forma de comunicação, preferências, etc."
                  value={observacoesComunicacao}
                  onChange={(e) => setObservacoesComunicacao(e.target.value)}
                  className="min-h-[100px]"
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
