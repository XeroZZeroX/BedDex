"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProfileForm } from "@/components/beddex/ProfileForm"
import type { Profile, ProfileDraft } from "@/types/profile"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: Profile
  onSave: (draft: ProfileDraft) => Promise<void> | void
}

export function ProfileModal({ open, onOpenChange, profile, onSave }: ProfileModalProps) {
  async function handleSave(draft: ProfileDraft) {
    await onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92dvh] w-full max-w-xl overflow-hidden flex flex-col rounded-3xl border-4 border-[#5c0d12] bg-gradient-to-b from-[#a81919] via-[#8c1313] to-[#5e0c0c] p-0 text-zinc-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_-15px_rgba(220,38,38,0.5)] sm:max-w-xl font-mono"
        showCloseButton
      >
        {/* Pokédex Modal Top Cartridge */}
        <DialogHeader className="p-4 pb-3 border-b-4 border-[#5c0d12] bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#991b1b] shrink-0 text-white shadow-md">
          <div className="flex items-center gap-3">
            {/* BedDex Device Logo */}
            <img
              src="/logo.png"
              alt="BedDex"
              className="size-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
            />

            {/* 3 mini LEDs */}
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-red-950 bg-red-400 shadow-[0_0_6px_#ef4444]" />
              <span className="size-2 rounded-full border border-yellow-950 bg-yellow-400 shadow-[0_0_6px_#eab308]" />
              <span className="size-2 rounded-full border border-emerald-950 bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            </div>

            <DialogTitle className="text-sm font-black tracking-widest text-white uppercase drop-shadow">
              {profile ? `MODIFICATION : ${profile.pseudo}` : "SCAN D'UN NOUVEAU SPÉCIMEN"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable body with Pokédex red background */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gradient-to-b from-[#9e1616] via-[#821111] to-[#590b0b]">
          <ProfileForm
            key={profile?.id ?? "new"}
            initialData={profile}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
