// import { useState, useEffect } from 'react'
// import { useAuth } from '../context/AuthContext'
// import { profileApi, mentorApi } from '../lib/api'
// import { useToast, ToastContainer } from '../hooks/useToast'
// import MenteeDashboard from './MenteeDashboard'
// import MenteeDetail from './MenteeDetail'

// const PREMIUM_EMAIL = 'adetumosgad@gmail.com'

// // ============================================================
// // CHANGE PASSWORD
// // ============================================================
// function ChangePasswordSection() {
//   const [form, setForm] = useState({ newPassword: '', confirm: '' })
//   const [saving, setSaving] = useState(false)
//   const [msg, setMsg] = useState(null)

//   const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

//   async function handleChange() {
//     setMsg(null)
//     if (form.newPassword.length < 8) {
//       setMsg({ type: 'error', text: 'Password must be at least 8 characters' })
//       return
//     }
//     if (form.newPassword !== form.confirm) {
//       setMsg({ type: 'error', text: 'Passwords do not match' })
//       return
//     }
//     setSaving(true)
//     try {
//       await profileApi.changePassword({ new_password: form.newPassword })
//       setMsg({ type: 'success', text: 'Password updated successfully!' })
//       setForm({ newPassword: '', confirm: '' })
//     } catch (e) {
//       setMsg({ type: 'error', text: e.message || 'Failed to change password' })
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="card">
//       <h4 style={{ marginBottom: 4 }}>Change Password</h4>
//       <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
//         Use a strong password with at least 8 characters.
//       </p>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         <div>
//           <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//             New Password
//           </label>
//           <input
//             className="input" type="password"
//             placeholder="Min 8 characters"
//             value={form.newPassword}
//             onChange={update('newPassword')}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//             Confirm Password
//           </label>
//           <input
//             className="input" type="password"
//             placeholder="Repeat new password"
//             value={form.confirm}
//             onChange={update('confirm')}
//           />
//         </div>

//         {msg && (
//           <div style={{
//             padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
//             background: msg.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
//             color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
//           }}>
//             {msg.text}
//           </div>
//         )}

//         <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={handleChange}
//             disabled={saving || !form.newPassword || !form.confirm}
//           >
//             {saving ? 'Updating...' : 'Update Password'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ============================================================
// // MY MENTOR VIEW
// // ============================================================
// function MentorView() {
//   const [mentor, setMentor] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     mentorApi.myMentor()
//       .then(res => setMentor(res.mentor))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <div>
//       <h1 style={{ marginBottom: 24 }}>My Mentor</h1>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
//       </div>
//     </div>
//   )

//   if (!mentor) return (
//     <div>
//       <h1 style={{ marginBottom: 24 }}>My Mentor</h1>
//       <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//         <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
//         <h3 style={{ marginBottom: 8 }}>No mentor connected yet</h3>
//         <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
//           Go to your home page and use the "Add a Mentor" card to connect with someone using their email.
//         </p>
//       </div>
//     </div>
//   )

//   const mp = mentor.profiles || {}
//   const initials = mp.full_name
//     ? mp.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : '?'

//   return (
//     <div>
//       <h1 style={{ marginBottom: 24 }}>My Mentor</h1>

//       <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
//         <div style={{
//           display: 'flex', alignItems: 'center',
//           gap: 16, marginBottom: 20, flexWrap: 'wrap',
//         }}>
//           <div style={{
//             width: 60, height: 60, borderRadius: '50%',
//             background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0,
//           }}>
//             {initials}
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>
//               {mp.full_name || 'Your Mentor'}
//             </div>
//             {mp.field_of_study && (
//               <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
//                 {mp.field_of_study}
//               </div>
//             )}
//           </div>
//           <span className="badge badge-success" style={{ flexShrink: 0 }}>✓ Connected</span>
//         </div>

//         {mp.bio && (
//           <div style={{
//             padding: '12px 16px', borderRadius: 10,
//             background: 'var(--surface-2)', marginBottom: 14,
//           }}>
//             <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
//               About
//             </div>
//             <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
//               {mp.bio}
//             </p>
//           </div>
//         )}

//         <div style={{
//           padding: '12px 16px', borderRadius: 10,
//           background: 'var(--accent-soft)',
//           fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
//         }}>
//           📋 Your daily logs are sent to this mentor for review and sign-off.
//           You get notified the moment they sign.
//         </div>
//       </div>
//     </div>
//   )
// }

// // ============================================================
// // MAIN PROFILE
// // ============================================================
// export default function Profile() {
//   const { user, profile, signOut, refreshProfile } = useAuth()
//   const { toasts, toast } = useToast()

//   const [form, setForm] = useState({
//     full_name: '', username: '', bio: '', field_of_study: '',
//   })
//   const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)

//   const [subPage, setSubPage] = useState(null)
//   const [selectedMentee, setSelectedMentee] = useState(null)

//   const isMe = user?.email?.toLowerCase() === PREMIUM_EMAIL
//   const roleMentor = profile?.role === 'mentor'
//   const roleMentee = profile?.role === 'mentee'
//   const showMenteesCard = roleMentor || isMe
//   const showMentorCard = roleMentee || isMe
//   const roleLabel = roleMentor ? '🎯 Mentor' : '📚 Mentee'

//   useEffect(() => {
//     async function load() {
//       setLoading(true)
//       try {
//         const res = await profileApi.get()
//         const p = res.profile || {}
//         setForm({
//           full_name: p.full_name || '',
//           username: p.username || '',
//           bio: p.bio || '',
//           field_of_study: p.field_of_study || '',
//         })
//         setStreak(res.streak || { current_streak: 0, longest_streak: 0 })
//       } catch {
//         toast.error('Failed to load profile')
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

//   async function handleSave() {
//     setSaving(true)
//     try {
//       await profileApi.update(form)
//       await refreshProfile()
//       toast.success('Profile updated!')
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const initials = form.full_name
//     ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : user?.email?.[0]?.toUpperCase() || '?'

//   // ── Sub-pages ──────────────────────────────────────────────

//   if (subPage === 'mentee-detail' && selectedMentee) {
//     return (
//       <MenteeDetail
//         mentee={selectedMentee}
//         onBack={() => { setSelectedMentee(null); setSubPage('mentees') }}
//       />
//     )
//   }

//   if (subPage === 'mentees') {
//     return (
//       <div className="page">
//         <button
//           onClick={() => setSubPage(null)}
//           style={{
//             background: 'none', border: 'none', cursor: 'pointer',
//             color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//             fontSize: 14, fontWeight: 600, padding: 0,
//             display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
//           }}
//         >
//           ← Back to Profile
//         </button>
//         <MenteeDashboard
//           onSelectMentee={(m) => { setSelectedMentee(m); setSubPage('mentee-detail') }}
//         />
//       </div>
//     )
//   }

//   if (subPage === 'mentor') {
//     return (
//       <div className="page">
//         <button
//           onClick={() => setSubPage(null)}
//           style={{
//             background: 'none', border: 'none', cursor: 'pointer',
//             color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//             fontSize: 14, fontWeight: 600, padding: 0,
//             display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
//           }}
//         >
//           ← Back to Profile
//         </button>
//         <MentorView />
//       </div>
//     )
//   }

//   // ── Loading ────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="page">
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {[100, 140, 220, 120].map((h, i) => (
//             <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // ── Main ───────────────────────────────────────────────────

//   return (
//     <div className="page">
//       <style>{`
//         .profile-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           margin-bottom: 20px;
//         }
//         .profile-form-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 14px;
//         }
//         .profile-hero-inner {
//           display: flex;
//           align-items: center;
//           gap: 20px;
//           flex-wrap: wrap;
//         }
//         .profile-streak-box {
//           display: flex;
//           gap: 0;
//           background: rgba(255,255,255,0.1);
//           border-radius: 12px;
//           overflow: hidden;
//           flex-shrink: 0;
//         }
//         @media (max-width: 768px) {
//           .profile-grid { grid-template-columns: 1fr; }
//           .profile-form-grid { grid-template-columns: 1fr; }
//           .profile-streak-box { width: 100%; }
//         }
//         @media (max-width: 480px) {
//           .profile-hero-inner { gap: 14px; }
//         }
//       `}</style>

//       <ToastContainer toasts={toasts} />

//       {/* Header */}
//       <div style={{
//         marginBottom: 24,
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
//       }}>
//         <h1>Profile</h1>
//         <button
//           className="btn btn-secondary btn-sm"
//           onClick={signOut}
//           style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
//         >
//           Sign Out
//         </button>
//       </div>

//       {/* Hero card */}
//       <div className="card" style={{
//         marginBottom: 20, padding: '24px 28px',
//         background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
//         border: 'none', color: '#fff',
//       }}>
//         <div className="profile-hero-inner">
//           {/* Avatar */}
//           <div style={{
//             width: 72, height: 72, borderRadius: '50%',
//             background: 'rgba(255,255,255,0.2)',
//             border: '3px solid rgba(255,255,255,0.4)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 26, fontWeight: 800, color: '#fff',
//             flexShrink: 0, letterSpacing: '-1px',
//           }}>
//             {initials}
//           </div>

//           {/* Name + role */}
//           <div style={{ flex: 1, minWidth: 140 }}>
//             <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3, letterSpacing: '-0.3px' }}>
//               {form.full_name || 'Add your name'}
//             </div>
//             <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
//               {user?.email}
//             </div>
//             <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//               <span style={{
//                 padding: '3px 10px', borderRadius: 20, fontSize: 11,
//                 fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff',
//               }}>
//                 {roleLabel}
//               </span>
//               {isMe && (
//                 <span style={{
//                   padding: '3px 10px', borderRadius: 20, fontSize: 11,
//                   fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#fff',
//                   border: '1px solid rgba(255,255,255,0.3)',
//                 }}>
//                   ⭐ Premium
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Streak */}
//           <div className="profile-streak-box">
//             {[
//               { label: 'Streak', value: `${streak.current_streak} 🔥` },
//               { label: 'Best', value: `${streak.longest_streak}d` },
//             ].map((s, i) => (
//               <div key={i} style={{
//                 padding: '14px 20px', textAlign: 'center',
//                 borderRight: i === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
//               }}>
//                 <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{s.value}</div>
//                 <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
//                   {s.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Mentorship cards */}
//       {(showMenteesCard || showMentorCard) && (
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr',
//           gap: 14, marginBottom: 20,
//         }}>
//           {showMenteesCard && (
//             <div
//               className="card card-clickable"
//               onClick={() => setSubPage('mentees')}
//               style={{
//                 background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
//                 border: 'none', color: '#fff',
//                 display: 'flex', flexDirection: 'column', gap: 10,
//               }}
//             >
//               <div style={{ fontSize: 28 }}>👥</div>
//               <div>
//                 <h3 style={{ color: '#fff', marginBottom: 4, fontSize: 16 }}>My Mentees</h3>
//                 <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
//                   View mentees, track progress, read AI summaries.
//                 </p>
//               </div>
//               <span style={{
//                 display: 'inline-block', padding: '4px 12px', borderRadius: 20,
//                 fontSize: 12, fontWeight: 700,
//                 background: 'rgba(255,255,255,0.2)', color: '#fff',
//                 alignSelf: 'flex-start',
//               }}>
//                 Open Dashboard →
//               </span>
//             </div>
//           )}

//           {showMentorCard && (
//             <div
//               className="card card-clickable"
//               onClick={() => setSubPage('mentor')}
//               style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
//             >
//               <div style={{ fontSize: 28 }}>🎯</div>
//               <div>
//                 <h3 style={{ marginBottom: 4, fontSize: 16 }}>My Mentor</h3>
//                 <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
//                   View your mentor and connection status.
//                 </p>
//               </div>
//               <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>
//                 View →
//               </span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Two column layout */}
//       <div className="profile-grid">

//         {/* Left — Personal Details */}
//         <div className="card">
//           <h3 style={{ marginBottom: 18 }}>Personal Details</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//             <div className="profile-form-grid">
//               <div>
//                 <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                   Full Name
//                 </label>
//                 <input className="input" value={form.full_name} onChange={update('full_name')} placeholder="Your full name" />
//               </div>
//               <div>
//                 <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                   Username
//                 </label>
//                 <input className="input" value={form.username} onChange={update('username')} placeholder="@handle" />
//               </div>
//             </div>

//             <div>
//               <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                 Field of Study / Expertise
//               </label>
//               <input className="input" value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Cloud Engineering, Data Science" />
//             </div>

//             <div>
//               <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
//                 Bio
//               </label>
//               <textarea
//                 className="input" value={form.bio} onChange={update('bio')}
//                 placeholder="Tell your mentor or mentees about yourself..."
//                 style={{ minHeight: 90 }}
//               />
//             </div>

//             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//               <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Right column */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

//           {/* Account info */}
//           <div className="card">
//             <h3 style={{ marginBottom: 14 }}>Account</h3>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//               {[
//                 { label: 'Email', value: user?.email, badge: { text: 'Verified', cls: 'badge-success' } },
//                 { label: 'Account Type', value: roleMentor ? 'Mentor' : 'Mentee', badge: { text: roleLabel, cls: 'badge-accent' } },
//               ].map((item, i) => (
//                 <div key={i} style={{
//                   padding: '12px 14px', background: 'var(--surface-2)',
//                   borderRadius: 10, display: 'flex',
//                   justifyContent: 'space-between', alignItems: 'center', gap: 10,
//                 }}>
//                   <div style={{ minWidth: 0 }}>
//                     <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
//                       {item.label}
//                     </div>
//                     <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       {item.value}
//                     </div>
//                   </div>
//                   <span className={`badge ${item.badge.cls}`} style={{ flexShrink: 0 }}>
//                     {item.badge.text}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Role explanation */}
//           <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
//             <div style={{ fontSize: 22, marginBottom: 8 }}>
//               {isMe ? '⭐' : roleMentor ? '🎯' : '📚'}
//             </div>
//             <h4 style={{ marginBottom: 6, color: 'var(--accent)', fontSize: 14 }}>
//               {isMe ? 'S / Y A N Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
//             </h4>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
//               {isMe
//                 ? 'Full access to all Dôti features — mentee tracking, mentor connection, and premium tools.'
//                 : roleMentor
//                 ? 'Mentees connect using your email. Their logs arrive for your review and sign-off.'
//                 : 'Add a mentor by email. They receive your logs and sign off on your progress.'}
//             </p>
//           </div>

//           {/* Change password */}
//           <ChangePasswordSection />

//           {/* Sign out */}
//           <div className="card" style={{ border: '1px solid var(--danger-soft)' }}>
//             <h4 style={{ marginBottom: 6, color: 'var(--danger)' }}>Sign Out</h4>
//             <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
//               You will be returned to the login screen.
//             </p>
//             <button
//               className="btn btn-secondary"
//               onClick={signOut}
//               style={{
//                 color: 'var(--danger)', borderColor: 'var(--danger-soft)',
//                 width: '100%', justifyContent: 'center',
//               }}
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileApi, mentorApi } from '../lib/api'
import { useToast, ToastContainer } from '../hooks/useToast'
import MenteeDashboard from './MenteeDashboard'
import MenteeDetail from './MenteeDetail'
import {
  Pencil, X, Flame, Target, BookOpen, Star,
  Users, KeyRound, CheckCircle, ClipboardList,
  ArrowRight, ArrowLeft, ChevronDown,
} from 'lucide-react'

const PREMIUM_EMAIL = 'adetumosgad@gmail.com'

// ============================================================
// CHANGE PASSWORD
// ============================================================
function ChangePasswordSection() {
  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [show, setShow] = useState(false)

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  async function handleChange() {
    setMsg(null)
    if (form.newPassword.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    if (form.newPassword !== form.confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setSaving(true)
    try {
      await profileApi.changePassword({ new_password: form.newPassword })
      setMsg({ type: 'success', text: 'Password updated successfully!' })
      setForm({ newPassword: '', confirm: '' })
      setTimeout(() => setShow(false), 1500)
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setShow(s => !s)}
        style={{
          width: '100%', background: 'var(--surface-2)',
          border: 'none', cursor: 'pointer',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KeyRound size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Change Password
          </span>
        </div>
        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            transform: show ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {show && (
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              display: 'block', marginBottom: 6,
              textTransform: 'uppercase', letterSpacing: '0.7px',
            }}>
              New Password
            </label>
            <input
              className="input" type="password"
              placeholder="Min 8 characters"
              value={form.newPassword}
              onChange={update('newPassword')}
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              display: 'block', marginBottom: 6,
              textTransform: 'uppercase', letterSpacing: '0.7px',
            }}>
              Confirm Password
            </label>
            <input
              className="input" type="password"
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={update('confirm')}
            />
          </div>

          {msg && (
            <div style={{
              padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: msg.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
              color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}>
              {msg.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleChange}
              disabled={saving || !form.newPassword || !form.confirm}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// MY MENTOR VIEW
// ============================================================
function MentorView() {
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mentorApi.myMentor()
      .then(res => setMentor(res.mentor))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <h1 style={{ marginBottom: 24 }}>My Mentor</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
      </div>
    </div>
  )

  if (!mentor) return (
    <div>
      <h1 style={{ marginBottom: 24 }}>My Mentor</h1>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Target size={48} strokeWidth={1.2} color="var(--text-muted)"
          style={{ marginBottom: 16, opacity: 0.4 }} />
        <h3 style={{ marginBottom: 8 }}>No mentor connected yet</h3>
        <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          Go to your home page and use the "Add a Mentor" card to connect with someone using their email.
        </p>
      </div>
    </div>
  )

  const mp = mentor.profiles || {}
  const initials = mp.full_name
    ? mp.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>My Mentor</h1>
      <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>
              {mp.full_name || 'Your Mentor'}
            </div>
            {mp.field_of_study && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mp.field_of_study}</div>
            )}
          </div>
          <span className="badge badge-success" style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <CheckCircle size={12} /> Connected
          </span>
        </div>

        {mp.bio && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'var(--surface-2)', marginBottom: 14,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
            }}>
              About
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {mp.bio}
            </p>
          </div>
        )}

        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          <ClipboardList size={15} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
          Your daily logs are sent to this mentor for review and sign-off.
          You get notified the moment they sign.
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PROFILE
// ============================================================
export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { toasts, toast } = useToast()

  const [form, setForm] = useState({
    full_name: '', username: '', bio: '', field_of_study: '',
  })
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [subPage, setSubPage] = useState(null)
  const [selectedMentee, setSelectedMentee] = useState(null)

  const isMe = user?.email?.toLowerCase() === PREMIUM_EMAIL
  const roleMentor = profile?.role === 'mentor'
  const roleMentee = profile?.role === 'mentee'
  const showMenteesCard = roleMentor || isMe
  const showMentorCard = roleMentee || isMe

  const RoleIcon = roleMentor ? Target : BookOpen
  const roleLabel = roleMentor ? 'Mentor' : 'Mentee'

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await profileApi.get()
        const p = res.profile || {}
        setForm({
          full_name: p.full_name || '',
          username: p.username || '',
          bio: p.bio || '',
          field_of_study: p.field_of_study || '',
        })
        setStreak(res.streak || { current_streak: 0, longest_streak: 0 })
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSave() {
    setSaving(true)
    try {
      await profileApi.update(form)
      await refreshProfile()
      toast.success('Profile updated!')
      setEditMode(false)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?'

  // ── Sub-pages ──────────────────────────────────────────────

  if (subPage === 'mentee-detail' && selectedMentee) {
    return (
      <MenteeDetail
        mentee={selectedMentee}
        onBack={() => { setSelectedMentee(null); setSubPage('mentees') }}
      />
    )
  }

  if (subPage === 'mentees') {
    return (
      <div className="page">
        <button
          onClick={() => setSubPage(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
            fontSize: 14, fontWeight: 600, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} /> Back to Profile
        </button>
        <MenteeDashboard
          onSelectMentee={(m) => { setSelectedMentee(m); setSubPage('mentee-detail') }}
        />
      </div>
    )
  }

  if (subPage === 'mentor') {
    return (
      <div className="page">
        <button
          onClick={() => setSubPage(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
            fontSize: 14, fontWeight: 600, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} /> Back to Profile
        </button>
        <MentorView />
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[220, 100, 140, 120].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Main ───────────────────────────────────────────────────

  return (
    <div className="page">
      <style>{`
        .profile-hero {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 20px;
          min-height: 180px;
        }
        .profile-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, #7C3AED 0%, transparent 55%),
            radial-gradient(ellipse at 80% 20%, #C026D3 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, #F59E0B 0%, transparent 45%),
            radial-gradient(ellipse at 10% 90%, #4C1D95 0%, transparent 50%),
            linear-gradient(135deg, #2e1065 0%, #4C1D95 100%);
        }
        .profile-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.15);
        }
        .profile-hero-content {
          position: relative;
          z-index: 1;
          padding: 24px 24px 0 24px;
        }
        .profile-hero-top {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }
        .profile-edit-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          padding: 7px 14px;
          color: #fff;
          font-family: Urbanist, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
          transition: background 0.15s;
        }
        .profile-edit-btn:hover { background: rgba(255,255,255,0.25); }

        .profile-avatar-wrap {
          display: flex;
          align-items: flex-end;
          gap: 18px;
          padding: 0 24px;
          margin-top: -36px;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
        }
        .profile-avatar {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6D28D9, #8B5CF6);
          border: 4px solid var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 900; color: #fff;
          flex-shrink: 0; letter-spacing: -1px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.35);
        }
        .profile-name-block { padding-bottom: 16px; flex: 1; min-width: 160px; }
        .profile-name {
          font-size: 22px; font-weight: 900;
          letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 2px;
        }
        .profile-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
        .profile-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .profile-role-chip {
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          background: var(--accent-soft); color: var(--accent);
          border: 1px solid var(--border);
          display: inline-flex; align-items: center; gap: 5px;
        }
        .profile-premium-chip {
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          background: linear-gradient(90deg, #F59E0B22, #C026D322);
          color: #C026D3; border: 1px solid #C026D344;
          display: inline-flex; align-items: center; gap: 5px;
        }

        .profile-stat-strip {
          display: flex; border-radius: 14px;
          border: 1px solid var(--border); overflow: hidden;
          margin-bottom: 20px; background: var(--surface-2);
        }
        .profile-stat-item {
          flex: 1; padding: 14px 10px; text-align: center;
          border-right: 1px solid var(--border);
        }
        .profile-stat-item:last-child { border-right: none; }
        .profile-stat-value {
          font-size: 20px; font-weight: 900;
          color: var(--text-primary); margin-bottom: 2px;
          letter-spacing: -0.5px;
          display: flex; align-items: center;
          justify-content: center; gap: 5px;
        }
        .profile-stat-label {
          font-size: 10px; font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px;
        }

        .profile-about-card {
          border-radius: 16px; border: 1px solid var(--border);
          overflow: hidden; margin-bottom: 20px;
        }
        .profile-about-header {
          padding: 14px 18px 12px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .profile-about-title {
          font-size: 12px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .profile-about-body { padding: 16px 18px; }
        .profile-bio-display {
          font-size: 14px; color: var(--text-secondary);
          line-height: 1.65; margin: 0;
        }
        .profile-bio-empty {
          font-size: 14px; color: var(--text-muted); font-style: italic;
        }

        .profile-edit-form {
          border-radius: 16px; border: 1px solid var(--accent);
          overflow: hidden; margin-bottom: 20px;
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .profile-edit-header {
          padding: 14px 18px; background: var(--accent-soft);
          border-bottom: 1px solid var(--border);
          font-size: 13px; font-weight: 700; color: var(--accent);
          display: flex; align-items: center; gap: 8px;
        }
        .profile-form-inner {
          padding: 18px; display: flex; flex-direction: column; gap: 14px;
        }
        .profile-form-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .profile-field-label {
          font-size: 12px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.7px;
          display: block; margin-bottom: 6px;
        }
        .profile-form-actions {
          display: flex; gap: 8px; justify-content: flex-end;
          padding: 12px 18px; background: var(--surface-2);
          border-top: 1px solid var(--border);
        }

        .profile-mentorship-grid {
          display: grid; gap: 12px; margin-bottom: 20px;
        }
        .profile-mentorship-card {
          border-radius: 16px; padding: 18px 20px;
          cursor: pointer; display: flex; align-items: center; gap: 16px;
          border: 1px solid var(--border); background: var(--surface-2);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .profile-mentorship-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .profile-mentorship-card.purple {
          background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
          border: none; color: #fff;
        }
        .profile-mentorship-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; background: rgba(255,255,255,0.15);
        }
        .profile-mentorship-icon.light { background: var(--accent-soft); }
        .profile-mentorship-text { flex: 1; min-width: 0; }
        .profile-mentorship-card-title { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
        .profile-mentorship-card-sub { font-size: 12px; opacity: 0.75; line-height: 1.4; }

        .profile-settings-stack {
          display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;
        }
        .profile-account-row {
          padding: 12px 16px; background: var(--surface-2);
          border-radius: 12px; display: flex;
          justify-content: space-between; align-items: center; gap: 10;
        }
        .profile-account-label {
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;
        }
        .profile-account-value {
          font-size: 13px; font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .profile-danger-card {
          border-radius: 16px; border: 1px solid var(--danger-soft); overflow: hidden;
        }
        .profile-danger-inner {
          padding: 16px 18px; display: flex;
          align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .profile-form-row { grid-template-columns: 1fr; }
          .profile-avatar { width: 76px; height: 76px; font-size: 24px; }
          .profile-name { font-size: 18px; }
          .profile-avatar-wrap { margin-top: -28px; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-hero-top">
            <button
              className="profile-edit-btn"
              onClick={() => setEditMode(e => !e)}
            >
              {editMode
                ? <><X size={14} /> Cancel</>
                : <><Pencil size={14} /> Edit Profile</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── AVATAR OVERLAP ───────────────────────────────────── */}
      <div className="profile-avatar-wrap" style={{ marginBottom: 16 }}>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-name-block">
          <div className="profile-name">{form.full_name || 'Your Name'}</div>
          <div className="profile-sub">{form.field_of_study || user?.email}</div>
          <div className="profile-badges">
            <span className="profile-role-chip">
              <RoleIcon size={11} /> {roleLabel}
            </span>
            {isMe && (
              <span className="profile-premium-chip">
                <Star size={11} /> Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STAT STRIP ───────────────────────────────────────── */}
      <div className="profile-stat-strip">
        {[
          {
            value: (
              <>
                {streak.current_streak}
                <Flame size={16} color="var(--warning)" />
              </>
            ),
            label: 'Day Streak',
          },
          { value: `${streak.longest_streak}d`, label: 'Best Streak' },
          {
            value: form.field_of_study
              ? form.field_of_study.split(' ').slice(0, 1).join('')
              : '—',
            label: 'Focus',
          },
          { value: roleLabel, label: 'Role' },
        ].map((s, i) => (
          <div key={i} className="profile-stat-item">
            <div className="profile-stat-value">{s.value}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── EDIT FORM ────────────────────────────────────────── */}
      {editMode && (
        <div className="profile-edit-form">
          <div className="profile-edit-header">
            <Pencil size={14} /> Editing Profile
          </div>
          <div className="profile-form-inner">
            <div className="profile-form-row">
              <div>
                <label className="profile-field-label">Full Name</label>
                <input className="input" value={form.full_name} onChange={update('full_name')} placeholder="Your full name" />
              </div>
              <div>
                <label className="profile-field-label">Username</label>
                <input className="input" value={form.username} onChange={update('username')} placeholder="@handle" />
              </div>
            </div>
            <div>
              <label className="profile-field-label">Field of Study / Expertise</label>
              <input className="input" value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Cloud Engineering, Data Science" />
            </div>
            <div>
              <label className="profile-field-label">Bio</label>
              <textarea
                className="input" value={form.bio} onChange={update('bio')}
                placeholder="Tell your mentor or mentees about yourself..."
                style={{ minHeight: 90 }}
              />
            </div>
          </div>
          <div className="profile-form-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── ABOUT (view mode) ────────────────────────────────── */}
      {!editMode && (
        <div className="profile-about-card">
          <div className="profile-about-header">
            <span className="profile-about-title">About</span>
            <button
              onClick={() => setEditMode(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
                fontSize: 12, fontWeight: 700, padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              Edit <ArrowRight size={12} />
            </button>
          </div>
          <div className="profile-about-body">
            {form.bio
              ? <p className="profile-bio-display">{form.bio}</p>
              : <span className="profile-bio-empty">
                  No bio yet — add one to introduce yourself to your {roleMentor ? 'mentees' : 'mentor'}.
                </span>
            }
          </div>
        </div>
      )}

      {/* ── MENTORSHIP CARDS ─────────────────────────────────── */}
      {(showMenteesCard || showMentorCard) && (
        <div
          className="profile-mentorship-grid"
          style={{
            gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr',
          }}
        >
          {showMenteesCard && (
            <div
              className="profile-mentorship-card purple"
              onClick={() => setSubPage('mentees')}
            >
              <div className="profile-mentorship-icon">
                <Users size={20} color="#fff" strokeWidth={1.8} />
              </div>
              <div className="profile-mentorship-text">
                <div className="profile-mentorship-card-title" style={{ color: '#fff' }}>
                  My Mentees
                </div>
                <div className="profile-mentorship-card-sub" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Track progress & AI summaries
                </div>
              </div>
              <ArrowRight size={16} color="rgba(255,255,255,0.6)" />
            </div>
          )}

          {showMentorCard && (
            <div
              className="profile-mentorship-card"
              onClick={() => setSubPage('mentor')}
            >
              <div className="profile-mentorship-icon light">
                <Target size={20} color="var(--accent)" strokeWidth={1.8} />
              </div>
              <div className="profile-mentorship-text">
                <div className="profile-mentorship-card-title">My Mentor</div>
                <div className="profile-mentorship-card-sub" style={{ color: 'var(--text-muted)' }}>
                  View connection status
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS STACK ───────────────────────────────────── */}
      <div className="profile-settings-stack">

        {/* Account info */}
        <div style={{ borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 18px', background: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
            fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
          }}>
            Account
          </div>
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              {
                label: 'Email',
                value: user?.email,
                badge: {
                  text: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={11} /> Verified
                    </span>
                  ),
                  cls: 'badge-success',
                },
              },
              {
                label: 'Account Type',
                value: roleLabel,
                badge: {
                  text: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <RoleIcon size={11} /> {roleLabel}
                    </span>
                  ),
                  cls: 'badge-accent',
                },
              },
            ].map((item, i) => (
              <div key={i} className="profile-account-row">
                <div style={{ minWidth: 0 }}>
                  <div className="profile-account-label">{item.label}</div>
                  <div className="profile-account-value">{item.value}</div>
                </div>
                <span className={`badge ${item.badge.cls}`} style={{ flexShrink: 0 }}>
                  {item.badge.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Role blurb */}
        <div style={{
          borderRadius: 16,
          background: isMe
            ? 'linear-gradient(135deg, #F59E0B11, #C026D311)'
            : 'var(--accent-soft)',
          border: `1px solid ${isMe ? '#C026D333' : 'var(--border)'}`,
          padding: '16px 18px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: isMe ? '#C026D322' : 'var(--accent-soft)',
            border: `1px solid ${isMe ? '#C026D344' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isMe
              ? <Star size={17} color="#C026D3" strokeWidth={1.8} />
              : roleMentor
              ? <Target size={17} color="var(--accent)" strokeWidth={1.8} />
              : <BookOpen size={17} color="var(--accent)" strokeWidth={1.8} />
            }
          </div>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, marginBottom: 4,
              color: isMe ? '#C026D3' : 'var(--accent)',
            }}>
              {isMe ? 'S / Y A N  Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isMe
                ? 'Full access to all Dôti features — mentee tracking, mentor connection, and premium tools.'
                : roleMentor
                ? 'Mentees connect using your email. Their logs arrive for your review and sign-off.'
                : 'Add a mentor by email. They receive your logs and sign off on your progress.'}
            </p>
          </div>
        </div>

        {/* Change password */}
        <ChangePasswordSection />

        {/* Sign out */}
        <div className="profile-danger-card">
          <div className="profile-danger-inner">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>
                Sign Out
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                You'll be returned to the login screen.
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={signOut}
              style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)', flexShrink: 0 }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}