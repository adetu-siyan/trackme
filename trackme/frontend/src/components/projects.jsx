import { useEffect, useState } from 'react'
import { projectsApi, weeklyFocusApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import CreateProjectModal from './modals/CreateProjectModal'

const CATEGORY_COLORS = {
  Backend:   { bg: '#EDE9FE', color: '#7C3AED' },
  Frontend:  { bg: '#E0F2FE', color: '#0369A1' },
  Database:  { bg: '#FEF3C7', color: '#D97706' },
  'AI/ML':   { bg: '#D1FAE5', color: '#059669' },
  DevOps:    { bg: '#FCE7F3', color: '#DB2777' },
  Reading:   { bg: '#F3F4F6', color: '#6B7280' },
  Writing:   { bg: '#FFF7ED', color: '#C2410C' },
  Other:     { bg: '#F5F3FF', color: '#7C3AED' },
}

function categoryStyle(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other
}

function TaskCard({ task, onToggle, toggling, isMentor, onEdit }) {
  const catStyle = categoryStyle(task.category)
  const isToggling = toggling === task.id

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${task.carried_over ? 'var(--danger-soft)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      opacity: task.completed ? 0.65 : 1,
      transition: 'all 0.18s',
    }}>
      <button
        onClick={() => onToggle(task.id, task.completed)}
        disabled={isToggling}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border-strong)'}`,
          background: task.completed ? 'var(--success)' : 'transparent',
          cursor: isToggling ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s', marginTop: 1,
        }}
      >
        {task.completed && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
        {isToggling && <span style={{ fontSize: 10 }}>⏳</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14, marginBottom: 4,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
          {task.title}
          {task.carried_over && !task.completed && (
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 700,
              color: 'var(--danger)', background: 'var(--danger-soft)',
              padding: '2px 6px', borderRadius: 4,
            }}>CARRY-OVER</span>
          )}
        </div>
        {task.description && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 6px' }}>
            {task.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: catStyle.bg, color: catStyle.color,
          }}>
            {task.category}
          </span>
          {task.suggested_time && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              🕐 {task.suggested_time}
            </span>
          )}
        </div>
      </div>

      {isMentor && onEdit && (
        <button
          onClick={() => onEdit(task)}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-muted)',
            fontFamily: 'Urbanist, sans-serif', fontWeight: 600,
            flexShrink: 0, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ✏️ Edit
        </button>
      )}
    </div>
  )
}

function WeeklyTasksView({ isMentor }) {
  const [data, setData] = useState({ focus: null, tasks: [], stats: null })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    weeklyFocusApi.myTasks()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function toggleTask(taskId, current) {
    setToggling(taskId)
    try {
      await weeklyFocusApi.updateTask(taskId, !current)
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !current } : t
        ),
        stats: {
          ...prev.stats,
          completed: prev.tasks.filter(t =>
            t.id === taskId ? !current : t.completed
          ).length,
          remaining: prev.tasks.filter(t =>
            t.id === taskId ? current : !t.completed
          ).length,
          completion_rate: Math.round(
            (prev.tasks.filter(t =>
              t.id === taskId ? !current : t.completed
            ).length / prev.tasks.length) * 100
          ),
        }
      }))
    } catch (e) {
      alert(e.message)
    } finally {
      setToggling(null)
    }
  }

  async function handleSaveTaskEdit() {
    if (!editingTask) return
    setSavingEdit(true)
    try {
      await weeklyFocusApi.updateTaskContent(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        category: editingTask.category,
      })
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === editingTask.id ? { ...t, ...editingTask } : t
        )
      }))
      setEditingTask(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
    </div>
  )

  if (!data.focus) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
      <h3 style={{ marginBottom: 8 }}>No weekly focus yet</h3>
      <p className="text-muted" style={{ fontSize: 14 }}>
        Your mentor hasn't set your focus for this week yet. Check back soon.
      </p>
    </div>
  )

  const stats = data.stats || {}
  const barColor = stats.completion_rate >= 80
    ? 'var(--success)' : stats.completion_rate >= 50
    ? 'var(--warning)' : 'var(--danger)'

  const carriedOver = data.tasks.filter(t => t.carried_over && !t.completed)
  const regular = data.tasks.filter(t => !t.carried_over && !t.completed)
  const done = data.tasks.filter(t => t.completed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Focus summary + progress */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '2px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
              This Week's Focus
            </div>
            <h3 style={{ marginBottom: 4 }}>{data.focus.summary}</h3>
            <p className="text-muted" style={{ fontSize: 13 }}>
              {data.focus.week_start} → {data.focus.week_end}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: barColor }}>
              {stats.completion_rate}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {stats.completed}/{stats.total} done
            </div>
          </div>
        </div>
        <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${stats.completion_rate}%`,
            background: barColor,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Carried-over blockers */}
      {carriedOver.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🚨</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Blockers from Last Week
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {carriedOver.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                toggling={toggling}
                isMentor={isMentor}
                onEdit={isMentor ? (t) => setEditingTask({ ...t }) : null}
              />
            ))}
          </div>
        </div>
      )}

      {/* This week's tasks */}
      {regular.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            This Week
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {regular.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                toggling={toggling}
                isMentor={isMentor}
                onEdit={isMentor ? (t) => setEditingTask({ ...t }) : null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            ✅ Completed ({done.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                toggling={toggling}
                isMentor={isMentor}
                onEdit={isMentor ? (t) => setEditingTask({ ...t }) : null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit task modal */}
      {editingTask && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 300, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 20,
          }}
          onClick={() => setEditingTask(null)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: '28px',
              width: '100%', maxWidth: 500,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: 0 }}>Edit Task</h3>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Title
              </label>
              <input
                className="input"
                value={editingTask.title}
                onChange={e => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Description (optional)
              </label>
              <textarea
                className="input"
                style={{ minHeight: 80, lineHeight: 1.6 }}
                value={editingTask.description || ''}
                onChange={e => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Category
              </label>
              <select
                className="input"
                value={editingTask.category}
                onChange={e => setEditingTask(prev => ({ ...prev, category: e.target.value }))}
              >
                {['Backend', 'Frontend', 'Database', 'AI/ML', 'DevOps', 'Reading', 'Writing', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingTask(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTaskEdit}
                disabled={savingEdit || !editingTask.title.trim()}
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project: p, statusBg, statusColor, onEnded }) {
  const [completion, setCompletion] = useState(null)
  const [loadingCompletion, setLoadingCompletion] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [ending, setEnding] = useState(false)

  async function loadCompletion() {
    if (completion) { setExpanded(e => !e); return }
    setExpanded(true)
    setLoadingCompletion(true)
    try {
      const res = await projectsApi.getCompletion(p.id)
      setCompletion(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCompletion(false)
    }
  }

  async function handleEndProject() {
    if (!window.confirm('End this project? It will be removed from your projects list.')) return
    setEnding(true)
    try {
      await projectsApi.endProject(p.id)
      if (onEnded) onEnded(p.id)
    } catch (e) {
      alert(e.message)
      setEnding(false)
    }
  }

  const barColor = !completion ? 'var(--accent)'
    : completion.completion_rate >= 80 ? 'var(--success)'
    : completion.completion_rate >= 50 ? 'var(--warning)'
    : 'var(--danger)'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <h3 style={{ fontSize: 16, lineHeight: 1.4 }}>{p.title}</h3>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: statusBg[p.status] || 'var(--surface-2)',
          color: statusColor[p.status] || 'var(--text-muted)',
          flexShrink: 0,
        }}>
          {p.status}
        </span>
      </div>

      {p.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {p.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: p.role === 'creator' ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: p.role === 'creator' ? 'var(--accent)' : 'var(--text-muted)',
        }}>
          {p.role === 'creator' ? '👑 Owner' : '👤 Member'}
        </span>
        {p.deadline && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Due {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <button
        onClick={loadCompletion}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
          fontFamily: 'Urbanist, sans-serif', fontSize: 12, fontWeight: 600,
          color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.18s', width: '100%', justifyContent: 'center',
        }}
      >
        {loadingCompletion
          ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Analysing logs...</>
          : expanded ? '▲ Hide AI Completion' : '🤖 Check AI Completion'}
      </button>

      {p.role === 'creator' && (
        <button
          onClick={handleEndProject}
          disabled={ending}
          style={{
            background: 'none',
            border: '1px solid var(--danger-soft)',
            borderRadius: 8, padding: '7px 12px',
            cursor: ending ? 'not-allowed' : 'pointer',
            fontFamily: 'Urbanist, sans-serif',
            fontSize: 12, fontWeight: 600,
            color: 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.18s',
            width: '100%', justifyContent: 'center',
          }}
          onMouseEnter={e => { if (!ending) e.currentTarget.style.background = 'var(--danger-soft)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
        >
          {ending ? '⏳ Ending...' : '🔴 End Project'}
        </button>
      )}

      {expanded && completion && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: 10,
          padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                AI Estimated Completion
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: barColor }}>
                {completion.completion_rate}%
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${completion.completion_rate}%`,
                background: barColor, borderRadius: 3, transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Based on {completion.log_count} log{completion.log_count !== 1 ? 's' : ''} tagged to this project
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {completion.assessment}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {completion.covered_areas?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>✅ Covered</div>
                {completion.covered_areas.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0' }}>· {a}</div>
                ))}
              </div>
            )}
            {completion.missing_areas?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>⬜ Missing</div>
                {completion.missing_areas.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0' }}>· {a}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Projects() {
  const { isMentor } = useAuth()
  const [projects, setProjects] = useState({ created: [], assigned: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  async function load() {
    try {
      const res = await projectsApi.myProjects()
      setProjects(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleProjectEnded(projectId) {
    setProjects(prev => ({
      created: prev.created.filter(p => p.id !== projectId),
      assigned: prev.assigned.filter(p => p.id !== projectId),
    }))
  }

  const allProjects = [
    ...projects.created.map(p => ({ ...p, role: 'creator' })),
    ...projects.assigned.map(p => ({ ...p, role: 'member' })),
  ]

  const statusColor = {
    active: 'var(--success)', completed: 'var(--accent)', paused: 'var(--warning)',
  }
  const statusBg = {
    active: 'var(--success-soft)', completed: 'var(--accent-soft)', paused: 'var(--warning-soft)',
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Project
        </button>
      </div>

      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--surface-2)',
        borderRadius: 12, padding: 4,
        marginBottom: 24, width: 'fit-content',
      }}>
        {[
          { id: 'tasks', label: '📅 Weekly Focus' },
          { id: 'projects', label: '📋 Projects' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
              fontSize: 13, fontWeight: 600,
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <WeeklyTasksView isMentor={isMentor} />
      )}

      {activeTab === 'projects' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
            </div>
          ) : allProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ marginBottom: 8 }}>No projects yet</h3>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
                Create a project to organise your logs and assign tasks to mentees.
              </p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create your first project
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {allProjects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  statusBg={statusBg}
                  statusColor={statusColor}
                  onEnded={handleProjectEnded}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load() }}
        />
      )}
    </div>
  )
}