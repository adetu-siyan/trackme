// import { useEffect, useState } from 'react'
// import { projectsApi, weeklyFocusApi } from '../lib/api'
// import { useAuth } from '../context/AuthContext'
// import MentorCreateProjectModal from './modals/MentorCreateProjectModal'
// import MenteeCreateProjectModal from './modals/MenteeCreateProjectModal'
// import ProjectDetail from './ProjectDetail'

// function TaskCard({ task, onToggle, toggling }) {
//   const [expanded, setExpanded] = useState(false)
//   const isToggling = toggling === task.id

//   return (
//     <div style={{
//       background: 'var(--surface)',
//       border: `1px solid ${task.carried_over ? 'rgba(220,38,38,0.25)' : 'var(--border)'}`,
//       borderRadius: 12,
//       overflow: 'hidden',
//       opacity: task.completed ? 0.7 : 1,
//       transition: 'all 0.18s',
//     }}>
//       <div style={{
//         padding: '14px 18px',
//         display: 'flex',
//         alignItems: 'flex-start',
//         gap: 14,
//       }}>
//         {/* Checkbox */}
//         <button
//           onClick={() => onToggle(task.id, task.completed)}
//           disabled={isToggling}
//           style={{
//             width: 22, height: 22, borderRadius: 6, flexShrink: 0,
//             border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border-strong)'}`,
//             background: task.completed ? 'var(--success)' : 'transparent',
//             cursor: isToggling ? 'not-allowed' : 'pointer',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             transition: 'all 0.18s', marginTop: 2,
//           }}
//         >
//           {task.completed && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
//           {isToggling && <span style={{ fontSize: 10 }}>⏳</span>}
//         </button>

//         {/* Content */}
//         <div
//           style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
//           onClick={() => setExpanded(v => !v)}
//         >
//           <div style={{
//             fontWeight: 600, fontSize: 14, marginBottom: 4,
//             textDecoration: task.completed ? 'line-through' : 'none',
//             color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
//             display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
//           }}>
//             {task.title}
//             {task.carried_over && !task.completed && (
//               <span style={{
//                 fontSize: 10, fontWeight: 700,
//                 color: 'var(--danger)', background: 'var(--danger-soft)',
//                 padding: '2px 6px', borderRadius: 4,
//               }}>CARRY-OVER</span>
//             )}
//             {task.mentor_note && (
//               <span style={{
//                 fontSize: 10, fontWeight: 700,
//                 color: 'var(--accent)', background: 'var(--accent-soft)',
//                 padding: '2px 6px', borderRadius: 4,
//               }}>📌 NOTE</span>
//             )}
//           </div>

//           {task.description && (
//             <p style={{
//               fontSize: 12, color: 'var(--text-muted)',
//               lineHeight: 1.5, margin: '0 0 6px',
//             }}>
//               {task.description}
//             </p>
//           )}

//           <div style={{
//             fontSize: 11, color: 'var(--text-muted)',
//             display: 'flex', alignItems: 'center', gap: 4,
//           }}>
//             {expanded ? '▲ less' : '▼ more'}
//           </div>
//         </div>
//       </div>

//       {/* Expanded — mentor note only */}
//       {expanded && (
//         <div style={{
//           borderTop: '1px solid var(--border)',
//           padding: '14px 18px',
//           background: 'var(--surface-2)',
//         }}>
//           {task.mentor_note ? (
//             <div>
//               <div style={{
//                 fontSize: 11, fontWeight: 700, color: 'var(--accent)',
//                 textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
//               }}>
//                 📌 Mentor's Note
//               </div>
//               <div style={{
//                 padding: '12px 16px', borderRadius: 10,
//                 background: 'var(--accent-soft)',
//                 border: '1px solid var(--border)',
//                 fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
//               }}>
//                 {task.mentor_note}
//               </div>
//             </div>
//           ) : (
//             <p style={{
//               fontSize: 13, color: 'var(--text-muted)',
//               margin: 0, fontStyle: 'italic',
//             }}>
//               No mentor note for this task.
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// function WeeklyTasksView() {
//   const [data, setData] = useState({ focus: null, tasks: [], stats: null })
//   const [loading, setLoading] = useState(true)
//   const [toggling, setToggling] = useState(null)

//   useEffect(() => {
//     weeklyFocusApi.myTasks()
//       .then(res => setData(res))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   async function toggleTask(taskId, current) {
//     setToggling(taskId)
//     try {
//       await weeklyFocusApi.updateTask(taskId, !current)
//       setData(prev => {
//         const updated = prev.tasks.map(t =>
//           t.id === taskId ? { ...t, completed: !current } : t
//         )
//         const completed = updated.filter(t => t.completed).length
//         const total = updated.length
//         return {
//           ...prev,
//           tasks: updated,
//           stats: {
//             ...prev.stats,
//             completed,
//             remaining: total - completed,
//             completion_rate: Math.round((completed / total) * 100),
//           }
//         }
//       })
//     } catch (e) {
//       alert(e.message)
//     } finally {
//       setToggling(null)
//     }
//   }

//   if (loading) return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//       {[1, 2, 3].map(i => (
//         <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
//       ))}
//     </div>
//   )

//   if (!data.focus) return (
//     <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//       <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
//       <h3 style={{ marginBottom: 8 }}>No weekly focus yet</h3>
//       <p className="text-muted" style={{ fontSize: 14 }}>
//         Your mentor hasn't set your focus for this week yet. Check back soon.
//       </p>
//     </div>
//   )

//   const stats = data.stats || {}
//   const barColor = stats.completion_rate >= 80
//     ? 'var(--success)' : stats.completion_rate >= 50
//     ? 'var(--warning)' : 'var(--danger)'

//   const carriedOver = data.tasks.filter(t => t.carried_over && !t.completed)
//   const regular = data.tasks.filter(t => !t.carried_over && !t.completed)
//   const done = data.tasks.filter(t => t.completed)

//   const displaySummary = data.focus.edited_summary || data.focus.summary

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//       {/* Focus header */}
//       <div className="card" style={{ padding: '24px 28px' }}>
//         <div style={{
//           display: 'flex', alignItems: 'flex-start',
//           justifyContent: 'space-between', gap: 16,
//           marginBottom: 16, flexWrap: 'wrap',
//         }}>
//           <div style={{ flex: 1 }}>
//             <div style={{
//               fontSize: 11, letterSpacing: '2px', fontWeight: 700,
//               color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6,
//             }}>
//               This Week's Focus
//             </div>
//             <h3 style={{ marginBottom: 4 }}>{displaySummary}</h3>
//             <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
//               {data.focus.week_start} → {data.focus.week_end}
//             </p>
//           </div>
//           <div style={{ textAlign: 'right', flexShrink: 0 }}>
//             <div style={{ fontSize: 32, fontWeight: 900, color: barColor }}>
//               {stats.completion_rate}%
//             </div>
//             <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//               {stats.completed}/{stats.total} done
//             </div>
//           </div>
//         </div>
//         <div style={{
//           height: 8, background: 'var(--surface-3)',
//           borderRadius: 4, overflow: 'hidden',
//         }}>
//           <div style={{
//             height: '100%', width: `${stats.completion_rate}%`,
//             background: barColor, borderRadius: 4, transition: 'width 0.3s ease',
//           }} />
//         </div>
//       </div>

//       {/* Carried over */}
//       {carriedOver.length > 0 && (
//         <div>
//           <div style={{
//             display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
//           }}>
//             <span style={{ fontSize: 16 }}>🚨</span>
//             <div style={{
//               fontSize: 13, fontWeight: 700, color: 'var(--danger)',
//               textTransform: 'uppercase', letterSpacing: '1px',
//             }}>
//               Blockers from Last Week
//             </div>
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//             {carriedOver.map(task => (
//               <TaskCard
//                 key={task.id}
//                 task={task}
//                 onToggle={toggleTask}
//                 toggling={toggling}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* This week */}
//       {regular.length > 0 && (
//         <div>
//           <div style={{
//             fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
//             textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12,
//           }}>
//             This Week
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//             {regular.map(task => (
//               <TaskCard
//                 key={task.id}
//                 task={task}
//                 onToggle={toggleTask}
//                 toggling={toggling}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Completed */}
//       {done.length > 0 && (
//         <div>
//           <div style={{
//             fontSize: 13, fontWeight: 700, color: 'var(--success)',
//             textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12,
//           }}>
//             ✅ Completed ({done.length})
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//             {done.map(task => (
//               <TaskCard
//                 key={task.id}
//                 task={task}
//                 onToggle={toggleTask}
//                 toggling={toggling}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function ProjectCard({ project: p, statusBg, statusColor, onClick }) {
//   return (
//     <div
//       className="card"
//       onClick={onClick}
//       style={{
//         display: 'flex', flexDirection: 'column', gap: 12,
//         cursor: 'pointer', transition: 'all 0.18s',
//       }}
//       onMouseEnter={e => {
//         e.currentTarget.style.borderColor = 'var(--accent)'
//         e.currentTarget.style.transform = 'translateY(-2px)'
//         e.currentTarget.style.boxShadow = 'var(--shadow-md)'
//       }}
//       onMouseLeave={e => {
//         e.currentTarget.style.borderColor = 'var(--border)'
//         e.currentTarget.style.transform = 'translateY(0)'
//         e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
//       }}
//     >
//       <div style={{
//         display: 'flex', alignItems: 'flex-start',
//         justifyContent: 'space-between', gap: 10,
//       }}>
//         <h3 style={{ fontSize: 16, lineHeight: 1.4 }}>{p.title}</h3>
//         <span style={{
//           padding: '3px 10px', borderRadius: 20,
//           fontSize: 11, fontWeight: 700,
//           background: statusBg[p.status] || 'var(--surface-2)',
//           color: statusColor[p.status] || 'var(--text-muted)',
//           flexShrink: 0,
//         }}>
//           {p.status}
//         </span>
//       </div>

//       {p.description && (
//         <p style={{
//           fontSize: 13, color: 'var(--text-secondary)',
//           lineHeight: 1.6, margin: 0,
//           display: '-webkit-box', WebkitLineClamp: 2,
//           WebkitBoxOrient: 'vertical', overflow: 'hidden',
//         }}>
//           {p.description}
//         </p>
//       )}

//       <div style={{
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', marginTop: 'auto',
//       }}>
//         <span style={{
//           padding: '3px 10px', borderRadius: 20,
//           fontSize: 11, fontWeight: 600,
//           background: p.role === 'creator' ? 'var(--accent-soft)' : 'var(--surface-2)',
//           color: p.role === 'creator' ? 'var(--accent)' : 'var(--text-muted)',
//         }}>
//           {p.role === 'creator' ? '👑 Owner' : '👤 Member'}
//         </span>
//         {p.deadline && (
//           <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//             Due {new Date(p.deadline).toLocaleDateString('en-US', {
//               month: 'short', day: 'numeric',
//             })}
//           </span>
//         )}
//       </div>

//       <div style={{
//         fontSize: 12, color: 'var(--accent)', fontWeight: 600,
//         display: 'flex', alignItems: 'center', gap: 4,
//         paddingTop: 4, borderTop: '1px solid var(--border)',
//       }}>
//         View project details →
//       </div>
//     </div>
//   )
// }

// export default function Projects() {
//   const { isMentor } = useAuth()
//   const [projects, setProjects] = useState({ created: [], assigned: [] })
//   const [loading, setLoading] = useState(true)
//   const [showCreate, setShowCreate] = useState(false)
//   const [activeTab, setActiveTab] = useState('tasks')
//   const [selectedProject, setSelectedProject] = useState(null)

//   async function load() {
//     try {
//       const res = await projectsApi.myProjects()
//       setProjects(res)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [])

//   function handleProjectEnded(projectId) {
//     setProjects(prev => ({
//       created: prev.created.filter(p => p.id !== projectId),
//       assigned: prev.assigned.filter(p => p.id !== projectId),
//     }))
//     setSelectedProject(null)
//   }

//   const allProjects = [
//     ...projects.created.map(p => ({ ...p, role: 'creator' })),
//     ...projects.assigned.map(p => ({ ...p, role: 'member' })),
//   ]

//   const statusColor = {
//     active: 'var(--success)',
//     completed: 'var(--accent)',
//     paused: 'var(--warning)',
//   }
//   const statusBg = {
//     active: 'var(--success-soft)',
//     completed: 'var(--accent-soft)',
//     paused: 'var(--warning-soft)',
//   }

//   if (selectedProject) {
//     return (
//       <ProjectDetail
//         project={selectedProject}
//         onBack={() => setSelectedProject(null)}
//         onEnded={handleProjectEnded}
//       />
//     )
//   }

//   return (
//     <div className="page">
//       <div style={{
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         marginBottom: 24, flexWrap: 'wrap', gap: 12,
//       }}>
//         <h1>Projects</h1>
//         <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
//           + New Project
//         </button>
//       </div>

//       <div style={{
//         display: 'flex', gap: 4,
//         background: 'var(--surface-2)',
//         borderRadius: 12, padding: 4,
//         marginBottom: 24, width: 'fit-content',
//       }}>
//         {[
//           { id: 'tasks', label: '📅 Weekly Focus' },
//           { id: 'projects', label: '📋 Projects' },
//         ].map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             style={{
//               padding: '8px 18px', borderRadius: 9, border: 'none',
//               cursor: 'pointer', fontFamily: 'Urbanist, sans-serif',
//               fontSize: 13, fontWeight: 600,
//               background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
//               color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
//               boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
//               transition: 'all 0.18s',
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {activeTab === 'tasks' && <WeeklyTasksView />}

//       {activeTab === 'projects' && (
//         <>
//           {loading ? (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//               {[1, 2, 3].map(i => (
//                 <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
//               ))}
//             </div>
//           ) : allProjects.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//               <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
//               <h3 style={{ marginBottom: 8 }}>No projects yet</h3>
//               <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
//                 {isMentor
//                   ? 'Create a project to organise your logs and assign tasks to mentees.'
//                   : 'Your mentor will assign you to a project, or create your own to track personal work.'}
//               </p>
//               <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
//                 Create your first project
//               </button>
//             </div>
//           ) : (
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//               gap: 16,
//             }}>
//               {allProjects.map(p => (
//                 <ProjectCard
//                   key={p.id}
//                   project={p}
//                   statusBg={statusBg}
//                   statusColor={statusColor}
//                   onClick={() => setSelectedProject(p)}
//                 />
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {showCreate && (
//         isMentor ? (
//           <MentorCreateProjectModal
//             onClose={() => setShowCreate(false)}
//             onCreated={() => { setShowCreate(false); load() }}
//           />
//         ) : (
//           <MenteeCreateProjectModal
//             onClose={() => setShowCreate(false)}
//             onCreated={() => { setShowCreate(false); load() }}
//           />
//         )
//       )}
//     </div>
//   )
// }



import { useEffect, useState } from 'react'
import { projectsApi, weeklyFocusApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import MentorCreateProjectModal from './modals/MentorCreateProjectModal'
import MenteeCreateProjectModal from './modals/MenteeCreateProjectModal'
import ProjectDetail from './ProjectDetail'

// ── TASK ROW ───────────────────────────────────────────────────
function TaskRow({ task, onToggle, toggling }) {
  const isToggling = toggling === task.id

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 4px',
      borderBottom: '1px solid var(--border)',
      opacity: task.completed ? 0.5 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* Minimal Checkbox */}
      <button
        onClick={() => onToggle(task.id, task.completed)}
        disabled={isToggling}
        style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${task.completed ? 'var(--success)' : 'var(--border-strong)'}`,
          background: task.completed ? 'var(--success)' : 'transparent',
          cursor: isToggling ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {task.completed && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
      </button>

      {/* Task Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: 14,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
          {task.title}
          {task.carried_over && !task.completed && (
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 600,
              color: 'var(--danger)', background: 'var(--danger-soft)',
              padding: '1px 6px', borderRadius: 4,
            }}>
              ⚠️ Carry-over
            </span>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <span style={{
        fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
        color: 'var(--text-muted)', background: 'var(--surface-3)', flexShrink: 0,
      }}>
        {task.category}
      </span>
    </div>
  )
}

// ── PROJECT CARD ──────────────────────────────────────────────
function ProjectCard({ project: p, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
        {p.title}
      </div>
      
      {p.description && (
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)',
          lineHeight: 1.5, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {p.description}
        </p>
      )}

      <div style={{
        marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--text-muted)',
      }}>
        <span>
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </span>
        <span>
          {new Date(p.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </span>
      </div>
    </div>
  )
}

// ── WEEKLY TASKS ACCORDION ────────────────────────────────────
function WeeklyTasksAccordion() {
  const [data, setData] = useState({ focus: null, tasks: [], stats: null })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [expandedBlocks, setExpandedBlocks] = useState({ blockers: true, active: true, completed: true })

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
      setData(prev => {
        const updated = prev.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !current } : t
        )
        const completed = updated.filter(t => t.completed).length
        const total = updated.length
        return {
          ...prev,
          tasks: updated,
          stats: {
            ...prev.stats,
            completed,
            remaining: total - completed,
            completion_rate: Math.round((completed / total) * 100),
          }
        }
      })
    } catch (e) {
      alert(e.message)
    } finally {
      setToggling(null)
    }
  }

  const toggleBlock = (block) => {
    setExpandedBlocks(prev => ({ ...prev, [block]: !prev[block] }))
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 30, borderRadius: 6 }} />
      ))}
    </div>
  )

  if (!data.focus) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
      <p className="text-muted" style={{ fontSize: 14 }}>
        No weekly focus has been set for this week.
      </p>
    </div>
  )

  const displaySummary = data.focus.edited_summary || data.focus.summary
  const carriedOver = data.tasks.filter(t => t.carried_over && !t.completed)
  const regular = data.tasks.filter(t => !t.carried_over && !t.completed)
  const done = data.tasks.filter(t => t.completed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Blockers */}
      {carriedOver.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--border)', padding: '4px 0' }}>
          <div
            onClick={() => toggleBlock('blockers')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 4px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🚨 Blockers</span>
              <span style={{ fontSize: 11, background: 'var(--danger-soft)', padding: '0 6px', borderRadius: 4 }}>{carriedOver.length}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {expandedBlocks.blockers ? '▲' : '▼'}
            </span>
          </div>

          {expandedBlocks.blockers && (
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 4 }}>
              {carriedOver.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} toggling={toggling} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Tasks */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '4px 0' }}>
        <div
          onClick={() => toggleBlock('active')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 4px', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📋 This Week</span>
            <span style={{ fontSize: 11, background: 'var(--surface-2)', padding: '0 6px', borderRadius: 4 }}>{regular.length}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {expandedBlocks.active ? '▲' : '▼'}
          </span>
        </div>

        {expandedBlocks.active && (
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 4 }}>
            {regular.length > 0 ? (
              regular.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} toggling={toggling} />
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 4px', fontStyle: 'italic' }}>
                All caught up! No active tasks remaining.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div style={{ padding: '4px 0' }}>
          <div
            onClick={() => toggleBlock('completed')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 4px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✅ Completed</span>
              <span style={{ fontSize: 11, background: 'var(--success-soft)', padding: '0 6px', borderRadius: 4 }}>{done.length}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {expandedBlocks.completed ? '▲' : '▼'}
            </span>
          </div>

          {expandedBlocks.completed && (
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 4 }}>
              {done.map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} toggling={toggling} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function Projects() {
  const { isMentor } = useAuth()
  const [projects, setProjects] = useState({ created: [], assigned: [] })
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  async function load() {
    try {
      const res = await projectsApi.myProjects()
      setProjects(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleProjectEnded(projectId) {
    setProjects(prev => ({
      created: prev.created.filter(p => p.id !== projectId),
      assigned: prev.assigned.filter(p => p.id !== projectId),
    }))
    setSelectedProject(null)
  }

  // ── Combine & Sort Projects by creation date (Newest first) ──
  const allProjects = [
    ...projects.created.map(p => ({ ...p, role: 'creator' })),
    ...projects.assigned.map(p => ({ ...p, role: 'member' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onEnded={handleProjectEnded}
      />
    )
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 80px 0' }}>
      
      {/* Centralized Container */}
      <div style={{ width: '100%', maxWidth: 780, padding: '0 24px' }}>

        {/* ── Page Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 32, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h1 style={{ marginBottom: 4, fontWeight: 700, fontSize: '1.8rem' }}>
              Projects
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Manage your ongoing projects and weekly focus
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        </div>

        {/* ── Section 1: Weekly Tasks ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', margin: 0 }}>
              Weekly Focus
            </h2>
          </div>
          <WeeklyTasksAccordion />
        </div>

        {/* ── Section 2: Projects ── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', margin: 0 }}>
              All Projects
            </h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {allProjects.length} project{allProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Projects Grid */}
          {loadingProjects ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2].map(i => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
              ))}
            </div>
          ) : allProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>No projects yet</h3>
              <p className="text-muted" style={{ fontSize: 14, marginBottom: 20, maxWidth: 320, marginInline: 'auto' }}>
                {isMentor
                  ? 'Create a project to organize your logs and assign tasks to mentees.'
                  : 'Your mentor will assign you to a project, or create your own to track personal work.'}
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                Create your first project
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {allProjects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => setSelectedProject(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modals */}
      {showCreate && (
        isMentor ? (
          <MentorCreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); load() }}
          />
        ) : (
          <MenteeCreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); load() }}
          />
        )
      )}
    </div>
  )
}