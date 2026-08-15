
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  ArrowLeft, Calendar, BarChart2, CheckCircle2, Circle, Pin, Pencil,
  AlertTriangle, Bot, RefreshCw, Check, FileText, PenLine, Flame,
  Trophy, Clock, MailOpen, Mail, X, ChevronDown, ChevronUp, Sparkles,
  Map, Upload, Trash2, ChevronRight, BookOpen, Lock,
} from 'lucide-react'
import { menteeApi, weeklyFocusApi, roadmapApi } from '../lib/api'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// ── Mentor Task Card ──────────────────────────────────────────
function MentorTaskCard({ task, onSaveNote, onSaveEdit }) {
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
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, marginBottom: 10, overflow: 'hidden',
      transition: 'all 0.18s', opacity: task.completed ? 0.7 : 1,
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
          color: task.completed ? 'var(--success)' : 'var(--text-muted)',
          background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
          padding: '2px 8px', borderRadius: 20,
          border: `1px solid ${task.completed ? 'var(--success-soft)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {task.completed ? <><CheckCircle2 size={10} /> Done</> : <><Circle size={10} /> Pending</>}
        </div>

        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => !editingTask && setExpanded(!expanded)}>
          {editingTask ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: 14, fontWeight: 600 }} autoFocus />
              <textarea className="input" value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ fontSize: 12, minHeight: 60 }} placeholder="Description (optional)" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveEdit} disabled={savingEdit || !editTitle.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingTask(false); setEditTitle(task.title); setEditDescription(task.description || '') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                {task.title}
                {task.carried_over && !task.completed && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '2px 6px', borderRadius: 4 }}>CARRY-OVER</span>
                )}
              </div>
              {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 4px' }}>{task.description}</p>}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {expanded ? <><ChevronUp size={12} /> less</> : <><ChevronDown size={12} /> more</>}
              </div>
            </>
          )}
        </div>

        {!editingTask && (
          <button onClick={() => { setEditingTask(true); setExpanded(true) }} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      {expanded && !editingTask && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Pin size={12} /> Mentor Note
          </div>
          {editingNote ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea className="input" value={noteValue} onChange={e => setNoteValue(e.target.value)} style={{ minHeight: 80, fontSize: 13 }} autoFocus />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveNote} disabled={savingNote} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
                <button onClick={() => { setEditingNote(false); setNoteValue(task.mentor_note || '') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => setEditingNote(true)} style={{ padding: '8px 12px', borderRadius: 8, background: noteValue ? 'var(--accent-soft)' : 'var(--surface)', border: `1px dashed ${noteValue ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 13, color: noteValue ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.6 }}>
              {noteValue || '+ Click to add a note...'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function MenteeDetail({ mentee, onBack }) {
  const [overview, setOverview] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  // Weekly focus
  const [currentFocus, setCurrentFocus] = useState(null)
  const [focusTasks, setFocusTasks] = useState([])
  const [focusLoading, setFocusLoading] = useState(true)
  const [showFocusInput, setShowFocusInput] = useState(false)
  const [focusInput, setFocusInput] = useState('')
  const [creatingFocus, setCreatingFocus] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryValue, setSummaryValue] = useState('')
  const [savingSummary, setSavingSummary] = useState(false)
  const [sendingReview, setSendingReview] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewPreview, setReviewPreview] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(false)

  // Roadmap
  const [roadmap, setRoadmap] = useState(null)
  const [roadmapUnits, setRoadmapUnits] = useState([])
  const [roadmapLoading, setRoadmapLoading] = useState(true)
  const [showRoadmapPreview, setShowRoadmapPreview] = useState(false)
  const [deletingRoadmap, setDeletingRoadmap] = useState(false)
  const [parsedRoadmap, setParsedRoadmap] = useState(null)
  const [showRoadmapPreviewModal, setShowRoadmapPreviewModal] = useState(false)
  const [savingRoadmap, setSavingRoadmap] = useState(false)

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

  // ── Fetching ──
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

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await roadmapApi.getMenteeRoadmap(mentee.mentee_id)
        setRoadmap(res.roadmap)
        setRoadmapUnits(res.units || [])
      } catch (e) {
        console.error(e)
      } finally {
        setRoadmapLoading(false)
      }
    }
    loadRoadmap()
  }, [mentee.mentee_id])

  // ── Weekly Focus Handlers ──
  async function handleCreateFocus() {
    if (!focusInput.trim()) return
    setCreatingFocus(true)
    try {
      await weeklyFocusApi.create({ mentee_id: mentee.mentee_id, raw_input: focusInput })
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
    setFocusTasks(prev => prev.map(t => t.id === taskId ? { ...t, mentor_note: note } : t))
  }

  async function handleSaveEdit(taskId, fields) {
    await weeklyFocusApi.updateTaskContent(taskId, fields)
    setFocusTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...fields } : t))
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
      showToast('Review sent!', 'success')
    } catch (e) {
      showToast(e.message || 'Failed to send review')
    } finally {
      setSendingReview(false)
    }
  }

  // ── Roadmap Handlers ──
  function handleRoadmapUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  e.target.value = ''

  const reader = new FileReader()
  reader.onload = async (evt) => {
    try {
      const wb = XLSX.read(evt.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

      if (!rows.length) { showToast('File appears empty.'); return }

      const headers = Object.keys(rows[0])
      const sample = rows.slice(0, 5)

      // ── Local header detection (fallback if validate fails) ──
      function detectCol(candidates) {
        return headers.find(h =>
          candidates.some(c => h.toLowerCase().includes(c))
        ) || null
      }

      const localMap = {
        title:     detectCol(['title', 'topic', 'day', 'week', 'unit', 'module', 'lesson']),
        goal:      detectCol(['goal', 'objective', 'outcome', 'aim']),
        tasks:     detectCol(['task', 'subtask', 'activity', 'exercise', 'todo']),
        resources: detectCol(['resource', 'material', 'reference', 'reading']),
        links:     detectCol(['link', 'url', 'href']),
      }

      // Detect duration type locally
      const hasWeekCol = headers.some(h => /week/i.test(h))
      const hasDayCol  = headers.some(h => /day/i.test(h))
      const localDurationType = hasWeekCol && !hasDayCol ? 'weekly' : 'daily'

      showToast('Analysing file structure...', 'info')

      // ── Try validate, fall back to local map on failure ──
      let column_map = localMap
      let duration_type = localDurationType

      try {
        const validation = await roadmapApi.validate(headers, sample)
        if (validation.is_roadmap && validation.column_map?.title) {
          column_map = { ...localMap, ...validation.column_map }
          duration_type = validation.column_map.duration_type || localDurationType
        } else if (!validation.is_roadmap) {
          showToast(validation.rejection_reason || 'This doesn\'t look like a learning roadmap.')
          return
        }
        // if validate succeeded but no title col, fall through to local
      } catch {
        // validate failed — use local detection, warn softly
        if (!localMap.title) {
          showToast('Could not identify a title column. Make sure your file has a Day/Topic/Unit column.')
          return
        }
        showToast('Using local structure detection (AI unavailable).', 'info')
      }

      if (!column_map.title) {
        showToast('Could not identify a title/topic column.')
        return
      }

      const titleHeader    = column_map.title
      const hasTasksCol    = !!column_map.tasks
      const hasGoalCol     = !!column_map.goal

      // ── Parse rows into units ──
      const rawUnits = rows
        .filter(row => row[titleHeader]?.toString().trim())
        .map((row, i) => {
          const title = row[titleHeader]?.toString().trim()
          const goal  = hasGoalCol ? row[column_map.goal]?.toString().trim() || '' : ''

          const rawTasks = hasTasksCol
            ? row[column_map.tasks]?.toString() || ''
            : ''
          const parsedTasks = rawTasks
            .split(/[,;\n]+/)
            .map(t => t.trim())
            .filter(Boolean)

          return {
            unit_number: i + 1,
            title,
            goal,
            tasks: parsedTasks,          // may be empty — filled below
            needsGeneration: parsedTasks.length === 0,
            resources: column_map.resources ? row[column_map.resources]?.toString().trim() || '' : '',
            links:     column_map.links     ? row[column_map.links]?.toString().trim()     || '' : '',
          }
        })

      if (!rawUnits.length) { showToast('No valid rows found after parsing.'); return }

      // ── AI-generate tasks for units that have none ──
      const unitsNeedingTasks = rawUnits.filter(u => u.needsGeneration)

      if (unitsNeedingTasks.length > 0) {
        showToast(`Generating tasks for ${unitsNeedingTasks.length} units...`, 'info')
        try {
          // Batch: send all titles+goals, get tasks back per unit
          const generated = await roadmapApi.generateTasks(
            unitsNeedingTasks.map(u => ({ title: u.title, goal: u.goal }))
          )
          // Merge generated tasks back
          generated.forEach(({ unit_number, tasks }) => {
            const unit = rawUnits.find(u => u.unit_number === unit_number)
            if (unit && tasks?.length) unit.tasks = tasks
          })
        } catch {
          // fallback: derive a simple task from title/goal
          unitsNeedingTasks.forEach(u => {
            u.tasks = u.goal
              ? [`Understand: ${u.goal}`, `Practice: ${u.title}`]
              : [`Study: ${u.title}`, `Complete exercises for: ${u.title}`]
          })
        }
      }

      const units = rawUnits.map(({ needsGeneration, ...u }) => u)

      const roadmapTitle = file.name
        .replace(/\.(xlsx|xls)$/i, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

      setParsedRoadmap({
        title: roadmapTitle,
        duration_type,
        total_units: units.length,
        units,
        detected: {
          titleCol:    column_map.title,
          goalCol:     column_map.goal,
          tasksCol:    column_map.tasks,
          resourceCol: column_map.resources,
          linksCol:    column_map.links,
        }
      })
      setShowRoadmapPreviewModal(true)

    } catch (err) {
      console.error(err)
      showToast('Could not read file. Make sure it is a valid .xlsx file.')
    }
  }
  reader.readAsArrayBuffer(file)
}

  async function handleConfirmRoadmap() {
    if (!parsedRoadmap) return
    setSavingRoadmap(true)
    try {
      const res = await roadmapApi.save(mentee.mentee_id, {
        title: parsedRoadmap.title,
        duration_type: parsedRoadmap.duration_type,
        total_units: parsedRoadmap.total_units,
        units: parsedRoadmap.units,
      })
      showToast(`Roadmap saved — ${res.total_units} units`, 'success')
      setShowRoadmapPreviewModal(false)
      setParsedRoadmap(null)
      const updated = await roadmapApi.getMenteeRoadmap(mentee.mentee_id)
      setRoadmap(updated.roadmap)
      setRoadmapUnits(updated.units || [])
    } catch (e) {
      showToast(e.message || 'Save failed')
    } finally {
      setSavingRoadmap(false)
    }
  }

  async function handleDeleteRoadmap() {
    if (!confirm('Delete this roadmap? This cannot be undone.')) return
    setDeletingRoadmap(true)
    try {
      await roadmapApi.delete(mentee.mentee_id)
      setRoadmap(null)
      setRoadmapUnits([])
      showToast('Roadmap deleted', 'success')
    } catch (e) {
      showToast(e.message || 'Delete failed')
    } finally {
      setDeletingRoadmap(false)
    }
  }

  const completedTasks = focusTasks.filter(t => t.completed)
  const completionRate = focusTasks.length > 0 ? Math.round((completedTasks.length / focusTasks.length) * 100) : 0
  const barColor = completionRate >= 80 ? 'var(--success)' : completionRate >= 50 ? 'var(--warning)' : 'var(--danger)'
  const displaySummary = currentFocus?.edited_summary || currentFocus?.summary || ''

  const globalStyles = `
    .mentee-detail-bg {
      background: linear-gradient(150deg, #ffffff 0%, #f4f0ff 60%, #e8deff 100%);
    }
    html[data-theme="dark"] .mentee-detail-bg {
      background: linear-gradient(150deg, #0d0a14 0%, #150f24 60%, #1e1535 100%);
    }
    @media (max-width: 640px) {
      .detail-container { padding: 0 16px !important; }
      .stats-row { grid-template-columns: 1fr 1fr !important; }
      .header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `

  return (
    <div className="mentee-detail-bg" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '40px 0 80px 0', width: '100%', overflowY: 'auto' }}>
      <style>{globalStyles}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, padding: '12px 20px',
         borderRadius: 12,
          background: toast.type === 'error' 
          ? 'var(--danger)' 
          : toast.type === 'info' 
          ? 'var(--accent)' 
          : '#059669',


           color: '#fff',
            fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.2s ease' }}>
          {toast.type === 'error' 
          ? <AlertTriangle size={16} /> 
          : toast.type === 'info'
          ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
          : <CheckCircle2 size={16} />} {toast.msg}
        </div>
      )}

      <div className="detail-container" style={{ width: '100%', maxWidth: 900, padding: '0 24px' }}>

        {/* ── Header ── */}
        <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h1 style={{ marginBottom: 2 }}>{profile.full_name}</h1>
              <p className="text-muted" style={{ fontSize: 13 }}>{profile.field_of_study || 'No field set'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowFocusInput(true)}>
              <Calendar size={14} /> Focus
            </button>
            {currentFocus && (
              <button className="btn btn-secondary btn-sm" onClick={handlePreviewReview} disabled={sendingReview || reviewSent}>
                {reviewSent
                  ? <><CheckCircle2 size={14} /> Sent</>
                  : sendingReview
                  ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <><BarChart2 size={14} /> Review</>}
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { icon: <FileText size={16} />, label: 'Logs', value: stats.total_logs || 0 },
            { icon: <PenLine size={16} />, label: 'Signed', value: stats.signed_logs || 0 },
            { icon: <BarChart2 size={16} />, label: 'Rate', value: `${stats.sign_rate || 0}%` },
            { icon: <Flame size={16} />, label: 'Streak', value: streak.current_streak || 0 },
            { icon: <Trophy size={16} />, label: 'Best', value: streak.longest_streak || 0 },
            { icon: <Clock size={16} />, label: 'Most Active', value: overview?.stats?.most_active_time || (loading ? '...' : '—') },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Set Focus Modal ── */}
        {showFocusInput && (
          <div className="modal-overlay" onClick={() => setShowFocusInput(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>Set Focus</h2>
                  <p className="text-muted" style={{ fontSize: 13 }}>AI will generate tasks based on this prompt.</p>
                </div>
                <button onClick={() => setShowFocusInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <textarea className="input" style={{ minHeight: 120, lineHeight: 1.7, marginBottom: 16 }} placeholder="e.g. Focus on completing the ML pipeline..." value={focusInput} onChange={e => setFocusInput(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowFocusInput(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateFocus} disabled={creatingFocus || !focusInput.trim()}>
                  {creatingFocus
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
                    : <><Sparkles size={14} /> Generate Plan</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Roadmap Card ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              <Map size={17} /> Learning Roadmap
            </h3>
            {roadmap && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  {roadmap.total_units} {roadmap.duration_type === 'daily' ? 'days' : 'weeks'}
                </span>
                <button onClick={handleDeleteRoadmap} disabled={deletingRoadmap} style={{ background: 'var(--danger-soft)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--danger)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={12} /> {deletingRoadmap ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '20px' }}>
            {roadmapLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />)}
              </div>
            ) : !roadmap ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <BookOpen size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
                <p className="text-muted" style={{ fontSize: 13, marginBottom: 4, lineHeight: 1.6 }}>
                  Upload a structured Excel guide for {profile.full_name?.split(' ')[0]}.
                </p>
                <p className="text-muted" style={{ fontSize: 11, marginBottom: 16 }}>
                  Any layout works — just make sure headers include words like: title/day/week, goal, task, resources, links.
                </p>
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept=".xlsx,.xls" onChange={handleRoadmapUpload} style={{ display: 'none' }} />
                  <span className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} /> Upload Guide (.xlsx)
                  </span>
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{roadmap.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Started {new Date(roadmap.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {(() => {
                    const done = roadmapUnits.filter(u => u.completed).length
                    const total = roadmapUnits.length
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0
                    const col = pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--accent)'
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{done}/{total} units complete</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* First 2 units */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {roadmapUnits.slice(0, 2).map(unit => (
                    <div key={unit.id} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', opacity: unit.unlocked ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: unit.completed ? 'var(--success-soft)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: unit.completed ? 'var(--success)' : 'var(--accent)' }}>
                        {unit.completed ? <CheckCircle2 size={16} /> : unit.unit_number}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unit.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {unit.roadmap_tasks?.length || 0} tasks · {unit.completed ? '✓ Complete' : unit.unlocked ? 'In progress' : 'Locked'}
                        </div>
                      </div>
                      {!unit.unlocked && <Lock size={13} color="var(--text-muted)" />}
                    </div>
                  ))}
                </div>

                {/* View all toggle */}
                {roadmapUnits.length > 2 && (
                  <button onClick={() => setShowRoadmapPreview(!showRoadmapPreview)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    {showRoadmapPreview ? 'Hide' : `View all ${roadmapUnits.length} units`}
                    <ChevronRight size={14} style={{ transform: showRoadmapPreview ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                )}

                {showRoadmapPreview && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
                    {roadmapUnits.slice(2).map(unit => (
                      <div key={unit.id} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', opacity: unit.unlocked ? 1 : 0.45, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: unit.completed ? 'var(--success-soft)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: unit.completed ? 'var(--success)' : 'var(--text-muted)' }}>
                          {unit.completed ? <CheckCircle2 size={14} /> : unit.unit_number}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unit.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {unit.roadmap_tasks?.length || 0} tasks · {unit.completed ? '✓ Done' : unit.unlocked ? 'Active' : 'Locked'}
                          </div>
                        </div>
                        {!unit.unlocked && <Lock size={12} color="var(--text-muted)" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Replace */}
                <label style={{ cursor: 'pointer', alignSelf: 'flex-start' }}>
                  <input type="file" accept=".xlsx,.xls" onChange={handleRoadmapUpload} style={{ display: 'none' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Upload size={11} /> Replace roadmap
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ── Weekly Focus ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}><Calendar size={17} /> This Week</h3>
            {currentFocus && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentFocus.week_start} → {currentFocus.week_end}</span>}
          </div>
          <div style={{ padding: '20px' }}>
            {focusLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 10 }} />)}
              </div>
            ) : !currentFocus ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Calendar size={32} color="var(--text-muted)" style={{ marginBottom: 10 }} />
                <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>No weekly focus set.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowFocusInput(true)}>Set Focus</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  {editingSummary ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <textarea className="input" value={summaryValue} onChange={e => setSummaryValue(e.target.value)} style={{ fontSize: 14, minHeight: 50 }} autoFocus />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={handleSaveSummary} disabled={savingSummary || !summaryValue.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {savingSummary ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setEditingSummary(false); setSummaryValue(currentFocus.edited_summary || currentFocus.summary) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.6 }}>{displaySummary}</p>
                      <button onClick={() => setEditingSummary(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 5, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${completionRate}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{completedTasks.length}/{focusTasks.length}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {focusTasks.map(task => (
                    <MentorTaskCard key={task.id} task={task} onSaveNote={handleSaveNote} onSaveEdit={handleSaveEdit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Overview ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bot size={18} /><h3 style={{ fontSize: 16 }}>AI Overview</h3>
            <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 20, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 700 }}>Groq</span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[60, 40, 80, 60, 40].map((w, i) => <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 6 }} />)}
            </div>
          ) : ai ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ai.consistency_signal && (
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ai.consistency_signal === 'Strong' ? 'var(--success-soft)' : ai.consistency_signal === 'Moderate' ? 'var(--accent-soft)' : 'var(--danger-soft)', color: ai.consistency_signal === 'Strong' ? 'var(--success)' : ai.consistency_signal === 'Moderate' ? 'var(--accent)' : 'var(--danger)' }}>
                    {ai.consistency_signal}
                  </span>
                )}
                {ai.learning_depth_pattern && (
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    {ai.learning_depth_pattern}
                  </span>
                )}
              </div>
              {ai.overview && <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{ai.overview}</p>}
              {(ai.risk_flags?.length > 0 || ai.strength_signals?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {ai.risk_flags?.length > 0 && (
                    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--danger-soft)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> Risks</div>
                      {ai.risk_flags.map((f, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>· {f}</div>)}
                    </div>
                  )}
                  {ai.strength_signals?.length > 0 && (
                    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--success-soft)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={10} /> Strengths</div>
                      {ai.strength_signals.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>· {s}</div>)}
                    </div>
                  )}
                </div>
              )}
              {ai.recommendations && (
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--accent-soft)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Recommendation</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{ai.recommendations}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: 14 }}>No overview available yet.</p>
          )}
        </div>

        {/* ── Log History ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16 }}>Log History</h3>
          </div>
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p className="text-muted" style={{ fontSize: 14 }}>No logs yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {logs.map((log, i) => {
                const isExpanded = expanded === log.id
                return (
                  <div key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div onClick={() => setExpanded(isExpanded ? null : log.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: log.signed ? 'var(--success-soft)' : log.sent_to_mentor ? 'var(--warning-soft)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {log.signed ? <CheckCircle2 size={14} color="var(--success)" /> : log.sent_to_mentor ? <MailOpen size={14} color="var(--warning)" /> : <FileText size={14} color="var(--accent)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{log.structured_title || 'Untitled'}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(log.log_date)}</div>
                      <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 20px 16px 52px', background: 'var(--surface-2)' }}>
                        {log.test_attempted && (
                          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, marginBottom: 10, fontSize: 11, fontWeight: 600, background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)', color: log.test_passed ? 'var(--success)' : 'var(--danger)' }}>
                            {log.test_passed ? 'Passed' : 'Not passed'}
                          </div>
                        )}
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {log.structured_content || log.raw_content}
                        </p>
                        {log.signed && log.signed_at && (
                          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <PenLine size={12} /> Signed {formatDate(log.signed_at)}
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

        {/* ── Review Modal ── */}
        {showReviewModal && reviewPreview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setShowReviewModal(false); setEditingReview(false) }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>Weekly Review</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setEditingReview(!editingReview)} style={{ background: editingReview ? 'var(--accent-soft)' : 'var(--surface-2)', border: `1px solid ${editingReview ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: editingReview ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {editingReview ? 'Preview' : 'Edit'}
                  </button>
                  <button onClick={() => { setShowReviewModal(false); setEditingReview(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px', border: '1px solid var(--border)' }}>
                {editingReview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['summary', 'progress', 'recommendations', 'next_week_focus'].map(key => (
                      <textarea key={key} value={reviewPreview[key] || ''} onChange={e => setReviewPreview({ ...reviewPreview, [key]: e.target.value })} style={{ width: '100%', minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 13, lineHeight: 1.6 }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {reviewPreview.summary && (
                      <><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Summary</div><p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.summary}</p></>
                    )}
                    {reviewPreview.recommendations && (
                      <><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Recommendations</div><p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.recommendations}</p></>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => { setShowReviewModal(false); setEditingReview(false) }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmSendReview} disabled={sendingReview}>
                  {sendingReview ? 'Sending...' : <><Mail size={14} /> Send</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Roadmap Preview Modal ── */}
        {showRoadmapPreviewModal && parsedRoadmap && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowRoadmapPreviewModal(false)}>
            <div style={{ background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

              <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)', borderRadius: '20px 20px 0 0', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Preview Before Saving</div>
                    <input
                      value={parsedRoadmap.title}
                      onChange={e => setParsedRoadmap(p => ({ ...p, title: e.target.value }))}
                      style={{ fontSize: 18, fontWeight: 800, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontFamily: 'Urbanist, sans-serif' }}
                    />
                  </div>
                  <button onClick={() => setShowRoadmapPreviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    {parsedRoadmap.total_units} {parsedRoadmap.duration_type === 'daily' ? 'days' : 'weeks'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '3px 10px', borderRadius: 20 }}>
                    {parsedRoadmap.duration_type}
                  </span>
                  {parsedRoadmap.detected.tasksCol && (
                    <span style={{ fontSize: 12, color: 'var(--success)', background: 'var(--success-soft)', padding: '3px 10px', borderRadius: 20 }}>✓ Tasks detected</span>
                  )}
                  {parsedRoadmap.detected.goalCol && (
                    <span style={{ fontSize: 12, color: 'var(--success)', background: 'var(--success-soft)', padding: '3px 10px', borderRadius: 20 }}>✓ Goals detected</span>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {parsedRoadmap.units.slice(0, 10).map((unit, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: unit.tasks.length ? 8 : 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                        {unit.unit_number}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{unit.title}</div>
                        {unit.goal && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{unit.goal}</div>}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{unit.tasks.length} tasks</span>
                    </div>
                    {unit.tasks.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 36 }}>
                        {unit.tasks.slice(0, 3).map((t, j) => (
                          <span key={j} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>{t}</span>
                        ))}
                        {unit.tasks.length > 3 && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 8px' }}>+{unit.tasks.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {parsedRoadmap.units.length > 10 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
                    ... and {parsedRoadmap.units.length - 10} more units
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'var(--surface)', borderRadius: '0 0 20px 20px' }}>
                <button className="btn btn-secondary" onClick={() => { setShowRoadmapPreviewModal(false); setParsedRoadmap(null) }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmRoadmap} disabled={savingRoadmap || !parsedRoadmap.title.trim()}>
                  {savingRoadmap
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</>
                    : <><CheckCircle2 size={14} /> Save Roadmap</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// import { useEffect, useState } from 'react'
// import * as XLSX from 'xlsx'
// import {
//   ArrowLeft, Calendar, BarChart2, CheckCircle2, Circle, Pin, Pencil,
//   AlertTriangle, Bot, RefreshCw, TrendingUp, TrendingDown, ClipboardList, Check,
//   FileText, PenLine, Flame, Trophy, Clock, MailOpen, Mail, X,
//   ChevronDown, ChevronUp, Sparkles, Eye, Map, Upload, Trash2,
//   ChevronRight, BookOpen, Lock, Target, Link,
// } from 'lucide-react'
// import { menteeApi, weeklyFocusApi, roadmapApi } from '../lib/api'

// function formatDate(dateStr) {
//   if (!dateStr) return '—'
//   return new Date(dateStr).toLocaleDateString('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric'
//   })
// }

// // ── Mentor Task Card ──────────────────────────────────────────
// function MentorTaskCard({ task, onSaveNote, onSaveEdit }) {
//   const [expanded, setExpanded] = useState(false)
//   const [editingNote, setEditingNote] = useState(false)
//   const [noteValue, setNoteValue] = useState(task.mentor_note || '')
//   const [savingNote, setSavingNote] = useState(false)
//   const [editingTask, setEditingTask] = useState(false)
//   const [editTitle, setEditTitle] = useState(task.title)
//   const [editDescription, setEditDescription] = useState(task.description || '')
//   const [savingEdit, setSavingEdit] = useState(false)

//   async function handleSaveNote() {
//     setSavingNote(true)
//     try {
//       await onSaveNote(task.id, noteValue)
//       setEditingNote(false)
//     } catch (e) {
//       alert(e.message)
//     } finally {
//       setSavingNote(false)
//     }
//   }

//   async function handleSaveEdit() {
//     setSavingEdit(true)
//     try {
//       await onSaveEdit(task.id, { title: editTitle, description: editDescription })
//       setEditingTask(false)
//     } catch (e) {
//       alert(e.message)
//     } finally {
//       setSavingEdit(false)
//     }
//   }

//   return (
//     <div style={{
//       background: 'var(--surface)',
//       border: '1px solid var(--border)',
//       borderRadius: 12, marginBottom: 10,
//       overflow: 'hidden',
//       transition: 'all 0.18s',
//       opacity: task.completed ? 0.7 : 1,
//     }}>
//       <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
//         <div style={{
//           fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
//           color: task.completed ? 'var(--success)' : 'var(--text-muted)',
//           background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
//           padding: '2px 8px', borderRadius: 20,
//           border: `1px solid ${task.completed ? 'var(--success-soft)' : 'var(--border)'}`,
//           display: 'flex', alignItems: 'center', gap: 4,
//         }}>
//           {task.completed ? <><CheckCircle2 size={10} /> Done</> : <><Circle size={10} /> Pending</>}
//         </div>

//         <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => !editingTask && setExpanded(!expanded)}>
//           {editingTask ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//               <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: 14, fontWeight: 600 }} autoFocus />
//               <textarea className="input" value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ fontSize: 12, minHeight: 60 }} placeholder="Description (optional)" />
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button onClick={handleSaveEdit} disabled={savingEdit || !editTitle.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
//                   {savingEdit ? 'Saving...' : 'Save'}
//                 </button>
//                 <button onClick={() => { setEditingTask(false); setEditTitle(task.title); setEditDescription(task.description || '') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
//                 {task.title}
//                 {task.carried_over && !task.completed && (
//                   <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '2px 6px', borderRadius: 4 }}>CARRY-OVER</span>
//                 )}
//               </div>
//               {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 4px' }}>{task.description}</p>}
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
//                 {expanded ? <><ChevronUp size={12} /> less</> : <><ChevronDown size={12} /> more</>}
//               </div>
//             </>
//           )}
//         </div>

//         {!editingTask && (
//           <button onClick={() => { setEditingTask(true); setExpanded(true) }} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
//             <Pencil size={12} /> Edit
//           </button>
//         )}
//       </div>

//       {expanded && !editingTask && (
//         <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--surface-2)' }}>
//           <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
//             <Pin size={12} /> Mentor Note
//           </div>
//           {editingNote ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//               <textarea className="input" value={noteValue} onChange={e => setNoteValue(e.target.value)} style={{ minHeight: 80, fontSize: 13 }} autoFocus />
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button onClick={handleSaveNote} disabled={savingNote} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
//                   {savingNote ? 'Saving...' : 'Save Note'}
//                 </button>
//                 <button onClick={() => { setEditingNote(false); setNoteValue(task.mentor_note || '') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div onClick={() => setEditingNote(true)} style={{ padding: '8px 12px', borderRadius: 8, background: noteValue ? 'var(--accent-soft)' : 'var(--surface)', border: `1px dashed ${noteValue ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 13, color: noteValue ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.6 }}>
//               {noteValue || '+ Click to add a note...'}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Main Component ────────────────────────────────────────────
// export default function MenteeDetail({ mentee, onBack }) {
//   const [overview, setOverview] = useState(null)
//   const [logs, setLogs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [expanded, setExpanded] = useState(null)

//   // Weekly focus
//   const [currentFocus, setCurrentFocus] = useState(null)
//   const [focusTasks, setFocusTasks] = useState([])
//   const [focusLoading, setFocusLoading] = useState(true)
//   const [showFocusInput, setShowFocusInput] = useState(false)
//   const [focusInput, setFocusInput] = useState('')
//   const [creatingFocus, setCreatingFocus] = useState(false)
//   const [focusResult, setFocusResult] = useState(null)
//   const [editingSummary, setEditingSummary] = useState(false)
//   const [summaryValue, setSummaryValue] = useState('')
//   const [savingSummary, setSavingSummary] = useState(false)
//   const [sendingReview, setSendingReview] = useState(false)
//   const [reviewSent, setReviewSent] = useState(false)
//   const [reviewPreview, setReviewPreview] = useState(null)
//   const [showReviewModal, setShowReviewModal] = useState(false)
//   const [editingReview, setEditingReview] = useState(false)

//   // Roadmap
//   const [roadmap, setRoadmap] = useState(null)
//   const [roadmapUnits, setRoadmapUnits] = useState([])
//   const [roadmapLoading, setRoadmapLoading] = useState(true)
//   const [uploadingRoadmap, setUploadingRoadmap] = useState(false)
//   const [showRoadmapPreview, setShowRoadmapPreview] = useState(false)
//   const [deletingRoadmap, setDeletingRoadmap] = useState(false)

//   const [toast, setToast] = useState(null)

//   const profile = mentee.profile || {}
//   const stats = mentee.stats || {}
//   const streak = mentee.streak || {}
//   const ai = overview?.ai_overview || null

//   const initials = profile.full_name
//     ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     : '?'

//   function showToast(msg, type = 'error') {
//     setToast({ msg, type })
//     setTimeout(() => setToast(null), 4000)
//   }

//   // ── Data Fetching ──
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
//         setSummaryValue(res.focus?.edited_summary || res.focus?.summary || '')
//       } catch (e) {
//         console.error(e)
//       } finally {
//         setFocusLoading(false)
//       }
//     }
//     loadFocus()
//   }, [mentee.mentee_id])

//   useEffect(() => {
//     async function loadRoadmap() {
//       try {
//         const res = await roadmapApi.getMenteeRoadmap(mentee.mentee_id)
//         setRoadmap(res.roadmap)
//         setRoadmapUnits(res.units || [])
//       } catch (e) {
//         console.error(e)
//       } finally {
//         setRoadmapLoading(false)
//       }
//     }
//     loadRoadmap()
//   }, [mentee.mentee_id])

//   // ── Handlers ──
//   async function handleCreateFocus() {
//     if (!focusInput.trim()) return
//     setCreatingFocus(true)
//     try {
//       await weeklyFocusApi.create({ mentee_id: mentee.mentee_id, raw_input: focusInput })
//       setShowFocusInput(false)
//       setFocusInput('')
//       const updated = await weeklyFocusApi.getMenteeFocus(mentee.mentee_id)
//       setCurrentFocus(updated.focus)
//       setFocusTasks(updated.tasks || [])
//       setSummaryValue(updated.focus?.edited_summary || updated.focus?.summary || '')
//     } catch (e) {
//       showToast(e.message || 'Failed to create focus')
//     } finally {
//       setCreatingFocus(false)
//     }
//   }

//   async function handleSaveSummary() {
//     if (!currentFocus) return
//     setSavingSummary(true)
//     try {
//       await weeklyFocusApi.updateFocusSummary(currentFocus.id, summaryValue)
//       setCurrentFocus(prev => ({ ...prev, edited_summary: summaryValue }))
//       setEditingSummary(false)
//       showToast('Summary updated', 'success')
//     } catch (e) {
//       showToast(e.message || 'Failed to update summary')
//     } finally {
//       setSavingSummary(false)
//     }
//   }

//   async function handleSaveNote(taskId, note) {
//     await weeklyFocusApi.addMentorNote(taskId, note)
//     setFocusTasks(prev => prev.map(t => t.id === taskId ? { ...t, mentor_note: note } : t))
//   }

//   async function handleSaveEdit(taskId, fields) {
//     await weeklyFocusApi.updateTaskContent(taskId, fields)
//     setFocusTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...fields } : t))
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

//   async function handleRoadmapUpload(e) {
//     const file = e.target.files[0]
//     if (!file) return
//     setUploadingRoadmap(true)
//     try {
//       const formData = new FormData()
//       formData.append('file', file)
//       const res = await roadmapApi.upload(mentee.mentee_id, formData)
//       showToast(`Roadmap uploaded — ${res.total_units} units`, 'success')
//       const updated = await roadmapApi.getMenteeRoadmap(mentee.mentee_id)
//       setRoadmap(updated.roadmap)
//       setRoadmapUnits(updated.units || [])
//     } catch (e) {
//       showToast(e.message || 'Upload failed')
//     } finally {
//       setUploadingRoadmap(false)
//       e.target.value = ''
//     }
//   }

//   async function handleDeleteRoadmap() {
//     if (!confirm('Delete this roadmap? This cannot be undone.')) return
//     setDeletingRoadmap(true)
//     try {
//       await roadmapApi.delete(mentee.mentee_id)
//       setRoadmap(null)
//       setRoadmapUnits([])
//       showToast('Roadmap deleted', 'success')
//     } catch (e) {
//       showToast(e.message || 'Delete failed')
//     } finally {
//       setDeletingRoadmap(false)
//     }
//   }

//   const completedTasks = focusTasks.filter(t => t.completed)
//   const pendingTasks = focusTasks.filter(t => !t.completed)
//   const completionRate = focusTasks.length > 0 ? Math.round((completedTasks.length / focusTasks.length) * 100) : 0
//   const barColor = completionRate >= 80 ? 'var(--success)' : completionRate >= 50 ? 'var(--warning)' : 'var(--danger)'
//   const displaySummary = currentFocus?.edited_summary || currentFocus?.summary || ''

//   const globalStyles = `
//     .mentee-detail-bg {
//       background: linear-gradient(150deg, #ffffff 0%, #f4f0ff 60%, #e8deff 100%);
//     }
//     html[data-theme="dark"] .mentee-detail-bg {
//       background: linear-gradient(150deg, #0d0a14 0%, #150f24 60%, #1e1535 100%);
//     }
//     @media (max-width: 640px) {
//       .detail-container { padding: 0 16px !important; }
//       .stats-row { grid-template-columns: 1fr 1fr !important; }
//       .header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
//     }
//     @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
//     @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//   `

//   return (
//     <div className="mentee-detail-bg" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '40px 0 80px 0', width: '100%', overflowY: 'auto' }}>
//       <style>{globalStyles}</style>

//       {/* Toast */}
//       {toast && (
//         <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, padding: '12px 20px', borderRadius: 12, background: toast.type === 'error' ? 'var(--danger)' : '#059669', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.2s ease' }}>
//           {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />} {toast.msg}
//         </div>
//       )}

//       <div className="detail-container" style={{ width: '100%', maxWidth: 900, padding: '0 24px' }}>

//         {/* ── Header ── */}
//         <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//             <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
//               <ArrowLeft size={20} />
//             </button>
//             <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
//               {initials}
//             </div>
//             <div>
//               <h1 style={{ marginBottom: 2 }}>{profile.full_name}</h1>
//               <p className="text-muted" style={{ fontSize: 13 }}>{profile.field_of_study || 'No field set'}</p>
//             </div>
//           </div>
//           <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//             <button className="btn btn-secondary btn-sm" onClick={() => setShowFocusInput(true)}>
//               <Calendar size={14} /> Focus
//             </button>
//             {currentFocus && (
//               <button className="btn btn-secondary btn-sm" onClick={handlePreviewReview} disabled={sendingReview || reviewSent} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 {reviewSent
//                   ? <><CheckCircle2 size={14} /> Sent</>
//                   : sendingReview
//                   ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
//                   : <><BarChart2 size={14} /> Review</>}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ── Stats Row ── */}
//         <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
//           {[
//             { icon: <FileText size={16} />, label: 'Logs', value: stats.total_logs || 0 },
//             { icon: <PenLine size={16} />, label: 'Signed', value: stats.signed_logs || 0 },
//             { icon: <BarChart2 size={16} />, label: 'Rate', value: `${stats.sign_rate || 0}%` },
//             { icon: <Flame size={16} />, label: 'Streak', value: streak.current_streak || 0 },
//             { icon: <Trophy size={16} />, label: 'Best', value: streak.longest_streak || 0 },
//             { icon: <Clock size={16} />, label: 'Most Active', value: overview?.stats?.most_active_time || (loading ? '...' : '—') },
//           ].map((stat, i) => (
//             <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
//               <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{stat.icon}</div>
//               <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* ── Set Weekly Focus Modal ── */}
//         {showFocusInput && (
//           <div className="modal-overlay" onClick={() => setShowFocusInput(false)}>
//             <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//                 <div>
//                   <h2 style={{ marginBottom: 4 }}>Set Focus</h2>
//                   <p className="text-muted" style={{ fontSize: 13 }}>AI will generate tasks based on this prompt.</p>
//                 </div>
//                 <button onClick={() => setShowFocusInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
//               </div>
//               <textarea className="input" style={{ minHeight: 120, lineHeight: 1.7, marginBottom: 16 }} placeholder="e.g. Focus on completing the ML pipeline..." value={focusInput} onChange={e => setFocusInput(e.target.value)} autoFocus />
//               <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
//                 <button className="btn btn-secondary" onClick={() => setShowFocusInput(false)}>Cancel</button>
//                 <button className="btn btn-primary" onClick={handleCreateFocus} disabled={creatingFocus || !focusInput.trim()}>
//                   {creatingFocus
//                     ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
//                     : <><Sparkles size={14} /> Generate Plan</>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Roadmap Card ── */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}>
//           <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
//               <Map size={17} /> Learning Roadmap
//             </h3>
//             {roadmap && (
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                 <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
//                   {roadmap.total_units} {roadmap.duration_type === 'daily' ? 'days' : 'weeks'}
//                 </span>
//                 <button
//                   onClick={handleDeleteRoadmap}
//                   disabled={deletingRoadmap}
//                   style={{ background: 'var(--danger-soft)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--danger)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
//                 >
//                   <Trash2 size={12} /> {deletingRoadmap ? 'Deleting...' : 'Delete'}
//                 </button>
//               </div>
//             )}
//           </div>

//           <div style={{ padding: '20px' }}>
//             {roadmapLoading ? (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                 {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />)}
//               </div>
//             ) : !roadmap ? (
//               <div style={{ textAlign: 'center', padding: '20px 0' }}>
//                 <BookOpen size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
//                 <p className="text-muted" style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.6 }}>
//                   Upload a structured Excel guide for {profile.full_name?.split(' ')[0]}.
//                 </p>
//                 <p className="text-muted" style={{ fontSize: 11, marginBottom: 16 }}>
//                   Columns: S/N · Day/Week · Task · Resources · Links
//                 </p>
//                 <label style={{ cursor: 'pointer' }}>
//                   <input type="file" accept=".xlsx,.xls" onChange={handleRoadmapUpload} style={{ display: 'none' }} disabled={uploadingRoadmap} />
//                   <span className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, pointerEvents: uploadingRoadmap ? 'none' : 'auto', opacity: uploadingRoadmap ? 0.7 : 1 }}>
//                     {uploadingRoadmap
//                       ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Parsing...</>
//                       : <><Upload size={14} /> Upload Guide (.xlsx)</>}
//                   </span>
//                 </label>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

//                 {/* Title + progress */}
//                 <div>
//                   <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{roadmap.title}</div>
//                   <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
//                     Started {new Date(roadmap.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                   </div>
//                   {(() => {
//                     const done = roadmapUnits.filter(u => u.completed).length
//                     const total = roadmapUnits.length
//                     const pct = total > 0 ? Math.round((done / total) * 100) : 0
//                     const col = pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--accent)'
//                     return (
//                       <div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
//                           <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{done}/{total} units complete</span>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</span>
//                         </div>
//                         <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
//                           <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 0.4s' }} />
//                         </div>
//                       </div>
//                     )
//                   })()}
//                 </div>

//                 {/* First 2 units preview */}
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   {roadmapUnits.slice(0, 2).map(unit => (
//                     <div key={unit.id} style={{
//                       background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px',
//                       border: '1px solid var(--border)',
//                       opacity: unit.unlocked ? 1 : 0.5,
//                       display: 'flex', alignItems: 'center', gap: 10,
//                     }}>
//                       <div style={{
//                         width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
//                         background: unit.completed ? 'var(--success-soft)' : 'var(--accent-soft)',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: 12, fontWeight: 800,
//                         color: unit.completed ? 'var(--success)' : 'var(--accent)',
//                       }}>
//                         {unit.completed ? <CheckCircle2 size={16} /> : unit.unit_number}
//                       </div>
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unit.title}</div>
//                         <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
//                           {unit.roadmap_tasks?.length || 0} tasks · {unit.completed ? '✓ Complete' : unit.unlocked ? 'In progress' : 'Locked'}
//                         </div>
//                       </div>
//                       {!unit.unlocked && <Lock size={13} color="var(--text-muted)" />}
//                     </div>
//                   ))}
//                 </div>

//                 {/* View all toggle */}
//                 {roadmapUnits.length > 2 && (
//                   <button
//                     onClick={() => setShowRoadmapPreview(!showRoadmapPreview)}
//                     style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
//                   >
//                     {showRoadmapPreview ? 'Hide' : `View all ${roadmapUnits.length} units`}
//                     <ChevronRight size={14} style={{ transform: showRoadmapPreview ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
//                   </button>
//                 )}

//                 {/* Full list */}
//                 {showRoadmapPreview && (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
//                     {roadmapUnits.slice(2).map(unit => (
//                       <div key={unit.id} style={{
//                         background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px',
//                         border: '1px solid var(--border)',
//                         opacity: unit.unlocked ? 1 : 0.45,
//                         display: 'flex', alignItems: 'center', gap: 10,
//                       }}>
//                         <div style={{
//                           width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
//                           background: unit.completed ? 'var(--success-soft)' : 'var(--surface-3)',
//                           display: 'flex', alignItems: 'center', justifyContent: 'center',
//                           fontSize: 11, fontWeight: 800,
//                           color: unit.completed ? 'var(--success)' : 'var(--text-muted)',
//                         }}>
//                           {unit.completed ? <CheckCircle2 size={14} /> : unit.unit_number}
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unit.title}</div>
//                           <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
//                             {unit.roadmap_tasks?.length || 0} tasks · {unit.completed ? '✓ Done' : unit.unlocked ? 'Active' : 'Locked'}
//                           </div>
//                         </div>
//                         {!unit.unlocked && <Lock size={12} color="var(--text-muted)" />}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Replace roadmap */}
//                 <label style={{ cursor: 'pointer', alignSelf: 'flex-start' }}>
//                   <input type="file" accept=".xlsx,.xls" onChange={handleRoadmapUpload} style={{ display: 'none' }} disabled={uploadingRoadmap} />
//                   <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
//                     <Upload size={11} /> {uploadingRoadmap ? 'Uploading...' : 'Replace roadmap'}
//                   </span>
//                 </label>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Weekly Focus Panel ── */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, overflow: 'hidden' }}>
//           <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
//               <Calendar size={17} /> This Week
//             </h3>
//             {currentFocus && (
//               <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                 {currentFocus.week_start} → {currentFocus.week_end}
//               </span>
//             )}
//           </div>
//           <div style={{ padding: '20px' }}>
//             {focusLoading ? (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                 {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 10 }} />)}
//               </div>
//             ) : !currentFocus ? (
//               <div style={{ textAlign: 'center', padding: '20px 0' }}>
//                 <Calendar size={32} color="var(--text-muted)" style={{ marginBottom: 10 }} />
//                 <p className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>No weekly focus set.</p>
//                 <button className="btn btn-primary btn-sm" onClick={() => setShowFocusInput(true)}>Set Focus</button>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 <div>
//                   {editingSummary ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                       <textarea className="input" value={summaryValue} onChange={e => setSummaryValue(e.target.value)} style={{ fontSize: 14, minHeight: 50 }} autoFocus />
//                       <div style={{ display: 'flex', gap: 6 }}>
//                         <button onClick={handleSaveSummary} disabled={savingSummary || !summaryValue.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
//                           {savingSummary ? 'Saving...' : 'Save'}
//                         </button>
//                         <button onClick={() => { setEditingSummary(false); setSummaryValue(currentFocus.edited_summary || currentFocus.summary) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
//                       <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.6 }}>{displaySummary}</p>
//                       <button onClick={() => setEditingSummary(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center' }}>
//                         <Pencil size={14} />
//                       </button>
//                     </div>
//                   )}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                     <div style={{ flex: 1, height: 5, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
//                       <div style={{ height: '100%', width: `${completionRate}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
//                     </div>
//                     <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{completedTasks.length}/{focusTasks.length}</span>
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                   {focusTasks.map(task => (
//                     <MentorTaskCard key={task.id} task={task} onSaveNote={handleSaveNote} onSaveEdit={handleSaveEdit} />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── AI Overview ── */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, padding: '24px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
//             <Bot size={18} />
//             <h3 style={{ fontSize: 16 }}>AI Overview</h3>
//             <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 20, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 700 }}>Groq</span>
//           </div>
//           {loading ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//               {[60, 40, 80, 60, 40].map((w, i) => <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 6 }} />)}
//             </div>
//           ) : ai ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//               <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                 {ai.consistency_signal && (
//                   <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ai.consistency_signal === 'Strong' ? 'var(--success-soft)' : ai.consistency_signal === 'Moderate' ? 'var(--accent-soft)' : 'var(--danger-soft)', color: ai.consistency_signal === 'Strong' ? 'var(--success)' : ai.consistency_signal === 'Moderate' ? 'var(--accent)' : 'var(--danger)' }}>
//                     {ai.consistency_signal}
//                   </span>
//                 )}
//                 {ai.learning_depth_pattern && (
//                   <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
//                     {ai.learning_depth_pattern}
//                   </span>
//                 )}
//               </div>
//               {ai.overview && <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{ai.overview}</p>}
//               {(ai.risk_flags?.length > 0 || ai.strength_signals?.length > 0) && (
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                   {ai.risk_flags?.length > 0 && (
//                     <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--danger-soft)' }}>
//                       <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> Risks</div>
//                       {ai.risk_flags.map((f, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>· {f}</div>)}
//                     </div>
//                   )}
//                   {ai.strength_signals?.length > 0 && (
//                     <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--success-soft)' }}>
//                       <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={10} /> Strengths</div>
//                       {ai.strength_signals.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>· {s}</div>)}
//                     </div>
//                   )}
//                 </div>
//               )}
//               {ai.recommendations && (
//                 <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--accent-soft)' }}>
//                   <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Recommendation</div>
//                   <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{ai.recommendations}</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-muted" style={{ fontSize: 14 }}>No overview available yet.</p>
//           )}
//         </div>

//         {/* ── Log History ── */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
//           <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
//             <h3 style={{ fontSize: 16 }}>Log History</h3>
//           </div>
//           {loading ? (
//             <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
//             </div>
//           ) : logs.length === 0 ? (
//             <div style={{ padding: '32px 20px', textAlign: 'center' }}>
//               <p className="text-muted" style={{ fontSize: 14 }}>No logs yet.</p>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//               {logs.map((log, i) => {
//                 const isExpanded = expanded === log.id
//                 return (
//                   <div key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}>
//                     <div onClick={() => setExpanded(isExpanded ? null : log.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer' }}>
//                       <div style={{ width: 28, height: 28, borderRadius: 6, background: log.signed ? 'var(--success-soft)' : log.sent_to_mentor ? 'var(--warning-soft)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                         {log.signed ? <CheckCircle2 size={14} color="var(--success)" /> : log.sent_to_mentor ? <MailOpen size={14} color="var(--warning)" /> : <FileText size={14} color="var(--accent)" />}
//                       </div>
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ fontWeight: 600, fontSize: 14 }}>{log.structured_title || 'Untitled'}</div>
//                       </div>
//                       <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(log.log_date)}</div>
//                       <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
//                     </div>
//                     {isExpanded && (
//                       <div style={{ padding: '0 20px 16px 52px', background: 'var(--surface-2)' }}>
//                         {log.test_attempted && (
//                           <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, marginBottom: 10, fontSize: 11, fontWeight: 600, background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)', color: log.test_passed ? 'var(--success)' : 'var(--danger)' }}>
//                             {log.test_passed ? 'Passed' : 'Not passed'}
//                           </div>
//                         )}
//                         <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
//                           {log.structured_content || log.raw_content}
//                         </p>
//                         {log.signed && log.signed_at && (
//                           <div style={{ marginTop: 10, fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
//                             <PenLine size={12} /> Signed {formatDate(log.signed_at)}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>

//         {/* ── Review Modal ── */}
//         {showReviewModal && reviewPreview && (
//           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setShowReviewModal(false); setEditingReview(false) }}>
//             <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
//               <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//                 <h3 style={{ margin: 0 }}>Weekly Review</h3>
//                 <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                   <button onClick={() => setEditingReview(!editingReview)} style={{ background: editingReview ? 'var(--accent-soft)' : 'var(--surface-2)', border: `1px solid ${editingReview ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: editingReview ? 'var(--accent)' : 'var(--text-muted)' }}>
//                     {editingReview ? 'Preview' : 'Edit'}
//                   </button>
//                   <button onClick={() => { setShowReviewModal(false); setEditingReview(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
//                 </div>
//               </div>
//               <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px', border: '1px solid var(--border)' }}>
//                 {editingReview ? (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                     {['summary', 'progress', 'recommendations', 'next_week_focus'].map(key => (
//                       <textarea key={key} value={reviewPreview[key] || ''} onChange={e => setReviewPreview({ ...reviewPreview, [key]: e.target.value })} style={{ width: '100%', minHeight: 80, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 13, lineHeight: 1.6 }} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     {reviewPreview.summary && (
//                       <>
//                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Summary</div>
//                         <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.summary}</p>
//                       </>
//                     )}
//                     {reviewPreview.recommendations && (
//                       <>
//                         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Recommendations</div>
//                         <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{reviewPreview.recommendations}</p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
//                 <button className="btn btn-secondary" onClick={() => { setShowReviewModal(false); setEditingReview(false) }}>Cancel</button>
//                 <button className="btn btn-primary" onClick={handleConfirmSendReview} disabled={sendingReview}>
//                   {sendingReview ? 'Sending...' : <><Mail size={14} /> Send</>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }