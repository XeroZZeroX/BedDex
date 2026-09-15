"use client"

import { useState } from "react"
import { Pencil, Trash2, Calendar, Lock, ChevronDown, ChevronUp, Zap, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile, Criteres } from "@/types/profile"
import { CRITERE_LABELS } from "@/types/profile"

interface ProfileCardProps {
  profile: Profile
  onEdit: (profile: Profile) => void
  onDelete: (id: string) => Promise<void> | void
  onTagClick?: (tag: string) => void
  index?: number
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function getPokedexRank(score: number): { rank: string; color: string; bg: string; border: string } {
  if (score >= 9.0)
    return { rank: "RANG S (LÉGENDAIRE)", color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" }
  if (score >= 7.5)
    return { rank: "RANG A (TRÈS RARE)", color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/40" }
  if (score >= 6.0)
    return { rank: "RANG B (NOTABLE)", color: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/40" }
  if (score >= 4.5)
    return { rank: "RANG C (COMMUN)", color: "text-orange-300", bg: "bg-orange-500/15", border: "border-orange-500/40" }
  return { rank: "RANG D (DÉCEVANT)", color: "text-rose-300", bg: "bg-rose-500/15", border: "border-rose-500/40" }
}

export function ProfileCard({ profile, onEdit, onDelete, onTagClick, index = 1 }: ProfileCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isFemale = profile.genre === "F"
  const rank = getPokedexRank(profile.noteGlobale)

  // 3-digit Pokedex ID
  const pokeNum = String(index).padStart(3, "0")

  const critereKeys: Array<keyof Criteres> = [
    "alchimie",
    "communication",
    "hygiene",
    "presence",
    "relance",
  ]

  async function handleDelete() {
    if (confirmDelete) {
      setIsDeleting(true)
      try {
        await onDelete(profile.id)
      } finally {
        setIsDeleting(false)
      }
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3500)
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-xl",
        isFemale
          ? "border-purple-600/40 bg-gradient-to-b from-[#180d22] via-[#0e0a16] to-[#07050a] hover:border-purple-400 hover:shadow-[0_0_35px_-5px_rgba(168,85,247,0.35)]"
          : "border-blue-600/40 bg-gradient-to-b from-[#0d1626] via-[#0a101c] to-[#05080e] hover:border-blue-400 hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.35)]"
      )}
    >
      {/* Top Pokédex cartridge header */}
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-2 text-[11px] font-mono tracking-wider uppercase font-bold",
          isFemale
            ? "border-purple-500/30 bg-purple-950/40 text-purple-300"
            : "border-blue-500/30 bg-blue-950/40 text-blue-300"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-red-500 animate-pulse" />
          <span>DEX ENTRY #{pokeNum}</span>
        </div>

        {/* Pokémon Type Badge */}
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase shadow-sm",
            isFemale
              ? "border-purple-400/50 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "border-blue-400/50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          )}
        >
          {isFemale ? "♀ FEMME" : "♂ HOMME"}
        </span>
      </div>

      {/* Main card body */}
      <div className="p-4 space-y-4">
        {/* Specimen Viewport (Screen) */}
        <div className="relative rounded-xl border border-white/10 bg-[#060a12] p-3 shadow-inner scanlines overflow-hidden">
          {/* Target corner reticles */}
          <div className="pointer-events-none absolute top-1 left-1 size-2 border-t border-l border-cyan-400/60" />
          <div className="pointer-events-none absolute top-1 right-1 size-2 border-t border-r border-cyan-400/60" />
          <div className="pointer-events-none absolute bottom-1 left-1 size-2 border-b border-l border-cyan-400/60" />
          <div className="pointer-events-none absolute bottom-1 right-1 size-2 border-b border-r border-cyan-400/60" />

          <div className="flex items-center justify-between gap-3">
            {/* Hologram Avatar Screen */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "relative flex size-12 shrink-0 items-center justify-center rounded-xl border-2 font-mono text-base font-black tracking-widest shadow-md",
                  isFemale
                    ? "border-purple-500/50 bg-purple-950/80 text-purple-200"
                    : "border-blue-500/50 bg-blue-950/80 text-blue-200"
                )}
              >
                {profile.pseudo.slice(0, 2).toUpperCase()}
                <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              <div>
                <h3 className="font-mono text-sm font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                  <span>{profile.pseudo}</span>
                  <span className="text-xs text-zinc-500">
                    ({profile.genre === "F" ? "Femme" : "Homme"})
                  </span>
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Calendar className="size-3 text-zinc-500" />
                  <span>DÉTECTÉ LE {formatDate(profile.dateRencontre)}</span>
                </p>
              </div>
            </div>

            {/* BST - Note Globale (Big Digital Readout) */}
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-black tracking-tight text-cyan-300 lcd-glow">
                  {profile.noteGlobale.toFixed(1)}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">/10</span>
              </div>
              <span
                className={cn(
                  "mt-0.5 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase",
                  rank.bg,
                  rank.color,
                  rank.border
                )}
              >
                {rank.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Base Stats Section */}
        <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black/40 p-3 font-mono">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-amber-400" />
              <span>STATISTIQUES DE COMBAT</span>
            </span>
            <span>VALEUR (1-10)</span>
          </div>

          <div className="space-y-2 pt-1">
            {(expanded ? critereKeys : critereKeys.slice(0, 3)).map((key) => {
              const val = profile.criteres[key] ?? 5
              const pct = val * 10
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-[11px] uppercase tracking-wider text-zinc-400">
                    {key.slice(0, 4)}:
                  </span>
                  {/* Retro Pokémon Stat Bar */}
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-900 border border-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        val >= 8
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : val >= 6
                            ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                            : "bg-gradient-to-r from-rose-500 to-red-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-bold text-zinc-200 text-xs">
                    {val}
                  </span>
                </div>
              )
            })}

            {critereKeys.length > 3 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-center gap-1 pt-1 text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {expanded ? (
                  <>REPLIER LES STATS <ChevronUp className="size-3" /></>
                ) : (
                  <>+2 STATISTIQUES SECRÈTES <ChevronDown className="size-3" /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pokédex Entry / Description Screen (Always displayed for uniform card structure) */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 font-mono text-xs">
          <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-1">
            <Lock className="size-2.5" />
            <span>RAPPORT DE RECONNAISSANCE :</span>
          </div>
          <p className="line-clamp-2 font-mono text-[11px] leading-relaxed italic text-emerald-200/90">
            {profile.commentairesPrives ? (
              <>« {profile.commentairesPrives} »</>
            ) : (
              <span className="text-zinc-600 not-italic">
                « AUCUN RAPPORT DE TERRAIN ENREGISTRÉ POUR CE SPÉCIMEN. »
              </span>
            )}
          </p>
        </div>

        {/* Capacités / Moves (Tags) */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">
            CAPACITÉS & NATURES :
          </span>
          {profile.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick?.(tag)}
                  className="inline-flex items-center rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300 transition-all hover:border-cyan-400 hover:text-cyan-300 hover:scale-105 cursor-pointer uppercase"
                  title={`Filtrer par #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-mono text-zinc-600 uppercase">
              [ AUCUNE CAPACITÉ ENREGISTRÉE ]
            </p>
          )}
        </div>
      </div>

      {/* Pokédex Action Hardware Controls */}
      <div
        className={cn(
          "flex items-center justify-end border-t px-4 py-2.5 font-mono text-xs",
          isFemale
            ? "border-purple-500/20 bg-purple-950/30"
            : "border-blue-500/20 bg-blue-950/30"
        )}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(profile)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-zinc-300 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all cursor-pointer uppercase"
          >
            <Pencil className="size-3" />
            <span>MODIFIER</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all cursor-pointer uppercase",
              confirmDelete
                ? "border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
            )}
          >
            <Trash2 className="size-3" />
            <span>{confirmDelete ? "RELÂCHER ?" : "RELÂCHER"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
