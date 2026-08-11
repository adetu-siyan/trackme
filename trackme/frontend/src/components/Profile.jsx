


// import { useState, useEffect } from 'react'
// import { useAuth } from '../context/AuthContext'
// import { profileApi, mentorApi } from '../lib/api'
// import { useToast, ToastContainer } from '../hooks/useToast'
// import MenteeDashboard from './MenteeDashboard'
// import MenteeDetail from './MenteeDetail'
// import {
//   Pencil, X, Zap, Target, BookOpen, Star,
//   Users, KeyRound, CheckCircle, ClipboardList,
//   ArrowRight, ArrowLeft, ChevronDown, LogOut,
// } from 'lucide-react'

// const PREMIUM_EMAIL = 'adetumosgad@gmail.com'

// // ============================================================
// // CHANGE PASSWORD
// // ============================================================
// function ChangePasswordSection() {
//   const [form, setForm] = useState({ newPassword: '', confirm: '' })
//   const [saving, setSaving] = useState(false)
//   const [msg, setMsg] = useState(null)
//   const [show, setShow] = useState(false)

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
//       setTimeout(() => setShow(false), 1500)
//     } catch (e) {
//       setMsg({ type: 'error', text: e.message || 'Failed to change password' })
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
//       <button
//         onClick={() => setShow(s => !s)}
//         style={{
//           width: '100%', background: 'var(--surface-2)',
//           border: 'none', cursor: 'pointer',
//           padding: '13px 16px',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           fontFamily: 'Urbanist, sans-serif',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
//           <KeyRound size={15} color="var(--text-secondary)" />
//           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//             Change Password
//           </span>
//         </div>
//         <ChevronDown
//           size={13} color="var(--text-muted)"
//           style={{ transform: show ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
//         />
//       </button>

//       {show && (
//         <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
//           {['newPassword', 'confirm'].map((field, i) => (
//             <div key={field}>
//               <label style={{
//                 fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                 display: 'block', marginBottom: 5,
//                 textTransform: 'uppercase', letterSpacing: '0.7px',
//               }}>
//                 {i === 0 ? 'New Password' : 'Confirm Password'}
//               </label>
//               <input
//                 className="input" type="password"
//                 placeholder={i === 0 ? 'Min 8 characters' : 'Repeat new password'}
//                 value={form[field]}
//                 onChange={update(field)}
//               />
//             </div>
//           ))}

//           {msg && (
//             <div style={{
//               padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
//               background: msg.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
//               color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
//             }}>
//               {msg.text}
//             </div>
//           )}

//           <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//             <button
//               className="btn btn-primary btn-sm"
//               onClick={handleChange}
//               disabled={saving || !form.newPassword || !form.confirm}
//             >
//               {saving ? 'Updating...' : 'Update Password'}
//             </button>
//           </div>
//         </div>
//       )}
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
//         <Target size={44} strokeWidth={1.2} color="var(--text-muted)"
//           style={{ marginBottom: 14, opacity: 0.35 }} />
//         <h3 style={{ marginBottom: 8 }}>No mentor connected yet</h3>
//         <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
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
//       <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
//           <div style={{
//             width: 56, height: 56, borderRadius: '50%',
//             background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
//           }}>
//             {initials}
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
//               {mp.full_name || 'Your Mentor'}
//             </div>
//             {mp.field_of_study && (
//               <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mp.field_of_study}</div>
//             )}
//           </div>
//           <span className="badge badge-success" style={{
//             flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
//           }}>
//             <CheckCircle size={11} /> Connected
//           </span>
//         </div>

//         {mp.bio && (
//           <div style={{
//             padding: '11px 14px', borderRadius: 10,
//             background: 'var(--surface-2)', marginBottom: 12,
//           }}>
//             <div style={{
//               fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
//               textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5,
//             }}>About</div>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
//               {mp.bio}
//             </p>
//           </div>
//         )}

//         <div style={{
//           padding: '11px 14px', borderRadius: 10, background: 'var(--accent-soft)',
//           display: 'flex', alignItems: 'flex-start', gap: 9,
//           fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
//         }}>
//           <ClipboardList size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
//           Your daily logs are sent to this mentor for review and sign-off.
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
//   const [editMode, setEditMode] = useState(false)
//   const [subPage, setSubPage] = useState(null)
//   const [selectedMentee, setSelectedMentee] = useState(null)

//   const isMe = user?.email?.toLowerCase() === PREMIUM_EMAIL
//   const roleMentor = profile?.role === 'mentor'
//   const roleMentee = profile?.role === 'mentee'
//   const showMenteesCard = roleMentor || isMe
//   const showMentorCard = roleMentee || isMe
//   const RoleIcon = roleMentor ? Target : BookOpen
//   const roleLabel = roleMentor ? 'Mentor' : 'Mentee'

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
//       setEditMode(false)
//     } catch (e) {
//       toast.error(e.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const initials = form.full_name
//     ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : user?.email?.[0]?.toUpperCase() || '?'

//   const displayName = form.full_name
//     ? form.full_name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
//     : 'Your Name'

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
//         <button onClick={() => setSubPage(null)} style={{
//           background: 'none', border: 'none', cursor: 'pointer',
//           color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//           fontSize: 14, fontWeight: 600, padding: 0,
//           display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
//         }}>
//           <ArrowLeft size={15} /> Back to Profile
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
//         <button onClick={() => setSubPage(null)} style={{
//           background: 'none', border: 'none', cursor: 'pointer',
//           color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//           fontSize: 14, fontWeight: 600, padding: 0,
//           display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
//         }}>
//           <ArrowLeft size={15} /> Back to Profile
//         </button>
//         <MentorView />
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="page">
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//           {[200, 90, 130, 110].map((h, i) => (
//             <div key={i} className="skeleton" style={{ height: h, borderRadius: 14 }} />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="page">
//       <style>{`

//         /* ================================================
//            SHARED BASE STYLES
//         ================================================ */

//         .ph-banner {
//           position: relative;
//           background:
//             radial-gradient(ellipse 80% 120% at 0% 60%, #7C3AED 0%, transparent 55%),
//             radial-gradient(ellipse 60% 100% at 40% -10%, #A855F7 0%, transparent 50%),
//             radial-gradient(ellipse 60% 80% at 100% 40%, #06B6D4 0%, transparent 55%),
//             radial-gradient(ellipse 55% 70% at 65% 110%, #F59E0B 0%, transparent 50%),
//             radial-gradient(ellipse 40% 50% at 85% 90%, #EC4899 0%, transparent 45%),
//             #0f0720;
//         }

//         /* ================================================
//            MOBILE LAYOUT (default)
//         ================================================ */

//         .ph-page-wrap {
//           width: 100%;
//         }

//         .ph-card {
//           border-radius: 20px;
//           border: 1px solid var(--border);
//           overflow: hidden;
//           margin-bottom: 16px;
//           background: var(--surface);
//         }

//         .ph-banner {
//           height: 130px;
//         }

//         .ph-banner-btn {
//           position: absolute;
//           top: 12px; right: 12px;
//           background: rgba(255,255,255,0.15);
//           border: 1px solid rgba(255,255,255,0.28);
//           border-radius: 9px;
//           padding: 6px 13px;
//           color: #fff;
//           font-family: Urbanist, sans-serif;
//           font-size: 12px; font-weight: 700;
//           cursor: pointer;
//           display: flex; align-items: center; gap: 6px;
//           backdrop-filter: blur(12px);
//           -webkit-backdrop-filter: blur(12px);
//           transition: background 0.15s;
//           z-index: 2;
//         }
//         .ph-banner-btn:hover { background: rgba(255,255,255,0.26); }

//         .ph-avatar-wrap {
//           padding: 0 20px;
//           margin-top: -36px;
//           position: relative;
//           z-index: 3;
//         }
//         .ph-avatar {
//           width: 76px; height: 76px;
//           border-radius: 50%;
//           background: linear-gradient(145deg, #6D28D9 0%, #9333EA 100%);
//           border: 4px solid var(--surface);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 24px; font-weight: 900; color: #fff;
//           letter-spacing: -0.5px;
//           box-shadow: 0 4px 20px rgba(109,40,217,0.45);
//         }

//         .ph-identity {
//           padding: 10px 20px 18px 20px;
//         }
//         .ph-name {
//           font-size: 20px; font-weight: 900;
//           letter-spacing: -0.4px;
//           color: var(--text-primary);
//           margin-bottom: 2px; line-height: 1.2;
//         }
//         .ph-email { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
//         .ph-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
//         .ph-chip {
//           padding: 3px 10px; border-radius: 20px;
//           font-size: 11px; font-weight: 700;
//           display: inline-flex; align-items: center; gap: 4px;
//         }
//         .ph-chip-role {
//           background: var(--accent-soft); color: var(--accent);
//           border: 1px solid var(--border);
//         }
//         .ph-chip-premium {
//           background: linear-gradient(90deg, #F59E0B18, #C026D318);
//           color: #C026D3; border: 1px solid #C026D330;
//         }

//         /* desktop identity — hidden on mobile */
//         .ph-desktop-identity { display: none; }

//         .ph-stats {
//           display: flex;
//           border-top: 1px solid var(--border);
//         }
//         .ph-stat {
//           flex: 1; padding: 13px 8px; text-align: center;
//           border-right: 1px solid var(--border);
//         }
//         .ph-stat:last-child { border-right: none; }
//         .ph-stat-val {
//           font-size: 17px; font-weight: 900;
//           color: var(--text-primary); margin-bottom: 3px;
//           display: flex; align-items: center;
//           justify-content: center; gap: 4px; line-height: 1;
//         }
//         .ph-stat-lbl {
//           font-size: 9px; font-weight: 700;
//           color: var(--text-muted);
//           text-transform: uppercase; letter-spacing: 0.9px;
//         }

//         /* About */
//         .ph-about {
//           border-radius: 14px; border: 1px solid var(--border);
//           overflow: hidden; margin-bottom: 16px;
//         }
//         .ph-about-head {
//           padding: 12px 16px; border-bottom: 1px solid var(--border);
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .ph-about-label {
//           font-size: 11px; font-weight: 700; color: var(--text-muted);
//           text-transform: uppercase; letter-spacing: 0.8px;
//         }
//         .ph-about-edit {
//           background: none; border: none; cursor: pointer;
//           color: var(--accent); font-family: Urbanist, sans-serif;
//           font-size: 12px; font-weight: 700; padding: 0;
//           display: inline-flex; align-items: center; gap: 3px;
//         }
//         .ph-about-body { padding: 14px 16px; }
//         .ph-bio-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin: 0; }
//         .ph-bio-empty { font-size: 13px; color: var(--text-muted); font-style: italic; }

//         /* Edit form */
//         .ph-edit {
//           border-radius: 14px; border: 1px solid var(--accent);
//           overflow: hidden; margin-bottom: 16px;
//           box-shadow: 0 0 0 3px var(--accent-soft);
//         }
//         .ph-edit-head {
//           padding: 12px 16px; background: var(--accent-soft);
//           border-bottom: 1px solid var(--border);
//           font-size: 13px; font-weight: 700; color: var(--accent);
//           display: flex; align-items: center; gap: 7px;
//         }
//         .ph-edit-body { padding: 16px; display: flex; flex-direction: column; gap: 13px; }
//         .ph-edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
//         .ph-field-lbl {
//           font-size: 11px; font-weight: 700; color: var(--text-muted);
//           text-transform: uppercase; letter-spacing: 0.7px;
//           display: block; margin-bottom: 5px;
//         }
//         .ph-edit-foot {
//           display: flex; gap: 8px; justify-content: flex-end;
//           padding: 11px 16px; background: var(--surface-2);
//           border-top: 1px solid var(--border);
//         }

//         /* Mentorship cards */
//         .ph-mship-grid { display: grid; gap: 11px; margin-bottom: 16px; }
//         .ph-mship-card {
//           border-radius: 14px; padding: 16px 18px;
//           cursor: pointer;
//           display: flex; align-items: center; gap: 14px;
//           border: 1px solid var(--border);
//           background: var(--surface-2);
//           transition: transform 0.13s, box-shadow 0.13s;
//         }
//         .ph-mship-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.07); }
//         .ph-mship-card.purple {
//           background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
//           border: none;
//         }
//         .ph-mship-icon {
//           width: 40px; height: 40px; border-radius: 11px;
//           display: flex; align-items: center; justify-content: center; flex-shrink: 0;
//         }
//         .ph-mship-icon.dark { background: rgba(255,255,255,0.14); }
//         .ph-mship-icon.light { background: var(--accent-soft); }
//         .ph-mship-title { font-size: 13px; font-weight: 800; margin-bottom: 1px; }
//         .ph-mship-sub { font-size: 12px; line-height: 1.4; }

//         /* Settings */
//         .ph-settings { display: flex; flex-direction: column; gap: 11px; margin-bottom: 16px; }
//         .ph-section { border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
//         .ph-section-head {
//           padding: 11px 16px; background: var(--surface-2);
//           border-bottom: 1px solid var(--border);
//           font-size: 11px; font-weight: 700; color: var(--text-muted);
//           text-transform: uppercase; letter-spacing: 0.8px;
//         }
//         .ph-account-row {
//           padding: 11px 14px;
//           display: flex; justify-content: space-between; align-items: center; gap: 10px;
//           border-bottom: 1px solid var(--border);
//         }
//         .ph-account-row:last-child { border-bottom: none; }
//         .ph-account-lbl {
//           font-size: 10px; font-weight: 700; color: var(--text-muted);
//           text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;
//         }
//         .ph-account-val {
//           font-size: 13px; font-weight: 500;
//           overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;
//         }
//         .ph-role-blurb {
//           border-radius: 14px; padding: 14px 16px;
//           display: flex; gap: 12px; align-items: flex-start;
//         }
//         .ph-role-icon-wrap {
//           width: 34px; height: 34px; border-radius: 9px;
//           display: flex; align-items: center; justify-content: center; flex-shrink: 0;
//         }
//         .ph-danger {
//           border-radius: 14px; border: 1px solid var(--danger-soft);
//           padding: 14px 16px;
//           display: flex; align-items: center;
//           justify-content: space-between; gap: 12px; flex-wrap: wrap;
//         }

//         /* ================================================
//            DESKTOP LAYOUT (768px+)
//         ================================================ */

//         @media (min-width: 768px) {

//           /* Center and constrain */
//           .ph-page-wrap {
//             max-width: 620px;
//             margin: 0 auto;
//           }

//           /* Taller banner on desktop */
//           .ph-banner {
//             height: 200px;
//           }

//           /* Hide the mobile avatar+name blocks */
//           .ph-avatar-wrap { display: none; }
//           .ph-identity { display: none; }

//           /* Desktop identity row sits inside the banner at the bottom */
//           .ph-desktop-identity {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             position: absolute;
//             bottom: 22px;
//             left: 24px;
//             right: 140px;
//             z-index: 3;
//           }
//           .ph-desktop-avatar {
//             width: 80px; height: 80px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #6D28D9 0%, #9333EA 100%);
//             border: 4px solid rgba(255,255,255,0.15);
//             display: flex; align-items: center; justify-content: center;
//             font-size: 26px; font-weight: 900; color: #fff;
//             letter-spacing: -0.5px;
//             flex-shrink: 0;
//             box-shadow: 0 4px 24px rgba(0,0,0,0.4);
//           }
//           .ph-desktop-name-block {
//             padding-bottom: 4px;
//           }
//           .ph-desktop-name {
//             font-size: 22px; font-weight: 900;
//             letter-spacing: -0.5px;
//             color: #fff;
//             margin-bottom: 3px; line-height: 1.2;
//             text-shadow: 0 1px 8px rgba(0,0,0,0.4);
//           }
//           .ph-desktop-email {
//             font-size: 12px;
//             color: rgba(255,255,255,0.65);
//             margin-bottom: 8px;
//           }
//           .ph-desktop-chips {
//             display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
//           }
//           .ph-desktop-chip {
//             padding: 3px 10px; border-radius: 20px;
//             font-size: 11px; font-weight: 700;
//             display: inline-flex; align-items: center; gap: 4px;
//             backdrop-filter: blur(8px);
//             -webkit-backdrop-filter: blur(8px);
//           }
//           .ph-desktop-chip-role {
//             background: rgba(255,255,255,0.18);
//             color: #fff;
//             border: 1px solid rgba(255,255,255,0.28);
//           }
//           .ph-desktop-chip-premium {
//             background: rgba(192,38,211,0.25);
//             color: #f0abfc;
//             border: 1px solid rgba(192,38,211,0.4);
//           }

//           /* Banner needs relative positioning for absolute children */
//           .ph-banner { position: relative; }
//         }

//         /* ================================================
//            SMALL MOBILE TWEAKS
//         ================================================ */
//         @media (max-width: 400px) {
//           .ph-edit-row { grid-template-columns: 1fr; }
//           .ph-avatar { width: 66px; height: 66px; font-size: 20px; }
//           .ph-name { font-size: 17px; }
//           .ph-banner { height: 110px; }
//           .ph-avatar-wrap { margin-top: -33px; }
//         }
//       `}</style>

//       <ToastContainer toasts={toasts} />

//       <div className="ph-page-wrap">

//         {/* ── HERO CARD ── */}
//         <div className="ph-card">

//           {/* Banner */}
//           <div className="ph-banner">

//             {/* Edit button — always visible */}
//             <button className="ph-banner-btn" onClick={() => setEditMode(e => !e)}>
//               {editMode ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit Profile</>}
//             </button>

//             {/* Desktop identity — lives inside banner */}
//             <div className="ph-desktop-identity">
//               <div className="ph-desktop-avatar">{initials}</div>
//               <div className="ph-desktop-name-block">
//                 <div className="ph-desktop-name">{displayName}</div>
//                 <div className="ph-desktop-email">{user?.email}</div>
//                 <div className="ph-desktop-chips">
//                   <span className="ph-desktop-chip ph-desktop-chip-role">
//                     <RoleIcon size={10} strokeWidth={2.2} /> {roleLabel}
//                   </span>
//                   {isMe && (
//                     <span className="ph-desktop-chip ph-desktop-chip-premium">
//                       <Star size={10} strokeWidth={2.2} /> Premium
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//           </div>

//           {/* Mobile avatar — overlaps banner, hidden on desktop */}
//           <div className="ph-avatar-wrap">
//             <div className="ph-avatar">{initials}</div>
//           </div>

//           {/* Mobile name/email/chips — hidden on desktop */}
//           <div className="ph-identity">
//             <div className="ph-name">{displayName}</div>
//             <div className="ph-email">{user?.email}</div>
//             <div className="ph-chips">
//               <span className="ph-chip ph-chip-role">
//                 <RoleIcon size={10} strokeWidth={2.2} /> {roleLabel}
//               </span>
//               {isMe && (
//                 <span className="ph-chip ph-chip-premium">
//                   <Star size={10} strokeWidth={2.2} /> Premium
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Stats strip — same on both */}
//           <div className="ph-stats">
//             {[
//               {
//                 val: (
//                   <>{streak.current_streak}<Zap size={13} color="var(--warning)" fill="var(--warning)" /></>
//                 ),
//                 lbl: 'Day Streak',
//               },
//               { val: `${streak.longest_streak}d`, lbl: 'Best Streak' },
//               {
//                 val: form.field_of_study ? form.field_of_study.split(' ')[0] : roleLabel,
//                 lbl: form.field_of_study ? 'Focus' : 'Role',
//               },
//               { val: form.username ? `@${form.username}` : '—', lbl: 'Handle' },
//             ].map((s, i) => (
//               <div key={i} className="ph-stat">
//                 <div className="ph-stat-val">{s.val}</div>
//                 <div className="ph-stat-lbl">{s.lbl}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── EDIT FORM ── */}
//         {editMode && (
//           <div className="ph-edit">
//             <div className="ph-edit-head"><Pencil size={13} /> Editing Profile</div>
//             <div className="ph-edit-body">
//               <div className="ph-edit-row">
//                 <div>
//                   <label className="ph-field-lbl">Full Name</label>
//                   <input className="input" value={form.full_name}
//                     onChange={update('full_name')} placeholder="Your full name" />
//                 </div>
//                 <div>
//                   <label className="ph-field-lbl">Username</label>
//                   <input className="input" value={form.username}
//                     onChange={update('username')} placeholder="@handle" />
//                 </div>
//               </div>
//               <div>
//                 <label className="ph-field-lbl">Field of Study / Expertise</label>
//                 <input className="input" value={form.field_of_study}
//                   onChange={update('field_of_study')}
//                   placeholder="e.g. Cloud Engineering, Data Science" />
//               </div>
//               <div>
//                 <label className="ph-field-lbl">Bio</label>
//                 <textarea className="input" value={form.bio} onChange={update('bio')}
//                   placeholder="Tell your mentor or mentees about yourself..."
//                   style={{ minHeight: 85 }} />
//               </div>
//             </div>
//             <div className="ph-edit-foot">
//               <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
//               <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── ABOUT ── */}
//         {!editMode && (
//           <div className="ph-about">
//             <div className="ph-about-head">
//               <span className="ph-about-label">About</span>
//               <button className="ph-about-edit" onClick={() => setEditMode(true)}>
//                 Edit <ArrowRight size={11} />
//               </button>
//             </div>
//             <div className="ph-about-body">
//               {form.bio
//                 ? <p className="ph-bio-text">{form.bio}</p>
//                 : <span className="ph-bio-empty">
//                     No bio yet — add one to introduce yourself to your {roleMentor ? 'mentees' : 'mentor'}.
//                   </span>
//               }
//             </div>
//           </div>
//         )}

//         {/* ── MENTORSHIP CARDS ── */}
//         {(showMenteesCard || showMentorCard) && (
//           <div
//             className="ph-mship-grid"
//             style={{ gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr' }}
//           >
//             {showMenteesCard && (
//               <div className="ph-mship-card purple" onClick={() => setSubPage('mentees')}>
//                 <div className="ph-mship-icon dark">
//                   <Users size={19} color="#fff" strokeWidth={1.8} />
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div className="ph-mship-title" style={{ color: '#fff' }}>My Mentees</div>
//                   <div className="ph-mship-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>
//                     Track progress & AI summaries
//                   </div>
//                 </div>
//                 <ArrowRight size={15} color="rgba(255,255,255,0.5)" />
//               </div>
//             )}
//             {showMentorCard && (
//               <div className="ph-mship-card" onClick={() => setSubPage('mentor')}>
//                 <div className="ph-mship-icon light">
//                   <Target size={19} color="var(--accent)" strokeWidth={1.8} />
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div className="ph-mship-title">My Mentor</div>
//                   <div className="ph-mship-sub" style={{ color: 'var(--text-muted)' }}>
//                     View connection status
//                   </div>
//                 </div>
//                 <ArrowRight size={15} color="var(--text-muted)" />
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── SETTINGS ── */}
//         <div className="ph-settings">

//           <div className="ph-section">
//             <div className="ph-section-head">Account</div>
//             {[
//               {
//                 lbl: 'Email', val: user?.email,
//                 badge: (
//                   <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
//                     <CheckCircle size={10} /> Verified
//                   </span>
//                 ),
//               },
//               {
//                 lbl: 'Account Type', val: roleLabel,
//                 badge: (
//                   <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
//                     <RoleIcon size={10} /> {roleLabel}
//                   </span>
//                 ),
//               },
//             ].map((item, i) => (
//               <div key={i} className="ph-account-row">
//                 <div style={{ minWidth: 0 }}>
//                   <div className="ph-account-lbl">{item.lbl}</div>
//                   <div className="ph-account-val">{item.val}</div>
//                 </div>
//                 {item.badge}
//               </div>
//             ))}
//           </div>

//           <div className="ph-role-blurb" style={{
//             background: isMe ? 'linear-gradient(135deg,#F59E0B10,#C026D310)' : 'var(--accent-soft)',
//             border: `1px solid ${isMe ? '#C026D328' : 'var(--border)'}`,
//           }}>
//             <div className="ph-role-icon-wrap" style={{
//               background: isMe ? '#C026D318' : 'var(--accent-soft)',
//               border: `1px solid ${isMe ? '#C026D330' : 'var(--border)'}`,
//             }}>
//               {isMe
//                 ? <Star size={16} color="#C026D3" strokeWidth={1.8} />
//                 : roleMentor
//                 ? <Target size={16} color="var(--accent)" strokeWidth={1.8} />
//                 : <BookOpen size={16} color="var(--accent)" strokeWidth={1.8} />
//               }
//             </div>
//             <div>
//               <div style={{
//                 fontSize: 12, fontWeight: 800, marginBottom: 3,
//                 color: isMe ? '#C026D3' : 'var(--accent)',
//               }}>
//                 {isMe ? 'S / Y A N  Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
//               </div>
//               <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
//                 {isMe
//                   ? 'Full access to all Dôti features — mentee tracking, mentor connection, and premium tools.'
//                   : roleMentor
//                   ? 'Mentees connect using your email. Their logs arrive for your review and sign-off.'
//                   : 'Add a mentor by email. They receive your logs and sign off on your progress.'}
//               </p>
//             </div>
//           </div>

//           <ChangePasswordSection />

//           <div className="ph-danger">
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>
//                 Sign Out
//               </div>
//               <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                 You'll be returned to the login screen.
//               </div>
//             </div>
//             <button
//               className="btn btn-secondary btn-sm"
//               onClick={signOut}
//               style={{
//                 color: 'var(--danger)', borderColor: 'var(--danger-soft)',
//                 flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
//               }}
//             >
//               <LogOut size={13} /> Sign Out
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
// CHANGE PASSWORD (Accordion)
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
    <div style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--surface)' }}>
      <button
        onClick={() => setShow(s => !s)}
        style={{
          width: '100%', background: 'var(--surface-2)',
          border: 'none', cursor: 'pointer',
          padding: '14px 16px',
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
          size={14} color="var(--text-muted)"
          style={{ transform: show ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {show && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['newPassword', 'confirm'].map((field, i) => (
            <div key={field}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                display: 'block', marginBottom: 6,
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
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
      </div>
    </div>
  )

  if (!mentor) return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Target size={44} strokeWidth={1.2} color="var(--text-muted)"
          style={{ marginBottom: 14, opacity: 0.35 }} />
        <h3 style={{ marginBottom: 8 }}>No mentor connected yet</h3>
        <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
          Go to your home page and use the "Add a Mentor" card.
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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
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
            padding: '12px 16px', borderRadius: 10,
            background: 'var(--surface-2)', marginBottom: 12,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5,
            }}>About</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {mp.bio}
            </p>
          </div>
        )}

        <div style={{
          padding: '12px 16px', borderRadius: 10, background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'flex-start', gap: 9,
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          <ClipboardList size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
          Your daily logs are sent to this mentor for review and sign-off.
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

  // ── Sub-page navigation ──
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

  // ── GLOBAL STYLES ──
  const globalStyles = `
    .profile-page {
      background: linear-gradient(150deg, #ffffff 0%, #f4f0ff 60%, #e8deff 100%);
    }
    html[data-theme="dark"] .profile-page {
      background: linear-gradient(150deg, #0d0a14 0%, #150f24 60%, #1e1535 100%);
    }

    .ph-banner {
      position: relative;
      background:
        radial-gradient(ellipse 80% 120% at 0% 60%, #7C3AED 0%, transparent 55%),
        radial-gradient(ellipse 60% 100% at 40% -10%, #A855F7 0%, transparent 50%),
        radial-gradient(ellipse 60% 80% at 100% 40%, #06B6D4 0%, transparent 55%),
        radial-gradient(ellipse 55% 70% at 65% 110%, #F59E0B 0%, transparent 50%),
        radial-gradient(ellipse 40% 50% at 85% 90%, #EC4899 0%, transparent 45%),
        #0f0720;
    }

    .ph-card {
      border-radius: 20px;
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 16px;
      background: var(--surface);
    }

    .ph-banner { height: 130px; }
    .ph-banner-btn {
      position: absolute;
      top: 12px; right: 12px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 9px;
      padding: 6px 13px;
      color: #fff;
      font-family: Urbanist, sans-serif;
      font-size: 12px; font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: background 0.15s;
      z-index: 2;
    }
    .ph-banner-btn:hover { background: rgba(255,255,255,0.26); }

    .ph-avatar-wrap {
      padding: 0 20px;
      margin-top: -36px;
      position: relative;
      z-index: 3;
    }
    .ph-avatar {
      width: 76px; height: 76px;
      border-radius: 50%;
      background: linear-gradient(145deg, #6D28D9 0%, #9333EA 100%);
      border: 4px solid var(--surface);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 900; color: #fff;
      letter-spacing: -0.5px;
      box-shadow: 0 4px 20px rgba(109,40,217,0.45);
    }

    .ph-identity { padding: 10px 20px 18px 20px; }
    .ph-name {
      font-size: 20px; font-weight: 900;
      letter-spacing: -0.4px; color: var(--text-primary);
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

    .ph-desktop-identity { display: none; }

    .ph-stats { display: flex; border-top: 1px solid var(--border); }
    .ph-stat {
      flex: 1; padding: 13px 8px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .ph-stat:last-child { border-right: none; }
    .ph-stat-val {
      font-size: 17px; font-weight: 900;
      color: var(--text-primary); margin-bottom: 3px;
      display: flex; align-items: center; justify-content: center; gap: 4px; line-height: 1;
    }
    .ph-stat-lbl {
      font-size: 9px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.9px;
    }

    .ph-about {
      border-radius: 14px; border: 1px solid var(--border);
      overflow: hidden; margin-bottom: 16px; background: var(--surface);
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
      display: inline-flex; alignItems: center; gap: 3px;
    }
    .ph-about-body { padding: 14px 16px; }
    .ph-bio-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin: 0; }
    .ph-bio-empty { font-size: 13px; color: var(--text-muted); font-style: italic; }

    .ph-edit {
      border-radius: 14px; border: 1px solid var(--accent);
      overflow: hidden; margin-bottom: 16px; background: var(--surface);
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

    .ph-mship-grid { display: grid; gap: 11px; margin-bottom: 16px; }
    .ph-mship-card {
      border-radius: 14px; padding: 16px 18px; cursor: pointer;
      display: flex; align-items: center; gap: 14px;
      border: 1px solid var(--border); background: var(--surface-2);
      transition: transform 0.13s, box-shadow 0.13s;
    }
    .ph-mship-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.07); }
    .ph-mship-card.purple { background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%); border: none; }
    .ph-mship-icon {
      width: 40px; height: 40px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ph-mship-icon.dark { background: rgba(255,255,255,0.14); }
    .ph-mship-icon.light { background: var(--accent-soft); }
    .ph-mship-title { font-size: 13px; font-weight: 800; margin-bottom: 1px; }
    .ph-mship-sub { font-size: 12px; line-height: 1.4; }

    .ph-settings { display: flex; flex-direction: column; gap: 11px; margin-bottom: 16px; }
    .ph-section {
      border-radius: 14px; border: 1px solid var(--border);
      overflow: hidden; background: var(--surface);
    }
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
    .ph-account-val { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
    .ph-role-blurb {
      border-radius: 14px; padding: 14px 16px;
      display: flex; gap: 12px; align-items: flex-start;
    }
    .ph-role-icon-wrap {
      width: 34px; height: 34px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ph-danger {
      border-radius: 14px; border: 1px solid var(--danger-soft);
      padding: 14px 16px; background: var(--surface);
      display: flex; align-items: center;
      justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }

    @media (min-width: 768px) {
      .ph-page-wrap { max-width: 780px; margin: 0 auto; }
      .ph-banner { height: 200px; }
      .ph-avatar-wrap { display: none; }
      .ph-identity { display: none; }
      .ph-desktop-identity {
        display: flex; align-items: flex-end;
        gap: 20px; position: absolute;
        bottom: 22px; left: 24px; right: 140px; z-index: 3;
      }
      .ph-desktop-avatar {
        width: 80px; height: 80px; border-radius: 50%;
        background: linear-gradient(145deg, #6D28D9 0%, #9333EA 100%);
        border: 4px solid rgba(255,255,255,0.15);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; font-weight: 900; color: #fff;
        letter-spacing: -0.5px; flex-shrink: 0;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      }
      .ph-desktop-name-block { padding-bottom: 4px; }
      .ph-desktop-name {
        font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
        color: #fff; margin-bottom: 3px; line-height: 1.2;
        text-shadow: 0 1px 8px rgba(0,0,0,0.4);
      }
      .ph-desktop-email { font-size: 12px; color: rgba(255,255,255,0.65); margin-bottom: 8px; }
      .ph-desktop-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
      .ph-desktop-chip {
        padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 700;
        display: inline-flex; align-items: center; gap: 4px;
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      }
      .ph-desktop-chip-role { background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.28); }
      .ph-desktop-chip-premium { background: rgba(192,38,211,0.25); color: #f0abfc; border: 1px solid rgba(192,38,211,0.4); }
      .ph-banner { position: relative; }
    }

    @media (max-width: 400px) {
      .ph-edit-row { grid-template-columns: 1fr; }
      .ph-avatar { width: 66px; height: 66px; font-size: 20px; }
      .ph-name { font-size: 17px; }
      .ph-banner { height: 110px; }
      .ph-avatar-wrap { margin-top: -33px; }
    }
  `

  return (
    <div className="profile-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '40px 0 80px 0',
      width: '100%',
      overflowY: 'auto'
    }}>
      <style>{globalStyles}</style>
      <ToastContainer toasts={toasts} />

      <div className="ph-page-wrap">

        {/* ── HERO CARD ── */}
        <div className="ph-card">
          <div className="ph-banner">
            <button className="ph-banner-btn" onClick={() => setEditMode(e => !e)}>
              {editMode ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit Profile</>}
            </button>

            {/* Desktop identity */}
            <div className="ph-desktop-identity">
              <div className="ph-desktop-avatar">{initials}</div>
              <div className="ph-desktop-name-block">
                <div className="ph-desktop-name">{displayName}</div>
                <div className="ph-desktop-email">{user?.email}</div>
                <div className="ph-desktop-chips">
                  <span className="ph-desktop-chip ph-desktop-chip-role">
                    <RoleIcon size={10} strokeWidth={2.2} /> {roleLabel}
                  </span>
                  {isMe && (
                    <span className="ph-desktop-chip ph-desktop-chip-premium">
                      <Star size={10} strokeWidth={2.2} /> Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile avatar */}
          <div className="ph-avatar-wrap">
            <div className="ph-avatar">{initials}</div>
          </div>

          {/* Mobile identity */}
          <div className="ph-identity">
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

          {/* Stats strip */}
          <div className="ph-stats">
            {[
              {
                val: (
                  <>{streak.current_streak}<Zap size={13} color="var(--warning)" fill="var(--warning)" /></>
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
        </div>

        {/* ── EDIT FORM ── */}
        {editMode && (
          <div className="ph-edit">
            <div className="ph-edit-head"><Pencil size={13} /> Editing Profile</div>
            <div className="ph-edit-body">
              <div className="ph-edit-row">
                <div>
                  <label className="ph-field-lbl">Full Name</label>
                  <input className="input" value={form.full_name} onChange={update('full_name')} placeholder="Your full name" />
                </div>
                <div>
                  <label className="ph-field-lbl">Username</label>
                  <input className="input" value={form.username} onChange={update('username')} placeholder="@handle" />
                </div>
              </div>
              <div>
                <label className="ph-field-lbl">Field of Study / Expertise</label>
                <input className="input" value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Cloud Engineering, Data Science" />
              </div>
              <div>
                <label className="ph-field-lbl">Bio</label>
                <textarea className="input" value={form.bio} onChange={update('bio')} placeholder="Tell your mentor or mentees about yourself..." style={{ minHeight: 85 }} />
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

        {/* ── ABOUT ── */}
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
                : <span className="ph-bio-empty">No bio yet — add one to introduce yourself.</span>
              }
            </div>
          </div>
        )}

        {/* ── MENTORSHIP CARDS ── */}
        {(showMenteesCard || showMentorCard) && (
          <div className="ph-mship-grid" style={{ gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr' }}>
            {showMenteesCard && (
              <div className="ph-mship-card purple" onClick={() => setSubPage('mentees')}>
                <div className="ph-mship-icon dark"><Users size={19} color="#fff" strokeWidth={1.8} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ph-mship-title" style={{ color: '#fff' }}>My Mentees</div>
                  <div className="ph-mship-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Track progress & AI summaries</div>
                </div>
                <ArrowRight size={15} color="rgba(255,255,255,0.5)" />
              </div>
            )}
            {showMentorCard && (
              <div className="ph-mship-card" onClick={() => setSubPage('mentor')}>
                <div className="ph-mship-icon light"><Target size={19} color="var(--accent)" strokeWidth={1.8} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ph-mship-title">My Mentor</div>
                  <div className="ph-mship-sub" style={{ color: 'var(--text-muted)' }}>View connection status</div>
                </div>
                <ArrowRight size={15} color="var(--text-muted)" />
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        <div className="ph-settings">
          <div className="ph-section">
            <div className="ph-section-head">Account</div>
            {[
              { lbl: 'Email', val: user?.email, badge: <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} /> Verified</span> },
              { lbl: 'Account Type', val: roleLabel, badge: <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RoleIcon size={10} /> {roleLabel}</span> },
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
              {isMe ? <Star size={16} color="#C026D3" strokeWidth={1.8} /> : roleMentor ? <Target size={16} color="var(--accent)" strokeWidth={1.8} /> : <BookOpen size={16} color="var(--accent)" strokeWidth={1.8} />}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3, color: isMe ? '#C026D3' : 'var(--accent)' }}>
                {isMe ? 'S / Y A N  Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {isMe ? 'Full access to all Dôti features.' : roleMentor ? 'Mentees connect using your email.' : 'Add a mentor by email to get started.'}
              </p>
            </div>
          </div>

          <ChangePasswordSection />

          <div className="ph-danger">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>Sign Out</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You'll be returned to the login screen.</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={signOut} style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}