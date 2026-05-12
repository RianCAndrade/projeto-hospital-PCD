import { cn } from "@/lib/utils"
import type { StatusAgendamento, StatusAtendimento, StatusSenha } from "@/lib/types"
import {
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  CalendarX,
  HelpCircle,
} from "lucide-react"

/**
 * Status que o badge sabe renderizar — união dos enums do backend
 * (StatusAgendamento, StatusAtendimento, StatusSenha) mais o valor
 * histórico "aguardando" (alias de "agendado") usado em telas legadas.
 */
export type StatusVisual =
  | StatusAgendamento
  | StatusAtendimento
  | StatusSenha

interface BadgeConfig {
  label: string
  bg: string
  fg: string
  Icon: typeof Clock
}

const config: Record<string, BadgeConfig> = {
  // Agendamento
  agendado: {
    label: "Agendado",
    bg: "bg-status-aguardando",
    fg: "text-status-aguardando-foreground",
    Icon: Clock,
  },
  confirmado: {
    label: "Confirmado",
    bg: "bg-status-aguardando",
    fg: "text-status-aguardando-foreground",
    Icon: CalendarCheck,
  },
  finalizado: {
    label: "Finalizado",
    bg: "bg-status-encerrado",
    fg: "text-status-encerrado-foreground",
    Icon: CheckCircle2,
  },
  faltou: {
    label: "Não compareceu",
    bg: "bg-status-cancelado",
    fg: "text-status-cancelado-foreground",
    Icon: CalendarX,
  },
  // Atendimento
  nao_atendido: {
    label: "Não atendido",
    bg: "bg-status-aguardando",
    fg: "text-status-aguardando-foreground",
    Icon: Clock,
  },
  em_atendimento: {
    label: "Em atendimento",
    bg: "bg-status-em-atendimento",
    fg: "text-status-em-atendimento-foreground",
    Icon: Stethoscope,
  },
  atendido: {
    label: "Atendido",
    bg: "bg-status-encerrado",
    fg: "text-status-encerrado-foreground",
    Icon: CheckCircle2,
  },
  nao_compareceu: {
    label: "Não compareceu",
    bg: "bg-status-cancelado",
    fg: "text-status-cancelado-foreground",
    Icon: CalendarX,
  },
  // Compartilhado
  cancelado: {
    label: "Cancelado",
    bg: "bg-status-cancelado",
    fg: "text-status-cancelado-foreground",
    Icon: XCircle,
  },
  // Senha
  ativa: {
    label: "Ativa",
    bg: "bg-status-aguardando",
    fg: "text-status-aguardando-foreground",
    Icon: Clock,
  },
  utilizada: {
    label: "Utilizada",
    bg: "bg-status-encerrado",
    fg: "text-status-encerrado-foreground",
    Icon: CheckCircle2,
  },
  expirada: {
    label: "Expirada",
    bg: "bg-status-cancelado",
    fg: "text-status-cancelado-foreground",
    Icon: XCircle,
  },
}

const fallback: BadgeConfig = {
  label: "Desconhecido",
  bg: "bg-muted",
  fg: "text-muted-foreground",
  Icon: HelpCircle,
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: StatusVisual | string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const { label, bg, fg, Icon } = config[status] ?? fallback
  const sizeClass =
    size === "sm"
      ? "text-xs px-2 py-1 gap-1.5"
      : size === "lg"
        ? "text-sm px-3.5 py-2 gap-2"
        : "text-xs px-2.5 py-1.5 gap-1.5"
  const iconSize = size === "lg" ? 16 : 14
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-tight whitespace-nowrap",
        bg,
        fg,
        sizeClass,
        className,
      )}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {label}
    </span>
  )
}
