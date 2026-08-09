// import { useEffect, useState } from 'react'
// import { notificationsApi, mentorApi } from '../lib/api'

// const typeConfig = {
//   log_signed:       { emoji: '✍️', color: 'var(--success)', bg: 'var(--success-soft)' },
//   project_assigned: { emoji: '📋', color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
//   mentor_request:   { emoji: '👋', color: 'var(--warning)', bg: 'var(--warning-soft)' },
//   test_passed:      { emoji: '✅', color: 'var(--success)', bg: 'var(--success-soft)' },
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
//         padding: '8px 14px', borderRadius: 8, marginTop: 10,
//         background: done === 'accept' ? 'var(--success-soft)' : 'var(--danger-soft)',
//         color: done === 'accept' ? 'var(--success)' : 'var(--danger)',
//         fontSize: 13, fontWeight: 600,
//       }}>
//         {done === 'accept' ? '✅ Accepted — you are now their mentor' : '❌ Request declined'}
//       </div>
//     )
//   }

//   return (
//     <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
//       <button
//         onClick={() => respond('accept')}
//         disabled={!!loading}
//         style={{
//           padding: '9px 22px', borderRadius: 8, border: 'none',
//           background: 'var(--success)', color: '#fff',
//           fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 13,
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
//         }}
//       >
//         {loading === 'accept' ? 'Accepting...' : '✅ Accept Request'}
//       </button>
//       <button
//         onClick={() => respond('decline')}
//         disabled={!!loading}
//         style={{
//           padding: '9px 22px', borderRadius: 8,
//           border: '1.5px solid var(--border)',
//           background: 'var(--surface)', color: 'var(--danger)',
//           fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 13,
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
//         }}
//       >
//         {loading === 'decline' ? 'Declining...' : '❌ Decline'}
//       </button>
//     </div>
//   )
// }

// export default function Notifications({ onCountChange }) {
//   const [notifications, setNotifications] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selected, setSelected] = useState([])
//   const [deleting, setDeleting] = useState(false)
//   const [expanded, setExpanded] = useState(null)

//   async function load() {
//     try {
//       const res = await notificationsApi.list()
//       setNotifications(res.notifications || [])
//       const unread = (res.notifications || []).filter(n => !n.read).length
//       onCountChange?.(unread)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [])

//   async function handleExpand(n) {
//     setExpanded(prev => prev === n.id ? null : n.id)
//     if (!n.read) {
//       await notificationsApi.markRead(n.id)
//       setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
//       const unread = notifications.filter(x => !x.read && x.id !== n.id).length
//       onCountChange?.(unread)
//     }
//   }

//   async function markAllRead() {
//     await notificationsApi.markAllRead()
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })))
//     onCountChange?.(0)
//   }

//   function toggleSelect(id, e) {
//     e.stopPropagation()
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
//       setNotifications(prev => prev.filter(n => !selected.includes(n.id)))
//       const remaining = notifications.filter(n => !selected.includes(n.id) && !n.read).length
//       onCountChange?.(remaining)
//       setSelected([])
//     } catch {
//       alert('Failed to delete')
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const unread = notifications.filter(n => !n.read)
//   const allSelected = notifications.length > 0 && selected.length === notifications.length

//   return (
//     <div className="page">
//       <style>{`
//         @media (max-width: 640px) {
//           .notif-header { flex-direction: column; align-items: flex-start !important; }
//           .notif-actions { width: 100%; justify-content: flex-start; }
//           .notif-expanded { padding: 14px 14px 14px 14px !important; }
//         }
//       `}</style>

//       {/* Header */}
//       <div className="notif-header" style={{
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 24, gap: 12, flexWrap: 'wrap',
//       }}>
//         <div>
//           <h1 style={{ marginBottom: 4 }}>Notifications</h1>
//           <p className="text-muted" style={{ fontSize: 14 }}>
//             {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
//           </p>
//         </div>

//         <div className="notif-actions" style={{
//           display: 'flex', gap: 8,
//           alignItems: 'center', flexWrap: 'wrap',
//         }}>
//           {unread.length > 0 && (
//             <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
//               Mark all read
//             </button>
//           )}
//           {notifications.length > 0 && (
//             <button
//               className="btn btn-secondary btn-sm"
//               onClick={() => setSelected(allSelected ? [] : notifications.map(n => n.id))}
//             >
//               {allSelected ? 'Deselect All' : 'Select All'}
//             </button>
//           )}
//           {selected.length > 0 && (
//             <button
//               className="btn btn-sm"
//               onClick={handleDeleteSelected}
//               disabled={deleting}
//               style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
//             >
//               {deleting ? 'Deleting...' : `🗑 Delete (${selected.length})`}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Loading */}
//       {loading ? (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//           {[1, 2, 3, 4].map(i => (
//             <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />
//           ))}
//         </div>

//       /* Empty */
//       ) : notifications.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//           <div style={{ fontSize: 52, marginBottom: 16 }}>🔔</div>
//           <h3 style={{ marginBottom: 8 }}>No notifications yet</h3>
//           <p className="text-muted" style={{ fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
//             When your mentor signs a log, assigns a project, or accepts a request, it shows up here.
//           </p>
//         </div>

//       /* List */
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {notifications.map(n => {
//             const cfg = typeConfig[n.type] || typeConfig.log_signed
//             const isExpanded = expanded === n.id
//             const isSelected = selected.includes(n.id)
//             const hasAction = n.type === 'mentor_request' && n.metadata?.action_required

//             return (
//               <div
//                 key={n.id}
//                 style={{
//                   background: n.read ? 'var(--surface)' : 'var(--accent-soft)',
//                   border: `1.5px solid ${
//                     isSelected ? 'var(--accent)'
//                     : hasAction ? 'var(--warning)'
//                     : n.read ? 'var(--border)'
//                     : 'var(--border-strong)'
//                   }`,
//                   borderRadius: 12,
//                   overflow: 'hidden',
//                   transition: 'all 0.18s',
//                 }}
//               >
//                 {/* Action required badge */}
//                 {hasAction && !isExpanded && (
//                   <div style={{
//                     background: 'var(--warning)', color: '#fff',
//                     fontSize: 11, fontWeight: 700, padding: '4px 14px',
//                     letterSpacing: '0.5px',
//                   }}>
//                     ACTION REQUIRED — Tap to accept or decline
//                   </div>
//                 )}

//                 {/* Row */}
//                 <div
//                   onClick={() => handleExpand(n)}
//                   style={{
//                     display: 'flex', alignItems: 'center',
//                     gap: 12, padding: '14px 16px', cursor: 'pointer',
//                   }}
//                 >
//                   {/* Checkbox */}
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={e => toggleSelect(n.id, e)}
//                     onClick={e => e.stopPropagation()}
//                     style={{
//                       width: 15, height: 15,
//                       accentColor: 'var(--accent)',
//                       flexShrink: 0, cursor: 'pointer',
//                     }}
//                   />

//                   {/* Icon */}
//                   <div style={{
//                     width: 38, height: 38, borderRadius: 10,
//                     background: cfg.bg, flexShrink: 0,
//                     display: 'flex', alignItems: 'center',
//                     justifyContent: 'center', fontSize: 17,
//                   }}>
//                     {cfg.emoji}
//                   </div>

//                   {/* Content */}
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{
//                       fontWeight: n.read ? 500 : 700,
//                       fontSize: 14, marginBottom: 2,
//                       overflow: 'hidden', textOverflow: 'ellipsis',
//                       whiteSpace: 'nowrap',
//                     }}>
//                       {n.title}
//                     </div>
//                     <div style={{
//                       fontSize: 12, color: 'var(--text-muted)',
//                       overflow: 'hidden', textOverflow: 'ellipsis',
//                       whiteSpace: 'nowrap',
//                     }}>
//                       {n.message}
//                     </div>
//                   </div>

//                   {/* Right */}
//                   <div style={{
//                     display: 'flex', alignItems: 'center',
//                     gap: 8, flexShrink: 0,
//                   }}>
//                     <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
//                       {timeAgo(n.created_at)}
//                     </span>
//                     {!n.read && (
//                       <div style={{
//                         width: 8, height: 8,
//                         background: 'var(--accent)',
//                         borderRadius: '50%', flexShrink: 0,
//                       }} />
//                     )}
//                     <span style={{
//                       color: 'var(--text-muted)', fontSize: 10,
//                       transform: isExpanded ? 'rotate(180deg)' : 'none',
//                       transition: 'transform 0.18s',
//                       display: 'inline-block',
//                     }}>▼</span>
//                   </div>
//                 </div>

//                 {/* Expanded */}
//                 {isExpanded && (
//                   <div
//                     className="notif-expanded"
//                     style={{
//                       borderTop: '1px solid var(--border)',
//                       padding: '16px 16px 18px 70px',
//                       background: 'var(--surface-2)',
//                       animation: 'fadeIn 0.15s ease',
//                     }}
//                   >
//                     <p style={{
//                       fontSize: 14, lineHeight: 1.7,
//                       color: 'var(--text-secondary)',
//                       whiteSpace: 'pre-wrap', margin: 0,
//                     }}>
//                       {n.message}
//                     </p>

//                     {/* Accept/Decline for mentor requests */}
//                     {hasAction && (
//                       <MentorRequestActions
//                         relationshipId={n.metadata.relationship_id}
//                         onRespond={() => {
//                           setNotifications(prev => prev.map(x =>
//                             x.id === n.id
//                               ? {
//                                   ...x,
//                                   read: true,
//                                   metadata: { ...x.metadata, action_required: false }
//                                 }
//                               : x
//                           ))
//                           onCountChange?.(
//                             notifications.filter(x => !x.read && x.id !== n.id).length
//                           )
//                         }}
//                       />
//                     )}

//                     <div style={{
//                       marginTop: 12, fontSize: 11,
//                       color: 'var(--text-muted)',
//                     }}>
//                       {new Date(n.created_at).toLocaleDateString('en-US', {
//                         weekday: 'long', month: 'long', day: 'numeric',
//                         hour: '2-digit', minute: '2-digit',
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { notificationsApi, mentorApi } from '../lib/api'
import {
  PenLine, ClipboardList, UserPlus, CheckCircle,
  Bell, ChevronDown, Trash2, XCircle
} from 'lucide-react'

const typeConfig = {
  log_signed:       { icon: PenLine,       color: 'var(--success)', bg: 'var(--success-soft)' },
  project_assigned: { icon: ClipboardList, color: 'var(--accent)',  bg: 'var(--accent-soft)'  },
  mentor_request:   { icon: UserPlus,      color: 'var(--warning)', bg: 'var(--warning-soft)' },
  test_passed:      { icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-soft)' },
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
        padding: '8px 14px', borderRadius: 8, marginTop: 10,
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
    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
      <button
        onClick={() => respond('accept')}
        disabled={!!loading}
        style={{
          padding: '9px 22px', borderRadius: 8, border: 'none',
          background: 'var(--success)', color: '#fff',
          fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 13,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <CheckCircle size={14} />
        {loading === 'accept' ? 'Accepting...' : 'Accept Request'}
      </button>
      <button
        onClick={() => respond('decline')}
        disabled={!!loading}
        style={{
          padding: '9px 22px', borderRadius: 8,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)', color: 'var(--danger)',
          fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 13,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <XCircle size={14} />
        {loading === 'decline' ? 'Declining...' : 'Decline'}
      </button>
    </div>
  )
}

export default function Notifications({ onCountChange }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(null)

  async function load() {
    try {
      const res = await notificationsApi.list()
      setNotifications(res.notifications || [])
      const unread = (res.notifications || []).filter(n => !n.read).length
      onCountChange?.(unread)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleExpand(n) {
    setExpanded(prev => prev === n.id ? null : n.id)
    if (!n.read) {
      await notificationsApi.markRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      const unread = notifications.filter(x => !x.read && x.id !== n.id).length
      onCountChange?.(unread)
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onCountChange?.(0)
  }

  function toggleSelect(id, e) {
    e.stopPropagation()
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleDeleteSelected() {
    if (!selected.length) return
    if (!window.confirm(`Delete ${selected.length} notification(s)?`)) return
    setDeleting(true)
    try {
      await Promise.all(selected.map(id => notificationsApi.markRead(id)))
      setNotifications(prev => prev.filter(n => !selected.includes(n.id)))
      const remaining = notifications.filter(n => !selected.includes(n.id) && !n.read).length
      onCountChange?.(remaining)
      setSelected([])
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const unread = notifications.filter(n => !n.read)
  const allSelected = notifications.length > 0 && selected.length === notifications.length

  return (
    <div className="page">
      <style>{`
        @media (max-width: 640px) {
          .notif-header { flex-direction: column; align-items: flex-start !important; }
          .notif-actions { width: 100%; justify-content: flex-start; }
          .notif-expanded { padding: 14px 14px 14px 14px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="notif-header" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24, gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Notifications</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>
            {unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
          </p>
        </div>

        <div className="notif-actions" style={{
          display: 'flex', gap: 8,
          alignItems: 'center', flexWrap: 'wrap',
        }}>
          {unread.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelected(allSelected ? [] : notifications.map(n => n.id))}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selected.length > 0 && (
            <button
              className="btn btn-sm"
              onClick={handleDeleteSelected}
              disabled={deleting}
              style={{
                background: 'var(--danger)', color: '#fff', border: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Trash2 size={13} />
              {deleting ? 'Deleting...' : `Delete (${selected.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />
          ))}
        </div>

      /* Empty */
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Bell size={52} strokeWidth={1.2} color="var(--text-muted)" />
          </div>
          <h3 style={{ marginBottom: 8 }}>No notifications yet</h3>
          <p className="text-muted" style={{ fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
            When your mentor signs a log, assigns a project, or accepts a request, it shows up here.
          </p>
        </div>

      /* List */
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.log_signed
            const IconComponent = cfg.icon
            const isExpanded = expanded === n.id
            const isSelected = selected.includes(n.id)
            const hasAction = n.type === 'mentor_request' && n.metadata?.action_required

            return (
              <div
                key={n.id}
                style={{
                  background: n.read ? 'var(--surface)' : 'var(--accent-soft)',
                  border: `1.5px solid ${
                    isSelected ? 'var(--accent)'
                    : hasAction ? 'var(--warning)'
                    : n.read ? 'var(--border)'
                    : 'var(--border-strong)'
                  }`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'all 0.18s',
                }}
              >
                {/* Action required badge */}
                {hasAction && !isExpanded && (
                  <div style={{
                    background: 'var(--warning)', color: '#fff',
                    fontSize: 11, fontWeight: 700, padding: '4px 14px',
                    letterSpacing: '0.5px',
                  }}>
                    ACTION REQUIRED — Tap to accept or decline
                  </div>
                )}

                {/* Row */}
                <div
                  onClick={() => handleExpand(n)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 12, padding: '14px 16px', cursor: 'pointer',
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => toggleSelect(n.id, e)}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: 15, height: 15,
                      accentColor: 'var(--accent)',
                      flexShrink: 0, cursor: 'pointer',
                    }}
                  />

                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: cfg.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: cfg.color,
                  }}>
                    <IconComponent size={17} strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: n.read ? 500 : 700,
                      fontSize: 14, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {n.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {n.message}
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.read && (
                      <div style={{
                        width: 8, height: 8,
                        background: 'var(--accent)',
                        borderRadius: '50%', flexShrink: 0,
                      }} />
                    )}
                    <ChevronDown
                      size={12}
                      color="var(--text-muted)"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.18s',
                      }}
                    />
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div
                    className="notif-expanded"
                    style={{
                      borderTop: '1px solid var(--border)',
                      padding: '16px 16px 18px 70px',
                      background: 'var(--surface-2)',
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    <p style={{
                      fontSize: 14, lineHeight: 1.7,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap', margin: 0,
                    }}>
                      {n.message}
                    </p>

                    {hasAction && (
                      <MentorRequestActions
                        relationshipId={n.metadata.relationship_id}
                        onRespond={() => {
                          setNotifications(prev => prev.map(x =>
                            x.id === n.id
                              ? { ...x, read: true, metadata: { ...x.metadata, action_required: false } }
                              : x
                          ))
                          onCountChange?.(
                            notifications.filter(x => !x.read && x.id !== n.id).length
                          )
                        }}
                      />
                    )}

                    <div style={{
                      marginTop: 12, fontSize: 11,
                      color: 'var(--text-muted)',
                    }}>
                      {new Date(n.created_at).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}