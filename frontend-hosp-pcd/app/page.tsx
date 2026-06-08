import Link from "next/link"
import {
  Heart,
  ShieldCheck,
  CalendarHeart,
  Users,
  Stethoscope,
  Accessibility,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const especialidades = [
  { nome: "Neuropediatria", desc: "Avaliação e acompanhamento neurológico infantil." },
  { nome: "Fonoaudiologia", desc: "Estímulo da fala e da audição." },
  { nome: "Fisioterapia", desc: "Reabilitação motora especializada." },
  { nome: "Terapia Ocupacional", desc: "Autonomia nas atividades do dia a dia." },
  { nome: "Psicologia Infantil", desc: "Suporte emocional para a criança e a família." },
  { nome: "Oftalmologia Pediátrica", desc: "Cuidado visual desde os primeiros anos." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Heart size={20} aria-hidden="true" fill="currentColor" />
              </span>
              Portal CIIR
            </Link>
            <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#especialidades" className="hover:text-primary transition-colors">Especialidades</a>
              <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
              <a href="#acessibilidade" className="hover:text-primary transition-colors">Acessibilidade</a>
              <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
            </nav>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="conteudo-principal">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                  <Heart size={14} fill="currentColor" aria-hidden="true" />
                  Cuidado especializado e humano
                </div>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mt-5 leading-[1.05] tracking-tight text-balance">
                  Sua coragem encontra <span className="text-primary">cuidado</span> em cada{" "}
                  <span className="text-accent">passo</span>.
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl text-pretty">
                  O Portal CIIR é dedicado a adulto e criança com deficiência. Agende consultas com especialistas, acompanhe o atendimento em tempo real e sinta-se em casa.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="text-base h-12 px-6 bg-primary hover:bg-primary/90">
                    <Link href="/cadastro" className="gap-2">
                      Criar conta gratuita
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base h-12 px-6 border-2">
                    <Link href="/login">Já tenho conta</Link>
                  </Button>
                </div>

                <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Famílias</dt>
                    <dd className="font-display text-2xl font-bold mt-1">+2.500</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Especialistas</dt>
                    <dd className="font-display text-2xl font-bold mt-1 text-primary">38</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Avaliação</dt>
                    <dd className="font-display text-2xl font-bold mt-1 text-accent">4.9</dd>
                  </div>
                </dl>
              </div>

            <div className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mx-auto">
                <CalendarHeart size={22} aria-hidden="true" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-4">
                Próxima consulta
              </p>
              <p className="font-display font-bold text-lg mt-1 text-muted-foreground">
                Faça login para ver suas consultas
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Após entrar, sua próxima consulta agendada aparecerá aqui com data, horário, especialista e sala.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="h-12 px-6 bg-primary hover:bg-primary/90">
                  <Link href="/login" className="gap-2">
                    Entrar
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-2">
                  <Link href="/cadastro">Criar conta</Link>
                </Button>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="py-16 md:py-24 bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-widest text-accent font-bold">Quem somos</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight text-pretty">
                Um hospital pensado para adultos e crianças com seus responsaveis.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                Sabemos que cada paciente tem seu próprio tempo. Por isso, construímos uma experiência sem pressa, com profissionais treinados para Portal CIIR diferentes deficiências e famílias.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  Icon: Users,
                  cor: "primary",
                  titulo: "Família no centro",
                  desc: "Você cadastra todas as suas crianças e acompanha cada uma com facilidade.",
                },
                {
                  Icon: Stethoscope,
                  cor: "accent",
                  titulo: "Especialistas por deficiência",
                  desc: "Nossa recepção encontra o profissional certo para cada necessidade específica.",
                },
                {
                  Icon: ShieldCheck,
                  cor: "primary",
                  titulo: "Acompanhamento ao vivo",
                  desc: "Veja em tempo real o status do atendimento: aguardando, em curso ou encerrado.",
                },
                {
                  Icon: Accessibility,
                  cor: "accent",
                  titulo: "Acessibilidade real",
                  desc: "Rampas, sala sensorial, intérprete de Libras e atendimento sem ruído.",
                },
                {
                  Icon: CalendarHeart,
                  cor: "primary",
                  titulo: "Histórico completo",
                  desc: "Tenha à mão consultas passadas, próximas datas e observações dos médicos.",
                },
                {
                  Icon: Heart,
                  cor: "accent",
                  titulo: "Cuidado humano",
                  desc: "Equipe treinada em comunicação empática e escuta ativa para mães.",
                },
              ].map(({ Icon, titulo, desc, cor }) => (
                <article
                  key={titulo}
                  className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl ${
                      cor === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold mt-5">{titulo}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Especialidades */}
        <section id="especialidades" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-widest text-accent font-bold">Especialidades</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-pretty">
                  Cada paciente, seja ele adulto ou infantil, merece o profissional certo.
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Filtramos automaticamente os especialistas conforme o tipo de deficiência cadastrado para você paciente adulto ou infantil.
                </p>
              </div>
              <Button asChild variant="outline" className="self-start md:self-auto border-2">
                <Link href="/cadastro">Ver agenda completa</Link>
              </Button>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {especialidades.map((e, i) => (
                <article
                  key={e.nome}
                  className={`rounded-2xl p-6 border-2 ${
                    i % 3 === 0
                      ? "border-primary/30 bg-primary/5"
                      : i % 3 === 1
                        ? "border-accent/30 bg-accent/5"
                        : "border-border bg-card"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                    Especialidade
                  </p>
                  <h3 className="font-display text-xl font-bold mt-1">{e.nome}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Acessibilidade */}
        <section id="acessibilidade" className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-foreground/70 font-bold">
                Acessibilidade
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight text-pretty">
                Construído seguindo as diretrizes WCAG 2.2.
              </h2>
              <p className="mt-4 text-primary-foreground/85 leading-relaxed text-lg">
                Contraste reforçado, navegação por teclado, leitura por leitores de tela e respeito à preferência por menos animações.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Foco visível em todos os controles interativos",
                  "Textos alternativos em todas as imagens informativas",
                  "Tamanhos de toque adequados para qualquer mão",
                  "Linguagem simples, sem termos médicos confusos",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <ArrowRight size={12} />
                    </span>
                    <span className="text-primary-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-primary-foreground/10 backdrop-blur p-8 border border-primary-foreground/20">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { titulo: "AA", desc: "Conformidade WCAG mínima atingida em todas as telas." },
                  { titulo: "100%", desc: "Das interações navegáveis apenas pelo teclado." },
                  { titulo: "16px+", desc: "Tamanho mínimo de fonte para textos do corpo." },
                  { titulo: "4.5:1", desc: "Razão de contraste mínima entre texto e fundo." },
                ].map((stat) => (
                  <div key={stat.titulo} className="rounded-2xl bg-primary-foreground/5 p-5">
                    <p className="font-display text-3xl font-bold text-accent">{stat.titulo}</p>
                    <p className="text-sm text-primary-foreground/80 mt-1 leading-relaxed">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight text-pretty">
              Deixamos cuidar de <span className="text-accent">você</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Crie sua conta agora e cadastre-se. A primeira consulta de avaliação é gratuita.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/cadastro" className="gap-2">
                  Criar conta agora
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-2">
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contato" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Heart size={18} fill="currentColor" aria-hidden="true" />
                </span>
                Portal CIIR
              </Link>
              <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
                Cuidado especializado para adulto e criança com deficiência. Aqui, cada família é parte da nossa.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold mb-3">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone size={14} aria-hidden="true" /> 0800 123 4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} aria-hidden="true" /> Av. das Famílias, 1500
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} aria-hidden="true" /> 24h, todos os dias
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-3">Acesso</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-primary">Entrar</Link>
                </li>
                <li>
                  <Link href="/cadastro" className="text-muted-foreground hover:text-primary">Cadastrar</Link>
                </li>
                <li>
                  <a href="#especialidades" className="text-muted-foreground hover:text-primary">Especialidades</a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Portal CIIR · Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
