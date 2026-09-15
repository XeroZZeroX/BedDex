"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Profile, ProfileDraft, Criteres } from "@/types/profile"
import { computeNoteGlobale } from "@/types/profile"

// ─── Conversion BDD ↔ TypeScript ─────────────────────────────────────────────

interface DbRow {
  id: string
  user_id: string
  pseudo: string
  genre: string
  date_rencontre: string
  note_globale: number
  criteres: Criteres
  tags: string[]
  commentaires_prives: string
  created_at: string
  updated_at: string
}

function rowToProfile(row: DbRow): Profile {
  return {
    id: row.id,
    pseudo: row.pseudo,
    genre: row.genre as Profile["genre"],
    dateRencontre: row.date_rencontre,
    noteGlobale: row.note_globale,
    criteres: row.criteres,
    tags: row.tags,
    commentairesPrives: row.commentaires_prives,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function draftToRow(draft: ProfileDraft, userId: string) {
  return {
    user_id: userId,
    pseudo: draft.pseudo,
    genre: draft.genre,
    date_rencontre: draft.dateRencontre,
    note_globale: computeNoteGlobale(draft.criteres),
    criteres: draft.criteres,
    tags: draft.tags,
    commentaires_prives: draft.commentairesPrives,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ProfileStore {
  profiles: Profile[]
  loading: boolean
  error: string | null
  addProfile: (draft: ProfileDraft) => Promise<Profile | null>
  updateProfile: (id: string, draft: ProfileDraft) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

export function useProfileStore(userId: string): ProfileStore {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charge les profils depuis Supabase
  useEffect(() => {
    if (!userId) {
      setProfiles([])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          setProfiles((data as DbRow[]).map(rowToProfile))
        }
        setLoading(false)
      })
  }, [userId])

  const addProfile = useCallback(
    async (draft: ProfileDraft): Promise<Profile | null> => {
      if (!userId) return null
      const row = draftToRow(draft, userId)
      const { data, error } = await supabase
        .from("profiles")
        .insert(row)
        .select()
        .single()

      if (error || !data) {
        setError(error?.message ?? "Erreur lors de l'ajout.")
        return null
      }

      const profile = rowToProfile(data as DbRow)
      setProfiles((prev) => [profile, ...prev])
      return profile
    },
    [userId]
  )

  const updateProfile = useCallback(
    async (id: string, draft: ProfileDraft): Promise<void> => {
      if (!userId) return
      const row = draftToRow(draft, userId)
      const { data, error } = await supabase
        .from("profiles")
        .update(row)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error || !data) {
        setError(error?.message ?? "Erreur lors de la mise à jour.")
        return
      }

      const updated = rowToProfile(data as DbRow)
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
    },
    [userId]
  )

  const deleteProfile = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) return
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        setError(error.message)
        return
      }

      setProfiles((prev) => prev.filter((p) => p.id !== id))
    },
    [userId]
  )

  return { profiles, loading, error, addProfile, updateProfile, deleteProfile }
}
