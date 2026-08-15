// import { useState, useEffect } from 'react'
// import { roadmapApi } from '../lib/api'
// import {
//   BookOpen, CheckCircle2, Lock, ChevronDown, ChevronUp,
//   Target, Link, FileText, X, AlertTriangle, Trophy
// } from 'lucide-react'

// // ── Test Modal ────────────────────────────────────────────────
// function TestModal({ test, onSubmit, onClose }) {
//   const [answers, setAnswers] = useState({})
//   const [submitting, setSubmitting] = useState(false)
//   const [result, setResult] = useState(null)

//   async function handleSubmit() {
//     if (Object.keys(answers).length < test.questions.length) {
//       alert('Please answer all questions before submitting.')
//       return
//     }
//     setSubmitting(true)
//     try {
//       const res = await roadmapApi.submitTest(test.test_id, answers)
//       setResult(res)
//     } catch (e) {
//       alert(e.message || 'Submission failed')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const allAnswered = Object.keys(answers).length === (test.questions?.length || 0)

//   return (
//     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
//       <div style={{ background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

//         {/* Header */}
//         <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
//           <div>
//             <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Task Test · 10 Questions</div>
//             <h3 style={{ margin: 0, fontSize: 16 }}>{test.task_title}</h3>
//           </div>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 12 }}><X size={20} /></button>
//         </div>

//         {result ? (
//           /* Result screen */
//           <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
//             <div style={{
//               width: 80, height: 80, borderRadius: '50%',
//               background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}>
//               {result.passed
//                 ? <Trophy size={36} color="var(--success)" />
//                 : <AlertTriangle size={36} color="var(--danger)" />}
//             </div>
//             <div>
//               <div style={{ fontSize: 42, fontWeight: 900, color: result.passed ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>{result.score}%</div>
//               <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{result.correct}/{result.total} correct</div>
//             </div>
//             <div style={{ padding: '12px 20px', borderRadius: 12, background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)', width: '100%' }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: result.passed ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
//                 {result.passed ? '✓ Passed' : '✗ Not passed'}
//               </div>
//               <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
//                 {result.passed ? 'Task marked complete. Next unit unlocked if all tasks in this unit are done.' : 'Review the task and try again when you feel ready.'}
//               </div>
//             </div>
//             <button onClick={() => { onSubmit(result); onClose() }} className="btn btn-primary" style={{ width: '100%' }}>
//               Continue
//             </button>
//           </div>
//         ) : (
//           /* Questions */
//           <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
//             {test.questions.map((q, i) => (
//               <div key={i}>
//                 <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.5 }}>
//                   <span style={{ color: 'var(--accent)', marginRight: 6 }}>{i + 1}.</span>{q.question}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   {Object.entries(q.options).map(([key, val]) => {
//                     const selected = answers[String(i)] === key
//                     return (
//                       <button
//                         key={key}
//                         onClick={() => setAnswers(prev => ({ ...prev, [String(i)]: key }))}
//                         style={{
//                           background: selected ? 'var(--accent)' : 'var(--surface-2)',
//                           border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
//                           borderRadius: 10, padding: '10px 14px',
//                           cursor: 'pointer', textAlign: 'left',
//                           display: 'flex', alignItems: 'center', gap: 10,
//                           transition: 'all 0.15s',
//                         }}
//                       >
//                         <span style={{
//                           width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
//                           background: selected ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
//                           display: 'flex', alignItems: 'center', justifyContent: 'center',
//                           fontSize: 11, fontWeight: 800,
//                           color: selected ? '#fff' : 'var(--text-muted)',
//                         }}>{key}</span>
//                         <span style={{ fontSize: 13, color: selected ? '#fff' : 'var(--text-secondary)', lineHeight: 1.4 }}>{val}</span>
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>
//             ))}

//             {/* Progress indicator */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
//               <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
//                 <div style={{ height: '100%', width: `${(Object.keys(answers).length / test.questions.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
//               </div>
//               <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
//                 {Object.keys(answers).length}/{test.questions.length}
//               </span>
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={!allAnswered || submitting}
//               className="btn btn-primary"
//               style={{ width: '100%', opacity: !allAnswered ? 0.5 : 1 }}
//             >
//               {submitting ? 'Submitting...' : 'Submit Test'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Unit Card ─────────────────────────────────────────────────
// function UnitCard({ unit, onTaskComplete }) {
//   const [expanded, setExpanded] = useState(false)
//   const [tasks, setTasks] = useState(unit.roadmap_tasks || [])
//   const [activeTest, setActiveTest] = useState(null)
//   const [completingTask, setCompletingTask] = useState(null)

//   const completedCount = tasks.filter(t => t.completed).length
//   const totalCount = tasks.length
//   const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

//   async function handleComplete(task) {
//     if (task.completed || !unit.unlocked || unit.completed) return
//     setCompletingTask(task.id)
//     try {
//       const res = await roadmapApi.completeTask(task.id)
//       setActiveTest({
//         test_id: res.test_id,
//         task_title: task.title,
//         questions: res.questions,
//       })
//       setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t))
//       if (res.unit_completed) onTaskComplete()
//     } catch (e) {
//       alert(e.message || 'Failed to mark complete')
//     } finally {
//       setCompletingTask(null)
//     }
//   }

//   const statusColor = unit.completed ? 'var(--success)' : unit.unlocked ? 'var(--accent)' : 'var(--text-muted)'
//   const statusBg = unit.completed ? 'var(--success-soft)' : unit.unlocked ? 'var(--accent-soft)' : 'var(--surface-3)'
//   const statusLabel = unit.completed ? 'Complete' : unit.unlocked ? 'Active' : 'Locked'

//   return (
//     <>
//       {activeTest && (
//         <TestModal
//           test={activeTest}
//           onSubmit={() => {}}
//           onClose={() => setActiveTest(null)}
//         />
//       )}

//       <div style={{
//         background: 'var(--surface)',
//         border: `1px solid ${unit.unlocked && !unit.completed ? 'var(--accent)' : 'var(--border)'}`,
//         borderRadius: 14, overflow: 'hidden',
//         opacity: unit.unlocked ? 1 : 0.5,
//         transition: 'all 0.18s',
//         boxShadow: unit.unlocked && !unit.completed ? '0 0 0 1px var(--accent-soft)' : 'none',
//       }}>
//         {/* Unit header */}
//         <div
//           onClick={() => unit.unlocked && setExpanded(!expanded)}
//           style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: unit.unlocked ? 'pointer' : 'default' }}
//         >
//           <div style={{
//             width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
//             background: statusBg,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 13, fontWeight: 800, color: statusColor,
//           }}>
//             {unit.completed ? <CheckCircle2 size={18} /> : unit.unlocked ? unit.unit_number : <Lock size={15} />}
//           </div>

//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{unit.title}</div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
//               <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
//               {unit.unlocked && <><span>·</span><span>{completedCount}/{totalCount} tasks</span></>}
//             </div>
//           </div>

//           {unit.unlocked && totalCount > 0 && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <div style={{ width: 48, height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
//                 <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: 2 }} />
//               </div>
//               {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
//             </div>
//           )}
//           {!unit.unlocked && <Lock size={14} color="var(--text-muted)" />}
//         </div>

//         {/* Expanded content */}
//         {expanded && unit.unlocked && (
//           <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>

//             {/* Goal */}
//             {unit.goal && (
//               <div style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8 }}>
//                 <Target size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
//                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.goal}</p>
//               </div>
//             )}

//             {/* Tasks */}
//             {tasks.length > 0 && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
//                 <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Tasks</div>
//                 {tasks.map(task => (
//                   <div
//                     key={task.id}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 10,
//                       padding: '10px 12px', borderRadius: 10,
//                       background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
//                       border: `1px solid ${task.completed ? 'var(--success-soft)' : 'var(--border)'}`,
//                       cursor: task.completed || unit.completed ? 'default' : 'pointer',
//                       transition: 'all 0.15s',
//                       opacity: completingTask === task.id ? 0.6 : 1,
//                     }}
//                     onClick={() => !task.completed && !unit.completed && handleComplete(task)}
//                   >
//                     <div style={{
//                       width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
//                       border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
//                       background: task.completed ? 'var(--success)' : 'transparent',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     }}>
//                       {task.completed && <CheckCircle2 size={13} color="#fff" />}
//                       {completingTask === task.id && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />}
//                     </div>
//                     <span style={{
//                       fontSize: 13, fontWeight: 500,
//                       color: task.completed ? 'var(--success)' : 'var(--text-primary)',
//                       textDecoration: task.completed ? 'line-through' : 'none',
//                       flex: 1,
//                     }}>{task.title}</span>
//                     {!task.completed && !unit.completed && (
//                       <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TAP TO COMPLETE</span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Resources */}
//             {unit.resources && (
//               <div style={{ marginBottom: 10 }}>
//                 <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <FileText size={11} /> Resources
//                 </div>
//                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.resources}</p>
//               </div>
//             )}

//             {/* Links */}
//             {unit.links && (
//               <div>
//                 <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <Link size={11} /> Links
//                 </div>
//                 <a href={unit.links} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{unit.links}</a>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// // ── Main Guide Page ───────────────────────────────────────────
// export default function Guide() {
//   const [roadmap, setRoadmap] = useState(null)
//   const [units, setUnits] = useState([])
//   const [loading, setLoading] = useState(true)

//   async function load() {
//     try {
//       const res = await roadmapApi.myGuide()
//       setRoadmap(res.roadmap)
//       setUnits(res.units || [])
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [])

//   const completedUnits = units.filter(u => u.completed).length
//   const totalUnits = units.length
//   const overallPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0
//   const currentUnit = units.find(u => u.unlocked && !u.completed)

//   if (loading) return (
//     <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, margin: '0 auto' }}>
//       {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
//     </div>
//   )

//   if (!roadmap) return (
//     <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
//       <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <BookOpen size={28} color="var(--accent)" />
//       </div>
//       <div>
//         <h2 style={{ marginBottom: 8 }}>No roadmap yet</h2>
//         <p className="text-muted" style={{ fontSize: 14, maxWidth: 320, lineHeight: 1.7 }}>
//           Your mentor hasn't uploaded your learning roadmap yet. Once they do, your full journey will appear here.
//         </p>
//       </div>
//     </div>
//   )

//   return (
//     <div style={{ padding: '32px 24px 80px', maxWidth: 700, margin: '0 auto' }}>

//       {/* Header */}
//       <div style={{ marginBottom: 28 }}>
//         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Your Guide</div>
//         <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>{roadmap.title}</h1>
//         <p className="text-muted" style={{ fontSize: 13 }}>
//           Started {new Date(roadmap.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {roadmap.total_units} {roadmap.duration_type === 'daily' ? 'days' : 'weeks'}
//         </p>
//       </div>

//       {/* Overall progress */}
//       <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
//           <div>
//             <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Overall Progress</div>
//             <div style={{ fontSize: 28, fontWeight: 900, color: overallPct >= 80 ? 'var(--success)' : overallPct >= 40 ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>{overallPct}%</div>
//           </div>
//           <div style={{ textAlign: 'right' }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{completedUnits}/{totalUnits}</div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>units complete</div>
//           </div>
//         </div>
//         <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
//           <div style={{
//             height: '100%',
//             width: `${overallPct}%`,
//             background: overallPct >= 80 ? 'var(--success)' : 'var(--accent)',
//             borderRadius: 4, transition: 'width 0.5s',
//           }} />
//         </div>
//         {currentUnit && (
//           <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
//             <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
//             Currently on: <strong style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{currentUnit.title}</strong>
//           </div>
//         )}
//       </div>

//       {/* Unit list */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//         {units.map(unit => (
//           <UnitCard
//             key={unit.id}
//             unit={unit}
//             onTaskComplete={load}
//           />
//         ))}
//       </div>
//     </div>
//   )
// }


import { useState, useEffect, useCallback } from 'react'
import { roadmapApi } from '../lib/api'
import {
  BookOpen, CheckCircle2, Lock, ChevronDown, ChevronUp,
  Target, Link, FileText, X, AlertTriangle, Trophy,
  PlayCircle, Loader2, ClipboardList
} from 'lucide-react'

// ── Lazy task instructions ─────────────────────────────────────
// Called once per task when the unit expands. Cached in parent state.
// Uses FAST_MODEL on the backend — cheap, ~200 tokens per task.
async function fetchTaskInstructions(taskTitle, unitGoal) {
  return roadmapApi.taskInstructions(taskTitle, unitGoal)
}

// ── Test Panel ─────────────────────────────────────────────────
// Renders as right-side panel on desktop, full overlay on mobile
function TestPanel({ test, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const allAnswered = Object.keys(answers).length === (test.questions?.length || 0)

  async function handleSubmit() {
    if (!allAnswered) return
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

  return (
    // On desktop this fills the right column (position handled by parent grid)
    // On mobile it's a fixed overlay
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Task Test · {test.questions?.length || 10} Questions
          </div>
          <h3 style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>{test.task_title}</h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginLeft: 12, flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
        {result ? (
          // ── Result ───────────────────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', paddingTop: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {result.passed
                ? <Trophy size={32} color="var(--success)" />
                : <AlertTriangle size={32} color="var(--danger)" />}
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: result.passed ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>
                {result.score}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {result.correct}/{result.total} correct
              </div>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)',
              width: '100%', textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: result.passed ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                {result.passed ? '✓ Passed' : '✗ Not passed'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.passed
                  ? 'Task marked complete. Next unit unlocks once all tasks in this unit are done.'
                  : 'Review the material and try again when ready.'}
              </div>
            </div>
            <button
              onClick={() => { onSubmit(result); onClose() }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Continue
            </button>
          </div>
        ) : (
          // ── Questions ─────────────────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {test.questions.map((q, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent)', marginRight: 6 }}>{i + 1}.</span>{q.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {Object.entries(q.options).map(([key, val]) => {
                    const selected = answers[String(i)] === key
                    return (
                      <button
                        key={key}
                        onClick={() => setAnswers(prev => ({ ...prev, [String(i)]: key }))}
                        style={{
                          background: selected ? 'var(--accent)' : 'var(--surface-2)',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 10, padding: '9px 13px',
                          cursor: 'pointer', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: selected ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800,
                          color: selected ? '#fff' : 'var(--text-muted)',
                        }}>{key}</span>
                        <span style={{ fontSize: 12, color: selected ? '#fff' : 'var(--text-secondary)', lineHeight: 1.4 }}>{val}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div style={{ flex: 1, height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(Object.keys(answers).length / (test.questions?.length || 1)) * 100}%`,
                  background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s'
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {Object.keys(answers).length}/{test.questions?.length}
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
function UnitCard({ unit, activeTestTaskId, onStartTest, onTaskComplete }) {
  const [expanded, setExpanded] = useState(false)
  const [tasks, setTasks] = useState(unit.roadmap_tasks || [])
  // instructionCache: { [taskId]: { text: string, loading: bool } }
  const [instructionCache, setInstructionCache] = useState({})
  const [completingTask, setCompletingTask] = useState(null)
    const [generatingTasks, setGeneratingTasks] = useState(false)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // When unit expands, lazy-load instructions for all tasks in this unit.
  // Because we cache, this only fires once per session per task.
  // Token cost: ~150-250 tokens per task, FAST_MODEL only.
  // If 30 tasks: mentor uploaded 30 units, mentee will only ever expand
  // the active unit — so realistically 1-5 generations per session.
  useEffect(() => {
  if (!expanded || !unit.unlocked) return
  if (tasks.length > 0) return

  setGeneratingTasks(true)
  roadmapApi.generateUnitTasks(unit.id)
    .then(res => setTasks(res.tasks || []))
    .catch(() => {})
    .finally(() => setGeneratingTasks(false))
}, [expanded])
  
  useEffect(() => {
    if (!expanded || !unit.unlocked) return
    tasks.forEach(task => {
      if (instructionCache[task.id]) return // already cached
      // Mark as loading immediately to prevent duplicate calls
      setInstructionCache(prev => ({ ...prev, [task.id]: { text: null, loading: true } }))
      fetchTaskInstructions(task.title, unit.goal || '')
        .then(res => {
          setInstructionCache(prev => ({
            ...prev,
            [task.id]: { text: res.instructions, loading: false }
          }))
        })
        .catch(() => {
          setInstructionCache(prev => ({
            ...prev,
            [task.id]: { text: null, loading: false }
          }))
        })
    })
  }, [expanded, unit.tasks])

  async function handleMarkDone(task) {
    // Step 1: optimistically mark task done in UI
    // Step 2: fetch test questions from backend
    // Step 3: hand test data up to Guide so the panel can open
    if (task.completed || !unit.unlocked || unit.completed) return
    setCompletingTask(task.id)
    try {
      const res = await roadmapApi.completeTask(task.id)
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t))
      // Bubble up to Guide to open the test panel
      onStartTest({
        test_id: res.test_id,
        task_title: task.title,
        questions: res.questions,
        unit_completed: res.unit_completed,
      })
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
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${unit.unlocked && !unit.completed ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 14, overflow: 'hidden',
      opacity: unit.unlocked ? 1 : 0.55,
      boxShadow: unit.unlocked && !unit.completed ? '0 0 0 1px var(--accent-soft)' : 'none',
      transition: 'opacity 0.2s',
    }}>
      {/* Unit header */}
      <div
        onClick={() => unit.unlocked && setExpanded(!expanded)}
        style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: unit.unlocked ? 'pointer' : 'default' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: statusBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: statusColor,
        }}>
          {unit.completed ? <CheckCircle2 size={16} /> : unit.unlocked ? unit.unit_number : <Lock size={14} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{unit.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
            {unit.unlocked && totalCount > 0 && (
              <><span>·</span><span>{completedCount}/{totalCount} tasks</span></>
            )}
          </div>
        </div>

        {unit.unlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {totalCount > 0 && (
              <div style={{ width: 40, height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: 2 }} />
              </div>
            )}
            {expanded
              ? <ChevronUp size={15} color="var(--text-muted)" />
              : <ChevronDown size={15} color="var(--text-muted)" />}
          </div>
        )}
        {!unit.unlocked && <Lock size={13} color="var(--text-muted)" />}
      </div>

      {/* Expanded body */}
      {expanded && unit.unlocked && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>

          {/* Goal */}
          {unit.goal && (
            <div style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: '10px 13px', marginBottom: 14, display: 'flex', gap: 8 }}>
              <Target size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.goal}</p>
            </div>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Tasks</div>

              {tasks.map(task => {
                const cached = instructionCache[task.id]
                const isActiveTest = activeTestTaskId === task.id
                const isLoading = completingTask === task.id

                return (
                  <div
                    key={task.id}
                    style={{
                      borderRadius: 11,
                      border: `1px solid ${task.completed ? 'var(--success-soft)' : isActiveTest ? 'var(--accent)' : 'var(--border)'}`,
                      background: task.completed ? 'var(--success-soft)' : isActiveTest ? 'var(--accent-soft)' : 'var(--surface-2)',
                      overflow: 'hidden',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Task row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                      {/* Completion circle */}
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
                        background: task.completed ? 'var(--success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {task.completed && <CheckCircle2 size={12} color="#fff" />}
                        {isLoading && <Loader2 size={11} className="spin" color="var(--accent)" />}
                      </div>

                      <span style={{
                        fontSize: 13, fontWeight: 500, flex: 1,
                        color: task.completed ? 'var(--success)' : 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </span>

                      {/* CTA — only show if not done, not loading */}
                      {!task.completed && !unit.completed && !isLoading && (
                        <button
                          onClick={() => handleMarkDone(task)}
                          style={{
                            fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                            background: 'none', border: '1px solid var(--accent)',
                            borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
                            flexShrink: 0, transition: 'all 0.15s',
                          }}
                        >
                          Mark done
                        </button>
                      )}

                      {/* Take test button — appears after marking done */}
                      {task.completed && isActiveTest && (
                        <button
                          onClick={() => {/* test already open in panel */}}
                          style={{
                            fontSize: 11, fontWeight: 700, color: '#fff',
                            background: 'var(--accent)', border: 'none',
                            borderRadius: 6, padding: '3px 9px', cursor: 'default',
                            flexShrink: 0,
                          }}
                        >
                          Test open →
                        </button>
                      )}
                    </div>

                    {/* Lazy instructions — shown when unit is expanded */}
                    {/* Only renders if we have content; shimmer while loading */}
                    {!task.completed && (
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        padding: '8px 12px 10px',
                        background: 'var(--surface)',
                      }}>
                        {cached?.loading && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Loader2 size={12} className="spin" color="var(--text-muted)" />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading guidance...</span>
                          </div>
                        )}
                        {cached?.text && (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                            {cached.text}
                          </p>
                        )}
                        {!cached && (
                          // Not yet requested — shouldn't happen after expand, but safe fallback
                          <div style={{ height: 12, background: 'var(--surface-3)', borderRadius: 4, width: '60%' }} />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Resources */}
          {unit.resources && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileText size={10} /> Resources
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{unit.resources}</p>
            </div>
          )}

          {/* Links */}
          {unit.links && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Link size={10} /> Links
              </div>
              <a href={unit.links} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>
                {unit.links}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Guide Page ────────────────────────────────────────────
export default function Guide() {
  const [roadmap, setRoadmap] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  // activeTest: null | { test_id, task_title, questions, unit_completed }
  const [activeTest, setActiveTest] = useState(null)

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

  function handleTestClose() {
    setActiveTest(null)
  }

  if (loading) return (
    <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 14 }} />)}
    </div>
  )

  if (!roadmap) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={24} color="var(--accent)" />
      </div>
      <div>
        <h2 style={{ marginBottom: 8 }}>No roadmap yet</h2>
        <p className="text-muted" style={{ fontSize: 14, maxWidth: 300, lineHeight: 1.7 }}>
          Your mentor hasn't uploaded your learning roadmap yet. It'll appear here once they do.
        </p>
      </div>
    </div>
  )

  return (
    /*
      LAYOUT LOGIC:
      - No active test:  single scrollable column, full available width
      - Active test, desktop (≥768px): CSS grid — left column roadmap, right column test panel
        The test panel is sticky so it doesn't scroll away while the mentee reads the roadmap.
      - Active test, mobile: test panel is a fixed overlay (full screen) so the roadmap
        stays mounted underneath and re-appears when test is closed.
      We use a CSS class + media query approach via a <style> tag injected once.
    */
    <>
      <style>{`
        .guide-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .guide-main {
          flex: 1;
          padding: 32px 32px 80px;
          overflow-y: auto;
        }
        .guide-test-overlay {
          display: none;
        }
        @media (min-width: 768px) {
          .guide-layout.test-open {
            display: grid;
            grid-template-columns: 1fr 420px;
            min-height: 100vh;
          }
          .guide-layout.test-open .guide-main {
            border-right: 1px solid var(--border);
            min-height: 100vh;
          }
          .guide-layout.test-open .guide-test-panel {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow: hidden;
          }
        }
        @media (max-width: 767px) {
          .guide-main {
            padding: 24px 16px 80px;
          }
          .guide-layout.test-open .guide-test-panel {
            position: fixed;
            inset: 0;
            z-index: 200;
            background: var(--surface);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className={`guide-layout${activeTest ? ' test-open' : ''}`}>

        {/* ── Left / Main Column ───────────────────────────── */}
        <div className="guide-main">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                Your Guide
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {roadmap.title}
              </h1>
              <p className="text-muted" style={{ fontSize: 13 }}>
                Started {new Date(roadmap.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {' · '}{roadmap.total_units} {roadmap.duration_type === 'daily' ? 'days' : 'weeks'}
              </p>
            </div>

            {/* Overall progress */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '18px 20px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Overall Progress</div>
                  <div style={{
                    fontSize: 32, fontWeight: 900, lineHeight: 1,
                    color: overallPct >= 80 ? 'var(--success)' : overallPct >= 40 ? 'var(--accent)' : 'var(--text-primary)',
                  }}>{overallPct}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{completedUnits}/{totalUnits}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>units complete</div>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${overallPct}%`,
                  background: overallPct >= 80 ? 'var(--success)' : 'var(--accent)',
                  borderRadius: 3, transition: 'width 0.5s',
                }} />
              </div>
              {currentUnit && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
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
                  activeTestTaskId={activeTest?.task_id || null}
                  onStartTest={setActiveTest}
                  onTaskComplete={load}
                />
              ))}
            </div>

          </div>
        </div>

        {/* ── Right / Test Panel ───────────────────────────── */}
        {activeTest && (
          <div className="guide-test-panel">
            <TestPanel
              test={activeTest}
              onSubmit={() => load()}
              onClose={handleTestClose}
            />
          </div>
        )}

      </div>
    </>
  )
}