import { useState, useEffect } from 'react'
import { groupsApi } from '../lib/api'
import { BarChart2, Users, CheckCircle, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

export default function GroupDetail({ group, onBack }) {
  const [tab, setTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loadingDash, setLoadingDash] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [expandedMentee, setExpandedMentee] = useState(null)
  const [menteeReview, setMenteeReview] = useState({})
  const [loadingReview, setLoadingReview] = useState({})
  const [showAddMember, setShowAddMember] = useState(false)
  const [showFocusModal, setShowFocusModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [focusInput, setFocusInput] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [settingFocus, setSettingFocus] = useState(false)
  const [memberError, setMemberError] = useState('')
  const [focusSuccess, setFocusSuccess] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [group.id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function loadDashboard() {
    setLoadingDash(true)
    try {
      const res = await groupsApi.dashboard(group.id)
      setDashboard(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDash(false)
    }
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true)
    try {
      const res = await groupsApi.analytics(group.id)
      setAnalytics(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  function handleTabChange(t) {
    setTab(t)
    if (t === 'analytics' && !analytics) loadAnalytics()
  }

  async function handleAddMember(e) {
    e.preventDefault()
    setAddingMember(true)
    setMemberError('')
    try {
      const res = await groupsApi.addMember(group.id, { mentee_email: memberEmail })
      setMemberEmail('')
      setShowAddMember(false)
      showToast(`${res.mentee.full_name} added to group!`)
      await loadDashboard()
    } catch (e) {
      setMemberError(e.message)
    } finally {
      setAddingMember(false)
    }
  }

  async function handleRemoveMember(menteeId, name) {
    if (!window.confirm(`Remove ${name} from this group?`)) return
    try {
      await groupsApi.removeMember(group.id, menteeId)
      showToast(`${name} removed from group`)
      await loadDashboard()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleSetFocus(e) {
    e.preventDefault()
    setSettingFocus(true)
    try {
      const res = await groupsApi.setWeeklyFocus(group.id, { raw_input: focusInput })
      setFocusSuccess(res)
      setFocusInput('')
      setShowFocusModal(false)
      showToast(`Weekly focus set for ${res.members_updated} mentees!`)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSettingFocus(false)
    }
  }

  async function handleExpandMentee(menteeId) {
    if (expandedMentee === menteeId) {
      setExpandedMentee(null)
      return
    }
    setExpandedMentee(menteeId)
    if (!menteeReview[menteeId]) {
      setLoadingReview(prev => ({ ...prev, [menteeId]: true }))
      try {
        const res = await groupsApi.getMenteeReview(group.id, menteeId)
        setMenteeReview(prev => ({ ...prev, [menteeId]: res }))
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingReview(prev => ({ ...prev, [menteeId]: false }))
      }
    }
  }

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <div className="page">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .mentee-row:hover { background: var(--surface-2) !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.type === 'error' ? 'var(--danger)' : '#059669',
          color: '#fff', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeInUp 0.2s ease',
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
          fontSize: 14, fontWeight: 600, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
        }}
      >
        ← Back to Groups
      </button>

      {/* Group header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-3) 100%)',
        border: '1px solid var(--border)', borderRadius: 16,
        padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.07, borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <h1 style={{ marginBottom: 6, fontSize: 22 }}>{group.name}</h1>
            {group.description && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {group.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddMember(true)}>
              + Add Member
            </button>
            <button className="btn btn-primary" onClick={() => setShowFocusModal(true)}>
              📅 Set Weekly Focus
            </button>
          </div>
        </div>
      </div>

      {/* Focus success banner */}
      {focusSuccess && (
        <div style={{
          background: 'var(--success-soft)', border: '1px solid var(--success)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeInUp 0.2s ease',
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 2 }}>
              Weekly focus set for {focusSuccess.members_updated} mentees!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Week of {focusSuccess.week_start} → {focusSuccess.week_end}
            </div>
          </div>
          <button
            onClick={() => setFocusSuccess(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
          >×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-2)', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
              fontSize: 14, fontWeight: 600, transition: 'all 0.18s',
              background: tab === t.id ? 'var(--surface)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ─────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div>
          {loadingDash ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
          ) : dashboard ? (
            <div>
              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 12, marginBottom: 24,
              }}>
                {[
                  { emoji: '👥', label: 'Members', value: dashboard.stats.total_members },
                  { emoji: '📝', label: 'Logged Today', value: dashboard.stats.logged_today, color: dashboard.stats.logged_today > 0 ? 'var(--success)' : 'var(--text-primary)' },
                  { emoji: '✍️', label: 'Signed Today', value: dashboard.stats.signed_today, color: dashboard.stats.signed_today > 0 ? 'var(--success)' : 'var(--text-primary)' },
                  { emoji: '🔥', label: 'Active Streaks', value: dashboard.stats.active_streaks },
                  { emoji: '📊', label: 'Log Rate', value: `${dashboard.stats.log_rate_today}%`, color: dashboard.stats.log_rate_today >= 80 ? 'var(--success)' : dashboard.stats.log_rate_today >= 50 ? 'var(--warning)' : 'var(--danger)' },
                ].map((stat, i) => (
                  <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.emoji}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: stat.color || 'var(--accent)', marginBottom: 4 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mentee list */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>Group Members</h3>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {dashboard.mentees.length} mentee{dashboard.mentees.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {dashboard.mentees.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>No members yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
                      + Add First Member
                    </button>
                  </div>
                ) : (
                  <div>
                    {dashboard.mentees.map((m, i) => {
                      const isExpanded = expandedMentee === m.mentee_id
                      const review = menteeReview[m.mentee_id]
                      const isLoadingReview = loadingReview[m.mentee_id]
                      const initials = m.profile.full_name
                        ? m.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : '?'

                      return (
                        <div key={m.mentee_id} style={{ borderBottom: i < dashboard.mentees.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          {/* Row */}
                          <div
                            className="mentee-row"
                            onClick={() => handleExpandMentee(m.mentee_id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '14px 20px', cursor: 'pointer',
                              background: 'transparent', transition: 'background 0.15s',
                            }}
                          >
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                            }}>
                              {initials}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                                {m.profile.full_name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {m.profile.field_of_study || 'No field set'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                                background: m.has_logged_today ? 'var(--success-soft)' : 'var(--danger-soft)',
                                color: m.has_logged_today ? 'var(--success)' : 'var(--danger)',
                              }}>
                                {m.has_logged_today ? '✓ Logged' : '✗ Not logged'}
                              </span>

                              {m.has_signed_today && (
                                <span style={{
                                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                                  background: 'var(--success-soft)', color: 'var(--success)',
                                }}>
                                  ✍️ Signed
                                </span>
                              )}

                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {m.streak.current_streak}🔥
                              </span>

                              <button
                                onClick={e => { e.stopPropagation(); handleRemoveMember(m.mentee_id, m.profile.full_name) }}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: 'var(--text-muted)', fontSize: 16, padding: '0 4px',
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                ×
                              </button>

                              <span style={{
                                color: 'var(--text-muted)', fontSize: 11,
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.18s', display: 'inline-block',
                              }}>▼</span>
                            </div>
                          </div>

                          {/* Expanded dropdown */}
                          {isExpanded && (
                            <div style={{
                              background: 'var(--surface-2)',
                              borderTop: '1px solid var(--border)',
                              padding: '20px',
                              animation: 'fadeIn 0.15s ease',
                            }}>
                              {isLoadingReview ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {[80, 60, 90, 70].map((w, i) => (
                                    <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 8 }} />
                                  ))}
                                </div>
                              ) : review ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                  {/* AI signals */}
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {review.ai_overview?.consistency_signal && (
                                      <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                                        background: review.ai_overview.consistency_signal === 'Strong' ? 'var(--success-soft)' : review.ai_overview.consistency_signal === 'Moderate' ? 'var(--accent-soft)' : 'var(--danger-soft)',
                                        color: review.ai_overview.consistency_signal === 'Strong' ? 'var(--success)' : review.ai_overview.consistency_signal === 'Moderate' ? 'var(--accent)' : 'var(--danger)',
                                      }}>
                                        🔄 {review.ai_overview.consistency_signal}
                                      </span>
                                    )}
                                    {review.ai_overview?.learning_depth_pattern && (
                                      <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                                        background: 'var(--surface)', color: 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                      }}>
                                        📈 {review.ai_overview.learning_depth_pattern}
                                      </span>
                                    )}
                                  </div>

                                  {/* Overview */}
                                  {review.ai_overview?.overview && (
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                      {review.ai_overview.overview}
                                    </p>
                                  )}

                                  {/* Risk flags */}
                                  {review.ai_overview?.risk_flags?.length > 0 && (
                                    <div style={{ background: 'var(--danger-soft)', borderRadius: 10, padding: '12px 16px' }}>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                                        ⚠ Risk Flags
                                      </div>
                                      {review.ai_overview.risk_flags.map((f, i) => (
                                        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0' }}>· {f}</div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Recent logs */}
                                  {review.recent_logs?.length > 0 && (
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                                        Recent Logs
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {review.recent_logs.slice(0, 5).map(log => (
                                          <div key={log.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '8px 12px', borderRadius: 8,
                                            background: 'var(--surface)', border: '1px solid var(--border)',
                                          }}>
                                            <span style={{ fontSize: 14 }}>
                                              {log.signed ? '✅' : log.sent_to_mentor ? '📬' : '📝'}
                                            </span>
                                            <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {log.structured_title || 'Untitled'}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                                              {log.log_date}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-muted" style={{ fontSize: 13 }}>No data available.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div>
          {loadingAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Compiling AI analysis for all mentees...
                </p>
              </div>
            </div>
          ) : !analytics ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <h3 style={{ marginBottom: 8 }}>No analytics yet</h3>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
                Add members and let them log before running analytics.
              </p>
              <button className="btn btn-primary" onClick={loadAnalytics}>
                Run Analytics
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Group summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Total Members', value: analytics.group_summary.total_members, emoji: '👥' },
                  { label: 'Avg Sign Rate', value: `${analytics.group_summary.avg_sign_rate}%`, emoji: '✍️', color: analytics.group_summary.avg_sign_rate >= 70 ? 'var(--success)' : analytics.group_summary.avg_sign_rate >= 40 ? 'var(--warning)' : 'var(--danger)' },
                  { label: 'Avg Streak', value: `${analytics.group_summary.avg_streak}🔥`, emoji: '📊' },
                  { label: 'At Risk', value: analytics.group_summary.at_risk_count, emoji: '⚠️', color: analytics.group_summary.at_risk_count > 0 ? 'var(--danger)' : 'var(--success)' },
                  { label: 'Doing Well', value: analytics.group_summary.doing_well_count, emoji: '🌟', color: 'var(--success)' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{s.emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.color || 'var(--accent)', marginBottom: 4 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign rate chart */}
              <div className="card">
                <h3 style={{ marginBottom: 4 }}>Sign Rate by Mentee</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Percentage of logs signed by mentor
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.mentees.map(m => ({
                    name: m.profile.full_name?.split(' ')[0] || 'Unknown',
                    rate: m.stats.sign_rate,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                    <Bar dataKey="rate" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Sign Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Streak chart */}
              <div className="card">
                <h3 style={{ marginBottom: 4 }}>Current Streaks</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Consecutive logging days per mentee
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.mentees.map(m => ({
                    name: m.profile.full_name?.split(' ')[0] || 'Unknown',
                    streak: m.streak.current_streak,
                    best: m.streak.longest_streak,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                    <Bar dataKey="streak" fill="#059669" radius={[6, 6, 0, 0]} name="Current Streak" />
                    <Bar dataKey="best" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Best Streak" opacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mentee performance list */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h3>Individual Performance</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Sorted by those who need most attention first
                  </p>
                </div>

                {analytics.mentees.map((m, i) => {
                  const signal = m.ai_summary.consistency_signal
                  const signalColor = signal === 'Strong' ? 'var(--success)' : signal === 'Moderate' ? 'var(--accent)' : 'var(--danger)'
                  const signalBg = signal === 'Strong' ? 'var(--success-soft)' : signal === 'Moderate' ? 'var(--accent-soft)' : 'var(--danger-soft)'
                  const initials = m.profile.full_name
                    ? m.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?'

                  return (
                    <div key={m.mentee_id} style={{
                      padding: '16px 20px',
                      borderBottom: i < analytics.mentees.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                            {m.profile.full_name}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: signalBg, color: signalColor }}>
                              {signal}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                              {m.ai_summary.learning_depth_pattern}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: m.stats.sign_rate >= 70 ? 'var(--success)' : m.stats.sign_rate >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                            {m.stats.sign_rate}%
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>SIGN RATE</div>
                        </div>
                      </div>

                      {/* Overview */}
                      {m.ai_summary.overview && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>
                          {m.ai_summary.overview}
                        </p>
                      )}

                      {/* Risk + Strengths */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {m.ai_summary.risk_flags?.length > 0 && (
                          <div style={{ background: 'var(--danger-soft)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                              ⚠ Risks
                            </div>
                            {m.ai_summary.risk_flags.slice(0, 2).map((f, j) => (
                              <div key={j} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>· {f}</div>
                            ))}
                          </div>
                        )}
                        {m.ai_summary.strength_signals?.length > 0 && (
                          <div style={{ background: 'var(--success-soft)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                              ✓ Strengths
                            </div>
                            {m.ai_summary.strength_signals.slice(0, 2).map((s, j) => (
                              <div key={j} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>· {s}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recommendations */}
                      {m.ai_summary.recommendations && (
                        <div style={{
                          marginTop: 10, background: 'var(--accent-soft)',
                          borderRadius: 8, padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                            Recommendations
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            {m.ai_summary.recommendations}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Re-run */}
              <button
                className="btn btn-secondary"
                onClick={() => { setAnalytics(null); loadAnalytics() }}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={13} />
                Re-run Analysis
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ADD MEMBER MODAL ─────────────────────────────────────────────── */}
      {showAddMember && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAddMember(false)}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 6 }}>Add Member</h2>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 24 }}>
              Enter the email of one of your active mentees to add them to this group.
            </p>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                className="input"
                type="email"
                placeholder="mentee@email.com"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                required
                autoFocus
              />

              {memberError && (
                <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {memberError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingMember}>
                  {addingMember ? 'Adding...' : 'Add Member →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SET WEEKLY FOCUS MODAL ───────────────────────────────────────── */}
      {showFocusModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowFocusModal(false)}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 6 }}>Set Group Weekly Focus</h2>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
              This will generate a personalized weekly plan for <strong>every member</strong> of this group based on your input.
            </p>
            <div style={{ background: 'var(--accent-soft)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              🤖 AI will cross-reference each mentee's recent logs and carry over any incomplete tasks from last week.
            </div>

            <form onSubmit={handleSetFocus} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea
                className="input"
                style={{ minHeight: 140, lineHeight: 1.7 }}
                placeholder={`Describe this week's focus for the group...\n\nExample: "This week focus on completing the REST API module. Everyone should implement authentication, build at least 3 endpoints, and write unit tests."`}
                value={focusInput}
                onChange={e => setFocusInput(e.target.value)}
                required
                autoFocus
              />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFocusModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={settingFocus || !focusInput.trim()}>
                  {settingFocus
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating plans...</>
                    : `✨ Set Focus for ${dashboard?.stats?.total_members || 0} Members →`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}