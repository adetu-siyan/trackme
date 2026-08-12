import { useState, useEffect } from 'react'
import { roadmapApi } from '../lib/api'
import {
  BookOpen, CheckCircle2, Lock, ChevronDown, ChevronUp,
  Target, Link, FileText, X, AlertTriangle, Trophy
} from 'lucide-react'

// ── Test Modal ────────────────────────────────────────────────
function TestModal({ test, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit() {
    if (Object.keys(answers).length < test.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const res = await roadmapApi.submitTest(test.test_id, answers)
      setResult(res)
    } catch (e) {
      alert(e.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const allAnswered = Object.keys(answers).length === (test.questions?.length || 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Task Test · 10 Questions</div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{test.task_title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 12 }}><X size={20} /></button>
        </div>

        {result ? (
          /* Result screen */
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {result.passed
                ? <Trophy size={36} color="var(--success)" />
                : <AlertTriangle size={36} color="var(--danger)" />}
            </div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 900, color: result.passed ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>{result.score}%</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{result.correct}/{result.total} correct</div>
            </div>
            <div style={{ padding: '12px 20px', borderRadius: 12, background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)', width: '100%' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: result.passed ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                {result.passed ? '✓ Passed' : '✗ Not passed'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {result.passed ? 'Task marked complete. Next unit unlocked if all tasks in this unit are done.' : 'Review the task and try again when you feel ready.'}
              </div>
            </div>
            <button onClick={() => { onSubmit(result); onClose() }} className="btn btn-primary" style={{ width: '100%' }}>
              Continue
            </button>
          </div>
        ) : (
          /* Questions */
          <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {test.questions.map((q, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent)', marginRight: 6 }}>{i + 1}.</span>{q.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(q.options).map(([key, val]) => {
                    const selected = answers[String(i)] === key
                    return (
                      <button
                        key={key}
                        onClick={() => setAnswers(prev => ({ ...prev, [String(i)]: key }))}
                        style={{
                          background: selected ? 'var(--accent)' : 'var(--surface-2)',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 10, padding: '10px 14px',
                          cursor: 'pointer', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: selected ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800,
                          color: selected ? '#fff' : 'var(--text-muted)',
                        }}>{key}</span>
                        <span style={{ fontSize: 13, color: selected ? '#fff' : 'var(--text-secondary)', lineHeight: 1.4 }}>{val}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(Object.keys(answers).length / test.questions.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {Object.keys(answers).length}/{test.questions.length}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="btn btn-primary"
              style={{ width: '100%', opacity: !allAnswered ? 0.5 : 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Unit Card ─────────────────────────────────────────────────
function UnitCard({ unit, onTaskComplete }) {
  const [expanded, setExpanded] = useState(false)
  const [tasks, setTasks] = useState(unit.roadmap_tasks || [])
  const [activeTest, setActiveTest] = useState(null)
  const [completingTask, setCompletingTask] = useState(null)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function handleComplete(task) {
    if (task.completed || !unit.unlocked || unit.completed) return
    setCompletingTask(task.id)
    try {
      const res = await roadmapApi.completeTask(task.id)
      setActiveTest({
        test_id: res.test_id,
        task_title: task.title,
        questions: res.questions,
      })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t))
      if (res.unit_completed) onTaskComplete()
    } catch (e) {
      alert(e.message || 'Failed to mark complete')
    } finally {
      setCompletingTask(null)
    }
  }

  const statusColor = unit.completed ? 'var(--success)' : unit.unlocked ? 'var(--accent)' : 'var(--text-muted)'
  const statusBg = unit.completed ? 'var(--success-soft)' : unit.unlocked ? 'var(--accent-soft)' : 'var(--surface-3)'
  const statusLabel = unit.completed ? 'Complete' : unit.unlocked ? 'Active' : 'Locked'

  return (
    <>
      {activeTest && (
        <TestModal
          test={activeTest}
          onSubmit={() => {}}
          onClose={() => setActiveTest(null)}
        />
      )}

      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${unit.unlocked && !unit.completed ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 14, overflow: 'hidden',
        opacity: unit.unlocked ? 1 : 0.5,
        transition: 'all 0.18s',
        boxShadow: unit.unlocked && !unit.completed ? '0 0 0 1px var(--accent-soft)' : 'none',
      }}>
        {/* Unit header */}
        <div
          onClick={() => unit.unlocked && setExpanded(!expanded)}
          style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: unit.unlocked ? 'pointer' : 'default' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: statusBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: statusColor,
          }}>
            {unit.completed ? <CheckCircle2 size={18} /> : unit.unlocked ? unit.unit_number : <Lock size={15} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{unit.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
              {unit.unlocked && <><span>·</span><span>{completedCount}/{totalCount} tasks</span></>}
            </div>
          </div>

          {unit.unlocked && totalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: 2 }} />
              </div>
              {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>
          )}
          {!unit.unlocked && <Lock size={14} color="var(--text-muted)" />}
        </div>

        {/* Expanded content */}
        {expanded && unit.unlocked && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>

            {/* Goal */}
            {unit.goal && (
              <div style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8 }}>
                <Target size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.goal}</p>
              </div>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Tasks</div>
                {tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
                      border: `1px solid ${task.completed ? 'var(--success-soft)' : 'var(--border)'}`,
                      cursor: task.completed || unit.completed ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: completingTask === task.id ? 0.6 : 1,
                    }}
                    onClick={() => !task.completed && !unit.completed && handleComplete(task)}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
                      background: task.completed ? 'var(--success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {task.completed && <CheckCircle2 size={13} color="#fff" />}
                      {completingTask === task.id && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: task.completed ? 'var(--success)' : 'var(--text-primary)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      flex: 1,
                    }}>{task.title}</span>
                    {!task.completed && !unit.completed && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TAP TO COMPLETE</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resources */}
            {unit.resources && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={11} /> Resources
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.resources}</p>
              </div>
            )}

            {/* Links */}
            {unit.links && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Link size={11} /> Links
                </div>
                <a href={unit.links} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{unit.links}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Main Guide Page ───────────────────────────────────────────
export default function Guide() {
  const [roadmap, setRoadmap] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await roadmapApi.myGuide()
      setRoadmap(res.roadmap)
      setUnits(res.units || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const completedUnits = units.filter(u => u.completed).length
  const totalUnits = units.length
  const overallPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0
  const currentUnit = units.find(u => u.unlocked && !u.completed)

  if (loading) return (
    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, margin: '0 auto' }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
    </div>
  )

  if (!roadmap) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={28} color="var(--accent)" />
      </div>
      <div>
        <h2 style={{ marginBottom: 8 }}>No roadmap yet</h2>
        <p className="text-muted" style={{ fontSize: 14, maxWidth: 320, lineHeight: 1.7 }}>
          Your mentor hasn't uploaded your learning roadmap yet. Once they do, your full journey will appear here.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Your Guide</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>{roadmap.title}</h1>
        <p className="text-muted" style={{ fontSize: 13 }}>
          Started {new Date(roadmap.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {roadmap.total_units} {roadmap.duration_type === 'daily' ? 'days' : 'weeks'}
        </p>
      </div>

      {/* Overall progress */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Overall Progress</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: overallPct >= 80 ? 'var(--success)' : overallPct >= 40 ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>{overallPct}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{completedUnits}/{totalUnits}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>units complete</div>
          </div>
        </div>
        <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${overallPct}%`,
            background: overallPct >= 80 ? 'var(--success)' : 'var(--accent)',
            borderRadius: 4, transition: 'width 0.5s',
          }} />
        </div>
        {currentUnit && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Currently on: <strong style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{currentUnit.title}</strong>
          </div>
        )}
      </div>

      {/* Unit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {units.map(unit => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onTaskComplete={load}
          />
        ))}
      </div>
    </div>
  )
}