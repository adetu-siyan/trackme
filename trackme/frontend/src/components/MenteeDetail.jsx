import { useEffect, useState } from 'react'
import { menteeApi, weeklyFocusApi } from '../lib/api'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function MentorTaskCard({ task, onSaveNote, onSaveEdit, focusTasks, setFocusTasks }) {
  const [expanded, setExpanded] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const [noteValue, setNoteValue] = useState(task.mentor_note || '')
  const [savingNote, setSavingNote] = useState(false)
  const [editingTask, setEditingTask] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleSaveNote() {
    setSavingNote(true)
    try {
      await onSaveNote(task.id, noteValue)
      setEditingNote(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingNote(false)
    }
  }

  async function handleSaveEdit() {
    setSavingEdit(true)
    try {
      await onSaveEdit(task.id, { title: editTitle, description: editDescription })
      setEditingTask(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${task.carried_over ? 'rgba(220,38,38,0.25)' : 'var(--border)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      opacity: task.completed ? 0.75 : 1,
      transition: 'all 0.18s',
    }}>
      {/* Main row */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        {/* Completion badge */}
        <div style={{
          fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2,
          color: task.completed ? 'var(--success)' : 'var(--text-muted)',
          background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
          padding: '3px 8px', borderRadius: 20,
          border: `1px solid ${task.completed ? 'var(--success-soft)' : 'var(--border)'}`,
          whiteSpace: 'nowrap',
        }}>
          {task.completed ? '✅ Done' : '⬜ Pending'}
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => !editingTask && setExpanded(v => !v)}
        >
          {editingTask ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="input"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 14, fontWeight: 600 }}
                autoFocus
              />
              <textarea
                className="input"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 12, minHeight: 60, lineHeight: 1.5 }}
                placeholder="Description (optional)"
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editTitle.trim()}
                  style={{
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 8,
                    padding: '6px 14px', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    fontFamily: 'Urbanist, sans-serif',
                  }}
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingTask(false)
                    setEditTitle(task.title)
                    setEditDescription(task.description || '')
                  }}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    fontSize: 12, color: 'var(--text-muted)',
                    fontFamily: 'Urbanist, sans-serif',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                fontWeight: 600, fontSize: 14, marginBottom: 4,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              }}>
                {task.title}
                {task.carried_over && !task.completed && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: 'var(--danger)', background: 'var(--danger-soft)',
                    padding: '2px 6px', borderRadius: 4,
                  }}>CARRY-OVER</span>
                )}
                {task.mentor_note && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: 'var(--accent)', background: 'var(--accent-soft)',
                    padding: '2px 6px', borderRadius: 4,
                  }}>📌 NOTE</span>
                )}
              </div>
              {task.description && (
                <p style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.5, margin: '0 0 6px',
                }}>
                  {task.description}
                </p>
              )}
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {expanded ? '▲ less' : '▼ more'}
              </div>
            </>
          )}
        </div>

        {/* Edit task button */}
        {!editingTask && (
          <button
            onClick={e => {
              e.stopPropagation()
              setEditingTask(true)
              setExpanded(true)
            }}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-muted)',
              fontFamily: 'Urbanist, sans-serif', fontWeight: 600,
              flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Expanded — mentor note */}
      {expanded && !editingTask && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 18px',
          background: 'var(--surface-2)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
            }}>
              📌 Mentor Note
            </div>
            {editingNote ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  className="input"
                  value={noteValue}
                  onChange={e => setNoteValue(e.target.value)}
                  placeholder="Add a note for your mentee about this task..."
                  style={{ minHeight: 80, fontSize: 13, lineHeight: 1.6 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    style={{
                      background: 'var(--accent)', color: '#fff',
                      border: 'none', borderRadius: 8,
                      padding: '7px 16px', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      fontFamily: 'Urbanist, sans-serif',
                    }}
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingNote(false)
                      setNoteValue(task.mentor_note || '')
                    }}
                    style={{
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                      fontSize: 12, color: 'var(--text-muted)',
                      fontFamily: 'Urbanist, sans-serif',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditingNote(true)}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: noteValue ? 'var(--accent-soft)' : 'var(--surface)',
                  border: `1px dashed ${noteValue ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', fontSize: 13,
                  color: noteValue ? 'var(--text-secondary)' : 'var(--text-muted)',
                  lineHeight: 1.6, transition: 'all 0.15s',
                }}
              >
                {noteValue || '+ Click to add a note for your mentee...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
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

  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryValue, setSummaryValue] = useState('')
  const [savingSummary, setSavingSummary] = useState(false)

  const [sendingReview, setSendingReview] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewPreview, setReviewPreview] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(false)

  const [toast, setToast] = useState(null)

  const profile = mentee.profile || {}
  const stats = mentee.stats || {}
  const streak = mentee.streak || {}
  const ai = overview?.ai_overview || null

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  function showToast(msg, type = 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

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
        setSummaryValue(res.focus?.edited_summary || res.focus?.summary || '')
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
      setSummaryValue(updated.focus?.edited_summary || updated.focus?.summary || '')
    } catch (e) {
      showToast(e.message || 'Failed to create focus')
    } finally {
      setCreatingFocus(false)
    }
  }

  async function handleSaveSummary() {
    if (!currentFocus) return
    setSavingSummary(true)
    try {
      await weeklyFocusApi.updateFocusSummary(currentFocus.id, summaryValue)
      setCurrentFocus(prev => ({ ...prev, edited_summary: summaryValue }))
      setEditingSummary(false)
      showToast('Summary updated', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update summary')
    } finally {
      setSavingSummary(false)
    }
  }

  async function handleSaveNote(taskId, note) {
    await weeklyFocusApi.addMentorNote(taskId, note)
    setFocusTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, mentor_note: note } : t)
    )
  }

  async function handleSaveEdit(taskId, fields) {
    await weeklyFocusApi.updateTaskContent(taskId, fields)
    setFocusTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, ...fields } : t)
    )
  }

  async function handlePreviewReview() {
    if (!currentFocus) return
    setSendingReview(true)
    try {
      const res = await weeklyFocusApi.getReviewPreview(currentFocus.id)
      setReviewPreview(res)
      setShowReviewModal(true)
    } catch (e) {
      showToast(e.message || 'Failed to generate preview')
    } finally {
      setSendingReview(false)
    }
  }

  async function handleConfirmSendReview() {
    setSendingReview(true)
    try {
      await weeklyFocusApi.sendReview(currentFocus.id, reviewPreview)
      setReviewSent(true)
      setShowReviewModal(false)
      setEditingReview(false)
      showToast('Review sent successfully!', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to send review')
    } finally {
      setSendingReview(false)
    }
  }

  const completedTasks = focusTasks.filter(t => t.completed)
  const pendingTasks = focusTasks.filter(t => !t.completed)
  const completionRate = focusTasks.length > 0
    ? Math.round((completedTasks.length / focusTasks.length) * 100) : 0
  const barColor = completionRate >= 80
    ? 'var(--success)' : completionRate >= 50
    ? 'var(--warning)' : 'var(--danger)'

  const displaySummary = currentFocus?.edited_summary || currentFocus?.summary || ''

  return (
    <div className="page">
      <style>{`
        .mentee-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
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
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.msg}
        </div>
      )}

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

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
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

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowFocusInput(true)}
            >
              📅 Set Weekly Focus
            </button>
            {currentFocus && (
              <button
                className="btn btn-secondary"
                onClick={handlePreviewReview}
                disabled={sendingReview || reviewSent}
              >
                {reviewSent ? '✅ Review Sent'
                  : sendingReview ? '⏳ Generating...'
                  : '📊 Preview & Send Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Set Weekly Focus Modal */}
      {showFocusInput && (
        <div className="modal-overlay" onClick={() => setShowFocusInput(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>Set Weekly Focus</h2>
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Write what you want {profile.full_name?.split(' ')[0] || 'your mentee'} to
                  focus on this week.
                </p>
              </div>
              <button
                onClick={() => setShowFocusInput(false)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)',
                }}
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
              🤖 AI will cross-reference {profile.full_name?.split(' ')[0]}'s recent logs
              and any incomplete tasks from last week.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowFocusInput(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateFocus}
                disabled={creatingFocus || !focusInput.trim()}
              >
                {creatingFocus
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
                  : '✨ Generate Weekly Plan →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus result banner */}
      {focusResult && (
        <div style={{
          background: 'var(--success-soft)', border: '1px solid var(--success)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeInUp 0.2s ease',
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 2 }}>
              Weekly plan created!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {focusResult.task_count} tasks generated
              {focusResult.carried_over_count > 0 && ` · ${focusResult.carried_over_count} carried over`}
              {focusResult.summary && ` · "${focusResult.summary}"`}
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
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Focus Panel */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
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
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />
              ))}
            </div>
          ) : !currentFocus ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>
                No weekly focus set for this week yet.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowFocusInput(true)}>
                Set This Week's Focus
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Summary + edit */}
              <div>
                {editingSummary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <textarea
                      className="input"
                      value={summaryValue}
                      onChange={e => setSummaryValue(e.target.value)}
                      style={{ fontSize: 14, minHeight: 60, lineHeight: 1.5 }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={handleSaveSummary}
                        disabled={savingSummary || !summaryValue.trim()}
                        style={{
                          background: 'var(--accent)', color: '#fff',
                          border: 'none', borderRadius: 8,
                          padding: '7px 16px', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                          fontFamily: 'Urbanist, sans-serif',
                        }}
                      >
                        {savingSummary ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSummary(false)
                          setSummaryValue(currentFocus.edited_summary || currentFocus.summary)
                        }}
                        style={{
                          background: 'none', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                          fontSize: 12, color: 'var(--text-muted)',
                          fontFamily: 'Urbanist, sans-serif',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.6 }}>
                      {displaySummary}
                    </p>
                    <button
                      onClick={() => setEditingSummary(true)}
                      style={{
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                        fontSize: 11, color: 'var(--text-muted)',
                        fontFamily: 'Urbanist, sans-serif', fontWeight: 600,
                        flexShrink: 0, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent)'
                        e.currentTarget.style.color = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    flex: 1, height: 6,
                    background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${completionRate}%`,
                      background: barColor, borderRadius: 3, transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: barColor, flexShrink: 0 }}>
                    {completedTasks.length}/{focusTasks.length} done
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {focusTasks.map(task => (
                  <MentorTaskCard
                    key={task.id}
                    task={task}
                    onSaveNote={handleSaveNote}
                    onSaveEdit={handleSaveEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Mentor Overview */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <h3>AI Mentor Overview</h3>
          <span style={{
            marginLeft: 'auto', padding: '3px 10px', borderRadius: 20,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            fontSize: 11, fontWeight: 700,
          }}>
            Powered by Groq
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[60, 40, 80, 60, 40].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 8 }} />
            ))}
          </div>
        ) : ai ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ai.consistency_signal && (
                <div style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: ai.consistency_signal === 'Strong' ? 'var(--success-soft)'
                    : ai.consistency_signal === 'Moderate' ? 'var(--accent-soft)' : 'var(--danger-soft)',
                  color: ai.consistency_signal === 'Strong' ? 'var(--success)'
                    : ai.consistency_signal === 'Moderate' ? 'var(--accent)' : 'var(--danger)',
                }}>
                  🔄 {ai.consistency_signal}
                </div>
              )}
              {ai.learning_depth_pattern && (
                <div style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: 'var(--surface-2)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  📈 {ai.learning_depth_pattern}
                </div>
              )}
            </div>

            {ai.focus_areas?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Focus Areas
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ai.focus_areas.map((area, i) => (
                    <span key={i} className="badge badge-accent">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {ai.overview && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Overview
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                  {ai.overview}
                </p>
              </div>
            )}

            {ai.activity_pattern && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
                  Activity Pattern
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {ai.activity_pattern}
                </p>
              </div>
            )}

            {(ai.risk_flags?.length > 0 || ai.strength_signals?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ai.risk_flags?.length > 0 && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--danger-soft)', border: '1px solid rgba(220,38,38,0.15)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
                      ⚠ Risk Flags
                    </div>
                    {ai.risk_flags.map((flag, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', lineHeight: 1.5, borderBottom: i < ai.risk_flags.length - 1 ? '1px solid rgba(220,38,38,0.1)' : 'none' }}>
                        · {flag}
                      </div>
                    ))}
                  </div>
                )}
                {ai.strength_signals?.length > 0 && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--success-soft)', border: '1px solid rgba(5,150,105,0.15)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
                      ✓ Strengths
                    </div>
                    {ai.strength_signals.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', lineHeight: 1.5, borderBottom: i < ai.strength_signals.length - 1 ? '1px solid rgba(5,150,105,0.1)' : 'none' }}>
                        · {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {ai.recommendations && (
              <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Recommendations for You
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                  {ai.recommendations}
                </p>
              </div>
            )}

            {ai.session_agenda?.length > 0 && (
              <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                  📋 Next Session Agenda
                </div>
                {ai.session_agenda.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < ai.session_agenda.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted" style={{ fontSize: 14 }}>
            No overview available yet — mentee needs more logs.
          </p>
        )}
      </div>

      {/* Log History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3>Log History</h3>
        </div>

        {loading ? (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
            ))}
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
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s',
                    }}
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
                          <span key={j} style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            {t}
                          </span>
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
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatDate(log.log_date)}
                      </span>
                    </div>

                    <span style={{
                      color: 'var(--text-muted)', fontSize: 11,
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.18s', display: 'inline-block',
                    }}>▼</span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: '16px 24px 20px 74px',
                      background: 'var(--surface-2)',
                      borderTop: '1px solid var(--border)',
                      animation: 'fadeIn 0.15s ease',
                    }}>
                      {log.test_attempted && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, marginBottom: 12,
                          background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)',
                          color: log.test_passed ? 'var(--success)' : 'var(--danger)',
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {log.test_passed ? '✅ Test passed' : '❌ Test not passed'}
                          {log.difficulty_level && ` · ${log.difficulty_level}`}
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

      {/* Weekly Review Modal */}
      {showReviewModal && reviewPreview && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setShowReviewModal(false); setEditingReview(false) }}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.2s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: 4 }}>Weekly Review Preview</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  {editingReview
                    ? `Editing — changes will be sent to ${profile.full_name?.split(' ')[0] || 'mentee'}`
                    : `This is what ${profile.full_name?.split(' ')[0] || 'your mentee'} will receive.`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setEditingReview(v => !v)}
                  style={{
                    background: editingReview ? 'var(--accent-soft)' : 'var(--surface-2)',
                    border: `1px solid ${editingReview ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                    fontFamily: 'Urbanist, sans-serif', fontSize: 12, fontWeight: 600,
                    color: editingReview ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {editingReview ? '👁 Preview' : '✏️ Edit'}
                </button>
                <button
                  onClick={() => { setShowReviewModal(false); setEditingReview(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)', lineHeight: 1 }}
                >×</button>
              </div>
            </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 20 }}>
                AI Weekly Review · {reviewPreview.week_label || currentFocus?.week_start}
              </div>

              {editingReview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { key: 'summary', label: 'Summary', color: 'var(--text-muted)' },
                    { key: 'progress', label: 'Progress', color: 'var(--text-muted)' },
                    { key: 'recommendations', label: 'Recommendations', color: 'var(--accent)' },
                    { key: 'next_week_focus', label: 'Next Week', color: 'var(--text-muted)' },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                      <textarea
                        value={reviewPreview[key] || ''}
                        onChange={e => setReviewPreview(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ width: '100%', minHeight: 100, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Urbanist, sans-serif', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'summary', label: 'Summary', color: 'var(--text-muted)' },
                    { key: 'progress', label: 'Progress', color: 'var(--text-muted)' },
                    { key: 'recommendations', label: 'Recommendations', color: 'var(--accent)' },
                    { key: 'next_week_focus', label: 'Next Week', color: 'var(--text-muted)' },
                  ].map(({ key, label, color }) =>
                    reviewPreview[key] ? (
                      <div key={key}>
                        <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview[key]}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {editingReview && '✏️ Your edits will be sent exactly as written'}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => { setShowReviewModal(false); setEditingReview(false) }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleConfirmSendReview} disabled={sendingReview}>
                  {sendingReview ? 'Sending...' : `✉️ Send to ${profile.full_name?.split(' ')[0]}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// import { useEffect, useState } from 'react'
// import { menteeApi, weeklyFocusApi } from '../lib/api'

// function formatDate(dateStr) {
//   if (!dateStr) return '—'
//   return new Date(dateStr).toLocaleDateString('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric'
//   })
// }

// const CATEGORY_COLORS = {
//   Backend:  { bg: '#EDE9FE', color: '#7C3AED' },
//   Frontend: { bg: '#E0F2FE', color: '#0369A1' },
//   Database: { bg: '#FEF3C7', color: '#D97706' },
//   'AI/ML':  { bg: '#D1FAE5', color: '#059669' },
//   DevOps:   { bg: '#FCE7F3', color: '#DB2777' },
//   Reading:  { bg: '#F3F4F6', color: '#6B7280' },
//   Writing:  { bg: '#FFF7ED', color: '#C2410C' },
//   Other:    { bg: '#F5F3FF', color: '#7C3AED' },
// }

// function catStyle(cat) {
//   return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other
// }

// export default function MenteeDetail({ mentee, onBack }) {
//   const [overview, setOverview] = useState(null)
//   const [logs, setLogs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [expanded, setExpanded] = useState(null)

//   const [currentFocus, setCurrentFocus] = useState(null)
//   const [focusTasks, setFocusTasks] = useState([])
//   const [focusLoading, setFocusLoading] = useState(true)
//   const [showFocusInput, setShowFocusInput] = useState(false)
//   const [focusInput, setFocusInput] = useState('')
//   const [creatingFocus, setCreatingFocus] = useState(false)
//   const [focusResult, setFocusResult] = useState(null)

//   const [sendingReview, setSendingReview] = useState(false)
//   const [reviewSent, setReviewSent] = useState(false)
//   const [reviewPreview, setReviewPreview] = useState(null)
//   const [showReviewModal, setShowReviewModal] = useState(false)
//   const [editingReview, setEditingReview] = useState(false)

//   const [toast, setToast] = useState(null)

//   const profile = mentee.profile || {}
//   const stats = mentee.stats || {}
//   const streak = mentee.streak || {}

//   const initials = profile.full_name
//     ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : '?'

//   function showToast(msg, type = 'error') {
//     setToast({ msg, type })
//     setTimeout(() => setToast(null), 4000)
//   }

//   useEffect(() => {
//     async function load() {
//       try {
//         const [overviewRes, logsRes] = await Promise.all([
//           menteeApi.getOverview(mentee.mentee_id),
//           menteeApi.getLogs(mentee.mentee_id),
//         ])
//         setOverview(overviewRes)
//         setLogs(logsRes.logs || [])
//       } catch (e) {
//         console.error(e)
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [mentee.mentee_id])

//   useEffect(() => {
//     async function loadFocus() {
//       try {
//         const res = await weeklyFocusApi.getMenteeFocus(mentee.mentee_id)
//         setCurrentFocus(res.focus)
//         setFocusTasks(res.tasks || [])
//       } catch (e) {
//         console.error(e)
//       } finally {
//         setFocusLoading(false)
//       }
//     }
//     loadFocus()
//   }, [mentee.mentee_id])

//   async function handleCreateFocus() {
//     if (!focusInput.trim()) return
//     setCreatingFocus(true)
//     try {
//       const res = await weeklyFocusApi.create({
//         mentee_id: mentee.mentee_id,
//         raw_input: focusInput,
//       })
//       setFocusResult(res)
//       setShowFocusInput(false)
//       setFocusInput('')
//       const updated = await weeklyFocusApi.getMenteeFocus(mentee.mentee_id)
//       setCurrentFocus(updated.focus)
//       setFocusTasks(updated.tasks || [])
//     } catch (e) {
//       showToast(e.message || 'Failed to create focus')
//     } finally {
//       setCreatingFocus(false)
//     }
//   }

//   async function handlePreviewReview() {
//     if (!currentFocus) return
//     setSendingReview(true)
//     try {
//       const res = await weeklyFocusApi.getReviewPreview(currentFocus.id)
//       setReviewPreview(res)
//       setShowReviewModal(true)
//     } catch (e) {
//       showToast(e.message || 'Failed to generate preview')
//     } finally {
//       setSendingReview(false)
//     }
//   }

//   async function handleConfirmSendReview() {
//     setSendingReview(true)
//     try {
//       await weeklyFocusApi.sendReview(currentFocus.id, reviewPreview)
//       setReviewSent(true)
//       setShowReviewModal(false)
//       setEditingReview(false)
//       showToast('Review sent successfully!', 'success')
//     } catch (e) {
//       showToast(e.message || 'Failed to send review')
//     } finally {
//       setSendingReview(false)
//     }
//   }

//   const completedTasks = focusTasks.filter(t => t.completed)
//   const pendingTasks = focusTasks.filter(t => !t.completed)
//   const completionRate = focusTasks.length > 0
//     ? Math.round((completedTasks.length / focusTasks.length) * 100)
//     : 0
//   const barColor = completionRate >= 80
//     ? 'var(--success)' : completionRate >= 50
//     ? 'var(--warning)' : 'var(--danger)'

//   const ai = overview?.ai_overview || null

//   return (
//     <div className="page">
//       <style>{`
//         .mentee-stats-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
//           gap: 12px;
//           margin-bottom: 20px;
//         }
//         .focus-tasks-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 12px;
//         }
//         @media (max-width: 768px) {
//           .focus-tasks-grid { grid-template-columns: 1fr; }
//         }
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(8px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//       `}</style>

//       {/* Toast */}
//       {toast && (
//         <div style={{
//           position: 'fixed', bottom: 24, right: 24, zIndex: 999,
//           padding: '12px 20px', borderRadius: 12,
//           background: toast.type === 'error' ? 'var(--danger)' : '#059669',
//           color: '#fff', fontSize: 14, fontWeight: 600,
//           boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
//           display: 'flex', alignItems: 'center', gap: 10,
//           animation: 'fadeInUp 0.2s ease',
//         }}>
//           <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
//           {toast.msg}
//         </div>
//       )}

//       {/* Back + Header */}
//       <div style={{ marginBottom: 28 }}>
//         <button
//           onClick={onBack}
//           style={{
//             background: 'none', border: 'none', cursor: 'pointer',
//             color: 'var(--accent)', fontFamily: 'Urbanist, sans-serif',
//             fontSize: 14, fontWeight: 600, padding: 0,
//             display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
//           }}
//         >
//           ← Back to Mentees
//         </button>

//         <div style={{
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//             <div style={{
//               width: 64, height: 64, borderRadius: '50%',
//               background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
//             }}>
//               {initials}
//             </div>
//             <div>
//               <h1 style={{ marginBottom: 4 }}>{profile.full_name}</h1>
//               <p className="text-muted" style={{ fontSize: 14 }}>
//                 {profile.field_of_study || 'No field set'}
//                 {profile.bio && ` · ${profile.bio}`}
//               </p>
//             </div>
//           </div>

//           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//             <button
//               className="btn btn-secondary"
//               onClick={() => setShowFocusInput(true)}
//             >
//               📅 Set Weekly Focus
//             </button>
//             {currentFocus && (
//               <button
//                 className="btn btn-secondary"
//                 onClick={handlePreviewReview}
//                 disabled={sendingReview || reviewSent}
//               >
//                 {reviewSent
//                   ? '✅ Review Sent'
//                   : sendingReview
//                   ? '⏳ Generating...'
//                   : '📊 Preview & Send Review'}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Set Weekly Focus Modal */}
//       {showFocusInput && (
//         <div
//           className="modal-overlay"
//           onClick={() => setShowFocusInput(false)}
//         >
//           <div
//             className="modal"
//             onClick={e => e.stopPropagation()}
//             style={{ maxWidth: 580 }}
//           >
//             <div style={{
//               display: 'flex', justifyContent: 'space-between',
//               alignItems: 'center', marginBottom: 20,
//             }}>
//               <div>
//                 <h2 style={{ marginBottom: 4 }}>Set Weekly Focus</h2>
//                 <p className="text-muted" style={{ fontSize: 13 }}>
//                   Write what you want{' '}
//                   {profile.full_name?.split(' ')[0] || 'your mentee'} to focus
//                   on this week. AI will break it into tasks.
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowFocusInput(false)}
//                 style={{
//                   background: 'none', border: 'none',
//                   cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)',
//                 }}
//               >×</button>
//             </div>

//             <textarea
//               className="input"
//               style={{ minHeight: 160, lineHeight: 1.7, marginBottom: 16 }}
//               placeholder={`Example:\n"This week focus on completing the TxGuard ML pipeline. Finish the Random Forest model, validate PR-AUC above 0.8, and write documentation for the feature engineering steps."`}
//               value={focusInput}
//               onChange={e => setFocusInput(e.target.value)}
//               autoFocus
//             />

//             <div style={{
//               padding: '12px 16px', borderRadius: 10,
//               background: 'var(--accent-soft)', marginBottom: 20,
//               fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
//             }}>
//               🤖 AI will cross-reference{' '}
//               {profile.full_name?.split(' ')[0]}'s recent logs and any
//               incomplete tasks from last week.
//             </div>

//             <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowFocusInput(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleCreateFocus}
//                 disabled={creatingFocus || !focusInput.trim()}
//               >
//                 {creatingFocus
//                   ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating tasks...</>
//                   : '✨ Generate Weekly Plan →'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Focus result toast */}
//       {focusResult && (
//         <div style={{
//           background: 'var(--success-soft)', border: '1px solid var(--success)',
//           borderRadius: 12, padding: '14px 18px', marginBottom: 20,
//           display: 'flex', alignItems: 'center', gap: 12,
//           animation: 'fadeInUp 0.2s ease',
//         }}>
//           <span style={{ fontSize: 20 }}>✅</span>
//           <div style={{ flex: 1 }}>
//             <div style={{
//               fontWeight: 700, fontSize: 14,
//               color: 'var(--success)', marginBottom: 2,
//             }}>
//               Weekly plan created!
//             </div>
//             <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
//               {focusResult.task_count} tasks generated
//               {focusResult.carried_over_count > 0
//                 && ` · ${focusResult.carried_over_count} carried over from last week`}
//               {focusResult.summary && ` · "${focusResult.summary}"`}
//             </div>
//           </div>
//           <button
//             onClick={() => setFocusResult(null)}
//             style={{
//               background: 'none', border: 'none',
//               cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18,
//             }}
//           >×</button>
//         </div>
//       )}

//       {/* Stats */}
//       <div className="mentee-stats-grid">
//         {[
//           { emoji: '📝', label: 'Total Logs', value: stats.total_logs || 0 },
//           { emoji: '✍️', label: 'Signed', value: stats.signed_logs || 0 },
//           { emoji: '📊', label: 'Sign Rate', value: `${stats.sign_rate || 0}%` },
//           { emoji: '🔥', label: 'Streak', value: streak.current_streak || 0 },
//           { emoji: '🏆', label: 'Best Streak', value: streak.longest_streak || 0 },
//           {
//             emoji: '🕐', label: 'Most Active',
//             value: overview?.stats?.most_active_time || (loading ? '...' : '—'),
//           },
//         ].map((stat, i) => (
//           <div
//             key={i}
//             className="card"
//             style={{ textAlign: 'center', padding: '16px 12px' }}
//           >
//             <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.emoji}</div>
//             <div style={{
//               fontSize: 20, fontWeight: 900,
//               color: 'var(--accent)', marginBottom: 4,
//             }}>
//               {stat.value}
//             </div>
//             <div style={{
//               fontSize: 11, color: 'var(--text-muted)',
//               fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
//             }}>
//               {stat.label}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Weekly Focus Panel */}
//       <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
//         <div style={{
//           padding: '20px 24px', borderBottom: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         }}>
//           <h3>📅 This Week's Focus</h3>
//           {currentFocus && (
//             <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//               {currentFocus.week_start} → {currentFocus.week_end}
//             </span>
//           )}
//         </div>

//         <div style={{ padding: '20px 24px' }}>
//           {focusLoading ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {[1, 2, 3].map(i => (
//                 <div
//                   key={i}
//                   className="skeleton"
//                   style={{ height: 52, borderRadius: 10 }}
//                 />
//               ))}
//             </div>
//           ) : !currentFocus ? (
//             <div style={{ textAlign: 'center', padding: '24px 0' }}>
//               <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
//               <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>
//                 No weekly focus set for this week yet.
//               </p>
//               <button
//                 className="btn btn-primary btn-sm"
//                 onClick={() => setShowFocusInput(true)}
//               >
//                 Set This Week's Focus
//               </button>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//               <div>
//                 <p style={{
//                   fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14,
//                 }}>
//                   {currentFocus.summary}
//                 </p>
//                 <div style={{
//                   display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
//                 }}>
//                   <div style={{
//                     flex: 1, height: 6,
//                     background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden',
//                   }}>
//                     <div style={{
//                       height: '100%', width: `${completionRate}%`,
//                       background: barColor, borderRadius: 3,
//                       transition: 'width 0.3s',
//                     }} />
//                   </div>
//                   <span style={{
//                     fontSize: 13, fontWeight: 700,
//                     color: barColor, flexShrink: 0,
//                   }}>
//                     {completedTasks.length}/{focusTasks.length} done
//                   </span>
//                 </div>
//               </div>

//               <div className="focus-tasks-grid">
//                 {/* Pending */}
//                 <div>
//                   <div style={{
//                     fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                     textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
//                   }}>
//                     Pending ({pendingTasks.length})
//                   </div>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     {pendingTasks.length === 0 ? (
//                       <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
//                         All done! 🎉
//                       </p>
//                     ) : pendingTasks.map(task => (
//                       <div
//                         key={task.id}
//                         style={{
//                           padding: '10px 14px', borderRadius: 10,
//                           background: task.carried_over
//                             ? 'var(--danger-soft)' : 'var(--surface-2)',
//                           border: `1px solid ${task.carried_over
//                             ? 'var(--danger-soft)' : 'var(--border)'}`,
//                         }}
//                       >
//                         <div style={{
//                           display: 'flex', alignItems: 'center',
//                           gap: 8, marginBottom: 4,
//                         }}>
//                           <span style={{
//                             fontSize: 13, fontWeight: 600,
//                             color: 'var(--text-primary)', flex: 1,
//                           }}>
//                             {task.title}
//                           </span>
//                           {task.carried_over && (
//                             <span style={{
//                               fontSize: 9, fontWeight: 700,
//                               color: 'var(--danger)',
//                               background: 'rgba(220,38,38,0.1)',
//                               padding: '2px 6px', borderRadius: 4,
//                             }}>
//                               CARRY
//                             </span>
//                           )}
//                         </div>
//                         <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                           <span style={{
//                             fontSize: 10, fontWeight: 600,
//                             padding: '2px 6px', borderRadius: 20,
//                             background: catStyle(task.category).bg,
//                             color: catStyle(task.category).color,
//                           }}>
//                             {task.category}
//                           </span>
//                           {task.suggested_time && (
//                             <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
//                               🕐 {task.suggested_time}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Completed */}
//                 <div>
//                   <div style={{
//                     fontSize: 11, fontWeight: 700, color: 'var(--success)',
//                     textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
//                   }}>
//                     Completed ({completedTasks.length})
//                   </div>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     {completedTasks.length === 0 ? (
//                       <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
//                         Nothing completed yet.
//                       </p>
//                     ) : completedTasks.map(task => (
//                       <div
//                         key={task.id}
//                         style={{
//                           padding: '10px 14px', borderRadius: 10,
//                           background: 'var(--success-soft)',
//                           border: '1px solid var(--success-soft)', opacity: 0.8,
//                         }}
//                       >
//                         <div style={{
//                           fontSize: 13, fontWeight: 600,
//                           color: 'var(--success)',
//                           textDecoration: 'line-through', marginBottom: 4,
//                         }}>
//                           {task.title}
//                         </div>
//                         <span style={{
//                           fontSize: 10, fontWeight: 600,
//                           padding: '2px 6px', borderRadius: 20,
//                           background: catStyle(task.category).bg,
//                           color: catStyle(task.category).color,
//                         }}>
//                           {task.category}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* AI Mentor Overview */}
//       <div className="card" style={{ marginBottom: 20 }}>
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
//         }}>
//           <span style={{ fontSize: 20 }}>🤖</span>
//           <h3>AI Mentor Overview</h3>
//           <span style={{
//             marginLeft: 'auto', padding: '3px 10px', borderRadius: 20,
//             background: 'var(--accent-soft)', color: 'var(--accent)',
//             fontSize: 11, fontWeight: 700,
//           }}>
//             Powered by Groq
//           </span>
//         </div>

//         {loading ? (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//             {[60, 40, 80, 60, 40].map((w, i) => (
//               <div
//                 key={i}
//                 className="skeleton"
//                 style={{ height: 16, width: `${w}%`, borderRadius: 8 }}
//               />
//             ))}
//           </div>
//         ) : ai ? (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//             {/* Signal badges */}
//             <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//               {ai.consistency_signal && (
//                 <div style={{
//                   padding: '6px 14px', borderRadius: 20,
//                   fontSize: 12, fontWeight: 700,
//                   background: ai.consistency_signal === 'Strong'
//                     ? 'var(--success-soft)' : ai.consistency_signal === 'Moderate'
//                     ? 'var(--accent-soft)' : 'var(--danger-soft)',
//                   color: ai.consistency_signal === 'Strong'
//                     ? 'var(--success)' : ai.consistency_signal === 'Moderate'
//                     ? 'var(--accent)' : 'var(--danger)',
//                   border: '1px solid transparent',
//                 }}>
//                   🔄 {ai.consistency_signal}
//                 </div>
//               )}
//               {ai.learning_depth_pattern && (
//                 <div style={{
//                   padding: '6px 14px', borderRadius: 20,
//                   fontSize: 12, fontWeight: 700,
//                   background: 'var(--surface-2)', color: 'var(--text-secondary)',
//                   border: '1px solid var(--border)',
//                 }}>
//                   📈 {ai.learning_depth_pattern}
//                 </div>
//               )}
//             </div>

//             {/* Focus areas */}
//             {ai.focus_areas?.length > 0 && (
//               <div>
//                 <div style={{
//                   fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                   letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8,
//                 }}>
//                   Focus Areas
//                 </div>
//                 <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                   {ai.focus_areas.map((area, i) => (
//                     <span key={i} className="badge badge-accent">{area}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Overview */}
//             {ai.overview && (
//               <div>
//                 <div style={{
//                   fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                   letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8,
//                 }}>
//                   Overview
//                 </div>
//                 <p style={{
//                   fontSize: 14, lineHeight: 1.7,
//                   color: 'var(--text-secondary)', margin: 0,
//                 }}>
//                   {ai.overview}
//                 </p>
//               </div>
//             )}

//             {/* Activity pattern */}
//             {ai.activity_pattern && (
//               <div style={{
//                 padding: '12px 16px', borderRadius: 10,
//                 background: 'var(--surface-2)', border: '1px solid var(--border)',
//               }}>
//                 <div style={{
//                   fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                   letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6,
//                 }}>
//                   Activity Pattern
//                 </div>
//                 <p style={{
//                   fontSize: 13, color: 'var(--text-secondary)',
//                   margin: 0, lineHeight: 1.6,
//                 }}>
//                   {ai.activity_pattern}
//                 </p>
//               </div>
//             )}

//             {/* Risk flags + Strengths */}
//             {(ai.risk_flags?.length > 0 || ai.strength_signals?.length > 0) && (
//               <div style={{
//                 display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
//               }}>
//                 {ai.risk_flags?.length > 0 && (
//                   <div style={{
//                     padding: '14px 16px', borderRadius: 10,
//                     background: 'var(--danger-soft)',
//                     border: '1px solid rgba(220,38,38,0.15)',
//                   }}>
//                     <div style={{
//                       fontSize: 11, fontWeight: 700, color: 'var(--danger)',
//                       letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10,
//                     }}>
//                       ⚠ Risk Flags
//                     </div>
//                     {ai.risk_flags.map((flag, i) => (
//                       <div
//                         key={i}
//                         style={{
//                           fontSize: 12, color: 'var(--text-secondary)',
//                           padding: '5px 0', lineHeight: 1.5,
//                           borderBottom: i < ai.risk_flags.length - 1
//                             ? '1px solid rgba(220,38,38,0.1)' : 'none',
//                         }}
//                       >
//                         · {flag}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {ai.strength_signals?.length > 0 && (
//                   <div style={{
//                     padding: '14px 16px', borderRadius: 10,
//                     background: 'var(--success-soft)',
//                     border: '1px solid rgba(5,150,105,0.15)',
//                   }}>
//                     <div style={{
//                       fontSize: 11, fontWeight: 700, color: 'var(--success)',
//                       letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10,
//                     }}>
//                       ✓ Strengths
//                     </div>
//                     {ai.strength_signals.map((s, i) => (
//                       <div
//                         key={i}
//                         style={{
//                           fontSize: 12, color: 'var(--text-secondary)',
//                           padding: '5px 0', lineHeight: 1.5,
//                           borderBottom: i < ai.strength_signals.length - 1
//                             ? '1px solid rgba(5,150,105,0.1)' : 'none',
//                         }}
//                       >
//                         · {s}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Recommendations */}
//             {ai.recommendations && (
//               <div style={{
//                 padding: '14px 16px', borderRadius: 10,
//                 background: 'var(--accent-soft)', border: '1px solid var(--border)',
//               }}>
//                 <div style={{
//                   fontSize: 11, fontWeight: 700, color: 'var(--accent)',
//                   letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8,
//                 }}>
//                   Recommendations for You
//                 </div>
//                 <p style={{
//                   fontSize: 13, color: 'var(--text-secondary)',
//                   margin: 0, lineHeight: 1.7,
//                 }}>
//                   {ai.recommendations}
//                 </p>
//               </div>
//             )}

//             {/* Session agenda */}
//             {ai.session_agenda?.length > 0 && (
//               <div style={{
//                 padding: '14px 16px', borderRadius: 10,
//                 background: 'var(--surface-2)', border: '1px solid var(--border)',
//               }}>
//                 <div style={{
//                   fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
//                   letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12,
//                 }}>
//                   📋 Next Session Agenda
//                 </div>
//                 {ai.session_agenda.map((item, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       display: 'flex', gap: 12, alignItems: 'flex-start',
//                       padding: '8px 0',
//                       borderBottom: i < ai.session_agenda.length - 1
//                         ? '1px solid var(--border)' : 'none',
//                     }}
//                   >
//                     <span style={{
//                       width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
//                       background: 'var(--accent-soft)', color: 'var(--accent)',
//                       fontSize: 11, fontWeight: 700,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     }}>
//                       {i + 1}
//                     </span>
//                     <span style={{
//                       fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
//                     }}>
//                       {item}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}

//           </div>
//         ) : (
//           <p className="text-muted" style={{ fontSize: 14 }}>
//             No overview available yet — mentee needs more logs.
//           </p>
//         )}
//       </div>

//       {/* Log History */}
//       <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
//         <div style={{
//           padding: '20px 24px', borderBottom: '1px solid var(--border)',
//         }}>
//           <h3>Log History</h3>
//         </div>

//         {loading ? (
//           <div style={{
//             padding: '20px 24px',
//             display: 'flex', flexDirection: 'column', gap: 12,
//           }}>
//             {[1, 2, 3].map(i => (
//               <div
//                 key={i}
//                 className="skeleton"
//                 style={{ height: 60, borderRadius: 10 }}
//               />
//             ))}
//           </div>
//         ) : logs.length === 0 ? (
//           <div style={{ padding: '40px 24px', textAlign: 'center' }}>
//             <p className="text-muted" style={{ fontSize: 14 }}>No logs yet.</p>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column' }}>
//             {logs.map((log, i) => {
//               const isExpanded = expanded === log.id
//               const isSigned = log.signed
//               const isSent = log.sent_to_mentor

//               return (
//                 <div
//                   key={log.id}
//                   style={{
//                     borderBottom: i < logs.length - 1
//                       ? '1px solid var(--border)' : 'none',
//                   }}
//                 >
//                   <div
//                     onClick={() => setExpanded(isExpanded ? null : log.id)}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 14,
//                       padding: '14px 24px', cursor: 'pointer',
//                       transition: 'background 0.15s',
//                     }}
//                     onMouseEnter={e =>
//                       e.currentTarget.style.background = 'var(--surface-2)'
//                     }
//                     onMouseLeave={e =>
//                       e.currentTarget.style.background = 'transparent'
//                     }
//                   >
//                     <div style={{
//                       width: 36, height: 36, borderRadius: 8, flexShrink: 0,
//                       background: isSigned
//                         ? 'var(--success-soft)' : isSent
//                         ? 'var(--warning-soft)' : 'var(--accent-soft)',
//                       display: 'flex', alignItems: 'center',
//                       justifyContent: 'center', fontSize: 16,
//                     }}>
//                       {isSigned ? '✅' : isSent ? '📬' : '📝'}
//                     </div>

//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div style={{
//                         fontWeight: 600, fontSize: 14, marginBottom: 3,
//                       }}>
//                         {log.structured_title || 'Untitled Log'}
//                       </div>
//                       <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
//                         {(log.structured_topics || []).slice(0, 3).map((t, j) => (
//                           <span
//                             key={j}
//                             style={{
//                               background: 'var(--accent-soft)',
//                               color: 'var(--accent)',
//                               padding: '2px 8px', borderRadius: 20,
//                               fontSize: 11, fontWeight: 600,
//                             }}
//                           >
//                             {t}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     <div style={{
//                       display: 'flex', flexDirection: 'column',
//                       alignItems: 'flex-end', gap: 4, flexShrink: 0,
//                     }}>
//                       <span style={{
//                         padding: '3px 8px', borderRadius: 20,
//                         fontSize: 11, fontWeight: 600,
//                         background: isSigned
//                           ? 'var(--success-soft)' : isSent
//                           ? 'var(--warning-soft)' : 'var(--accent-soft)',
//                         color: isSigned
//                           ? 'var(--success)' : isSent
//                           ? 'var(--warning)' : 'var(--accent)',
//                       }}>
//                         {isSigned ? 'Signed' : isSent ? 'Sent' : 'Draft'}
//                       </span>
//                       <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
//                         {formatDate(log.log_date)}
//                       </span>
//                     </div>

//                     <span style={{
//                       color: 'var(--text-muted)', fontSize: 11,
//                       transform: isExpanded ? 'rotate(180deg)' : 'none',
//                       transition: 'transform 0.18s', display: 'inline-block',
//                     }}>
//                       ▼
//                     </span>
//                   </div>

//                   {isExpanded && (
//                     <div style={{
//                       padding: '16px 24px 20px 74px',
//                       background: 'var(--surface-2)',
//                       borderTop: '1px solid var(--border)',
//                       animation: 'fadeIn 0.15s ease',
//                     }}>
//                       {log.test_attempted && (
//                         <div style={{
//                           display: 'inline-flex', alignItems: 'center', gap: 6,
//                           padding: '6px 12px', borderRadius: 8, marginBottom: 12,
//                           background: log.test_passed
//                             ? 'var(--success-soft)' : 'var(--danger-soft)',
//                           color: log.test_passed
//                             ? 'var(--success)' : 'var(--danger)',
//                           fontSize: 12, fontWeight: 600,
//                         }}>
//                           {log.test_passed
//                             ? '✅ Test passed' : '❌ Test not passed'}
//                           {log.difficulty_level && ` · ${log.difficulty_level}`}
//                         </div>
//                       )}
//                       <p style={{
//                         fontSize: 14, lineHeight: 1.8,
//                         color: 'var(--text-secondary)',
//                         whiteSpace: 'pre-wrap', margin: 0,
//                       }}>
//                         {log.structured_content || log.raw_content}
//                       </p>
//                       {isSigned && log.signed_at && (
//                         <div style={{
//                           marginTop: 12, fontSize: 12,
//                           color: 'var(--success)', fontWeight: 600,
//                         }}>
//                           ✍️ Signed {formatDate(log.signed_at)}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* Weekly Review Preview Modal */}
//       {showReviewModal && reviewPreview && (
//         <div
//           style={{
//             position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
//             zIndex: 400, display: 'flex', alignItems: 'center',
//             justifyContent: 'center', padding: 20,
//           }}
//           onClick={() => {
//             setShowReviewModal(false)
//             setEditingReview(false)
//           }}
//         >
//           <div
//             style={{
//               background: 'var(--surface)', borderRadius: 16, padding: '32px',
//               width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
//               display: 'flex', flexDirection: 'column', gap: 20,
//               animation: 'fadeInUp 0.2s ease',
//             }}
//             onClick={e => e.stopPropagation()}
//           >
//             {/* Modal header */}
//             <div style={{
//               display: 'flex', alignItems: 'flex-start',
//               justifyContent: 'space-between', gap: 12,
//             }}>
//               <div>
//                 <h3 style={{ margin: 0, marginBottom: 4 }}>
//                   Weekly Review Preview
//                 </h3>
//                 <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
//                   {editingReview
//                     ? `Editing — changes will be sent to ${profile.full_name?.split(' ')[0] || 'mentee'}`
//                     : `This is what ${profile.full_name?.split(' ')[0] || 'your mentee'} will receive. Review before sending.`}
//                 </p>
//               </div>
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                 <button
//                   onClick={() => setEditingReview(v => !v)}
//                   style={{
//                     background: editingReview
//                       ? 'var(--accent-soft)' : 'var(--surface-2)',
//                     border: `1px solid ${editingReview
//                       ? 'var(--accent)' : 'var(--border)'}`,
//                     borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
//                     fontFamily: 'Urbanist, sans-serif', fontSize: 12,
//                     fontWeight: 600,
//                     color: editingReview ? 'var(--accent)' : 'var(--text-muted)',
//                     transition: 'all 0.15s',
//                   }}
//                 >
//                   {editingReview ? '👁 Preview' : '✏️ Edit'}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowReviewModal(false)
//                     setEditingReview(false)
//                   }}
//                   style={{
//                     background: 'none', border: 'none', cursor: 'pointer',
//                     fontSize: 22, color: 'var(--text-muted)', lineHeight: 1,
//                   }}
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>

//             {/* Review content */}
//             <div style={{
//               background: 'var(--surface-2)', borderRadius: 12,
//               padding: '20px 24px', border: '1px solid var(--border)',
//             }}>
//               <div style={{
//                 fontSize: 11, letterSpacing: 2, fontWeight: 700,
//                 color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 20,
//               }}>
//                 AI Weekly Review ·{' '}
//                 {reviewPreview.week_label || currentFocus?.week_start}
//               </div>

//               {editingReview ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//                   {[
//                     { key: 'summary', label: 'Summary', color: 'var(--text-muted)' },
//                     { key: 'progress', label: 'Progress', color: 'var(--text-muted)' },
//                     { key: 'recommendations', label: 'Recommendations', color: 'var(--accent)' },
//                     { key: 'next_week_focus', label: 'Next Week', color: 'var(--text-muted)' },
//                   ].map(({ key, label, color }) => (
//                     <div key={key}>
//                       <div style={{
//                         fontSize: 12, fontWeight: 700, color,
//                         textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
//                       }}>
//                         {label}
//                       </div>
//                       <textarea
//                         value={reviewPreview[key] || ''}
//                         onChange={e =>
//                           setReviewPreview(prev => ({
//                             ...prev, [key]: e.target.value,
//                           }))
//                         }
//                         style={{
//                           width: '100%', minHeight: 100,
//                           background: 'var(--surface)',
//                           border: '1.5px solid var(--border)',
//                           borderRadius: 10, padding: '12px 14px',
//                           color: 'var(--text-primary)', fontSize: 14,
//                           fontFamily: 'Urbanist, sans-serif', lineHeight: 1.7,
//                           resize: 'vertical', outline: 'none',
//                           boxSizing: 'border-box', transition: 'border-color 0.15s',
//                         }}
//                         onFocus={e =>
//                           e.currentTarget.style.borderColor = 'var(--accent)'
//                         }
//                         onBlur={e =>
//                           e.currentTarget.style.borderColor = 'var(--border)'
//                         }
//                       />
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                   {[
//                     { key: 'summary', label: 'Summary', color: 'var(--text-muted)' },
//                     { key: 'progress', label: 'Progress', color: 'var(--text-muted)' },
//                     { key: 'recommendations', label: 'Recommendations', color: 'var(--accent)' },
//                     { key: 'next_week_focus', label: 'Next Week', color: 'var(--text-muted)' },
//                   ].map(({ key, label, color }) =>
//                     reviewPreview[key] ? (
//                       <div key={key}>
//                         <div style={{
//                           fontSize: 12, fontWeight: 700, color,
//                           textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
//                         }}>
//                           {label}
//                         </div>
//                         <p style={{
//                           fontSize: 14, lineHeight: 1.8,
//                           color: 'var(--text-secondary)', margin: 0,
//                         }}>
//                           {reviewPreview[key]}
//                         </p>
//                       </div>
//                     ) : null
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div style={{
//               display: 'flex', gap: 10,
//               justifyContent: 'space-between', alignItems: 'center',
//             }}>
//               <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                 {editingReview && '✏️ Your edits will be sent exactly as written'}
//               </div>
//               <div style={{ display: 'flex', gap: 10 }}>
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => {
//                     setShowReviewModal(false)
//                     setEditingReview(false)
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="btn btn-primary"
//                   onClick={handleConfirmSendReview}
//                   disabled={sendingReview}
//                 >
//                   {sendingReview
//                     ? 'Sending...'
//                     : `✉️ Send to ${profile.full_name?.split(' ')[0]}`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }