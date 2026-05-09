"use client"

import type { Agendamento } from "@/lib/types"
import { StatusBadge } from "./status-badge"
import { Calendar, Clock, Stethoscope, MapPin, Baby } from "lucide-react"

const diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]

const meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

function formatarDataHora(iso: string) {
  const d = new Date(iso)
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
  const data = formatarDataHora(agendamento.dataHora)
  const ehHoje = new Date(agendamento.dataHora).toDateString() === new Date().toDateString()

  return (
    <article
      className={`rounded-2xl border-2 p-5 sm:p-6 transition-all hover:shadow-md ${
        destaque
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Bloco de data */}
        <div
          className={`shrink-0 rounded-xl text-center px-4 py-3 sm:py-4 sm:w-24 ${
            ehHoje ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <p className="text-xs uppercase tracking-widest font-bold opacity-80">
            {ehHoje ? "Hoje" : data.diaSemana.slice(0, 3)}
          </p>
          <p className="font-display text-3xl font-bold leading-none mt-1">{data.dia}</p>
          <p className="text-xs uppercase font-semibold mt-1 opacity-80">{data.mes.slice(0, 3)}</p>
        </div>

        {/* Conteudo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                {agendamento.especialidade}
              </p>
              <h3 className="font-display text-xl font-bold mt-1 leading-tight">
                {agendamento.medicoNome}
              </h3>
            </div>
            <StatusBadge status={agendamento.status} />
          </div>

          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Baby size={12} aria-hidden="true" />
                Criança
              </dt>
              <dd className="text-sm font-semibold mt-1 truncate">{agendamento.criancaNome}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <Calendar size={12} aria-hidden="true" />
                Dia
              </dt>
              <dd className="text-sm font-semibold mt-1">
                {data.dia}/{(new Date(agendamento.dataHora).getMonth() + 1).toString().padStart(2, "0")}/{data.ano}
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
                Tipo
              </dt>
              <dd className="text-sm font-semibold mt-1">{agendamento.tipoDeficiencia}</dd>
            </div>
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
