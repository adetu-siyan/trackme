import { useEffect, useState } from 'react'
import { menteeApi, weeklyFocusApi } from '../lib/api'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const CATEGORY_COLORS = {
  Backend:  { bg: '#EDE9FE', color: '#7C3AED' },
  Frontend: { bg: '#E0F2FE', color: '#0369A1' },
  Database: { bg: '#FEF3C7', color: '#D97706' },
  'AI/ML':  { bg: '#D1FAE5', color: '#059669' },
  DevOps:   { bg: '#FCE7F3', color: '#DB2777' },
  Reading:  { bg: '#F3F4F6', color: '#6B7280' },
  Writing:  { bg: '#FFF7ED', color: '#C2410C' },
  Other:    { bg: '#F5F3FF', color: '#7C3AED' },
}

function catStyle(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other
}

export default function MenteeDetail({ mentee, onBack }) {
  const [overview, setOverview] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const [currentFocus, setCurrentFocus] = useState(null)
  const [focusTasks, setFocusTasks] = useState([])
  const [focusLoading, setFocusLoading] = useState(true)
  const [showFocusInput, setShowFocusInput] = useState(false)
  const [focusInput, setFocusInput] = useState('')
  const [creatingFocus, setCreatingFocus] = useState(false)
  const [focusResult, setFocusResult] = useState(null)

  // Review state — two step: preview then send
  const [sendingReview, setSendingReview] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewPreview, setReviewPreview] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const profile = mentee.profile || {}
  const stats = mentee.stats || {}
  const streak = mentee.streak || {}

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          menteeApi.getOverview(mentee.mentee_id),
          menteeApi.getLogs(mentee.mentee_id),
        ])
        setOverview(overviewRes)
        setLogs(logsRes.logs || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mentee.mentee_id])

  useEffect(() => {
    async function loadFocus() {
      try {
        const res = await weeklyFocusApi.getMenteeFocus(mentee.mentee_id)
        setCurrentFocus(res.focus)
        setFocusTasks(res.tasks || [])
      } catch (e) {
        console.error(e)
      } finally {
        setFocusLoading(false)
      }
    }
    loadFocus()
  }, [mentee.mentee_id])

  async function handleCreateFocus() {
    if (!focusInput.trim()) return
    setCreatingFocus(true)
    try {
      const res = await weeklyFocusApi.create({
        mentee_id: mentee.mentee_id,
        raw_input: focusInput,
      })
      setFocusResult(res)
      setShowFocusInput(false)
      setFocusInput('')
      const updated = await weeklyFocusApi.getMenteeFocus(mentee.mentee_id)
      setCurrentFocus(updated.focus)
      setFocusTasks(updated.tasks || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setCreatingFocus(false)
    }
  }

  // Step 1: generate preview, show to mentor
  async function handlePreviewReview() {
    if (!currentFocus) return
    setSendingReview(true)
    try {
      const res = await weeklyFocusApi.getReviewPreview(currentFocus.id)
      setReviewPreview(res)
      setShowReviewModal(true)
    } catch (e) {
      alert(e.message)
    } finally {
      setSendingReview(false)
    }
  }

  // Step 2: mentor approves, send to mentee
  async function handleConfirmSendReview() {
    setSendingReview(true)
    try {
      await weeklyFocusApi.sendReview(currentFocus.id)
      setReviewSent(true)
      setShowReviewModal(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSendingReview(false)
    }
  }

  const completedTasks = focusTasks.filter(t => t.completed)
  const pendingTasks = focusTasks.filter(t => !t.completed)
  const completionRate = focusTasks.length > 0
    ? Math.round((completedTasks.length / focusTasks.length) * 100)
    : 0
  const barColor = completionRate >= 80
    ? 'var(--success)' : completionRate >= 50
    ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="page">
      <style>{`
        .mentee-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .focus-tasks-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 768px) {
          .focus-tasks-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Back + Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
            fontSize: 14, fontWeight: 600, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          }}
        >
          ← Back to Mentees
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h1 style={{ marginBottom: 4 }}>{profile.full_name}</h1>
              <p className="text-muted" style={{ fontSize: 14 }}>
                {profile.field_of_study || 'No field set'}
                {profile.bio && ` · ${profile.bio}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setShowFocusInput(true)}>
              📅 Set Weekly Focus
            </button>
            {currentFocus && (
              <button
                className="btn btn-secondary"
                onClick={handlePreviewReview}
                disabled={sendingReview || reviewSent}
              >
                {reviewSent ? '✅ Review Sent' : sendingReview ? 'Generating...' : '📊 Preview & Send Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Set Weekly Focus Modal */}
      {showFocusInput && (
        <div className="modal-overlay" onClick={() => setShowFocusInput(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>Set Weekly Focus</h2>
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Write what you want {profile.full_name?.split(' ')[0] || 'your mentee'} to focus on this week.
                  AI will break it into tasks.
                </p>
              </div>
              <button
                onClick={() => setShowFocusInput(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}
              >×</button>
            </div>

            <textarea
              className="input"
              style={{ minHeight: 160, lineHeight: 1.7, marginBottom: 16 }}
              placeholder={`Example:\n"This week focus on completing the TxGuard ML pipeline. Finish the Random Forest model, validate PR-AUC above 0.8, and write documentation for the feature engineering steps."`}
              value={focusInput}
              onChange={e => setFocusInput(e.target.value)}
              autoFocus
            />

            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--accent-soft)', marginBottom: 20,
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              🤖 AI will cross-reference {profile.full_name?.split(' ')[0]}'s recent logs and any incomplete tasks from last week.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowFocusInput(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleCreateFocus}
                disabled={creatingFocus || !focusInput.trim()}
              >
                {creatingFocus
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating tasks...</>
                  : '✨ Generate Weekly Plan →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus result toast */}
      {focusResult && (
        <div style={{
          background: 'var(--success-soft)', border: '1px solid var(--success)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 2 }}>
              Weekly plan created!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {focusResult.task_count} tasks generated
              {focusResult.carried_over_count > 0 && ` · ${focusResult.carried_over_count} carried over from last week`}
              · Summary: "{focusResult.summary}"
            </div>
          </div>
          <button
            onClick={() => setFocusResult(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
          >×</button>
        </div>
      )}

      {/* Stats */}
      <div className="mentee-stats-grid">
        {[
          { emoji: '📝', label: 'Total Logs', value: stats.total_logs || 0 },
          { emoji: '✍️', label: 'Signed', value: stats.signed_logs || 0 },
          { emoji: '📊', label: 'Sign Rate', value: `${stats.sign_rate || 0}%` },
          { emoji: '🔥', label: 'Streak', value: streak.current_streak || 0 },
          { emoji: '🏆', label: 'Best Streak', value: streak.longest_streak || 0 },
          { emoji: '🕐', label: 'Most Active', value: overview?.stats?.most_active_time || (loading ? '...' : '—') },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Focus Panel */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>📅 This Week's Focus</h3>
          {currentFocus && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {currentFocus.week_start} → {currentFocus.week_end}
            </span>
          )}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {focusLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
            </div>
          ) : !currentFocus ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>No weekly focus set for this week yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowFocusInput(true)}>
                Set This Week's Focus
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  {currentFocus.summary}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${completionRate}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: barColor, flexShrink: 0 }}>
                    {completedTasks.length}/{focusTasks.length} done
                  </span>
                </div>
              </div>

              <div className="focus-tasks-grid">
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                    Pending ({pendingTasks.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pendingTasks.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All done! 🎉</p>
                    ) : pendingTasks.map(task => (
                      <div key={task.id} style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: task.carried_over ? 'var(--danger-soft)' : 'var(--surface-2)',
                        border: `1px solid ${task.carried_over ? 'var(--danger-soft)' : 'var(--border)'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{task.title}</span>
                          {task.carried_over && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--danger)', background: 'rgba(220,38,38,0.1)', padding: '2px 6px', borderRadius: 4 }}>CARRY</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: catStyle(task.category).bg, color: catStyle(task.category).color }}>{task.category}</span>
                          {task.suggested_time && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>🕐 {task.suggested_time}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                    Completed ({completedTasks.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {completedTasks.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing completed yet.</p>
                    ) : completedTasks.map(task => (
                      <div key={task.id} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--success-soft)', border: '1px solid var(--success-soft)', opacity: 0.8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', textDecoration: 'line-through', marginBottom: 4 }}>{task.title}</div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: catStyle(task.category).bg, color: catStyle(task.category).color }}>{task.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Overview */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <h3>AI Overview</h3>
          <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>
            Powered by Groq
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[60, 40, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 8 }} />
            ))}
          </div>
        ) : overview?.ai_overview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Focus Areas</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(overview.ai_overview.focus_areas || []).map((area, i) => (
                  <span key={i} className="badge badge-accent">{area}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Overview</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{overview.ai_overview.overview}</p>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Activity Pattern</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{overview.ai_overview.activity_pattern}</p>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{overview.ai_overview.recommendations}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted" style={{ fontSize: 14 }}>No overview available yet. Mentee needs more logs.</p>
        )}
      </div>

      {/* Log History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Log History</h3>
        </div>

        {loading ? (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: 14 }}>No logs yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, i) => {
              const isExpanded = expanded === log.id
              const isSigned = log.signed
              const isSent = log.sent_to_mentor

              return (
                <div key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: isSigned ? 'var(--success-soft)' : isSent ? 'var(--warning-soft)' : 'var(--accent-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {isSigned ? '✅' : isSent ? '📬' : '📝'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                        {log.structured_title || 'Untitled Log'}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {(log.structured_topics || []).slice(0, 3).map((t, j) => (
                          <span key={j} style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: isSigned ? 'var(--success-soft)' : isSent ? 'var(--warning-soft)' : 'var(--accent-soft)',
                        color: isSigned ? 'var(--success)' : isSent ? 'var(--warning)' : 'var(--accent)',
                      }}>
                        {isSigned ? 'Signed' : isSent ? 'Sent' : 'Draft'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(log.log_date)}</span>
                    </div>

                    <span style={{ color: 'var(--text-muted)', fontSize: 11, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', display: 'inline-block' }}>▼</span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '16px 24px 20px 74px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                      {log.test_attempted && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, marginBottom: 12,
                          background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)',
                          color: log.test_passed ? 'var(--success)' : 'var(--danger)',
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {log.test_passed ? '✅ Test passed' : '❌ Test not passed'} · {log.difficulty_level}
                        </div>
                      )}
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {log.structured_content || log.raw_content}
                      </p>
                      {isSigned && log.signed_at && (
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                          ✍️ Signed {formatDate(log.signed_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Weekly Review Preview Modal */}
      {showReviewModal && reviewPreview && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            zIndex: 400, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: '32px',
              width: '100%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: 4 }}>Weekly Review Preview</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  This is what {profile.full_name?.split(' ')[0]} will receive. Review before sending.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)' }}
              >×</button>
            </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
                AI Weekly Review · {reviewPreview.week_label || currentFocus?.week_start}
              </div>

              {reviewPreview.summary && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Summary</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.summary}</p>
                </div>
              )}

              {reviewPreview.progress && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Progress</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.progress}</p>
                </div>
              )}

              {reviewPreview.recommendations && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Recommendations</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.recommendations}</p>
                </div>
              )}

              {reviewPreview.next_week_focus && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Next Week</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.next_week_focus}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmSendReview}
                disabled={sendingReview}
              >
                {sendingReview ? 'Sending...' : `✉️ Send to ${profile.full_name?.split(' ')[0]}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}