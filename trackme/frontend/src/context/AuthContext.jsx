import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()
const PREMIUM_EMAIL = 'adetumosgad@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch (e) {
      console.error('Failed to fetch profile', e)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } }
  })
  if (error) throw error

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role,
      email: email.toLowerCase(),
    })

    // Send welcome email
    try {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          full_name: fullName,
          role,
        }),
      })
    } catch (e) {
      console.error('Welcome email failed:', e)
      // Don't throw — signup already succeeded
    }
  }

  return data
}

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Ensure email is always in profile (catches old accounts)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.toLowerCase(),
      })
    }

    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  const isPremium = user?.email?.toLowerCase() === PREMIUM_EMAIL
  const isMentor = isPremium || profile?.role === 'mentor'
  const isMentee = isPremium || profile?.role === 'mentee'

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isMentor, isMentee, isPremium,
      signUp, signIn, signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)