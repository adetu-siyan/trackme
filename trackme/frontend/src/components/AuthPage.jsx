import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('mentee')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Access request state
  const [signupOpen, setSignupOpen] = useState(true)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [accessForm, setAccessForm] = useState({ full_name: '', email: '', reason: '' })
  const [accessSent, setAccessSent] = useState(false)
  const [sendingAccess, setSendingAccess] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/user-count`)
      .then(r => r.json())
      .then(data => setSignupOpen(data.open))
      .catch(() => setSignupOpen(true))
      .finally(() => setCheckingLimit(false))
  }, [])

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setError('')
  }

  const updateAccess = (field) => (e) =>
    setAccessForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'signup' && !signupOpen) return
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
      } else {
        if (!form.fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        await signUp(form.email, form.password, form.fullName, role)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccessRequest(e) {
    e.preventDefault()
    if (!accessForm.full_name || !accessForm.email) return
    setSendingAccess(true)
    try {
      await fetch(`${BASE}/api/access-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      })
      setAccessSent(true)
    } catch {
      setAccessSent(true) // Still show success, DB might have saved it
    } finally {
      setSendingAccess(false)
    }
  }

  // Access request form
  if (showAccessForm) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
            Trackm<span style={{ color: 'var(--accent)' }}>e</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            S / Y A N
          </div>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 420,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {accessSent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ marginBottom: 10 }}>Request sent!</h2>
              <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
                The admin has been notified. You'll hear back soon.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => { setShowAccessForm(false); setMode('login') }}
                style={{ marginTop: 24 }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: 6 }}>Request Access</h2>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Trackme is currently in private beta. Tell the admin who you are and we'll get back to you.
              </p>
              <form onSubmit={handleAccessRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input className="input" value={accessForm.full_name} onChange={updateAccess('full_name')} placeholder="Your name" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input className="input" type="email" value={accessForm.email} onChange={updateAccess('email')} placeholder="you@email.com" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Why do you want access?
                  </label>
                  <textarea className="input" value={accessForm.reason} onChange={updateAccess('reason')} placeholder="Tell us a bit about yourself..." style={{ minHeight: 80 }} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={sendingAccess} style={{ justifyContent: 'center' }}>
                  {sendingAccess ? 'Sending...' : 'Send Request →'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAccessForm(false)}>
                  ← Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      animation: 'fadeIn 0.4s ease',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
          Trackm<span style={{ color: 'var(--accent)' }}>e</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
          S / Y A N
        </div>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--surface-2)',
          borderRadius: 10, padding: 3, marginBottom: 28, gap: 3,
        }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Signup closed banner */}
        {mode === 'signup' && !checkingLimit && !signupOpen && (
          <div style={{
            background: 'var(--warning-soft)', border: '1px solid var(--warning)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--warning)', marginBottom: 4 }}>
              🔒 Trackme is in private beta
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
              We're not accepting new accounts right now. You can request access and the admin will review it.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAccessForm(true)}
            >
              Request Access →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input className="input" type="text" placeholder="Dolapo Adewale" value={form.fullName} onChange={update('fullName')} required />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input" type="password"
              placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
              value={form.password} onChange={update('password')}
              required minLength={mode === 'signup' ? 8 : 1}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                I am a...
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'mentee', label: '📚 Mentee', desc: 'I want to be tracked' },
                  { value: 'mentor', label: '🎯 Mentor', desc: 'I track others' },
                ].map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 10,
                      border: `2px solid ${role === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: role === opt.value ? 'var(--accent-soft)' : 'var(--surface-2)',
                      cursor: 'pointer', fontFamily: 'Urbanist, sans-serif', transition: 'all 0.18s',
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{opt.label.split(' ')[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === opt.value ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {opt.label.split(' ')[1]}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'var(--danger-soft)', color: 'var(--danger)',
              padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading || (mode === 'signup' && !signupOpen)}
            style={{ marginTop: 4, justifyContent: 'center' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>
      </div>

      <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700 }}>
        S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
      </div>
    </div>
  )
}