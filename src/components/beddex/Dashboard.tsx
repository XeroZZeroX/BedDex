"use client"

import { useState, useMemo } from "react"
import { Plus, LogOut, ChevronDown, Loader2, AlertCircle, Sparkles, Dna, Trophy, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileCard } from "@/components/beddex/ProfileCard"
import { ProfileModal } from "@/components/beddex/ProfileModal"
import { FilterBar } from "@/components/beddex/FilterBar"
import type { FilterState } from "@/components/beddex/FilterBar"
import { useProfileStore } from "@/lib/store"
import { useAuth } from "@/contexts/AuthContext"
import type { Profile, ProfileDraft } from "@/types/profile"

const DEFAULT_FILTERS: FilterState = {
  genre: "TOUS",
  noteMin: 1,
  tagSearch: "",
}

function formatUsername(email?: string | null): string {
  if (!email) return "DRESSEUR"
  return email.replace(/@beddex\.internal$/i, "")
}

function getUserInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

export function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()

  const { profiles, loading: storeLoading, error, addProfile, updateProfile, deleteProfile } =
    useProfileStore(user?.id ?? "")

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (filters.genre !== "TOUS" && p.genre !== filters.genre) return false
      if (p.noteGlobale < filters.noteMin) return false
      if (filters.tagSearch) {
        const q = filters.tagSearch.toLowerCase()
        if (!p.tags.some((t) => t.includes(q))) return false
      }
      return true
    })
  }, [profiles, filters])

  // Pokédex Trainer Stats calculation
  const stats = useMemo(() => {
    if (profiles.length === 0) return null
    const total = profiles.length
    const avgScore = profiles.reduce((sum, p) => sum + p.noteGlobale, 0) / total
    const topScore = Math.max(...profiles.map((p) => p.noteGlobale))
    const womenCount = profiles.filter((p) => p.genre === "F").length
    const menCount = profiles.filter((p) => p.genre === "H").length
    return {
      total: String(total).padStart(3, "0"),
      avgScore: avgScore.toFixed(1),
      topScore: topScore.toFixed(1),
      womenCount,
      menCount,
    }
  }, [profiles])

  function openCreate() {
    setEditingProfile(undefined)
    setModalOpen(true)
  }

  function openEdit(profile: Profile) {
    setEditingProfile(profile)
    setModalOpen(true)
  }

  async function handleSave(draft: ProfileDraft) {
    if (editingProfile) {
      await updateProfile(editingProfile.id, draft)
    } else {
      await addProfile(draft)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push("/login")
  }

  const username = formatUsername(user?.email)

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0d0406] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
          <span className="font-mono text-xs tracking-widest text-red-400 uppercase font-bold">
            INITIALISATION DU BEDDEX OS...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#a81919] via-[#8c1313] to-[#5e0c0c] text-zinc-100 selection:bg-black/40 selection:text-white">
      {/* Pokédex Iconic Top Shell Header */}
      <header className="sticky top-0 z-30 border-b-4 border-[#5c0d12] bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#991b1b] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Pokédex Sensors & Lens */}
          <div className="flex items-center gap-3">
            {/* Custom BedDex App Icon */}
            <div className="relative flex size-12 shrink-0 items-center justify-center">
              <img
                src="/logo.png"
                alt="BedDex"
                className="size-12 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform"
              />
            </div>

            {/* 3 mini LED indicator lights: Red, Yellow, Green */}
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-red-950 bg-red-400 shadow-[0_0_8px_#ef4444]" />
              <span className="size-2.5 rounded-full border border-yellow-950 bg-yellow-400 shadow-[0_0_8px_#eab308]" />
              <span className="size-2.5 rounded-full border border-emerald-950 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Brand Title */}
            <div className="hidden sm:flex flex-col pl-2 border-l-2 border-red-800/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BEDDEX
                </span>
              </div>
              <span className="font-mono text-[10px] text-red-100/80 font-bold uppercase tracking-wider">
                ARCHIVES RÉGIONALES DE SPÉCIMENS
              </span>
            </div>
          </div>

          {/* Right Hardware Actions */}
          <div className="flex items-center gap-3">
            {/* Scanner Button (Nouvelle Fiche) */}
            <button
              onClick={openCreate}
              type="button"
              className="flex items-center gap-2 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-400 to-amber-500 px-3.5 py-2 font-mono text-xs font-black uppercase text-zinc-950 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer hover:brightness-110"
            >
              <Plus className="size-4 stroke-[3]" />
              <span>SCANNER UN SPÉCIMEN</span>
            </button>

            {/* Trainer Profile Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border-2 border-black/40 bg-black/50 px-2.5 py-1.5 font-mono text-xs font-bold text-white transition-all hover:bg-black/70 cursor-pointer shadow-inner"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="flex size-6 items-center justify-center rounded-lg bg-red-600 font-mono text-xs font-black text-white border border-red-400 shadow">
                  {getUserInitials(username)}
                </div>
                <span className="hidden sm:inline-block max-w-28 truncate text-amber-200">
                  DRESSEUR: @{username}
                </span>
                <ChevronDown className="size-3.5 text-zinc-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border-2 border-red-500/40 bg-[#0d0709]/95 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in-50 zoom-in-95 font-mono">
                    <div className="border-b border-white/10 p-3 bg-red-950/40">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">CARTE DE DRESSEUR</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-amber-300">
                        @{username}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer uppercase"
                      >
                        {signingOut ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <LogOut className="size-3.5" />
                        )}
                        <span>ÉTEINDRE LE BEDDEX</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Pokédex Chassis Body */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border-2 border-rose-500/40 bg-rose-950/40 px-4 py-3 font-mono text-xs text-rose-300 backdrop-blur-xl">
            <AlertCircle className="size-4 shrink-0 text-rose-400" />
            <p>ERREUR SYSTÈME DU BEDDEX : {error}</p>
          </div>
        )}

        {/* Pokédex LCD Digital Stats Screen */}
        {stats && (
          <div className="rounded-2xl border-2 border-white/10 bg-[#070b12] p-4 shadow-2xl scanlines">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                <span>RAPPORT GLOBAL DU POKÉDEX RÉGIONAL</span>
              </span>
              <span className="text-zinc-500">SYNCHRONISATION TERMINÉE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
              {/* Stat 1: Total specimens */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 shadow-inner">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase">
                  <Dna className="size-3.5 text-cyan-400" />
                  <span>SPÉCIMENS CAPTURÉS</span>
                </div>
                <p className="mt-1 text-2xl font-black tracking-tight text-white lcd-glow">
                  {stats.total}
                </p>
                <div className="mt-1 text-[10px] text-zinc-400">
                  ♀ {stats.womenCount} FEMMES · ♂ {stats.menCount} HOMMES
                </div>
              </div>

              {/* Stat 2: Moyenne Note */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 shadow-inner">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase">
                  <BarChart2 className="size-3.5 text-amber-400" />
                  <span>NOTE MOYENNE DU DEX</span>
                </div>
                <p className="mt-1 text-2xl font-black tracking-tight text-amber-300 lcd-glow">
                  {stats.avgScore} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                </p>
                <div className="mt-1 text-[10px] text-zinc-400">
                  INDICE MOYEN D'ALCHIMIE
                </div>
              </div>

              {/* Stat 3: Record Alchimie */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 shadow-inner">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase">
                  <Trophy className="size-3.5 text-yellow-400" />
                  <span>RECORD SHINY DU DEX</span>
                </div>
                <p className="mt-1 text-2xl font-black tracking-tight text-emerald-300 lcd-glow">
                  {stats.topScore} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                </p>
                <div className="mt-1 text-[10px] text-emerald-400">
                  MEILLEUR SPÉCIMEN TROUVÉ
                </div>
              </div>

              {/* Stat 4: Pokédex status */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 shadow-inner">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase">
                  <Sparkles className="size-3.5 text-pink-400" />
                  <span>STATUT POKÉBALL</span>
                </div>
                <p className="mt-1 text-2xl font-black tracking-tight text-pink-300">
                  MASTER BALL
                </p>
                <div className="mt-1 text-[10px] text-pink-400">
                  DONNÉES ENTIÈREMENT SÉCURISÉES
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Dock */}
        <div className="rounded-2xl border-2 border-white/10 bg-[#0d121c] p-2 shadow-xl">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            totalCount={profiles.length}
            filteredCount={filteredProfiles.length}
          />
        </div>

        {/* Profiles Grid or Empty State */}
        {storeLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 font-mono">
            <div className="size-10 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <p className="text-xs tracking-wider text-cyan-300 font-bold uppercase">
              SCAN EN COURS DES ARCHIVES DU BEDDEX...
            </p>
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, idx) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                index={idx + 1}
                onEdit={openEdit}
                onDelete={deleteProfile}
                onTagClick={(tag) => setFilters((prev) => ({ ...prev, tagSearch: tag }))}
              />
            ))}
          </div>
        ) : (
          /* Retro Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border-4 border-black/40 bg-black/60 p-8 py-20 text-center font-mono shadow-2xl backdrop-blur-xl">
            {/* BedDex device icon */}
            <div className="relative mb-4 flex size-24 items-center justify-center">
              <img
                src="/logo.png"
                alt="BedDex"
                className="size-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              {profiles.length === 0
                ? "AUCUN SPÉCIMEN DANS LE POKÉDEX"
                : "AUCUN SPÉCIMEN TROUVÉ DANS CETTE ZONE"}
            </h3>
            <p className="mt-1.5 max-w-md text-xs text-zinc-400 leading-relaxed font-mono">
              {profiles.length === 0
                ? "Ton carnet est encore vide ! Pars à l'aventure et scanne ta première rencontre pour commencer à compléter ton BedDex !"
                : "Aucune fiche ne correspond à tes filtres de recherche. Ajuste la note minimale ou recherche un autre type de capacité."}
            </p>

            {profiles.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 flex items-center gap-2 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-400 to-amber-500 px-5 py-2.5 font-mono text-xs font-black uppercase text-zinc-950 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer hover:brightness-110"
              >
                <Plus className="size-4 stroke-[3]" />
                <span>ENREGISTRER MON PREMIER SPÉCIMEN</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <ProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profile={editingProfile}
        onSave={handleSave}
      />
    </div>
  )
}
