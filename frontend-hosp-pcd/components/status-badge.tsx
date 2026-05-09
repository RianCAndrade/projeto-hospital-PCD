import { cn } from "@/lib/utils"
import type { StatusConsulta } from "@/lib/types"
import { Clock, Stethoscope, CheckCircle2, XCircle } from "lucide-react"

const config: Record<
  StatusConsulta,
  { label: string; bg: string; fg: string; Icon: typeof Clock }
> = {
  aguardando: {
    label: "Aguardando atendimento",
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
  encerrado: {
    label: "Atendimento encerrado",
    bg: "bg-status-encerrado",
    fg: "text-status-encerrado-foreground",
    Icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-status-cancelado",
    fg: "text-status-cancelado-foreground",
    Icon: XCircle,
  },
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: StatusConsulta
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const { label, bg, fg, Icon } = config[status]
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
