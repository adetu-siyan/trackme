
// import { useEffect, useState } from 'react'
// import { logsApi } from '../lib/api'
// import {
//   CheckCircle, Send, FileText, Edit3, Trash2,
//   ChevronDown, PenLine, Inbox, CheckSquare
// } from 'lucide-react'

// function statusConfig(log) {
//   if (log.signed) return { label: 'Signed', color: 'var(--success)', bg: 'var(--success-soft)', icon: <CheckCircle size={18} /> }
//   if (log.sent_to_mentor) return { label: 'Sent', color: 'var(--warning)', bg: 'var(--warning-soft)', icon: <Send size={18} /> }
//   return { label: 'Not Sent', color: 'var(--accent)', bg: 'var(--accent-soft)', icon: <FileText size={18} /> }
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

//   const deletableLogs = logs.filter(l => !l.sent_to_mentor && !l.signed)
//   const allDeletableSelected = deletableLogs.length > 0 && selected.length === deletableLogs.length

//   function toggleSelect(id, e) {
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
//                 display: 'flex', alignItems: 'center', gap: 6,
//               }}
//             >
//               <CheckSquare size={14} />
//               {allDeletableSelected ? `All Selected (${selected.length})` : `Select All (${deletableLogs.length})`}
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
//                   display: 'flex', alignItems: 'center', gap: 6,
//                 }}
//               >
//                 <Trash2 size={14} />
//                 {deleting ? 'Deleting...' : `Delete (${selected.length})`}
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
//           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
//             <Inbox size={48} strokeWidth={1.2} color="var(--text-muted)" />
//           </div>
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

//                         {/* Checkbox */}
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
//                             justifyContent: 'center', flexShrink: 0,
//                             color: status.color,
//                           }}>
//                             {status.icon}
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

//                           {/* Status badge + chevron */}
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
//                             <ChevronDown
//                               size={14}
//                               color="var(--text-muted)"
//                               style={{
//                                 transform: isExpanded ? 'rotate(180deg)' : 'none',
//                                 transition: 'transform 0.18s',
//                               }}
//                             />
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
//                               {log.test_passed
//                                 ? <CheckCircle size={14} />
//                                 : <FileText size={14} />
//                               }
//                               {log.test_passed ? 'Test passed' : 'Test not passed'} · {log.difficulty_level}
//                             </div>
//                           )}

//                           {/* Signed badge */}
//                           {log.signed && log.signed_at && (
//                             <div style={{
//                               marginBottom: 14, padding: '7px 12px', borderRadius: 8,
//                               background: 'var(--success-soft)', fontSize: 13,
//                               color: 'var(--success)', fontWeight: 600,
//                               display: 'inline-flex', alignItems: 'center', gap: 8,
//                             }}>
//                               <PenLine size={14} />
//                               Signed {new Date(log.signed_at).toLocaleDateString('en-US', {
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
//                                     display: 'inline-flex', alignItems: 'center', gap: 6,
//                                   }}
//                                 >
//                                   <Edit3 size={13} /> Edit Log
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

import { useEffect, useState, useMemo, useRef } from 'react'
import { logsApi } from '../lib/api'
import {
  CheckCircle, Send, FileText, Edit3, Trash2,
  ChevronDown, PenLine, Inbox, CheckSquare, 
  Filter, Search, ChevronRight, Clock
} from 'lucide-react'

function statusConfig(log) {
  if (log.signed) return { label: 'Signed', color: 'var(--success)', bg: 'var(--success-soft)', icon: <CheckCircle size={16} /> }
  if (log.sent_to_mentor) return { label: 'Sent', color: 'var(--warning)', bg: 'var(--warning-soft)', icon: <Send size={16} /> }
  return { label: 'Draft', color: 'var(--accent)', bg: 'var(--accent-soft)', icon: <FileText size={16} /> }
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isWithinRange(dateStr, filter) {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (filter === 'today') return date >= startOfToday
  if (filter === 'week') {
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    return date >= startOfWeek
  }
  if (filter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }
  return true
}

export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  const [expandedLog, setExpandedLog] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [generatingTasks, setGeneratingTasks] = useState(false)
  

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [filterRef])

  useEffect(() => {
    logsApi.myLogs()
      .then(res => setLogs(res.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const inTimeRange = isWithinRange(log.log_date, filter)
        if (!inTimeRange) return false
        if (!searchTerm.trim()) return true
        const searchLower = searchTerm.toLowerCase()
        const titleMatch = log.structured_title?.toLowerCase().includes(searchLower)
        const contentMatch = log.structured_content?.toLowerCase().includes(searchLower)
        const topicsMatch = (log.structured_topics || []).some(t => t.toLowerCase().includes(searchLower))
        return titleMatch || contentMatch || topicsMatch
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Newest first
  }, [logs, filter, searchTerm])

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

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
    { value: 'today', label: 'Today' }
  ]

  const globalStyles = `
    .history-page {
      background: linear-gradient(150deg, #ffffff 0%, #f4f0ff 60%, #e8deff 100%);
    }
    html[data-theme="dark"] .history-page {
      background: linear-gradient(150deg, #0d0a14 0%, #150f24 60%, #1e1535 100%);
    }
    @media (max-width: 640px) {
      .history-container { padding: 0 16px !important; }
      .history-header { flex-direction: column; align-items: stretch !important; gap: 12px; }
      .history-controls { width: 100%; justify-content: space-between; }
      .search-wrapper { flex: 1; }
      .search-wrapper input { width: 100% !important; }
    }
  `

  return (
    <div className="history-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '40px 0 80px 0',
      width: '100%'
    }}>
      <style>{globalStyles}</style>

      <div className="history-container" style={{
        width: '100%',
        maxWidth: 780,
        padding: '0 32px',
      }}>
        
        {/* ── Header ── */}
        <div className="history-header" style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h1 style={{ marginBottom: 4, fontWeight: 800, fontSize: '1.75rem' }}>
              History
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
              {logs.length !== filteredLogs.length && (
                <span style={{ marginLeft: 6, color: 'var(--accent)' }}>
                  (filtered from {logs.length})
                </span>
              )}
            </p>
          </div>

          <div className="history-controls" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* ── Search Bar ── */}
            <div className="search-wrapper" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by title or topic..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'Urbanist, sans-serif',
                  width: 200,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
              />
              <Search size={14} style={{
                position: 'absolute',
                left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* ── Filter Dropdown ── */}
            <div ref={filterRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'Urbanist, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <Filter size={14} />
                <span>Filter: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {filterOptions.find(f => f.value === filter)?.label}
                </span></span>
                <ChevronDown size={14} style={{ 
                  transform: filterOpen ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease',
                  marginLeft: 2
                }} />
              </button>

              {filterOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 160,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '6px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value)
                        setFilterOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        width: '100%',
                        borderRadius: 8,
                        border: 'none',
                        background: filter === opt.value ? 'var(--accent-soft)' : 'transparent',
                        color: filter === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'Urbanist, sans-serif',
                        fontSize: 13,
                        fontWeight: filter === opt.value ? 600 : 400,
                        textAlign: 'left',
                      }}
                    >
                      {opt.label}
                      {filter === opt.value && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Select / Delete Actions ── */}
            {deletableLogs.length > 0 && (
              <>
                <button
                  onClick={toggleSelectAll}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${allDeletableSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: allDeletableSelected ? 'var(--accent-soft)' : 'var(--surface)',
                    color: allDeletableSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'Urbanist, sans-serif',
                    fontWeight: 500,
                    fontSize: 13,
                    transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <CheckSquare size={14} />
                  {allDeletableSelected ? `Selected (${selected.length})` : 'Select All'}
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
              </>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Inbox size={48} strokeWidth={1.2} color="var(--text-muted)" />
            </div>
            <h3 style={{ marginBottom: 8, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No logs found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {searchTerm ? 'Try adjusting your search or clearing the filter.' : 'Write your first log to get started.'}
            </p>
          </div>
        ) : (
          /* ── FLAT LIST (Newest First) ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--border)' }}>
            {filteredLogs.map((log, index) => {
              const status = statusConfig(log)
              const isExpanded = expandedLog === log.id
              const isEditing = editing === log.id
              const canEdit = !log.sent_to_mentor && !log.signed
              const isSelected = selected.includes(log.id)

              return (
                <div key={log.id} style={{ 
                  borderBottom: index !== filteredLogs.length - 1 ? '1px solid var(--border)' : 'none' 
                }}>
                  {/* ── Log Row ── */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 4px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: isExpanded ? 'var(--surface-2)' : 'transparent',
                    border: '1px solid transparent',
                    borderColor: isSelected ? 'var(--accent)' : 'transparent',
                    borderRadius: isExpanded ? 8 : 0,
                    margin: isExpanded ? '8px 0' : 0,
                  }}>
                    {/* Checkbox */}
                    {canEdit && (
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            e.stopPropagation()
                            toggleSelect(log.id)
                          }}
                          style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {/* Clickable Area */}
                    <div onClick={() => setExpandedLog(isExpanded ? null : log.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      {/* Status Dot */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: status.color, flexShrink: 0 }} />

                      {/* Title */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: 14,
                          color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {log.structured_title || 'Untitled Log'}
                        </div>
                      </div>

                      {/* Time Ago */}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <Clock size={11} />
                        {formatRelativeTime(log.created_at || log.log_date)}
                      </div>

                      <ChevronRight
                        size={14}
                        color="var(--text-muted)"
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Expanded Content ── */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 4px 20px 40px',
                      borderLeft: '2px solid var(--border)',
                      marginLeft: 12,
                    }}>
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '2px 8px', borderRadius: 20,
                          background: status.bg, fontSize: 11, fontWeight: 600, color: status.color,
                        }}>
                          {status.icon} {status.label}
                        </span>
                        {log.test_attempted && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '2px 8px', borderRadius: 20,
                            background: log.test_passed ? 'var(--success-soft)' : 'var(--danger-soft)',
                            fontSize: 11, fontWeight: 600,
                            color: log.test_passed ? 'var(--success)' : 'var(--danger)',
                          }}>
                            {log.test_passed ? <CheckCircle size={12} /> : <FileText size={12} />}
                            {log.test_passed ? 'Test passed' : 'Test not passed'}
                          </span>
                        )}
                        {log.signed && log.signed_at && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '2px 8px', borderRadius: 20,
                            background: 'var(--success-soft)', fontSize: 11, fontWeight: 600, color: 'var(--success)',
                          }}>
                            <PenLine size={12} />
                            Signed {new Date(log.signed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <textarea
                            style={{
                              width: '100%', minHeight: 160, padding: '12px',
                              borderRadius: 8, border: '1.5px solid var(--accent)',
                              background: 'var(--surface)', color: 'var(--text-primary)',
                              fontFamily: 'Urbanist, sans-serif', fontSize: 13,
                              lineHeight: 1.7, resize: 'vertical', outline: 'none',
                              boxSizing: 'border-box',
                            }}
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => setEditing(null)}
                              style={{
                                padding: '5px 14px', borderRadius: 6,
                                border: '1px solid var(--border)', background: 'transparent',
                                color: 'var(--text-secondary)', cursor: 'pointer',
                                fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 12,
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(log)}
                              disabled={saving}
                              style={{
                                padding: '5px 14px', borderRadius: 6,
                                border: 'none', background: 'var(--accent)',
                                color: '#fff', cursor: 'pointer',
                                fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 12,
                              }}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{
                            fontSize: 13, lineHeight: 1.8,
                            color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
                            marginBottom: canEdit ? 12 : 0,
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
                                padding: '4px 12px', borderRadius: 6,
                                border: '1px solid var(--accent)', background: 'transparent',
                                color: 'var(--accent)', cursor: 'pointer',
                                fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: 12,
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <Edit3 size={12} /> Edit
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
        )}
      </div>
    </div>
  )
}