import { createClient, type Session } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_NOT_CONFIGURED, SUPABASE_URL, SHARED_LOGIN_EMAIL } from './supabaseConfig'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // giữ đăng nhập giữa các lần mở app trên cùng máy
    autoRefreshToken: true,
  },
})

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Đăng nhập bằng mật khẩu chung — người dùng chỉ gõ mật khẩu, email cố định. */
export async function signInShared(password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: SHARED_LOGIN_EMAIL,
    password,
  })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export { SUPABASE_NOT_CONFIGURED }
