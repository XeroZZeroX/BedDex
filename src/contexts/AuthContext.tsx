"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

const FIXED_PASSWORD = "beddex_trainer_access"

function toEmail(username: string): string {
  const clean = username.trim().toLowerCase()
  return clean.includes("@") ? clean : `${clean}@beddex.internal`
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInOrCreate: (username: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupère la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (typeof document !== "undefined") {
        if (session?.access_token) {
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      }
      setLoading(false)
    })

    // Écoute les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (typeof document !== "undefined") {
          if (session?.access_token) {
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          } else {
            document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInOrCreate = useCallback(async (username: string) => {
    try {
      // 1. Appelle l'API serveur pour créer ou synchroniser le compte sans supprimer de données
      const res = await fetch("/api/auth/prepare-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        return { error: { message: data.error || "Erreur lors de la préparation du profil." } }
      }

      // 2. Connexion standard via Supabase
      const email = data.email || toEmail(username)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: FIXED_PASSWORD,
      })

      if (signInError) {
        return { error: { message: signInError.message } }
      }

      if (signInData?.session?.access_token && typeof document !== "undefined") {
        document.cookie = `sb-access-token=${signInData.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }

      return { error: null }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Impossible de contacter le serveur d'authentification."
      return { error: { message } }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (typeof document !== "undefined") {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    }
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signInOrCreate, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
