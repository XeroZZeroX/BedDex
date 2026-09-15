export type Genre = "H" | "F"

export interface Criteres {
  communication: number  // 1–10
  alchimie: number       // 1–10
  hygiene: number        // 1–10
  presence: number       // 1–10
  relance: number        // 1–10
}

export const CRITERE_LABELS: Record<keyof Criteres, string> = {
  communication: "Communication",
  alchimie: "Alchimie",
  hygiene: "Hygiène",
  presence: "Présence",
  relance: "Relance",
}

export const GENRE_LABELS: Record<Genre, string> = {
  H: "Homme",
  F: "Femme",
}

export const TAGS_SUGGESTIONS = [
  "fun",
  "intense",
  "chill",
  "répétitif",
  "spontané",
  "romantique",
  "discret",
  "curieux",
  "direct",
  "timide",
  "aventurier",
  "doux",
  "passionné",
  "drôle",
  "mystérieux",
]

export interface Profile {
  id: string
  pseudo: string           // initiales ou pseudo anonyme
  genre: Genre
  dateRencontre: string    // ISO date string YYYY-MM-DD
  noteGlobale: number      // 1–10, calculée automatiquement
  criteres: Criteres
  tags: string[]
  commentairesPrives: string
  createdAt: string        // ISO timestamp
  updatedAt: string        // ISO timestamp
}

export type ProfileDraft = Omit<Profile, "id" | "noteGlobale" | "createdAt" | "updatedAt">

export function computeNoteGlobale(criteres: Criteres): number {
  const weights: Record<keyof Criteres, number> = {
    alchimie: 3,
    communication: 2,
    hygiene: 2,
    presence: 2,
    relance: 1,
  }
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const weighted = (Object.keys(criteres) as Array<keyof Criteres>).reduce(
    (sum, key) => sum + criteres[key] * weights[key],
    0
  )
  return Math.round((weighted / totalWeight) * 10) / 10
}

export function noteColor(note: number): string {
  if (note >= 8) return "text-emerald-400"
  if (note >= 6) return "text-yellow-400"
  if (note >= 4) return "text-orange-400"
  return "text-red-400"
}

export function noteBgColor(note: number): string {
  if (note >= 8) return "bg-emerald-400/15 border-emerald-400/30"
  if (note >= 6) return "bg-yellow-400/15 border-yellow-400/30"
  if (note >= 4) return "bg-orange-400/15 border-orange-400/30"
  return "bg-red-400/15 border-red-400/30"
}

