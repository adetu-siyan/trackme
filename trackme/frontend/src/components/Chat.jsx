import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { logsApi, projectsApi, weeklyFocusApi } from '../lib/api'
import { useToast, ToastContainer } from '../hooks/useToast'

// Stages: 'input' → 'structured' → 'question' → 'answered' → 'send' → 'done'

export default function Chat() {
  const { user, profile } = useAuth()
  const { toasts, toast } = useToast()

  const [stage, setStage] = useState('input')
  const [rawText, setRawText] = useState('')
  const [logData, setLogData] = useState(null)
  const [editedContent, setEditedContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [question, setQuestion] = useState('')
  const [detectedDifficulty, setDetectedDifficulty] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [mentorEmail, setMentorEmail] = useState('')
  const [sentMentorEmail, setSentMentorEmail] = useState('')
  const [recentEmails, setRecentEmails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trackme-recent-emails') || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(false)

  // Project + task linking
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [weeklyTasks, setWeeklyTasks] = useState([])
  const [suggestedTasks, setSuggestedTasks] = useState([]) // AI suggested matches
  const [confirmedTasks, setConfirmedTasks] = useState([]) // mentee confirmed
  const [matchingTasks, setMatchingTasks] = useState(false)
  const [completingTasks, setCompletingTasks] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  // Load projects on mount — scoped to this user only
  useEffect(() => {
    let cancelled = false
    projectsApi.myProjects()
      .then(res => {
        if (cancelled) return
        const all = [
          ...(res.created || []).map(p => ({ ...p, role: 'creator' })),
          ...(res.assigned || []).map(p => ({ ...p, role: 'member' })),
        ]
        setProjects(all)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user?.id])

  // When project is selected, load this week's tasks for that project context
  useEffect(() => {
    if (!selectedProject) {
      setWeeklyTasks([])
      setSuggestedTasks([])
      setConfirmedTasks([])
      return
    }

    let cancelled = false
    weeklyFocusApi.myTasks()
      .then(res => {
        if (cancelled) return
        setWeeklyTasks(res.tasks || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedProject])

  // When project is selected AND log is structured, AI matches log to tasks
  useEffect(() => {
    if (!selectedProject || !logData || weeklyTasks.length === 0) return
    if (stage !== 'answered') return

    matchLogToTasks()
  }, [selectedProject, stage])

  async function matchLogToTasks() {
    if (!logData || weeklyTasks.length === 0) return
    setMatchingTasks(true)

    try {
      const res = await logsApi.matchTasks({
        log_id: logData.log_id,
        task_ids: weeklyTasks.filter(t => !t.completed).map(t => t.id),
        log_topics: logData.structured_topics || [],
        log_title: logData.structured_title || '',
        log_content: logData.structured_content || '',
        task_titles: weeklyTasks.filter(t => !t.completed).map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
        })),
      })

      setSuggestedTasks(res.matched_task_ids || [])
      setConfirmedTasks(res.matched_task_ids || [])
    } catch (e) {
      console.error('Task matching failed', e)
    } finally {
      setMatchingTasks(false)
    }
  }

  async function handleSubmitLog() {
    if (rawText.trim().length < 50) {
      toast.error('Write at least 50 characters — be thorough!')
      return
    }
    setLoading(true)
    try {
      const res = await logsApi.create({ raw_content: rawText })
      setLogData(res)
      setEditedContent(res.structured_content)
      setStage('structured')
      toast.success('AI has restructured your log!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateQuestion() {
    setLoading(true)
    try {
      const res = await logsApi.generateQuestion({
        log_id: logData.log_id,
        difficulty: 'auto'
      })
      setQuestion(res.question)
      setDetectedDifficulty(res.difficulty)
      setStage('question')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyAnswer() {
    if (!userAnswer.trim()) { toast.error('Write your answer first'); return }
    setLoading(true)
    try {
      const res = await logsApi.verifyAnswer({
        log_id: logData.log_id,
        answer: userAnswer
      })
      setEvaluation(res)
      setStage('answered')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveEdit() {
    setLoading(true)
    try {
      await logsApi.edit({
        log_id: logData.log_id,
        structured_content: editedContent,
        structured_title: logData.structured_title,
        structured_topics: logData.structured_topics,
      })
      setLogData(prev => ({ ...prev, structured_content: editedContent }))
      setEditMode(false)
      toast.success('Log updated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendToMentor() {
    if (!mentorEmail.trim()) { toast.error("Enter your mentor's email"); return }
    setLoading(true)
    try {
      await logsApi.sendToMentor({
        log_id: logData.log_id,
        mentor_email: mentorEmail,
        project_id: selectedProject || null,
      })

      if (confirmedTasks.length > 0) {
        setCompletingTasks(true)
        await Promise.allSettled(
          confirmedTasks.map(taskId =>
            weeklyFocusApi.updateTask(taskId, true)
          )
        )
        setCompletingTasks(false)
      }
      setRecentEmails(prev => {
        const updated = [mentorEmail, ...prev.filter(e => e !== mentorEmail)].slice(0, 3)
        localStorage.setItem('trackme-recent-emails', JSON.stringify(updated))
        return updated
      })
      setSentMentorEmail(mentorEmail)
      setStage('done')
      toast.success('Sent to mentor!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleTaskConfirm(taskId) {
    setConfirmedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  function reset() {
    setStage('input')
    setRawText('')
    setLogData(null)
    setEditedContent('')
    setEditMode(false)
    setQuestion('')
    setDetectedDifficulty('')
    setUserAnswer('')
    setEvaluation(null)
    setMentorEmail('')
    setSentMentorEmail('')
    setSelectedProject('')
    setWeeklyTasks([])
    setSuggestedTasks([])
    setConfirmedTasks([])
  }

  const stageIndex = { input: 0, structured: 1, question: 2, answered: 2, done: 3 }
  const steps = ['Write', 'Review', 'Test', 'Send']

  return (
    <div className="page" style={{
      display: 'flex', flexDirection: 'column',
      width: '100%', boxSizing: 'border-box',
    }}>
      <style>{`
        @media (max-width: 640px) {
          .chat-send-row { flex-direction: column !important; }
          .chat-send-row input { width: 100% !important; }
          .chat-send-row button { width: 100% !important; min-width: unset !important; }
          .chat-progress { gap: 4px !important; }
          .chat-progress-step { padding: 4px 8px !important; font-size: 11px !important; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>
          Hello, <span style={{ color: 'var(--accent)' }}>{firstName}</span> 👋
        </h2>
        <p className="text-muted" style={{ fontSize: 14 }}>
          {stage === 'input'      && "What did you learn today? Write freely — AI handles the formatting."}
          {stage === 'structured' && "Here's your professional log. Review it, then take a quick AI test."}
          {stage === 'question'   && "Answer this question based on what you studied."}
          {stage === 'answered'   && (evaluation?.passed ? "Well done! 🎉 Ready to send to your mentor?" : "Keep going — you can retry or send anyway.")}
          {stage === 'done'       && "Log sent! Your mentor will review and sign it."}
        </p>
      </div>

      {/* Progress steps */}
      <div className="chat-progress" style={{
        display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap',
      }}>
        {steps.map((step, i) => {
          const current = stageIndex[stage]
          const isDone = i < current
          const isActive = i === current
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                className="chat-progress-step"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  fontSize: 12, fontWeight: 600,
                  background: isDone ? 'var(--success-soft)' : isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: isDone ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {isDone ? '✓' : `${i + 1}`} {step}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 16, height: 1, background: 'var(--border)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── STAGE: INPUT ────────────────────────────────────── */}
      {stage === 'input' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <textarea
              className="input"
              style={{
                height: '100%', minHeight: 280,
                fontSize: 15, lineHeight: 1.7, padding: '20px',
              }}
              placeholder={`What did you learn today, ${firstName}?\n\nBe thorough — write about the topics you covered, what you understood, what confused you, what you want to explore more.\n\nExample: "Today I studied Docker containers. I learned that a container is an isolated environment..."`}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
            <div style={{
              position: 'absolute', bottom: 12, right: 14, fontSize: 12, fontWeight: 500,
              color: rawText.length < 50 ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {rawText.length} chars {rawText.length < 50 ? `(need ${50 - rawText.length} more)` : '✓'}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmitLog}
            disabled={loading || rawText.trim().length < 50}
            style={{ alignSelf: 'flex-end', minWidth: 200 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> AI is restructuring...</>
              : '✨ Submit & Restructure →'}
          </button>
        </div>
      )}

      {/* ── STAGE: STRUCTURED ──────────────────────────────── */}
      {stage === 'structured' && logData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--accent-soft)',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: '2px', fontWeight: 600,
                color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase',
              }}>
                AI Structured Log · {new Date().toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </div>
              <h2 style={{ marginBottom: 12, fontSize: '1.2rem' }}>
                {logData.structured_title}
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(logData.structured_topics || []).map((t, i) => (
                  <span key={i} className="badge badge-accent">{t}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    className="input"
                    style={{ minHeight: 300, lineHeight: 1.7 }}
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  fontSize: 14, lineHeight: 1.8,
                  color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
                }}>
                  {logData.structured_content}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {!editMode && (
              <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                ✏️ Edit Log
              </button>
            )}
            {!editMode && (
              <button
                className="btn btn-ghost"
                onClick={() => setStage('answered')}
                disabled={loading}
                style={{ color: 'var(--text-muted)', fontSize: 13 }}
              >
                Skip test →
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleGenerateQuestion}
              disabled={editMode || loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating test...</>
                : 'Take AI Test →'}
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE: QUESTION ────────────────────────────────── */}
      {stage === 'question' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {detectedDifficulty && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              fontSize: 13, fontWeight: 600, alignSelf: 'flex-start',
            }}>
              🤖 AI detected: <strong>{detectedDifficulty}</strong> level
            </div>
          )}

          <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div style={{
              fontSize: 11, letterSpacing: '2px', fontWeight: 600,
              color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase',
            }}>
              Verification Question
            </div>
            <p style={{
              fontSize: 15, fontWeight: 600,
              lineHeight: 1.7, color: 'var(--text-primary)',
            }}>
              {question}
            </p>
          </div>

          <div>
            <label style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
            }}>
              Your Answer
            </label>
            <textarea
              className="input"
              style={{ minHeight: 140, lineHeight: 1.7 }}
              placeholder="Write your answer here. Be as thorough as you can..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleVerifyAnswer}
            disabled={!userAnswer.trim() || loading}
            style={{ alignSelf: 'flex-end', minWidth: 160 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating...</>
              : 'Submit Answer →'}
          </button>
        </div>
      )}

      {/* ── STAGE: ANSWERED ────────────────────────────────── */}
      {stage === 'answered' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score card — only if they took the test */}
          {evaluation && (
            <div className="card" style={{
              textAlign: 'center', padding: '32px 24px',
              background: evaluation.passed
                ? 'linear-gradient(135deg, #064E3B 0%, #059669 100%)'
                : 'linear-gradient(135deg, #450A0A 0%, #DC2626 100%)',
              border: 'none', color: '#fff',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {evaluation.passed ? '🎉' : '💪'}
              </div>
              <h2 style={{ marginBottom: 8 }}>
                {evaluation.passed ? 'Well done!' : 'Keep pushing!'}
              </h2>
              <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>
                {evaluation.score}
                <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.8 }}>/100</span>
              </div>
              <p style={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                {evaluation.feedback}
              </p>
            </div>
          )}

          {/* Skip notice — only if they skipped the test */}
          {!evaluation && (
            <div className="card" style={{
              textAlign: 'center', padding: '24px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                Test skipped. Your log is ready to send to your mentor.
              </p>
            </div>
          )}

          {/* Send to mentor card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: 16 }}>Send to Mentor</h3>

            {/* Email input + send button */}
            <div
              className="chat-send-row"
              style={{ display: 'flex', gap: 10, marginBottom: 14 }}
            >
              <input
                className="input"
                type="email"
                placeholder="mentor@email.com"
                value={mentorEmail}
                onChange={e => setMentorEmail(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSendToMentor}
                disabled={loading || !mentorEmail.trim()}
                style={{ minWidth: 120, flexShrink: 0 }}
              >
                {loading
                  ? completingTasks ? 'Completing tasks...' : 'Sending...'
                  : 'Send →'}
              </button>
            </div>

            {/* Recent mentor emails */}
            {recentEmails.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                  Recent mentors
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {recentEmails.map(email => (
                    <button
                      key={email}
                      onClick={() => setMentorEmail(email)}
                      style={{
                        background: mentorEmail === email ? 'var(--accent-soft)' : 'var(--surface-2)',
                        border: `1px solid ${mentorEmail === email ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                        fontFamily: 'Urbanist, sans-serif', fontSize: 13,
                        color: mentorEmail === email ? 'var(--accent)' : 'var(--text-secondary)',
                        textAlign: 'left', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>📧</span>
                      {email}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project selector */}
            {projects.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)', display: 'block', marginBottom: 6,
                }}>
                  Tag to Project (optional)
                </label>
                <select
                  className="input"
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  style={{ fontSize: 14 }}
                >
                  <option value="">— No project —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Task matching panel */}
            {selectedProject && weeklyTasks.length > 0 && (
              <div style={{
                background: 'var(--surface-2)',
                borderRadius: 12, padding: '16px',
                marginBottom: 14, border: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, marginBottom: 12,
                }}>
                  <span style={{ fontSize: 16 }}>🔗</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Link to Weekly Tasks
                  </div>
                  {matchingTasks && (
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginLeft: 4 }}>
                      AI matching...
                    </span>
                  )}
                  {suggestedTasks.length > 0 && !matchingTasks && (
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
                    }}>
                      {suggestedTasks.length} suggested
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.5, marginBottom: 12,
                }}>
                  Tick any tasks this log covers. They'll be marked complete when you send.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weeklyTasks.filter(t => !t.completed).map(task => {
                    const isSuggested = suggestedTasks.includes(task.id)
                    const isConfirmed = confirmedTasks.includes(task.id)

                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskConfirm(task.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                          background: isConfirmed ? 'var(--accent-soft)' : 'var(--surface)',
                          border: `1.5px solid ${isConfirmed ? 'var(--accent)' : 'var(--border)'}`,
                          transition: 'all 0.18s',
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${isConfirmed ? 'var(--accent)' : 'var(--border-strong)'}`,
                          background: isConfirmed ? 'var(--accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s',
                        }}>
                          {isConfirmed && (
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, marginBottom: 2,
                            color: isConfirmed ? 'var(--accent)' : 'var(--text-primary)',
                          }}>
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 6px',
                              borderRadius: 20, background: 'var(--surface-3)',
                              color: 'var(--text-muted)',
                            }}>
                              {task.category}
                            </span>
                            {isSuggested && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 6px',
                                borderRadius: 20, background: 'var(--accent-soft)',
                                color: 'var(--accent)',
                              }}>
                                🤖 AI match
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {weeklyTasks.filter(t => !t.completed).length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                      ✅ All tasks for this week are already complete!
                    </p>
                  )}
                </div>

                {confirmedTasks.length > 0 && (
                  <div style={{
                    marginTop: 12, padding: '8px 12px', borderRadius: 8,
                    background: 'var(--success-soft)',
                    fontSize: 12, color: 'var(--success)', fontWeight: 600,
                  }}>
                    ✅ {confirmedTasks.length} task{confirmedTasks.length > 1 ? 's' : ''} will be marked complete when you send
                  </div>
                )}
              </div>
            )}

            {/* Secondary actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setEditMode(true); setStage('structured') }}
              >
                ✏️ Edit Log First
              </button>
              <button className="btn btn-ghost btn-sm" onClick={reset}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE: DONE ────────────────────────────────────── */}
      {stage === 'done' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
          <h2 style={{ marginBottom: 12 }}>Log sent to your mentor!</h2>
          <p className="text-muted" style={{
            fontSize: 15, lineHeight: 1.7,
            maxWidth: 400, margin: '0 auto 16px',
          }}>
            They'll receive an email with your log and a button to sign it.
            You'll be notified the moment they do.
          </p>

          {sentMentorEmail && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16,
            }}>
              <span>📧</span>
              <span>Sent to <strong style={{ color: 'var(--text-primary)' }}>{sentMentorEmail}</strong></span>
            </div>
          )}

          {confirmedTasks.length > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--success-soft)', border: '1px solid var(--success)',
              fontSize: 13, color: 'var(--success)', fontWeight: 600,
              marginBottom: 28,
            }}>
              ✅ {confirmedTasks.length} weekly task{confirmedTasks.length > 1 ? 's' : ''} marked complete
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={reset}>
              Log Another Day
            </button>
          </div>
        </div>
      )}
    </div>
  )
}