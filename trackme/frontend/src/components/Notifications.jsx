


// import { useEffect, useState, useRef } from 'react'
// import { notificationsApi, mentorApi } from '../lib/api'
// import {
//   PenLine, ClipboardList, UserPlus, CheckCircle,
//   Bell, Trash2, XCircle, MoreHorizontal, CheckCheck,
//   ChevronRight, AlertTriangle, Calendar, CheckSquare, Square,
// } from 'lucide-react'

// // ── Config ─────────────────────────────────────────────────────
// const typeConfig = {
//   log_signed:       { icon: PenLine,       color: 'var(--success)', bg: 'var(--success-soft)' },
//   project_assigned: { icon: ClipboardList, color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
//   mentor_request:   { icon: UserPlus,      color: 'var(--warning)', bg: 'var(--warning-soft)' },
//   test_passed:      { icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-soft)' },
//   weekly_focus:     { icon: Calendar,      color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
//   stuck_flag:       { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-soft)' },
// }

// function timeAgo(dateStr) {
//   const diff = Date.now() - new Date(dateStr).getTime()
//   const mins = Math.floor(diff / 60000)
//   if (mins < 1) return 'just now'
//   if (mins < 60) return `${mins}m ago`
//   const hrs = Math.floor(mins / 60)
//   if (hrs < 24) return `${hrs}h ago`
//   return `${Math.floor(hrs / 24)}d ago`
// }

// function formatLong(dateStr) {
//   return new Date(dateStr).toLocaleDateString('en-US', {
//     weekday: 'long', month: 'long', day: 'numeric',
//     hour: '2-digit', minute: '2-digit',
//   })
// }

// function groupByTime(notifications) {
//   const now = Date.now()
//   const DAY = 86400000
//   const WEEK = DAY * 7
//   const groups = { Today: [], 'This Week': [], Earlier: [] }
//   notifications.forEach(n => {
//     const age = now - new Date(n.created_at).getTime()
//     if (age < DAY) groups['Today'].push(n)
//     else if (age < WEEK) groups['This Week'].push(n)
//     else groups['Earlier'].push(n)
//   })
//   return groups
// }

// // ── Weekly focus tasks panel ────────────────────────────────────
// function WeeklyFocusTasks({ focusId }) {
//   const [tasks, setTasks] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [focus, setFocus] = useState(null)

//   useEffect(() => {
//     if (!focusId) return
//     async function fetchTasks() {
//       try {
//         // reuse the existing my-tasks endpoint — it returns focus + tasks for current week
//         // but we need tasks by focus_id specifically, so call the history endpoint and match
//         const res = await fetch(`/projects/weekly-focus/my-tasks`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         })
//         const data = await res.json()
//         if (data.focus?.id === focusId) {
//           setFocus(data.focus)
//           setTasks(data.tasks || [])
//         } else {
//           // focus is from a past week — fetch from history
//           const histRes = await fetch(`/projects/weekly-focus/history`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           })
//           const histData = await histRes.json()
//           const match = (histData.history || []).find(f => f.id === focusId)
//           if (match) setFocus(match)
//           // tasks aren't in history payload, show focus summary only
//         }
//       } catch (e) {
//         console.error('[WeeklyFocusTasks]', e)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchTasks()
//   }, [focusId])

//   if (loading) {
//     return (
//       <div style={{ marginTop: 20 }}>
//         {[1, 2, 3].map(i => (
//           <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: 8 }} />
//         ))}
//       </div>
//     )
//   }

//   if (!focus && !tasks.length) return null

//   const total = tasks.length
//   const completed = tasks.filter(t => t.completed).length
//   const rate = total > 0 ? Math.round((completed / total) * 100) : 0
//   const barColor = rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)'

//   return (
//     <div style={{ marginTop: 24 }}>
//       {/* Section header */}
//       <div style={{
//         fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
//         textTransform: 'uppercase', color: 'var(--accent)',
//         marginBottom: 12,
//       }}>
//         Weekly Tasks
//       </div>

//       {/* Summary strip */}
//       {focus?.summary && (
//         <div style={{
//           background: 'var(--surface-2)',
//           border: '1px solid var(--border)',
//           borderRadius: 10, padding: '10px 14px',
//           fontSize: 13, color: 'var(--text-secondary)',
//           lineHeight: 1.6, marginBottom: 14,
//         }}>
//           {focus.edited_summary || focus.summary}
//         </div>
//       )}

//       {/* Progress bar */}
//       {total > 0 && (
//         <div style={{ marginBottom: 16 }}>
//           <div style={{
//             display: 'flex', justifyContent: 'space-between',
//             fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
//             marginBottom: 6,
//           }}>
//             <span>{completed}/{total} completed</span>
//             <span style={{ color: barColor, fontWeight: 700 }}>{rate}%</span>
//           </div>
//           <div style={{
//             height: 6, background: 'var(--border)',
//             borderRadius: 4, overflow: 'hidden',
//           }}>
//             <div style={{
//               height: '100%', width: `${rate}%`,
//               background: barColor, borderRadius: 4,
//               transition: 'width 0.4s ease',
//             }} />
//           </div>
//         </div>
//       )}

//       {/* Task list */}
//       {tasks.length > 0 ? (
//         <div style={{
//           display: 'flex', flexDirection: 'column', gap: 6,
//         }}>
//           {tasks.map(task => (
//             <div key={task.id} style={{
//               display: 'flex', alignItems: 'flex-start', gap: 10,
//               padding: '10px 12px', borderRadius: 10,
//               background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
//               border: `1px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
//               opacity: task.completed ? 0.75 : 1,
//               transition: 'all 0.15s',
//             }}>
//               {task.completed
//                 ? <CheckSquare size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
//                 : <Square size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
//               }
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{
//                   fontSize: 13, fontWeight: task.completed ? 500 : 600,
//                   color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
//                   textDecoration: task.completed ? 'line-through' : 'none',
//                   marginBottom: task.description ? 2 : 0,
//                 }}>
//                   {task.title}
//                 </div>
//                 {task.description && (
//                   <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
//                     {task.description}
//                   </div>
//                 )}
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
//                 {task.category && (
//                   <span style={{
//                     fontSize: 10, fontWeight: 700,
//                     background: 'var(--accent-soft)', color: 'var(--accent)',
//                     padding: '2px 7px', borderRadius: 20,
//                     whiteSpace: 'nowrap',
//                   }}>
//                     {task.category}
//                   </span>
//                 )}
//                 {task.carried_over && (
//                   <span style={{
//                     fontSize: 10, fontWeight: 600,
//                     color: 'var(--warning)',
//                     whiteSpace: 'nowrap',
//                   }}>
//                     ↩ carried over
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
//           Tasks not available for past weeks.
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Mentor request actions ──────────────────────────────────────
// function MentorRequestActions({ relationshipId, onRespond }) {
//   const [loading, setLoading] = useState(null)
//   const [done, setDone] = useState(null)

//   async function respond(action) {
//     setLoading(action)
//     try {
//       await mentorApi.respond({ relationship_id: relationshipId, action })
//       setDone(action)
//       onRespond(action)
//     } catch (e) {
//       alert(e.message)
//     } finally {
//       setLoading(null)
//     }
//   }

//   if (done) {
//     return (
//       <div style={{
//         display: 'inline-flex', alignItems: 'center', gap: 8,
//         padding: '10px 16px', borderRadius: 10, marginTop: 16,
//         background: done === 'accept' ? 'var(--success-soft)' : 'var(--danger-soft)',
//         color: done === 'accept' ? 'var(--success)' : 'var(--danger)',
//         fontSize: 13, fontWeight: 600,
//       }}>
//         {done === 'accept'
//           ? <><CheckCircle size={14} /> Accepted — you are now their mentor</>
//           : <><XCircle size={14} /> Request declined</>
//         }
//       </div>
//     )
//   }

//   return (
//     <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
//       <button
//         onClick={() => respond('accept')}
//         disabled={!!loading}
//         style={{
//           padding: '10px 24px', borderRadius: 10, border: 'none',
//           background: 'var(--success)', color: '#fff',
//           fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 14,
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.7 : 1,
//           display: 'inline-flex', alignItems: 'center', gap: 7,
//         }}
//       >
//         <CheckCircle size={15} />
//         {loading === 'accept' ? 'Accepting...' : 'Accept Request'}
//       </button>
//       <button
//         onClick={() => respond('decline')}
//         disabled={!!loading}
//         style={{
//           padding: '10px 24px', borderRadius: 10,
//           border: '1.5px solid var(--border)',
//           background: 'var(--surface)', color: 'var(--danger)',
//           fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 14,
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.7 : 1,
//           display: 'inline-flex', alignItems: 'center', gap: 7,
//         }}
//       >
//         <XCircle size={15} />
//         {loading === 'decline' ? 'Declining...' : 'Decline'}
//       </button>
//     </div>
//   )
// }

// // ── Detail panel ────────────────────────────────────────────────
// function DetailPanel({ notification, onRespond, isMobile }) {
//   if (!notification) {
//     return (
//       <div style={{
//         flex: 1, display: 'flex', flexDirection: 'column',
//         alignItems: 'center', justifyContent: 'center',
//         padding: 40, color: 'var(--text-muted)',
//       }}>
//         <Bell size={44} strokeWidth={1.2} style={{ marginBottom: 14, opacity: 0.4 }} />
//         <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
//           Nothing selected
//         </div>
//         <div style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.6, maxWidth: 220 }}>
//           Pick a notification from the list to read it here.
//         </div>
//       </div>
//     )
//   }

//   const cfg = typeConfig[notification.type] || typeConfig.log_signed
//   const IconComponent = cfg.icon
//   const hasAction = notification.type === 'mentor_request' && notification.metadata?.action_required
//   const focusId = notification.metadata?.focus_id

//   return (
//     <div style={{
//       flex: 1,
//       padding: isMobile ? '20px 16px' : '32px 28px',
//       overflowY: 'auto',
//       animation: 'fadeIn 0.15s ease',
//     }}>
//       {/* Action required banner */}
//       {hasAction && (
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 10,
//           background: 'var(--warning-soft)',
//           border: '1px solid var(--warning)',
//           borderRadius: 10, padding: '10px 14px',
//           marginBottom: 20,
//           color: 'var(--warning)', fontSize: 13, fontWeight: 700,
//         }}>
//           <AlertTriangle size={15} />
//           Action required — respond below
//         </div>
//       )}

//       {/* Icon + title */}
//       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
//         <div style={{
//           width: 48, height: 48, borderRadius: 14,
//           background: 'var(--surface-2)',
//           border: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           color: cfg.color, flexShrink: 0,
//         }}>
//           <IconComponent size={20} strokeWidth={1.8} />
//         </div>
//         <div style={{ paddingTop: 4 }}>
//           <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>
//             {notification.title}
//           </div>
//           <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//             {formatLong(notification.created_at)}
//           </div>
//         </div>
//       </div>

//       {/* Divider */}
//       <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

//       {/* Message */}
//       <p style={{
//         fontSize: 14, lineHeight: 1.8,
//         color: 'var(--text-secondary)',
//         whiteSpace: 'pre-wrap', margin: 0,
//       }}>
//         {notification.message}
//       </p>

//       {/* Weekly focus tasks */}
//       {focusId && <WeeklyFocusTasks focusId={focusId} />}

//       {/* Mentor request actions */}
//       {hasAction && (
//         <MentorRequestActions
//           relationshipId={notification.metadata.relationship_id}
//           onRespond={onRespond}
//         />
//       )}
//     </div>
//   )
// }

// // ── Notification row ────────────────────────────────────────────
// function NotifRow({ n, isSelected, isActive, selectMode, onSelect, onClick }) {
//   const cfg = typeConfig[n.type] || typeConfig.log_signed
//   const IconComponent = cfg.icon
//   const hasAction = n.type === 'mentor_request' && n.metadata?.action_required

//   return (
//     <div
//       onClick={onClick}
//       style={{
//         display: 'flex', alignItems: 'center', gap: 12,
//         padding: '12px 16px', cursor: 'pointer',
//         borderLeft: !n.read ? '3px solid var(--accent)' : '3px solid transparent',
//         background: isActive
//           ? 'var(--accent-soft)'
//           : n.read ? 'transparent' : 'var(--surface-2)',
//         transition: 'background 0.12s',
//         position: 'relative',
//       }}
//     >
//       {selectMode && (
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={e => { e.stopPropagation(); onSelect() }}
//           onClick={e => e.stopPropagation()}
//           style={{
//             width: 15, height: 15,
//             accentColor: 'var(--accent)',
//             flexShrink: 0, cursor: 'pointer',
//           }}
//         />
//       )}

//       <div style={{
//         width: 36, height: 36, borderRadius: 10,
//         background: 'var(--surface-2)',
//         border: '1px solid var(--border)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         color: hasAction ? 'var(--warning)' : cfg.color,
//         flexShrink: 0,
//       }}>
//         <IconComponent size={16} strokeWidth={1.8} />
//       </div>

//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
//           {!n.read && (
//             <div style={{
//               width: 6, height: 6, borderRadius: '50%',
//               background: 'var(--accent)', flexShrink: 0,
//             }} />
//           )}
//           <div style={{
//             fontWeight: n.read ? 500 : 700,
//             fontSize: 13,
//             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//             color: 'var(--text-primary)',
//           }}>
//             {n.title}
//           </div>
//         </div>
//         <div style={{
//           fontSize: 12, color: 'var(--text-muted)',
//           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//         }}>
//           {n.message}
//         </div>
//       </div>

//       <div style={{
//         display: 'flex', flexDirection: 'column',
//         alignItems: 'flex-end', gap: 4, flexShrink: 0,
//       }}>
//         <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
//           {timeAgo(n.created_at)}
//         </span>
//         <ChevronRight size={12} color="var(--text-muted)" style={{ opacity: 0.5 }} />
//       </div>
//     </div>
//   )
// }

// // ── Main ────────────────────────────────────────────────────────
// export default function Notifications({ onCountChange }) {
//   const [notifications, setNotifications] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selected, setSelected] = useState([])
//   const [selectMode, setSelectMode] = useState(false)
//   const [deleting, setDeleting] = useState(false)
//   const [active, setActive] = useState(null)
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
//   const menuRef = useRef(null)

//   useEffect(() => {
//     const handler = () => setIsDesktop(window.innerWidth >= 768)
//     window.addEventListener('resize', handler)
//     return () => window.removeEventListener('resize', handler)
//   }, [])

//   useEffect(() => {
//     function handleClick(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
//     }
//     document.addEventListener('mousedown', handleClick)
//     return () => document.removeEventListener('mousedown', handleClick)
//   }, [])

//   async function load() {
//     try {
//       const res = await notificationsApi.list()
//       const notifs = res.notifications || []
//       setNotifications(notifs)
//       onCountChange?.(notifs.filter(n => !n.read).length)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [])

//   async function handleSelect(n) {
//     setActive(n)
//     if (!n.read) {
//       await notificationsApi.markRead(n.id)
//       setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
//       onCountChange?.(notifications.filter(x => !x.read && x.id !== n.id).length)
//     }
//   }

//   async function markAllRead() {
//     await notificationsApi.markAllRead()
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })))
//     onCountChange?.(0)
//     setMenuOpen(false)
//   }

//   function toggleSelectMode() {
//     setSelectMode(s => !s)
//     setSelected([])
//     setMenuOpen(false)
//   }

//   function toggleCheck(id) {
//     setSelected(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     )
//   }

//   async function handleDeleteSelected() {
//     if (!selected.length) return
//     if (!window.confirm(`Delete ${selected.length} notification(s)?`)) return
//     setDeleting(true)
//     try {
//       await Promise.all(selected.map(id => notificationsApi.markRead(id)))
//       const next = notifications.filter(n => !selected.includes(n.id))
//       setNotifications(next)
//       onCountChange?.(next.filter(n => !n.read).length)
//       setSelected([])
//       if (active && selected.includes(active.id)) setActive(null)
//     } catch {
//       alert('Failed to delete')
//     } finally {
//       setDeleting(false)
//     }
//   }

//   function handleRespond(notifId) {
//     setNotifications(prev => prev.map(x =>
//       x.id === notifId
//         ? { ...x, read: true, metadata: { ...x.metadata, action_required: false } }
//         : x
//     ))
//     onCountChange?.(notifications.filter(x => !x.read && x.id !== notifId).length)
//     if (active?.id === notifId) {
//       setActive(prev => ({
//         ...prev,
//         read: true,
//         metadata: { ...prev.metadata, action_required: false },
//       }))
//     }
//   }

//   const unread = notifications.filter(n => !n.read)
//   const groups = groupByTime(notifications)
//   const allSelected = notifications.length > 0 && selected.length === notifications.length

//   const listContent = (
//     <div style={{
//       width: isDesktop ? 360 : '100%',
//       flexShrink: 0,
//       borderRight: isDesktop ? '1px solid var(--border)' : 'none',
//       display: 'flex',
//       flexDirection: 'column',
//       height: isDesktop ? 'calc(100vh - 120px)' : 'auto',
//       overflow: 'hidden',
//     }}>
//       <div style={{
//         padding: '20px 16px 14px',
//         borderBottom: '1px solid var(--border)',
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', gap: 10,
//         flexShrink: 0,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{ fontSize: 16, fontWeight: 800 }}>Notifications</span>
//           {unread.length > 0 && (
//             <span style={{
//               padding: '2px 8px', borderRadius: 20,
//               background: 'var(--accent)', color: '#fff',
//               fontSize: 11, fontWeight: 700,
//             }}>
//               {unread.length}
//             </span>
//           )}
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           {selectMode && selected.length > 0 && (
//             <button
//               onClick={handleDeleteSelected}
//               disabled={deleting}
//               style={{
//                 padding: '6px 12px', borderRadius: 8,
//                 background: 'var(--danger)', color: '#fff',
//                 border: 'none', fontFamily: 'Urbanist, sans-serif',
//                 fontSize: 12, fontWeight: 700, cursor: 'pointer',
//                 display: 'inline-flex', alignItems: 'center', gap: 5,
//               }}
//             >
//               <Trash2 size={12} />
//               {deleting ? '...' : `Delete (${selected.length})`}
//             </button>
//           )}

//           {selectMode && (
//             <button
//               onClick={toggleSelectMode}
//               style={{
//                 padding: '6px 10px', borderRadius: 8,
//                 background: 'var(--surface-2)', color: 'var(--text-secondary)',
//                 border: '1px solid var(--border)',
//                 fontFamily: 'Urbanist, sans-serif',
//                 fontSize: 12, fontWeight: 600, cursor: 'pointer',
//               }}
//             >
//               Cancel
//             </button>
//           )}

//           {!selectMode && (
//             <div ref={menuRef} style={{ position: 'relative' }}>
//               <button
//                 onClick={() => setMenuOpen(o => !o)}
//                 style={{
//                   width: 32, height: 32, borderRadius: 8,
//                   background: menuOpen ? 'var(--surface-2)' : 'transparent',
//                   border: '1px solid var(--border)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   cursor: 'pointer', color: 'var(--text-secondary)',
//                 }}
//               >
//                 <MoreHorizontal size={16} />
//               </button>

//               {menuOpen && (
//                 <div style={{
//                   position: 'absolute', right: 0, top: 38, zIndex: 50,
//                   background: 'var(--surface)', border: '1px solid var(--border)',
//                   borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
//                   minWidth: 180, overflow: 'hidden',
//                   animation: 'fadeIn 0.1s ease',
//                 }}>
//                   {[
//                     unread.length > 0 && {
//                       label: 'Mark all read',
//                       icon: <CheckCheck size={14} />,
//                       action: markAllRead,
//                     },
//                     notifications.length > 0 && {
//                       label: selectMode ? 'Cancel select' : 'Select notifications',
//                       icon: <Trash2 size={14} />,
//                       action: toggleSelectMode,
//                     },
//                     selectMode && allSelected && {
//                       label: 'Deselect all',
//                       icon: <Trash2 size={14} />,
//                       action: () => setSelected([]),
//                     },
//                     selectMode && !allSelected && notifications.length > 0 && {
//                       label: 'Select all',
//                       icon: <CheckCheck size={14} />,
//                       action: () => setSelected(notifications.map(n => n.id)),
//                     },
//                   ].filter(Boolean).map((item, i) => (
//                     <button
//                       key={i}
//                       onClick={item.action}
//                       style={{
//                         width: '100%', padding: '11px 14px',
//                         background: 'none', border: 'none',
//                         display: 'flex', alignItems: 'center', gap: 10,
//                         fontFamily: 'Urbanist, sans-serif',
//                         fontSize: 13, fontWeight: 600,
//                         color: 'var(--text-secondary)', cursor: 'pointer',
//                         textAlign: 'left',
//                         borderBottom: '1px solid var(--border)',
//                       }}
//                     >
//                       {item.icon} {item.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <div style={{ overflowY: 'auto', flex: 1 }}>
//         {loading ? (
//           <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
//             {[1, 2, 3, 4].map(i => (
//               <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
//             ))}
//           </div>
//         ) : notifications.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//             <Bell size={40} strokeWidth={1.2} color="var(--text-muted)"
//               style={{ marginBottom: 12, opacity: 0.4 }} />
//             <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
//               No notifications yet
//             </div>
//             <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
//               Mentor sign-offs, project updates, and requests show up here.
//             </p>
//           </div>
//         ) : (
//           Object.entries(groups).map(([label, items]) => {
//             if (!items.length) return null
//             return (
//               <div key={label}>
//                 <div style={{
//                   padding: '10px 16px 6px',
//                   fontSize: 11, fontWeight: 700,
//                   color: 'var(--text-muted)',
//                   textTransform: 'uppercase', letterSpacing: '0.8px',
//                   borderBottom: '1px solid var(--border)',
//                   background: 'var(--surface)',
//                 }}>
//                   {label}
//                 </div>
//                 {items.map((n, idx) => (
//                   <div key={n.id} style={{
//                     borderBottom: idx < items.length - 1
//                       ? '1px solid var(--border)'
//                       : 'none',
//                   }}>
//                     <NotifRow
//                       n={n}
//                       isActive={active?.id === n.id}
//                       isSelected={selected.includes(n.id)}
//                       selectMode={selectMode}
//                       onSelect={() => toggleCheck(n.id)}
//                       onClick={() => {
//                         if (selectMode) { toggleCheck(n.id); return }
//                         handleSelect(n)
//                       }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )
//           })
//         )}
//       </div>
//     </div>
//   )

//   return (
//     <div className="page" style={{ padding: 0 }}>
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
//       `}</style>

//       {isDesktop ? (
//         <div style={{
//           display: 'flex',
//           height: 'calc(100vh - 120px)',
//           overflow: 'hidden',
//           border: '1px solid var(--border)',
//           borderRadius: 16,
//           background: 'var(--surface)',
//         }}>
//           {listContent}
//           <DetailPanel
//             notification={active}
//             isMobile={false}
//             onRespond={() => active && handleRespond(active.id)}
//           />
//         </div>
//       ) : (
//         <div style={{ padding: '0 0 80px' }}>
//           <div style={{
//             padding: '20px 16px 16px',
//             display: 'flex', alignItems: 'center',
//             justifyContent: 'space-between', gap: 10,
//             marginBottom: 4,
//           }}>
//             <div>
//               <h1 style={{ marginBottom: 2, fontSize: 22 }}>Notifications</h1>
//               <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
//                 {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
//               </p>
//             </div>
//             <div ref={menuRef} style={{ position: 'relative' }}>
//               <button
//                 onClick={() => setMenuOpen(o => !o)}
//                 style={{
//                   width: 36, height: 36, borderRadius: 10,
//                   background: 'var(--surface-2)',
//                   border: '1px solid var(--border)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   cursor: 'pointer', color: 'var(--text-secondary)',
//                 }}
//               >
//                 <MoreHorizontal size={18} />
//               </button>
//               {menuOpen && (
//                 <div style={{
//                   position: 'absolute', right: 0, top: 42, zIndex: 50,
//                   background: 'var(--surface)', border: '1px solid var(--border)',
//                   borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
//                   minWidth: 190, overflow: 'hidden',
//                 }}>
//                   {unread.length > 0 && (
//                     <button onClick={markAllRead} style={{
//                       width: '100%', padding: '11px 14px',
//                       background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
//                       display: 'flex', alignItems: 'center', gap: 10,
//                       fontFamily: 'Urbanist, sans-serif', fontSize: 13, fontWeight: 600,
//                       color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
//                     }}>
//                       <CheckCheck size={14} /> Mark all read
//                     </button>
//                   )}
//                   <button onClick={toggleSelectMode} style={{
//                     width: '100%', padding: '11px 14px',
//                     background: 'none', border: 'none',
//                     display: 'flex', alignItems: 'center', gap: 10,
//                     fontFamily: 'Urbanist, sans-serif', fontSize: 13, fontWeight: 600,
//                     color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
//                   }}>
//                     <Trash2 size={14} /> {selectMode ? 'Cancel select' : 'Select to delete'}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {loading ? (
//             <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
//               {[1, 2, 3, 4].map(i => (
//                 <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
//               ))}
//             </div>
//           ) : notifications.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//               <Bell size={44} strokeWidth={1.2} color="var(--text-muted)"
//                 style={{ marginBottom: 14, opacity: 0.4 }} />
//               <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No notifications yet</div>
//               <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
//                 Mentor sign-offs, project updates, and requests show up here.
//               </p>
//             </div>
//           ) : (
//             <div style={{
//               border: '1px solid var(--border)',
//               borderRadius: 16, overflow: 'hidden',
//               margin: '0 16px',
//               background: 'var(--surface)',
//             }}>
//               {Object.entries(groups).map(([label, items]) => {
//                 if (!items.length) return null
//                 return (
//                   <div key={label}>
//                     <div style={{
//                       padding: '10px 16px 6px',
//                       fontSize: 11, fontWeight: 700,
//                       color: 'var(--text-muted)',
//                       textTransform: 'uppercase', letterSpacing: '0.8px',
//                       borderBottom: '1px solid var(--border)',
//                       background: 'var(--surface-2)',
//                     }}>
//                       {label}
//                     </div>
//                     {items.map((n, idx) => {
//                       const isOpen = active?.id === n.id
//                       return (
//                         <div key={n.id} style={{
//                           borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
//                         }}>
//                           <NotifRow
//                             n={n}
//                             isActive={isOpen}
//                             isSelected={selected.includes(n.id)}
//                             selectMode={selectMode}
//                             onSelect={() => toggleCheck(n.id)}
//                             onClick={() => {
//                               if (selectMode) { toggleCheck(n.id); return }
//                               handleSelect(isOpen ? null : n)
//                             }}
//                           />
//                           {isOpen && (
//                             <div style={{
//                               borderTop: '1px solid var(--border)',
//                               background: 'var(--surface-2)',
//                               animation: 'fadeIn 0.15s ease',
//                             }}>
//                               <DetailPanel
//                                 notification={n}
//                                 isMobile={true}
//                                 onRespond={() => handleRespond(n.id)}
//                               />
//                             </div>
//                           )}
//                         </div>
//                       )
//                     })}
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           {selectMode && selected.length > 0 && (
//             <div style={{
//               position: 'fixed', bottom: 90, left: 16, right: 16,
//               background: 'var(--surface)', border: '1px solid var(--border)',
//               borderRadius: 14, padding: '12px 16px',
//               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//               boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 40,
//             }}>
//               <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
//                 {selected.length} selected
//               </span>
//               <button
//                 onClick={handleDeleteSelected}
//                 disabled={deleting}
//                 style={{
//                   padding: '8px 18px', borderRadius: 8,
//                   background: 'var(--danger)', color: '#fff',
//                   border: 'none', fontFamily: 'Urbanist, sans-serif',
//                   fontSize: 13, fontWeight: 700, cursor: 'pointer',
//                   display: 'inline-flex', alignItems: 'center', gap: 6,
//                 }}
//               >
//                 <Trash2 size={13} />
//                 {deleting ? 'Deleting...' : 'Delete'}
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import { notificationsApi, mentorApi } from '../lib/api'
import {
  PenLine, ClipboardList, UserPlus, CheckCircle,
  Bell, Trash2, XCircle, MoreHorizontal, CheckCheck,
  ChevronRight, AlertTriangle, Calendar, CheckSquare, Square,
  ChevronLeft, Search
} from 'lucide-react'

// ── Config ─────────────────────────────────────────────────────
const typeConfig = {
  log_signed:       { icon: PenLine,       color: 'var(--success)', bg: 'var(--success-soft)' },
  project_assigned: { icon: ClipboardList, color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
  mentor_request:   { icon: UserPlus,      color: 'var(--warning)', bg: 'var(--warning-soft)' },
  test_passed:      { icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-soft)' },
  weekly_focus:     { icon: Calendar,      color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
  stuck_flag:       { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-soft)' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function groupByTime(notifications) {
  const now = Date.now()
  const DAY = 86400000
  const WEEK = DAY * 7
  const groups = { Today: [], 'This Week': [], Earlier: [] }
  notifications.forEach(n => {
    const age = now - new Date(n.created_at).getTime()
    if (age < DAY) groups['Today'].push(n)
    else if (age < WEEK) groups['This Week'].push(n)
    else groups['Earlier'].push(n)
  })
  return groups
}

// ── Weekly focus tasks panel ────────────────────────────────────
function WeeklyFocusTasks({ focusId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [focus, setFocus] = useState(null)

  useEffect(() => {
    if (!focusId) return
    async function fetchTasks() {
      try {
        const res = await fetch(`/projects/weekly-focus/my-tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        if (data.focus?.id === focusId) {
          setFocus(data.focus)
          setTasks(data.tasks || [])
        } else {
          const histRes = await fetch(`/projects/weekly-focus/history`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          const histData = await histRes.json()
          const match = (histData.history || []).find(f => f.id === focusId)
          if (match) setFocus(match)
        }
      } catch (e) {
        console.error('[WeeklyFocusTasks]', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [focusId])

  if (loading) {
    return (
      <div style={{ marginTop: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  if (!focus && !tasks.length) return null

  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  const barColor = rate >= 80 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
        textTransform: 'uppercase', color: 'var(--accent)',
        marginBottom: 12,
      }}>
        Weekly Tasks
      </div>

      {focus?.summary && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px',
          fontSize: 13, color: 'var(--text-secondary)',
          lineHeight: 1.6, marginBottom: 14,
        }}>
          {focus.edited_summary || focus.summary}
        </div>
      )}

      {total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
            marginBottom: 6,
          }}>
            <span>{completed}/{total} completed</span>
            <span style={{ color: barColor, fontWeight: 700 }}>{rate}%</span>
          </div>
          <div style={{
            height: 6, background: 'var(--border)',
            borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${rate}%`,
              background: barColor, borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {tasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: task.completed ? 'var(--success-soft)' : 'var(--surface-2)',
              border: `1px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
              opacity: task.completed ? 0.75 : 1,
              transition: 'all 0.15s',
            }}>
              {task.completed
                ? <CheckSquare size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                : <Square size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: task.completed ? 500 : 600,
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  marginBottom: task.description ? 2 : 0,
                }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {task.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                {task.category && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    padding: '2px 7px', borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}>
                    {task.category}
                  </span>
                )}
                {task.carried_over && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: 'var(--warning)',
                    whiteSpace: 'nowrap',
                  }}>
                    ↩ carried over
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Tasks not available for past weeks.
        </div>
      )}
    </div>
  )
}

// ── Mentor request actions ──────────────────────────────────────
function MentorRequestActions({ relationshipId, onRespond }) {
  const [loading, setLoading] = useState(null)
  const [done, setDone] = useState(null)

  async function respond(action) {
    setLoading(action)
    try {
      await mentorApi.respond({ relationship_id: relationshipId, action })
      setDone(action)
      onRespond(action)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 10, marginTop: 16,
        background: done === 'accept' ? 'var(--success-soft)' : 'var(--danger-soft)',
        color: done === 'accept' ? 'var(--success)' : 'var(--danger)',
        fontSize: 13, fontWeight: 600,
      }}>
        {done === 'accept'
          ? <><CheckCircle size={14} /> Accepted — you are now their mentor</>
          : <><XCircle size={14} /> Request declined</>
        }
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
      <button
        onClick={() => respond('accept')}
        disabled={!!loading}
        style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: 'var(--success)', color: '#fff',
          fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', gap: 7,
        }}
      >
        <CheckCircle size={15} />
        {loading === 'accept' ? 'Accepting...' : 'Accept Request'}
      </button>
      <button
        onClick={() => respond('decline')}
        disabled={!!loading}
        style={{
          padding: '10px 24px', borderRadius: 10,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)', color: 'var(--danger)',
          fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', gap: 7,
        }}
      >
        <XCircle size={15} />
        {loading === 'decline' ? 'Declining...' : 'Decline'}
      </button>
    </div>
  )
}

// ── Detail panel ────────────────────────────────────────────────
function DetailPanel({ notification, onRespond, onClose, isMobile }) {
  if (!notification) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, color: 'var(--text-muted)',
      }}>
        <Bell size={44} strokeWidth={1.2} style={{ marginBottom: 14, opacity: 0.4 }} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
          Nothing selected
        </div>
        <div style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.6, maxWidth: 220 }}>
          Pick a notification from the list to read it here.
        </div>
      </div>
    )
  }

  const cfg = typeConfig[notification.type] || typeConfig.log_signed
  const IconComponent = cfg.icon
  const hasAction = notification.type === 'mentor_request' && notification.metadata?.action_required
  const focusId = notification.metadata?.focus_id

  return (
    <div style={{
      flex: 1,
      padding: isMobile ? '20px 16px' : '32px 28px',
      overflowY: 'auto',
      animation: 'fadeIn 0.15s ease',
    }}>
      {isMobile && (
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            cursor: 'pointer', padding: 0, marginBottom: 20, fontFamily: 'Urbanist, sans-serif',
          }}
        >
          <ChevronLeft size={16} /> Back to inbox
        </button>
      )}

      {hasAction && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--warning-soft)',
          border: '1px solid var(--warning)',
          borderRadius: 10, padding: '10px 14px',
          marginBottom: 20,
          color: 'var(--warning)', fontSize: 13, fontWeight: 700,
        }}>
          <AlertTriangle size={15} />
          Action required — respond below
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: cfg.bg,
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, flexShrink: 0,
        }}>
          <IconComponent size={20} strokeWidth={1.8} />
        </div>
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>
            {notification.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {formatLong(notification.created_at)}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

      <p style={{
        fontSize: 14, lineHeight: 1.8,
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap', margin: 0,
      }}>
        {notification.message}
      </p>

      {focusId && <WeeklyFocusTasks focusId={focusId} />}

      {hasAction && (
        <MentorRequestActions
          relationshipId={notification.metadata.relationship_id}
          onRespond={onRespond}
        />
      )}
    </div>
  )
}

// ── Notification row ────────────────────────────────────────────
function NotifRow({ n, isActive, selectMode, onSelect, onClick }) {
  const cfg = typeConfig[n.type] || typeConfig.log_signed
  const IconComponent = cfg.icon
  const hasAction = n.type === 'mentor_request' && n.metadata?.action_required

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', cursor: 'pointer',
        background: isActive
          ? 'var(--surface-2)'
          : n.read ? 'transparent' : 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.12s',
        position: 'relative',
      }}
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={n.selected || false}
          onChange={e => { e.stopPropagation(); onSelect() }}
          onClick={e => e.stopPropagation()}
          style={{
            width: 15, height: 15,
            accentColor: 'var(--accent)',
            flexShrink: 0, cursor: 'pointer',
          }}
        />
      )}

      {/* Unread dot */}
      {!n.read && !selectMode && (
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)', flexShrink: 0,
          position: 'absolute', left: 6,
        }} />
      )}

      {/* Icon box */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: hasAction ? 'var(--warning-soft)' : cfg.bg,
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hasAction ? 'var(--warning)' : cfg.color,
        flexShrink: 0, marginLeft: !n.read && !selectMode ? 8 : 0,
      }}>
        <IconComponent size={16} strokeWidth={1.8} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: n.read ? 500 : 700,
          fontSize: 13,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: 'var(--text-primary)',
        }}>
          {n.title}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {n.message}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: 4, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {timeAgo(n.created_at)}
        </span>
        <ChevronRight size={12} color="var(--text-muted)" style={{ opacity: isActive ? 1 : 0.5 }} />
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────
export default function Notifications({ onCountChange }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [active, setActive] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function load() {
    try {
      const res = await notificationsApi.list()
      const notifs = (res.notifications || []).map(n => ({ ...n, selected: false }))
      setNotifications(notifs)
      onCountChange?.(notifs.filter(n => !n.read).length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSelect(n) {
    setActive(n)
    if (!n.read) {
      await notificationsApi.markRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      onCountChange?.(notifications.filter(x => !x.read && x.id !== n.id).length)
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onCountChange?.(0)
    setMenuOpen(false)
  }

  function toggleSelectMode() {
    setSelectMode(s => !s)
    setSelected([])
    setMenuOpen(false)
  }

  function toggleCheck(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, selected: !n.selected } : n
    ))
  }

  async function handleDeleteSelected() {
    if (!selected.length) return
    if (!window.confirm(`Delete ${selected.length} notification(s)?`)) return
    setDeleting(true)
    try {
      await Promise.all(selected.map(id => notificationsApi.markRead(id)))
      const next = notifications.filter(n => !selected.includes(n.id))
      setNotifications(next)
      onCountChange?.(next.filter(n => !n.read).length)
      setSelected([])
      if (active && selected.includes(active.id)) setActive(null)
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  function handleRespond(notifId, action) {
    setNotifications(prev => prev.map(x =>
      x.id === notifId
        ? { ...x, read: true, metadata: { ...x.metadata, action_required: false } }
        : x
    ))
    onCountChange?.(notifications.filter(x => !x.read && x.id !== notifId).length)
    if (active?.id === notifId) {
      setActive(prev => ({
        ...prev,
        read: true,
        metadata: { ...prev.metadata, action_required: false },
      }))
    }
  }

  const unread = notifications.filter(n => !n.read)
  const groups = groupByTime(notifications)
  const allSelected = notifications.length > 0 && selected.length === notifications.length

  const listContent = (
    <div style={{
      width: isDesktop ? 380 : '100%',
      flexShrink: 0,
      borderRight: isDesktop ? '1px solid var(--border)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      height: isDesktop ? 'calc(100vh - 120px)' : 'auto',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '20px 16px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Notifications</span>
          {unread.length > 0 && (
            <span style={{
              padding: '2px 8px', borderRadius: 20,
              background: 'var(--accent)', color: '#fff',
              fontSize: 11, fontWeight: 700,
            }}>
              {unread.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selectMode && selected.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              style={{
                padding: '6px 12px', borderRadius: 8,
                background: 'var(--danger)', color: '#fff',
                border: 'none', fontFamily: 'Urbanist, sans-serif',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Trash2 size={12} />
              {deleting ? '...' : `Delete (${selected.length})`}
            </button>
          )}

          {selectMode && (
            <button
              onClick={toggleSelectMode}
              style={{
                padding: '6px 10px', borderRadius: 8,
                background: 'var(--surface-2)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontFamily: 'Urbanist, sans-serif',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}

          {!selectMode && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: menuOpen ? 'var(--surface-2)' : 'transparent',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 38, zIndex: 50,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 180, overflow: 'hidden',
                  animation: 'fadeIn 0.1s ease',
                }}>
                  {[
                    unread.length > 0 && {
                      label: 'Mark all read',
                      icon: <CheckCheck size={14} />,
                      action: markAllRead,
                    },
                    notifications.length > 0 && {
                      label: selectMode ? 'Cancel select' : 'Select notifications',
                      icon: <Trash2 size={14} />,
                      action: toggleSelectMode,
                    },
                    selectMode && allSelected && {
                      label: 'Deselect all',
                      icon: <Trash2 size={14} />,
                      action: () => setSelected([]),
                    },
                    selectMode && !allSelected && notifications.length > 0 && {
                      label: 'Select all',
                      icon: <CheckCheck size={14} />,
                      action: () => setSelected(notifications.map(n => n.id)),
                    },
                  ].filter(Boolean).map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      style={{
                        width: '100%', padding: '11px 14px',
                        background: 'none', border: 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontFamily: 'Urbanist, sans-serif',
                        fontSize: 13, fontWeight: 600,
                        color: 'var(--text-secondary)', cursor: 'pointer',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bell size={40} strokeWidth={1.2} color="var(--text-muted)"
              style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              No notifications yet
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
              Mentor sign-offs, project updates, and requests show up here.
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([label, items]) => {
            if (!items.length) return null
            return (
              <div key={label}>
                <div style={{
                  padding: '10px 16px 6px',
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  background: 'var(--surface-2)',
                }}>
                  {label}
                </div>
                {items.map((n, idx) => (
                  <NotifRow
                    key={n.id}
                    n={n}
                    isActive={active?.id === n.id}
                    selectMode={selectMode}
                    onSelect={() => toggleCheck(n.id)}
                    onClick={() => {
                      if (selectMode) { toggleCheck(n.id); return }
                      if (active?.id === n.id && isDesktop) return // Keep open on desktop
                      handleSelect(n)
                    }}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <div className="page" style={{ padding: 0 }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

      {isDesktop ? (
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 120px)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          borderRadius: 16,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {listContent}
          <DetailPanel
            notification={active}
            isMobile={false}
            onRespond={(action) => active && handleRespond(active.id, action)}
          />
        </div>
      ) : (
        /* Mobile Layout */
        <div style={{ padding: '0 0 80px' }}>
          <div style={{
            padding: '20px 16px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 10,
            marginBottom: 4,
          }}>
            <div>
              <h1 style={{ marginBottom: 2, fontSize: 22 }}>Notifications</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
              </p>
            </div>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 42, zIndex: 50,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 190, overflow: 'hidden',
                }}>
                  {unread.length > 0 && (
                    <button onClick={markAllRead} style={{
                      width: '100%', padding: '11px 14px',
                      background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontFamily: 'Urbanist, sans-serif', fontSize: 13, fontWeight: 600,
                      color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
                    }}>
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                  <button onClick={toggleSelectMode} style={{
                    width: '100%', padding: '11px 14px',
                    background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'Urbanist, sans-serif', fontSize: 13, fontWeight: 600,
                    color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <Trash2 size={14} /> {selectMode ? 'Cancel select' : 'Select to delete'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Bell size={44} strokeWidth={1.2} color="var(--text-muted)"
                style={{ marginBottom: 14, opacity: 0.4 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No notifications yet</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                Mentor sign-offs, project updates, and requests show up here.
              </p>
            </div>
          ) : active ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', margin: '0 16px', background: 'var(--surface)' }}>
              <DetailPanel
                notification={active}
                isMobile={true}
                onClose={() => setActive(null)}
                onRespond={(action) => handleRespond(active.id, action)}
              />
            </div>
          ) : (
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
              margin: '0 16px',
              background: 'var(--surface)',
            }}>
              {Object.entries(groups).map(([label, items]) => {
                if (!items.length) return null
                return (
                  <div key={label}>
                    <div style={{
                      padding: '10px 16px 6px',
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                      background: 'var(--surface-2)',
                    }}>
                      {label}
                    </div>
                    {items.map((n, idx) => (
                      <NotifRow
                        key={n.id}
                        n={n}
                        isActive={false}
                        selectMode={selectMode}
                        onSelect={() => toggleCheck(n.id)}
                        onClick={() => {
                          if (selectMode) { toggleCheck(n.id); return }
                          handleSelect(n)
                        }}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {selectMode && selected.length > 0 && (
            <div style={{
              position: 'fixed', bottom: 90, left: 16, right: 16,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 40,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {selected.length} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  background: 'var(--danger)', color: '#fff',
                  border: 'none', fontFamily: 'Urbanist, sans-serif',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}