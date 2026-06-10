"use client"

import type { Agendamento } from "@/lib/types"
import { useHospital } from "@/lib/store"
import { StatusBadge } from "./status-badge"
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  Baby,
  CheckCircle2,
  BellRing,
  Ticket,
} from "lucide-react"
import { useEffect, useState } from "react"

const diasSemana = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
]

const meses = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
]

/** Formata há quanto tempo o paciente foi chamado. */
function tempoChamado(updatedAt: string | undefined, now = Date.now()) {
  if (!updatedAt) return ""
  const t = new Date(updatedAt).getTime()
  if (Number.isNaN(t)) return ""
  const diffMs = now - t
  if (diffMs < 30_000) return "agora"
  const min = Math.floor(diffMs / 60_000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  return `há ${h}h`
}

/**
 * Combina `data_agendamento` (YYYY-MM-DD) e `horario` (HH:mm[:ss])
 * — o formato emitido pelo backend Laravel — em um Date local.
 */
function montarDate(data: string, horario: string) {
  // Garante "HH:mm:ss"
  const h = horario.length === 5 ? `${horario}:00` : horario
  return new Date(`${data}T${h}`)
}

function formatarDataHora(data: string, horario: string) {
  const d = montarDate(data, horario)
  const dia = d.getDate().toString().padStart(2, "0")
  const mes = meses[d.getMonth()]
  const ano = d.getFullYear()
  const hora = d.getHours().toString().padStart(2, "0")
  const min = d.getMinutes().toString().padStart(2, "0")
  return {
    dia,
    mes,
    ano,
    hora: `${hora}:${min}`,
    diaSemana: diasSemana[d.getDay()],
    timestamp: d.getTime(),
  }
}

export function AppointmentCard({
  agendamento,
  destaque = false,
  acoes,
}: {
  agendamento: Agendamento
  destaque?: boolean
  acoes?: React.ReactNode
}) {
  const { getPaciente, getMedicoNome, getEspecialidadeNome } = useHospital()

  const paciente = getPaciente(agendamento.paciente_id)
  const medicoNome = getMedicoNome(agendamento.medico_id)
  const especialidadeNome = getEspecialidadeNome(agendamento.especialidade_id)

  const data = formatarDataHora(agendamento.data_agendamento, agendamento.horario)
  const ehHoje =
    montarDate(agendamento.data_agendamento, agendamento.horario).toDateString() ===
    new Date().toDateString()

  const tipoDeficiencia =
    paciente?.deficiencias?.[0]?.tipo_deficiencia?.nome ??
    (paciente?.possui_autismo ? "TEA (Autismo)" : "—")

  const ehChamado = agendamento.status === "chamado"
  const ehAgendado = agendamento.status === "agendado"

  // Re-renderiza o "há X min" a cada minuto quando o card está em
  // estado `chamado`. Mantém local para não acoplar ao tick da página.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!ehChamado) return
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [ehChamado])
  const tempo = ehChamado ? tempoChamado(agendamento.updated_at) : ""

  return (
    <article
      className={`rounded-2xl border-2 p-5 sm:p-6 transition-all hover:shadow-md ${
        agendamento.status === "confirmado"
          ? "border-primary bg-primary/5"
          : ehChamado
            ? "border-amber-500 bg-amber-50"
            : ehAgendado
              ? "border-dashed border-muted-foreground/40 bg-muted/30 opacity-80"
              : destaque
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Bloco de data */}
        <div
          className={`shrink-0 rounded-xl text-center px-4 py-3 sm:py-4 sm:w-24 ${
            ehHoje
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            {ehHoje ? "Hoje" : data.diaSemana.slice(0, 3)}
          </p>
          <p className="font-display text-3xl font-bold leading-none mt-1">
            {data.dia}
          </p>
          <p className="text-xs uppercase font-semibold mt-1 opacity-80">
            {data.mes.slice(0, 3)}
          </p>
        </div>

        {/* Conteudo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                {especialidadeNome}
              </p>
              <h3 className="font-display text-xl font-bold mt-1 leading-tight">
                {medicoNome || "—"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {ehChamado && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-800 px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
                  <BellRing size={12} aria-hidden="true" />
                  {tempo}
                </span>
              )}
              <StatusBadge status={agendamento.status} />
              {agendamento.senha && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
                  <Ticket size={12} aria-hidden="true" />
                  {agendamento.senha.codigo}
                </span>
              )}
            </div>
          </div>

          {agendamento.status === "confirmado" && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 size={14} aria-hidden="true" />
              Confirmada pela recepção
            </p>
          )}
          {ehChamado && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <BellRing size={14} aria-hidden="true" />
              Aguardando chegada para iniciar
            </p>
          )}
          {ehAgendado && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Clock size={14} aria-hidden="true" />
              Aguardando confirmação da recepção
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Baby size={12} aria-hidden="true" />
                Paciente
              </dt>
              <dd className="text-sm font-semibold mt-1 truncate">
                {paciente?.nome ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Calendar size={12} aria-hidden="true" />
                Dia
              </dt>
              <dd className="text-sm font-semibold mt-1">
                {data.dia}/
                {(montarDate(agendamento.data_agendamento, agendamento.horario)
                  .getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}
                /{data.ano}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Clock size={12} aria-hidden="true" />
                Horário
              </dt>
              <dd className="text-sm font-semibold mt-1">{data.hora}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Stethoscope size={12} aria-hidden="true" />
                Necessidade
              </dt>
              <dd className="text-sm font-semibold mt-1 truncate">
                {tipoDeficiencia}
              </dd>
            </div>
            {agendamento.senha && (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <Ticket size={12} aria-hidden="true" />
                  Senha
                </dt>
                <dd className="text-sm font-semibold mt-1 font-mono text-primary">
                  {agendamento.senha.codigo}
                </dd>
              </div>
            )}
          </dl>

          {agendamento.observacoes && (
            <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-accent pl-3">
              {agendamento.observacoes}
            </p>
          )}

          {acoes && <div className="mt-5 flex flex-wrap gap-2">{acoes}</div>}
        </div>
      </div>
    </article>
  )
}
