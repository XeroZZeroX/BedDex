"use client"

import { useState } from "react"
import { SlidersHorizontal, X, Search, Sparkles, Filter } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { Genre } from "@/types/profile"

export interface FilterState {
  genre: Genre | "TOUS"
  noteMin: number
  tagSearch: string
}

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

const GENRE_OPTIONS: Array<{ value: Genre | "TOUS"; label: string }> = [
  { value: "TOUS", label: "TOUS LES GENRES" },
  { value: "F", label: "♀ FEMME" },
  { value: "H", label: "♂ HOMME" },
]

export function FilterBar({ filters, onChange, totalCount, filteredCount }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)

  const isFiltered =
    filters.genre !== "TOUS" || filters.noteMin > 1 || filters.tagSearch !== ""

  function reset() {
    onChange({ genre: "TOUS", noteMin: 1, tagSearch: "" })
  }

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Pokédex Search & Filter Console */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-black/40 rounded-xl border border-white/10">
        {/* Left: Pokémon Type Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-white/10">
          {GENRE_OPTIONS.map(({ value, label }) => {
            const isActive = filters.genre === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...filters, genre: value })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer",
                  isActive
                    ? value === "F"
                      ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                      : value === "H"
                        ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                        : "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
                aria-pressed={isActive}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-cyan-400" />
          <input
            type="search"
            value={filters.tagSearch}
            onChange={(e) => onChange({ ...filters, tagSearch: e.target.value })}
            placeholder="RECHERCHER UNE CAPACITÉ (#FUN, #INTENSE...)"
            className="h-9 w-full rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 text-xs text-cyan-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-cyan-400 font-mono uppercase tracking-wider"
            aria-label="Rechercher par capacité ou tag"
          />
        </div>

        {/* Right: Power/Score filter & counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer",
              expanded || filters.noteMin > 1
                ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                : "border-white/10 bg-black/60 text-zinc-400 hover:border-white/30 hover:text-white"
            )}
            aria-expanded={expanded}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>PUISSANCE MIN {filters.noteMin > 1 && `(${filters.noteMin}★)`}</span>
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer uppercase"
              title="Réinitialiser les filtres"
            >
              <X className="size-3" />
              <span>RESET</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 pl-2 text-xs font-mono font-bold text-cyan-400">
            <span>DEX: {filteredCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Expanded Power Slider Screen */}
      {expanded && (
        <div className="flex items-center gap-4 rounded-xl border-2 border-cyan-500/30 bg-[#070e17] p-4 shadow-inner scanlines animate-in fade-in-50 slide-in-from-top-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase">
            <Sparkles className="size-4 text-amber-400" />
            <span>FILTRE DE STATISTIQUE MINIMALE (IV) :</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={0.5}
            value={filters.noteMin}
            onValueChange={(val) => onChange({ ...filters, noteMin: val as number })}
            aria-label="Note minimale"
            className="flex-1"
          />
          <div className="flex min-w-20 items-center justify-center rounded-lg border border-cyan-400/40 bg-black/60 px-3 py-1 font-mono text-xs font-black text-cyan-300 lcd-glow">
            {filters.noteMin.toFixed(1)} / 10
          </div>
        </div>
      )}
    </div>
  )
}
