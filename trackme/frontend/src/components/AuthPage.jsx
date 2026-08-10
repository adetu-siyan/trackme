

// import { useState, useEffect } from 'react'
// import { useAuth } from '../context/AuthContext'

// const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
// const PROD_URL = 'https://doti-alpha.vercel.app'

// export default function AuthPage() {
//   const { signIn, signUp } = useAuth()
//   const [mode, setMode] = useState('login')
//   const [role, setRole] = useState('mentee')
//   const [form, setForm] = useState({ email: '', password: '', fullName: '' })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [confirmationSent, setConfirmationSent] = useState(false)
//   const [pendingEmail, setPendingEmail] = useState('')

//   // Access request state
//   const [signupOpen, setSignupOpen] = useState(true)
//   const [checkingLimit, setCheckingLimit] = useState(true)
//   const [showAccessForm, setShowAccessForm] = useState(false)
//   const [accessForm, setAccessForm] = useState({ full_name: '', email: '', reason: '' })
//   const [accessSent, setAccessSent] = useState(false)
//   const [sendingAccess, setSendingAccess] = useState(false)

//   useEffect(() => {
//     fetch(`${BASE}/api/user-count`)
//       .then(r => r.json())
//       .then(data => setSignupOpen(data.open))
//       .catch(() => setSignupOpen(true))
//       .finally(() => setCheckingLimit(false))
//   }, [])

//   const update = (field) => (e) => {
//     setForm(f => ({ ...f, [field]: e.target.value }))
//     setError('')
//   }

//   const updateAccess = (field) => (e) =>
//     setAccessForm(f => ({ ...f, [field]: e.target.value }))

//   async function handleSubmit(e) {
//     e.preventDefault()
//     if (mode === 'signup' && !signupOpen) return
//     setLoading(true)
//     setError('')

//     try {
//       if (mode === 'login') {
//         await signIn(form.email, form.password)
//       } else {
//         if (!form.fullName.trim()) {
//           setError('Please enter your full name')
//           setLoading(false)
//           return
//         }

//         // Pass emailRedirectTo so Supabase confirmation link goes to production
//         await signUp(form.email, form.password, form.fullName, role, {
//           emailRedirectTo: PROD_URL,
//         })

//         // Do NOT fire welcome email here — it fires from the backend
//         // after Supabase confirms the user (via webhook or sign-in trigger)
//         setPendingEmail(form.email)
//         setConfirmationSent(true)
//       }
//     } catch (err) {
//       setError(err.message || 'Something went wrong')
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleAccessRequest(e) {
//     e.preventDefault()
//     if (!accessForm.full_name || !accessForm.email) return
//     setSendingAccess(true)
//     try {
//       await fetch(`${BASE}/api/access-request`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(accessForm),
//       })
//       setAccessSent(true)
//     } catch {
//       setAccessSent(true)
//     } finally {
//       setSendingAccess(false)
//     }
//   }

//   // ── Confirmation sent screen ──────────────────────────────────────────────
//   if (confirmationSent) {
//     return (
//       <div style={{
//         minHeight: '100vh', background: 'var(--bg)',
//         display: 'flex', flexDirection: 'column',
//         alignItems: 'center', justifyContent: 'center', padding: '20px',
//         animation: 'fadeIn 0.4s ease',
//       }}>
//         <style>{`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(12px); }
//             to   { opacity: 1; transform: translateY(0); }
//           }
//           @keyframes pulse {
//             0%, 100% { transform: scale(1); }
//             50% { transform: scale(1.08); }
//           }
//         `}</style>

//         <div style={{ marginBottom: 32, textAlign: 'center' }}>
//           <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
//             Trackm<span style={{ color: 'var(--accent)' }}>e</span>
//           </div>
//           <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
//             S / Y A N
//           </div>
//         </div>

//         <div style={{
//           background: 'var(--surface)', border: '1px solid var(--border)',
//           borderRadius: 20, padding: '40px', width: '100%', maxWidth: 420,
//           boxShadow: 'var(--shadow-lg)', textAlign: 'center',
//         }}>
//           <div style={{
//             fontSize: 56, marginBottom: 20,
//             animation: 'pulse 2s ease-in-out infinite',
//             display: 'inline-block',
//           }}>
//             📬
//           </div>

//           <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
//             Check your inbox
//           </h2>

//           <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
//             We sent a confirmation link to
//           </p>
//           <p style={{
//             fontWeight: 700, fontSize: 15, color: 'var(--accent)',
//             marginBottom: 24, wordBreak: 'break-all',
//           }}>
//             {pendingEmail}
//           </p>

//           <div style={{
//             background: 'var(--surface-2)', borderRadius: 12,
//             padding: '16px 20px', marginBottom: 28, textAlign: 'left',
//           }}>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
//               1. Open the email from <strong>Trackme / Dôti</strong><br />
//               2. Click <strong>"Confirm your email"</strong><br />
//               3. You'll be redirected back and logged in automatically
//             </p>
//           </div>

//           <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
//             Didn't get it? Check your spam folder. The link expires in 24 hours.
//           </p>

//           <button
//             className="btn btn-ghost btn-sm"
//             onClick={() => {
//               setConfirmationSent(false)
//               setForm({ email: '', password: '', fullName: '' })
//               setMode('login')
//             }}
//           >
//             ← Back to Sign In
//           </button>
//         </div>

//         <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700 }}>
//           S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
//         </div>
//       </div>
//     )
//   }

//   // ── Access request form ───────────────────────────────────────────────────
//   if (showAccessForm) {
//     return (
//       <div style={{
//         minHeight: '100vh', background: 'var(--bg)',
//         display: 'flex', flexDirection: 'column',
//         alignItems: 'center', justifyContent: 'center', padding: '20px',
//       }}>
//         <div style={{ marginBottom: 32, textAlign: 'center' }}>
//           <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
//             Trackm<span style={{ color: 'var(--accent)' }}>e</span>
//           </div>
//           <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
//             S / Y A N
//           </div>
//         </div>

//         <div style={{
//           background: 'var(--surface)', border: '1px solid var(--border)',
//           borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 420,
//           boxShadow: 'var(--shadow-lg)',
//         }}>
//           {accessSent ? (
//             <div style={{ textAlign: 'center', padding: '20px 0' }}>
//               <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
//               <h2 style={{ marginBottom: 10 }}>Request sent!</h2>
//               <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
//                 The admin has been notified. You'll hear back soon.
//               </p>
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => { setShowAccessForm(false); setMode('login') }}
//                 style={{ marginTop: 24 }}
//               >
//                 Back to Login
//               </button>
//             </div>
//           ) : (
//             <>
//               <h2 style={{ marginBottom: 6 }}>Request Access</h2>
//               <p className="text-muted" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
//                 Dôti is currently in private beta. Tell the admin who you are and we'll get back to you.
//               </p>
//               <form onSubmit={handleAccessRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 <div>
//                   <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                     Full Name
//                   </label>
//                   <input className="input" value={accessForm.full_name} onChange={updateAccess('full_name')} placeholder="Your full name" required />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                     Email Address
//                   </label>
//                   <input className="input" type="email" value={accessForm.email} onChange={updateAccess('email')} placeholder="youremail@gmail.com" required />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                     Why do you want access?
//                   </label>
//                   <textarea className="input" value={accessForm.reason} onChange={updateAccess('reason')} placeholder="Tell us a bit about yourself..." style={{ minHeight: 80 }} />
//                 </div>
//                 <button className="btn btn-primary" type="submit" disabled={sendingAccess} style={{ justifyContent: 'center' }}>
//                   {sendingAccess ? 'Sending...' : 'Send Request →'}
//                 </button>
//                 <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAccessForm(false)}>
//                   ← Back to Login
//                 </button>
//               </form>
//             </>
//           )}
//         </div>
//       </div>
//     )
//   }

//   // ── Main auth form ────────────────────────────────────────────────────────
//   return (
//     <div style={{
//       minHeight: '100vh', background: 'var(--bg)',
//       display: 'flex', flexDirection: 'column',
//       alignItems: 'center', justifyContent: 'center', padding: '20px',
//       animation: 'fadeIn 0.4s ease',
//     }}>
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(12px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>

//       <div style={{ marginBottom: 36, textAlign: 'center' }}>
//         <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
//           Trackm<span style={{ color: 'var(--accent)' }}>e</span>
//         </div>
//         <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
//           S / Y A N
//         </div>
//       </div>

//       <div style={{
//         background: 'var(--surface)', border: '1px solid var(--border)',
//         borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 420,
//         boxShadow: 'var(--shadow-lg)',
//       }}>
//         {/* Tab switcher */}
//         <div style={{
//           display: 'flex', background: 'var(--surface-2)',
//           borderRadius: 10, padding: 3, marginBottom: 28, gap: 3,
//         }}>
//           {['login', 'signup'].map(m => (
//             <button
//               key={m}
//               onClick={() => { setMode(m); setError('') }}
//               style={{
//                 flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
//                 cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//                 fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
//                 background: mode === m ? 'var(--surface)' : 'transparent',
//                 color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
//                 boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
//               }}
//             >
//               {m === 'login' ? 'Sign In' : 'Create Account'}
//             </button>
//           ))}
//         </div>

//         {/* Signup closed banner */}
//         {mode === 'signup' && !checkingLimit && !signupOpen && (
//           <div style={{
//             background: 'var(--warning-soft)', border: '1px solid var(--warning)',
//             borderRadius: 10, padding: '14px 16px', marginBottom: 20,
//           }}>
//             <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--warning)', marginBottom: 4 }}>
//               🔒 Dôti is in private beta
//             </div>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
//               We're not accepting new accounts right now. You can request access and the admin will review it.
//             </p>
//             <button className="btn btn-primary btn-sm" onClick={() => setShowAccessForm(true)}>
//               Request Access →
//             </button>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {mode === 'signup' && (
//             <div>
//               <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                 Full Name
//               </label>
//               <input
//                 className="input" type="text"
//                 placeholder="Your full name"
//                 value={form.fullName} onChange={update('fullName')} required
//               />
//             </div>
//           )}

//           <div>
//             <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//               Email Address
//             </label>
//             <input
//               className="input" type="email"
//               placeholder="youremail@gmail.com"
//               value={form.email} onChange={update('email')} required
//             />
//           </div>

//           <div>
//             <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//               Password
//             </label>
//             <input
//               className="input" type="password"
//               placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
//               value={form.password} onChange={update('password')}
//               required minLength={mode === 'signup' ? 8 : 1}
//             />
//           </div>

//           {mode === 'signup' && (
//             <div>
//               <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
//                 I am a...
//               </label>
//               <div style={{ display: 'flex', gap: 10 }}>
//                 {[
//                   { value: 'mentee', label: '📚 Mentee', desc: 'I want to be tracked' },
//                   { value: 'mentor', label: '🎯 Mentor', desc: 'I track others' },
//                 ].map(opt => (
//                   <button
//                     key={opt.value} type="button"
//                     onClick={() => setRole(opt.value)}
//                     style={{
//                       flex: 1, padding: '12px 8px', borderRadius: 10,
//                       border: `2px solid ${role === opt.value ? 'var(--accent)' : 'var(--border)'}`,
//                       background: role === opt.value ? 'var(--accent-soft)' : 'var(--surface-2)',
//                       cursor: 'pointer', fontFamily: 'Urbanist, sans-serif', transition: 'all 0.18s',
//                     }}
//                   >
//                     <div style={{ fontSize: 18, marginBottom: 2 }}>{opt.label.split(' ')[0]}</div>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: role === opt.value ? 'var(--accent)' : 'var(--text-primary)' }}>
//                       {opt.label.split(' ')[1]}
//                     </div>
//                     <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {error && (
//             <div style={{
//               background: 'var(--danger-soft)', color: 'var(--danger)',
//               padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
//             }}>
//               {error}
//             </div>
//           )}

//           <button
//             className="btn btn-primary btn-lg"
//             type="submit"
//             disabled={loading || (mode === 'signup' && !signupOpen)}
//             style={{ marginTop: 4, justifyContent: 'center' }}
//           >
//             {loading ? (
//               <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
//                 {mode === 'login' ? 'Signing in...' : 'Creating account...'}
//               </span>
//             ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
//           </button>
//         </form>
//       </div>

//       <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700 }}>
//         S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient' // adjust path if needed

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PROD_URL = 'https://doti-alpha.vercel.app'
const MAX_RESETS = 2

function getResetCount(email) {
  try {
    const raw = localStorage.getItem(`doti_resets_${email}`)
    return raw ? parseInt(raw, 10) : 0
  } catch { return 0 }
}
function incrementResetCount(email) {
  try {
    const count = getResetCount(email) + 1
    localStorage.setItem(`doti_resets_${email}`, count)
    return count
  } catch { return 1 }
}

// ── Violet wave background ─────────────────────────────────────────────────
function WaveBackground() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '55vh', zIndex: 0, overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice"
        style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* back layer — deep violet */}
        <path
          d="M-60,500 L-60,280 Q80,180 200,240 Q340,310 440,210 Q560,100 680,200 Q780,280 860,220 L860,500 Z"
          fill="#3C2A7A" opacity="0.55"
        />
        {/* mid layer */}
        <path
          d="M-60,500 L-60,330 Q60,260 180,310 Q320,370 440,280 Q580,180 700,270 Q800,330 860,290 L860,500 Z"
          fill="#6040C0" opacity="0.5"
        />
        {/* front layer — lightest violet/periwinkle */}
        <path
          d="M-60,500 L-60,390 Q80,320 200,370 Q340,430 460,350 Q600,260 720,330 Q810,380 860,360 L860,500 Z"
          fill="#8A68E0" opacity="0.45"
        />
        {/* top shimmer layer */}
        <path
          d="M-60,500 L-60,440 Q100,380 240,420 Q380,460 500,400 Q640,330 760,390 Q830,420 860,410 L860,500 Z"
          fill="#B89FF5" opacity="0.35"
        />
      </svg>
    </div>
  )
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('mentee')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  // Access request state
  const [signupOpen, setSignupOpen] = useState(true)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [accessForm, setAccessForm] = useState({ full_name: '', email: '', reason: '' })
  const [accessSent, setAccessSent] = useState(false)
  const [sendingAccess, setSendingAccess] = useState(false)

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

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
        await signUp(form.email, form.password, form.fullName, role, {
          emailRedirectTo: PROD_URL,
        })
        setPendingEmail(form.email)
        setConfirmationSent(true)
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
      setAccessSent(true)
    } finally {
      setSendingAccess(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setForgotError('')

    if (!forgotEmail.trim()) {
      setForgotError('Enter your email address')
      return
    }
    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match')
      return
    }

    const resetCount = getResetCount(forgotEmail)
    if (resetCount >= MAX_RESETS) {
      setForgotError(`You've used both resets for this account. Contact admin to unlock.`)
      return
    }

    setResettingPassword(true)
    try {
      // Sign in as the user first, then update password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: forgotEmail,
        password: forgotEmail, // This will fail — see note below
      })

      // Since beta users may not remember password, we use admin update
      // For now: use supabase admin or RPC — fall back to a direct update call
      const res = await fetch(`${BASE}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, new_password: newPassword }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Reset failed')
      }

      incrementResetCount(forgotEmail)
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err.message || 'Reset failed. Check the email and try again.')
    } finally {
      setResettingPassword(false)
    }
  }

  // ── Styles shared ──────────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh', background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '20px',
    animation: 'fadeIn 0.4s ease', position: 'relative',
  }

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 420,
    boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1,
  }

  const logoBlock = (
    <div style={{ marginBottom: 32, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
        Dô<span style={{ color: 'var(--accent)' }}>t</span>i
      </div>
      <div style={{ fontSize: 11, letterSpacing: '5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
        S / Y A N
      </div>
    </div>
  )

  const globalStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
  `

  // ── Confirmation sent ──────────────────────────────────────────────────────
  if (confirmationSent) {
    return (
      <div style={pageStyle}>
        <style>{globalStyles}</style>
        <WaveBackground />
        {logoBlock}
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20, animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }}>📬</div>
          <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Check your inbox</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)', marginBottom: 24, wordBreak: 'break-all' }}>
            {pendingEmail}
          </p>
          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
              1. Open the email from <strong>Dôti</strong><br />
              2. Click <strong>"Confirm your email"</strong><br />
              3. You'll be redirected back and logged in automatically
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Didn't get it? Check your spam folder. The link expires in 24 hours.
          </p>
          <button className="btn btn-ghost btn-sm" onClick={() => { setConfirmationSent(false); setForm({ email: '', password: '', fullName: '' }); setMode('login') }}>
            ← Back to Sign In
          </button>
        </div>
        <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700, zIndex: 1 }}>
          S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
        </div>
      </div>
    )
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  if (showForgot) {
    return (
      <div style={pageStyle}>
        <style>{globalStyles}</style>
        <WaveBackground />
        {logoBlock}
        <div style={cardStyle}>
          {forgotSuccess ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ marginBottom: 10, fontSize: 20, fontWeight: 800 }}>Password updated</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                You can now sign in with your new password.
              </p>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', width: '100%' }}
                onClick={() => { setShowForgot(false); setForgotSuccess(false); setNewPassword(''); setConfirmPassword(''); setForgotEmail('') }}
              >
                Sign In →
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Reset password</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Beta reset — no email needed. Up to {MAX_RESETS} resets per account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Your Email
                  </label>
                  <input
                    className="input" type="email"
                    placeholder="youremail@gmail.com"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    New Password
                  </label>
                  <input
                    className="input" type="password"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setForgotError('') }}
                    required minLength={8}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <input
                    className="input" type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setForgotError('') }}
                    required
                  />
                </div>

                {forgotError && (
                  <div style={{
                    background: 'var(--danger-soft)', color: 'var(--danger)',
                    padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  }}>
                    {forgotError}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  disabled={resettingPassword}
                  style={{ marginTop: 4, justifyContent: 'center' }}
                >
                  {resettingPassword ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Updating...
                    </span>
                  ) : 'Update Password →'}
                </button>

                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowForgot(false); setForgotError(''); setNewPassword(''); setConfirmPassword('') }}>
                  ← Back to Sign In
                </button>
              </form>
            </>
          )}
        </div>
        <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700, zIndex: 1 }}>
          S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
        </div>
      </div>
    )
  }

  // ── Access request ─────────────────────────────────────────────────────────
  if (showAccessForm) {
    return (
      <div style={pageStyle}>
        <WaveBackground />
        {logoBlock}
        <div style={cardStyle}>
          {accessSent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ marginBottom: 10 }}>Request sent!</h2>
              <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
                The admin has been notified. You'll hear back soon.
              </p>
              <button className="btn btn-secondary" onClick={() => { setShowAccessForm(false); setMode('login') }} style={{ marginTop: 24 }}>
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: 6 }}>Request Access</h2>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Dôti is currently in private beta. Tell us who you are and we'll get back to you.
              </p>
              <form onSubmit={handleAccessRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input className="input" value={accessForm.full_name} onChange={updateAccess('full_name')} placeholder="Your full name" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input className="input" type="email" value={accessForm.email} onChange={updateAccess('email')} placeholder="youremail@gmail.com" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Why do you want access?</label>
                  <textarea className="input" value={accessForm.reason} onChange={updateAccess('reason')} placeholder="Tell us a bit about yourself..." style={{ minHeight: 80 }} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={sendingAccess} style={{ justifyContent: 'center' }}>
                  {sendingAccess ? 'Sending...' : 'Send Request →'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAccessForm(false)}>← Back to Login</button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Main auth form ─────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <style>{globalStyles}</style>
      <WaveBackground />

      {logoBlock}

      <div style={cardStyle}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 3, marginBottom: 28, gap: 3 }}>
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
              🔒 Dôti is in private beta
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
              We're not accepting new accounts right now. You can request access and the admin will review it.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAccessForm(true)}>
              Request Access →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input className="input" type="text" placeholder="Your full name" value={form.fullName} onChange={update('fullName')} required />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
            <input className="input" type="email" placeholder="youremail@gmail.com" value={form.email} onChange={update('email')} required />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              className="input" type="password"
              placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
              value={form.password} onChange={update('password')}
              required minLength={mode === 'signup' ? 8 : 1}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>I am a...</label>
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
            <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
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

        {/* Forgot password link — shown only on login tab */}
        {mode === 'login' && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotError(''); setNewPassword(''); setConfirmPassword(''); setForgotEmail(form.email) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-muted)',
                fontFamily: 'Urbanist, sans-serif',
                textDecoration: 'underline', textDecorationStyle: 'dotted',
              }}
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 28, fontSize: 11, letterSpacing: '4px', color: 'var(--text-muted)', fontWeight: 700, zIndex: 1 }}>
        S &nbsp;/&nbsp; Y &nbsp;A &nbsp;N
      </div>
    </div>
  )
}