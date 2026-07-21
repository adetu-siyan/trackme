import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileApi, mentorApi } from '../lib/api'
import { useToast, ToastContainer } from '../hooks/useToast'
import MenteeDashboard from './MenteeDashboard'
import MenteeDetail from './MenteeDetail'

const PREMIUM_EMAIL = 'adetumosgad@gmail.com'

// ============================================================
// CHANGE PASSWORD
// ============================================================
function ChangePasswordSection() {
  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

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
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <h4 style={{ marginBottom: 4 }}>Change Password</h4>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
        Use a strong password with at least 8 characters.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
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
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 16, marginBottom: 20, flexWrap: 'wrap',
        }}>
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
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {mp.field_of_study}
              </div>
            )}
          </div>
          <span className="badge badge-success" style={{ flexShrink: 0 }}>✓ Connected</span>
        </div>

        {mp.bio && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'var(--surface-2)', marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
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
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          📋 Your daily logs are sent to this mentor for review and sign-off.
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

  const [subPage, setSubPage] = useState(null)
  const [selectedMentee, setSelectedMentee] = useState(null)

  const isMe = user?.email?.toLowerCase() === PREMIUM_EMAIL
  const roleMentor = profile?.role === 'mentor'
  const roleMentee = profile?.role === 'mentee'
  const showMenteesCard = roleMentor || isMe
  const showMentorCard = roleMentee || isMe
  const roleLabel = roleMentor ? '🎯 Mentor' : '📚 Mentee'

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
          ← Back to Profile
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
          ← Back to Profile
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
          {[100, 140, 220, 120].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Main ───────────────────────────────────────────────────

  return (
    <div className="page">
      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .profile-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .profile-hero-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .profile-streak-box {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-form-grid { grid-template-columns: 1fr; }
          .profile-streak-box { width: 100%; }
        }
        @media (max-width: 480px) {
          .profile-hero-inner { gap: 14px; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div style={{
        marginBottom: 24,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <h1>Profile</h1>
        <button
          className="btn btn-secondary btn-sm"
          onClick={signOut}
          style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
        >
          Sign Out
        </button>
      </div>

      {/* Hero card */}
      <div className="card" style={{
        marginBottom: 20, padding: '24px 28px',
        background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
        border: 'none', color: '#fff',
      }}>
        <div className="profile-hero-inner">
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            flexShrink: 0, letterSpacing: '-1px',
          }}>
            {initials}
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3, letterSpacing: '-0.3px' }}>
              {form.full_name || 'Add your name'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
              {user?.email}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff',
              }}>
                {roleLabel}
              </span>
              {isMe && (
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11,
                  fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  ⭐ Premium
                </span>
              )}
            </div>
          </div>

          {/* Streak */}
          <div className="profile-streak-box">
            {[
              { label: 'Streak', value: `${streak.current_streak} 🔥` },
              { label: 'Best', value: `${streak.longest_streak}d` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '14px 20px', textAlign: 'center',
                borderRight: i === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mentorship cards */}
      {(showMenteesCard || showMentorCard) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showMenteesCard && showMentorCard ? '1fr 1fr' : '1fr',
          gap: 14, marginBottom: 20,
        }}>
          {showMenteesCard && (
            <div
              className="card card-clickable"
              onClick={() => setSubPage('mentees')}
              style={{
                background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
                border: 'none', color: '#fff',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ fontSize: 28 }}>👥</div>
              <div>
                <h3 style={{ color: '#fff', marginBottom: 4, fontSize: 16 }}>My Mentees</h3>
                <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                  View mentees, track progress, read AI summaries.
                </p>
              </div>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                alignSelf: 'flex-start',
              }}>
                Open Dashboard →
              </span>
            </div>
          )}

          {showMentorCard && (
            <div
              className="card card-clickable"
              onClick={() => setSubPage('mentor')}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ fontSize: 28 }}>🎯</div>
              <div>
                <h3 style={{ marginBottom: 4, fontSize: 16 }}>My Mentor</h3>
                <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                  View your mentor and connection status.
                </p>
              </div>
              <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>
                View →
              </span>
            </div>
          )}
        </div>
      )}

      {/* Two column layout */}
      <div className="profile-grid">

        {/* Left — Personal Details */}
        <div className="card">
          <h3 style={{ marginBottom: 18 }}>Personal Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="profile-form-grid">
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input className="input" value={form.full_name} onChange={update('full_name')} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Username
                </label>
                <input className="input" value={form.username} onChange={update('username')} placeholder="@handle" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Field of Study / Expertise
              </label>
              <input className="input" value={form.field_of_study} onChange={update('field_of_study')} placeholder="e.g. Cloud Engineering, Data Science" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Bio
              </label>
              <textarea
                className="input" value={form.bio} onChange={update('bio')}
                placeholder="Tell your mentor or mentees about yourself..."
                style={{ minHeight: 90 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Account info */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Email', value: user?.email, badge: { text: 'Verified', cls: 'badge-success' } },
                { label: 'Account Type', value: roleMentor ? 'Mentor' : 'Mentee', badge: { text: roleLabel, cls: 'badge-accent' } },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 14px', background: 'var(--surface-2)',
                  borderRadius: 10, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.value}
                    </div>
                  </div>
                  <span className={`badge ${item.badge.cls}`} style={{ flexShrink: 0 }}>
                    {item.badge.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role explanation */}
          <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>
              {isMe ? '⭐' : roleMentor ? '🎯' : '📚'}
            </div>
            <h4 style={{ marginBottom: 6, color: 'var(--accent)', fontSize: 14 }}>
              {isMe ? 'S / Y A N Premium' : roleMentor ? 'You are a Mentor' : 'You are a Mentee'}
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isMe
                ? 'Full access to all Trackme features — mentee tracking, mentor connection, and premium tools.'
                : roleMentor
                ? 'Mentees connect using your email. Their logs arrive for your review and sign-off.'
                : 'Add a mentor by email. They receive your logs and sign off on your progress.'}
            </p>
          </div>

          {/* Change password */}
          <ChangePasswordSection />

          {/* Sign out */}
          <div className="card" style={{ border: '1px solid var(--danger-soft)' }}>
            <h4 style={{ marginBottom: 6, color: 'var(--danger)' }}>Sign Out</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              You will be returned to the login screen.
            </p>
            <button
              className="btn btn-secondary"
              onClick={signOut}
              style={{
                color: 'var(--danger)', borderColor: 'var(--danger-soft)',
                width: '100%', justifyContent: 'center',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}