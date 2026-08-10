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
  Pencil, X, Zap, Target, BookOpen, Star,
  Users, KeyRound, CheckCircle, ClipboardList,
  ArrowRight, ArrowLeft, ChevronDown, LogOut,
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
    <div style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <button
        onClick={() => setShow(s => !s)}
        style={{
          width: '100%', background: 'var(--surface-2)',
          border: 'none', cursor: 'pointer',
          padding: '13px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <KeyRound size={15} color="var(--text-secondary)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Change Password
          </span>
        </div>
        <ChevronDown
          size={13} color="var(--text-muted)"
          style={{ transform: show ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {show && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {['newPassword', 'confirm'].map((field, i) => (
            <div key={field}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                display: 'block', marginBottom: 5,
                textTransform: 'uppercase', letterSpacing: '0.7px',
              }}>
                {i === 0 ? 'New Password' : 'Confirm Password'}
              </label>
              <input
                className="input" type="password"
                placeholder={i === 0 ? 'Min 8 characters' : 'Repeat new password'}
                value={form[field]}
                onChange={update(field)}
              />
            </div>
          ))}

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
        <Target size={44} strokeWidth={1.2} color="var(--text-muted)"
          style={{ marginBottom: 14, opacity: 0.35 }} />
        <h3 style={{ marginBottom: 8 }}>No mentor connected yet</h3>
        <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
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
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
              {mp.full_name || 'Your Mentor'}
            </div>
            {mp.field_of_study && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mp.field_of_study}</div>
            )}
          </div>
          <span className="badge badge-success" style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <CheckCircle size={11} /> Connected
          </span>
        </div>

        {mp.bio && (
          <div style={{
            padding: '11px 14px', borderRadius: 10,
            background: 'var(--surface-2)', marginBottom: 12,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5,
            }}>
              About
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {mp.bio}
            </p>
          </div>
        )}

        <div style={{
          padding: '11px 14px', borderRadius: 10, background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'flex-start', gap: 9,
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          <ClipboardList size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
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

  const displayName = form.full_name
    ? form.full_name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Your Name'

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
        <button onClick={() => setSubPage(null)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
          fontSize: 14, fontWeight: 600, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
        }}>
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
        <button onClick={() => setSubPage(null)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
          fontSize: 14, fontWeight: 600, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
        }}>
          <ArrowLeft size={15} /> Back to Profile
        </button>
        <MentorView />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[200, 90, 130, 110].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <style>{`
        .ph-hero {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 0;
          height: 140px;
        }
        .ph-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 15% 40%, #7C3AED 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 85% 10%, #A855F7 0%, transparent 55%),
            radial-gradient(ellipse 45% 60% at 70% 85%, #D97706 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 40% 100%, #6D28D9 0%, transparent 55%),
            #1e0a3c;
        }
        .ph-hero-btn {
          position: absolute;
          top: 14px; right: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 9px;
          padding: 6px 13px;
          color: #fff;
          font-family: Urbanist, sans-serif;
          font-size: 12px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: background 0.15s;
          z-index: 2;
        }
        .ph-hero-btn:hover { background: rgba(255,255,255,0.22); }
        .ph-identity {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          padding: 0 4px;
          margin-top: -44px;
          margin-bottom: 18px;
          position: relative;
          z-index: 3;
          flex-wrap: wrap;
        }
        .ph-avatar {
          width: 84px; height: 84px;
          border-radius: 50%;
          background: linear-gradient(145deg, #6D28D9 0%, #9333EA 100%);
          border: 4px solid var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 900; color: #fff;
          flex-shrink: 0; letter-spacing: -0.5px;
          box-shadow: 0 2px 16px rgba(109,40,217,0.4);
        }
        .ph-name-block { padding-bottom: 6px; flex: 1; min-width: 150px; }
        .ph-name {
          font-size: 20px; font-weight: 900;
          letter-spacing: -0.4px;
          color: var(--text-primary);
          margin-bottom: 2px; line-height: 1.2;
        }
        .ph-email { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
        .ph-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .ph-chip {
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .ph-chip-role { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--border); }
        .ph-chip-premium {
          background: linear-gradient(90deg, #F59E0B18, #C026D318);
          color: #C026D3; border: 1px solid #C026D330;
        }
        .ph-stats {
          display: flex;
          border-radius: 13px;
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 18px;
          background: var(--surface-2);
        }
        .ph-stat {
          flex: 1; padding: 13px 8px; text-align: center;
          border-right: 1px solid var(--border);
        }
        .ph-stat:last-child { border-right: none; }
        .ph-stat-val {
          font-size: 18px; font-weight: 900;
          color: var(--text-primary); margin-bottom: 3px;
          display: flex; align-items: center;
          justify-content: center; gap: 4px; line-height: 1;
        }
        .ph-stat-lbl {
          font-size: 9px; font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.9px;
        }
        .ph-about {
          border-radius: 14px; border: 1px solid var(--border);
          overflow: hidden; margin-bottom: 18px;
        }
        .ph-about-head {
          padding: 12px 16px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .ph-about-label {
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .ph-about-edit {
          background: none; border: none; cursor: pointer;
          color: var(--accent); font-family: Urbanist, sans-serif;
          font-size: 12px; font-weight: 700; padding: 0;
          display: inline-flex; align-items: center; gap: 3px;
        }
        .ph-about-body { padding: 14px 16px; }
        .ph-bio-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin: 0; }
        .ph-bio-empty { font-size: 13px; color: var(--text-muted); font-style: italic; }
        .ph-edit {
          border-radius: 14px; border: 1px solid var(--accent);
          overflow: hidden; margin-bottom: 18px;
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .ph-edit-head {
          padding: 12px 16px; background: var(--accent-soft);
          border-bottom: 1px solid var(--border);
          font-size: 13px; font-weight: 700; color: var(--accent);
          display: flex; align-items: center; gap: 7px;
        }
        .ph-edit-body { padding: 16px; display: flex; flex-direction: column; gap: 13px; }
        .ph-edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .ph-field-lbl {
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.7px;
          display: block; margin-bottom: 5px;
        }
        .ph-edit-foot {
          display: flex; gap: 8px; justify-content: flex-end;
          padding: 11px 16px; background: var(--surface-2);
          border-top: 1px solid var(--border);
        }
        .ph-mship-grid { display: grid; gap: 11px; margin-bottom: 18px; }
        .ph-mship-card {
          border-radius: 14px; padding: 16px 18px;
          cursor: pointer;
          display: flex; align-items: center; gap: 14px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          transition: transform 0.13s, box-shadow 0.13s;
        }
        .ph-mship-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.07); }
        .ph-mship-card.purple {
          background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
          border: none;
        }
        .ph-mship-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ph-mship-icon.dark { background: rgba(255,255,255,0.14); }
        .ph-mship-icon.light { background: var(--accent-soft); }
        .ph-mship-title { font-size: 13px; font-weight: 800; margin-bottom: 1px; }
        .ph-mship-sub { font-size: 12px; line-height: 1.4; }
        .ph-settings { display: flex; flex-direction: column; gap: 11px; margin-bottom: 16px; }
        .ph-section { border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
        .ph-section-head {
          padding: 11px 16px; background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .ph-account-row {
          padding: 11px 14px;
          display: flex; justify-content: space-between; align-items: center; gap: 10px;
          border-bottom: 1px solid var(--border);
        }
        .ph-account-row:last-child { border-bottom: none; }
        .ph-account-lbl {
          font-size: 10px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;
        }
        .ph-account-val {
          font-size: 13px; font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;
        }
        .ph-role-blurb {
          border-radius: 14px; padding: 14px 16px;
          display: flex; gap: 12px; align-items: flex-start; margin-bottom: 0;
        }
        .ph-role-icon-wrap {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ph-danger {
          border-radius: 14px; border: 1px solid var(--danger-soft);
          padding: 14px 16px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        @media (max-width: 520px) {
          .ph-edit-row { grid-template-columns: 1fr; }
          .ph-avatar { width: 72px; height: 72px; font-size: 22px; }
          .ph-name { font-size: 17px; }
          .ph-identity { margin-top: -36px; }
          .ph-hero { height: 120px; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* HERO */}
      <div className="ph-hero">
        <div className="ph-hero-bg" />
        <button className="ph-hero-btn" onClick={() => setEditMode(e => !e)}>
          {editMode ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit Profile</>}
        </button>
      </div>

      {/* IDENTITY */}
      <div className="ph-identity">
        <div className="ph-avatar">{initials}</div>
        <div className="ph-name-block">
          <div className="ph-name">{displayName}</div>
          <div className="ph-email">{user?.email}</div>
          <div className="ph-chips">
            <span className="ph-chip ph-chip-role">
              <RoleIcon size={10} strokeWidth={2.2} /> {roleLabel}
            </span>
            {isMe && (
              <span className="ph-chip ph-chip-premium">
                <Star size={10} strokeWidth={2.2} /> Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="ph-stats">
        {[
          {
            val: (
              <>{streak.current_streak}<Zap size={14} color="var(--warning)" fill="var(--warning)" /></>
            ),
            lbl: 'Day Streak',
          },
          { val: `${streak.longest_streak}d`, lbl: 'Best Streak' },
          {
            val: form.field_of_study ? form.field_of_study.split(' ')[0] : roleLabel,
            lbl: form.field_of_study ? 'Focus' : 'Role',
          },
          { val: form.username ? `@${form.username}` : '—', lbl: 'Handle' },
        ].map((s, i) => (
          <div key={i} className="ph-stat">
            <div className="ph-stat-val">{s.val}</div>
            <div className="ph-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* EDIT FORM */}
      {editMode && (
        <div className="ph-edit">
          <div className="ph-edit-head"><Pencil size={13} /> Editing Profile</div>
          <div className="ph-edit-body">
            <div className="ph-edit-row">
              <div>
                <label className="ph-field-lbl">Full Name</label>
                <input className="input" value={form.full_name}
                  onChange={update('full_name')} placeholder="Your full name" />
              </div>
              <div>
                <label className="ph-field-lbl">Username</label>
                <input className="input" value={form.username}
                  onChange={update('username')} placeholder="@handle" />
              </div>
            </div>
            <div>
              <label className="ph-field-lbl">Field of Study / Expertise</label>
              <input className="input" value={form.field_of_study}
                onChange={update('field_of_study')}
                placeholder="e.g. Cloud Engineering, Data Science" />
            </div>
            <div>
              <label className="ph-field-lbl">Bio</label>
              <textarea className="input" value={form.bio} onChange={update('bio')}
                placeholder="Tell your mentor or mentees about yourself..."
                style={{ minHeight: 85 }} />
            </div>
          </div>
          <div className="ph-edit-foot">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {!editMode && (
        <div className="ph-about">
          <div className="ph-about-head">
            <span className="ph-about-label">About</span>
            <button className="ph-about-edit" onClick={() => setEditMode(true)}>
              Edit <ArrowRight size={11} />
            </button>
          </div>
          <div className="ph-about-body">
            {form.bio
              ? <p className="ph-bio-text">{form.bio}</p>
              : <span className="ph-bio-empty">
                  No bio yet — add one to introduce yourself to your {roleMentor ? 'mentees' : 'mentor'}.
                </span>
            }
          </div>
        </div>
      )}

      {/* MENTORSHIP CARDS */}
      {(showMenteesCard || showMentorCard) && (
        <div
          className="ph-mship-grid"
          style={{ gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr' }}
        >
          {showMenteesCard && (
            <div className="ph-mship-card purple" onClick={() => setSubPage('mentees')}>
              <div className="ph-mship-icon dark">
                <Users size={19} color="#fff" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ph-mship-title" style={{ color: '#fff' }}>My Mentees</div>
                <div className="ph-mship-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Track progress & AI summaries
                </div>
              </div>
              <ArrowRight size={15} color="rgba(255,255,255,0.5)" />
            </div>
          )}
          {showMentorCard && (
            <div className="ph-mship-card" onClick={() => setSubPage('mentor')}>
              <div className="ph-mship-icon light">
                <Target size={19} color="var(--accent)" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ph-mship-title">My Mentor</div>
                <div className="ph-mship-sub" style={{ color: 'var(--text-muted)' }}>
                  View connection status
                </div>
              </div>
              <ArrowRight size={15} color="var(--text-muted)" />
            </div>
          )}
        </div>
      )}

      {/* SETTINGS */}
      <div className="ph-settings">

        <div className="ph-section">
          <div className="ph-section-head">Account</div>
          {[
            {
              lbl: 'Email', val: user?.email,
              badge: (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={10} /> Verified
                </span>
              ),
            },
            {
              lbl: 'Account Type', val: roleLabel,
              badge: (
                <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <RoleIcon size={10} /> {roleLabel}
                </span>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="ph-account-row">
              <div style={{ minWidth: 0 }}>
                <div className="ph-account-lbl">{item.lbl}</div>
                <div className="ph-account-val">{item.val}</div>
              </div>
              {item.badge}
            </div>
          ))}
        </div>

        <div className="ph-role-blurb" style={{
          background: isMe ? 'linear-gradient(135deg,#F59E0B10,#C026D310)' : 'var(--accent-soft)',
          border: `1px solid ${isMe ? '#C026D328' : 'var(--border)'}`,
        }}>
          <div className="ph-role-icon-wrap" style={{
            background: isMe ? '#C026D318' : 'var(--accent-soft)',
            border: `1px solid ${isMe ? '#C026D330' : 'var(--border)'}`,
          }}>
            {isMe
              ? <Star size={16} color="#C026D3" strokeWidth={1.8} />
              : roleMentor
              ? <Target size={16} color="var(--accent)" strokeWidth={1.8} />
              : <BookOpen size={16} color="var(--accent)" strokeWidth={1.8} />
            }
          </div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 800, marginBottom: 3,
              color: isMe ? '#C026D3' : 'var(--accent)',
            }}>
              {isMe ? 'S / Y A N  Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isMe
                ? 'Full access to all Dôti features — mentee tracking, mentor connection, and premium tools.'
                : roleMentor
                ? 'Mentees connect using your email. Their logs arrive for your review and sign-off.'
                : 'Add a mentor by email. They receive your logs and sign off on your progress.'}
            </p>
          </div>
        </div>

        <ChangePasswordSection />

        <div className="ph-danger">
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
            style={{
              color: 'var(--danger)', borderColor: 'var(--danger-soft)',
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}