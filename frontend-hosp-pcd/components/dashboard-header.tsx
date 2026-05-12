"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useHospital } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LogOut, Heart } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Props {
  titulo: string
  descricao?: string
  perfilLabel: string
}

export function DashboardHeader({ titulo, descricao, perfilLabel }: Props) {
  const { usuarioLogado, logout } = useHospital()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const iniciais = usuarioLogado?.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Heart size={18} aria-hidden="true" fill="currentColor" />
            </span>
            <span className="hidden sm:inline">Acolher</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold">{usuarioLogado?.nome}</span>
              <span className="text-xs text-muted-foreground">{perfilLabel}</span>
            </div>
            <Avatar className="h-9 w-9 border-2 border-accent/30">
              <AvatarFallback className="bg-accent/15 text-accent-foreground font-semibold text-sm">
                <span className="text-accent">{iniciais}</span>
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              aria-label="Sair da conta"
              className="gap-2"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <div className="py-6 sm:py-8">
          <p className="text-xs uppercase tracking-widest text-accent font-bold">{perfilLabel}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1 text-pretty">{titulo}</h1>
          {descricao && (
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">{descricao}</p>
          )}
        </div>
      </div>
    </header>
  )
}
