"use client"

import { useState, useCallback } from "react"
import { X, Sparkles, Lock, Calendar, User as UserIcon, Zap, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { Profile, ProfileDraft, Genre, Criteres } from "@/types/profile"
import {
  CRITERE_LABELS,
  TAGS_SUGGESTIONS,
  computeNoteGlobale,
} from "@/types/profile"

interface ProfileFormProps {
  initialData?: Profile
  onSave: (draft: ProfileDraft) => void
  onCancel: () => void
}

const DEFAULT_CRITERES: Criteres = {
  communication: 7,
  alchimie: 7,
  hygiene: 8,
  presence: 7,
  relance: 6,
}

interface FormErrors {
  pseudo?: string
  dateRencontre?: string
}

function validate(pseudo: string, dateRencontre: string): FormErrors {
  const errors: FormErrors = {}
  const trimmed = pseudo.trim()
  if (!trimmed) {
    errors.pseudo = "L'identifiant est requis."
  } else if (trimmed.length < 2 || trimmed.length > 25) {
    errors.pseudo = "Entre 2 et 25 caractères."
  }
  if (!dateRencontre) {
    errors.dateRencontre = "La date est requise."
  } else {
    const d = new Date(dateRencontre)
    if (isNaN(d.getTime()) || d > new Date()) {
      errors.dateRencontre = "Date invalide ou dans le futur."
    }
  }
  return errors
}

function getPokedexAppraisal(score: number): { title: string; desc: string; color: string } {
  if (score >= 9.0)
    return {
      title: "RANG S (LÉGENDAIRE) 🔥",
      desc: "« Ce spécimen possède un potentiel hors du commun ! Alchimie maximale. »",
      color: "text-amber-300",
    }
  if (score >= 7.5)
    return {
      title: "RANG A (TRÈS RARE) ✨",
      desc: "« Une rencontre remarquable avec d'excellentes statistiques de base. »",
      color: "text-emerald-300",
    }
  if (score >= 6.0)
    return {
      title: "RANG B (NOTABLE) 👍",
      desc: "« Spécimen prometteur, bon feeling général et affinités positives. »",
      color: "text-cyan-300",
    }
  if (score >= 4.5)
    return {
      title: "RANG C (COMMUN) 🤔",
      desc: "« Statistiques moyennes, peu d'étincelles constatées lors du contact. »",
      color: "text-orange-300",
    }
  return {
    title: "RANG D (DÉCEVANT) 🛑",
    desc: "« Énergie incompatible. Mieux vaut le relâcher dans la nature. »",
    color: "text-rose-300",
  }
}

export function ProfileForm({ initialData, onSave, onCancel }: ProfileFormProps) {
  const [pseudo, setPseudo] = useState(initialData?.pseudo ?? "")
  const [genre, setGenre] = useState<Genre>(initialData?.genre ?? "F")
  const [dateRencontre, setDateRencontre] = useState(
    initialData?.dateRencontre ?? new Date().toISOString().split("T")[0]
  )
  const [criteres, setCriteres] = useState<Criteres>(
    initialData?.criteres ?? DEFAULT_CRITERES
  )
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState("")
  const [commentairesPrives, setCommentairesPrives] = useState(
    initialData?.commentairesPrives ?? ""
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const noteGlobale = computeNoteGlobale(criteres)
  const appraisal = getPokedexAppraisal(noteGlobale)

  const setCritere = useCallback((key: keyof Criteres, val: number) => {
    setCriteres((prev) => ({ ...prev, [key]: val }))
  }, [])

  function toggleTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, "-")
    if (tags.includes(clean)) {
      setTags((prev) => prev.filter((t) => t !== clean))
    } else if (tags.length < 8) {
      setTags((prev) => [...prev, clean])
    }
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (tagInput.trim()) {
        toggleTag(tagInput)
        setTagInput("")
      }
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(pseudo, dateRencontre)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSave({
      pseudo: pseudo.trim(),
      genre,
      dateRencontre,
      criteres,
      tags,
      commentairesPrives: commentairesPrives.trim(),
    })
  }

  const critereKeys: Array<keyof Criteres> = [
    "alchimie",
    "communication",
    "hygiene",
    "presence",
    "relance",
  ]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 font-mono">
      {/* Live Pokédex CRT Analysis Screen */}
      <div className="relative rounded-2xl border-2 border-cyan-500/40 bg-[#070d17] p-4 shadow-2xl scanlines overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-[10px] uppercase font-bold text-cyan-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ÉVALUATION DU PROFESSEUR CHEN</span>
          </span>
          <span className={appraisal.color}>{appraisal.title}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-cyan-200/90 italic font-mono max-w-xs leading-relaxed">
            {appraisal.desc}
          </p>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-white lcd-glow">
                {noteGlobale.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-500">/ 10</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              NOTE GLOBALE
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Pseudo, Type, Date */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Pseudo */}
        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <label htmlFor="pseudo" className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
            NOM DE CODE DU SPÉCIMEN
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-cyan-400" />
            <input
              id="pseudo"
              value={pseudo}
              onChange={(e) => {
                setPseudo(e.target.value)
                if (submitted) setErrors((p) => ({ ...p, pseudo: undefined }))
              }}
              placeholder="ex : S.K."
              maxLength={25}
              className="h-10 w-full rounded-xl border-2 border-black/60 bg-black/75 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-cyan-400 uppercase font-mono shadow-inner"
            />
          </div>
          {errors.pseudo && (
            <p className="text-[11px] text-yellow-300 font-bold bg-black/60 px-2 py-0.5 rounded">{errors.pseudo}</p>
          )}
        </div>

        {/* Type / Genre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
            TYPE DE SPÉCIMEN
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-xl border-2 border-black/60 bg-black/75 p-1 shadow-inner">
            {(["F", "H"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={cn(
                  "rounded-lg py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer",
                  genre === g
                    ? g === "F"
                      ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                      : "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {g === "F" ? "♀ FEMME" : "♂ HOMME"}
              </button>
            ))}
          </div>
        </div>

        {/* Date de capture */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateRencontre" className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
            DATE DE CAPTURE
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-cyan-400 pointer-events-none" />
            <input
              id="dateRencontre"
              type="date"
              value={dateRencontre}
              onChange={(e) => {
                setDateRencontre(e.target.value)
                if (submitted) setErrors((p) => ({ ...p, dateRencontre: undefined }))
              }}
              className="h-10 w-full rounded-xl border-2 border-black/60 bg-black/75 pl-9 pr-3 text-xs text-white outline-none transition-colors focus:border-cyan-400 [color-scheme:dark] cursor-pointer shadow-inner"
            />
          </div>
          {errors.dateRencontre && (
            <p className="text-[11px] text-yellow-300 font-bold bg-black/60 px-2 py-0.5 rounded">{errors.dateRencontre}</p>
          )}
        </div>
      </div>

      {/* Combat Criteria ratings */}
      <div className="space-y-3.5 rounded-2xl border-2 border-black/60 bg-black/70 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-400" />
            <span>STATISTIQUES DE BASE DU SPÉCIMEN (1-10)</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold">RÉPARTITION IV</span>
        </div>

        <div className="space-y-3 pt-1">
          {critereKeys.map((key) => {
            const val = criteres[key]
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider text-[11px]">
                    {CRITERE_LABELS[key]}
                  </span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {val} <span className="text-zinc-600 font-normal">/ 10</span>
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={val}
                  onValueChange={(newVal) => setCritere(key, newVal as number)}
                  aria-label={CRITERE_LABELS[key]}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Tags chips (Capacités & Natures) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
          CAPACITÉS & NATURES DU SPÉCIMEN <span className="text-zinc-400 font-normal">({tags.length}/8)</span>
        </label>
        {/* Selected tags */}
        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border-2 border-black/60 bg-black/75 p-2 shadow-inner">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/40 bg-cyan-950/60 px-2 py-0.5 text-xs text-cyan-300 font-bold uppercase"
            >
              #{tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="hover:text-white cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? "Ajouter une capacité personnalisée..." : ""}
            className="flex-1 min-w-28 bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none uppercase font-mono"
          />
        </div>

        {/* Suggested tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TAGS_SUGGESTIONS.map((tag) => {
            const isSelected = tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-lg border px-2 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer",
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/30 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    : "border-black/50 bg-black/50 text-zinc-300 hover:border-white/30 hover:text-white"
                )}
              >
                {isSelected ? "✓" : "+"} #{tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pokédex Description Screen */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="notes" className="flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-sm">
            <Lock className="size-3 text-emerald-400" />
            DESCRIPTION & RAPPORT DU POKÉDEX (SECRET)
          </label>
          <span className="text-[10px] font-mono text-zinc-400">
            {commentairesPrives.length}/500
          </span>
        </div>
        <textarea
          id="notes"
          rows={3}
          value={commentairesPrives}
          onChange={(e) => setCommentairesPrives(e.target.value)}
          maxLength={500}
          placeholder="Comportement du spécimen, observations de terrain, niveau de dangerosité..."
          className="w-full resize-none rounded-xl border-2 border-emerald-500/40 bg-black/80 p-3 text-xs leading-relaxed text-emerald-300 placeholder:text-emerald-700/60 outline-none transition-colors focus:border-emerald-400 font-mono italic shadow-inner"
        />
      </div>

      {/* Action Hardware Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-black/40">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border-2 border-black/60 bg-black/50 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-black/70 transition-colors cursor-pointer uppercase shadow"
        >
          ANNULER LE SCAN
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-400 to-amber-500 px-5 py-2 font-mono text-xs font-black uppercase text-zinc-950 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer hover:brightness-110"
        >
          <Sparkles className="size-4" />
          <span>{initialData ? "METTRE À JOUR LE SPÉCIMEN" : "ENREGISTRER DANS LE POKÉDEX"}</span>
        </button>
      </div>
    </form>
  )
}
