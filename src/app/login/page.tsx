"use client"

import { useState } from "react"
import { User, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function validateUsername(v: string) {
  const trimmed = v.trim()
  if (!trimmed) return "L'identifiant de dresseur est requis."
  if (trimmed.length < 3) return "Minimum 3 caractères."
  if (trimmed.length > 25) return "Maximum 25 caractères."
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return "Caractères autorisés : lettres, chiffres, . _ -"
  }
}

export default function LoginPage() {
  const { signInOrCreate } = useAuth()

  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setLoading(true)

    try {
      const { error } = await signInOrCreate(username)
      if (error) {
        setError(error.message)
      } else {
        window.location.href = "/"
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#070406] p-4 text-zinc-100 overflow-hidden font-mono selection:bg-red-500/30 selection:text-red-200">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-red-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-80 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Pokédex Outer Red Hardware Casing */}
        <div className="rounded-3xl border-4 border-[#7f1d1d] bg-gradient-to-b from-[#b91c1c] via-[#dc2626] to-[#991b1b] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(220,38,38,0.3)]">
          {/* Pokédex Sensor Bar */}
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <div className="flex items-center gap-2.5">
              {/* BedDex Device Icon */}
              <img
                src="/logo.png"
                alt="BedDex"
                className="size-11 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              />

              {/* 3 LEDs */}
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border border-red-950 bg-red-400 shadow-[0_0_8px_#ef4444]" />
                <span className="size-2.5 rounded-full border border-yellow-950 bg-yellow-400 shadow-[0_0_8px_#eab308]" />
                <span className="size-2.5 rounded-full border border-emerald-950 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              </div>
            </div>
          </div>

          {/* Internal Screen Panel (CRT look) */}
          <div className="rounded-2xl border-4 border-zinc-950 bg-[#070b12] p-5 shadow-inner scanlines">
            <div className="mb-4 text-center border-b border-white/10 pb-3">
              <h1 className="text-base font-black tracking-widest text-cyan-300 uppercase lcd-glow">
                ACCÈS AU BEDDEX
              </h1>
              <p className="mt-0.5 text-[10px] text-zinc-400 uppercase font-bold">
                ENTRE TON PSEUDO DE DRESSEUR
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="username" className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
                  PSEUDO DE DRESSEUR
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-cyan-400" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError("")
                    }}
                    placeholder="ex : Sacha, Antho..."
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/80 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-400 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 font-bold">
                  {error}
                </div>
              )}

              {/* Submit Pokédex Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-400 to-amber-500 font-mono text-xs font-black uppercase text-zinc-950 shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <span>OUVRIR LE BEDDEX</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Hardware Footer */}
        <p className="mt-4 text-center text-[10px] text-zinc-600 font-mono font-bold tracking-widest uppercase">
          SÉRIE BEDDEX · ARCHIVES NATIONALES CONFIDENTIELLES
        </p>
      </div>
    </div>
  )
}
