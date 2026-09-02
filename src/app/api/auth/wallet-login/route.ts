import { NextRequest, NextResponse } from 'next/server'
import { recoverMessageAddress } from 'viem'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { AUTH_MESSAGE } from '@/lib/auth-message'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, message } = body

    if (!address || !signature) {
      return NextResponse.json({ error: 'Missing address or signature' }, { status: 400 })
    }

    if (message && message !== AUTH_MESSAGE) {
      return NextResponse.json({ error: 'Unexpected sign-in message' }, { status: 400 })
    }

    const normalized = (address as string).toLowerCase()
    if (!/^0x[0-9a-f]{40}$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // Recover the signer from the signature. If it doesn't match the claimed
    // address, the user doesn't control this wallet. Pure offline recovery —
    // no RPC or gas needed.
    const signer = await recoverMessageAddress({
      message: message || AUTH_MESSAGE,
      signature: signature as `0x${string}`,
    })

    if (signer.toLowerCase() !== normalized) {
      return NextResponse.json({ error: 'Signature does not match this wallet address' }, { status: 401 })
    }

    // Map the wallet to a deterministic "invisible" Supabase account so the
    // rest of the app (sources, sessions, RLS) keeps working unchanged. The
    // password is derived from a server secret — never exposed to the client.
    const serverSecret = process.env.AUTH_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serverSecret) {
      return NextResponse.json({ error: 'Server is missing AUTH_SESSION_SECRET' }, { status: 500 })
    }

    const supabase = await createClient()
    const email = `${normalized}@thothpay.local`
    const password = crypto.createHash('sha256').update(normalized + serverSecret).digest('hex')

    let userId: string | null = null

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        console.error('Invisible Supabase SignUp Error:', signUpError)
        return NextResponse.json({ error: 'Failed to create internal user session' }, { status: 500 })
      }
      userId = signUpData.user?.id ?? null
    } else {
      userId = signInData.user?.id ?? null
    }

    if (userId) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const adminAuth = createAdminClient()

      const { error: profileError } = await adminAuth
        .from('profiles')
        .update({ wallet_address: normalized })
        .eq('id', userId)
      if (profileError) console.error('Admin Profile Update Error:', profileError)

      const { data: existingCreator } = await adminAuth
        .from('creator_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingCreator) {
        const { error: creatorError } = await adminAuth
          .from('creator_profiles')
          .insert({ user_id: userId })
          .select()
          .single()
        if (creatorError) console.error('Creator Profile Init Error:', creatorError)
      }
    }

    return NextResponse.json({ success: true, walletAddress: normalized })
  } catch (error: any) {
    console.error('Wallet Login Error:', error)
    return NextResponse.json({ error: 'Failed to execute wallet login' }, { status: 500 })
  }
}
