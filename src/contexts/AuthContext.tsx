import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchUserProfile, updateUserFirstLogin } from '../services/database'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      const email = data.session?.user.email
      if (email) {
        const profile = await fetchUserProfile(email)
        if (mounted) setUser(profile)
      }
      if (mounted) setIsLoading(false)
    }

    void loadSession()

    const subscription = supabase?.auth.onAuthStateChange(async (_, session) => {
      const email = session?.user.email
      const profile = email ? await fetchUserProfile(email) : null
      if (mounted) setUser(profile)
    })

    return () => {
      mounted = false
      subscription?.data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    async login(email, password, remember) {
      if (!supabase || !isSupabaseConfigured) {
        throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.')
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const profile = await fetchUserProfile(data.user.email ?? email)
      if (!profile) throw new Error('Profil user belum ada di tabel users.')
      setUser(profile)
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('umara_token', data.session.access_token)
      return profile
    },
    async logout() {
      await supabase?.auth.signOut()
      localStorage.removeItem('umara_token')
      setUser(null)
    },
    async changePassword(password) {
      if (!user) return
      if (!supabase) {
        throw new Error('Supabase belum dikonfigurasi.')
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      await updateUserFirstLogin(user.id)
      const changedAt = new Date().toISOString()
      const nextUser = { ...user, is_first_login: false, password_changed_at: changedAt, updated_at: changedAt }
      setUser(nextUser)
    },
    async sendPasswordReset(email) {
      if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    },
  }), [isLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
