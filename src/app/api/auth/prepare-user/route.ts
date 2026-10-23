import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const FIXED_PASSWORD = "beddex_trainer_access"

function toEmail(username: string): string {
  const clean = username.trim().toLowerCase()
  return clean.includes("@") ? clean : `${clean}@beddex.internal`
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json()
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuration serveur manquante (Supabase service role)" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const email = toEmail(username)

    // Lister les utilisateurs pour retrouver le compte existant sans perdre ses données
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const existingUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      // Synchronise le mot de passe pour la connexion directe sans supprimer le compte
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: FIXED_PASSWORD,
          email_confirm: true,
        }
      )
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    } else {
      // Crée le nouvel utilisateur
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: FIXED_PASSWORD,
        email_confirm: true,
      })
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, email })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
