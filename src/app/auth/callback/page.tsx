"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        // Récupère les paramètres de l'URL
        const url = new URL(window.location.href)
        const tokenHash = url.searchParams.get("token_hash")
        const type = url.searchParams.get("type") as "email" | "recovery" | null
        const code = url.searchParams.get("code")

        if (tokenHash && type) {
          // Nouveau format Supabase (token_hash)
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
          if (error) {
            setStatus("error")
            setMessage(error.message)
            return
          }
        } else if (code) {
          // Format OAuth / PKCE
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setStatus("error")
            setMessage(error.message)
            return
          }
        } else {
          // Ancien format : hash fragment (#access_token=...)
          // supabase-js le détecte automatiquement via onAuthStateChange
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            // Attendre que onAuthStateChange le traite
            await new Promise<void>((resolve) => {
              const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === "SIGNED_IN" && session) {
                  subscription.unsubscribe()
                  resolve()
                }
              })
              // Timeout après 5s
              setTimeout(resolve, 5000)
            })
          }
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token && typeof document !== "undefined") {
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }

        setStatus("success")
        setMessage("Compte confirmé ! Redirection…")
        setTimeout(() => router.replace("/"), 1000)
      } catch {
        setStatus("error")
        setMessage("Lien invalide ou expiré.")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="size-8 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-400">Vérification en cours…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="size-8 text-emerald-400" />
            <p className="text-sm text-emerald-300">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="size-8 text-red-400" />
            <p className="text-sm text-red-300">{message}</p>
            <button
              onClick={() => router.replace("/login")}
              className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-300"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  )
}

