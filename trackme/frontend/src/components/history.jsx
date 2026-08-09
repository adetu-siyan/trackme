// import { useEffect, useState } from 'react'
// import { logsApi } from '../lib/api'

// function statusConfig(log) {
//   if (log.signed) return { label: 'Signed', color: 'var(--success)', bg: 'var(--success-soft)', emoji: '✅' }
//   if (log.sent_to_mentor) return { label: 'Sent', color: 'var(--warning)', bg: 'var(--warning-soft)', emoji: '📬' }
//   return { label: 'Not Sent', color: 'var(--accent)', bg: 'var(--accent-soft)', emoji: '📝' }
// }

// function groupByDate(logs) {
//   const groups = {}
//   logs.forEach(log => {
//     const date = log.log_date
//     if (!groups[date]) groups[date] = []
//     groups[date].push(log)
//   })
//   return groups
// }

// function formatDate(dateStr) {
//   const today = new Date().toISOString().split('T')[0]
//   const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
//   if (dateStr === today) return 'Today'
//   if (dateStr === yesterday) return 'Yesterday'
//   return new Date(dateStr).toLocaleDateString('en-US', {
//     weekday: 'long', month: 'long', day: 'numeric'
//   })
// }

// export default function History() {
//   const [logs, setLogs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [expanded, setExpanded] = useState(null)
//   const [editing, setEditing] = useState(null)
//   const [editContent, setEditContent] = useState('')
//   const [saving, setSaving] = useState(false)
//   const [selected, setSelected] = useState([])
//   const [deleting, setDeleting] = useState(false)

//   useEffect(() => {
//     logsApi.myLogs()
//       .then(res => setLogs(res.logs || []))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   // All logs that can be deleted (not sent, not signed)
//   const deletableLogs = logs.filter(l => !l.sent_to_mentor && !l.signed)
//   const allDeletableSelected = deletableLogs.length > 0 && selected.length === deletableLogs.length

//   function toggleSelect(id, e) {
//     // Always stop propagation to prevent expand/collapse firing
//     if (e) e.stopPropagation()
//     setSelected(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     )
//   }

//   function toggleSelectAll() {
//     if (allDeletableSelected) {
//       setSelected([])
//     } else {
//       setSelected(deletableLogs.map(l => l.id))
//     }
//   }

//   async function handleDelete() {
//     if (selected.length === 0) return
//     if (!window.confirm(`Delete ${selected.length} log(s)? This cannot be undone.`)) return
//     setDeleting(true)

//     try {
//       const { supabase } = await import('../lib/supabase')
//       const sessionResult = await supabase.auth.getSession()
//       const token = sessionResult.data.session?.access_token

//       const results = await Promise.allSettled(
//         selected.map(id =>
//           fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/logs/${id}`, {
//             method: 'DELETE',
//             headers: { 'Authorization': `Bearer ${token}` }
//           })
//         )
//       )

//       const succeeded = selected.filter((_, i) => results[i].status === 'fulfilled')
//       setLogs(prev => prev.filter(l => !succeeded.includes(l.id)))
//       setSelected([])

//       if (succeeded.length < selected.length) {
//         alert(`${succeeded.length} deleted. ${selected.length - succeeded.length} failed.`)
//       }
//     } catch (e) {
//       alert('Failed to delete logs')
//     } finally {
//       setDeleting(false)
//     }
//   }

//   async function handleSaveEdit(log) {
//     setSaving(true)
//     try {
//       await logsApi.edit({
//         log_id: log.id,
//         structured_content: editContent,
//         structured_title: log.structured_title,
//         structured_topics: log.structured_topics || [],
//       })
//       setLogs(prev => prev.map(l =>
//         l.id === log.id ? { ...l, structured_content: editContent } : l
//       ))
//       setEditing(null)
//     } catch (e) {
//       alert(e.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const groups = groupByDate(logs)
//   const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

//   return (
//     <div className="page">

//       {/* Header */}
//       <div style={{
//         marginBottom: 32,
//         display: 'flex',
//         alignItems: 'flex-start',
//         justifyContent: 'space-between',
//         flexWrap: 'wrap',
//         gap: 12,
//       }}>
//         <div>
//           <h1 style={{ marginBottom: 4 }}>Log History</h1>
//           <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
//             {logs.length} log{logs.length !== 1 ? 's' : ''} total
//             {deletableLogs.length > 0 && (
//               <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>
//                 · {deletableLogs.length} deletable
//               </span>
//             )}
//           </p>
//         </div>

//         {deletableLogs.length > 0 && (
//           <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
//             <button
//               onClick={toggleSelectAll}
//               style={{
//                 padding: '8px 16px',
//                 borderRadius: 8,
//                 border: `1.5px solid ${allDeletableSelected ? 'var(--accent)' : 'var(--border)'}`,
//                 background: allDeletableSelected ? 'var(--accent-soft)' : 'var(--surface)',
//                 color: allDeletableSelected ? 'var(--accent)' : 'var(--text-secondary)',
//                 cursor: 'pointer',
//                 fontFamily: 'Urbanist, sans-serif',
//                 fontWeight: 600,
//                 fontSize: 13,
//                 transition: 'all 0.18s',
//               }}
//             >
//               {allDeletableSelected ? `✓ All Selected (${selected.length})` : `Select All (${deletableLogs.length})`}
//             </button>

//             {selected.length > 0 && (
//               <button
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 style={{
//                   padding: '8px 16px',
//                   borderRadius: 8,
//                   border: 'none',
//                   background: 'var(--danger)',
//                   color: '#fff',
//                   cursor: deleting ? 'not-allowed' : 'pointer',
//                   fontFamily: 'Urbanist, sans-serif',
//                   fontWeight: 600,
//                   fontSize: 13,
//                   opacity: deleting ? 0.7 : 1,
//                 }}
//               >
//                 {deleting ? 'Deleting...' : `🗑 Delete (${selected.length})`}
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Loading */}
//       {loading ? (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {[1, 2, 3].map(i => (
//             <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
//           ))}
//         </div>

//       /* Empty */
//       ) : logs.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
//           <h3 style={{ marginBottom: 8 }}>No logs yet</h3>
//           <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
//             Start logging your daily learning and it will appear here.
//           </p>
//         </div>

//       /* Log list */
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
//           {sortedDates.map(date => (
//             <div key={date}>

//               {/* Date header */}
//               <div style={{
//                 display: 'flex', alignItems: 'center',
//                 gap: 12, marginBottom: 12,
//               }}>
//                 <div style={{
//                   fontSize: 13, fontWeight: 700,
//                   color: 'var(--text-muted)', letterSpacing: '1px',
//                   textTransform: 'uppercase', whiteSpace: 'nowrap',
//                 }}>
//                   {formatDate(date)}
//                 </div>
//                 <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
//                 <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
//                   {date}
//                 </div>
//               </div>

//               {/* Logs */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                 {groups[date].map(log => {
//                   const status = statusConfig(log)
//                   const isExpanded = expanded === log.id
//                   const isEditing = editing === log.id
//                   const canEdit = !log.sent_to_mentor && !log.signed
//                   const isSelected = selected.includes(log.id)

//                   return (
//                     <div
//                       key={log.id}
//                       style={{
//                         background: 'var(--surface)',
//                         border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
//                         borderRadius: 14,
//                         overflow: 'hidden',
//                         transition: 'border-color 0.18s',
//                       }}
//                     >
//                       {/* Row */}
//                       <div style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: 14,
//                         padding: '16px 20px',
//                       }}>

//                         {/* Checkbox — isolated from expand click */}
//                         {canEdit && (
//                           <div
//                             style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
//                             onClick={e => e.stopPropagation()}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               onChange={e => {
//                                 e.stopPropagation()
//                                 toggleSelect(log.id)
//                               }}
//                               style={{
//                                 width: 16, height: 16,
//                                 accentColor: 'var(--accent)',
//                                 cursor: 'pointer',
//                               }}
//                             />
//                           </div>
//                         )}

//                         {/* Clickable expand area */}
//                         <div
//                           onClick={() => setExpanded(isExpanded ? null : log.id)}
//                           style={{
//                             display: 'flex', alignItems: 'center',
//                             gap: 14, flex: 1, cursor: 'pointer', minWidth: 0,
//                           }}
//                         >
//                           {/* Status icon */}
//                           <div style={{
//                             width: 40, height: 40, borderRadius: 10,
//                             background: status.bg,
//                             display: 'flex', alignItems: 'center',
//                             justifyContent: 'center', fontSize: 18, flexShrink: 0,
//                           }}>
//                             {status.emoji}
//                           </div>

//                           {/* Title + topics */}
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             <div style={{
//                               fontWeight: 700, fontSize: 15, marginBottom: 4,
//                               overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                             }}>
//                               {log.structured_title || 'Untitled Log'}
//                             </div>
//                             <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
//                               {(log.structured_topics || []).slice(0, 4).map((t, i) => (
//                                 <span key={i} style={{
//                                   background: 'var(--accent-soft)', color: 'var(--accent)',
//                                   padding: '2px 8px', borderRadius: 20,
//                                   fontSize: 11, fontWeight: 600,
//                                 }}>{t}</span>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Status + chevron */}
//                           <div style={{
//                             display: 'flex', alignItems: 'center',
//                             gap: 10, flexShrink: 0,
//                           }}>
//                             <span style={{
//                               padding: '4px 10px', borderRadius: 20,
//                               fontSize: 12, fontWeight: 600,
//                               background: status.bg, color: status.color,
//                             }}>
//                               {status.label}
//                             </span>
//                             <span style={{
//                               color: 'var(--text-muted)', fontSize: 12,
//                               transform: isExpanded ? 'rotate(180deg)' : 'none',
//                               transition: 'transform 0.18s', display: 'inline-block',
//                             }}>▼</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Expanded content */}
//                       {isExpanded && (
//                         <div style={{
//                           borderTop: '1px solid var(--border)',
//                           padding: '20px',
//                           background: 'var(--surface-2)',
//                         }}>
//                           {/* Test badge */}
//                           {log.test_attempted && (
//                             <div style={{
//                               display: 'inline-flex', alignItems: 'center', gap: 8,
//                               marginBottom: 14, padding: '7px 12px', borderRadius: 8,
//                               background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)',
//                               fontSize: 13, fontWeight: 600,
//                               color: log.test_passed ? 'var(--success)' : 'var(--danger)',
//                             }}>
//                               {log.test_passed ? '✅ Test passed' : '❌ Test not passed'} · {log.difficulty_level}
//                             </div>
//                           )}

//                           {/* Signed badge */}
//                           {log.signed && log.signed_at && (
//                             <div style={{
//                               marginBottom: 14, padding: '7px 12px', borderRadius: 8,
//                               background: 'var(--success-soft)', fontSize: 13,
//                               color: 'var(--success)', fontWeight: 600,
//                               display: 'inline-block',
//                             }}>
//                               ✍️ Signed {new Date(log.signed_at).toLocaleDateString('en-US', {
//                                 month: 'long', day: 'numeric', year: 'numeric'
//                               })}
//                             </div>
//                           )}

//                           {/* Edit mode */}
//                           {isEditing ? (
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                               <textarea
//                                 style={{
//                                   width: '100%', minHeight: 200, padding: '14px',
//                                   borderRadius: 10, border: '1.5px solid var(--accent)',
//                                   background: 'var(--surface)', color: 'var(--text-primary)',
//                                   fontFamily: 'Urbanist, sans-serif', fontSize: 14,
//                                   lineHeight: 1.7, resize: 'vertical', outline: 'none',
//                                   boxSizing: 'border-box',
//                                 }}
//                                 value={editContent}
//                                 onChange={e => setEditContent(e.target.value)}
//                               />
//                               <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
//                                 <button
//                                   onClick={() => setEditing(null)}
//                                   style={{
//                                     padding: '8px 18px', borderRadius: 8,
//                                     border: '1px solid var(--border)', background: 'var(--surface)',
//                                     color: 'var(--text-secondary)', cursor: 'pointer',
//                                     fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
//                                   }}
//                                 >
//                                   Cancel
//                                 </button>
//                                 <button
//                                   onClick={() => handleSaveEdit(log)}
//                                   disabled={saving}
//                                   style={{
//                                     padding: '8px 18px', borderRadius: 8,
//                                     border: 'none', background: 'var(--accent)',
//                                     color: '#fff', cursor: 'pointer',
//                                     fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
//                                   }}
//                                 >
//                                   {saving ? 'Saving...' : 'Save'}
//                                 </button>
//                               </div>
//                             </div>

//                           ) : (
//                             <>
//                               <div style={{
//                                 fontSize: 14, lineHeight: 1.8,
//                                 color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
//                                 marginBottom: canEdit ? 16 : 0,
//                               }}>
//                                 {log.structured_content || log.raw_content}
//                               </div>

//                               {canEdit && (
//                                 <button
//                                   onClick={() => {
//                                     setEditing(log.id)
//                                     setEditContent(log.structured_content || '')
//                                   }}
//                                   style={{
//                                     padding: '8px 18px', borderRadius: 8,
//                                     border: '1.5px solid var(--accent)', background: 'transparent',
//                                     color: 'var(--accent)', cursor: 'pointer',
//                                     fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
//                                   }}
//                                 >
//                                   ✏️ Edit Log
//                                 </button>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { logsApi } from '../lib/api'
import {
  CheckCircle, Send, FileText, Edit3, Trash2,
  ChevronDown, PenLine, Inbox, CheckSquare
} from 'lucide-react'

function statusConfig(log) {
  if (log.signed) return { label: 'Signed', color: 'var(--success)', bg: 'var(--success-soft)', icon: <CheckCircle size={18} /> }
  if (log.sent_to_mentor) return { label: 'Sent', color: 'var(--warning)', bg: 'var(--warning-soft)', icon: <Send size={18} /> }
  return { label: 'Not Sent', color: 'var(--accent)', bg: 'var(--accent-soft)', icon: <FileText size={18} /> }
}

function groupByDate(logs) {
  const groups = {}
  logs.forEach(log => {
    const date = log.log_date
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
  })
  return groups
}

function formatDate(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
}

export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    logsApi.myLogs()
      .then(res => setLogs(res.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const deletableLogs = logs.filter(l => !l.sent_to_mentor && !l.signed)
  const allDeletableSelected = deletableLogs.length > 0 && selected.length === deletableLogs.length

  function toggleSelect(id, e) {
    if (e) e.stopPropagation()
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (allDeletableSelected) {
      setSelected([])
    } else {
      setSelected(deletableLogs.map(l => l.id))
    }
  }

  async function handleDelete() {
    if (selected.length === 0) return
    if (!window.confirm(`Delete ${selected.length} log(s)? This cannot be undone.`)) return
    setDeleting(true)

    try {
      const { supabase } = await import('../lib/supabase')
      const sessionResult = await supabase.auth.getSession()
      const token = sessionResult.data.session?.access_token

      const results = await Promise.allSettled(
        selected.map(id =>
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/logs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      )

      const succeeded = selected.filter((_, i) => results[i].status === 'fulfilled')
      setLogs(prev => prev.filter(l => !succeeded.includes(l.id)))
      setSelected([])

      if (succeeded.length < selected.length) {
        alert(`${succeeded.length} deleted. ${selected.length - succeeded.length} failed.`)
      }
    } catch (e) {
      alert('Failed to delete logs')
    } finally {
      setDeleting(false)
    }
  }

  async function handleSaveEdit(log) {
    setSaving(true)
    try {
      await logsApi.edit({
        log_id: log.id,
        structured_content: editContent,
        structured_title: log.structured_title,
        structured_topics: log.structured_topics || [],
      })
      setLogs(prev => prev.map(l =>
        l.id === log.id ? { ...l, structured_content: editContent } : l
      ))
      setEditing(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const groups = groupByDate(logs)
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div className="page">

      {/* Header */}
      <div style={{
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Log History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {logs.length} log{logs.length !== 1 ? 's' : ''} total
            {deletableLogs.length > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                · {deletableLogs.length} deletable
              </span>
            )}
          </p>
        </div>

        {deletableLogs.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1.5px solid ${allDeletableSelected ? 'var(--accent)' : 'var(--border)'}`,
                background: allDeletableSelected ? 'var(--accent-soft)' : 'var(--surface)',
                color: allDeletableSelected ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'Urbanist, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <CheckSquare size={14} />
              {allDeletableSelected ? `All Selected (${selected.length})` : `Select All (${deletableLogs.length})`}
            </button>

            {selected.length > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Urbanist, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Trash2 size={14} />
                {deleting ? 'Deleting...' : `Delete (${selected.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>

      /* Empty */
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Inbox size={48} strokeWidth={1.2} color="var(--text-muted)" />
          </div>
          <h3 style={{ marginBottom: 8 }}>No logs yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Start logging your daily learning and it will appear here.
          </p>
        </div>

      /* Log list */
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sortedDates.map(date => (
            <div key={date}>

              {/* Date header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--text-muted)', letterSpacing: '1px',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {formatDate(date)}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {date}
                </div>
              </div>

              {/* Logs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {groups[date].map(log => {
                  const status = statusConfig(log)
                  const isExpanded = expanded === log.id
                  const isEditing = editing === log.id
                  const canEdit = !log.sent_to_mentor && !log.signed
                  const isSelected = selected.includes(log.id)

                  return (
                    <div
                      key={log.id}
                      style={{
                        background: 'var(--surface)',
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color 0.18s',
                      }}
                    >
                      {/* Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 20px',
                      }}>

                        {/* Checkbox */}
                        {canEdit && (
                          <div
                            style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                e.stopPropagation()
                                toggleSelect(log.id)
                              }}
                              style={{
                                width: 16, height: 16,
                                accentColor: 'var(--accent)',
                                cursor: 'pointer',
                              }}
                            />
                          </div>
                        )}

                        {/* Clickable expand area */}
                        <div
                          onClick={() => setExpanded(isExpanded ? null : log.id)}
                          style={{
                            display: 'flex', alignItems: 'center',
                            gap: 14, flex: 1, cursor: 'pointer', minWidth: 0,
                          }}
                        >
                          {/* Status icon */}
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: status.bg,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                            color: status.color,
                          }}>
                            {status.icon}
                          </div>

                          {/* Title + topics */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: 700, fontSize: 15, marginBottom: 4,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {log.structured_title || 'Untitled Log'}
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {(log.structured_topics || []).slice(0, 4).map((t, i) => (
                                <span key={i} style={{
                                  background: 'var(--accent-soft)', color: 'var(--accent)',
                                  padding: '2px 8px', borderRadius: 20,
                                  fontSize: 11, fontWeight: 600,
                                }}>{t}</span>
                              ))}
                            </div>
                          </div>

                          {/* Status badge + chevron */}
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: 10, flexShrink: 0,
                          }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 20,
                              fontSize: 12, fontWeight: 600,
                              background: status.bg, color: status.color,
                            }}>
                              {status.label}
                            </span>
                            <ChevronDown
                              size={14}
                              color="var(--text-muted)"
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.18s',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div style={{
                          borderTop: '1px solid var(--border)',
                          padding: '20px',
                          background: 'var(--surface-2)',
                        }}>
                          {/* Test badge */}
                          {log.test_attempted && (
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 8,
                              marginBottom: 14, padding: '7px 12px', borderRadius: 8,
                              background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)',
                              fontSize: 13, fontWeight: 600,
                              color: log.test_passed ? 'var(--success)' : 'var(--danger)',
                            }}>
                              {log.test_passed
                                ? <CheckCircle size={14} />
                                : <FileText size={14} />
                              }
                              {log.test_passed ? 'Test passed' : 'Test not passed'} · {log.difficulty_level}
                            </div>
                          )}

                          {/* Signed badge */}
                          {log.signed && log.signed_at && (
                            <div style={{
                              marginBottom: 14, padding: '7px 12px', borderRadius: 8,
                              background: 'var(--success-soft)', fontSize: 13,
                              color: 'var(--success)', fontWeight: 600,
                              display: 'inline-flex', alignItems: 'center', gap: 8,
                            }}>
                              <PenLine size={14} />
                              Signed {new Date(log.signed_at).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                              })}
                            </div>
                          )}

                          {/* Edit mode */}
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <textarea
                                style={{
                                  width: '100%', minHeight: 200, padding: '14px',
                                  borderRadius: 10, border: '1.5px solid var(--accent)',
                                  background: 'var(--surface)', color: 'var(--text-primary)',
                                  fontFamily: 'Urbanist, sans-serif', fontSize: 14,
                                  lineHeight: 1.7, resize: 'vertical', outline: 'none',
                                  boxSizing: 'border-box',
                                }}
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                              />
                              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setEditing(null)}
                                  style={{
                                    padding: '8px 18px', borderRadius: 8,
                                    border: '1px solid var(--border)', background: 'var(--surface)',
                                    color: 'var(--text-secondary)', cursor: 'pointer',
                                    fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(log)}
                                  disabled={saving}
                                  style={{
                                    padding: '8px 18px', borderRadius: 8,
                                    border: 'none', background: 'var(--accent)',
                                    color: '#fff', cursor: 'pointer',
                                    fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
                                  }}
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>

                          ) : (
                            <>
                              <div style={{
                                fontSize: 14, lineHeight: 1.8,
                                color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
                                marginBottom: canEdit ? 16 : 0,
                              }}>
                                {log.structured_content || log.raw_content}
                              </div>

                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setEditing(log.id)
                                    setEditContent(log.structured_content || '')
                                  }}
                                  style={{
                                    padding: '8px 18px', borderRadius: 8,
                                    border: '1.5px solid var(--accent)', background: 'transparent',
                                    color: 'var(--accent)', cursor: 'pointer',
                                    fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 13,
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                  }}
                                >
                                  <Edit3 size={13} /> Edit Log
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}